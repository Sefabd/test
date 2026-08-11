const express = require('express');
const router = express.Router();
const { pool, memData } = require('../config/db');
const { authenticateToken, checkRole } = require('../middleware/auth');

// Initial default announcements if none exist
const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: '📢 Giresun Belediyesi 153 Çözüm Merkezi Dijital Portalı Hizmete Girdi!',
    content: 'Vatandaşlarımızın belediye hizmetlerine 7/24 daha hızlı erişebilmesi, talep ve şikâyetlerini yapay zekâ desteğiyle iletebilmesi amacıyla yeni çözüm merkezimiz yayına alınmıştır.',
    category: 'Genel Duyuru',
    priority: 'Yüksek',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_by_name: 'Ahmet Yılmaz (Sistem Yöneticisi)'
  },
  {
    id: 2,
    title: '💧 Hacısıyam ve Nizamiye Mahallelerinde Planlı Su Kesintisi',
    content: 'Ana isale hattı yenileme çalışmaları sebebiyle 12 Ağustos Salı günü 09:00 - 16:00 saatleri arasında su kesintisi yaşanacaktır. Vatandaşlarımızın tedbirli olması rica olunur.',
    category: 'Altyapı & Su Kesintisi',
    priority: 'Acil',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_by_name: 'Ahmet Yılmaz (Sistem Yöneticisi)'
  },
  {
    id: 3,
    title: '🚧 Atatürk Caddesi Asfalt Yenileme Çalışmaları Başladı',
    content: 'Fen İşleri Müdürlüğümüz tarafından Atatürk Caddesi genelinde asfalt serme ve kaldırım düzenleme çalışmaları başlatılmıştır. Sürücülerin alternatif güzergâhları kullanması önemle duyurulur.',
    category: 'Yol Çalışması',
    priority: 'Normal',
    created_at: new Date().toISOString(),
    created_by_name: 'Ahmet Yılmaz (Sistem Yöneticisi)'
  }
];

// Initialize memory announcements
if (!memData.announcements) {
  memData.announcements = DEFAULT_ANNOUNCEMENTS;
}

// 1. GET ALL ANNOUNCEMENTS
router.get('/', async (req, res) => {
  try {
    let list = [];
    try {
      const [rows] = await pool.query('SELECT a.*, u.full_name as created_by_name FROM announcements a LEFT JOIN users u ON a.created_by_user_id = u.id ORDER BY a.created_at DESC');
      if (rows && rows.length > 0) {
        list = rows;
      }
    } catch (e) {
      // Database table fallback to memory
    }

    if (list.length === 0 && memData.announcements) {
      list = memData.announcements;
    }

    res.json({
      success: true,
      announcements: list
    });
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ success: false, message: 'Duyurular alınamadı.' });
  }
});

// 2. CREATE ANNOUNCEMENT (ADMIN ONLY)
router.post('/', authenticateToken, checkRole(['Sistem Yöneticisi']), async (req, res) => {
  try {
    const { title, content, category, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Duyuru başlığı ve içeriği zorunludur.' });
    }

    const nextId = (memData.announcements && memData.announcements.length > 0)
      ? Math.max(...memData.announcements.map(a => Number(a.id) || 0)) + 1
      : 1;

    const newObj = {
      id: nextId,
      title,
      content,
      category: category || 'Genel Duyuru',
      priority: priority || 'Normal',
      created_at: new Date().toISOString(),
      created_by_user_id: req.user.id,
      created_by_name: req.user.full_name || 'Sistem Yöneticisi'
    };

    try {
      await pool.query(
        `INSERT INTO announcements (title, content, category, priority, created_by_user_id) VALUES (?, ?, ?, ?, ?)`,
        [title, content, newObj.category, newObj.priority, req.user.id]
      );
    } catch (e) {
      // Memory fallback
    }

    if (!memData.announcements) memData.announcements = [];
    memData.announcements.unshift(newObj);

    res.json({
      success: true,
      message: 'Duyuru başarıyla yayınlandı.',
      announcement: newObj
    });
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ success: false, message: 'Duyuru yayınlanamadı.' });
  }
});

// 3. DELETE ANNOUNCEMENT (ADMIN ONLY)
router.delete('/:id', authenticateToken, checkRole(['Sistem Yöneticisi']), async (req, res) => {
  try {
    const id = req.params.id;
    try {
      await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    } catch (e) {}

    if (memData.announcements) {
      memData.announcements = memData.announcements.filter(a => a.id != id);
    }

    res.json({ success: true, message: 'Duyuru silindi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Silme hatası.' });
  }
});

module.exports = router;
