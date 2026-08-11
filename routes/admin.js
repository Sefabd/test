const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { createAuditLog, sanitizeInput } = require('../middleware/security');

// Tüm Yetkiler Admin Korumalı
router.use(authenticateToken, checkRole(['Sistem Yöneticisi']));

// 1. Kullanıcı Listesi
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role_id, r.name as role_name, u.is_active, u.created_at,
              e.title as employee_title, d.name as department_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN departments d ON e.department_id = d.id
       ORDER BY u.created_at DESC`
    );

    res.json({ success: true, users });
  } catch (err) {
    console.error('Kullanıcı listesi hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// 2. Yeni Personel / Yönetici Oluştur
router.post('/users', async (req, res) => {
  const { full_name, email, password, phone, role_id, department_id, title } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const password_hash = await bcrypt.hash(password || '123456', 10);

    const [uResult] = await conn.query(
      `INSERT INTO users (role_id, full_name, email, phone, password_hash, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [role_id, sanitizeInput(full_name), email, sanitizeInput(phone) || null, password_hash]
    );

    const newUserId = uResult ? (uResult.insertId || uResult[0]?.insertId || Date.now()) : Date.now();

    if (role_id == 2 || role_id == 3) {
      // Birim Yöneticisi veya Personel ise employees tablosuna ekle
      await conn.query(
        `INSERT INTO employees (user_id, department_id, title)
         VALUES (?, ?, ?)`,
        [newUserId, department_id || 1, sanitizeInput(title) || (role_id == 2 ? 'Birim Müdürü' : 'Saha Görevlisi')]
      );
    } else if (role_id == 4) {
      // Vatandaş ise
      await conn.query(`INSERT INTO citizens (user_id) VALUES (?)`, [newUserId]);
    }

    // Memory proxy sync
    const { memData } = require('../config/db');
    if (memData && memData.users) {
      const deptObj = (memData.departments || []).find(d => d.id == department_id);
      const roleNameMap = { 1: 'Sistem Yöneticisi', 2: 'Birim Yöneticisi', 3: 'Personel', 4: 'Vatandaş' };
      const role_name = roleNameMap[role_id] || 'Vatandaş';

      const memUser = {
        id: newUserId,
        role_id: Number(role_id),
        role_name,
        full_name,
        email,
        phone,
        password_hash,
        is_active: 1,
        department_id: (role_id == 2 || role_id == 3 || role_id == 1) ? Number(department_id) : null,
        department_name: deptObj ? deptObj.name : null,
        employee_title: title || (role_id == 2 ? 'Birim Müdürü' : 'Saha Görevlisi')
      };
      memData.users.push(memUser);

      if (role_id == 2 || role_id == 3) {
        if (!memData.employees) memData.employees = [];
        memData.employees.push({
          id: memData.employees.length + 1,
          user_id: newUserId,
          department_id: Number(department_id) || 1,
          title: title || (role_id == 2 ? 'Birim Müdürü' : 'Saha Görevlisi')
        });
      } else if (role_id == 4) {
        if (!memData.citizens) memData.citizens = [];
        memData.citizens.push({
          id: memData.citizens.length + 1,
          user_id: newUserId
        });
      }
    }

    await conn.commit();
    await createAuditLog(req.user.id, 'CREATE_USER', 'users', newUserId, null, { full_name, email, role_id }, req.ip);

    res.status(201).json({ success: true, message: 'Yeni kullanıcı başarıyla oluşturuldu.' });
  } catch (err) {
    await conn.rollback();
    console.error('Kullanıcı ekleme hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  } finally {
    conn.release();
  }
});

// 3. Kullanıcı Durumu (Aktif/Pasif) Değiştir
router.put('/users/:id/toggle-active', async (req, res) => {
  const userId = req.params.id;

  try {
    const [uRows] = await pool.query('SELECT is_active FROM users WHERE id = ?', [userId]);
    let currentStatus = 1;
    if (uRows && uRows.length > 0) {
      currentStatus = uRows[0].is_active;
    }

    const newStatus = currentStatus ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, userId]);

    const { memData } = require('../config/db');
    if (memData && memData.users) {
      const u = memData.users.find(usr => usr.id == userId);
      if (u) u.is_active = newStatus;
    }

    await createAuditLog(req.user.id, 'TOGGLE_USER_ACTIVE', 'users', userId, { is_active: currentStatus }, { is_active: newStatus }, req.ip);

    res.json({ success: true, message: `Kullanıcı durumu ${newStatus ? 'Aktif' : 'Pasif'} yapıldı.` });
  } catch (err) {
    console.error('Durum değiştirme hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// 3.5. Kullanıcı Bilgilerini Güncelle
router.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { full_name, phone, role_id, department_id, title, password } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let password_hash = null;
    if (password && password.length >= 6) {
      password_hash = await bcrypt.hash(password, 10);
      await conn.query(
        `UPDATE users SET full_name = ?, phone = ?, role_id = ?, password_hash = ? WHERE id = ?`,
        [sanitizeInput(full_name), sanitizeInput(phone) || null, role_id, password_hash, userId]
      );
    } else {
      await conn.query(
        `UPDATE users SET full_name = ?, phone = ?, role_id = ? WHERE id = ?`,
        [sanitizeInput(full_name), sanitizeInput(phone) || null, role_id, userId]
      );
    }

    if (role_id == 2 || role_id == 3) {
      const [empExisting] = await conn.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
      if (empExisting.length > 0) {
        await conn.query(
          `UPDATE employees SET department_id = ?, title = ? WHERE user_id = ?`,
          [department_id || 1, sanitizeInput(title) || (role_id == 2 ? 'Birim Müdürü' : 'Saha Görevlisi'), userId]
        );
      } else {
        await conn.query(
          `INSERT INTO employees (user_id, department_id, title) VALUES (?, ?, ?)`,
          [userId, department_id || 1, sanitizeInput(title) || (role_id == 2 ? 'Birim Müdürü' : 'Saha Görevlisi')]
        );
      }
    }

    // Memory proxy update
    const { memData } = require('../config/db');
    if (memData && memData.users) {
      const u = memData.users.find(usr => usr.id == userId);
      if (u) {
        if (full_name) u.full_name = full_name;
        if (phone) u.phone = phone;
        if (role_id) {
          u.role_id = Number(role_id);
          const roleNameMap = { 1: 'Sistem Yöneticisi', 2: 'Birim Yöneticisi', 3: 'Personel', 4: 'Vatandaş' };
          u.role_name = roleNameMap[role_id] || u.role_name;
        }
        if (password_hash) u.password_hash = password_hash;

        if (department_id) {
          u.department_id = Number(department_id);
          const deptObj = (memData.departments || []).find(d => d.id == department_id);
          if (deptObj) u.department_name = deptObj.name;
        }
        if (title) u.employee_title = title;

        let emp = (memData.employees || []).find(e => e.user_id == userId);
        if (emp) {
          if (department_id) emp.department_id = Number(department_id);
          if (title) emp.title = title;
        } else if (role_id == 2 || role_id == 3) {
          if (!memData.employees) memData.employees = [];
          memData.employees.push({
            id: memData.employees.length + 1,
            user_id: Number(userId),
            department_id: Number(department_id) || 1,
            title: title || 'Saha Görevlisi'
          });
        }
      }
    }

    await conn.commit();
    await createAuditLog(req.user.id, 'UPDATE_USER', 'users', userId, null, { full_name, role_id }, req.ip);

    res.json({ success: true, message: 'Kullanıcı bilgileri güncellendi.' });
  } catch (err) {
    await conn.rollback();
    console.error('Kullanıcı güncelleme hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  } finally {
    conn.release();
  }
});

// 3.6. Kullanıcı Soft Delete (Fiziksel SQL DELETE yerine is_active = 0)
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [userId]);
    const { memData } = require('../config/db');
    if (memData && memData.users) {
      const u = memData.users.find(usr => usr.id == userId);
      if (u) u.is_active = 0;
    }
    await createAuditLog(req.user.id, 'SOFT_DELETE_USER', 'users', userId, { is_active: 1 }, { is_active: 0 }, req.ip);
    res.json({ success: true, message: 'Kullanıcı başarıyla pasife alındı (Soft Delete).' });
  } catch (err) {
    console.error('Soft delete user error:', err);
    res.status(500).json({ success: false, message: 'Kullanıcı silinemedi.' });
  }
});

// 4. Müdürlükler (Departments) CRUD
router.get('/departments', async (req, res) => {
  try {
    const [departments] = await pool.query(
      `SELECT d.*, COUNT(e.id) as employee_count
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id
       WHERE d.is_active = 1
       GROUP BY d.id ORDER BY d.id ASC`
    );
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/departments', async (req, res) => {
  const { name, code } = req.body;
  try {
    await pool.query(
      `INSERT INTO departments (name, code, is_active) VALUES (?, ?, 1)`,
      [sanitizeInput(name), sanitizeInput(code).toUpperCase()]
    );
    res.status(201).json({ success: true, message: 'Yeni müdürlük eklendi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Müdürlük eklenirken hata oluştu.' });
  }
});

// 4.5. Müdürlük Soft Delete (Fiziksel SQL DELETE yerine is_active = 0)
router.delete('/departments/:id', async (req, res) => {
  const deptId = req.params.id;
  try {
    await pool.query('UPDATE departments SET is_active = 0 WHERE id = ?', [deptId]);
    const { memData } = require('../config/db');
    if (memData && memData.departments) {
      const d = memData.departments.find(dept => dept.id == deptId);
      if (d) d.is_active = 0;
    }
    await createAuditLog(req.user.id, 'SOFT_DELETE_DEPARTMENT', 'departments', deptId, { is_active: 1 }, { is_active: 0 }, req.ip);
    res.json({ success: true, message: 'Müdürlük pasife alındı (Soft Delete).' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Müdürlük silinemedi.' });
  }
});

// 5. Admin / Yönetici Talep Yönetimsel Güncelleme (Title & Description DISABLED in UI & ignored)
router.put('/complaints/:id', async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { category_id, department_id, priority_level, status } = req.body;

    const [cRows] = await pool.query('SELECT status FROM complaints WHERE id = ?', [complaintId]);
    if (!cRows || cRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const oldStatus = cRows[0].status;

    await pool.query(
      `UPDATE complaints 
       SET category_id = COALESCE(?, category_id),
           department_id = COALESCE(?, department_id),
           priority_level = COALESCE(?, priority_level),
           urgency_level = COALESCE(?, urgency_level),
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id = ?`,
      [category_id || null, department_id || null, priority_level || null, priority_level || null, status || null, complaintId]
    );

    const { memData } = require('../config/db');
    if (memData && memData.complaints) {
      const memComp = memData.complaints.find(c => c.id == complaintId);
      if (memComp) {
        if (category_id) memComp.category_id = category_id;
        if (department_id) memComp.department_id = department_id;
        if (priority_level) {
          memComp.priority_level = priority_level;
          memComp.urgency_level = priority_level;
        }
        if (status) memComp.status = status;
      }
    }

    if (status && status !== oldStatus) {
      await pool.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, ?, ?, ?, 'Yönetici tarafından güncellendi.')`,
        [complaintId, req.user.id, oldStatus, status]
      );
    }

    res.json({ success: true, message: 'Talep yönetimsel bilgileri başarıyla güncellendi.' });
  } catch (err) {
    console.error('Admin complaint update error:', err);
    res.status(500).json({ success: false, message: 'Talep güncellenemedi.' });
  }
});

// 6. Audit Logları Göster
router.get('/audit-logs', async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT a.*, u.full_name as user_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC LIMIT 100`
    );
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
