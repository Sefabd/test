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

    const newUserId = uResult.insertId;

    if (role_id == 2 || role_id == 3) {
      // Birim Yöneticisi veya Personel ise employees tablosuna ekle
      await conn.query(
        `INSERT INTO employees (user_id, department_id, title)
         VALUES (?, ?, ?)`,
        [newUserId, department_id || 1, sanitizeInput(title) || 'Saha Görevlisi']
      );
    } else if (role_id == 4) {
      // Vatandaş ise
      await conn.query(`INSERT INTO citizens (user_id) VALUES (?)`, [newUserId]);
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
    if (uRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    const newStatus = uRows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, userId]);

    await createAuditLog(req.user.id, 'TOGGLE_USER_ACTIVE', 'users', userId, { is_active: uRows[0].is_active }, { is_active: newStatus }, req.ip);

    res.json({ success: true, message: `Kullanıcı durumu ${newStatus ? 'Aktif' : 'Pasif'} yapıldı.` });
  } catch (err) {
    console.error('Durum değiştirme hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// 4. Müdürlükler (Departments) CRUD
router.get('/departments', async (req, res) => {
  try {
    const [departments] = await pool.query(
      `SELECT d.*, COUNT(e.id) as employee_count
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id
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

// 5. Audit Logları Göster
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
