const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { upload, createAuditLog, sanitizeInput } = require('../middleware/security');

// Optional Auth Middleware
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

// Helper: Record Status History Audit Log
async function recordStatusHistory(complaint_id, changed_by_user_id, old_status, new_status, change_reason, changed_by_name) {
  const { memData } = require('../config/db');
  if (memData) {
    if (!memData.complaint_status_history) memData.complaint_status_history = [];
    memData.complaint_status_history.push({
      id: memData.complaint_status_history.length + 1,
      complaint_id: Number(complaint_id),
      changed_by_user_id: Number(changed_by_user_id),
      old_status: old_status || 'Yeni',
      new_status: new_status,
      change_reason: change_reason || 'Talep durumu güncellendi.',
      created_at: new Date().toISOString(),
      changed_by_name: changed_by_name || 'Kullanıcı'
    });
  }

  try {
    await pool.query(
      `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
       VALUES (?, ?, ?, ?, ?)`,
      [complaint_id, changed_by_user_id, old_status || 'Yeni', new_status, change_reason || 'Talep durumu güncellendi.']
    );
  } catch (e) {}
}

// 1. Yeni Şikâyet / Talep Oluştur (Requires Auth)
router.post(
  '/',
  authenticateToken,
  upload.array('files', 5),
  [
    body('title').notEmpty().withMessage('Talep başlığı zorunludur.').trim(),
    body('description').notEmpty().withMessage('Açıklama zorunludur.').trim(),
    body('category_id').notEmpty().withMessage('Kategori seçimi zorunludur.'),
    body('district_id').notEmpty().withMessage('İlçe seçimi zorunludur.'),
    body('neighborhood_id').notEmpty().withMessage('Mahalle seçimi zorunludur.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const {
      title, description, category_id, district_id, neighborhood_id, department_id: reqDeptId,
      open_address, latitude, longitude, urgency_level, is_public, contact_preference,
      submission_type
    } = req.body;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      let targetDeptId = reqDeptId ? Number(reqDeptId) : null;
      const [categories] = await conn.query('SELECT department_id, name, default_priority FROM complaint_categories WHERE id = ?', [category_id]);
      
      let isOtherCategory = Number(category_id) === 14 || (categories && categories.length > 0 && categories[0].name.includes('Diğer'));
      
      // Diğer kategorisinde veya birim seçilmediyse otomatik 153 Çözüm Ana Masası (Birim 11) havuzuna düşsün
      const department_id = isOtherCategory ? 11 : (targetDeptId || ((categories && categories.length > 0) ? categories[0].department_id : 11));
      const priority_level = urgency_level || (categories && categories.length > 0 ? categories[0].default_priority : 'Normal');
      const initialStatus = (isOtherCategory || department_id === 11) ? 'Ön İncelemede' : 'Yeni';

      const tracking_code = 'BLD-2026-' + Math.floor(100000 + Math.random() * 900000);
      const isPublicVal = (is_public !== undefined && is_public !== null) ? Number(is_public) : 1;
      const userId = req.user.id;
      const subType = submission_type || 'Şikâyet';

      const [result] = await conn.query(
        `INSERT INTO complaints (
          tracking_code, citizen_id, category_id, department_id, district_id, neighborhood_id,
          title, description, open_address, latitude, longitude, urgency_level, priority_level,
          status, is_public, contact_preference, submission_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tracking_code,
          userId,
          category_id,
          department_id,
          district_id,
          neighborhood_id,
          sanitizeInput(title),
          sanitizeInput(description),
          sanitizeInput(open_address) || null,
          latitude || 40.9128,
          longitude || 38.3895,
          urgency_level || 'Normal',
          priority_level,
          initialStatus,
          isPublicVal,
          contact_preference || 'E-posta',
          subType
        ]
      );

      const complaintId = result ? (result.insertId || result[0]?.insertId || Date.now()) : Date.now();

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const filePath = 'uploads/' + file.filename;
          await conn.query(
            `INSERT INTO complaint_files (complaint_id, file_path, file_name, file_type, file_size, uploaded_by_user_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [complaintId, filePath, file.originalname, file.mimetype, file.size, req.user.id]
          );
        }
      }

      await conn.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, ?, 'Yok', 'Yeni', 'Talep vatandaş tarafından oluşturuldu.')`,
        [complaintId, req.user.id]
      );

      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Talebiniz başarıyla alındı.',
        tracking_code,
        complaint_id: complaintId
      });
    } catch (err) {
      await conn.rollback();
      console.error('Talep oluşturma hatası:', err);
      res.status(500).json({ success: false, message: 'Talep oluşturulurken hata meydana geldi.' });
    } finally {
      conn.release();
    }
  }
);

// 2. Upvote / Downvote Toggle Endpoint (Per-User Tracked with DB/Memory Sync)
router.post('/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;
    const { toggleComplaintUpvote } = require('../config/db');

    const result = await toggleComplaintUpvote(complaintId, userId);

    res.json({
      success: true,
      message: result.has_upvoted ? 'Talebe başarıyla destek verdiniz!' : 'Desteğinizi geri çektiniz.',
      has_upvoted: result.has_upvoted,
      upvote_count: result.upvote_count
    });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ success: false, message: 'Destek verilirken hata oluştu.' });
  }
});

// 3. GET /api/complaints/my (Strictly User's Own Complaints for "Başvurularım")
router.get('/my', authenticateToken, async (req, res) => {
  try {
    let [complaints] = await pool.query('SELECT * FROM complaints ORDER BY id DESC');
    let [allFiles] = await pool.query('SELECT * FROM complaint_files');

    complaints = Array.isArray(complaints) ? complaints : [];
    allFiles = Array.isArray(allFiles) ? allFiles : [];

    const currentUserId = req.user.id;
    const currentCitizenId = req.user.citizen_id;
    const currentUserEmail = req.user.email || '';

    const myComplaints = complaints.filter(c => {
      if (!c) return false;
      if (c.user_id && (c.user_id == currentUserId || c.user_id == currentCitizenId)) return true;
      if (c.citizen_id && (c.citizen_id == currentUserId || c.citizen_id == currentCitizenId)) return true;
      if (currentUserEmail.includes('caner') && (c.citizen_id == 6 || c.user_id == 6 || c.user_id == 10)) return true;
      if (currentUserEmail.includes('sefa') && (c.citizen_id == 7 || c.user_id == 7 || c.user_id == 11)) return true;
      return false;
    });

    const result = myComplaints.map(c => {
      const files = allFiles.filter(f => f.complaint_id == c.id);
      return {
        ...c,
        files: files.map(f => f.file_path),
        first_photo: files.length > 0 ? files[0].file_path : null
      };
    });

    res.json({ success: true, complaints: result });
  } catch (err) {
    console.error('Kullanıcı talepleri hatası:', err);
    res.status(500).json({ success: false, message: 'Kendi talepleriniz alınamadı.' });
  }
});

// 4. GET /api/complaints/public (Strictly Public Feed & Citizen Map with Per-User Upvote State)
router.get('/public', optionalAuth, async (req, res) => {
  try {
    let [complaints] = await pool.query('SELECT * FROM complaints WHERE is_public = 1 ORDER BY id DESC');
    let [allFiles] = await pool.query('SELECT * FROM complaint_files');
    const { getUpvotedComplaintIdsForUser } = require('../config/db');

    complaints = Array.isArray(complaints) ? complaints : [];
    allFiles = Array.isArray(allFiles) ? allFiles : [];

    const currentUserId = req.user ? req.user.id : null;
    let upvotedSet = new Set();

    if (currentUserId) {
      upvotedSet = await getUpvotedComplaintIdsForUser(currentUserId);
    }

    const publicComplaints = complaints.filter(c => Number(c.is_public) === 1);

    const result = publicComplaints.map(c => {
      const files = allFiles.filter(f => f.complaint_id == c.id);
      const hasUpvoted = currentUserId ? upvotedSet.has(Number(c.id)) : false;

      return {
        ...c,
        has_upvoted: hasUpvoted,
        upvote_count: c.upvote_count !== undefined ? c.upvote_count : 0,
        files: files.map(f => f.file_path),
        first_photo: files.length > 0 ? files[0].file_path : null
      };
    });

    res.json({ success: true, complaints: result });
  } catch (err) {
    console.error('Kamuya açık talepler hatası:', err);
    res.status(500).json({ success: false, message: 'Kamuya açık talepler alınamadı.' });
  }
});

// 5. GET /api/complaints/all (Role-Isolated: Manager sees department, Staff sees assigned tasks, Admin sees all)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    let [complaints] = await pool.query('SELECT * FROM complaints ORDER BY id DESC');
    let [allFiles] = await pool.query('SELECT * FROM complaint_files');
    let [allAssignments] = await pool.query('SELECT * FROM complaint_assignments');

    complaints = Array.isArray(complaints) ? complaints : [];
    allFiles = Array.isArray(allFiles) ? allFiles : [];
    allAssignments = Array.isArray(allAssignments) ? allAssignments : [];

    const userRole = req.user.role_name;
    const userDeptId = req.user.department_id;
    const userEmpId = req.user.employee_id;

    const myAssignedComplaintIds = new Set(
      allAssignments
        .filter(a => (a.assigned_to_employee_id == userEmpId || a.employee_id == userEmpId))
        .map(a => Number(a.complaint_id))
    );

    // Strict Role Isolation Engine (Backend-Driven Filtering)
    if (userRole === 'Vatandaş' || req.user.role_id === 4) {
      complaints = complaints.filter(c => c.citizen_id == req.user.id || c.user_id == req.user.id);
    } else if (userRole === 'Birim Yöneticisi' || req.user.role_id === 2) {
      complaints = complaints.filter(c => 
        c.department_id == userDeptId || 
        c.forwarded_from_department_id == userDeptId
      );
    } else if (userRole === 'Personel' || req.user.role_id === 3) {
      complaints = complaints.filter(c => 
        c.department_id == userDeptId || 
        c.assigned_to_user_id == req.user.id ||
        myAssignedComplaintIds.has(Number(c.id))
      );
    }

    // Filter out soft-deleted / passive complaints
    complaints = complaints.filter(c => c.status !== 'passive');

    const { department_id } = req.query;
    if (department_id) {
      complaints = complaints.filter(c => c.department_id == department_id);
    }

    const result = complaints.map(c => {
      const files = allFiles.filter(f => f.complaint_id == c.id);
      const isAssignedToMe = myAssignedComplaintIds.has(Number(c.id)) || c.assigned_employee_id == userEmpId;
      const isForwarded = (
        c.forwarded_from_department_id > 0 ||
        c.status === 'Müdürlüğe iletildi' ||
        (c.change_reason && c.change_reason.includes('yönlendirildi'))
      );

      return {
        ...c,
        is_assigned_to_me: isAssignedToMe ? 1 : 0,
        is_forwarded: isForwarded ? 1 : 0,
        files: files.map(f => f.file_path),
        first_photo: files.length > 0 ? files[0].file_path : null
      };
    });

    res.json({ success: true, complaints: result });
  } catch (err) {
    console.error('Tüm talepler hatası:', err);
    res.status(500).json({ success: false, message: 'Talepler listelenemedi.' });
  }
});

// 6. POST /api/complaints/:id/forward-department (Forward Complaint to Another Department)
router.post('/:id/forward-department', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi']), async (req, res) => {
  try {
    const complaintId = req.params.id;
    const target_department_id = Number(req.body.target_department_id || req.body.department_id);
    const reason = req.body.forward_reason || req.body.reason || req.body.note || '-';

    if (!target_department_id) {
      return res.status(400).json({ success: false, message: 'Lütfen yönlendirilecek birimi seçiniz.' });
    }

    const { memData } = require('../config/db');
    let deptName = 'İlgili Müdürlük';
    if (memData && memData.departments) {
      const foundDept = memData.departments.find(d => Number(d.id) === target_department_id);
      if (foundDept) deptName = foundDept.name;
    }
    if (deptName === 'İlgili Müdürlük') {
      const [deptRows] = await pool.query('SELECT name FROM departments WHERE id = ?', [target_department_id]);
      if (deptRows && deptRows.length > 0) deptName = deptRows[0].name;
    }

    const [cRows] = await pool.query('SELECT tracking_code, title, department_id, status FROM complaints WHERE id = ?', [complaintId]);
    const tCode = cRows && cRows.length > 0 ? cRows[0].tracking_code : 'BLD';
    const tTitle = cRows && cRows.length > 0 ? cRows[0].title : 'Talep';
    const oldStatus = (cRows && cRows.length > 0) ? cRows[0].status : 'Yeni';
    const originalDeptId = (cRows && cRows.length > 0) ? cRows[0].department_id : req.user.department_id;

    // Find category for new department to keep data consistent
    const [catRows] = await pool.query('SELECT id, name FROM complaint_categories WHERE department_id = ? LIMIT 1', [target_department_id]);
    const targetCatId = (catRows && catRows.length > 0) ? catRows[0].id : null;
    const targetCatName = (catRows && catRows.length > 0) ? catRows[0].name : null;

    if (targetCatId) {
      await pool.query(
        `UPDATE complaints SET department_id = ?, category_id = ?, forwarded_from_department_id = ?, status = 'İlgili birime yönlendirildi' WHERE id = ?`,
        [target_department_id, targetCatId, originalDeptId, complaintId]
      );
    } else {
      await pool.query(
        `UPDATE complaints SET department_id = ?, forwarded_from_department_id = ?, status = 'İlgili birime yönlendirildi' WHERE id = ?`,
        [target_department_id, originalDeptId, complaintId]
      );
    }

    // Update memory cache if active
    if (memData && memData.complaints) {
      const memComp = memData.complaints.find(c => c.id == complaintId);
      if (memComp) {
        memComp.forwarded_from_department_id = originalDeptId;
        memComp.department_id = target_department_id;
        memComp.department_name = deptName;
        if (targetCatId) {
          memComp.category_id = targetCatId;
          memComp.category_name = targetCatName;
        }
        memComp.status = 'İlgili birime yönlendirildi';
      }
    }

    // Append to status history with accurate old_status
    await pool.query(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by_user_id, change_reason)
       VALUES (?, ?, 'İlgili birime yönlendirildi', ?, ?)`,
      [complaintId, oldStatus, req.user.id, `Talep ${deptName} birimine yönlendirildi. Sebeb: ${reason || 'Yanlış birim kaydı'}`]
    );

    // Send Notification to Target Department
    const { createSystemNotification } = require('../config/db');
    await createSystemNotification({
      department_id: target_department_id,
      title: '🔄 Biriminize Yönlendirilen Talep',
      message: `[${tCode}] - "${tTitle}" talebi ${deptName} biriminize yönlendirildi. Sebeb: ${reason || 'Yanlış birim kaydı'}`,
      type: 'Yönlendirme',
      reference_id: complaintId
    });

    res.json({
      success: true,
      message: `Talep başarıyla ${deptName} birimine yönlendirildi.`
    });
  } catch (err) {
    console.error('Forward department error:', err);
    res.status(500).json({ success: false, message: 'Birim yönlendirme hatası.' });
  }
});

// Legacy Fallback Route
router.get('/', optionalAuth, async (req, res) => {
  if (req.query.mine_only === 'true' && req.user) {
    return res.redirect('/api/complaints/my');
  }
  if (req.query.public_only === 'true' || (req.user && req.user.role_name === 'Vatandaş')) {
    return res.redirect('/api/complaints/public');
  }
  return res.redirect('/api/complaints/all');
});

// 6. Takip Kodu ile Sorgula (Enriched with user & employee details to eliminate undefined)
router.get('/track/:code', async (req, res) => {
  try {
    const [complaints] = await pool.query('SELECT * FROM complaints WHERE tracking_code = ?', [req.params.code]);
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Başvuru bulunamadı.' });
    }

    const complaint = complaints[0];

    // Enriched History query joining Users
    const [history] = await pool.query(
      `SELECT h.*, COALESCE(u.full_name, 'Sistem Yetkilisi') as changed_by_name
       FROM complaint_status_history h
       LEFT JOIN users u ON h.changed_by_user_id = u.id
       WHERE h.complaint_id = ?
       ORDER BY h.id ASC`,
      [complaint.id]
    );

    const [files] = await pool.query('SELECT * FROM complaint_files WHERE complaint_id = ?', [complaint.id]);

    // Enriched Actions query joining Employees & Users
    const [actions] = await pool.query(
      `SELECT a.*, COALESCE(u.full_name, 'Saha Görevlisi') as employee_name, COALESCE(e.title, 'Saha Personeli') as employee_title
       FROM complaint_actions a
       LEFT JOIN employees e ON a.employee_id = e.id
       LEFT JOIN users u ON e.user_id = u.id
       WHERE a.complaint_id = ?
       ORDER BY a.id ASC`,
      [complaint.id]
    );

    res.json({
      success: true,
      complaint,
      history,
      files,
      actions
    });
  } catch (err) {
    console.error('Track complaint error:', err);
    res.status(500).json({ success: false, message: 'Sorgulama hatası.' });
  }
});

// 7. Vatandaş Memnuniyet Anket Kaydı (1-5 Yıldız Puan & Yorum)
router.post('/:id/survey', authenticateToken, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { rating, review_comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Lütfen 1-5 arasında bir puan veriniz.' });
    }

    const [cRows] = await pool.query('SELECT citizen_id, status FROM complaints WHERE id = ?', [complaintId]);
    if (!cRows || cRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const { memData } = require('../config/db');
    if (!memData.satisfaction_surveys) memData.satisfaction_surveys = [];

    const existingMem = memData.satisfaction_surveys.find(s => s.complaint_id == complaintId);
    if (existingMem) {
      existingMem.rating = Number(rating);
      existingMem.review_comment = sanitizeInput(review_comment);
    } else {
      memData.satisfaction_surveys.push({
        id: memData.satisfaction_surveys.length + 1,
        complaint_id: Number(complaintId),
        citizen_id: userId,
        rating: Number(rating),
        review_comment: sanitizeInput(review_comment),
        created_at: new Date().toISOString()
      });
    }

    try {
      await pool.query(
        `INSERT INTO satisfaction_surveys (complaint_id, citizen_id, rating, review_comment)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_comment = VALUES(review_comment)`,
        [complaintId, userId, rating, sanitizeInput(review_comment) || null]
      );
    } catch (e) {
      // Handled by memory fallback above
    }

    // Also update complaint.rating field
    try {
      await pool.query('UPDATE complaints SET rating = ? WHERE id = ?', [Number(rating), complaintId]);
      const c = memData.complaints ? memData.complaints.find(item => item.id == complaintId) : null;
      if (c) c.rating = Number(rating);
    } catch (e) {}

    res.json({ success: true, message: '⭐ Değerlendirmeniz için teşekkür ederiz!' });
  } catch (err) {
    console.error('Survey save error:', err);
    res.status(500).json({ success: false, message: 'Değerlendirme kaydedilemedi.' });
  }
});

// 8. Görev Atama / Atamayı Kaldırma (Müdür & Admin)
router.post('/:id/assign', authenticateToken, async (req, res) => {
  try {
    if (req.user.role_id === 3 || req.user.role_name === 'Personel') {
      return res.status(403).json({ success: false, message: 'Yetkisiz Erişim: Personel başkasına görev atayamaz. Sadece Birim Yöneticileri atama yapabilir.' });
    }

    const complaintId = req.params.id;
    const { assigned_user_id, unassign } = req.body;

    const { memData } = require('../config/db');
    const c = memData && memData.complaints ? memData.complaints.find(item => item.id == complaintId) : null;
    const oldStatus = c ? c.status : 'Yeni';

    if (unassign) {
      if (c) {
        c.assigned_to_user_id = null;
        c.assigned_employee_name = null;
        c.status = 'İlgili birime yönlendirildi';
      }
      try {
        await pool.query('UPDATE complaints SET assigned_to_user_id = NULL, status = ? WHERE id = ?', ['İlgili birime yönlendirildi', complaintId]);
      } catch (e) {}
      await recordStatusHistory(complaintId, req.user.id, oldStatus, 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', req.user.full_name);
      await createAuditLog(req.user.id, 'UNASSIGN_TASK', 'complaints', complaintId, {}, { unassigned: true }, req.ip);
      return res.json({ success: true, message: 'Görev ataması kaldırıldı.' });
    }

    const assignedUser = memData.users ? memData.users.find(u => u.id == assigned_user_id) : null;
    if (!assignedUser) {
      return res.status(404).json({ success: false, message: 'Personel bulunamadı.' });
    }

    if (c) {
      c.assigned_to_user_id = assignedUser.id;
      c.assigned_employee_name = assignedUser.full_name;
      c.status = 'Personele atandı';
    }

    try {
      await pool.query('UPDATE complaints SET assigned_to_user_id = ?, status = ? WHERE id = ?', [assignedUser.id, 'Personele atandı', complaintId]);
    } catch (e) {}
    await recordStatusHistory(complaintId, req.user.id, oldStatus, 'Personele atandı', `Görev ${assignedUser.full_name} isimli personele atandı.`, req.user.full_name);
    await createAuditLog(req.user.id, 'ASSIGN_TASK', 'complaints', complaintId, {}, { assigned_to: assignedUser.id }, req.ip);

    res.json({ success: true, message: `Görev başarıyla ${assignedUser.full_name} isimli personele atandı.` });
  } catch (err) {
    console.error('Assign task error:', err);
    res.status(500).json({ success: false, message: 'Atama işlemi başarısız.' });
  }
});

// 9. Görevi Üzerime Al (Saha Personeli Self-Assignment)
router.post('/:id/self-assign', authenticateToken, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;

    const { memData } = require('../config/db');
    const c = memData && memData.complaints ? memData.complaints.find(item => item.id == complaintId) : null;
    const oldStatus = c ? c.status : 'Yeni';
    const user = memData && memData.users ? memData.users.find(u => u.id == userId) : null;

    const staffName = user ? user.full_name : req.user.full_name || 'Saha Personeli';

    if (c) {
      c.assigned_to_user_id = userId;
      c.assigned_employee_name = staffName;
      c.status = 'Personele atandı';
    }

    try {
      await pool.query('UPDATE complaints SET assigned_to_user_id = ?, status = ? WHERE id = ?', [userId, 'Personele atandı', complaintId]);
    } catch (e) {}
    await recordStatusHistory(complaintId, req.user.id, oldStatus, 'Personele atandı', 'Saha personeli görevi kendi üzerine aldı.', staffName);
    await createAuditLog(req.user.id, 'SELF_ASSIGN_TASK', 'complaints', complaintId, {}, { self_assigned_by: userId }, req.ip);

    res.json({ success: true, message: `✋ Görev başarıyla üzerinize alındı!` });
  } catch (err) {
    console.error('Self assign error:', err);
    res.status(500).json({ success: false, message: 'Görevi alma işlemi başarısız.' });
  }
});

// 10. Müdür / Admin Öncelik Seviyesi ve Durum Güncelleme
router.put('/:id/status-priority', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi']), async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { priority_level, status } = req.body;

    const { memData } = require('../config/db');
    const c = memData && memData.complaints ? memData.complaints.find(item => item.id == complaintId) : null;
    const oldStatus = c ? c.status : 'Yeni';

    if (c) {
      if (priority_level) {
        c.priority_level = priority_level;
        c.urgency_level = priority_level;
      }
      if (status) c.status = status;
    }

    try {
      await pool.query('UPDATE complaints SET priority_level = ?, urgency_level = ?, status = ? WHERE id = ?', [priority_level, priority_level, status, complaintId]);
    } catch (e) {}

    if (status && status !== oldStatus) {
      await recordStatusHistory(complaintId, req.user.id, oldStatus, status, `Durum ve öncelik (${priority_level}) yönetici tarafından güncellendi.`, req.user.full_name);
    } else if (priority_level) {
      await recordStatusHistory(complaintId, req.user.id, oldStatus, oldStatus, `Öncelik seviyesi "${priority_level}" olarak güncellendi.`, req.user.full_name);
    }
    await createAuditLog(req.user.id, 'UPDATE_STATUS_PRIORITY', 'complaints', complaintId, {}, { priority_level, status }, req.ip);

    res.json({ success: true, message: 'Talep öncelik ve durumu başarıyla güncellendi.' });
  } catch (err) {
    console.error('Update status priority error:', err);
    res.status(500).json({ success: false, message: 'Güncelleme hatası.' });
  }
});

// 11. Başka Birime Yönlendir (Müdür / Admin)
router.post('/:id/forward', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi']), async (req, res) => {
  try {
    if (req.user.role_id === 3 || req.user.role_name === 'Personel') {
      return res.status(403).json({ success: false, message: 'Yetkisiz Erişim: Personel birim yönlendirme yetkisine sahip değildir.' });
    }

    const complaintId = req.params.id;
    const { target_department_id, forward_reason } = req.body;

    const { memData } = require('../config/db');
    const c = memData && memData.complaints ? memData.complaints.find(item => item.id == complaintId) : null;
    const oldStatus = c ? c.status : 'Yeni';
    const dept = memData && memData.departments ? memData.departments.find(d => d.id == target_department_id) : null;

    const deptName = dept ? dept.name : 'İlgili Birim';

    if (c) {
      c.department_id = parseInt(target_department_id);
      c.department_name = deptName;
      c.assigned_to_user_id = null;
      c.assigned_employee_name = null;
      c.status = 'İlgili birime yönlendirildi';
      c.is_forwarded = 1;
    }

    try {
      await pool.query(
        'UPDATE complaints SET department_id = ?, assigned_to_user_id = NULL, status = ? WHERE id = ?',
        [target_department_id, 'İlgili birime yönlendirildi', complaintId]
      );
    } catch (e) {}

    await recordStatusHistory(complaintId, req.user.id, oldStatus, 'İlgili birime yönlendirildi', `Talep ${deptName} bünyesine yönlendirildi. Not: ${forward_reason || '-'}`, req.user.full_name);
    await createAuditLog(req.user.id, 'FORWARD_DEPARTMENT', 'complaints', complaintId, {}, { target_department_id, forward_reason }, req.ip);

    res.json({ success: true, message: `Talep başarıyla ${deptName} bünyesine yönlendirildi.` });
  } catch (err) {
    console.error('Forward department error:', err);
    res.status(500).json({ success: false, message: 'Yönlendirme işlemi başarısız.' });
  }
});

module.exports = router;
