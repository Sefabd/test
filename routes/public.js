const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Giresun Fallback Datasets
const giresunDistricts = [
  { id: 1, name: 'Giresun Merkez', lat: 40.9128, lng: 38.3895 },
  { id: 2, name: 'Bulancak', lat: 40.9378, lng: 38.2294 },
  { id: 3, name: 'Espiye', lat: 40.9575, lng: 38.7147 },
  { id: 4, name: 'Görele', lat: 41.0319, lng: 39.0381 },
  { id: 5, name: 'Tirebolu', lat: 41.0069, lng: 38.8144 }
];

const giresunNeighborhoods = [
  // GİRESUN MERKEZ MAHALLELERİ (29 Mahalle)
  { id: 1, district_id: 1, name: 'Aksu Mahallesi', lat: 40.9150, lng: 38.4350 },
  { id: 2, district_id: 1, name: 'Aydınlar Mahallesi', lat: 40.9080, lng: 38.3950 },
  { id: 3, district_id: 1, name: 'Çaykara Mahallesi', lat: 40.9110, lng: 38.3800 },
  { id: 4, district_id: 1, name: 'Çınarlar Mahallesi', lat: 40.9160, lng: 38.3850 },
  { id: 5, district_id: 1, name: 'Çıtlakkale Mahallesi', lat: 40.9090, lng: 38.4000 },
  { id: 6, district_id: 1, name: 'Cumhuriyet Mahallesi', lat: 40.9050, lng: 38.4100 },
  { id: 7, district_id: 1, name: 'Erikliman Mahallesi', lat: 40.9250, lng: 38.3450 },
  { id: 8, district_id: 1, name: 'Fevzi Çakmak Mahallesi', lat: 40.9130, lng: 38.3900 },
  { id: 9, district_id: 1, name: 'Gaziler Mahallesi', lat: 40.8980, lng: 38.4050 },
  { id: 10, district_id: 1, name: 'Gedikkaya Mahallesi', lat: 40.9200, lng: 38.4050 },
  { id: 11, district_id: 1, name: 'Gemilerçekeği Mahallesi', lat: 40.9180, lng: 38.3980 },
  { id: 12, district_id: 1, name: 'Güre Mahallesi', lat: 40.8990, lng: 38.4420 },
  { id: 13, district_id: 1, name: 'Hacı Hüseyin Mahallesi', lat: 40.9140, lng: 38.3780 },
  { id: 14, district_id: 1, name: 'Hacımiktat Mahallesi', lat: 40.9165, lng: 38.3880 },
  { id: 15, district_id: 1, name: 'Hacısiyam Mahallesi', lat: 40.9100, lng: 38.3910 },
  { id: 16, district_id: 1, name: 'Kale Mahallesi', lat: 40.9180, lng: 38.3860 },
  { id: 17, district_id: 1, name: 'Kapu Mahallesi', lat: 40.9170, lng: 38.3880 },
  { id: 18, district_id: 1, name: 'Kavaklar Mahallesi', lat: 40.9030, lng: 38.3820 },
  { id: 19, district_id: 1, name: 'Kayadibi Mahallesi', lat: 40.8920, lng: 38.3890 },
  { id: 20, district_id: 1, name: 'Küçükköy Mahallesi', lat: 40.8970, lng: 38.3780 },
  { id: 21, district_id: 1, name: 'Konacık Mahallesi', lat: 40.8850, lng: 38.3920 },
  { id: 22, district_id: 1, name: 'Nizamiye Mahallesi', lat: 40.9150, lng: 38.3850 },
  { id: 23, district_id: 1, name: 'Osmaniye Mahallesi', lat: 40.9145, lng: 38.3840 },
  { id: 24, district_id: 1, name: 'Seldeğirmeni Mahallesi', lat: 40.9060, lng: 38.3870 },
  { id: 25, district_id: 1, name: 'Şeyhkeramettin Mahallesi', lat: 40.9158, lng: 38.3875 },
  { id: 26, district_id: 1, name: 'Sultan Selim Mahallesi', lat: 40.9165, lng: 38.3860 },
  { id: 27, district_id: 1, name: 'Tekke Mahallesi', lat: 40.9010, lng: 38.3800 },
  { id: 28, district_id: 1, name: 'Teyyaredüzü Mahallesi', lat: 40.9180, lng: 38.4200 },
  { id: 29, district_id: 1, name: 'Yalı Mahallesi', lat: 40.9190, lng: 38.3870 },

  // BULANCAK İLÇESİ MAHALLELERİ (16 Mahalle)
  { id: 30, district_id: 2, name: 'Acısu Mahallesi', lat: 40.9320, lng: 38.2250 },
  { id: 31, district_id: 2, name: 'Arifli Mahallesi', lat: 40.9280, lng: 38.2210 },
  { id: 32, district_id: 2, name: 'Bahçelievler Mahallesi', lat: 40.9360, lng: 38.2380 },
  { id: 33, district_id: 2, name: 'Ballıca Mahallesi', lat: 40.9380, lng: 38.2300 },
  { id: 34, district_id: 2, name: 'Bulancak Mahallesi', lat: 40.9378, lng: 38.2294 },
  { id: 35, district_id: 2, name: 'Duacıoğlu Mahallesi', lat: 40.9310, lng: 38.2350 },
  { id: 36, district_id: 2, name: 'Güzelyalı Mahallesi', lat: 40.9410, lng: 38.2450 },
  { id: 37, district_id: 2, name: 'İhsaniye Mahallesi', lat: 40.9350, lng: 38.2250 },
  { id: 38, district_id: 2, name: 'İsmetpaşa Mahallesi', lat: 40.9390, lng: 38.2320 },
  { id: 39, district_id: 2, name: 'Kızılot Mahallesi', lat: 40.9250, lng: 38.2180 },
  { id: 40, district_id: 2, name: 'Pazarsuyu Mahallesi', lat: 40.9450, lng: 38.2600 },
  { id: 41, district_id: 2, name: 'Sanayi Mahallesi', lat: 40.9400, lng: 38.2400 },
  { id: 42, district_id: 2, name: 'Saraçlı Mahallesi', lat: 40.9340, lng: 38.2310 },
  { id: 43, district_id: 2, name: 'Sisin Mahallesi', lat: 40.9220, lng: 38.2300 },
  { id: 44, district_id: 2, name: 'Şemsettin Mahallesi', lat: 40.9200, lng: 38.2280 },
  { id: 45, district_id: 2, name: 'Toprakdeğirmeni Mahallesi', lat: 40.9370, lng: 38.2210 },

  // DİĞER İLÇELER
  { id: 46, district_id: 3, name: 'Çam Mahallesi', lat: 40.9580, lng: 38.7150 },
  { id: 47, district_id: 3, name: 'Esentepe Mahallesi', lat: 40.9550, lng: 38.7100 },
  { id: 48, district_id: 4, name: 'Sayfiye Mahallesi', lat: 41.0320, lng: 39.0380 },
  { id: 49, district_id: 4, name: 'Hendekbaşı Mahallesi', lat: 41.0300, lng: 39.0350 },
  { id: 50, district_id: 5, name: 'Demirci Mahallesi', lat: 41.0070, lng: 38.8150 },
  { id: 51, district_id: 5, name: 'Yeniköy Mahallesi', lat: 41.0050, lng: 38.8100 }
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
    const [departments] = await pool.query(`SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC`);
    const list = (departments && departments.length > 0) ? departments : (memData.departments || []);
    res.json({ success: true, departments: list });
  } catch (err) {
    const { memData } = require('../config/db');
    res.json({ success: true, departments: memData.departments || [] });
  }
});

// GET /api/public/locations (Giresun Guaranteed Locations)
router.get('/locations', async (req, res) => {
  try {
    const [districts] = await pool.query('SELECT * FROM districts ORDER BY name ASC');
    const [neighborhoods] = await pool.query('SELECT * FROM neighborhoods ORDER BY name ASC');

    const finalDistricts = (districts && districts.length > 0) ? districts : giresunDistricts;
    const finalNeighborhoods = (neighborhoods && neighborhoods.length > 0) ? neighborhoods : giresunNeighborhoods;

    res.json({ success: true, districts: finalDistricts, neighborhoods: finalNeighborhoods });
  } catch (err) {
    res.json({ success: true, districts: giresunDistricts, neighborhoods: giresunNeighborhoods });
  }
});

module.exports = router;
