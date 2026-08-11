const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const defaultPasswordHash = bcrypt.hashSync('123456', 10);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'belediye_talep_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

let realPool = null;
let useMemoryFallback = false;

// Seed Memory Dataset
const memData = {
  roles: [
    { id: 1, name: 'Sistem Yöneticisi', description: 'Tam yetkili sistem yöneticisi' },
    { id: 2, name: 'Birim Yöneticisi', description: 'Belediye müdürlük yöneticisi' },
    { id: 3, name: 'Personel', description: 'Belediye saha veya masa başı iş takip personeli' },
    { id: 4, name: 'Vatandaş', description: 'Sisteme kayıtlı vatandaş' }
  ],
  departments: [
    { id: 1, name: 'Fen İşleri Müdürlüğü', code: 'FEN' },
    { id: 2, name: 'Temizlik İşleri Müdürlüğü', code: 'TEM' },
    { id: 3, name: 'Park ve Bahçeler Müdürlüğü', code: 'PARK' },
    { id: 4, name: 'Zabıta Müdürlüğü', code: 'ZBT' },
    { id: 5, name: 'Su ve Kanalizasyon Müdürlüğü', code: 'SUK' },
    { id: 6, name: 'Veteriner İşleri Müdürlüğü', code: 'VET' },
    { id: 7, name: 'Ulaşım Hizmetleri Müdürlüğü', code: 'ULS' },
    { id: 8, name: 'Sosyal Hizmetler Müdürlüğü', code: 'SHM' },
    { id: 9, name: 'İmar ve Şehircilik Müdürlüğü', code: 'IMR' },
    { id: 10, name: 'Bilgi İşlem Müdürlüğü', code: 'BIM' }
  ],
  complaint_categories: [
    { id: 1, department_id: 1, name: 'Yol ve Kaldırım Sorunu', default_priority: 'Normal' },
    { id: 2, department_id: 1, name: 'Çukur veya Asfalt Problemi', default_priority: 'Acil' },
    { id: 3, department_id: 2, name: 'Çöp ve Çevre Kirliliği', default_priority: 'Normal' },
    { id: 4, department_id: 3, name: 'Park ve Yeşil Alan Sorunu', default_priority: 'Düşük' },
    { id: 5, department_id: 4, name: 'Gürültü Şikâyeti', default_priority: 'Normal' },
    { id: 6, department_id: 4, name: 'Ruhsatsız İşletme', default_priority: 'Yüksek' },
    { id: 7, department_id: 5, name: 'Su Kaçağı', default_priority: 'Acil' },
    { id: 8, department_id: 5, name: 'Kanalizasyon Problemi', default_priority: 'Yüksek' },
    { id: 9, department_id: 6, name: 'Başıboş Hayvan', default_priority: 'Normal' },
    { id: 10, department_id: 7, name: 'Toplu Taşıma Sorunu', default_priority: 'Normal' },
    { id: 11, department_id: 8, name: 'Sosyal Yardım Talebi', default_priority: 'Düşük' },
    { id: 12, department_id: 9, name: 'İmar ve Yapı Şikâyeti', default_priority: 'Normal' },
    { id: 13, department_id: 10, name: 'Sokak Lambası Arızası', default_priority: 'Normal' },
    { id: 14, department_id: 1, name: 'Diğer', default_priority: 'Normal' }
  ],
  districts: [
    { id: 1, name: 'Giresun Merkez' },
    { id: 2, name: 'Bulancak' },
    { id: 3, name: 'Espiye' },
    { id: 4, name: 'Görele' },
    { id: 5, name: 'Tirebolu' }
  ],
  neighborhoods: [
    // GİRESUN MERKEZ MAHALLELERİ (29 Mahalle)
    { id: 1, district_id: 1, name: 'Aksu Mahallesi' },
    { id: 2, district_id: 1, name: 'Aydınlar Mahallesi' },
    { id: 3, district_id: 1, name: 'Çaykara Mahallesi' },
    { id: 4, district_id: 1, name: 'Çınarlar Mahallesi' },
    { id: 5, district_id: 1, name: 'Çıtlakkale Mahallesi' },
    { id: 6, district_id: 1, name: 'Cumhuriyet Mahallesi' },
    { id: 7, district_id: 1, name: 'Erikliman Mahallesi' },
    { id: 8, district_id: 1, name: 'Fevzi Çakmak Mahallesi' },
    { id: 9, district_id: 1, name: 'Gaziler Mahallesi' },
    { id: 10, district_id: 1, name: 'Gedikkaya Mahallesi' },
    { id: 11, district_id: 1, name: 'Gemilerçekeği Mahallesi' },
    { id: 12, district_id: 1, name: 'Güre Mahallesi' },
    { id: 13, district_id: 1, name: 'Hacı Hüseyin Mahallesi' },
    { id: 14, district_id: 1, name: 'Hacımiktat Mahallesi' },
    { id: 15, district_id: 1, name: 'Hacısiyam Mahallesi' },
    { id: 16, district_id: 1, name: 'Kale Mahallesi' },
    { id: 17, district_id: 1, name: 'Kapu Mahallesi' },
    { id: 18, district_id: 1, name: 'Kavaklar Mahallesi' },
    { id: 19, district_id: 1, name: 'Kayadibi Mahallesi' },
    { id: 20, district_id: 1, name: 'Küçükköy Mahallesi' },
    { id: 21, district_id: 1, name: 'Konacık Mahallesi' },
    { id: 22, district_id: 1, name: 'Nizamiye Mahallesi' },
    { id: 23, district_id: 1, name: 'Osmaniye Mahallesi' },
    { id: 24, district_id: 1, name: 'Seldeğirmeni Mahallesi' },
    { id: 25, district_id: 1, name: 'Şeyhkeramettin Mahallesi' },
    { id: 26, district_id: 1, name: 'Sultan Selim Mahallesi' },
    { id: 27, district_id: 1, name: 'Tekke Mahallesi' },
    { id: 28, district_id: 1, name: 'Teyyaredüzü Mahallesi' },
    { id: 29, district_id: 1, name: 'Yalı Mahallesi' },

    // BULANCAK İLÇESİ MAHALLELERİ (16 Mahalle)
    { id: 30, district_id: 2, name: 'Acısu Mahallesi' },
    { id: 31, district_id: 2, name: 'Arifli Mahallesi' },
    { id: 32, district_id: 2, name: 'Bahçelievler Mahallesi' },
    { id: 33, district_id: 2, name: 'Ballıca Mahallesi' },
    { id: 34, district_id: 2, name: 'Bulancak Mahallesi' },
    { id: 35, district_id: 2, name: 'Duacıoğlu Mahallesi' },
    { id: 36, district_id: 2, name: 'Güzelyalı Mahallesi' },
    { id: 37, district_id: 2, name: 'İhsaniye Mahallesi' },
    { id: 38, district_id: 2, name: 'İsmetpaşa Mahallesi' },
    { id: 39, district_id: 2, name: 'Kızılot Mahallesi' },
    { id: 40, district_id: 2, name: 'Pazarsuyu Mahallesi' },
    { id: 41, district_id: 2, name: 'Sanayi Mahallesi' },
    { id: 42, district_id: 2, name: 'Saraçlı Mahallesi' },
    { id: 43, district_id: 2, name: 'Sisin Mahallesi' },
    { id: 44, district_id: 2, name: 'Şemsettin Mahallesi' },
    { id: 45, district_id: 2, name: 'Toprakdeğirmeni Mahallesi' },

    // DİĞER İLÇELER
    { id: 46, district_id: 3, name: 'Çam Mahallesi' },
    { id: 47, district_id: 3, name: 'Esentepe Mahallesi' },
    { id: 48, district_id: 4, name: 'Sayfiye Mahallesi' },
    { id: 49, district_id: 4, name: 'Hendekbaşı Mahallesi' },
    { id: 50, district_id: 5, name: 'Demirci Mahallesi' },
    { id: 51, district_id: 5, name: 'Yeniköy Mahallesi' }
  ],
  users: [
    { id: 1, role_id: 1, full_name: 'Ahmet Yılmaz (Sistem Yöneticisi)', email: 'admin@belediye.gov.tr', phone: '05551112233', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Sistem Yöneticisi' },
    { id: 2, role_id: 2, full_name: 'Mehmet Demir (Fen İşleri Müdürü)', email: 'fenisleri.mudur@belediye.gov.tr', phone: '05552223344', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Birim Yöneticisi', employee_id: 1, department_id: 1, department_name: 'Fen İşleri Müdürlüğü' },
    { id: 3, role_id: 2, full_name: 'Ayşe Kaya (Temizlik Müdürü)', email: 'temizlik.mudur@belediye.gov.tr', phone: '05553334455', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Birim Yöneticisi', employee_id: 2, department_id: 2, department_name: 'Temizlik İşleri Müdürlüğü' },
    { id: 4, role_id: 2, full_name: 'Kemal Özcan (Park Müdürü)', email: 'park.mudur@belediye.gov.tr', phone: '05554443322', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Birim Yöneticisi', employee_id: 3, department_id: 3, department_name: 'Park ve Bahçeler Müdürlüğü' },
    { id: 5, role_id: 2, full_name: 'Hasan Yılmaz (Zabıta Müdürü)', email: 'zabita.mudur@belediye.gov.tr', phone: '05555554433', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Birim Yöneticisi', employee_id: 4, department_id: 4, department_name: 'Zabıta Müdürlüğü' },
    { id: 6, role_id: 2, full_name: 'Mustafa Çelik (Su Müdürü)', email: 'su.mudur@belediye.gov.tr', phone: '05556665544', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Birim Yöneticisi', employee_id: 5, department_id: 5, department_name: 'Su ve Kanalizasyon Müdürlüğü' },
    
    { id: 7, role_id: 3, full_name: 'Ali Usta (Fen İşleri Saha Personeli)', email: 'ali.fen@belediye.gov.tr', phone: '05554445566', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Personel', employee_id: 1, department_id: 1, department_name: 'Fen İşleri Müdürlüğü' },
    { id: 8, role_id: 3, full_name: 'Veli Şahin (Temizlik Saha Personeli)', email: 'veli.temizlik@belediye.gov.tr', phone: '05555556677', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Personel', employee_id: 2, department_id: 2, department_name: 'Temizlik İşleri Müdürlüğü' },
    { id: 9, role_id: 3, full_name: 'Fatma Şahin (Park Saha Personeli)', email: 'fatma.park@belediye.gov.tr', phone: '05556667700', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Personel', employee_id: 3, department_id: 3, department_name: 'Park ve Bahçeler Müdürlüğü' },
    
    { id: 10, role_id: 4, full_name: 'Caner Özkan (Vatandaş)', email: 'caner@gmail.com', phone: '05556667788', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Vatandaş', citizen_id: 6 },
    { id: 11, role_id: 4, full_name: 'Sefa Bodur (Vatandaş)', email: 'sefa@gmail.com', phone: '05557778899', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Vatandaş', citizen_id: 7 }
  ],
  citizens: [
    { id: 6, user_id: 10, identity_number: '12345678901', address: 'Giresun Hacısıyam Mah. Inönü Cad. No:12' },
    { id: 7, user_id: 11, identity_number: '98765432109', address: 'Giresun Hacısıyam Mah. Gazi Cad. No:44' }
  ],
  employees: [
    { id: 1, user_id: 7, department_id: 1, title: 'Asfalt & Kaldırım Ekip Şefi' },
    { id: 2, user_id: 8, department_id: 2, title: 'Atık Yönetimi Görevlisi' },
    { id: 3, user_id: 9, department_id: 3, title: 'Peyzaj ve Bahçe Görevlisi' }
  ],
  complaints: [
    {
      id: 1, tracking_code: 'BLD-2026-000101', citizen_id: 6, user_id: 10, category_id: 2, department_id: 1, district_id: 1, neighborhood_id: 1,
      title: 'Giresun Atatürk Bulvarında Derin Asfalt Çukuru',
      description: 'Giresun Atatürk Bulvarı Valilik önündeki yolda 20 cm derinliğinde büyük bir asfalt çukuru oluşmuştur.',
      open_address: 'Atatürk Bulvarı No:45 Önü, Giresun Merkez', latitude: 40.9110, longitude: 38.3900, urgency_level: 'Acil', priority_level: 'Acil',
      status: 'Personele atandı', is_public: 1, base_upvote_count: 0, upvote_count: 0, contact_preference: 'E-posta', created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      category_name: 'Çukur veya Asfalt Problemi', department_name: 'Fen İşleri Müdürlüğü', district_name: 'Giresun Merkez', neighborhood_name: 'Hacısıyam Mahallesi', citizen_name: 'Caner Özkan (Vatandaş)'
    },
    {
      id: 2, tracking_code: 'BLD-2026-000102', citizen_id: 6, user_id: 10, category_id: 3, department_id: 2, district_id: 1, neighborhood_id: 2,
      title: 'Gazi Caddesinde Çöp Konteyneri Taşmış Durumda',
      description: 'Giresun Gazi Caddesi Garanti Bankası yanında çöp konteynerleri boşaltılmadı.',
      open_address: 'Gazi Cad. No:18 Yanı, Giresun Merkez', latitude: 40.9140, longitude: 38.3870, urgency_level: 'Normal', priority_level: 'Normal',
      status: 'Çözüldü', is_public: 1, base_upvote_count: 0, upvote_count: 0, contact_preference: 'SMS', created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      category_name: 'Çöp ve Çevre Kirliliği', department_name: 'Temizlik İşleri Müdürlüğü', district_name: 'Giresun Merkez', neighborhood_name: 'Nizamiye Mahallesi', citizen_name: 'Caner Özkan (Vatandaş)'
    },
    {
      id: 3, tracking_code: 'BLD-2026-000103', citizen_id: 7, user_id: 11, category_id: 7, department_id: 5, district_id: 1, neighborhood_id: 1,
      title: 'Hacısıyam Mahallesinde Su Kesintisi ve Basınç Düşüklüğü',
      description: 'Hacısıyam Mahallesinde sabah saatlerinden itibaren üst katlarda su basıncı düşüktür.',
      open_address: 'Inönü Cad. No:12, Giresun Merkez', latitude: 40.9095, longitude: 38.3915, urgency_level: 'Yüksek', priority_level: 'Yüksek',
      status: 'Yeni', is_public: 1, base_upvote_count: 0, upvote_count: 0, contact_preference: 'E-posta', created_at: new Date().toISOString(),
      category_name: 'Su Kaçağı', department_name: 'Su ve Kanalizasyon Müdürlüğü', district_name: 'Giresun Merkez', neighborhood_name: 'Hacısıyam Mahallesi', citizen_name: 'Sefa Bodur (Vatandaş)'
    }
  ],
  complaint_upvotes: [],
  complaint_assignments: [],
  complaint_status_history: [
    { id: 1, complaint_id: 1, changed_by_user_id: 6, old_status: null, new_status: 'Yeni', change_reason: 'Vatandaş tarafından talep oluşturuldu.', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), changed_by_name: 'Caner Özkan (Vatandaş)' },
    { id: 2, complaint_id: 1, changed_by_user_id: 2, old_status: 'Yeni', new_status: 'İlgili birime yönlendirildi', change_reason: 'Fen İşleri Müdürlüğü tarafından incelemeye alındı.', created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(), changed_by_name: 'Mehmet Demir (Fen İşleri Müdürü)' },
    { id: 3, complaint_id: 1, changed_by_user_id: 2, old_status: 'İlgili birime yönlendirildi', new_status: 'Personele atandı', change_reason: 'Saha personeli Ali Usta görevlendirildi.', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), changed_by_name: 'Mehmet Demir (Fen İşleri Müdürü)' },
    { id: 4, complaint_id: 2, changed_by_user_id: 6, old_status: null, new_status: 'Yeni', change_reason: 'Vatandaş tarafından talep oluşturuldu.', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), changed_by_name: 'Caner Özkan (Vatandaş)' },
    { id: 5, complaint_id: 2, changed_by_user_id: 3, old_status: 'Yeni', new_status: 'Personele atandı', change_reason: 'Veli Şahin görevlendirildi.', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), changed_by_name: 'Ayşe Kaya (Temizlik Müdürü)' },
    { id: 6, complaint_id: 2, changed_by_user_id: 5, old_status: 'Personele atandı', new_status: 'Çözüldü', change_reason: 'Konteynerler boşaltıldı ve çevresi dezenfekte edildi.', created_at: new Date(Date.now() - 86400000 * 2.5).toISOString(), changed_by_name: 'Veli Şahin (Temizlik Saha Personeli)' }
  ],
  complaint_actions: [
    { id: 1, complaint_id: 2, employee_id: 2, action_description: 'Çöp konteynerleri boşaltıldı ve yıkanarak dezenfekte edildi.', work_done: 'Konteyner temizliği ve yıkanması', tools_equipment_used: 'Çöp Kamyonu 28 BLD 153, Dezenfektan Kit', citizen_response: 'Çözüm sağlandı.', resolution_photo_path: null, employee_name: 'Veli Şahin', employee_title: 'Atık Yönetimi Görevlisi', created_at: new Date(Date.now() - 86400000 * 2.5).toISOString() }
  ],
  complaint_files: [],
  notifications: [],
  satisfaction_surveys: [],
  audit_logs: []
};

// Clean, Direct Upvote Toggle (Memory + MySQL Sync)
async function toggleComplaintUpvote(complaintId, userId) {
  const cId = Number(complaintId);
  const uId = Number(userId);

  if (!memData.complaint_upvotes) memData.complaint_upvotes = [];
  const memComp = memData.complaints.find(c => c.id == cId);

  // Check if upvote exists in memory
  const memIdx = memData.complaint_upvotes.findIndex(u => u.complaint_id == cId && u.user_id == uId);
  let hasUpvoted = false;

  if (memIdx !== -1) {
    memData.complaint_upvotes.splice(memIdx, 1);
    hasUpvoted = false;
  } else {
    memData.complaint_upvotes.push({ complaint_id: cId, user_id: uId });
    hasUpvoted = true;
  }

  const memCount = memData.complaint_upvotes.filter(u => u.complaint_id == cId).length;
  if (memComp) {
    memComp.upvote_count = memCount;
  }

  let finalCount = memCount;

  // Real MySQL Sync
  if (!useMemoryFallback && realPool) {
    try {
      await realPool.query(`
        CREATE TABLE IF NOT EXISTS complaint_upvotes (
          complaint_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (complaint_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const [existing] = await realPool.query(
        'SELECT * FROM complaint_upvotes WHERE complaint_id = ? AND user_id = ?',
        [cId, uId]
      );

      if (existing && existing.length > 0) {
        await realPool.query('DELETE FROM complaint_upvotes WHERE complaint_id = ? AND user_id = ?', [cId, uId]);
        hasUpvoted = false;
      } else {
        await realPool.query('INSERT IGNORE INTO complaint_upvotes (complaint_id, user_id) VALUES (?, ?)', [cId, uId]);
        hasUpvoted = true;
      }

      await realPool.query(
        'UPDATE complaints SET upvote_count = (SELECT COUNT(*) FROM complaint_upvotes WHERE complaint_id = ?) WHERE id = ?',
        [cId, cId]
      );

      const [rows] = await realPool.query('SELECT upvote_count FROM complaints WHERE id = ?', [cId]);
      if (rows && rows.length > 0 && rows[0].upvote_count !== undefined) {
        finalCount = rows[0].upvote_count;
        if (memComp) memComp.upvote_count = finalCount;
      }
    } catch (err) {
      console.error('MySQL upvote sync error:', err);
    }
  }

  return {
    success: true,
    has_upvoted: hasUpvoted,
    upvote_count: finalCount
  };
}

async function getUpvotedComplaintIdsForUser(userId) {
  const uId = Number(userId);
  const upvotedSet = new Set();

  if (memData && memData.complaint_upvotes) {
    memData.complaint_upvotes.filter(u => u.user_id == uId).forEach(u => upvotedSet.add(Number(u.complaint_id)));
  }

  if (!useMemoryFallback && realPool) {
    try {
      const [rows] = await realPool.query('SELECT complaint_id FROM complaint_upvotes WHERE user_id = ?', [uId]);
      if (rows && Array.isArray(rows)) {
        rows.forEach(r => upvotedSet.add(Number(r.complaint_id)));
      }
    } catch (err) {
      // Table might not exist yet
    }
  }

  return upvotedSet;
}

async function initializeDatabase() {
  try {
    const testPool = mysql.createPool(dbConfig);
    const conn = await testPool.getConnection();
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.changeUser({ database: dbConfig.database });
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await conn.query(schemaSql);
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS complaint_upvotes (
        complaint_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (complaint_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Clean reset upvote counts to match complaint_upvotes table exactly
    await conn.query(`UPDATE complaints SET upvote_count = (SELECT COUNT(*) FROM complaint_upvotes WHERE complaint_upvotes.complaint_id = complaints.id);`);

    conn.release();
    realPool = testPool;
    useMemoryFallback = false;
    console.log('✅ MySQL veritabanına başarıyla bağlanıldı.');
  } catch (err) {
    useMemoryFallback = true;
    console.log('ℹ️ MySQL sunucusu pasif, kesintisiz In-Memory modunda çalışılıyor.');
  }
}

// Resilient pool proxy handler
const resilientPool = {
  async query(sql, params = []) {
    const sqlUpper = sql.trim().toUpperCase();

    if (!useMemoryFallback && realPool) {
      try {
        const result = await realPool.query(sql, params);
        return result;
      } catch (err) {
        console.warn('MySQL query error, using memory fallback:', err.message);
        useMemoryFallback = true;
      }
    }

    if (sqlUpper.startsWith('SELECT')) {
      if (sqlUpper.includes('FROM USERS')) {
        let res = memData.users.map(u => ({
          ...u,
          role_name: u.role_name || (u.role_id === 1 ? 'Sistem Yöneticisi' : (u.role_id === 2 ? 'Birim Yöneticisi' : (u.role_id === 3 ? 'Personel' : 'Vatandaş')))
        }));
        if (params && params.length > 0 && params[0]) {
          const searchVal = String(params[0]).trim().toLowerCase();
          res = res.filter(u => u.email.toLowerCase() === searchVal || String(u.id) === searchVal);
        }
        return [res];
      }

      if (sqlUpper.includes('FROM COMPLAINT_CATEGORIES')) {
        let res = memData.complaint_categories.map(c => {
          const dept = memData.departments.find(d => d.id === c.department_id);
          return { ...c, department_name: dept ? dept.name : 'Fen İşleri Müdürlüğü' };
        });
        if (params && params[0]) {
          res = res.filter(c => c.id == params[0]);
        }
        return [res];
      }

      if (sqlUpper.includes('FROM CITIZENS')) {
        let res = [...memData.citizens];
        if (params && params[0]) {
          res = res.filter(c => c.user_id == params[0] || c.id == params[0]);
        }
        return [res];
      }

      if (sqlUpper.includes('FROM DEPARTMENTS')) {
        return [[...memData.departments]];
      }

      if (sqlUpper.includes('FROM DISTRICTS')) {
        return [[...memData.districts]];
      }

      if (sqlUpper.includes('FROM NEIGHBORHOODS')) {
        return [[...memData.neighborhoods]];
      }

      if (sqlUpper.includes('FROM COMPLAINTS')) {
        if (sqlUpper.includes('TRACKING_CODE =')) {
          const found = memData.complaints.filter(c => c.tracking_code === params[0]);
          return [found];
        }
        if (sqlUpper.includes('WHERE ID =') || sqlUpper.includes('WHERE C.ID =')) {
          const found = memData.complaints.filter(c => c.id == params[0]);
          return [found];
        }
        if (sqlUpper.includes('COUNT(*)')) {
          let filtered = [...memData.complaints];
          if (params && params.length > 0) {
            if (sqlUpper.includes('CITIZEN_ID =')) {
              filtered = filtered.filter(c => c.citizen_id == params[0]);
            } else if (sqlUpper.includes('DEPARTMENT_ID =')) {
              filtered = filtered.filter(c => c.department_id == params[0]);
            } else if (sqlUpper.includes('IS_PUBLIC = 1')) {
              filtered = filtered.filter(c => c.is_public == 1);
            }
          }
          return [[{ count: filtered.length }]];
        }

        let results = [...memData.complaints];
        if (sqlUpper.includes('IS_PUBLIC = 1') || sqlUpper.includes('IS_PUBLIC = ?')) {
          results = results.filter(c => c.is_public == 1);
        }
        if (params && params.length > 0) {
          if (sqlUpper.includes('CITIZEN_ID =')) {
            results = results.filter(c => c.citizen_id == params[0]);
          } else if (sqlUpper.includes('DEPARTMENT_ID =')) {
            results = results.filter(c => c.department_id == params[0]);
          }
        }
        return [results];
      }

      if (sqlUpper.includes('FROM EMPLOYEES')) {
        let res = memData.employees.map(e => {
          const u = memData.users.find(usr => usr.id === e.user_id);
          return { ...e, full_name: u ? u.full_name : 'Personel', email: u ? u.email : '', phone: u ? u.phone : '' };
        });
        if (params && params[0]) res = res.filter(e => e.department_id == params[0] || e.id == params[0]);
        return [res];
      }

      if (sqlUpper.includes('FROM COMPLAINT_STATUS_HISTORY')) {
        return [memData.complaint_status_history.filter(h => h.complaint_id == params[0])];
      }

      if (sqlUpper.includes('FROM COMPLAINT_FILES')) {
        return [memData.complaint_files.filter(f => f.complaint_id == params[0])];
      }

      if (sqlUpper.includes('FROM COMPLAINT_ACTIONS')) {
        return [memData.complaint_actions.filter(a => a.complaint_id == params[0])];
      }

      if (sqlUpper.includes('FROM SATISFACTION_SURVEYS')) {
        if (sqlUpper.includes('AVG(RATING)')) {
          const avg = memData.satisfaction_surveys.length > 0
            ? memData.satisfaction_surveys.reduce((a, b) => a + b.rating, 0) / memData.satisfaction_surveys.length
            : 5.0;
          return [[{ avg_rating: avg, survey_count: memData.satisfaction_surveys.length }]];
        }
        return [memData.satisfaction_surveys.filter(s => s.complaint_id == params[0])];
      }

      if (sqlUpper.includes('FROM NOTIFICATIONS')) {
        return [memData.notifications.filter(n => n.user_id == params[0])];
      }

      if (sqlUpper.includes('FROM AUDIT_LOGS')) {
        return [memData.audit_logs];
      }

      return [[]];
    }

    if (sqlUpper.startsWith('INSERT')) {
      if (sqlUpper.includes('INTO USERS')) {
        const newId = memData.users.length + 1;
        const newUser = {
          id: newId,
          role_id: params[0],
          full_name: params[1],
          email: params[2],
          phone: params[3],
          password_hash: params[4],
          is_active: 1,
          role_name: params[0] == 4 ? 'Vatandaş' : 'Personel'
        };
        memData.users.push(newUser);
        return [{ insertId: newId }];
      }

      if (sqlUpper.includes('INTO CITIZENS')) {
        const newId = memData.citizens.length + 1;
        memData.citizens.push({ id: newId, user_id: params[0], identity_number: params[1], address: params[2] });
        return [{ insertId: newId }];
      }

      if (sqlUpper.includes('INTO COMPLAINTS')) {
        const newId = memData.complaints.length + 1;
        const cat = memData.complaint_categories.find(c => c.id == params[2]) || { name: 'Genel', department_name: 'Fen İşleri' };
        const neigh = memData.neighborhoods.find(n => n.id == params[5]) || { name: 'Hacısıyam Mahallesi' };
        const dist = memData.districts.find(d => d.id == params[4]) || { name: 'Giresun Merkez' };
        const isPublicVal = (params[13] !== undefined && params[13] !== null) ? Number(params[13]) : 1;
        const creatorId = Number(params[1]) || 6;
        const creatorObj = memData.users.find(u => u.id == creatorId);
        const creatorName = creatorObj ? creatorObj.full_name : 'Vatandaş';

        const newComplaint = {
          id: newId,
          tracking_code: params[0],
          citizen_id: creatorId,
          user_id: creatorId,
          category_id: params[2],
          department_id: params[3],
          district_id: params[4],
          neighborhood_id: params[5],
          title: params[6],
          description: params[7],
          open_address: params[8],
          latitude: params[9] || 40.9128,
          longitude: params[10] || 38.3895,
          urgency_level: params[11],
          priority_level: params[12],
          status: 'Yeni',
          is_public: isPublicVal,
          upvote_count: 0,
          contact_preference: params[14],
          submission_type: params[15] || 'Şikâyet',
          created_at: new Date().toISOString(),
          category_name: cat.name,
          department_name: cat.department_name,
          district_name: dist.name,
          neighborhood_name: neigh.name,
          citizen_name: creatorName
        };
        memData.complaints.unshift(newComplaint);
        return [{ insertId: newId }];
      }

      if (sqlUpper.includes('INTO COMPLAINT_STATUS_HISTORY')) {
        memData.complaint_status_history.push({ complaint_id: params[0], changed_by_user_id: params[1], old_status: params[2], new_status: params[3], change_reason: params[4], created_at: new Date().toISOString(), changed_by_name: 'Sistem' });
        return [{ insertId: memData.complaint_status_history.length }];
      }

      if (sqlUpper.includes('INTO COMPLAINT_FILES')) {
        memData.complaint_files.push({ id: memData.complaint_files.length + 1, complaint_id: params[0], file_path: params[1], file_name: params[2], file_type: params[3], file_size: params[4], uploaded_by_user_id: params[5], file_category: params[6] });
        return [{ insertId: memData.complaint_files.length }];
      }

      if (sqlUpper.includes('INTO NOTIFICATIONS')) {
        memData.notifications.push({ id: memData.notifications.length + 1, user_id: params[0], title: params[1], message: params[2], type: params[3], reference_id: params[4], created_at: new Date().toISOString() });
        return [{ insertId: memData.notifications.length }];
      }

      if (sqlUpper.includes('INTO AUDIT_LOGS')) {
        memData.audit_logs.push({ id: memData.audit_logs.length + 1, user_id: params[0], action: params[1], entity_name: params[2], entity_id: params[3], old_value: params[4], new_value: params[5], ip_address: params[6], created_at: new Date().toISOString() });
        return [{ insertId: memData.audit_logs.length }];
      }

      return [{ insertId: 1 }];
    }

    if (sqlUpper.startsWith('UPDATE')) {
      if (sqlUpper.includes('UPDATE COMPLAINTS')) {
        const compId = params[params.length - 1];
        const comp = memData.complaints.find(c => c.id == compId || c.tracking_code == compId);
        if (comp) {
          if (sqlUpper.includes("STATUS = 'PERSONELE ATANDI'") || (params[0] === 'Personele atandı')) {
            comp.status = 'Personele atandı';
          } else if (sqlUpper.includes("STATUS = 'İLGİLİ BİRİME YÖNLENDİRİLDİ'") || (params[0] === 'İlgili birime yönlendirildi')) {
            comp.status = 'İlgili birime yönlendirildi';
          } else if (sqlUpper.includes("STATUS = 'ÇÖZÜLDÜ'") || (params[0] === 'Çözüldü')) {
            comp.status = 'Çözüldü';
          } else if (sqlUpper.includes("STATUS = 'İPTAL EDİLDİ'") || (params[0] === 'İptal edildi')) {
            comp.status = 'İptal edildi';
          } else if (params[0] && typeof params[0] === 'string' && params[0] !== 'Düşük' && params[0] !== 'Normal' && params[0] !== 'Yüksek' && params[0] !== 'Acil' && params[0] !== 'Kritik') {
            comp.status = params[0];
          }

          if (params[0] && ['Düşük', 'Normal', 'Yüksek', 'Acil', 'Kritik'].includes(params[0])) {
            comp.priority_level = params[0];
          } else if (params[1] && ['Düşük', 'Normal', 'Yüksek', 'Acil', 'Kritik'].includes(params[1])) {
            comp.priority_level = params[1];
          }

          if (sqlUpper.includes('DEPARTMENT_ID =')) {
            comp.department_id = params[0];
            const deptObj = memData.departments.find(d => d.id == params[0]);
            if (deptObj) comp.department_name = deptObj.name;
          }
        }
        return [{ affectedRows: 1 }];
      }

      if (sqlUpper.includes('UPDATE USERS')) {
        const userId = params[params.length - 1];
        const user = memData.users.find(u => u.id == userId);
        if (user) {
          if (params[0]) user.full_name = params[0];
          if (params[1]) user.phone = params[1];
          if (sqlUpper.includes('IS_ACTIVE = 0')) user.is_active = 0;
          if (sqlUpper.includes('PASSWORD_HASH =')) user.password_hash = params[0];
        }
        return [{ affectedRows: 1 }];
      }

      if (sqlUpper.includes('UPDATE CITIZENS')) {
        const userId = params[params.length - 1];
        const cit = memData.citizens.find(c => c.user_id == userId || c.id == userId);
        if (cit && params[0]) {
          cit.address = params[0];
        }
        return [{ affectedRows: 1 }];
      }

      return [{ affectedRows: 1 }];
    }

    return [[]];
  },

  async getConnection() {
    return {
      query: this.query.bind(this),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
};

async function createSystemNotification({ user_id, department_id, title, message, type = 'Sistem', reference_id = null }) {
  if (!memData.notifications) memData.notifications = [];

  const notifObj = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    user_id: user_id || null,
    department_id: department_id || null,
    title,
    message,
    is_read: 0,
    type,
    reference_id: reference_id || null,
    created_at: new Date().toISOString()
  };

  memData.notifications.unshift(notifObj);

  if (!useMemoryFallback && realPool) {
    try {
      await realPool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT DEFAULT NULL,
          department_id INT DEFAULT NULL,
          title VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          is_read TINYINT(1) DEFAULT 0,
          type VARCHAR(50) DEFAULT 'Sistem',
          reference_id INT DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await realPool.query(
        `INSERT INTO notifications (user_id, department_id, title, message, type, reference_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id || null, department_id || null, title, message, type, reference_id || null]
      );
    } catch (err) {
      console.error('MySQL notification insert error:', err);
    }
  }

  return notifObj;
}

module.exports = {
  pool: resilientPool,
  initializeDatabase,
  memData,
  toggleComplaintUpvote,
  getUpvotedComplaintIdsForUser,
  createSystemNotification
};
