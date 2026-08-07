const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// Optional Token Extractor for Public Endpoints
function optionalAuth(req, res, next) {
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

// GET /api/stats/dashboard - Public & Authenticated Dashboard Stats
router.get('/dashboard', optionalAuth, async (req, res) => {
  try {
    let deptFilter = '';
    const params = [];

    if (req.user && req.user.role_name === 'Birim Yöneticisi' && req.user.department_id) {
      deptFilter = ' WHERE department_id = ? ';
      params.push(req.user.department_id);
    }

    // 1. KPI Counts
    const [totalRows] = await pool.query(`SELECT COUNT(*) as count FROM complaints ${deptFilter}`, params);
    const [todayRows] = await pool.query(`SELECT COUNT(*) as count FROM complaints ${deptFilter ? deptFilter + ' AND' : 'WHERE'} DATE(created_at) = CURDATE()`, params);
    const [pendingRows] = await pool.query(`SELECT COUNT(*) as count FROM complaints ${deptFilter ? deptFilter + ' AND' : 'WHERE'} status NOT IN ('Çözüldü', 'Reddedildi', 'İptal edildi')`, params);
    const [resolvedRows] = await pool.query(`SELECT COUNT(*) as count FROM complaints ${deptFilter ? deptFilter + ' AND' : 'WHERE'} status = 'Çözüldü'`, params);
    const [urgentRows] = await pool.query(`SELECT COUNT(*) as count FROM complaints ${deptFilter ? deptFilter + ' AND' : 'WHERE'} urgency_level IN ('Acil', 'Kritik')`, params);

    // 2. Average Resolution Rating
    const [ratingRows] = await pool.query(`SELECT AVG(rating) as avg_rating, COUNT(*) as survey_count FROM satisfaction_surveys`);

    // 3. Top Neighborhood & Top Category
    const [topNeighborhood] = await pool.query(
      `SELECT n.name, COUNT(c.id) as count
       FROM complaints c
       JOIN neighborhoods n ON c.neighborhood_id = n.id
       ${deptFilter}
       GROUP BY n.name ORDER BY count DESC LIMIT 1`,
      params
    );

    const [topCategory] = await pool.query(
      `SELECT cat.name, COUNT(c.id) as count
       FROM complaints c
       JOIN complaint_categories cat ON c.category_id = cat.id
       ${deptFilter}
       GROUP BY cat.name ORDER BY count DESC LIMIT 1`,
      params
    );

    // 4. Chart 1: Status Distribution
    const [statusDist] = await pool.query(
      `SELECT status, COUNT(*) as count FROM complaints ${deptFilter} GROUP BY status`,
      params
    );

    // 5. Chart 2: Category Distribution
    const [categoryDist] = await pool.query(
      `SELECT cat.name, COUNT(c.id) as count
       FROM complaints c
       JOIN complaint_categories cat ON c.category_id = cat.id
       ${deptFilter}
       GROUP BY cat.name ORDER BY count DESC LIMIT 7`,
      params
    );

    // 6. Chart 3: Department Distribution
    const [deptDist] = await pool.query(
      `SELECT d.name, COUNT(c.id) as count
       FROM complaints c
       JOIN departments d ON c.department_id = d.id
       GROUP BY d.name ORDER BY count DESC`
    );

    // 7. Chart 4: Neighborhood Density
    const [neighborhoodDist] = await pool.query(
      `SELECT n.name, COUNT(c.id) as count
       FROM complaints c
       JOIN neighborhoods n ON c.neighborhood_id = n.id
       ${deptFilter}
       GROUP BY n.name ORDER BY count DESC LIMIT 6`,
      params
    );

    // 8. Chart 5: Personnel Performance
    const [personnelPerf] = await pool.query(
      `SELECT u.full_name, COUNT(ca.id) as resolved_tasks
       FROM complaint_actions ca
       JOIN employees e ON ca.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       GROUP BY u.full_name ORDER BY resolved_tasks DESC LIMIT 5`
    );

    res.json({
      success: true,
      kpis: {
        total: (totalRows && totalRows[0]) ? totalRows[0].count : 0,
        today: (todayRows && todayRows[0]) ? todayRows[0].count : 0,
        pending: (pendingRows && pendingRows[0]) ? pendingRows[0].count : 0,
        resolved: (resolvedRows && resolvedRows[0]) ? resolvedRows[0].count : 0,
        urgent: (urgentRows && urgentRows[0]) ? urgentRows[0].count : 0,
        avg_rating: (ratingRows && ratingRows[0] && ratingRows[0].avg_rating) ? parseFloat(ratingRows[0].avg_rating).toFixed(1) : '5.0',
        survey_count: (ratingRows && ratingRows[0]) ? ratingRows[0].survey_count : 0,
        top_neighborhood: (topNeighborhood && topNeighborhood.length > 0) ? topNeighborhood[0].name : 'Atatürk Mahallesi',
        top_category: (topCategory && topCategory.length > 0) ? topCategory[0].name : 'Çöp ve Çevre Kirliliği'
      },
      charts: {
        status_distribution: statusDist || [],
        category_distribution: categoryDist || [],
        department_distribution: deptDist || [],
        neighborhood_density: neighborhoodDist || [],
        personnel_performance: personnelPerf || []
      }
    });
  } catch (err) {
    console.error('Stats hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
