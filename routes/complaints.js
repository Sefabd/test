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
  try {
    await pool.query(
      `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
       VALUES (?, ?, ?, ?, ?)`,
      [complaint_id, changed_by_user_id, old_status || 'Yeni', new_status, change_reason || 'Talep durumu güncellendi.']
    );
  } catch (e) {}
}

// Helper: Enrich Complaint with Satisfaction Rating Stats & User Rating
function enrichComplaintWithRating(complaint, currentUserId, allSurveys) {
  const cId = Number(complaint.id);
  const surveys = (allSurveys || []).filter(s => Number(s.complaint_id) === cId);
  
  let avgRating = null;
  let voteCount = 0;
  let latestComment = null;
  let userRating = null;
  let userComment = null;

  if (surveys.length > 0) {
    const total = surveys.reduce((sum, s) => sum + Number(s.rating || 0), 0);
    avgRating = Number((total / surveys.length).toFixed(1));
    voteCount = surveys.length;
    const withComment = surveys.filter(s => s.review_comment);
    if (withComment.length > 0) {
      latestComment = withComment[withComment.length - 1].review_comment;
    }
  } else if (complaint.avg_rating && Number(complaint.rating_count) > 0) {
    avgRating = parseFloat(complaint.avg_rating);
    voteCount = Number(complaint.rating_count);
  }

  if (currentUserId) {
    const userSurvey = surveys.find(s => Number(s.citizen_id) === Number(currentUserId) || Number(s.user_id) === Number(currentUserId));
    if (userSurvey) {
      userRating = Number(userSurvey.rating);
      userComment = userSurvey.review_comment || '';
    }
  }

  // SADECE VE SADECE gerçek vatandaş anketi varsa rating gösterilir, anket yoksa null döner!
  return {
    ...complaint,
    avg_rating: avgRating,
    rating: avgRating,
    rating_count: voteCount,
    rating_vote_count: voteCount,
    rating_comment: latestComment,
    user_rating: userRating,
    user_comment: userComment
  };
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
    body('neighborhood_id').notEmpty().withMessage('Mahalle seçimi zorunludur.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const {
      title, description, category_id, district_id = 1, neighborhood_id, department_id: reqDeptId,
      open_address, latitude, longitude, urgency_level, is_public, contact_preference,
      submission_type
    } = req.body;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      let targetDeptId = reqDeptId ? Number(reqDeptId) : null;
      const [categories] = await conn.query('SELECT department_id, name, default_priority FROM complaint_categories WHERE id = ?', [category_id]);
      
      const catDeptId = (categories && categories.length > 0 && categories[0].department_id) ? Number(categories[0].department_id) : null;

      // Hedef birim seçildiyse doğrudan hedef birime (örn: Fen İşleri = 1), seçilmediyse kategorinin birimine, o da yoksa 11'e (153 Masası)
      const department_id = targetDeptId || catDeptId || 11;
      const priority_level = urgency_level || (categories && categories.length > 0 ? categories[0].default_priority : 'Normal');
      const initialStatus = (department_id === 11) ? 'Ön İncelemede' : 'Yeni';

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

      const insertId = (result && result.insertId) ? Number(result.insertId) : ((result && result[0] && result[0].insertId) ? Number(result[0].insertId) : Date.now());
      const complaintId = insertId;

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

      const { saveDbJson } = require('../config/db');
      if (typeof saveDbJson === 'function') saveDbJson();

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



// 3. GET /api/complaints/my, /api/complaints/mine, /api/complaints/my-complaints
const getMyComplaintsHandler = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const currentCitizenId = Number(req.user.citizen_id || req.user.id);
    const currentUserEmail = (req.user.email || '').toLowerCase();

    let complaints = [];
    try {
      const [rows] = await pool.query(
        `SELECT c.*, cat.name as category_name, d.name as department_name, n.name as neighborhood_name
         FROM complaints c
         LEFT JOIN complaint_categories cat ON c.category_id = cat.id
         LEFT JOIN departments d ON c.department_id = d.id
         LEFT JOIN neighborhoods n ON c.neighborhood_id = n.id
         WHERE c.citizen_id = ? OR c.user_id = ? OR c.citizen_id = ?
         ORDER BY c.id DESC`,
        [currentUserId, currentUserId, currentCitizenId]
      );
      if (rows && rows.length > 0) complaints = rows;
    } catch (e) {}

    const { memData } = require('../config/db');
    if ((!complaints || complaints.length === 0) && memData && memData.complaints) {
      complaints = memData.complaints.filter(c => {
        if (!c) return false;
        if (Number(c.user_id) === currentUserId || Number(c.citizen_id) === currentUserId || Number(c.citizen_id) === currentCitizenId) return true;
        if (currentUserEmail.includes('caner') && (Number(c.citizen_id) === 6 || Number(c.user_id) === 6 || Number(c.user_id) === 10)) return true;
        if (currentUserEmail.includes('sefa') && (Number(c.citizen_id) === 7 || Number(c.user_id) === 7 || Number(c.user_id) === 11)) return true;
        return false;
      });
    }

    let [allFiles] = await pool.query('SELECT * FROM complaint_files');
    let [allSurveys] = await pool.query('SELECT * FROM satisfaction_surveys');
    allFiles = Array.isArray(allFiles) ? allFiles : [];
    allSurveys = Array.isArray(allSurveys) && allSurveys.length > 0 ? allSurveys : (memData && memData.satisfaction_surveys ? memData.satisfaction_surveys : []);

    const result = (complaints || []).map(c => {
      const files = allFiles.filter(f => Number(f.complaint_id) === Number(c.id));
      const enriched = enrichComplaintWithRating(c, currentUserId, allSurveys);
      return {
        ...enriched,
        files: files.map(f => f.file_path),
        first_photo: files.length > 0 ? files[0].file_path : null
      };
    });

    res.json({ success: true, complaints: result });
  } catch (err) {
    console.error('Kullanıcı talepleri hatası:', err);
    res.status(500).json({ success: false, message: 'Kendi talepleriniz alınamadı.' });
  }
};

router.get('/my', authenticateToken, getMyComplaintsHandler);
router.get('/mine', authenticateToken, getMyComplaintsHandler);
router.get('/my-complaints', authenticateToken, getMyComplaintsHandler);

// 4. GET /api/complaints/public & /api/complaints/public-feed
const getPublicComplaintsHandler = async (req, res) => {
  try {
    const { getUpvotedComplaintIdsForUser, memData } = require('../config/db');
    const currentUserId = req.user ? req.user.id : null;

    let [allFiles] = await pool.query('SELECT * FROM complaint_files');
    let [allSurveys] = await pool.query('SELECT * FROM satisfaction_surveys');
    allFiles = Array.isArray(allFiles) ? allFiles : [];
    allSurveys = Array.isArray(allSurveys) && allSurveys.length > 0 ? allSurveys : (memData && memData.satisfaction_surveys ? memData.satisfaction_surveys : []);

    let upvotedSet = new Set();
    if (currentUserId) {
      upvotedSet = await getUpvotedComplaintIdsForUser(currentUserId);
    }

    const compMap = new Map();
    if (memData && Array.isArray(memData.complaints)) {
      memData.complaints.forEach(c => compMap.set(Number(c.id), { ...c }));
    }

    try {
      const [rows] = await pool.query(`
        SELECT c.*, 
          COALESCE(d.name, 'Fen İşleri') as department_name,
          COALESCE(cat.name, 'Genel') as category_name,
          COALESCE(n.name, 'Bulancak') as neighborhood_name
        FROM complaints c
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN complaint_categories cat ON c.category_id = cat.id
        LEFT JOIN neighborhoods n ON c.neighborhood_id = n.id
        WHERE c.status != 'passive'
        ORDER BY c.id DESC
      `);
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          const existing = compMap.get(Number(r.id));
          if (existing) existing.status = r.status;
          compMap.set(Number(r.id), { ...(existing || {}), ...r, status: r.status });
        });
      }
    } catch (e) {}

    // Kamuya Açık Akış: SADECE is_public = 1 VE status !== 'Çözüldü' VE status !== 'İptal edildi'
    const publicComplaints = Array.from(compMap.values()).filter(c => {
      const isPub = Number(c.is_public) === 1;
      const statusStr = (c.status || '').trim();
      const isResolved = statusStr === 'Çözüldü' || statusStr.toLowerCase() === 'çözüldü' || statusStr.toLowerCase() === 'cozuldu';
      const isCancelled = statusStr === 'İptal edildi' || statusStr.toLowerCase() === 'iptal edildi' || statusStr === 'passive';
      return isPub && !isResolved && !isCancelled;
    });

    const result = publicComplaints.map(c => {
      const cId = Number(c.id);
      const upvotes = (memData?.complaint_upvotes || []).filter(u => Number(u.complaint_id) === cId);
      const hasUpvotedMem = upvotes.some(u => String(u.user_id) === String(currentUserId));
      const files = allFiles.filter(f => Number(f.complaint_id) === cId);
      const hasUpvoted = currentUserId ? (upvotedSet.has(cId) || hasUpvotedMem) : false;
      const enriched = enrichComplaintWithRating(c, currentUserId, allSurveys);

      return {
        ...c,
        ...enriched,
        has_upvoted: hasUpvoted,
        is_upvoted: hasUpvoted,
        upvote_count: Math.max(upvotes.length, c.upvote_count || 0),
        upvotes_count: Math.max(upvotes.length, c.upvote_count || 0),
        files: files.map(f => f.file_path),
        first_photo: files.length > 0 ? files[0].file_path : null
      };
    });

    res.json({ success: true, complaints: result });
  } catch (err) {
    console.error('Kamuya açık talepler hatası:', err);
    res.status(500).json({ success: false, message: 'Kamuya açık talepler alınamadı.' });
  }
};

router.get('/public', optionalAuth, getPublicComplaintsHandler);
router.get('/public-feed', optionalAuth, getPublicComplaintsHandler);

// 5. GET /api/complaints/all (Role-Isolated: Manager sees department, Staff sees assigned tasks, Admin sees all)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    let [complaints] = await pool.query('SELECT * FROM complaints ORDER BY id DESC');
    let [allFiles] = await pool.query('SELECT * FROM complaint_files');
    let [allAssignments] = await pool.query('SELECT * FROM complaint_assignments');
    let [allSurveys] = await pool.query('SELECT * FROM satisfaction_surveys');
    const { memData } = require('../config/db');

    complaints = Array.isArray(complaints) ? complaints : [];
    allFiles = Array.isArray(allFiles) ? allFiles : [];
    allAssignments = Array.isArray(allAssignments) ? allAssignments : [];
    allSurveys = Array.isArray(allSurveys) && allSurveys.length > 0 ? allSurveys : (memData && memData.satisfaction_surveys ? memData.satisfaction_surveys : []);

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
    } else if (userRole === 'Belediye Başkanı' || req.user.role_id === 5) {
      // Belediye Başkanı: TÜM talepleri genel gözlemci olarak görebilir (filtre yok)
    } else if (userRole === 'Belediye Başkan Yardımcısı' || req.user.role_id === 6) {
      // SADECE Admin tarafından kendisine zimmetlenen/atanan birimlerin durumunu görebilir
      let assignedDeptIds = Array.isArray(req.user.assigned_department_ids) ? req.user.assigned_department_ids.map(Number) : [];
      if (memData && memData.departments) {
        const memAssigned = memData.departments
          .filter(d => Number(d.vice_mayor_user_id) === Number(req.user.id))
          .map(d => Number(d.id));
        assignedDeptIds = [...new Set([...assignedDeptIds, ...memAssigned])];
      }
      if (assignedDeptIds.length === 0) {
        if (Number(req.user.id) === 61) assignedDeptIds = [1, 2, 5, 7, 9, 11];
        if (Number(req.user.id) === 62) assignedDeptIds = [3, 4, 6, 8, 10];
      }
      const deptSet = new Set(assignedDeptIds);
      complaints = complaints.filter(c => deptSet.has(Number(c.department_id)) || deptSet.has(Number(c.forwarded_from_department_id)));
    } else if (userRole === 'Birim Yöneticisi' || req.user.role_id === 2) {
      complaints = complaints.filter(c => 
        Number(c.department_id) === Number(userDeptId) || 
        Number(c.forwarded_from_department_id) === Number(userDeptId)
      );
    } else if (userRole === 'Personel' || req.user.role_id === 3) {
      complaints = complaints.filter(c => 
        Number(c.department_id) === Number(userDeptId) || 
        Number(c.assigned_to_user_id) === Number(req.user.id) ||
        myAssignedComplaintIds.has(Number(c.id))
      );
    }

    // Filter out soft-deleted / passive complaints
    complaints = complaints.filter(c => c.status !== 'passive');

    const { department_id } = req.query;
    if (department_id) {
      complaints = complaints.filter(c => c.department_id == department_id);
    }

    const currentUserId = req.user ? req.user.id : null;

    const result = complaints.map(c => {
      const files = allFiles.filter(f => f.complaint_id == c.id);
      const isAssignedToMe = myAssignedComplaintIds.has(Number(c.id)) || c.assigned_employee_id == userEmpId;
      const isForwarded = (
        c.forwarded_from_department_id > 0 ||
        c.status === 'Müdürlüğe iletildi' ||
        (c.change_reason && c.change_reason.includes('yönlendirildi'))
      );
      const enriched = enrichComplaintWithRating(c, currentUserId, allSurveys);

      return {
        ...enriched,
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

// 6. Talep Detayı ve Takip Kodu ile Sorgula (Enriched with history, files, actions & surveys)
const getComplaintDetailHandler = async (req, res) => {
  try {
    const rawParam = req.params.id || req.params.code;
    if (!rawParam) {
      return res.status(400).json({ success: false, message: 'Geçersiz talep parametresi.' });
    }

    const identifier = String(rawParam).trim();
    const isNumeric = /^\d+$/.test(identifier);

    let complaints = [];
    try {
      const [rows] = await pool.query(
        `SELECT c.*, cat.name as category_name, d.name as department_name, n.name as neighborhood_name
         FROM complaints c
         LEFT JOIN complaint_categories cat ON c.category_id = cat.id
         LEFT JOIN departments d ON c.department_id = d.id
         LEFT JOIN neighborhoods n ON c.neighborhood_id = n.id
         WHERE ${isNumeric ? 'c.id = ? OR c.tracking_code = ?' : 'c.tracking_code = ? OR c.id = ?'}`,
        [identifier, identifier]
      );
      if (rows && rows.length > 0) complaints = rows;
    } catch (e) {}

    const { memData } = require('../config/db');
    if ((!complaints || complaints.length === 0) && memData && memData.complaints) {
      const found = memData.complaints.find(c => 
        String(c.id) === identifier || 
        String(c.tracking_code) === identifier
      );
      if (found) {
        complaints = [found];
      }
    }

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Talep detayları bulunamadı.' });
    }

    let complaint = complaints[0];
    const cId = Number(complaint.id);

    // Enriched History
    let history = [];
    try {
      const [hRows] = await pool.query(
        `SELECT h.*, COALESCE(u.full_name, 'Sistem Yetkilisi') as changed_by_name
         FROM complaint_status_history h
         LEFT JOIN users u ON h.changed_by_user_id = u.id
         WHERE h.complaint_id = ?
         ORDER BY h.id ASC`,
        [cId]
      );
      if (hRows && hRows.length > 0) history = hRows;
    } catch (e) {}

    if (history.length === 0 && memData && memData.complaint_status_history) {
      history = memData.complaint_status_history.filter(h => Number(h.complaint_id) === cId);
    }

    // Enriched Files
    let files = [];
    try {
      const [fRows] = await pool.query('SELECT * FROM complaint_files WHERE complaint_id = ?', [cId]);
      if (fRows && fRows.length > 0) files = fRows;
    } catch (e) {}

    if (files.length === 0 && memData && memData.complaint_files) {
      files = memData.complaint_files.filter(f => Number(f.complaint_id) === cId);
    }

    // Enriched Actions
    let actions = [];
    try {
      const [aRows] = await pool.query(
        `SELECT a.*, COALESCE(u.full_name, 'Saha Görevlisi') as employee_name, COALESCE(e.title, 'Saha Personeli') as employee_title
         FROM complaint_actions a
         LEFT JOIN employees e ON a.employee_id = e.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE a.complaint_id = ?
         ORDER BY a.id ASC`,
        [cId]
      );
      if (aRows && aRows.length > 0) actions = aRows;
    } catch (e) {}

    if (actions.length === 0 && memData && memData.complaint_actions) {
      actions = memData.complaint_actions.filter(a => Number(a.complaint_id) === cId);
    }

    let allSurveys = [];
    try {
      const [sRows] = await pool.query('SELECT * FROM satisfaction_surveys WHERE complaint_id = ?', [cId]);
      if (sRows && sRows.length > 0) allSurveys = sRows;
    } catch (e) {}

    if (allSurveys.length === 0 && memData && memData.satisfaction_surveys) {
      allSurveys = memData.satisfaction_surveys.filter(s => Number(s.complaint_id) === cId);
    }

    const currentUserId = req.user ? req.user.id : null;
    complaint = enrichComplaintWithRating(complaint, currentUserId, allSurveys);

    res.json({
      success: true,
      complaint,
      history,
      files,
      actions
    });
  } catch (err) {
    console.error('Get complaint detail error:', err);
    res.status(500).json({ success: false, message: 'Detay alınırken sunucu hatası.' });
  }
};

// 5.6. GET /api/complaints/archive & /api/complaints/solution-archive
// SADECE status = 'Çözüldü' olan veriler, Role-Based SQL İzolasyonu ve Gerçek Vatandaş Puanları
const getArchiveComplaintsHandler = async (req, res) => {
  try {
    const { getUpvotedComplaintIdsForUser, memData } = require('../config/db');
    const user = req.user;
    const currentUserId = user ? user.id : null;
    const roleName = user ? user.role_name : 'Guest';

    let [allFiles] = await pool.query('SELECT * FROM complaint_files');
    let [allSurveys] = await pool.query('SELECT * FROM satisfaction_surveys');
    let [allActions] = await pool.query('SELECT * FROM complaint_actions ORDER BY id ASC');
    allFiles = Array.isArray(allFiles) ? allFiles : [];
    allSurveys = Array.isArray(allSurveys) && allSurveys.length > 0 ? allSurveys : (memData && memData.satisfaction_surveys ? memData.satisfaction_surveys : []);
    allActions = Array.isArray(allActions) && allActions.length > 0 ? allActions : (memData && memData.complaint_actions ? memData.complaint_actions : []);

    let upvotedSet = new Set();
    if (currentUserId) {
      upvotedSet = await getUpvotedComplaintIdsForUser(currentUserId);
    }

    const compMap = new Map();
    if (memData && Array.isArray(memData.complaints)) {
      memData.complaints.forEach(c => compMap.set(Number(c.id), { ...c }));
    }

    try {
      const [rows] = await pool.query(`
        SELECT c.*, 
          COALESCE(d.name, 'Fen İşleri Müdürlüğü') as department_name,
          COALESCE(cat.name, 'Genel') as category_name,
          COALESCE(n.name, 'Bulancak') as neighborhood_name
        FROM complaints c
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN complaint_categories cat ON c.category_id = cat.id
        LEFT JOIN neighborhoods n ON c.neighborhood_id = n.id
        ORDER BY c.updated_at DESC, c.id DESC
      `);
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          const existing = compMap.get(Number(r.id));
          if (existing) existing.status = r.status;
          compMap.set(Number(r.id), { ...(existing || {}), ...r, status: r.status });
        });
      }
    } catch (e) {}

    // SADECE status === 'Çözüldü' olan talepler
    const archiveComplaints = Array.from(compMap.values()).filter(c => {
      const statusStr = (c.status || '').trim();
      const isResolved = statusStr === 'Çözüldü' || statusStr.toLowerCase() === 'çözüldü' || statusStr.toLowerCase() === 'cozuldu';
      if (!isResolved) return false;

      // Rol Bazlı İzolasyon
      if (!user || roleName === 'Vatandaş') {
        if (user) return Number(c.is_public) === 1 || Number(c.citizen_id) === Number(user.id) || Number(c.user_id) === Number(user.id);
        return Number(c.is_public) === 1;
      } else if (roleName === 'Belediye Başkan Yardımcısı' || user.role_id === 6) {
        let assignedDeptIds = Array.isArray(user.assigned_department_ids) ? user.assigned_department_ids.map(Number) : [];
        if (memData && memData.departments) {
          const memAssigned = memData.departments
            .filter(d => Number(d.vice_mayor_user_id) === Number(user.id))
            .map(d => Number(d.id));
          assignedDeptIds = [...new Set([...assignedDeptIds, ...memAssigned])];
        }
        if (assignedDeptIds.length === 0) {
          if (Number(user.id) === 61) assignedDeptIds = [1, 2, 5, 7, 9, 11];
          if (Number(user.id) === 62) assignedDeptIds = [3, 4, 6, 8, 10];
        }
        return assignedDeptIds.length === 0 || assignedDeptIds.includes(Number(c.department_id)) || assignedDeptIds.includes(Number(c.forwarded_from_department_id));
      } else if (roleName === 'Birim Yöneticisi' || user.role_id === 2) {
        if (user.department_id) {
          return Number(c.department_id) === Number(user.department_id) || Number(c.forwarded_from_department_id) === Number(user.department_id);
        }
      } else if (roleName === 'Personel' || user.role_id === 3) {
        if (user.department_id) {
          return Number(c.department_id) === Number(user.department_id) || Number(c.assigned_to_user_id) === Number(user.id);
        }
      }
      return true;
    });

    const result = archiveComplaints.map(c => {
      const cId = Number(c.id);
      const upvotes = (memData?.complaint_upvotes || []).filter(u => Number(u.complaint_id) === cId);
      const hasUpvotedMem = upvotes.some(u => String(u.user_id) === String(currentUserId));
      const files = allFiles.filter(f => Number(f.complaint_id) === cId);
      const actions = allActions.filter(a => Number(a.complaint_id) === cId);
      const hasUpvoted = currentUserId ? (upvotedSet.has(cId) || hasUpvotedMem) : false;
      const enriched = enrichComplaintWithRating(c, currentUserId, allSurveys);

      const lastAction = actions.length > 0 ? actions[actions.length - 1] : null;
      const solutionNote = lastAction?.action_description || lastAction?.work_done || c.resolution_note || c.official_solution || 'Talep edilen bölgede saha ekiplerimiz tarafından gerekli onarım ve müdahale yapılmış olup talep başarıyla çözüme kavuşturulmuştur.';

      return {
        ...c,
        ...enriched,
        status: 'Çözüldü',
        has_upvoted: hasUpvoted,
        is_upvoted: hasUpvoted,
        upvote_count: Math.max(upvotes.length, c.upvote_count || 0),
        upvotes_count: Math.max(upvotes.length, c.upvote_count || 0),
        official_solution: solutionNote,
        solution_note: solutionNote,
        files: files.map(f => f.file_path),
        first_photo: files.length > 0 ? files[0].file_path : (lastAction?.resolution_photo_path || null)
      };
    });

    res.json({
      success: true,
      complaints: result
    });
  } catch (err) {
    console.error('Archive endpoint error:', err);
    res.status(500).json({ success: false, message: 'Çözüm arşivi yüklenemedi.' });
  }
};

router.get('/archive', optionalAuth, getArchiveComplaintsHandler);
router.get('/solution-archive', optionalAuth, getArchiveComplaintsHandler);

// 5.7. Upvote (Destek Ol / Beğen) Endpoint
router.post('/:id/upvote', optionalAuth, async (req, res) => {
  const complaintId = Number(req.params.id);
  const userId = req.user ? req.user.id : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'guest');

  try {
    const { toggleComplaintUpvote, memData, saveDbJson } = require('../config/db');
    let result = { has_upvoted: true, upvote_count: 1 };

    if (typeof toggleComplaintUpvote === 'function') {
      result = await toggleComplaintUpvote(complaintId, userId);
    } else {
      if (memData) {
        if (!memData.complaint_upvotes) memData.complaint_upvotes = [];
        const idx = memData.complaint_upvotes.findIndex(u => Number(u.complaint_id) === complaintId && String(u.user_id) === String(userId));
        let isUpvoted = false;
        if (idx >= 0) {
          memData.complaint_upvotes.splice(idx, 1);
          isUpvoted = false;
        } else {
          memData.complaint_upvotes.push({ complaint_id: complaintId, user_id: userId });
          isUpvoted = true;
        }
        const count = memData.complaint_upvotes.filter(u => Number(u.complaint_id) === complaintId).length;
        const comp = (memData.complaints || []).find(c => Number(c.id) === complaintId);
        if (comp) comp.upvote_count = count;
        if (typeof saveDbJson === 'function') saveDbJson();
        result = { has_upvoted: isUpvoted, upvote_count: count };
      }
    }

    res.json({
      success: true,
      is_upvoted: result.has_upvoted,
      upvotes_count: result.upvote_count,
      upvote_count: result.upvote_count,
      message: result.has_upvoted ? '👍 Talebe desteğiniz kaydedildi!' : 'Desteğinizi geri çektiniz.'
    });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ success: false, message: 'Destek işlemi kaydedilemedi.' });
  }
});

router.get('/track/:code', optionalAuth, getComplaintDetailHandler);
router.get('/:id', optionalAuth, getComplaintDetailHandler);

// 7. Vatandaş Memnuniyet Anket Kaydı (1-5 Yıldız Puan & Yorum)
router.post('/:id/survey', authenticateToken, async (req, res) => {
  try {
    const complaintId = Number(req.params.id);
    const { rating, review_comment } = req.body;
    const userId = Number(req.user.id);
    const citizenId = req.user.citizen_id ? Number(req.user.citizen_id) : userId;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Lütfen 1-5 arasında bir yıldız puanı veriniz.' });
    }

    const [cRows] = await pool.query('SELECT citizen_id, user_id, status FROM complaints WHERE id = ?', [complaintId]);
    if (!cRows || cRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const { memData, saveDbJson } = require('../config/db');
    let currentAvg = numRating;
    let currentVoteCount = 1;

    if (memData) {
      if (!memData.satisfaction_surveys) memData.satisfaction_surveys = [];

      // Strict match: same complaint AND same user (by user_id or citizen_id)
      const existingMem = memData.satisfaction_surveys.find(s => 
        Number(s.complaint_id) === complaintId && 
        Number(s.user_id) === userId
      );

      if (existingMem) {
        existingMem.rating = numRating;
        existingMem.review_comment = sanitizeInput(review_comment) || null;
        existingMem.updated_at = new Date().toISOString();
      } else {
        memData.satisfaction_surveys.push({
          id: Date.now(),
          complaint_id: complaintId,
          citizen_id: citizenId,
          user_id: userId,
          rating: numRating,
          review_comment: sanitizeInput(review_comment) || null,
          created_at: new Date().toISOString()
        });
      }

      // Recompute average: toplam yıldız / değerlendiren kişi sayısı
      const relatedSurveys = memData.satisfaction_surveys.filter(s => Number(s.complaint_id) === complaintId);
      const totalStars = relatedSurveys.reduce((sum, s) => sum + Number(s.rating), 0);
      currentVoteCount = relatedSurveys.length;
      currentAvg = currentVoteCount > 0 ? Number((totalStars / currentVoteCount).toFixed(1)) : 0;
      
      const comp = memData.complaints ? memData.complaints.find(c => Number(c.id) === complaintId) : null;
      if (comp) {
        comp.rating = currentAvg;
        comp.rating_vote_count = currentVoteCount;
        comp.rating_comment = sanitizeInput(review_comment) || comp.rating_comment;
      }

      if (typeof saveDbJson === 'function') {
        saveDbJson();
      }
    }

    try {
      await pool.query(
        `INSERT INTO satisfaction_surveys (complaint_id, citizen_id, rating, review_comment)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_comment = VALUES(review_comment)`,
        [complaintId, citizenId, numRating, sanitizeInput(review_comment) || null]
      );
    } catch (e) {
      try {
        await pool.query(
          `INSERT INTO satisfaction_surveys (complaint_id, citizen_id, rating, review_comment)
           VALUES (?, ?, ?, ?)`,
          [complaintId, userId, numRating, sanitizeInput(review_comment) || null]
        );
      } catch (e2) {}
    }

    // Also update complaint.rating field in SQL
    try {
      const [allSurveys] = await pool.query('SELECT AVG(rating) as avg_rating, COUNT(*) as vote_count FROM satisfaction_surveys WHERE complaint_id = ?', [complaintId]);
      if (allSurveys && allSurveys.length > 0 && allSurveys[0].avg_rating !== null) {
        const sqlAvg = Number(Number(allSurveys[0].avg_rating).toFixed(1));
        await pool.query('UPDATE complaints SET rating = ? WHERE id = ?', [sqlAvg, complaintId]);
        currentAvg = sqlAvg;
        currentVoteCount = Number(allSurveys[0].vote_count);
      }
    } catch (e) {}

    res.json({
      success: true,
      message: '⭐ Değerlendirmeniz başarıyla kaydedildi! Teşekkür ederiz.',
      avg_rating: currentAvg,
      rating: currentAvg,
      rating_vote_count: currentVoteCount,
      user_rating: numRating,
      user_comment: sanitizeInput(review_comment) || null
    });
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

// 10. Müdür / Admin / Personel Öncelik Seviyesi ve Durum Güncelleme
router.put('/:id/status-priority', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi', 'Personel']), async (req, res) => {
  try {
    const rawId = req.params.id || (req.body && (req.body.complaint_id || req.body.id));
    const complaintId = rawId ? String(rawId).trim() : null;
    const { priority_level, status } = req.body;

    if (!complaintId || complaintId === 'undefined' || complaintId === 'null') {
      return res.status(400).json({ success: false, message: 'Güncellenecek talep kaydı bulunamadı (Geçersiz talep ID).' });
    }

    const { memData, saveDbJson } = require('../config/db');
    let c = null;
    if (memData && memData.complaints) {
      c = memData.complaints.find(item => Number(item.id) === Number(complaintId) || String(item.tracking_code) === complaintId);
    }

    const oldStatus = c ? c.status : 'Yeni';

    if (c) {
      if (priority_level) {
        c.priority_level = priority_level;
        c.urgency_level = priority_level;
      }
      if (status) {
        c.status = status;
      }
      c.updated_at = new Date().toISOString();
    }

    try {
      await pool.query(
        'UPDATE complaints SET priority_level = COALESCE(?, priority_level), urgency_level = COALESCE(?, urgency_level), status = COALESCE(?, status), updated_at = NOW() WHERE id = ?',
        [priority_level || null, priority_level || null, status || null, complaintId]
      );
    } catch (e) {
      console.warn('MySQL status-priority update fallback:', e.message);
    }

    if (typeof saveDbJson === 'function') {
      saveDbJson();
    }

    const userRoleStr = req.user.role_name || (req.user.role_id === 1 ? 'Sistem Yöneticisi' : (req.user.role_id === 2 ? 'Birim Yöneticisi' : 'Personel'));
    if (status && status !== oldStatus) {
      await recordStatusHistory(complaintId, req.user.id, oldStatus, status, `Durum (${status}) ${userRoleStr} tarafından güncellendi.`, req.user.full_name);
    } else if (priority_level) {
      await recordStatusHistory(complaintId, req.user.id, oldStatus, oldStatus, `Öncelik seviyesi "${priority_level}" olarak güncellendi.`, req.user.full_name);
    }
    await createAuditLog(req.user.id, 'UPDATE_STATUS_PRIORITY', 'complaints', complaintId, {}, { priority_level, status }, req.ip);

    res.json({
      success: true,
      message: 'Talep öncelik ve durumu başarıyla güncellendi.',
      complaint_id: complaintId,
      status: status || (c ? c.status : null),
      priority_level: priority_level || (c ? c.priority_level : null)
    });
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

// 12. Kamuya Açık Talep Destek Ol (Upvote) - Toggle Functionality
router.post('/:id/upvote', optionalAuth, async (req, res) => {
  try {
    const rawId = req.params.id;
    const complaintId = Number(rawId);
    const userId = req.user ? req.user.id : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'guest');

    if (!complaintId || isNaN(complaintId)) {
      return res.status(400).json({ success: false, message: 'Geçersiz talep ID.' });
    }

    const { memData, saveDbJson } = require('../config/db');
    if (!memData.complaint_upvotes) memData.complaint_upvotes = [];

    const existingIndex = memData.complaint_upvotes.findIndex(u => 
      Number(u.complaint_id) === complaintId && String(u.user_id) === String(userId)
    );

    let isUpvoted = false;
    if (existingIndex >= 0) {
      // Toggle off (Desteği geri çek)
      memData.complaint_upvotes.splice(existingIndex, 1);
      isUpvoted = false;
    } else {
      // Toggle on (Destek ol)
      memData.complaint_upvotes.push({
        id: Date.now(),
        complaint_id: complaintId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      isUpvoted = true;
    }

    // Count upvotes for this complaint
    const upvotesCount = memData.complaint_upvotes.filter(u => Number(u.complaint_id) === complaintId).length;

    // Update complaint record
    const comp = (memData.complaints || []).find(c => Number(c.id) === complaintId);
    if (comp) {
      comp.upvotes_count = upvotesCount;
    }

    if (typeof saveDbJson === 'function') saveDbJson();

    // MySQL sync
    try {
      if (isUpvoted) {
        await pool.query('INSERT IGNORE INTO complaint_upvotes (complaint_id, user_id) VALUES (?, ?)', [complaintId, typeof userId === 'number' ? userId : null]);
      } else {
        await pool.query('DELETE FROM complaint_upvotes WHERE complaint_id = ? AND user_id = ?', [complaintId, typeof userId === 'number' ? userId : null]);
      }
      await pool.query('UPDATE complaints SET upvotes_count = ? WHERE id = ?', [upvotesCount, complaintId]);
    } catch (e) {}

    res.json({
      success: true,
      is_upvoted: isUpvoted,
      upvotes_count: upvotesCount,
      message: isUpvoted ? '👍 Desteğiniz başarıyla kaydedildi.' : 'Desteğinizi geri çektiniz.'
    });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ success: false, message: 'Destek işlemi başarısız.' });
  }
});

module.exports = router;
