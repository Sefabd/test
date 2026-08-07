const bcrypt = require('bcryptjs');
const { pool, initializeDatabase } = require('../config/db');

async function seed() {
  console.log('🌱 Seed işlemi başlatılıyor...');
  await initializeDatabase();

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Roles
    await conn.query(`
      INSERT INTO roles (id, name, description) VALUES
      (1, 'Sistem Yöneticisi', 'Tüm sistem yetkilerine sahip admin'),
      (2, 'Birim Yöneticisi', 'Belediye müdürlük yöneticisi'),
      (3, 'Personel', 'Saha ve işlem personeli'),
      (4, 'Vatandaş', 'Talep ve şikâyet oluşturan vatandaş')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 2. Departments (10 Varsayılan Birim)
    await conn.query(`
      INSERT INTO departments (id, name, code, is_active) VALUES
      (1, 'Fen İşleri Müdürlüğü', 'FEN', 1),
      (2, 'Temizlik İşleri Müdürlüğü', 'TEM', 1),
      (3, 'Park ve Bahçeler Müdürlüğü', 'PARK', 1),
      (4, 'Zabıta Müdürlüğü', 'ZBT', 1),
      (5, 'Su ve Kanalizasyon Müdürlüğü', 'SUK', 1),
      (6, 'Veteriner İşleri Müdürlüğü', 'VET', 1),
      (7, 'Ulaşım Hizmetleri Müdürlüğü', 'ULS', 1),
      (8, 'Sosyal Hizmetler Müdürlüğü', 'SHM', 1),
      (9, 'İmar ve Şehircilik Müdürlüğü', 'IMR', 1),
      (10, 'Bilgi İşlem Müdürlüğü', 'BIM', 1)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 3. Complaint Categories
    await conn.query(`
      INSERT INTO complaint_categories (id, department_id, name, description, default_priority) VALUES
      (1, 1, 'Yol ve Kaldırım Sorunu', 'Bozuk kaldırım, taş kayması, yol çökmesi', 'Normal'),
      (2, 1, 'Çukur veya Asfalt Problemi', 'Yoldaki tehlikeli çukurlar ve asfalt yenileme', 'Yüksek'),
      (3, 2, 'Çöp ve Çevre Kirliliği', 'Toplanmayan çöpler, çöp konteyneri ihtiyacı', 'Normal'),
      (4, 3, 'Park ve Yeşil Alan Sorunu', 'Park oyuncakları arızası, çim biçme', 'Düşük'),
      (5, 4, 'Gürültü Şikâyeti', 'Gece vakti inşaat veya yüksek sesli işletme', 'Acil'),
      (6, 4, 'Ruhsatsız İşletme', 'Kaçak veya ruhsatsız çalışan dükkan', 'Normal'),
      (7, 5, 'Su Kaçağı', 'Ana boru patlaması veya sokakta su sızıntısı', 'Kritik'),
      (8, 5, 'Kanalizasyon Problemi', 'Rögarlardan taşma veya koku şikâyeti', 'Kritik'),
      (9, 6, 'Başıboş Hayvan', 'Saldırgan veya yaralı sokak hayvanı', 'Yüksek'),
      (10, 7, 'Toplu Taşıma Sorunu', 'Otobüs durağı tahribatı veya sefer aksaması', 'Normal'),
      (11, 8, 'Sosyal Yardım Talebi', 'Erzak, yakacak veya eğitim desteği', 'Normal'),
      (12, 9, 'İmar ve Yapı Şikâyeti', 'Kaçak yapılaşma veya tehlikeli bina', 'Yüksek'),
      (13, 10, 'Sokak Lambası Arızası', 'Karanlıkta kalan sokak, aydınlatma direği arızası', 'Normal'),
      (14, 1, 'Diğer', 'Diğer belediye hizmet talepleri', 'Düşük')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 4. Districts & Neighborhoods
    await conn.query(`
      INSERT INTO districts (id, name) VALUES
      (1, 'Merkez Kaza'),
      (2, 'Kuzey İlçesi')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    await conn.query(`
      INSERT INTO neighborhoods (id, district_id, name) VALUES
      (1, 1, 'Atatürk Mahallesi'),
      (2, 1, 'Cumhuriyet Mahallesi'),
      (3, 1, 'Fatih Mahallesi'),
      (4, 1, 'Mimar Sinan Mahallesi'),
      (5, 2, 'Gazi Mahallesi'),
      (6, 2, 'Hürriyet Mahallesi')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 5. Default Users & Passwords (Pass: 123456)
    const defaultPasswordHash = await bcrypt.hash('123456', 10);

    // Create Admin User (id=1)
    await conn.query(`
      INSERT INTO users (id, role_id, full_name, email, phone, password_hash, is_active) VALUES
      (1, 1, 'Ahmet Yılmaz (Sistem Yöneticisi)', 'admin@belediye.gov.tr', '05551112233', '${defaultPasswordHash}', 1)
      ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
    `);

    // Create Department Managers (id=2: Fen İşleri Müdürü, id=3: Temizlik Müdürü)
    await conn.query(`
      INSERT INTO users (id, role_id, full_name, email, phone, password_hash, is_active) VALUES
      (2, 2, 'Mehmet Demir (Fen İşleri Müdürü)', 'fenisleri.mudur@belediye.gov.tr', '05552223344', '${defaultPasswordHash}', 1),
      (3, 2, 'Ayşe Kaya (Temizlik Müdürü)', 'temizlik.mudur@belediye.gov.tr', '05553334455', '${defaultPasswordHash}', 1)
      ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
    `);

    // Create Personnel Users (id=4: Fen İşleri Personeli, id=5: Temizlik Personeli)
    await conn.query(`
      INSERT INTO users (id, role_id, full_name, email, phone, password_hash, is_active) VALUES
      (4, 3, 'Ali Usta (Fen İşleri Saha Personeli)', 'ali.fen@belediye.gov.tr', '05554445566', '${defaultPasswordHash}', 1),
      (5, 3, 'Veli Şahin (Temizlik Saha Personeli)', 'veli.temizlik@belediye.gov.tr', '05555556677', '${defaultPasswordHash}', 1)
      ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
    `);

    // Create Citizen User (id=6: Vatandaş Caner)
    await conn.query(`
      INSERT INTO users (id, role_id, full_name, email, phone, password_hash, is_active) VALUES
      (6, 4, 'Caner Özkan (Vatandaş)', 'caner@gmail.com', '05556667788', '${defaultPasswordHash}', 1)
      ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
    `);

    // 6. Citizens & Employees Tables
    await conn.query(`
      INSERT INTO citizens (id, user_id, identity_number, address) VALUES
      (1, 6, '12345678901', 'Atatürk Mah. Lale Sok. No:12 D:4')
      ON DUPLICATE KEY UPDATE identity_number=VALUES(identity_number);
    `);

    await conn.query(`
      INSERT INTO employees (id, user_id, department_id, title) VALUES
      (1, 4, 1, 'Asfalt & Kaldırım Ekip Şefi'),
      (2, 5, 2, 'Atık Yönetimi Görevlisi')
      ON DUPLICATE KEY UPDATE title=VALUES(title);
    `);

    // 7. Sample Complaints
    await conn.query(`
      INSERT INTO complaints (
        id, tracking_code, citizen_id, category_id, department_id, district_id, neighborhood_id,
        title, description, open_address, latitude, longitude, urgency_level, priority_level,
        status, is_public, contact_preference, ai_suggested_category_id, ai_suggested_dept_id,
        ai_suggested_priority, ai_sentiment, ai_flagged, created_at
      ) VALUES
      (
        1, 'BLD-2026-000101', 1, 2, 1, 1, 1,
        'Atatürk Caddesinde Derin Asfalt Çukuru Tehlike Saçıyor',
        'Atatürk Caddesi Migros önündeki yolda yaklaşık 20 cm derinliğinde büyük bir asfalt çukuru oluşmuştur. Araçların lastikleri patlıyor ve acil kaza riski var.',
        'Atatürk Cad. No:45 Önü, Merkez', 39.92077000, 32.85411000, 'Acil', 'Acil',
        'Personele atandı', 1, 'E-posta', 2, 1, 'Acil', 'Olumsuz', 0, NOW() - INTERVAL 2 DAY
      ),
      (
        2, 'BLD-2026-000102', 1, 3, 2, 1, 2,
        'Cumhuriyet Mahallesinde Çöp Konteyneri Taşmış Durumda',
        'Karanfil Sokak köşesindeki çöp konteynerleri 3 gündür boşaltılmadı, etrafa koku yayılıyor ve sağlık açısından sıkıntı oluşturuyor.',
        'Karanfil Sok. No:8 Yanı', 39.92500000, 32.85900000, 'Normal', 'Normal',
        'Çözüldü', 1, 'SMS', 3, 2, 'Normal', 'Olumsuz', 0, NOW() - INTERVAL 4 DAY
      ),
      (
        3, 'BLD-2026-000103', 1, 7, 5, 1, 4,
        'Mimar Sinan Mahallesinde Şebeke Su Kaçağı Patlaması',
        'Ana caddede kaldırım altından tazyikli su fışkırıyor. Sokak sular altında kaldı.',
        'Mimar Sinan Cad. No:102', 39.91500000, 32.84500000, 'Kritik', 'Kritik',
        'Yeni', 1, 'Telefon', 7, 5, 'Kritik', 'Acil', 0, NOW() - INTERVAL 1 HOUR
      )
      ON DUPLICATE KEY UPDATE tracking_code=VALUES(tracking_code);
    `);

    // 8. Assignments
    await conn.query(`
      INSERT INTO complaint_assignments (id, complaint_id, assigned_by_user_id, assigned_to_employee_id, department_id, task_description, due_date, status) VALUES
      (1, 1, 2, 1, 1, 'Olay yerine giderek çukurun yama asfalt ile kapatılması ve trafik güvenliğinin sağlanması.', NOW() + INTERVAL 1 DAY, 'Devam Ediyor'),
      (2, 2, 3, 2, 2, 'Konteynerlerin boşaltılması ve çevresinin dezenfekte edilmesi.', NOW() - INTERVAL 1 DAY, 'Tamamlandı')
      ON DUPLICATE KEY UPDATE status=VALUES(status);
    `);

    // 9. Status History
    await conn.query(`
      INSERT INTO complaint_status_history (complaint_id, changed_by_user_id, old_status, new_status, change_reason) VALUES
      (1, 6, NULL, 'Yeni', 'Vatandaş talebi oluşturdu.'),
      (1, 2, 'Yeni', 'İlgili birime yönlendirildi', 'Fen işleri müdürlüğü incelemeye aldı.'),
      (1, 2, 'İlgili birime yönlendirildi', 'Personele atandı', 'Saha personeli Ali Usta görevlendirildi.'),
      (2, 6, NULL, 'Yeni', 'Vatandaş talebi oluşturdu.'),
      (2, 3, 'Yeni', 'Personele atandı', 'Veli Şahin görevlendirildi.'),
      (2, 5, 'Personele atandı', 'Çözüldü', 'Çöp konteynerleri boşaltıldı ve temizlendi.')
      ON DUPLICATE KEY UPDATE new_status=VALUES(new_status);
    `);

    // 10. Complaint Actions
    await conn.query(`
      INSERT INTO complaint_actions (id, complaint_id, employee_id, action_description, work_done, tools_equipment_used, citizen_response, resolution_photo_path) VALUES
      (1, 2, 2, 'Çöp toplama aracı yönlendirildi.', '2 adet konteyner boşaltıldı, etraf kireçlendi.', 'Çöp Kamyonu 06 BLD 44, Dezenfektan Kit', 'Talep çözüme kavuşturulmuştur, bilgilerinize sunarız.', 'uploads/sample_resolved.jpg')
      ON DUPLICATE KEY UPDATE action_description=VALUES(action_description);
    `);

    // 11. Satisfaction Survey
    await conn.query(`
      INSERT INTO satisfaction_surveys (complaint_id, citizen_id, rating, review_comment) VALUES
      (2, 1, 5, 'Çok hızlı müdahale edildi, belediyemize teşekkür ederim!')
      ON DUPLICATE KEY UPDATE rating=VALUES(rating);
    `);

    // 12. Notifications
    await conn.query(`
      INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES
      (6, 'Talebiniz Güncellendi', 'BLD-2026-000101 numaralı talebiniz saha personeline atanmıştır.', 'Talep', 1),
      (4, 'Yeni Görev Atandı', 'BLD-2026-000101 numaralı asfalt tamir görevi size atandı.', 'Görev', 1),
      (6, 'Talebiniz Çözüldü', 'BLD-2026-000102 numaralı çöp şikayetiniz çözüldü. Lütfen değerlendirin.', 'Çözüm', 2)
      ON DUPLICATE KEY UPDATE title=VALUES(title);
    `);

    // 13. Audit Log
    await conn.query(`
      INSERT INTO audit_logs (user_id, action, entity_name, entity_id, old_value, new_value, ip_address) VALUES
      (1, 'SEED_DATABASE', 'SYSTEM', 1, NULL, 'Veritabanı seed verileri yüklendi.', '127.0.0.1');
    `);

    await conn.commit();
    console.log('✅ Seed işlemi başarıyla tamamlandı!');
    console.log(`
      📌 Test Kullanıcı Bilgileri (Tüm şifreler: 123456):
      - Admin: admin@belediye.gov.tr
      - Fen İşleri Müdürü: fenisleri.mudur@belediye.gov.tr
      - Temizlik Müdürü: temizlik.mudur@belediye.gov.tr
      - Fen İşleri Saha Personeli: ali.fen@belediye.gov.tr
      - Temizlik Saha Personeli: veli.temizlik@belediye.gov.tr
      - Vatandaş: caner@gmail.com
    `);
  } catch (err) {
    await conn.rollback();
    console.error('❌ Seed işleminde hata oluştu:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
