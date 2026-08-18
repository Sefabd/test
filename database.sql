-- ============================================================================
-- Bulancak Belediyesi 153 Çözüm Merkezi - Veritabanı Şeması ve Başlangıç Verileri
-- Sürüm: v1.0 Production Release
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLLER (ROLES)
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. KULLANICILAR (USERS)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  department_id INT DEFAULT NULL,
  employee_id INT DEFAULT NULL,
  citizen_id INT DEFAULT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MÜDÜRLÜKLER / BİRİMLER (DEPARTMENTS)
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) DEFAULT NULL,
  manager_user_id INT DEFAULT NULL,
  vice_mayor_user_id INT DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ŞİKAYET KATEGORİLERİ (COMPLAINT_CATEGORIES)
DROP TABLE IF EXISTS complaint_categories;
CREATE TABLE complaint_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  department_name VARCHAR(100) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  default_priority ENUM('Düşük', 'Normal', 'Acil') DEFAULT 'Normal',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. İLÇELER VE MAHALLELER (DISTRICTS & NEIGHBORHOODS)
DROP TABLE IF EXISTS districts;
CREATE TABLE districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  lat DECIMAL(10, 6) DEFAULT 40.9385,
  lng DECIMAL(10, 6) DEFAULT 38.2300,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS neighborhoods;
CREATE TABLE neighborhoods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PERSONELLER (EMPLOYEES)
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  department_id INT NOT NULL,
  title VARCHAR(100) DEFAULT 'Saha Personeli',
  phone VARCHAR(20) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TALEPLER / ŞİKAYETLER (COMPLAINTS)
DROP TABLE IF EXISTS complaints;
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT DEFAULT NULL,
  citizen_id INT DEFAULT NULL,
  category_id INT NOT NULL,
  department_id INT NOT NULL,
  district_id INT NOT NULL DEFAULT 1,
  neighborhood_id INT NOT NULL,
  assigned_to_user_id INT DEFAULT NULL,
  assigned_employee_id INT DEFAULT NULL,
  forwarded_from_department_id INT DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  open_address TEXT DEFAULT NULL,
  latitude DECIMAL(10, 6) DEFAULT 40.9385,
  longitude DECIMAL(10, 6) DEFAULT 38.2300,
  urgency_level ENUM('Düşük', 'Normal', 'Acil') DEFAULT 'Normal',
  priority_level ENUM('Düşük', 'Normal', 'Acil') DEFAULT 'Normal',
  status VARCHAR(50) DEFAULT 'Yeni',
  submission_type VARCHAR(50) DEFAULT 'Şikâyet',
  contact_preference VARCHAR(50) DEFAULT 'E-posta',
  is_public TINYINT(1) DEFAULT 1,
  upvote_count INT DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT NULL,
  rating_comment TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SÜREÇ VE İŞLEM LOGLARI (COMPLAINT_STATUS_HISTORY & ACTIONS)
DROP TABLE IF EXISTS complaint_status_history;
CREATE TABLE complaint_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  changed_by_user_id INT DEFAULT NULL,
  old_status VARCHAR(50) DEFAULT 'Yok',
  new_status VARCHAR(50) DEFAULT 'Yeni',
  change_reason TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS complaint_actions;
CREATE TABLE complaint_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  employee_id INT NOT NULL,
  action_description TEXT NOT NULL,
  work_done TEXT DEFAULT NULL,
  tools_equipment_used TEXT DEFAULT NULL,
  citizen_response TEXT DEFAULT NULL,
  resolution_photo_path VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. DOSYALAR (COMPLAINT_FILES)
DROP TABLE IF EXISTS complaint_files;
CREATE TABLE complaint_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(150) DEFAULT NULL,
  file_type VARCHAR(50) DEFAULT NULL,
  file_size INT DEFAULT NULL,
  uploaded_by_user_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. ANKETLER (SATISFACTION_SURVEYS)
DROP TABLE IF EXISTS satisfaction_surveys;
CREATE TABLE satisfaction_surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  citizen_id INT DEFAULT NULL,
  user_id INT DEFAULT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_comment TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BİLDİRİMLER (NOTIFICATIONS)
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  department_id INT DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  type VARCHAR(50) DEFAULT 'Sistem',
  reference_id VARCHAR(50) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. DUYURULAR (ANNOUNCEMENTS)
DROP TABLE IF EXISTS announcements;
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Genel Duyuru',
  priority VARCHAR(50) DEFAULT 'Normal',
  created_by_user_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. AUDIT LOGLARI (AUDIT_LOGS)
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(50) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VERİ EKLEME (SEED DATA)
-- ============================================================================

-- Roles
INSERT INTO roles (id, name, description) VALUES
  (1, 'Sistem Yöneticisi', 'Tam yetkili sistem yöneticisi'),
  (2, 'Birim Yöneticisi', 'Belediye müdürlük yöneticisi'),
  (3, 'Personel', 'Belediye saha veya masa başı iş takip personeli'),
  (4, 'Vatandaş', 'Sisteme kayıtlı vatandaş'),
  (5, 'Belediye Başkanı', 'Tüm belediye verilerini inceleyen üst düzey gözlemci (Read-Only)'),
  (6, 'Belediye Başkan Yardımcısı', 'Kendisine bağlı birimleri yöneten ve izleyen başkan yardımcısı');

-- Departments
INSERT INTO departments (id, name, code, manager_user_id, vice_mayor_user_id, email, phone) VALUES
  (1, 'Fen İşleri Müdürlüğü', 'FEN', NULL, 62, NULL, NULL),
  (2, 'Temizlik İşleri Müdürlüğü', 'TEM', NULL, 61, NULL, NULL),
  (3, 'Park ve Bahçeler Müdürlüğü', 'PARK', NULL, 62, NULL, NULL),
  (4, 'Zabıta Müdürlüğü', 'ZBT', NULL, 61, NULL, NULL),
  (5, 'Su ve Kanalizasyon Müdürlüğü', 'SUK', NULL, 59, NULL, NULL),
  (6, 'Veteriner İşleri Müdürlüğü', 'VET', NULL, 62, NULL, NULL),
  (7, 'Ulaşım Hizmetleri Müdürlüğü', 'ULS', NULL, 61, NULL, NULL),
  (8, 'Sosyal Hizmetler Müdürlüğü', 'SHM', NULL, 59, NULL, NULL),
  (9, 'İmar ve Şehircilik Müdürlüğü', 'IMR', NULL, 61, NULL, NULL),
  (10, 'Bilgi İşlem Müdürlüğü', 'BIM', NULL, 62, NULL, NULL),
  (11, '153 Çözüm Koordinasyon Masası', '153-TRIAGE', NULL, 61, NULL, NULL);

-- Categories
INSERT INTO complaint_categories (id, department_id, name, department_name, default_priority) VALUES
  (1, 1, 'Yol ve Kaldırım Sorunu', NULL, 'Normal'),
  (2, 1, 'Çukur veya Asfalt Problemi', NULL, 'Acil'),
  (3, 2, 'Çöp ve Çevre Kirliliği', NULL, 'Normal'),
  (4, 3, 'Park ve Yeşil Alan Sorunu', NULL, 'Düşük'),
  (5, 4, 'Gürültü Şikâyeti', NULL, 'Normal'),
  (6, 4, 'Ruhsatsız İşletme', NULL, 'Yüksek'),
  (7, 5, 'Su Kaçağı', NULL, 'Acil'),
  (8, 5, 'Kanalizasyon Problemi', NULL, 'Yüksek'),
  (9, 6, 'Başıboş Hayvan', NULL, 'Normal'),
  (10, 7, 'Toplu Taşıma Sorunu', NULL, 'Normal'),
  (11, 8, 'Sosyal Yardım Talebi', NULL, 'Düşük'),
  (12, 9, 'İmar ve Yapı Şikâyeti', NULL, 'Normal'),
  (13, 10, 'Sokak Lambası Arızası', NULL, 'Normal'),
  (14, 1, 'Diğer', NULL, 'Normal');

-- Districts
INSERT INTO districts (id, name, lat, lng) VALUES
  (1, 'Bulancak', 40.9385, 38.23);

-- Neighborhoods
INSERT INTO neighborhoods (id, district_id, name, lat, lng) VALUES
  (1, 1, 'Acısu Mahallesi', undefined, undefined),
  (2, 1, 'Ahurlu Mahallesi', undefined, undefined),
  (3, 1, 'Alibey Mahallesi', undefined, undefined),
  (4, 1, 'Arifli Mahallesi', undefined, undefined),
  (5, 1, 'Aydınlar Mahallesi', undefined, undefined),
  (6, 1, 'Bahçelievler Mahallesi', undefined, undefined),
  (7, 1, 'Ballıca Mahallesi', undefined, undefined),
  (8, 1, 'Bulancak Mahallesi', undefined, undefined),
  (9, 1, 'Derecikalan Mahallesi', undefined, undefined),
  (10, 1, 'Duacıoğlu Mahallesi', undefined, undefined),
  (11, 1, 'Düz Mahallesi', undefined, undefined),
  (12, 1, 'Güney Mahallesi', undefined, undefined),
  (13, 1, 'Güzelyalı Mahallesi', undefined, undefined),
  (14, 1, 'Güzelyurt Mahallesi', undefined, undefined),
  (15, 1, 'İhsaniye Mahallesi', undefined, undefined),
  (16, 1, 'İsmet Paşa Mahallesi', undefined, undefined),
  (17, 1, 'Kızılot Mahallesi', undefined, undefined),
  (18, 1, 'Merkez Mahallesi', undefined, undefined),
  (19, 1, 'Pazarsuyu Mahallesi', undefined, undefined),
  (20, 1, 'Pazarsuyu Emecen Mahallesi', undefined, undefined),
  (21, 1, 'Sanayi Mahallesi', undefined, undefined),
  (22, 1, 'Saraçlı Mahallesi', undefined, undefined),
  (23, 1, 'Şemsettin Mahallesi', undefined, undefined),
  (24, 1, 'Sisin Mahallesi', undefined, undefined),
  (25, 1, 'Sofulu Mahallesi', undefined, undefined),
  (26, 1, 'Soğuksu Mahallesi', undefined, undefined),
  (27, 1, 'Toprakdeğirmeni Mahallesi', undefined, undefined),
  (28, 1, 'Uçarlı Mahallesi', undefined, undefined),
  (29, 1, 'Yeni Mahallesi', undefined, undefined),
  (30, 1, 'Yunuslu Mahallesi', undefined, undefined);

-- Users (Password: 123456 for all demo accounts)
INSERT INTO users (id, role_id, department_id, employee_id, citizen_id, full_name, email, phone, password_hash, is_active) VALUES
  (1, 1, NULL, NULL, NULL, 'Ahmet Yılmaz (Sistem Yöneticisi)', 'admin@belediye.gov.tr', '05551112233', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (2, 2, 1, 1, NULL, 'Mehmet Demir (Fen İşleri Müdürü)', 'fenisleri.mudur@belediye.gov.tr', '05552223344', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (3, 2, 2, 2, NULL, 'Ayşe Kaya (Temizlik Müdürü)', 'temizlik.mudur@belediye.gov.tr', '05553334455', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (4, 2, 3, 3, NULL, 'Kemal Özcan (Park Müdürü)', 'park.mudur@belediye.gov.tr', '05554443322', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (5, 2, 4, 4, NULL, 'Hasan Yılmaz (Zabıta Müdürü)', 'zabita.mudur@belediye.gov.tr', '05555554433', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (6, 2, 5, 5, NULL, 'Mustafa Çelik (Su Müdürü)', 'su.mudur@belediye.gov.tr', '05556665544', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (12, 2, 6, 6, NULL, 'Dr. Selin Aydın (Veteriner Müdürü)', 'veteriner.mudur@belediye.gov.tr', '05557776655', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (13, 2, 7, 7, NULL, 'Uğur Öztürk (Ulaşım Müdürü)', 'ulasim.mudur@belediye.gov.tr', '05558887766', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (14, 2, 8, 8, NULL, 'Zeynep Aksoy (Sosyal Hizmetler Müdürü)', 'sosyal.mudur@belediye.gov.tr', '05559998877', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (15, 2, 9, 9, NULL, 'İrfan Yılmaz (İmar Müdürü)', 'imar.mudur@belediye.gov.tr', '05551001122', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (16, 2, 10, 10, NULL, 'Bilal Yalçın (Bilgi İşlem Müdürü)', 'bilgiislem.mudur@belediye.gov.tr', '05552002233', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (7, 3, 1, 1, NULL, 'Ali Usta (Fen İşleri Saha Personeli)', 'ali.fen@belediye.gov.tr', '05554445566', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (17, 3, 1, 11, NULL, 'Burak Yılmaz (Fen İşleri Saha Ekibi)', 'burak.fen@belediye.gov.tr', '05554445567', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (18, 3, 1, 12, NULL, 'Cem Sert (Fen İşleri Operatör)', 'cem.fen@belediye.gov.tr', '05554445568', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (8, 3, 2, 2, NULL, 'Veli Şahin (Temizlik Saha Personeli)', 'veli.temizlik@belediye.gov.tr', '05555556677', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (19, 3, 2, 13, NULL, 'Emin Kılıç (Temizlik Ekip Şefi)', 'emin.temizlik@belediye.gov.tr', '05555556678', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (20, 3, 2, 14, NULL, 'Ferdi Arslan (Konteyner Ekibi)', 'ferdi.temizlik@belediye.gov.tr', '05555556679', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (9, 3, 3, 3, NULL, 'Fatma Şahin (Park Saha Personeli)', 'fatma.park@belediye.gov.tr', '05556667700', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (21, 3, 3, 15, NULL, 'Hakan Çetin (Budama & Yeşil Alan)', 'hakan.park@belediye.gov.tr', '05556667701', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (22, 3, 3, 16, NULL, 'İbrahim Koç (Çocuk Parkı Bakım)', 'ibrahim.park@belediye.gov.tr', '05556667702', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (23, 3, 4, 17, NULL, 'Kadir Güven (Zabıta Komiseri)', 'kadir.zabita@belediye.gov.tr', '05557778801', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (24, 3, 4, 18, NULL, 'Levent Baş (İşyeri Denetim)', 'levent.zabita@belediye.gov.tr', '05557778802', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (25, 3, 4, 19, NULL, 'Murat Yıldız (Çevre Zabıtası)', 'murat.zabita@belediye.gov.tr', '05557778803', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (26, 3, 5, 20, NULL, 'Nihat Aydoğan (Su Arıza Ekip Şefi)', 'nihat.su@belediye.gov.tr', '05558889901', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (27, 3, 5, 21, NULL, 'Orhan Tekin (Kanalizasyon Şefi)', 'orhan.su@belediye.gov.tr', '05558889902', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (28, 3, 5, 22, NULL, 'Polat Dinç (Tesisat Görevlisi)', 'polat.su@belediye.gov.tr', '05558889903', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (29, 3, 6, 23, NULL, 'Recep Yavuz (Sokak Canları Ekibi)', 'recep.vet@belediye.gov.tr', '05559990001', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (30, 3, 6, 24, NULL, 'Sinan Kurt (Veteriner Teknikeri)', 'sinan.vet@belediye.gov.tr', '05559990002', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (31, 3, 6, 25, NULL, 'Turgut Doğan (İlaçlama Ekip Şefi)', 'turgut.vet@belediye.gov.tr', '05559990003', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (32, 3, 7, 26, NULL, 'Ümit Varol (Sinyalizasyon)', 'umit.ulasim@belediye.gov.tr', '05551110001', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (33, 3, 7, 27, NULL, 'Volkan Güneş (Durak Bakım Ekibi)', 'volkan.ulasim@belediye.gov.tr', '05551110002', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (34, 3, 7, 28, NULL, 'Yasin Bulut (Hat Denetim Görevlisi)', 'yasin.ulasim@belediye.gov.tr', '05551110003', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (35, 3, 8, 29, NULL, 'Ahmet Can (Sosyal Saha İnceleme)', 'ahmet.sosyal@belediye.gov.tr', '05552220001', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (36, 3, 8, 30, NULL, 'Berna Şen (Aşevi ve Gıda Dağıtım)', 'berna.sosyal@belediye.gov.tr', '05552220002', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (37, 3, 8, 31, NULL, 'Cansu Efe (Evde Bakım Destek)', 'cansu.sosyal@belediye.gov.tr', '05552220003', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (38, 3, 9, 32, NULL, 'Davut Soylu (İmar Denetim Şefi)', 'davut.imar@belediye.gov.tr', '05553330001', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (39, 3, 9, 33, NULL, 'Erdem Kara (Kentsel Dönüşüm Ekibi)', 'erdem.imar@belediye.gov.tr', '05553330002', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (40, 3, 9, 34, NULL, 'Fatih Uzun (Yapı İnceleme Görevlisi)', 'fatih.imar@belediye.gov.tr', '05553330003', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (41, 3, 10, 35, NULL, 'Gökhan Aydın (Sokak Lambası & Ağ Ekibi)', 'gokhan.bim@belediye.gov.tr', '05554440001', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (42, 3, 10, 36, NULL, 'Harun Polat (Saha Donanım Görevlisi)', 'harun.bim@belediye.gov.tr', '05554440002', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (43, 3, 10, 37, NULL, 'İsmail Can (Aydınlatma ve Sensör)', 'ismail.bim@belediye.gov.tr', '05554440003', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (10, 4, NULL, NULL, 6, 'Caner Özkan (Vatandaş)', 'caner@gmail.com', '05556667788', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (11, 4, NULL, NULL, 7, 'Sefa Bodur (Vatandaş)', 'sefa@gmail.com', '05557778899', '$2a$10$pvvkjakHg4sghcB9J.IpsuQbU2XlUn0poFtdXJqBML1sS1hnLsbZC', 1),
  (44, 1, 10, NULL, NULL, 'son', 'son@gmail.com', '05551112233', '$2a$10$9OSpMwowSzBQ7Ld0ye5m2eG4ViaCVxCrVoPUIj6KjCQCBzk1zCR3G', 1),
  (46, 4, NULL, NULL, NULL, 'ilk', 'ilk@gmail.com', '05555555555', '$2a$10$1iNL4.lu.HbUlIO4U9rqzukAwp4Qbnf/ifX78Yx3kaNaudgZppaLm', 1),
  (48, 2, 2, NULL, NULL, 'Hakan Kaya (Yeni Temizlik Müdürü)', 'hakan.temizlik@belediye.gov.tr', '05559998877', '$2a$10$m0CLvFvAZU05xAu4GRtrje7Zu96CPsCfEzj72SEhKgNx6bzXHo5dC', 1),
  (50, 1, 10, NULL, NULL, 'lorem', 'lorem@gmail.com', '05555555555', '$2a$10$Bq/IzoJCBprKw3lQu8w/ou3KAIXG9p52soVWky5iRNKl9HuJARKH6', 1),
  (52, 3, 4, NULL, NULL, 'ipsum', 'ipsum@gmail.com', '05555555555', '$2a$10$V/H7eNoDZk0fHoll2.LgoeZnRSOI6KS7/B8x8QVA.gcOZ9D0OxakO', 1),
  (60, 5, NULL, NULL, NULL, 'Necmi Sıbıç (Belediye Başkanı)', 'baskan@bulancak.bel.tr', '05550000001', '$2a$10$VyrYfS1CcqZ7r7zxr5pB.ev9tw4GuVJ97FEGHpBunQbNTC8e7Uoj2', 1),
  (62, 6, NULL, NULL, NULL, 'Ayşegül Erdoğan (Başkan Yardımcısı)', 'baskan.yrd2@bulancak.bel.tr', '05550000003', '$2a$10$VyrYfS1CcqZ7r7zxr5pB.ev9tw4GuVJ97FEGHpBunQbNTC8e7Uoj2', 1),
  (59, 6, NULL, NULL, NULL, 'test başkanyrd', 'test@yardimci.com', '05555555555', '$2a$10$ZkXM1fzCmTepPNdWKsIVQOGjl5njj2fws4gJdAhaRz/Ki1.jA.g72', 1),
  (61, 6, 10, NULL, NULL, 'Ahmet Karadeniz ( Başkan Yrd)', 'baskanyrd8@bulancak.bel.tr', '05301112233', '$2a$10$TUMoruylmgheGrmHoyo0Qu4iz87tQwo81V1IzSjV2f920Rvvng6Nq', 1),
  (54, 2, 11, NULL, NULL, 'Ahmet Yılmaz', 'bilgi@gmail.com', '05555555555', '$2a$10$avWXyNeI2mM3L39keB9WLOYkKW.6UdADWpErQtiIiNPVnD8Oy96OG', 1);

-- Employees
INSERT INTO employees (id, user_id, department_id, title, phone) VALUES
  (1, 7, 1, 'Asfalt & Kaldırım Ekip Şefi', NULL),
  (2, 8, 2, 'Atık Yönetimi Görevlisi', NULL),
  (3, 9, 3, 'Peyzaj ve Bahçe Görevlisi', NULL),
  (4, 23, 4, 'Zabıta Saha Komiseri', NULL),
  (5, 26, 5, 'Şebeke Arıza Görevlisi', NULL),
  (6, 29, 6, 'Hayvan Bakım ve Nakil', NULL),
  (7, 32, 7, 'Sinyalizasyon Teknisyeni', NULL),
  (8, 35, 8, 'Saha İnceleme Görevlisi', NULL),
  (9, 38, 9, 'Yapı Kontrol Teknisyeni', NULL),
  (10, 41, 10, 'Akıllı Şehir & Kamera Şefi', NULL),
  (11, 48, 2, 'Temizlik İşleri Müdürü', NULL),
  (12, 48, 2, 'Temizlik İşleri Müdürü', NULL),
  (13, 52, 4, 'Saha Görevlisi', NULL),
  (14, 52, 4, 'Saha Görevlisi', NULL),
  (15, 54, 2, 'Belediye Başkan Yardımcısı', NULL),
  (16, 54, 2, 'Birim Müdürü', NULL),
  (17, 61, 10, 'Belediye Başkan Yardımcısı', NULL),
  (18, 61, 10, 'Birim Müdürü', NULL),
  (19, 54, 11, 'Birim Müdürü', NULL),
  (20, 54, 11, 'Birim Müdürü', NULL);

-- Complaints
INSERT INTO complaints (id, tracking_code, user_id, citizen_id, category_id, department_id, district_id, neighborhood_id, assigned_to_user_id, title, description, open_address, latitude, longitude, urgency_level, priority_level, status, submission_type, contact_preference, is_public, upvote_count, rating, created_at) VALUES
  (38, 'BLD-2026-883331', 10, 10, 2, 1, 1, 7, 7, 'Yolda çukur var', 'yolda çukur var', 'Ballıca, Ballıca, Bulancak', 40.934184, 38.215599, 'Acil', 'Acil', 'Personele atandı', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-18T06:18:03.531Z'),
  (37, 'BLD-2026-438363', 11, 11, 9, 6, 1, 7, 29, 'Başıboş köpek', 'başıboş köpek', 'Ballıca, Ballıca, Bulancak', 40.935716, 38.215384, 'Normal', 'Normal', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 1, NULL, '2026-08-18T06:10:52.312Z'),
  (36, 'BLD-2026-725242', 11, 11, 7, 5, 1, 3, NULL, 'Boru patladı', 'boru patladı', 'Şemsettin Caddesi, Bulancak Mah., Bulancak', 40.930812, 38.22989, 'Acil', 'Acil', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, 4, '2026-08-17T14:51:18.509Z'),
  (35, 'BLD-2026-503371', 10, 10, 9, 1, 1, 1, NULL, 'Başıboş köpek', 'başıboş köpek', 'İsmet Paşa, İsmet Paşa, Bulancak', 40.938855, 38.240812, 'Acil', 'Acil', 'İlgili birime yönlendirildi', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:58:49.816Z'),
  (34, 'BLD-2026-548382', 1, 1, 9, 6, 1, 16, NULL, 'Köpek kaçtı', 'köpek kaçtı', 'İsmet Paşa, İsmet Paşa, Bulancak', 40.939124, 38.23791, 'Acil', 'Acil', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:49:27.948Z'),
  (33, 'BLD-2026-213653', 1, 1, 4, 3, 1, 16, NULL, 'Yetersiz park alanı', 'yetersiz park alanı', 'İsmet Paşa, İsmet Paşa, Bulancak', 40.938873, 38.238087, 'Düşük', 'Düşük', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:48:27.295Z'),
  (32, 'BLD-2026-111964', 1, 1, 14, 11, 1, 16, NULL, 'Sosyal tesis ne zaman yapılacak', 'sosyal tesis ne zaman yapılacak', 'İsmet Paşa, İsmet Paşa, Bulancak', 40.939035, 38.240104, 'Normal', 'Normal', 'Çözüldü', 'Soru / Bilgi Talebi', 'E-posta', 1, 0, NULL, '2026-08-17T13:45:20.732Z'),
  (31, 'BLD-2026-834322', 1, 1, 4, 3, 1, 15, NULL, 'Yeterli park alanı yok', 'yeterli park alanı yok', 'Acısu Caddesi, İhsaniye, Bulancak', 40.936052, 38.222895, 'Düşük', 'Düşük', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:38:15.589Z'),
  (30, 'BLD-2026-128177', 1, 1, 8, 5, 1, 15, NULL, 'Su kaçağı', 'su kaçağı', 'İhsaniye, İhsaniye, Bulancak', 40.93604, 38.229842, 'Normal', 'Normal', 'Yeni', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:30:49.749Z'),
  (28, 'BLD-2026-792502', 10, 10, 5, 4, 1, 6, NULL, 'Yüksek sesli araba', 'yüksek sesli araba', 'Bahçelievler, Bahçelievler, Bulancak', 40.932659, 38.205966, 'Normal', 'Normal', 'Yeni', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:22:10.207Z'),
  (27, 'BLD-2026-361183', 1, 1, 14, 11, 1, 21, NULL, 'Yangın', 'yangın', 'Sanayi, Sanayi, Bulancak', 40.936547, 38.195977, 'Normal', 'Normal', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:20:35.015Z'),
  (25, 'BLD-2026-793619', 1, 1, 4, 3, 1, 19, NULL, 'Park yeri yok', 'park yeri yok', '28-75, Pazarsuyu, Bulancak', 40.933441, 38.179146, 'Normal', 'Normal', 'Yeni', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T13:10:47.938Z'),
  (24, 'BLD-2026-764632', 1, 1, 4, 3, 1, 6, NULL, 'Park yeri yok', 'park yeri yok', 'Bahçelievler, Bahçelievler, Bulancak', 40.936587, 38.207207, 'Düşük', 'Düşük', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T12:52:13.632Z'),
  (23, 'BLD-2026-316183', 1, 1, 4, 3, 1, 7, NULL, 'Park yeri yok', 'park yeri yok', 'Ballıca, Ballıca, Bulancak', 40.93508, 38.21444, 'Düşük', 'Düşük', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T12:33:18.509Z'),
  (22, 'BLD-2026-811292', 1, 1, 6, 4, 1, 1, NULL, 'Ruhsatsız işyeri', 'ruhsatsız işyeri', 'Acısu, Acısu, Bulancak', 40.934853, 38.222122, 'Normal', 'Normal', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T12:30:35.820Z'),
  (21, 'BLD-2026-389445', 1, 1, 9, 6, 1, 15, NULL, 'Köpek kaçmış', 'köpek kaçmış', 'Karaali Sokak, İhsaniye, Bulancak', 40.93683, 38.22783, 'Normal', 'Normal', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T12:28:33.100Z'),
  (20, 'BLD-2026-217405', 1, 1, 7, 5, 1, 7, NULL, 'Boru patladı2', 'boru patladı', 'Ballıca, Ballıca, Bulancak', 40.937398, 38.216421, 'Acil', 'Acil', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 1, 3, '2026-08-17T12:01:10.160Z'),
  (16, 'BLD-2026-239794', 2, 2, 14, 1, 1, 7, NULL, 'Arşiv...', 'arşiv', 'Ballıca, Ballıca, Bulancak', 40.937317, 38.217037, 'Normal', 'Normal', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T09:14:45.011Z'),
  (15, 'BLD-2026-544114', 10, 10, 7, 5, 1, 40, NULL, 'Boru patladı', 'boru patladı', 'Toprakdeğirmeni, Toprakdeğirmeni, Bulancak', 40.942342, 38.254888, 'Kritik', 'Kritik', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-17T07:56:45.149Z'),
  (14, 'BLD-2026-280703', 10, 10, 2, 1, 1, 38, NULL, 'Asfalt naneyi yemiş', 'asfalt naneyi yemiş', 'Ballıca, Ballıca, Bulancak', 40.937783, 38.22135, 'Yüksek', 'Yüksek', 'Çözüldü', 'Şikâyet', 'SMS', 1, 2, NULL, '2026-08-14T12:59:08.597Z'),
  (13, 'BLD-2026-225731', 2, 2, 7, 5, 1, 33, NULL, 'Boru patladı', 'boru patladı', 'Bahçelievler, Bahçelievler, Bulancak', 40.936356, 38.21208, 'Kritik', 'Kritik', 'İlgili birime yönlendirildi', 'Şikâyet', 'E-posta', 1, 3, NULL, '2026-08-14T12:30:04.596Z'),
  (12, 'BLD-2026-483744', 10, 10, 2, 1, 1, 39, NULL, 'Asfalt patlamış', 'asfalt patlamış', 'Pazarsuyu Emecen, Pazarsuyu Emecen, Bulancak', 40.925, 38.21, 'Yüksek', 'Yüksek', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 0, NULL, '2026-08-14T12:18:02.879Z'),
  (10, 'BLD-2026-368565', 10, 10, 6, 4, 2, 43, NULL, 'tsfg', 'zabıta', 'Sokak, Bahçelievler, Bulancak', 40.936707, 38.205943, 'Normal', 'Normal', 'Çözüldü', 'Şikâyet', 'E-posta', 1, 1, NULL, '2026-08-13T09:31:32.299Z'),
  (7, 'BLD-2026-990199', 1, 1, 1, 1, 2, 30, NULL, 'adminbtste', 'asd', 'İhsaniye, İhsaniye, Bulancak', 40.938, 38.229, 'Normal', 'Normal', 'Çözüldü', 'Şikâyet', 'E-posta', 0, 0, NULL, '2026-08-13T06:27:10.386Z');

-- Complaint Status History
INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason, created_at) VALUES
  (7, 1, 'Yok', 'Yeni', NULL, '2026-08-13T06:27:10.386Z'),
  (7, 1, 'Yeni', 'Personele atandı', NULL, '2026-08-13T06:27:24.942Z'),
  (7, 1, 'Personele atandı', 'Yeni', NULL, '2026-08-13T06:27:30.010Z'),
  (7, 1, 'Yeni', 'Personele atandı: abi hadi', NULL, '2026-08-13T06:27:37.413Z'),
  (7, Personele atandı, 1, 'Talep Temizlik İşleri Müdürlüğü birimine yönlendirildi. Sebeb: admşn', NULL, '2026-08-13T06:29:07.734Z'),
  (7, İlgili birime yönlendirildi, 3, 'Talep Fen İşleri Müdürlüğü birimine yönlendirildi. Sebeb: hfdsdf', NULL, '2026-08-13T06:29:43.124Z'),
  (7, 2, 'İlgili birime yönlendirildi', 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', '2026-08-13T06:33:18.646Z'),
  (7, 1, 'İlgili birime yönlendirildi', 'Personele atandı', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı.', '2026-08-13T07:36:29.233Z'),
  (7, 1, 'Personele atandı', 'Personele atandı', 'Görev Burak Yılmaz (Fen İşleri Saha Ekibi) isimli personele atandı.', '2026-08-13T07:36:39.817Z'),
  (7, 1, 'Personele atandı', 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', '2026-08-13T07:37:07.776Z'),
  (7, 1, 'İlgili birime yönlendirildi', 'Personele atandı', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı.', '2026-08-13T07:47:41.161Z'),
  (7, 1, 'Personele atandı', 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', '2026-08-13T07:47:43.057Z'),
  (10, 10, 'Yok', 'Yeni', NULL, '2026-08-13T09:31:32.299Z'),
  (10, 52, 'Yeni', 'Personele atandı', 'Saha personeli görevi kendi üzerine aldı.', '2026-08-13T09:31:59.640Z'),
  (7, 3, 'İlgili birime yönlendirildi', 'Personele atandı', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı.', '2026-08-13T10:39:29.662Z'),
  (7, 3, 'Personele atandı', 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', '2026-08-13T10:39:37.334Z'),
  (7, 3, 'İlgili birime yönlendirildi', 'Personele atandı', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı.', '2026-08-13T12:12:06.647Z'),
  (7, 3, 'Personele atandı', 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', '2026-08-13T12:12:09.885Z'),
  (7, 7, 'İlgili birime yönlendirildi', 'Personele atandı', 'Saha personeli görevi kendi üzerine aldı.', '2026-08-13T12:16:29.425Z'),
  (10, 1, 'Personele atandı', 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', '2026-08-13T12:41:46.191Z'),
  (10, 1, 'İlgili birime yönlendirildi', 'Yeni', 'Durum (Yeni) Sistem Yöneticisi tarafından güncellendi.', '2026-08-13T12:41:56.332Z'),
  (7, 50, 'Personele atandı', 'İlgili birime yönlendirildi', 'Görev ataması yönetici tarafından kaldırıldı.', '2026-08-14T06:16:43.335Z'),
  (10, 50, 'Yeni', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Sistem Yöneticisi tarafından güncellendi.', '2026-08-14T06:18:38.082Z'),
  (7, 7, 'İlgili birime yönlendirildi', 'Çözüldü', 'test', '2026-08-14T06:52:04.021Z'),
  (12, 10, 'Yok', 'Yeni', NULL, '2026-08-14T12:18:02.879Z'),
  (13, 2, 'Yok', 'Yeni', NULL, '2026-08-14T12:30:04.603Z'),
  (15, 10, 'Yok', 'Yeni', NULL, '2026-08-17T07:56:45.149Z'),
  (15, 6, 'Yeni', 'Görev Nihat Aydoğan (Su Arıza Ekip Şefi) isimli personele atandı. (Görev atandı.)', NULL, '2026-08-17T07:58:06.784Z'),
  (15, 26, 'Personele atandı', 'Çözüldü', 'okeyto', '2026-08-17T07:58:28.299Z'),
  (15, 1, 'Çözüldü', 'İlgili birime yönlendirildi', NULL, '2026-08-17T08:49:16.557Z'),
  (15, 1, 'İlgili birime yönlendirildi', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T08:50:48.142Z'),
  (15, 1, 'Çözüldü', 'Yeni', 'Durum (Yeni) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T08:50:48.192Z'),
  (10, 1, 'İşlem devam ediyor', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T08:52:19.252Z'),
  (12, 7, 'Yeni', 'Çözüldü', 'sontest', '2026-08-17T08:52:42.378Z'),
  (15, 1, 'Yeni', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T09:03:15.714Z'),
  (15, 1, 'Çözüldü', 'Yeni', 'Durum (Yeni) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T09:03:15.767Z'),
  (15, 2, 'Yeni', 'Çözüldü', 'Durum (Çözüldü) Birim Yöneticisi tarafından güncellendi.', '2026-08-17T09:13:11.921Z'),
  (14, 2, 'Yeni', 'Çözüldü', 'Durum (Çözüldü) Birim Yöneticisi tarafından güncellendi.', '2026-08-17T09:13:28.375Z'),
  (16, 2, 'Yok', 'Yeni', NULL, '2026-08-17T09:14:45.011Z'),
  (16, 2, 'Yeni', 'Çözüldü', 'Durum (Çözüldü) Birim Yöneticisi tarafından güncellendi.', '2026-08-17T09:14:51.475Z'),
  (13, 1, 'Yeni', 'İlgili birime yönlendirildi', 'Durum (İlgili birime yönlendirildi) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T11:48:20.734Z'),
  (20, 1, 'Yok', 'Yeni', NULL, '2026-08-17T12:01:10.160Z'),
  (20, 1, 'Yeni', 'İlgili birime yönlendirildi', 'Durum (İlgili birime yönlendirildi) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:03:00.625Z'),
  (20, 1, 'İlgili birime yönlendirildi', 'Personele atandı', 'Durum (Personele atandı) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:03:09.682Z'),
  (20, 1, 'İlgili birime yönlendirildi', 'Yeni', 'Durum (Yeni) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:03:34.202Z'),
  (20, 1, 'Yeni', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:03:46.746Z'),
  (20, 1, 'Personele atandı', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:04:07.466Z'),
  (20, 1, 'Çözüldü', 'İptal edildi', 'Durum (İptal edildi) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:05:27.483Z'),
  (20, 1, 'İptal edildi', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:20:39.311Z'),
  (21, 1, 'Yok', 'Yeni', NULL, '2026-08-17T12:28:33.100Z'),
  (22, 1, 'Yok', 'Yeni', NULL, '2026-08-17T12:30:35.820Z'),
  (22, 1, 'Yeni', 'İlgili birime yönlendirildi', 'Durum (İlgili birime yönlendirildi) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:31:01.520Z'),
  (22, 1, 'İlgili birime yönlendirildi', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:31:34.105Z'),
  (21, 1, 'Yeni', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:31:50.438Z'),
  (23, 1, 'Yok', 'Yeni', NULL, '2026-08-17T12:33:18.510Z'),
  (23, 1, 'Yeni', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:44:00.082Z'),
  (24, 1, 'Yok', 'Yeni', NULL, '2026-08-17T12:52:13.633Z'),
  (24, 1, 'Yeni', 'Personele atandı', 'Durum (Personele atandı) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:52:28.453Z'),
  (24, 1, 'Personele atandı', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:53:03.185Z'),
  (22, 1, 'İşlem devam ediyor', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T12:53:29.579Z'),
  (25, 1, 'Yok', 'Yeni', NULL, '2026-08-17T13:10:47.938Z'),
  (27, 1, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:20:35.015Z'),
  (28, 10, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:22:10.207Z'),
  (27, 1, 'Ön İncelemede', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:24:18.800Z'),
  (30, 1, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:30:49.749Z'),
  (31, 1, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:38:15.589Z'),
  (31, 1, 'Yeni', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:42:14.024Z'),
  (31, 1, 'İşlem devam ediyor', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:42:29.801Z'),
  (32, 1, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:45:20.732Z'),
  (32, 1, 'Ön İncelemede', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:45:59.057Z'),
  (32, 1, 'Çözüldü', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:46:09.702Z'),
  (32, 1, 'İşlem devam ediyor', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:47:28.910Z'),
  (33, 1, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:48:27.295Z'),
  (33, 1, 'Yeni', 'Personele atandı', 'Durum (Personele atandı) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:48:42.613Z'),
  (33, 1, 'Personele atandı', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T13:48:51.837Z'),
  (34, 1, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:49:27.948Z'),
  (34, 12, 'Yeni', 'Görev Recep Yavuz (Sokak Canları Ekibi) isimli personele atandı. (Görev atandı.)', 'Talep durumu güncellendi.', '2026-08-17T13:50:04.366Z'),
  (34, 29, 'Personele atandı', 'Çözüldü', 'yakalandı', '2026-08-17T13:51:08.834Z'),
  (35, 10, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T13:58:49.816Z'),
  (35, 12, 'Yeni', 'Görev Recep Yavuz (Sokak Canları Ekibi) isimli personele atandı. (Görev atandı.)', 'Talep durumu güncellendi.', '2026-08-17T13:59:17.183Z'),
  (34, 1, 'Çözüldü', 'İlgili birime yönlendirildi', 'Talep durumu güncellendi.', '2026-08-17T14:49:09.757Z'),
  (34, 1, 'İlgili birime yönlendirildi', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:49:15.487Z'),
  (7, 1, 'Çözüldü', 'Personele atandı', 'Durum (Personele atandı) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:49:31.679Z'),
  (7, 1, 'Personele atandı', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:49:35.262Z'),
  (36, 11, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-17T14:51:18.509Z'),
  (36, 1, 'Yeni', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:52:11.758Z'),
  (36, 1, 'İşlem devam ediyor', 'Personele atandı', 'Durum (Personele atandı) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:52:51.557Z'),
  (36, 1, 'Personele atandı', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:52:59.548Z'),
  (36, 1, 'Çözüldü', 'Personele atandı', 'Durum (Personele atandı) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:57:53.210Z'),
  (36, 1, 'Personele atandı', 'Çözüldü', 'Durum (Çözüldü) Sistem Yöneticisi tarafından güncellendi.', '2026-08-17T14:59:23.168Z'),
  (37, 11, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-18T06:10:52.322Z'),
  (37, 12, 'Yeni', 'Yeni', 'Öncelik seviyesi "Normal" olarak güncellendi.', '2026-08-18T06:12:36.177Z'),
  (37, 12, 'Yeni', 'Görev Recep Yavuz (Sokak Canları Ekibi) isimli personele atandı. (test)', 'Talep durumu güncellendi.', '2026-08-18T06:12:50.845Z'),
  (35, 12, 'Personele atandı', 'İlgili birime yönlendirildi', 'Talep durumu güncellendi.', '2026-08-18T06:13:40.899Z'),
  (35, 12, 'İlgili birime yönlendirildi', 'İlgili birime yönlendirildi', 'Talep Fen İşleri Müdürlüğü bünyesine yönlendirildi. Not: -', '2026-08-18T06:14:06.027Z'),
  (37, 12, 'Personele atandı', 'İlgili birime yönlendirildi', 'Talep durumu güncellendi.', '2026-08-18T06:14:16.488Z'),
  (37, 12, 'İlgili birime yönlendirildi', 'Görev Recep Yavuz (Sokak Canları Ekibi) isimli personele atandı. (test)', 'Talep durumu güncellendi.', '2026-08-18T06:14:20.064Z'),
  (37, 12, 'Personele atandı', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Birim Yöneticisi tarafından güncellendi.', '2026-08-18T06:14:41.814Z'),
  (37, 12, 'İşlem devam ediyor', 'Çözüldü', 'Durum (Çözüldü) Birim Yöneticisi tarafından güncellendi.', '2026-08-18T06:15:20.984Z'),
  (38, 10, 'Yok', 'Yeni', 'Talep başarıyla oluşturuldu.', '2026-08-18T06:18:03.531Z'),
  (38, 2, 'Yeni', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı. (Görev atandı.)', 'Talep durumu güncellendi.', '2026-08-18T06:18:39.812Z'),
  (38, 2, 'Personele atandı', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı. (test)', 'Talep durumu güncellendi.', '2026-08-18T06:18:43.461Z'),
  (38, 2, 'Personele atandı', 'İlgili birime yönlendirildi', 'Talep durumu güncellendi.', '2026-08-18T06:19:05.910Z'),
  (38, 2, 'İlgili birime yönlendirildi', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı. (Görev atandı.)', 'Talep durumu güncellendi.', '2026-08-18T06:21:10.983Z'),
  (38, 2, 'Personele atandı', 'İşlem devam ediyor', 'Durum (İşlem devam ediyor) Birim Yöneticisi tarafından güncellendi.', '2026-08-18T06:21:17.149Z'),
  (38, 7, 'İşlem devam ediyor', 'Çözüldü', 'bitti', '2026-08-18T06:21:55.849Z'),
  (38, 2, 'Çözüldü', 'Görev Ali Usta (Fen İşleri Saha Personeli) isimli personele atandı. (Doğrulama test görevi)', 'Talep durumu güncellendi.', '2026-08-18T06:24:31.538Z');

-- Complaint Actions
INSERT INTO complaint_actions (id, complaint_id, employee_id, action_description, work_done, tools_equipment_used, citizen_response, resolution_photo_path, created_at) VALUES
  (10, null, 13, 'test', NULL, NULL, NULL, 'uploads/bld-1786613531767-839860349.jpeg', '2026-08-13T09:32:11.806Z'),
  (11, null, 13, 'test', NULL, NULL, NULL, 'uploads/bld-1786613531767-839860349.jpeg', '2026-08-13T09:32:11.807Z'),
  (12, null, 1, 'asd', NULL, NULL, NULL, NULL, '2026-08-13T09:33:54.825Z'),
  (13, null, 1, 'asd', NULL, NULL, NULL, NULL, '2026-08-13T09:33:54.825Z'),
  (14, null, 13, 'bitti', NULL, NULL, NULL, NULL, '2026-08-13T10:35:35.113Z'),
  (15, null, 13, 'bitti', NULL, NULL, NULL, NULL, '2026-08-13T10:35:35.126Z'),
  (16, null, 13, 'sc', NULL, NULL, NULL, NULL, '2026-08-13T10:35:47.161Z'),
  (17, null, 13, 'sc', NULL, NULL, NULL, NULL, '2026-08-13T10:35:47.177Z'),
  (18, null, 1, 'dgsgf', NULL, NULL, NULL, NULL, '2026-08-13T12:16:15.456Z'),
  (19, null, 1, 'dgsgf', NULL, NULL, NULL, NULL, '2026-08-13T12:16:15.470Z'),
  (20, null, 1, 'dfsdfsf', NULL, NULL, NULL, NULL, '2026-08-13T12:16:32.914Z'),
  (21, null, 1, 'dfsdfsf', NULL, NULL, NULL, NULL, '2026-08-13T12:16:32.927Z'),
  (22, null, 1, 'rjvj', NULL, NULL, NULL, NULL, '2026-08-13T12:16:54.654Z'),
  (23, null, 1, 'rjvj', NULL, NULL, NULL, NULL, '2026-08-13T12:16:54.666Z'),
  (24, null, 1, 'df', NULL, NULL, NULL, NULL, '2026-08-13T12:17:01.110Z'),
  (25, null, 1, 'df', NULL, NULL, NULL, NULL, '2026-08-13T12:17:01.123Z'),
  (30, 7, 1, 'test', NULL, NULL, NULL, NULL, '2026-08-14T06:52:04.015Z'),
  (31, 7, 1, 'test', NULL, NULL, NULL, NULL, '2026-08-14T06:52:04.021Z'),
  (48, 15, 5, 'okeyto', NULL, NULL, NULL, 'uploads/bld-1786953508151-967102097.png', '2026-08-17T07:58:28.287Z'),
  (49, 15, 5, 'okeyto', NULL, NULL, NULL, 'uploads/bld-1786953508151-967102097.png', '2026-08-17T07:58:28.299Z'),
  (50, 12, 1, 'sontest', NULL, NULL, NULL, NULL, '2026-08-17T08:52:42.366Z'),
  (51, 12, 1, 'sontest', NULL, NULL, NULL, NULL, '2026-08-17T08:52:42.378Z'),
  (23, 34, 6, 'yakalandı', NULL, NULL, NULL, 'uploads/bld-1786974668804-650435805.jpg', '2026-08-17T13:51:08.820Z'),
  (24, 34, 6, 'yakalandı', NULL, NULL, NULL, 'uploads/bld-1786974668804-650435805.jpg', '2026-08-17T13:51:08.834Z'),
  (25, 38, 1, 'bitti', NULL, NULL, NULL, NULL, '2026-08-18T06:21:55.842Z'),
  (26, 38, 1, 'bitti', NULL, NULL, NULL, NULL, '2026-08-18T06:21:55.850Z');

-- Announcements
INSERT INTO announcements (id, title, content, category, priority, created_by_user_id, created_at) VALUES
  (1, '📢 Bulancak Belediyesi 153 Çözüm Merkezi Dijital Portalı Hizmete Girdi!', 'Bulancaklı hemşehrilerimizin belediye hizmetlerine 7/24 daha hızlı erişebilmesi, talep ve şikâyetlerini anlık iletebilmesi amacıyla yeni çözüm merkezimiz yayına alınmıştır.', 'Genel Duyuru', 'Yüksek', 1, '2026-08-15T14:43:57.136Z'),
  (2, '💧 Ballıca ve İhsaniye Mahallelerinde Planlı Su Şebekesi İyileştirmesi', 'Su ve Kanalizasyon Müdürlüğümüz tarafından ana iletim hattı bakım çalışmaları sebebiyle perşembe günü 09:00 - 15:00 saatleri arasında kısmi su kesintisi yaşanacaktır.', 'Altyapı & Su Kesintisi', 'Acil', 1, '2026-08-16T14:43:57.136Z'),
  (3, '🚧 Bulancak Sahil Caddesi Yol ve Kaldırım Yenileme Çalışmaları Başladı', 'Fen İşleri Müdürlüğümüz tarafından sahil bandı ve bağlantı yollarında asfalt serim ve çevre düzenleme çalışmaları başlatılmıştır.', 'Yol Çalışması', 'Normal', 1, '2026-08-17T14:43:57.136Z');

SET FOREIGN_KEY_CHECKS = 1;
