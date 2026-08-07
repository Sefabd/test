const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. Tüm Kategoriler ve Müdürlükler (Talep Formu için)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.*, d.name as department_name
       FROM complaint_categories c
       JOIN departments d ON c.department_id = d.id
       ORDER BY c.name ASC`
    );
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Kategoriler alınamadı.' });
  }
});

// 2. Tüm Müdürlükler
router.get('/departments', async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC');
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Müdürlükler alınamadı.' });
  }
});

// 3. İlçeler ve Mahalleler
router.get('/locations', async (req, res) => {
  try {
    const [districts] = await pool.query('SELECT * FROM districts ORDER BY name ASC');
    const [neighborhoods] = await pool.query('SELECT * FROM neighborhoods ORDER BY name ASC');
    res.json({ success: true, districts, neighborhoods });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Konum bilgileri alınamadı.' });
  }
});

// 4. Kullanıcı Bildirimleri
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Bildirimler alınamadı.' });
  }
});

// Bildirim Okundu İşaretle
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
