const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Bulancak Resmi İlçe & 30 Mahalle Veri Seti (nufusune.com / TÜİK Resmi Listesi)
const bulancakDistricts = [
  { id: 1, name: 'Bulancak', lat: 40.9378, lng: 38.2294 }
];

const bulancakNeighborhoods = [
  { id: 1, district_id: 1, name: 'Acısu Mahallesi', lat: 40.9320, lng: 38.2250 },
  { id: 2, district_id: 1, name: 'Ahurlu Mahallesi', lat: 40.9260, lng: 38.2190 },
  { id: 3, district_id: 1, name: 'Alibey Mahallesi', lat: 40.9300, lng: 38.2310 },
  { id: 4, district_id: 1, name: 'Arifli Mahallesi', lat: 40.9280, lng: 38.2210 },
  { id: 5, district_id: 1, name: 'Aydınlar Mahallesi', lat: 40.9340, lng: 38.2400 },
  { id: 6, district_id: 1, name: 'Bahçelievler Mahallesi', lat: 40.9360, lng: 38.2380 },
  { id: 7, district_id: 1, name: 'Ballıca Mahallesi', lat: 40.9380, lng: 38.2300 },
  { id: 8, district_id: 1, name: 'Bulancak Mahallesi', lat: 40.9378, lng: 38.2294 },
  { id: 9, district_id: 1, name: 'Derecikalan Mahallesi', lat: 40.9240, lng: 38.2150 },
  { id: 10, district_id: 1, name: 'Duacıoğlu Mahallesi', lat: 40.9310, lng: 38.2350 },
  { id: 11, district_id: 1, name: 'Düz Mahallesi', lat: 40.9350, lng: 38.2280 },
  { id: 12, district_id: 1, name: 'Güney Mahallesi', lat: 40.9210, lng: 38.2200 },
  { id: 13, district_id: 1, name: 'Güzelyalı Mahallesi', lat: 40.9410, lng: 38.2450 },
  { id: 14, district_id: 1, name: 'Güzelyurt Mahallesi', lat: 40.9290, lng: 38.2390 },
  { id: 15, district_id: 1, name: 'İhsaniye Mahallesi', lat: 40.9350, lng: 38.2250 },
  { id: 16, district_id: 1, name: 'İsmet Paşa Mahallesi', lat: 40.9390, lng: 38.2320 },
  { id: 17, district_id: 1, name: 'Kızılot Mahallesi', lat: 40.9250, lng: 38.2180 },
  { id: 18, district_id: 1, name: 'Merkez Mahallesi', lat: 40.9375, lng: 38.2285 },
  { id: 19, district_id: 1, name: 'Pazarsuyu Mahallesi', lat: 40.9450, lng: 38.2600 },
  { id: 20, district_id: 1, name: 'Pazarsuyu Emecen Mahallesi', lat: 40.9470, lng: 38.2650 },
  { id: 21, district_id: 1, name: 'Sanayi Mahallesi', lat: 40.9400, lng: 38.2400 },
  { id: 22, district_id: 1, name: 'Saraçlı Mahallesi', lat: 40.9340, lng: 38.2310 },
  { id: 23, district_id: 1, name: 'Şemsettin Mahallesi', lat: 40.9200, lng: 38.2280 },
  { id: 24, district_id: 1, name: 'Sisin Mahallesi', lat: 40.9220, lng: 38.2300 },
  { id: 25, district_id: 1, name: 'Sofulu Mahallesi', lat: 40.9270, lng: 38.2100 },
  { id: 26, district_id: 1, name: 'Soğuksu Mahallesi', lat: 40.9330, lng: 38.2150 },
  { id: 27, district_id: 1, name: 'Toprakdeğirmeni Mahallesi', lat: 40.9370, lng: 38.2210 },
  { id: 28, district_id: 1, name: 'Uçarlı Mahallesi', lat: 40.9190, lng: 38.2350 },
  { id: 29, district_id: 1, name: 'Yeni Mahallesi', lat: 40.9385, lng: 38.2355 },
  { id: 30, district_id: 1, name: 'Yunuslu Mahallesi', lat: 40.9230, lng: 38.2420 }
];

// GET /api/public/categories
router.get('/categories', async (req, res) => {
  try {
    const { memData } = require('../config/db');
    const [categories] = await pool.query(
      `SELECT c.*, d.name as department_name
       FROM complaint_categories c
       JOIN departments d ON c.department_id = d.id
       ORDER BY c.name ASC`
    );

    const list = (categories && categories.length > 0) ? categories : (memData.complaint_categories || []);
    res.json({ success: true, categories: list });
  } catch (err) {
    const { memData } = require('../config/db');
    res.json({ success: true, categories: memData.complaint_categories || [] });
  }
});

// GET /api/public/departments
router.get('/departments', async (req, res) => {
  try {
    const { memData } = require('../config/db');
    let list = [];
    if (memData && memData.departments) {
      list = memData.departments.filter(d => d.is_active !== 0).map(d => {
        const vm = (memData.users || []).find(u => Number(u.id) === Number(d.vice_mayor_user_id));
        const manager = (memData.users || []).find(u => Number(u.role_id) === 2 && Number(u.department_id) === Number(d.id));
        return {
          id: Number(d.id),
          name: d.name,
          code: d.code,
          vice_mayor_user_id: d.vice_mayor_user_id ? Number(d.vice_mayor_user_id) : null,
          vice_mayor_name: vm ? vm.full_name : 'Atanmadı',
          manager_name: manager ? manager.full_name : 'Atanmadı'
        };
      });
    }

    if (list.length === 0) {
      const [departments] = await pool.query(`SELECT d.*, u.full_name as vice_mayor_name FROM departments d LEFT JOIN users u ON d.vice_mayor_user_id = u.id WHERE d.is_active = 1 ORDER BY d.name ASC`);
      list = departments || [];
    }

    res.json({ success: true, departments: list });
  } catch (err) {
    const { memData } = require('../config/db');
    res.json({ success: true, departments: memData.departments || [] });
  }
});

// GET /api/public/locations (Giresun Guaranteed Locations)
// GET /api/public/locations (Bulancak 30 Resmi Mahalle)
router.get('/locations', async (req, res) => {
  try {
    const { memData } = require('../config/db');
    const finalDistricts = (memData && memData.districts && memData.districts.length > 0) ? memData.districts : bulancakDistricts;
    const finalNeighborhoods = (memData && memData.neighborhoods && memData.neighborhoods.length > 0) ? memData.neighborhoods : bulancakNeighborhoods;

    res.json({ success: true, districts: finalDistricts, neighborhoods: finalNeighborhoods });
  } catch (err) {
    res.json({ success: true, districts: bulancakDistricts, neighborhoods: bulancakNeighborhoods });
  }
});

module.exports = router;
