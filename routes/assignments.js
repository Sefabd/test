const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { upload, createAuditLog, sanitizeInput } = require('../middleware/security');

// 1. Birim Yöneticisinin Personele Görev Ataması
router.post('/assign', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi']), async (req, res) => {
  const { complaint_id, employee_id, task_description, due_date, priority_level } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [cRows] = await conn.query('SELECT tracking_code, department_id FROM complaints WHERE id = ?', [complaint_id]);
    if (cRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    const { tracking_code, department_id } = cRows[0];

    // Create Assignment
    const [assignResult] = await conn.query(
      `INSERT INTO complaint_assignments (complaint_id, assigned_by_user_id, assigned_to_employee_id, department_id, task_description, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Atandı')`,
      [complaint_id, req.user.id, employee_id, department_id, sanitizeInput(task_description) || 'Görev atandı.', due_date || null]
    );

    // Update Complaint Status & Priority
    await conn.query(
      `UPDATE complaints SET status = 'Personele atandı', priority_level = COALESCE(?, priority_level), updated_at = NOW() WHERE id = ?`,
      [priority_level || null, complaint_id]
    );

    // Status History Log
    await conn.query(
      `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
       VALUES (?, ?, 'İlgili birime yönlendirildi', 'Personele atandı', ?)`,
      [complaint_id, req.user.id, `Personele atandı: ${task_description || ''}`]
    );

    // Send Notification to Employee
    const [empUser] = await conn.query('SELECT user_id FROM employees WHERE id = ?', [employee_id]);
    if (empUser.length > 0) {
      await conn.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_id)
         VALUES (?, 'Yeni Görev Atandı', ?, 'Görev', ?)`,
        [empUser[0].user_id, `${tracking_code} numaralı şikayet için yeni görev atandı: ${task_description || 'İnceleme bekleniyor'}`, complaint_id]
      );
    }

    await conn.commit();
    await createAuditLog(req.user.id, 'ASSIGN_EMPLOYEE', 'complaint_assignments', assignResult.insertId, null, { complaint_id, employee_id }, req.ip);

    res.json({ success: true, message: 'Görev başarıyla personele atandı.' });
  } catch (err) {
    await conn.rollback();
    console.error('Atama hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  } finally {
    conn.release();
  }
});

// 2. Personel İşlem ve Çözüm Kaydı Ekleme (Çözüm Fotoğrafı Yükleme)
router.post(
  '/action',
  authenticateToken,
  checkRole(['Personel', 'Birim Yöneticisi', 'Sistem Yöneticisi']),
  upload.single('resolution_photo'),
  async (req, res) => {
    const { complaint_id, action_description, work_done, tools_equipment_used, citizen_response, new_status = 'Çözüldü' } = req.body;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      let employeeId = req.user.employee_id;
      if (!employeeId) {
        const [empRows] = await conn.query('SELECT id FROM employees WHERE user_id = ? LIMIT 1', [req.user.id]);
        if (empRows.length > 0) employeeId = empRows[0].id;
        else employeeId = 1;
      }

      let resolutionPhotoPath = null;
      if (req.file) {
        resolutionPhotoPath = 'uploads/' + req.file.filename;
      }

      // Save Action Record
      await conn.query(
        `INSERT INTO complaint_actions (complaint_id, employee_id, action_description, work_done, tools_equipment_used, citizen_response, resolution_photo_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          complaint_id,
          employeeId,
          sanitizeInput(action_description),
          sanitizeInput(work_done) || null,
          sanitizeInput(tools_equipment_used) || null,
          sanitizeInput(citizen_response) || null,
          resolutionPhotoPath
        ]
      );

      // File entry if photo uploaded
      if (resolutionPhotoPath) {
        await conn.query(
          `INSERT INTO complaint_files (complaint_id, file_path, file_name, file_type, file_size, uploaded_by_user_id, file_category)
           VALUES (?, ?, ?, ?, ?, ?, 'Çözüm Görseli')`,
          [complaint_id, resolutionPhotoPath, req.file.originalname, req.file.mimetype, req.file.size, req.user.id]
        );
      }

      // Update Complaint Status
      await conn.query('UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?', [new_status, complaint_id]);

      // Add History
      await conn.query(
        `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
         VALUES (?, ?, 'Personele atandı', ?, ?)`,
        [complaint_id, req.user.id, new_status, sanitizeInput(action_description)]
      );

      await conn.commit();
      await createAuditLog(req.user.id, 'ADD_COMPLAINT_ACTION', 'complaint_actions', complaint_id, null, { action_description, new_status }, req.ip);

      res.json({ success: true, message: 'İşlem kaydı ve çözüm detayları başarıyla kaydedildi.' });
    } catch (err) {
      await conn.rollback();
      console.error('İşlem kaydı hatası:', err);
      res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    } finally {
      conn.release();
    }
  }
);

// 3. Birimdeki Personel Listesi
router.get('/department-employees/:deptId', authenticateToken, async (req, res) => {
  try {
    const deptId = req.params.deptId;
    const [employees] = await pool.query(
      `SELECT e.id as employee_id, u.full_name, u.email, u.phone, e.title
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE e.department_id = ? AND u.is_active = 1`,
      [deptId]
    );

    res.json({ success: true, employees });
  } catch (err) {
    console.error('Personel listesi hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
