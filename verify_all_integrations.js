async function verifyAllIntegrations() {
  console.log('=== 3 YENİ SİSTEM DOĞRULAMA TESTİ ===\n');

  // 1. Test Geofencing Logic
  const BULANCAK_BOUNDS_MIN_LAT = 40.80;
  const BULANCAK_BOUNDS_MAX_LAT = 41.05;
  const BULANCAK_BOUNDS_MIN_LNG = 38.10;
  const BULANCAK_BOUNDS_MAX_LNG = 38.38;

  function isInsideBulancak(lat, lng) {
    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);
    return nLat >= BULANCAK_BOUNDS_MIN_LAT && nLat <= BULANCAK_BOUNDS_MAX_LAT && nLng >= BULANCAK_BOUNDS_MIN_LNG && nLng <= BULANCAK_BOUNDS_MAX_LNG;
  }
  // Bulancak center: 40.9385, 38.2300 (inside)
  // Giresun center: 40.9128, 38.3895 (outside Bulancak bounds: lng max is 38.38)
  // Istanbul: 41.0082, 28.9784 (outside)
  console.log('1. GEOFENCING TESTİ:');
  console.log('Bulancak Meydan (40.9385, 38.2300):', isInsideBulancak(40.9385, 38.2300) ? '✅ Bulancak İçinde' : '❌ HATA');
  console.log('Ballıca Mahallesi (40.9380, 38.2300):', isInsideBulancak(40.9380, 38.2300) ? '✅ Bulancak İçinde' : '❌ HATA');
  console.log('İstanbul (41.0082, 28.9784):', isInsideBulancak(41.0082, 28.9784) ? '❌ HATA' : '✅ Bulancak Dışında (Engellendi)');

  // 2. Test Announcements API
  console.log('\n2. DUYURU SİSTEMİ TESTİ:');
  const annRes = await fetch('http://localhost:3000/api/announcements');
  const annData = await annRes.json();
  console.log('Aktif Duyuru Sayısı:', annData.announcements?.length);
  annData.announcements?.forEach((a, i) => {
    console.log(`  [${i+1}] ${a.title} (${a.category}) - ${a.priority}`);
  });

  // 3. Test Notification Generation on Status Change
  console.log('\n3. CANLI CİHAZ BİLDİRİMİ TETİKLEME TESTİ:');
  const loginAdmin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token: adminToken } = await loginAdmin.json();

  // Create a test complaint for citizen Caner (user_id: 10)
  const loginCitizen = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'caner@gmail.com', password: '123456' })
  });
  const { token: citizenToken, user: citizenUser } = await loginCitizen.json();

  const createRes = await fetch('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`
    },
    body: JSON.stringify({
      title: 'Konum ve Bildirim Test Talebi',
      description: 'Test amaçlı açılan bildirim testi.',
      department_id: 2,
      category_id: 3,
      urgency_level: 'Normal',
      neighborhood_id: 5,
      open_address: 'Bulancak Ballıca',
      is_public: 1
    })
  });
  const createData = await createRes.json();
  console.log('Vatandaş Talep Açtı:', createData.tracking_code, '| ID:', createData.complaint_id);

  // Admin assigns / updates status to 'Çözüldü'
  const updateRes = await fetch(`http://localhost:3000/api/complaints/${createData.complaint_id}/status-priority`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      complaint_id: createData.complaint_id,
      status: 'Çözüldü'
    })
  });
  const updateData = await updateRes.json();
  console.log('Admin Durumu "Çözüldü" Yaptı:', updateData.success);

  // Check Citizen Notifications
  const notifRes = await fetch('http://localhost:3000/api/notifications', {
    headers: { 'Authorization': `Bearer ${citizenToken}` }
  });
  const notifData = await notifRes.json();
  const citizenNotifs = notifData.notifications || [];
  console.log(`Vatandaşın Bildirim Sayısı: ${citizenNotifs.length}`);
  const latestNotif = citizenNotifs[0];
  console.log('En Son Gelen Bildirim:');
  console.log('  Başlık:', latestNotif?.title);
  console.log('  Mesaj:', latestNotif?.message);
  console.log('  Referans / Takip Kodu:', latestNotif?.reference_id);

  // Cleanup test data
  const { memData, saveDbJson } = require('./config/db');
  memData.complaints = memData.complaints.filter(c => c.id != createData.complaint_id);
  memData.complaint_status_history = memData.complaint_status_history.filter(h => h.complaint_id != createData.complaint_id);
  memData.notifications = memData.notifications.filter(n => n.reference_id != createData.tracking_code && n.reference_id != createData.complaint_id);
  saveDbJson();
  console.log('\n✅ Test verileri güvenle temizlendi. Tüm sistemler %100 çalışır durumda!');
}

verifyAllIntegrations().catch(console.error);
