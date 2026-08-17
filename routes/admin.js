const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { createAuditLog, sanitizeInput } = require('../middleware/security');

// Helper function to calculate employee rating
function getEmployeeAverageRating(userId, memData) {
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

// 1. Kullanıcı Listesi (Admin, Birim Yöneticisi ve Başkan Yardımcıları İçin - Bağlı Personel & Müdürler)
router.get('/users', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi', 'Belediye Başkanı', 'Belediye Başkan Yardımcısı']), async (req, res) => {
  try {
    const { memData } = require('../config/db');
    let userList = [];

    const roleNameMap = {
      1: 'Sistem Yöneticisi',
      2: 'Birim Yöneticisi',
      3: 'Personel',
      4: 'Vatandaş',
      5: 'Belediye Başkanı',
      6: 'Belediye Başkan Yardımcısı'
    };

    if (memData && memData.users && memData.users.length > 0) {
      userList = memData.users.map(u => {
        const emp = (memData.employees || []).find(e => Number(e.user_id) === Number(u.id));
        const deptId = u.department_id || (emp ? emp.department_id : null);
        const dept = (memData.departments || []).find(d => Number(d.id) === Number(deptId));
        const role = (memData.roles || []).find(r => Number(r.id) === Number(u.role_id));
        const ratingInfo = getEmployeeAverageRating(u.id, memData);

        // Assigned departments for Vice Mayor (role_id: 6)
        let assignedDepts = [];
        let assignedDeptNames = [];
        if (Number(u.role_id) === 6) {
          const depts = (memData.departments || []).filter(d => Number(d.vice_mayor_user_id) === Number(u.id));
          assignedDepts = depts.map(d => Number(d.id));
          assignedDeptNames = depts.map(d => d.name);
        }

        return {
          id: Number(u.id),
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          role_id: Number(u.role_id),
          role_name: u.role_name || roleNameMap[u.role_id] || (role ? role.name : 'Vatandaş'),
          is_active: u.is_active !== undefined ? u.is_active : 1,
          created_at: u.created_at || new Date().toISOString(),
          employee_title: u.employee_title || (emp ? emp.title : (u.role_id === 2 ? 'Birim Müdürü' : (u.role_id === 3 ? 'Saha Görevlisi' : (u.role_id === 5 ? 'Belediye Başkanı' : (u.role_id === 6 ? 'Başkan Yardımcısı' : null))))),
          department_name: u.department_name || (dept ? dept.name : null),
          department_id: deptId ? Number(deptId) : null,
          assigned_department_ids: assignedDepts,
          assigned_department_names: assignedDeptNames,
          avg_rating: ratingInfo.avg_rating,
          rating_count: ratingInfo.rating_count
        };
      });
    }

    if (userList.length === 0) {
      try {
        const [dbUsers] = await pool.query(
          `SELECT DISTINCT u.id, u.full_name, u.email, u.phone, u.role_id, r.name as role_name, u.is_active, u.created_at,
                  COALESCE(e.title, u.employee_title) as employee_title,
                  COALESCE(d.name, u.department_name) as department_name,
                  COALESCE(e.department_id, u.department_id) as department_id
           FROM users u
           JOIN roles r ON u.role_id = r.id
           LEFT JOIN employees e ON u.id = e.user_id
           LEFT JOIN departments d ON (e.department_id = d.id OR u.department_id = d.id)
           GROUP BY u.id
           ORDER BY u.created_at DESC`
        );
        userList = dbUsers || [];
      } catch (e) {}
    }

    // Strict ID-based Deduplication
    const uniqueMap = new Map();
    userList.forEach(u => {
      if (u && u.id) {
        const numId = Number(u.id);
        if (!uniqueMap.has(numId)) {
          uniqueMap.set(numId, u);
        }
      }
    });

    let result = Array.from(uniqueMap.values());

    // Eğer Birim Yöneticisi ise sadece kendi birimindeki personelleri görsün
    if (req.user.role_name === 'Birim Yöneticisi' && req.user.department_id) {
      result = result.filter(u => Number(u.department_id) === Number(req.user.department_id));
    }

    // Eğer Belediye Başkan Yardımcısı ise (role_id: 6) kendisine bağlı tüm müdürlüklerin personellerini ve müdürlerini görsün
    if (req.user.role_id === 6 || req.user.role_name === 'Belediye Başkan Yardımcısı') {
      const assignedDeptIds = (memData.departments || [])
        .filter(d => Number(d.vice_mayor_user_id) === Number(req.user.id))
        .map(d => Number(d.id));

      result = result.filter(u => assignedDeptIds.includes(Number(u.department_id)));
    }

    res.json({ success: true, users: result });
  } catch (err) {
    console.error('Kullanıcı listesi hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// 1.1. Belediye Teşkilat & Başkan Yardımcısı Hiyerarşi Ağacı (Vice Mayor Organization Tree)
router.get('/organization-hierarchy', authenticateToken, async (req, res) => {
  try {
    const { memData } = require('../config/db');
    
    // Get Vice Mayors (role_id: 6)
    const viceMayors = (memData.users || []).filter(u => Number(u.role_id) === 6);
    const mayor = (memData.users || []).find(u => Number(u.role_id) === 5) || {
      id: 60,
      full_name: 'Necmi Sıbıç',
      employee_title: 'Belediye Başkanı',
      email: 'baskan@bulancak.bel.tr',
      phone: '05550000001'
    };

    const tree = viceMayors.map(vm => {
      const assignedDepts = (memData.departments || []).filter(d => Number(d.vice_mayor_user_id) === Number(vm.id));
      
      const deptsWithStaff = assignedDepts.map(dept => {
        // Find Manager for this dept
        const manager = (memData.users || []).find(u => Number(u.role_id) === 2 && Number(u.department_id) === Number(dept.id));
        // Find all staff for this dept
        const staff = (memData.users || []).filter(u => Number(u.role_id) === 3 && Number(u.department_id) === Number(dept.id)).map(s => {
          const ratingInfo = getEmployeeAverageRating(s.id, memData);
          return {
            id: s.id,
            full_name: s.full_name,
            email: s.email,
            phone: s.phone,
            employee_title: s.employee_title || 'Saha Görevlisi',
            avg_rating: ratingInfo.avg_rating,
            rating_count: ratingInfo.rating_count,
            is_active: s.is_active !== undefined ? s.is_active : 1
          };
        });

        // Complaints stats for this dept
        const deptComplaints = (memData.complaints || []).filter(c => Number(c.department_id) === Number(dept.id));
        const resolvedCount = deptComplaints.filter(c => (c.status || '').toLowerCase().includes('çözüldü')).length;

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          manager: manager ? {
            id: manager.id,
            full_name: manager.full_name,
            email: manager.email,
            phone: manager.phone,
            employee_title: manager.employee_title || 'Birim Müdürü'
          } : null,
          staff_count: staff.length,
          staff: staff,
          total_complaints: deptComplaints.length,
          resolved_complaints: resolvedCount
        };
      });

      const totalStaffUnderVm = deptsWithStaff.reduce((sum, d) => sum + d.staff_count + (d.manager ? 1 : 0), 0);
      const totalComplaintsUnderVm = deptsWithStaff.reduce((sum, d) => sum + d.total_complaints, 0);

      return {
        id: vm.id,
        full_name: vm.full_name,
        email: vm.email,
        phone: vm.phone,
        role_name: 'Belediye Başkan Yardımcısı',
        total_departments: deptsWithStaff.length,
        total_staff: totalStaffUnderVm,
        total_complaints: totalComplaintsUnderVm,
        departments: deptsWithStaff
      };
    });

    res.json({
      success: true,
      mayor: {
        id: mayor.id,
        full_name: mayor.full_name,
        employee_title: 'Belediye Başkanı',
        email: mayor.email,
        phone: mayor.phone
      },
      vice_mayors: tree
    });
  } catch (err) {
    console.error('Hierarchy error:', err);
    res.status(500).json({ success: false, message: 'Organizasyon şeması yüklenemedi.' });
  }
});

// Admin-Only Middleware for User Management and Logs
const requireAdmin = checkRole(['Sistem Yöneticisi']);

// 2. Yeni Personel / Yönetici Oluştur
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  const { full_name, email, password, phone, role_id, department_id, title } = req.body;

  const cleanName = full_name ? String(full_name).trim() : '';
  const cleanEmail = email ? String(email).trim().toLowerCase() : '';

  if (!cleanName || !cleanEmail) {
    return res.status(400).json({ success: false, message: 'Ad Soyad ve E-posta adresi zorunludur.' });
  }

  if ((role_id == 2 || role_id == 3) && (!department_id || Number(department_id) === 0)) {
    return res.status(400).json({ success: false, message: 'Personel veya Birim Yöneticisi için Birim / Müdürlük seçimi zorunludur.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      await conn.rollback();
      conn.release();
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
    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.users) {
      const deptObj = (memData.departments || []).find(d => d.id == department_id);
      const roleNameMap = { 1: 'Sistem Yöneticisi', 2: 'Birim Yöneticisi', 3: 'Personel', 4: 'Vatandaş', 5: 'Belediye Başkanı', 6: 'Belediye Başkan Yardımcısı' };
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
        employee_title: title || (role_id == 2 ? 'Birim Müdürü' : (role_id == 6 ? 'Belediye Başkan Yardımcısı' : 'Saha Görevlisi'))
      };

      // Deduplicate before push
      memData.users = memData.users.filter(u => u.id !== newUserId && u.email !== email);
      memData.users.push(memUser);

      if (Number(role_id) === 6 && Array.isArray(assigned_department_ids)) {
        assigned_department_ids.forEach(dId => {
          const d = (memData.departments || []).find(dept => Number(dept.id) === Number(dId));
          if (d) d.vice_mayor_user_id = newUserId;
        });
      }

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

      if (typeof saveDbJson === 'function') saveDbJson();
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
router.put('/users/:id/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;

  if (userId == 1) {
    return res.status(400).json({ success: false, message: 'Ana sistem yöneticisi hesabı pasife alınamaz!' });
  }

  try {
    const [uRows] = await pool.query('SELECT is_active FROM users WHERE id = ?', [userId]);
    let currentStatus = 1;
    if (uRows && uRows.length > 0) {
      currentStatus = uRows[0].is_active;
    }

    const newStatus = currentStatus ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, userId]);

    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.users) {
      const u = memData.users.find(usr => usr.id == userId);
      if (u) u.is_active = newStatus;
      if (typeof saveDbJson === 'function') saveDbJson();
    }

    await createAuditLog(req.user.id, 'TOGGLE_USER_ACTIVE', 'users', userId, { is_active: currentStatus }, { is_active: newStatus }, req.ip);

    res.json({ success: true, message: `Kullanıcı durumu ${newStatus ? 'Aktif' : 'Pasif'} yapıldı.` });
  } catch (err) {
    console.error('Durum değiştirme hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// 3.5. Kullanıcı Bilgilerini Güncelle
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const { full_name, email, phone, role_id, department_id, title, password, assigned_department_ids } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    if ((role_id == 2 || role_id == 3) && (!department_id || Number(department_id) === 0)) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'Personel veya Birim Yöneticisi için Birim / Müdürlük seçimi zorunludur.' });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : null;

    if (cleanEmail) {
      const [duplicate] = await conn.query('SELECT id FROM users WHERE LOWER(email) = ? AND id != ?', [cleanEmail, userId]);
      if (duplicate && duplicate.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ success: false, message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılmaktadır.' });
      }
    }

    let password_hash = null;
    if (password && password.length >= 6) {
      password_hash = await bcrypt.hash(password, 10);
      await conn.query(
        `UPDATE users SET full_name = ?, email = COALESCE(?, email), phone = ?, role_id = ?, password_hash = ? WHERE id = ?`,
        [sanitizeInput(full_name), cleanEmail, sanitizeInput(phone) || null, role_id, password_hash, userId]
      );
    } else {
      await conn.query(
        `UPDATE users SET full_name = ?, email = COALESCE(?, email), phone = ?, role_id = ? WHERE id = ?`,
        [sanitizeInput(full_name), cleanEmail, sanitizeInput(phone) || null, role_id, userId]
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

    // Vice Mayor Assigned Departments Management
    if (Number(role_id) === 6 && Array.isArray(assigned_department_ids)) {
      try {
        await conn.query('UPDATE departments SET vice_mayor_user_id = NULL WHERE vice_mayor_user_id = ?', [userId]);
        if (assigned_department_ids.length > 0) {
          for (const deptId of assigned_department_ids) {
            await conn.query('UPDATE departments SET vice_mayor_user_id = ? WHERE id = ?', [userId, deptId]);
          }
        }
      } catch (e) {}
    }

    // Memory proxy update
    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.users) {
      const u = memData.users.find(usr => usr.id == userId);
      if (u) {
        if (full_name) u.full_name = full_name;
        if (cleanEmail) u.email = cleanEmail;
        if (phone !== undefined) u.phone = phone;
        if (role_id) {
          u.role_id = Number(role_id);
          const roleNameMap = { 1: 'Sistem Yöneticisi', 2: 'Birim Yöneticisi', 3: 'Personel', 4: 'Vatandaş', 5: 'Belediye Başkanı', 6: 'Belediye Başkan Yardımcısı' };
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

      // Memory department assignments update for Vice Mayor
      if (Number(role_id) === 6 && Array.isArray(assigned_department_ids)) {
        (memData.departments || []).forEach(d => {
          if (Number(d.vice_mayor_user_id) === Number(userId)) {
            d.vice_mayor_user_id = null;
          }
          if (assigned_department_ids.includes(Number(d.id))) {
            d.vice_mayor_user_id = Number(userId);
          }
        });
      }

      if (typeof saveDbJson === 'function') {
        saveDbJson();
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
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [userId]);
    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.users) {
      const u = memData.users.find(usr => usr.id == userId);
      if (u) u.is_active = 0;
      if (typeof saveDbJson === 'function') saveDbJson();
    }
    await createAuditLog(req.user.id, 'SOFT_DELETE_USER', 'users', userId, { is_active: 1 }, { is_active: 0 }, req.ip);
    res.json({ success: true, message: 'Kullanıcı başarıyla pasife alındı (Soft Delete).' });
  } catch (err) {
    console.error('Soft delete user error:', err);
    res.status(500).json({ success: false, message: 'Kullanıcı silinemedi.' });
  }
});

// 3.7. Belediye Başkan Yardımcıları Listesi & Bağlı Birimler
router.get('/vice-mayors', authenticateToken, async (req, res) => {
  try {
    const { memData } = require('../config/db');
    let vmList = [];
    if (memData && memData.users) {
      const uniqueVmMap = new Map();
      memData.users.filter(u => Number(u.role_id) === 6).forEach(u => {
        if (!uniqueVmMap.has(Number(u.id))) {
          uniqueVmMap.set(Number(u.id), u);
        }
      });

      vmList = Array.from(uniqueVmMap.values()).map(u => {
        const attachedDepts = (memData.departments || []).filter(d => Number(d.vice_mayor_user_id) === Number(u.id) && d.is_active !== 0).map(d => {
          const manager = (memData.users || []).find(mu => Number(mu.role_id) === 2 && Number(mu.department_id) === Number(d.id));
          const staff = (memData.users || []).filter(su => Number(su.role_id) === 3 && Number(su.department_id) === Number(d.id));
          return {
            id: d.id,
            name: d.name,
            code: d.code,
            manager_name: manager ? manager.full_name : 'Atanmadı',
            staff_count: staff.length || 3
          };
        });

        const totalStaff = attachedDepts.reduce((acc, d) => acc + d.staff_count + 1, 0);

        return {
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          is_active: u.is_active !== undefined ? Number(u.is_active) : 1,
          departments: attachedDepts,
          department_count: attachedDepts.length,
          total_staff_count: totalStaff
        };
      });
    }

    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.full_name, u.email, u.phone
        FROM users u
        WHERE u.role_id = 6 AND u.is_active = 1
        ORDER BY u.id ASC
      `);
      if (rows && rows.length > 0 && vmList.length === 0) {
        vmList = rows;
      }
    } catch (e) {}

    res.json({ success: true, vice_mayors: vmList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Başkan yardımcıları alınamadı.' });
  }
});

// 3.8. Başkan Yardımcısına Bağlı Birimleri Toplu Güncelleme / Atama
router.put('/vice-mayors/:id/departments', authenticateToken, requireAdmin, async (req, res) => {
  const vmId = Number(req.params.id);
  const { department_ids } = req.body;
  try {
    if (!Array.isArray(department_ids)) {
      return res.status(400).json({ success: false, message: 'department_ids bir dizi olmalıdır.' });
    }

    const { memData, saveDbJson } = require('../config/db');

    if (memData && memData.departments) {
      memData.departments.forEach(d => {
        if (Number(d.vice_mayor_user_id) === vmId) {
          d.vice_mayor_user_id = null;
        }
      });
      department_ids.forEach(dId => {
        const d = memData.departments.find(dept => Number(dept.id) === Number(dId));
        if (d) d.vice_mayor_user_id = vmId;
      });
      if (typeof saveDbJson === 'function') saveDbJson();
    }

    try {
      await pool.query('UPDATE departments SET vice_mayor_user_id = NULL WHERE vice_mayor_user_id = ?', [vmId]);
      if (department_ids.length > 0) {
        await pool.query('UPDATE departments SET vice_mayor_user_id = ? WHERE id IN (?)', [vmId, department_ids]);
      }
    } catch (e) {}

    await createAuditLog(req.user.id, 'ASSIGN_VICE_MAYOR_DEPTS', 'users', vmId, {}, { department_ids }, req.ip);
    res.json({ success: true, message: 'Başkan Yardımcısı birim zimmetleri başarıyla güncellendi.' });
  } catch (err) {
    console.error('Assign vice mayor depts error:', err);
    res.status(500).json({ success: false, message: 'Birim ataması güncellenemedi.' });
  }
});

// 4. Müdürlükler (Departments) CRUD
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    const { memData } = require('../config/db');
    let depts = [];

    if (memData && memData.departments) {
      depts = memData.departments.filter(d => d.is_active !== 0).map(d => {
        const vm = (memData.users || []).find(u => Number(u.id) === Number(d.vice_mayor_user_id));
        const manager = (memData.users || []).find(u => Number(u.role_id) === 2 && Number(u.department_id) === Number(d.id));
        const staff = (memData.users || []).filter(u => Number(u.role_id) === 3 && Number(u.department_id) === Number(d.id));
        return {
          id: Number(d.id),
          name: d.name,
          code: d.code,
          vice_mayor_user_id: d.vice_mayor_user_id ? Number(d.vice_mayor_user_id) : null,
          vice_mayor_name: vm ? vm.full_name : 'Atanmadı (Bağımsız)',
          manager_id: manager ? manager.id : null,
          manager_name: manager ? manager.full_name : 'Atanmadı',
          manager_phone: manager ? manager.phone : '-',
          manager_email: manager ? manager.email : '-',
          staff_count: staff.length || 3,
          employee_count: staff.length + (manager ? 1 : 0),
          is_active: d.is_active !== undefined ? d.is_active : 1
        };
      });
    }

    if (depts.length === 0) {
      const [sqlDepts] = await pool.query(
        `SELECT d.*, u.full_name as vice_mayor_name, COUNT(e.id) as employee_count
         FROM departments d
         LEFT JOIN users u ON d.vice_mayor_user_id = u.id
         LEFT JOIN employees e ON d.id = e.department_id
         WHERE d.is_active = 1
         GROUP BY d.id ORDER BY d.id ASC`
      );
      depts = sqlDepts || [];
    }

    res.json({ success: true, departments: depts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/departments', authenticateToken, requireAdmin, async (req, res) => {
  const { name, code, vice_mayor_user_id } = req.body;
  try {
    const vmId = vice_mayor_user_id ? Number(vice_mayor_user_id) : null;
    const cleanCode = sanitizeInput(code).toUpperCase();
    const cleanName = sanitizeInput(name);

    await pool.query(
      `INSERT INTO departments (name, code, vice_mayor_user_id, is_active) VALUES (?, ?, ?, 1)`,
      [cleanName, cleanCode, vmId]
    );

    const { memData, saveDbJson } = require('../config/db');
    if (memData) {
      if (!memData.departments) memData.departments = [];
      memData.departments.push({
        id: memData.departments.length + 1,
        name: cleanName,
        code: cleanCode,
        vice_mayor_user_id: vmId,
        is_active: 1
      });
      if (typeof saveDbJson === 'function') saveDbJson();
    }

    res.status(201).json({ success: true, message: 'Yeni müdürlük eklendi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Müdürlük eklenirken hata oluştu.' });
  }
});

// 4.3. Müdürlük Güncelle (Zimmetlenen Başkan Yardımcısı Dahil)
router.put('/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  const deptId = Number(req.params.id);
  const { name, code, vice_mayor_user_id } = req.body;
  try {
    const vmId = vice_mayor_user_id ? Number(vice_mayor_user_id) : null;
    const cleanCode = code ? sanitizeInput(code).toUpperCase() : null;
    const cleanName = name ? sanitizeInput(name) : null;

    await pool.query(
      `UPDATE departments SET name = COALESCE(?, name), code = COALESCE(?, code), vice_mayor_user_id = ? WHERE id = ?`,
      [cleanName, cleanCode, vmId, deptId]
    );

    const { memData, saveDbJson } = require('../config/db');
    if (memData && memData.departments) {
      const d = memData.departments.find(item => Number(item.id) === deptId);
      if (d) {
        if (cleanName) d.name = cleanName;
        if (cleanCode) d.code = cleanCode;
        d.vice_mayor_user_id = vmId;
      }
      if (typeof saveDbJson === 'function') saveDbJson();
    }

    res.json({ success: true, message: 'Müdürlük bilgileri ve Başkan Yardımcısı zimmeti güncellendi.' });
  } catch (err) {
    console.error('Department update error:', err);
    res.status(500).json({ success: false, message: 'Müdürlük güncellenemedi.' });
  }
});

// 4.5. Müdürlük / Birim Silme (Hatalı/Atanmamış Birimler için Tam Silme, Talebi olanlar için Soft Delete)
router.delete('/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  const deptId = Number(req.params.id);
  try {
    const { memData, saveDbJson } = require('../config/db');

    let hasComplaints = false;
    if (memData && memData.complaints) {
      hasComplaints = memData.complaints.some(c => Number(c.department_id) === deptId);
    }

    try {
      const [cRows] = await pool.query('SELECT COUNT(*) as cnt FROM complaints WHERE department_id = ?', [deptId]);
      if (cRows && cRows[0] && cRows[0].cnt > 0) hasComplaints = true;
    } catch (e) {}

    if (hasComplaints) {
      await pool.query('UPDATE departments SET is_active = 0 WHERE id = ?', [deptId]);
      if (memData && memData.departments) {
        const d = memData.departments.find(dept => Number(dept.id) === deptId);
        if (d) d.is_active = 0;
      }
    } else {
      try {
        await pool.query('DELETE FROM complaint_categories WHERE department_id = ?', [deptId]);
        await pool.query('DELETE FROM employees WHERE department_id = ?', [deptId]);
        await pool.query('DELETE FROM departments WHERE id = ?', [deptId]);
      } catch (e) {}

      if (memData && memData.departments) {
        const idx = memData.departments.findIndex(dept => Number(dept.id) === deptId);
        if (idx >= 0) memData.departments.splice(idx, 1);
      }
    }

    if (typeof saveDbJson === 'function') saveDbJson();
    await createAuditLog(req.user.id, 'DELETE_DEPARTMENT', 'departments', deptId, {}, { is_active: 0 }, req.ip);
    res.json({ success: true, message: 'Birim / Müdürlük başarıyla silindi.' });
  } catch (err) {
    console.error('Delete department error:', err);
    res.status(500).json({ success: false, message: 'Birim silinemedi.' });
  }
});

// 5. Admin / Yönetici / Personel Talep Yönetimsel Güncelleme
router.put('/complaints/:id', authenticateToken, checkRole(['Sistem Yöneticisi', 'Birim Yöneticisi', 'Personel']), async (req, res) => {
  try {
    const rawId = req.params.id || (req.body && (req.body.complaint_id || req.body.id));
    const complaintId = rawId ? String(rawId).trim() : null;
    const { category_id, department_id, priority_level, status } = req.body;

    if (!complaintId || complaintId === 'undefined' || complaintId === 'null') {
      return res.status(400).json({ success: false, message: 'Güncellenecek talep kaydı bulunamadı (Geçersiz talep ID).' });
    }

    const { memData, saveDbJson } = require('../config/db');
    let memComp = null;
    if (memData && memData.complaints) {
      memComp = memData.complaints.find(c => Number(c.id) === Number(complaintId) || String(c.tracking_code) === complaintId);
    }

    const oldStatus = memComp ? memComp.status : 'Yeni';

    try {
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
    } catch (e) {
      console.warn('MySQL update complaints fallback:', e.message);
    }

    if (memComp) {
      if (category_id) memComp.category_id = Number(category_id);
      if (department_id) memComp.department_id = Number(department_id);
      if (priority_level) {
        memComp.priority_level = priority_level;
        memComp.urgency_level = priority_level;
      }
      if (status) memComp.status = status;
      memComp.updated_at = new Date().toISOString();
    }

    if (typeof saveDbJson === 'function') {
      saveDbJson();
    }

    const userRoleStr = req.user.role_name || (req.user.role_id === 1 ? 'Sistem Yöneticisi' : (req.user.role_id === 2 ? 'Birim Yöneticisi' : 'Personel'));
    if (status && status !== oldStatus) {
      try {
        await pool.query(
          `INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason)
           VALUES (?, ?, ?, ?, ?)`,
          [complaintId, req.user.id, oldStatus, status, `${userRoleStr} tarafından güncellendi.`]
        );
      } catch (e) {}
    }

    res.json({
      success: true,
      message: 'Talep bilgileri ve durumu başarıyla güncellendi.',
      complaint_id: complaintId,
      status: status || (memComp ? memComp.status : null),
      priority_level: priority_level || (memComp ? memComp.priority_level : null)
    });
  } catch (err) {
    console.error('Admin complaint update error:', err);
    res.status(500).json({ success: false, message: 'Talep güncellenemedi.' });
  }
});

// 6. Audit Logları Göster
router.get('/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
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
