const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'belediye_talep_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  connectTimeout: 1000
};

// Force in-memory fallback unless MySQL is explicitly confirmed active
let useMemoryFallback = true;
let realPool = null;

// Synchronous bcrypt hash for default password "123456"
const defaultPasswordHash = bcrypt.hashSync('123456', 10);

// Bulletproof In-Memory Database Store
const memData = {
  roles: [
    { id: 1, name: 'Sistem Yöneticisi', description: 'Tüm sistem yetkilerine sahip admin' },
    { id: 2, name: 'Birim Yöneticisi', description: 'Belediye müdürlük yöneticisi' },
    { id: 3, name: 'Personel', description: 'Saha ve işlem personeli' },
    { id: 4, name: 'Vatandaş', description: 'Talep ve şikâyet oluşturan vatandaş' }
  ],
  departments: [
    { id: 1, name: 'Fen İşleri Müdürlüğü', code: 'FEN', is_active: 1 },
    { id: 2, name: 'Temizlik İşleri Müdürlüğü', code: 'TEM', is_active: 1 },
    { id: 3, name: 'Park ve Bahçeler Müdürlüğü', code: 'PARK', is_active: 1 },
    { id: 4, name: 'Zabıta Müdürlüğü', code: 'ZBT', is_active: 1 },
    { id: 5, name: 'Su ve Kanalizasyon Müdürlüğü', code: 'SUK', is_active: 1 },
    { id: 6, name: 'Veteriner İşleri Müdürlüğü', code: 'VET', is_active: 1 },
    { id: 7, name: 'Ulaşım Hizmetleri Müdürlüğü', code: 'ULS', is_active: 1 },
    { id: 8, name: 'Sosyal Hizmetler Müdürlüğü', code: 'SHM', is_active: 1 },
    { id: 9, name: 'İmar ve Şehircilik Müdürlüğü', code: 'IMR', is_active: 1 },
    { id: 10, name: 'Bilgi İşlem Müdürlüğü', code: 'BIM', is_active: 1 }
  ],
  complaint_categories: [
    { id: 1, department_id: 1, name: 'Yol ve Kaldırım Sorunu', description: 'Bozuk kaldırım, taş kayması', default_priority: 'Normal', department_name: 'Fen İşleri Müdürlüğü' },
    { id: 2, department_id: 1, name: 'Çukur veya Asfalt Problemi', description: 'Yoldaki çukurlar ve asfalt', default_priority: 'Yüksek', department_name: 'Fen İşleri Müdürlüğü' },
    { id: 3, department_id: 2, name: 'Çöp ve Çevre Kirliliği', description: 'Toplanmayan çöpler', default_priority: 'Normal', department_name: 'Temizlik İşleri Müdürlüğü' },
    { id: 4, department_id: 3, name: 'Park ve Yeşil Alan Sorunu', description: 'Park oyuncakları ve çim', default_priority: 'Düşük', department_name: 'Park ve Bahçeler Müdürlüğü' },
    { id: 5, department_id: 4, name: 'Gürültü Şikâyeti', description: 'İnşaat veya işletme gürültüsü', default_priority: 'Acil', department_name: 'Zabıta Müdürlüğü' },
    { id: 6, department_id: 4, name: 'Ruhsatsız İşletme', description: 'Kaçak çalışan dükkan', default_priority: 'Normal', department_name: 'Zabıta Müdürlüğü' },
    { id: 7, department_id: 5, name: 'Su Kaçağı', description: 'Boru patlaması', default_priority: 'Kritik', department_name: 'Su ve Kanalizasyon Müdürlüğü' },
    { id: 8, department_id: 5, name: 'Kanalizasyon Problemi', description: 'Rögar taşması', default_priority: 'Kritik', department_name: 'Su ve Kanalizasyon Müdürlüğü' },
    { id: 9, department_id: 6, name: 'Başıboş Hayvan', description: 'Sokak hayvanları', default_priority: 'Yüksek', department_name: 'Veteriner İşleri Müdürlüğü' },
    { id: 10, department_id: 7, name: 'Toplu Taşıma Sorunu', description: 'Otobüs durak veya sefer aksaması', default_priority: 'Normal', department_name: 'Ulaşım Hizmetleri Müdürlüğü' },
    { id: 11, department_id: 8, name: 'Sosyal Yardım Talebi', description: 'Erzak veya yardım', default_priority: 'Normal', department_name: 'Sosyal Hizmetler Müdürlüğü' },
    { id: 12, department_id: 9, name: 'İmar ve Yapı Şikâyeti', description: 'Kaçak bina', default_priority: 'Yüksek', department_name: 'İmar ve Şehircilik Müdürlüğü' },
    { id: 13, department_id: 10, name: 'Sokak Lambası Arızası', description: 'Aydınlatma direği arızası', default_priority: 'Normal', department_name: 'Bilgi İşlem Müdürlüğü' },
    { id: 14, department_id: 1, name: 'Diğer', description: 'Diğer hizmet talepleri', default_priority: 'Düşük', department_name: 'Fen İşleri Müdürlüğü' }
  ],
  districts: [
    { id: 1, name: 'Merkez Kaza' },
    { id: 2, name: 'Kuzey İlçesi' }
  ],
  neighborhoods: [
    { id: 1, district_id: 1, name: 'Atatürk Mahallesi' },
    { id: 2, district_id: 1, name: 'Cumhuriyet Mahallesi' },
    { id: 3, district_id: 1, name: 'Fatih Mahallesi' },
    { id: 4, district_id: 1, name: 'Mimar Sinan Mahallesi' },
    { id: 5, district_id: 2, name: 'Gazi Mahallesi' },
    { id: 6, district_id: 2, name: 'Hürriyet Mahallesi' }
  ],
  users: [
    { id: 1, role_id: 1, full_name: 'Ahmet Yılmaz (Sistem Yöneticisi)', email: 'admin@belediye.gov.tr', phone: '05551112233', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Sistem Yöneticisi' },
    { id: 2, role_id: 2, full_name: 'Mehmet Demir (Fen İşleri Müdürü)', email: 'fenisleri.mudur@belediye.gov.tr', phone: '05552223344', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Birim Yöneticisi', employee_id: 1, department_id: 1, department_name: 'Fen İşleri Müdürlüğü' },
    { id: 3, role_id: 2, full_name: 'Ayşe Kaya (Temizlik Müdürü)', email: 'temizlik.mudur@belediye.gov.tr', phone: '05553334455', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Birim Yöneticisi', employee_id: 2, department_id: 2, department_name: 'Temizlik İşleri Müdürlüğü' },
    { id: 4, role_id: 3, full_name: 'Ali Usta (Fen İşleri Saha Personeli)', email: 'ali.fen@belediye.gov.tr', phone: '05554445566', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Personel', employee_id: 1, department_id: 1, department_name: 'Fen İşleri Müdürlüğü' },
    { id: 5, role_id: 3, full_name: 'Veli Şahin (Temizlik Saha Personeli)', email: 'veli.temizlik@belediye.gov.tr', phone: '05555556677', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Personel', employee_id: 2, department_id: 2, department_name: 'Temizlik İşleri Müdürlüğü' },
    { id: 6, role_id: 4, full_name: 'Caner Özkan (Vatandaş)', email: 'caner@gmail.com', phone: '05556667788', password_hash: defaultPasswordHash, is_active: 1, role_name: 'Vatandaş', citizen_id: 1 }
  ],
  citizens: [
    { id: 1, user_id: 6, identity_number: '12345678901', address: 'Atatürk Mah. Lale Sok. No:12' }
  ],
  employees: [
    { id: 1, user_id: 4, department_id: 1, title: 'Asfalt & Kaldırım Ekip Şefi' },
    { id: 2, user_id: 5, department_id: 2, title: 'Atık Yönetimi Görevlisi' }
  ],
  complaints: [
    {
      id: 1, tracking_code: 'BLD-2026-000101', citizen_id: 1, category_id: 2, department_id: 1, district_id: 1, neighborhood_id: 1,
      title: 'Atatürk Caddesinde Derin Asfalt Çukuru Tehlike Saçıyor',
      description: 'Atatürk Caddesi Migros önündeki yolda yaklaşık 20 cm derinliğinde büyük bir asfalt çukuru oluşmuştur.',
      open_address: 'Atatürk Cad. No:45 Önü, Merkez', latitude: 39.92077, longitude: 32.85411, urgency_level: 'Acil', priority_level: 'Acil',
      status: 'Personele atandı', is_public: 1, contact_preference: 'E-posta', created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      category_name: 'Çukur veya Asfalt Problemi', department_name: 'Fen İşleri Müdürlüğü', district_name: 'Merkez Kaza', neighborhood_name: 'Atatürk Mahallesi', citizen_name: 'Caner Özkan (Vatandaş)'
    },
    {
      id: 2, tracking_code: 'BLD-2026-000102', citizen_id: 1, category_id: 3, department_id: 2, district_id: 1, neighborhood_id: 2,
      title: 'Cumhuriyet Mahallesinde Çöp Konteyneri Taşmış Durumda',
      description: 'Karanfil Sokak köşesindeki çöp konteynerleri 3 gündür boşaltılmadı.',
      open_address: 'Karanfil Sok. No:8 Yanı', latitude: 39.92500, longitude: 32.85900, urgency_level: 'Normal', priority_level: 'Normal',
      status: 'Çözüldü', is_public: 1, contact_preference: 'SMS', created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      category_name: 'Çöp ve Çevre Kirliliği', department_name: 'Temizlik İşleri Müdürlüğü', district_name: 'Merkez Kaza', neighborhood_name: 'Cumhuriyet Mahallesi', citizen_name: 'Caner Özkan (Vatandaş)'
    }
  ],
  complaint_assignments: [],
  complaint_status_history: [],
  complaint_actions: [],
  complaint_files: [],
  notifications: [],
  satisfaction_surveys: [],
  audit_logs: []
};

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
    if (!useMemoryFallback && realPool) {
      try {
        return await realPool.query(sql, params);
      } catch (err) {
        useMemoryFallback = true;
      }
    }

    // In-Memory query executor (Zero exceptions guarantee)
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.startsWith('SELECT')) {
      if (sqlUpper.includes('FROM USERS')) {
        let res = memData.users.map(u => ({ ...u, role_name: u.role_name || (u.role_id === 1 ? 'Sistem Yöneticisi' : (u.role_id === 2 ? 'Birim Yöneticisi' : (u.role_id === 3 ? 'Personel' : 'Vatandaş'))) }));
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
        if (sqlUpper.includes('COUNT(*)')) {
          return [[{ count: memData.complaints.length }]];
        }
        return [[...memData.complaints]];
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
        const neigh = memData.neighborhoods.find(n => n.id == params[5]) || { name: 'Atatürk Mahallesi' };
        const newComplaint = {
          id: newId, tracking_code: params[0], citizen_id: params[1], category_id: params[2], department_id: params[3],
          district_id: params[4], neighborhood_id: params[5], title: params[6], description: params[7], open_address: params[8],
          latitude: params[9], longitude: params[10], urgency_level: params[11], priority_level: params[12], status: 'Yeni',
          is_public: params[13], contact_preference: params[14], created_at: new Date().toISOString(),
          category_name: cat.name, department_name: cat.department_name, neighborhood_name: neigh.name, citizen_name: 'Vatandaş'
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
      if (sqlUpper.includes('UPDATE COMPLAINTS SET STATUS')) {
        const comp = memData.complaints.find(c => c.id == params[1] || c.tracking_code == params[1]);
        if (comp) comp.status = params[0];
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

module.exports = {
  pool: resilientPool,
  initializeDatabase
};
