const express = require('express');
const router = express.Router();
const { pool, memData } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications (Fetch User/Department Notifications)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userDeptId = req.user.department_id;

    let notifications = [];

    if (memData && memData.notifications) {
      notifications = memData.notifications.filter(n => {
        if (n.user_id && n.user_id == userId) return true;
        if (n.department_id && userDeptId && n.department_id == userDeptId) return true;
        return false;
      });
    } else {
      const [rows] = await pool.query(
        `SELECT * FROM notifications 
         WHERE user_id = ? OR (department_id IS NOT NULL AND department_id = ?)
         ORDER BY id DESC LIMIT 50`,
        [userId, userDeptId || 0]
      );
      notifications = Array.isArray(rows) ? rows : [];
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unread_count: unreadCount,
      notifications
    });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ success: false, message: 'Bildirimler alınamadı.' });
  }
});

// PUT /api/notifications/read-all (Mark all as read)
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userDeptId = req.user.department_id;

    if (memData && memData.notifications) {
      memData.notifications.forEach(n => {
        if ((n.user_id && n.user_id == userId) || (n.department_id && userDeptId && n.department_id == userDeptId)) {
          n.is_read = 1;
        }
      });
    }

    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? OR department_id = ?`,
      [userId, userDeptId || 0]
    );

    res.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi.' });
  } catch (err) {
    console.error('Notifications read all error:', err);
    res.status(500).json({ success: false, message: 'İşlem başarısız.' });
  }
});

// PUT /api/notifications/:id/read (Mark single notification as read)
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notifId = req.params.id;
    if (memData && memData.notifications) {
      const n = memData.notifications.find(item => item.id == notifId);
      if (n) n.is_read = 1;
    }

    await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [notifId]);

    res.json({ success: true, message: 'Bildirim okundu.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'İşlem başarısız.' });
  }
});

module.exports = router;
