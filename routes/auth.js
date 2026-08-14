const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/security');

// 1. Vatandaş Kayıt Ol (Register)
router.post(
  '/register',
  [
    body('full_name').notEmpty().withMessage('Ad soyad zorunludur.').trim(),
    body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.').trim(),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.'),
    body('phone').notEmpty().withMessage('Telefon numarası zorunludur.').trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { full_name, email, password, phone, identity_number, address } = req.body;
    const cleanEmail = String(email).trim().toLowerCase();

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [existingUsers] = await conn.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (existingUsers && existingUsers.length > 0) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Bu e-posta adresi ile zaten kayıtlı bir hesap var.' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const [userResult] = await conn.query(
        `INSERT INTO users (role_id, full_name, email, phone, password_hash, is_active)
         VALUES (4, ?, ?, ?, ?, 1)`,
        [full_name, cleanEmail, phone, password_hash]
      );

      const userId = userResult ? (userResult.insertId || userResult[0]?.insertId || Date.now()) : Date.now();

      const [citizenResult] = await conn.query(
        `INSERT INTO citizens (user_id, identity_number, address)
         VALUES (?, ?, ?)`,
        [userId, identity_number || null, address || null]
      );

      const citizenId = citizenResult ? (citizenResult.insertId || citizenResult[0]?.insertId || userId) : userId;

      await conn.commit();

      const token = jwt.sign(
        {
          id: userId,
          email: cleanEmail,
          role_id: 4,
          role_name: 'Vatandaş',
          citizen_id: citizenId,
          full_name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Kayıt başarıyla oluşturuldu.',
        token,
        user: {
          id: userId,
          full_name,
          email: cleanEmail,
          phone,
          role_id: 4,
          role_name: 'Vatandaş',
          citizen_id: citizenId
        }
      });
    } catch (err) {
      await conn.rollback();
      console.error('Kayıt hatası:', err);
      res.status(500).json({ success: false, message: 'Kayıt işlemi sırasında hata meydana geldi.' });
    } finally {
      conn.release();
    }
  }
);

// 2. Kullanıcı Giriş Yap (Login)
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Lütfen e-posta adresi giriniz.').trim(),
    body('password').notEmpty().withMessage('Şifre alanı boş bırakılamaz.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const cleanEmail = String(email).trim().toLowerCase();

    try {
      let [users] = await pool.query(
        `SELECT u.*, r.name as role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.email = ?`,
        [cleanEmail]
      );

      if (!users || users.length === 0) {
        const { memData } = require('../config/db');
        if (memData && memData.users) {
          const memUser = memData.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
          if (memUser) {
            users = [memUser];
          }
        }
      }

      if (!users || users.length === 0) {
        return res.status(401).json({ success: false, message: 'E-posta adresi veya şifre hatalı.' });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'Hesabınız pasife alınmıştır. Sisteme giriş yapabilmek için lütfen yönetici ile iletişime geçiniz.' });
      }

      // Password Match Verification via bcrypt
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'E-posta adresi veya şifre hatalı.' });
      }

      let citizen_id = null;
      let employee_id = null;
      let department_id = user.department_id || null;
      let department_name = user.department_name || null;
      let employee_title = user.employee_title || null;

      if (user.role_name === 'Vatandaş' || user.role_id === 4) {
        const [citizens] = await pool.query('SELECT id FROM citizens WHERE user_id = ?', [user.id]);
        if (citizens && citizens.length > 0) {
          citizen_id = citizens[0].id;
        } else {
          citizen_id = user.id;
        }
      } else {
        // Purely Database & In-Memory Dynamic Department / Employee Resolution
        const [employees] = await pool.query(
          `SELECT e.id, e.department_id, e.title as employee_title, d.name as department_name
           FROM employees e
           JOIN departments d ON e.department_id = d.id
           WHERE e.user_id = ?`,
          [user.id]
        );
        if (employees && employees.length > 0) {
          employee_id = employees[0].id;
          department_id = employees[0].department_id;
          department_name = employees[0].department_name;
          if (employees[0].employee_title) {
            employee_title = employees[0].employee_title;
          }
        } else if (department_id) {
          const [depts] = await pool.query('SELECT name FROM departments WHERE id = ?', [department_id]);
          if (depts && depts.length > 0) {
            department_name = depts[0].name;
          }
        }

        // Check in-memory sync if active
        const { memData } = require('../config/db');
        if (memData) {
          const memEmp = (memData.employees || []).find(e => e.user_id == user.id);
          if (memEmp) {
            employee_id = memEmp.id;
            department_id = memEmp.department_id || department_id;
            employee_title = memEmp.title || employee_title;
          }
          if (department_id) {
            const memDept = (memData.departments || []).find(d => d.id == department_id);
            if (memDept) department_name = memDept.name;
          }
        }
      }

      let assigned_department_ids = [];
      if (user.role_id === 6 || user.role_name === 'Belediye Başkan Yardımcısı') {
        const { memData } = require('../config/db');
        if (memData && memData.departments) {
          assigned_department_ids = memData.departments
            .filter(d => Number(d.vice_mayor_user_id) === Number(user.id))
            .map(d => Number(d.id));
        }
        try {
          const [deptRows] = await pool.query('SELECT id FROM departments WHERE vice_mayor_user_id = ?', [user.id]);
          if (deptRows && deptRows.length > 0) {
            assigned_department_ids = [...new Set([...assigned_department_ids, ...deptRows.map(d => Number(d.id))])];
          }
        } catch (e) {}
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role_id: user.role_id,
          role_name: user.role_name,
          citizen_id: citizen_id || user.id,
          employee_id,
          department_id,
          department_name,
          assigned_department_ids,
          full_name: user.full_name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Giriş başarılı.',
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role_id: user.role_id,
          role_name: user.role_name,
          citizen_id: citizen_id || user.id,
          employee_id,
          department_id,
          department_name,
          assigned_department_ids
        }
      });
    } catch (err) {
      console.error('Giriş hatası:', err);
      res.status(500).json({ success: false, message: 'Giriş işlemi sırasında sunucu hatası oluştu.' });
    }
  }
);

// 3. Current User Verification & Session Check Endpoint (GET /api/auth/me)
const { authenticateToken } = require('../middleware/auth');
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [uRows] = await pool.query(
      `SELECT u.id, u.role_id, r.name as role_name, u.full_name, u.email, u.phone, u.is_active,
              e.id as employee_id, e.department_id, d.name as department_name, e.title as employee_title,
              c.id as citizen_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN citizens c ON u.id = c.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (!uRows || uRows.length === 0 || uRows[0].is_active === 0) {
      return res.status(401).json({ success: false, message: 'Geçersiz veya pasif kullanıcı oturumu.' });
    }

    const u = uRows[0];
    res.json({
      success: true,
      user: {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        role_id: u.role_id,
        role_name: u.role_name,
        citizen_id: u.citizen_id || u.id,
        employee_id: u.employee_id || null,
        department_id: u.department_id || null,
        department_name: u.department_name || null,
        employee_title: u.employee_title || null
      }
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// 3. Profil Bilgilerini Güncelle (PUT /api/auth/profile)
router.put('/profile', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Oturum gerekli.' });

  jwt.verify(token, JWT_SECRET, async (err, authUser) => {
    if (err) return res.status(403).json({ success: false, message: 'Geçersiz oturum.' });

    const { full_name, phone, address } = req.body;
    const userId = authUser.id;

    try {
      if (full_name || phone) {
        await pool.query(
          'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
          [full_name || null, phone || null, userId]
        );
      }

      if (address && authUser.role_name === 'Vatandaş') {
        await pool.query(
          'UPDATE citizens SET address = ? WHERE user_id = ?',
          [address, userId]
        );
      }

      const { memData } = require('../config/db');
      const memUser = (memData.users || []).find(u => u.id == userId);
      if (memUser) {
        if (full_name) memUser.full_name = full_name;
        if (phone) memUser.phone = phone;
      }
      if (address) {
        const memCit = (memData.citizens || []).find(c => c.user_id == userId || c.id == userId);
        if (memCit) memCit.address = address;
        if (memUser) memUser.address = address;
      }

      const [updatedRows] = await pool.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?', [userId]);
      const updatedUser = updatedRows && updatedRows.length > 0 ? updatedRows[0] : (memUser || null);

      res.json({
        success: true,
        message: 'Profil bilgileriniz başarıyla güncellendi.',
        user: updatedUser ? {
          id: updatedUser.id,
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role_id: updatedUser.role_id,
          role_name: updatedUser.role_name,
          address: address || updatedUser.address || null
        } : null
      });
    } catch (dbErr) {
      console.error('Profile update error:', dbErr);
      res.status(500).json({ success: false, message: 'Profil güncellenirken hata oluştu.' });
    }
  });
});

// 4. Şifre Değiştir (PUT /api/auth/change-password)
router.put('/change-password', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Oturum gerekli.' });

  jwt.verify(token, JWT_SECRET, async (err, authUser) => {
    if (err) return res.status(403).json({ success: false, message: 'Geçersiz oturum.' });

    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    const userId = authUser.id;

    try {
      const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      }

      const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mevcut şifreniz hatalı.' });
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(new_password, salt);

      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

      res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
    } catch (dbErr) {
      console.error('Password change error:', dbErr);
      res.status(500).json({ success: false, message: 'Şifre değiştirilirken hata oluştu.' });
    }
  });
});

module.exports = router;
