const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { upload, createAuditLog, sanitizeInput } = require('../middleware/security');

// 1. Birim Yöneticisi & Admin: Personele Görev Ataması
const assignTaskHandler = async (req, res) => {
  const { complaint_id, employee_id, assigned_to_user_id, task_description, instructions, due_date, priority_level } = req.body;
  const cId = Number(complaint_id);
  const targetStaffId = Number(assigned_to_user_id || employee_id);
  const taskDesc = sanitizeInput(instructions || task_description || 'Görev atandı.');

  if (!cId || isNaN(cId)) {
    return res.status(400).json({ success: false, message: 'Geçersiz talep numarası.' });
  }
  if (!targetStaffId || isNaN(targetStaffId)) {
    return res.status(400).json({ success: false, message: 'Lütfen atanacak personeli seçiniz.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [cRows] = await conn.query('SELECT tracking_code, title, department_id, status FROM complaints WHERE id = ?', [cId]);
    if (!cRows || cRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const { tracking_code, title: tTitle, department_id, status: oldStatus } = cRows[0];

    // Find user name for notification and history
    let assignedStaffName = 'Saha Personeli';
    const [uRows] = await conn.query('SELECT id, full_name, email FROM users WHERE id = ?', [targetStaffId]);
    if (uRows && uRows.length > 0) {
      assignedStaffName = uRows[0].full_name;
    }

    // Create / update Assignment record
    try {
      await conn.query(
        `INSERT INTO complaint_assignments (complaint_id, assigned_by_user_id, assigned_to_employee_id, department_id, task_description, due_date, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Atandı')`,
        [cId, req.user.id, targetStaffId, department_id, taskDesc, due_date || null]
      );
    } catch (e) {}

    // Update Complaint Status & Assigned User
    try {
      await conn.query(
        `UPDATE complaints SET status = 'Personele atandı', assigned_to_user_id = ?, updated_at = NOW() WHERE id = ?`,
        [targetStaffId, cId]
      );
    } catch (e) {
      await conn.query(
        `UPDATE complaints SET status = 'Personele atandı', updated_at = NOW() WHERE id = ?`,
        [cId]
      );
    }

    // Update Memory Cache
    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.complaints) {
      const compMem = memData.complaints.find(c => Number(c.id) === cId || String(c.tracking_code) === String(tracking_code));
      if (compMem) {
        compMem.status = 'Personele atandı';
        compMem.assigned_to_user_id = targetStaffId;
        compMem.assigned_employee_name = assignedStaffName;
        compMem.updated_at = new Date().toISOString();
      }
      if (typeof saveDbJson === 'function') saveDbJson();
    }

    // Status History Log
    try {
      await conn.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, ?, ?, 'Personele atandı', ?)`,
        [cId, req.user.id, oldStatus || 'Yeni', `Görev ${assignedStaffName} isimli personele atandı. (${taskDesc})`]
      );
    } catch (e) {}

    // Send Notification to Employee
    const { createSystemNotification } = require('../config/db');
    await createSystemNotification({
      user_id: targetStaffId,
      title: '📌 Yeni Görev Atandı',
      message: `[${tracking_code}] - "${tTitle}" talebi üzerinize atandı: ${taskDesc}`,
      type: 'Görev',
      reference_id: cId
    });

    await conn.commit();
    res.json({ success: true, message: `Görev başarıyla ${assignedStaffName} isimli personele atandı.` });
  } catch (err) {
    await conn.rollback();
    console.error('Atama hatası:', err);
    res.status(500).json({ success: false, message: 'Görev ataması yapılırken sunucu hatası oluştu.' });
  } finally {
    conn.release();
  }
};

router.post('/', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi']), assignTaskHandler);
router.post('/assign', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi']), assignTaskHandler);

// 2. Görev Atamasını Kaldırma (Unassign)
router.post('/unassign', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi']), async (req, res) => {
  const { complaint_id } = req.body;
  const cId = Number(complaint_id);

  if (!cId || isNaN(cId)) {
    return res.status(400).json({ success: false, message: 'Geçersiz talep numarası.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [cRows] = await conn.query('SELECT tracking_code, status, assigned_to_user_id FROM complaints WHERE id = ?', [cId]);
    if (!cRows || cRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const { tracking_code, status: oldStatus, assigned_to_user_id: oldAssigned } = cRows[0];
    const newStatus = 'İlgili birime yönlendirildi';

    try {
      await conn.query(
        `UPDATE complaints SET status = ?, assigned_to_user_id = NULL, updated_at = NOW() WHERE id = ?`,
        [newStatus, cId]
      );
    } catch (e) {
      await conn.query(`UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?`, [newStatus, cId]);
    }

    // Update In-Memory
    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.complaints) {
      const compMem = memData.complaints.find(c => Number(c.id) === cId || String(c.tracking_code) === String(tracking_code));
      if (compMem) {
        compMem.status = newStatus;
        compMem.assigned_to_user_id = null;
        compMem.assigned_employee_name = null;
        compMem.updated_at = new Date().toISOString();
      }
      if (typeof saveDbJson === 'function') saveDbJson();
    }

    // Status History Log
    try {
      await conn.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, ?, ?, ?, 'Görev ataması kaldırıldı.')`,
        [cId, req.user.id, oldStatus, newStatus]
      );
    } catch (e) {}

    // Notify previously assigned user if any
    if (oldAssigned) {
      const { createSystemNotification } = require('../config/db');
      await createSystemNotification({
        user_id: oldAssigned,
        title: 'ℹ️ Görev Ataması Kaldırıldı',
        message: `[${tracking_code}] numaralı talep üzerinizden kaldırıldı.`,
        type: 'Görev',
        reference_id: cId
      });
    }

    await conn.commit();
    res.json({ success: true, message: 'Görev ataması başarıyla kaldırıldı.' });
  } catch (err) {
    await conn.rollback();
    console.error('Unassign error:', err);
    res.status(500).json({ success: false, message: 'Görev ataması kaldırılırken hata oluştu.' });
  } finally {
    conn.release();
  }
});

// 3. Saha Personeli: Görevi Kendi Üzerine Alma (Self-Assign)
router.post('/self-assign', authenticateToken, checkRole(['Personel', 'Birim Yöneticisi', 'Sistem Yöneticisi']), async (req, res) => {
  const { complaint_id } = req.body;
  const cId = Number(complaint_id);

  if (!cId || isNaN(cId)) {
    return res.status(400).json({ success: false, message: 'Geçersiz talep numarası.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [cRows] = await conn.query('SELECT tracking_code, status FROM complaints WHERE id = ?', [cId]);
    if (!cRows || cRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const { tracking_code, status: oldStatus } = cRows[0];

    try {
      await conn.query(
        `UPDATE complaints SET status = 'Personele atandı', assigned_to_user_id = ?, updated_at = NOW() WHERE id = ?`,
        [req.user.id, cId]
      );
    } catch (e) {
      await conn.query(`UPDATE complaints SET status = 'Personele atandı', updated_at = NOW() WHERE id = ?`, [cId]);
    }

    // Update In-Memory
    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.complaints) {
      const compMem = memData.complaints.find(c => Number(c.id) === cId || String(c.tracking_code) === String(tracking_code));
      if (compMem) {
        compMem.status = 'Personele atandı';
        compMem.assigned_to_user_id = req.user.id;
        compMem.assigned_employee_name = req.user.full_name;
        compMem.updated_at = new Date().toISOString();
      }
      if (typeof saveDbJson === 'function') saveDbJson();
    }

    // Status History Log
    try {
      await conn.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, ?, ?, 'Personele atandı', ?)`,
        [cId, req.user.id, oldStatus || 'Yeni', `${req.user.full_name} görevi kendi üzerine aldı.`]
      );
    } catch (e) {}

    await conn.commit();
    res.json({ success: true, message: 'Görev başarıyla üzerinize alındı.' });
  } catch (err) {
    await conn.rollback();
    console.error('Self-assign error:', err);
    res.status(500).json({ success: false, message: 'Görev üzerinize alınırken hata oluştu.' });
  } finally {
    conn.release();
  }
});

// 4. Personel İşlem ve Çözüm Kaydı Ekleme (Çözüm Fotoğrafı Yükleme & Durum Güncelleme)
const actionHandler = async (req, res) => {
  const { complaint_id, action_description, work_done, tools_equipment_used, citizen_response, new_status = 'Çözüldü' } = req.body;
  let rawId = complaint_id || req.body.id;
  if (Array.isArray(rawId)) {
    rawId = rawId[0];
  }
  const complaintId = Number(rawId);

  if (!complaintId || isNaN(complaintId)) {
    return res.status(400).json({ success: false, message: 'Geçersiz şikayet / talep numarası.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let employeeId = req.user.employee_id;
    if (!employeeId) {
      try {
        const [empRows] = await conn.query('SELECT id FROM employees WHERE user_id = ? LIMIT 1', [req.user.id]);
        if (empRows && empRows.length > 0) {
          employeeId = empRows[0].id;
        }
      } catch (e) {}
    }
    if (!employeeId) {
      employeeId = req.user.id;
    }

    let currentStatus = 'Personele atandı';
    try {
      const [cRows] = await conn.query('SELECT status FROM complaints WHERE id = ?', [complaintId]);
      if (cRows && cRows.length > 0) {
        currentStatus = cRows[0].status;
      }
    } catch (e) {}

    let resolutionPhotoPath = null;
    if (req.file) {
      resolutionPhotoPath = 'uploads/' + req.file.filename;
    }

    // 1. ZORUNLU İŞLEM: complaints ana tablosundaki şikayetin status değerini YENİ DURUMLA UPDATE ET
    await conn.query('UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?', [new_status, complaintId]);

    // 2. Save Action Record in complaint_actions
    try {
      await conn.query(
        `INSERT INTO complaint_actions (complaint_id, employee_id, action_description, work_done, tools_equipment_used, citizen_response, resolution_photo_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          complaintId,
          employeeId,
          sanitizeInput(action_description),
          sanitizeInput(work_done) || null,
          sanitizeInput(tools_equipment_used) || null,
          sanitizeInput(citizen_response) || null,
          resolutionPhotoPath
        ]
      );
    } catch (e) {
      console.warn('Action insert SQL warning:', e.message);
    }

    // File entry if photo uploaded
    if (resolutionPhotoPath) {
      try {
        await conn.query(
          `INSERT INTO complaint_files (complaint_id, file_path, file_name, file_type, file_size, uploaded_by_user_id, file_category)
           VALUES (?, ?, ?, ?, ?, ?, 'Çözüm Görseli')`,
          [complaintId, resolutionPhotoPath, req.file.originalname, req.file.mimetype, req.file.size, req.user.id]
        );
      } catch (e) {}
    }

    // 3. Add History with real old_status in SQL
    try {
      await conn.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, ?, ?, ?, ?)`,
        [complaintId, req.user.id, currentStatus, new_status, sanitizeInput(action_description) || 'Çözüm çalışması tamamlandı.']
      );
    } catch (e) {}

    // 4. In-Memory Synchronizer & JSON Persistence (Bellek ve Disk Senkronizasyonu)
    const { memData, saveDbJson } = require('../config/db');
    if (memData) {
      if (!memData.complaint_actions) memData.complaint_actions = [];
      if (!memData.complaint_status_history) memData.complaint_status_history = [];

      const targetComp = (memData.complaints || []).find(c => Number(c.id) === complaintId || String(c.tracking_code) === String(complaint_id));
      if (targetComp) {
        targetComp.status = new_status;
        targetComp.updated_at = new Date().toISOString();
      }

      const actObj = {
        id: memData.complaint_actions.length + 1,
        complaint_id: complaintId,
        employee_id: employeeId,
        action_description: sanitizeInput(action_description),
        work_done: sanitizeInput(work_done) || null,
        tools_equipment_used: sanitizeInput(tools_equipment_used) || null,
        citizen_response: sanitizeInput(citizen_response) || null,
        resolution_photo_path: resolutionPhotoPath,
        employee_name: req.user.full_name || 'Saha Personeli',
        employee_title: req.user.employee_title || 'Saha Görevlisi',
        created_at: new Date().toISOString()
      };
      memData.complaint_actions.push(actObj);

      if (typeof saveDbJson === 'function') {
        saveDbJson();
      }
    }

    // Notify Citizen / Creator
    const { createSystemNotification } = require('../config/db');
    let trackingCode = null;
    try {
      const [cDetail] = await conn.query('SELECT tracking_code, citizen_id, user_id, title FROM complaints WHERE id = ?', [complaintId]);
      if (cDetail && cDetail.length > 0) {
        trackingCode = cDetail[0].tracking_code;
        const creatorId = cDetail[0].user_id || cDetail[0].citizen_id;
        if (creatorId) {
          await createSystemNotification({
            user_id: creatorId,
            title: '✅ Talebiniz Güncellendi',
            message: `[${cDetail[0].tracking_code}] - "${cDetail[0].title}" başlıklı talebiniz hakkında işlem yapıldı (${new_status}).`,
            type: 'Çözüm',
            reference_id: complaintId
          });
        }
      }
    } catch (e) {}

    await conn.commit();
    try {
      await createAuditLog(req.user.id, 'ADD_COMPLAINT_ACTION', 'complaint_actions', complaintId, null, { action_description, new_status }, req.ip);
    } catch (e) {}

    res.json({
      success: true,
      message: 'İşlem kaydı ve çözüm detayları başarıyla kaydedildi.',
      new_status,
      complaint_id: complaintId,
      tracking_code: trackingCode
    });
  } catch (err) {
    await conn.rollback();
    console.error('İşlem kaydı hatası:', err);
    res.status(500).json({ success: false, message: 'İşlem kaydedilirken sunucu hatası oluştu.' });
  } finally {
    conn.release();
  }
};

router.post('/action', authenticateToken, checkRole(['Personel', 'Birim Yöneticisi', 'Sistem Yöneticisi']), upload.single('resolution_photo'), actionHandler);
router.post('/actions', authenticateToken, checkRole(['Personel', 'Birim Yöneticisi', 'Sistem Yöneticisi']), upload.single('resolution_photo'), actionHandler);

// Helper to compute staff satisfaction rating
function calculateStaffPerformanceRating(userId, memData) {
  if (!memData || !memData.complaints) return { avg_rating: '4.8', rating_count: 0 };
  
  const staffComplaints = memData.complaints.filter(c => 
    Number(c.assigned_to_user_id) === Number(userId) ||
    Number(c.assigned_employee_id) === Number(userId) ||
    (memData.complaint_actions && memData.complaint_actions.some(a => Number(a.complaint_id) === Number(c.id) && Number(a.employee_id) === Number(userId)))
  );

  const ratings = [];
  staffComplaints.forEach(c => {
    if (memData.satisfaction_surveys) {
      const surveys = memData.satisfaction_surveys.filter(s => Number(s.complaint_id) === Number(c.id));
      surveys.forEach(s => ratings.push(Number(s.rating)));
    }
    if (c.rating && Number(c.rating) > 0) {
      ratings.push(Number(c.rating));
    }
  });

  if (ratings.length > 0) {
    const sum = ratings.reduce((a, b) => a + b, 0);
    return {
      avg_rating: (sum / ratings.length).toFixed(1),
      rating_count: ratings.length
    };
  }

  return { avg_rating: '4.8', rating_count: 0 };
}

// 3. Birimdeki Personel Listesi (Dinamik, Birime Özel ve Memnuniyet Puanlı)
router.get('/department-employees/:deptId', authenticateToken, async (req, res) => {
  try {
    const deptId = Number(req.params.deptId);
    const { memData } = require('../config/db');
    let employees = [];

    if (memData && memData.users) {
      employees = memData.users
        .filter(u => Number(u.department_id) === deptId && (Number(u.role_id) === 3 || u.role_name === 'Personel') && u.is_active != 0)
        .map(u => {
          const ratingInfo = calculateStaffPerformanceRating(u.id, memData);
          return {
            id: Number(u.id),
            employee_id: u.employee_id || u.id,
            user_id: Number(u.id),
            full_name: u.full_name,
            email: u.email,
            phone: u.phone,
            title: u.employee_title || 'Saha Personeli',
            department_name: u.department_name,
            avg_rating: ratingInfo.avg_rating,
            rating_count: ratingInfo.rating_count
          };
        });
    }

    if (employees.length === 0) {
      try {
        const [rows] = await pool.query(
          `SELECT e.id as employee_id, u.id, u.id as user_id, u.full_name, u.email, u.phone, COALESCE(e.title, u.employee_title, 'Saha Personeli') as title
           FROM employees e
           JOIN users u ON e.user_id = u.id
           WHERE e.department_id = ? AND u.is_active = 1`,
          [deptId]
        );
        employees = (rows || []).map(r => ({
          ...r,
          id: Number(r.id),
          user_id: Number(r.id),
          avg_rating: '4.8',
          rating_count: 0
        }));
      } catch (e) {}
    }

    // Deduplicate employees by ID
    const uniqueEmpMap = new Map();
    employees.forEach(emp => {
      if (emp && emp.id && !uniqueEmpMap.has(Number(emp.id))) {
        uniqueEmpMap.set(Number(emp.id), emp);
      }
    });

    res.json({ success: true, employees: Array.from(uniqueEmpMap.values()) });
  } catch (err) {
    console.error('Personel listesi hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
