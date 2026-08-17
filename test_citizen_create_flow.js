async function testCitizenCreateFlow() {
  console.log('=== VATANDAŞ TALEP OLUŞTURMA VE SÜREÇ GEÇMİŞİ DOĞRULAMA TESTİ ===\n');

  // 1. Citizen login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'caner@gmail.com', password: '123456' })
  });
  const loginData = await loginRes.json();
  const { token, user } = loginData;
  console.log(`Giriş Yapan Vatandaş: ${user?.full_name} (Role: ${user?.role_name})`);

  // 2. Citizen creates a complaint (simulating changing AI suggestion to custom category & urgency)
  const createRes = await fetch('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Vatandaş Test Park Işıklandırması',
      description: 'Park içinde akşamları ışıklandırma yetersiz.',
      department_id: 3,
      category_id: 5,
      urgency_level: 'Acil',
      neighborhood_id: 7,
      open_address: 'Bulancak Ballıca',
      is_public: 1
    })
  });
  const createData = await createRes.json();
  console.log('\nTalep Oluşturuldu:', createData.tracking_code, '| ID:', createData.complaint_id);

  // 3. Fetch complaint detail
  const detailRes = await fetch(`http://localhost:3000/api/complaints/${createData.tracking_code}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const detailData = await detailRes.json();
  console.log('\nDetay Başlık:', detailData.complaint.title);
  console.log('Detay Oluşturan:', detailData.complaint.citizen_name);
  console.log('Süreç Geçmişi Kayıt Sayısı:', detailData.history?.length);

  detailData.history.forEach((h, i) => {
    console.log(`  [${i+1}] İşlem Yapan: "${h.changed_by_name}" | Durum: "${h.new_status}" | Açıklama: "${h.change_reason}"`);
  });

  const hasAdminContamination = detailData.history.some(h => (h.changed_by_name || '').includes('Sistem Yöneticisi') || (h.changed_by_name || '').includes('Ahmet Yılmaz'));
  console.log('\nAdmin log bulaşması var mı?:', hasAdminContamination ? '❌ VAR (HATA)' : '✅ YOK (%100 Temiz Vatandaş Kaydı)');

  // Clean test complaint
  const { memData, saveDbJson } = require('./config/db');
  memData.complaints = memData.complaints.filter(c => c.id != createData.complaint_id);
  memData.complaint_status_history = memData.complaint_status_history.filter(h => h.complaint_id != createData.complaint_id);
  saveDbJson();
  console.log('\n✅ Test talebi güvenle temizlendi.');
}

testCitizenCreateFlow().catch(console.error);
