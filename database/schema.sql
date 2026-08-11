-- Belediye Talep ve Akıllı Şikâyet Yönetim Sistemi - Veritabanı Şeması (16 Tablo)

CREATE DATABASE IF NOT EXISTS belediye_talep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE belediye_talep_db;

-- 1. Rol Tablosu
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Vatandaş Ek Bilgileri Tablosu
CREATE TABLE IF NOT EXISTS citizens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  identity_number VARCHAR(11),
  address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Belediye Müdürlükleri Tablosu
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Personel Ek Bilgileri Tablosu
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department_id INT NOT NULL,
  title VARCHAR(100) DEFAULT 'Saha Personeli',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Şikâyet ve Talep Kategorileri Tablosu
CREATE TABLE IF NOT EXISTS complaint_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  default_priority ENUM('Düşük', 'Normal', 'Yüksek', 'Acil', 'Kritik') DEFAULT 'Normal',
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. İlçeler Tablosu
CREATE TABLE IF NOT EXISTS districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Mahalleler Tablosu
CREATE TABLE IF NOT EXISTS neighborhoods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Şikâyet ve Talepler Tablosu
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_code VARCHAR(30) NOT NULL UNIQUE,
  citizen_id INT NOT NULL,
  category_id INT NOT NULL,
  department_id INT NOT NULL,
  district_id INT NOT NULL,
  neighborhood_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  open_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  urgency_level ENUM('Düşük', 'Normal', 'Yüksek', 'Acil', 'Kritik') DEFAULT 'Normal',
  priority_level ENUM('Düşük', 'Normal', 'Yüksek', 'Acil', 'Kritik') DEFAULT 'Normal',
  status ENUM('Yeni', 'İlgili birime yönlendirildi', 'Müdürlüğe iletildi', 'Personele atandı', 'İşlem devam ediyor', 'İnceleniyor', 'Çözüldü', 'Reddedildi', 'İptal edildi') DEFAULT 'Yeni',
  is_public TINYINT(1) DEFAULT 1,
  upvote_count INT DEFAULT 0,
  base_upvote_count INT DEFAULT 0,
  forwarded_from_department_id INT DEFAULT NULL,
  contact_preference ENUM('SMS', 'E-posta', 'Telefon', 'İstemiyorum') DEFAULT 'E-posta',
  ai_suggested_category_id INT DEFAULT NULL,
  ai_suggested_dept_id INT DEFAULT NULL,
  ai_suggested_priority VARCHAR(20) DEFAULT NULL,
  ai_sentiment VARCHAR(20) DEFAULT NULL,
  ai_flagged TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES complaint_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
  FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE CASCADE,
  FOREIGN KEY (forwarded_from_department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_tracking (tracking_code),
  INDEX idx_status (status),
  INDEX idx_department (department_id),
  INDEX idx_neighborhood (neighborhood_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Talep Görev Atamaları Tablosu
CREATE TABLE IF NOT EXISTS complaint_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  assigned_by_user_id INT NOT NULL,
  assigned_to_employee_id INT NOT NULL,
  department_id INT NOT NULL,
  task_description TEXT,
  due_date DATETIME DEFAULT NULL,
  status ENUM('Atandı', 'Devam Ediyor', 'Tamamlandı', 'İptal') DEFAULT 'Atandı',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Şikâyet Durum Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS complaint_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  changed_by_user_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  change_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. İşlem ve Çözüm Kayıtları Tablosu
CREATE TABLE IF NOT EXISTS complaint_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  employee_id INT NOT NULL,
  action_description TEXT NOT NULL,
  work_done TEXT,
  tools_equipment_used TEXT,
  citizen_response TEXT,
  resolution_photo_path VARCHAR(255),
  action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Yüklenen Dosyalar Tablosu
CREATE TABLE IF NOT EXISTS complaint_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  uploaded_by_user_id INT NOT NULL,
  file_category ENUM('Talep Görseli', 'Çözüm Görseli', 'Ek Belge') DEFAULT 'Talep Görseli',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Bildirimler Tablosu
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  department_id INT DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  type VARCHAR(50) DEFAULT 'Sistem',
  reference_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Vatandaş Memnuniyet Anketleri Tablosu
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL UNIQUE,
  citizen_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Audit / Denetim Logları Tablosu
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity_name VARCHAR(50) NOT NULL,
  entity_id INT DEFAULT NULL,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Şikâyet Oy / Destek Tablosu
CREATE TABLE IF NOT EXISTS complaint_upvotes (
  complaint_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (complaint_id, user_id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Resmi Duyurular Tablosu
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Genel Duyuru',
  priority VARCHAR(50) DEFAULT 'Normal',
  created_by_user_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
