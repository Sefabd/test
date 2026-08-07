const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { upload, createAuditLog, sanitizeInput } = require('../middleware/security');

// Takip Kodu Üretici (Örn: BLD-2026-000105)
async function generateTrackingCode(conn) {
  const year = new Date().getFullYear();
  const [rows] = await conn.query('SELECT COUNT(*) as count FROM complaints');
  const nextNum = (rows[0].count + 101).toString().padStart(6, '0');
  return `BLD-${year}-${nextNum}`;
}

// 1. Yeni Talep / Şikâyet Oluştur (Vatandaş veya Misafir)
router.post(
  '/',
  upload.array('files', 5),
  [
    body('title').notEmpty().withMessage('Başlık zorunludur.').trim(),
    body('description').notEmpty().withMessage('Açıklama zorunludur.').trim(),
    body('category_id').isInt().withMessage('Geçerli bir kategori seçiniz.'),
    body('district_id').isInt().withMessage('Geçerli bir ilçe seçiniz.'),
    body('neighborhood_id').isInt().withMessage('Geçerli bir mahalle seçiniz.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title, description, category_id, district_id, neighborhood_id, open_address,
      latitude, longitude, urgency_level = 'Normal', is_public = 1, contact_preference = 'E-posta',
      citizen_id: body_citizen_id,
      ai_suggested_category_id, ai_suggested_dept_id, ai_suggested_priority, ai_sentiment, ai_flagged
    } = req.body;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      let citizenId = body_citizen_id || null;

      // Token ile giriş yapmışsa citizen_id bul
      if (req.headers['authorization']) {
        try {
          const authHeader = req.headers['authorization'];
          const token = authHeader && authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const { JWT_SECRET } = require('../middleware/auth');
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded && decoded.citizen_id) {
            citizenId = decoded.citizen_id;
          }
        } catch (e) {
          // Token geçersizse misafir vatandaş 1 kabul et
        }
      }

      if (!citizenId) {
        // Fallback varsayılan vatandaş
        const [cRows] = await conn.query('SELECT id FROM citizens LIMIT 1');
        citizenId = cRows.length > 0 ? cRows[0].id : 1;
      }

      // Kategori bilgisine göre müdürlüğü otomatik al
      const [catRows] = await conn.query('SELECT department_id, default_priority FROM complaint_categories WHERE id = ?', [category_id]);
      const departmentId = catRows.length > 0 ? catRows[0].department_id : 1;
      const priorityLevel = urgency_level || (catRows.length > 0 ? catRows[0].default_priority : 'Normal');

      const trackingCode = await generateTrackingCode(conn);

      const [insertResult] = await conn.query(
        `INSERT INTO complaints (
          tracking_code, citizen_id, category_id, department_id, district_id, neighborhood_id,
          title, description, open_address, latitude, longitude, urgency_level, priority_level,
          status, is_public, contact_preference,
          ai_suggested_category_id, ai_suggested_dept_id, ai_suggested_priority, ai_sentiment, ai_flagged
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Yeni', ?, ?, ?, ?, ?, ?, ?)`,
        [
          trackingCode, citizenId, category_id, departmentId, district_id, neighborhood_id,
          sanitizeInput(title), sanitizeInput(description), sanitizeInput(open_address) || null,
          latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null,
          urgency_level, priorityLevel, is_public ? 1 : 0, contact_preference,
          ai_suggested_category_id || null, ai_suggested_dept_id || null,
          ai_suggested_priority || null, ai_sentiment || null, ai_flagged ? 1 : 0
        ]
      );

      const complaintId = insertResult.insertId;

      // Status history kaydı
      await conn.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, (SELECT user_id FROM citizens WHERE id = ? LIMIT 1), NULL, 'Yeni', 'Talep vatandaş tarafından oluşturuldu.')`,
        [complaintId, citizenId]
      );

      // Yüklenen dosyaları kaydet
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const relativePath = 'uploads/' + file.filename;
          await conn.query(
            `INSERT INTO complaint_files (complaint_id, file_path, file_name, file_type, file_size, uploaded_by_user_id, file_category)
             VALUES (?, ?, ?, ?, ?, (SELECT user_id FROM citizens WHERE id = ? LIMIT 1), 'Talep Görseli')`,
            [complaintId, relativePath, file.originalname, file.mimetype, file.size, citizenId]
          );
        }
      }

      // Yöneticiye bildirim oluştur
      const [managers] = await conn.query(
        `SELECT u.id FROM users u
         JOIN employees e ON u.id = e.user_id
         WHERE e.department_id = ? AND u.role_id IN (1, 2)`,
        [departmentId]
      );

      for (const mgr of managers) {
        await conn.query(
          `INSERT INTO notifications (user_id, title, message, type, reference_id)
           VALUES (?, 'Yeni Talep Geldı', ?, 'Talep', ?)`,
          [mgr.id, `Biriminiz için ${trackingCode} numaralı yeni bir talep oluşturuldu: ${title}`, complaintId]
        );
      }

      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Talebiniz başarıyla alındı.',
        tracking_code: trackingCode,
        complaint_id: complaintId
      });
    } catch (err) {
      await conn.rollback();
      console.error('Talep oluşturma hatası:', err);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    } finally {
      conn.release();
    }
  }
);

// 2. Takip Kodu ile Şikâyet Sorgulama (Herkese Açık Vatandaş Takip Ekranı)
router.get('/track/:code', async (req, res) => {
  const code = req.params.code.trim();

  try {
    const [complaints] = await pool.query(
      `SELECT c.*, cat.name as category_name, d.name as department_name,
              dis.name as district_name, n.name as neighborhood_name,
              u.full_name as citizen_name
       FROM complaints c
       JOIN complaint_categories cat ON c.category_id = cat.id
       JOIN departments d ON c.department_id = d.id
       JOIN districts dis ON c.district_id = dis.id
       JOIN neighborhoods n ON c.neighborhood_id = n.id
       JOIN citizens cit ON c.citizen_id = cit.id
       JOIN users u ON cit.user_id = u.id
       WHERE c.tracking_code = ?`,
      [code]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Belirtilen takip koduna ait talep bulunamadı.' });
    }

    const complaint = complaints[0];

    // Status History
    const [history] = await pool.query(
      `SELECT sh.*, u.full_name as changed_by_name
       FROM complaint_status_history sh
       JOIN users u ON sh.changed_by_user_id = u.id
       WHERE sh.complaint_id = ?
       ORDER BY sh.created_at ASC`,
      [complaint.id]
    );

    // Files
    const [files] = await pool.query(
      `SELECT * FROM complaint_files WHERE complaint_id = ?`,
      [complaint.id]
    );

    // Actions & Resolution Photo
    const [actions] = await pool.query(
      `SELECT ca.*, u.full_name as employee_name, e.title as employee_title
       FROM complaint_actions ca
       JOIN employees e ON ca.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE ca.complaint_id = ?
       ORDER BY ca.created_at DESC`,
      [complaint.id]
    );

    // Survey rating
    const [survey] = await pool.query(
      `SELECT * FROM satisfaction_surveys WHERE complaint_id = ?`,
      [complaint.id]
    );

    res.json({
      success: true,
      complaint,
      history,
      files,
      actions,
      survey: survey.length > 0 ? survey[0] : null
    });
  } catch (err) {
    console.error('Takip sorgu hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Optional Auth Middleware for public complaint viewing
function optionalAuth(req, res, next) {
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
      next();
    });
  } else {
    next();
  }
}

// 3. Şikâyet Listesi (Filtreleme, Rol Kontrolü, Arama)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category_id, department_id, district_id, neighborhood_id, search, priority, mine_only } = req.query;

    let query = `
      SELECT c.*, cat.name as category_name, d.name as department_name,
             dis.name as district_name, n.name as neighborhood_name,
             u.full_name as citizen_name
      FROM complaints c
      JOIN complaint_categories cat ON c.category_id = cat.id
      JOIN departments d ON c.department_id = d.id
      JOIN districts dis ON c.district_id = dis.id
      JOIN neighborhoods n ON c.neighborhood_id = n.id
      JOIN citizens cit ON c.citizen_id = cit.id
      JOIN users u ON cit.user_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    // RBAC logic filtering
    if (req.user) {
      if (req.user.role_name === 'Vatandaş' || mine_only === 'true') {
        query += ` AND c.citizen_id = ?`;
        queryParams.push(req.user.citizen_id);
      } else if (req.user.role_name === 'Birim Yöneticisi') {
        query += ` AND c.department_id = ?`;
        queryParams.push(req.user.department_id);
      } else if (req.user.role_name === 'Personel') {
        query += ` AND c.id IN (SELECT complaint_id FROM complaint_assignments WHERE assigned_to_employee_id = ?)`;
        queryParams.push(req.user.employee_id);
      }
    }

    if (status) {
      query += ` AND c.status = ?`;
      queryParams.push(status);
    }
    if (category_id) {
      query += ` AND c.category_id = ?`;
      queryParams.push(category_id);
    }
    if (department_id) {
      query += ` AND c.department_id = ?`;
      queryParams.push(department_id);
    }
    if (district_id) {
      query += ` AND c.district_id = ?`;
      queryParams.push(district_id);
    }
    if (neighborhood_id) {
      query += ` AND c.neighborhood_id = ?`;
      queryParams.push(neighborhood_id);
    }
    if (priority) {
      query += ` AND c.priority_level = ?`;
      queryParams.push(priority);
    }
    if (search) {
      query += ` AND (c.tracking_code LIKE ? OR c.title LIKE ? OR c.description LIKE ? OR u.full_name LIKE ?)`;
      const term = `%${search}%`;
      queryParams.push(term, term, term, term);
    }

    query += ` ORDER BY c.created_at DESC`;

    const [rows] = await pool.query(query, queryParams);

    res.json({ success: true, count: rows.length, complaints: rows });
  } catch (err) {
    console.error('Listeleme hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// 4. Şikâyet Durumu Güncelle (Personel, Yönetici veya Admin)
router.put('/:id/status', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi', 'Personel']), async (req, res) => {
  const complaintId = req.params.id;
  const { new_status, change_reason } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [oldRows] = await conn.query('SELECT status, citizen_id, tracking_code FROM complaints WHERE id = ?', [complaintId]);
    if (oldRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const oldStatus = oldRows[0].status;
    const citizenId = oldRows[0].citizen_id;
    const trackingCode = oldRows[0].tracking_code;

    await conn.query('UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?', [new_status, complaintId]);

    await conn.query(
      `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
       VALUES (?, ?, ?, ?, ?)`,
      [complaintId, req.user.id, oldStatus, new_status, sanitizeInput(change_reason) || 'Durum güncellendi.']
    );

    // Vatandaşa Bildirim
    const [citUser] = await conn.query('SELECT user_id FROM citizens WHERE id = ?', [citizenId]);
    if (citUser.length > 0) {
      await conn.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_id)
         VALUES (?, 'Talep Durumu Güncellendi', ?, 'Talep', ?)`,
        [citUser[0].user_id, `${trackingCode} numaralı talebinizin durumu "${new_status}" olarak güncellenmiştir.`, complaintId]
      );
    }

    await conn.commit();
    await createAuditLog(req.user.id, 'COMPLAINT_STATUS_UPDATE', 'complaints', complaintId, { status: oldStatus }, { status: new_status }, req.ip);

    res.json({ success: true, message: 'Talep durumu güncellendi.' });
  } catch (err) {
    await conn.rollback();
    console.error('Durum güncelleme hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  } finally {
    conn.release();
  }
});

// 5. Vatandaş Memnuniyet Puanlaması (1-5 Yıldız + Yorum)
router.post('/:id/survey', authenticateToken, checkRole(['Vatandaş']), async (req, res) => {
  const complaintId = req.params.id;
  const { rating, review_comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Lütfen 1 ile 5 arasında geçerli bir puan giriniz.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM satisfaction_surveys WHERE complaint_id = ?', [complaintId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Bu talep için zaten bir değerlendirme yapılmıştır.' });
    }

    await pool.query(
      `INSERT INTO satisfaction_surveys (complaint_id, citizen_id, rating, review_comment)
       VALUES (?, ?, ?, ?)`,
      [complaintId, req.user.citizen_id, rating, sanitizeInput(review_comment) || null]
    );

    res.json({ success: true, message: 'Değerlendirmeniz ve geri bildiriminiz için teşekkür ederiz!' });
  } catch (err) {
    console.error('Anket hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
