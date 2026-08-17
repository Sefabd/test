async function verifyCreateModeProtection() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  // Test creating a new complaint and check history
  const createRes = await fetch('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Doğrulama Testi Park Bakımı',
      description: 'Park alanı yeşillendirme talebi.',
      department_id: 3,
      category_id: 5,
      urgency_level: 'Normal',
      neighborhood_id: 7,
      open_address: 'Bulancak Ballıca',
      is_public: 1
    })
  });
  const createData = await createRes.json();
  console.log('Yeni Talep Oluşturuldu:', createData);

  const detailRes = await fetch(`http://localhost:3000/api/complaints/${createData.tracking_code}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const detailData = await detailRes.json();
  console.log('Yeni Talebin İlk History Kayıt Sayısı:', detailData.history?.length);
  console.log('History içeriği:', detailData.history);

  // Clean test complaint
  const { memData, saveDbJson } = require('./config/db');
  memData.complaints = memData.complaints.filter(c => c.id != createData.complaint_id);
  memData.complaint_status_history = memData.complaint_status_history.filter(h => h.complaint_id != createData.complaint_id);
  saveDbJson();
  console.log('✅ Test talebi temizlendi.');
}

verifyCreateModeProtection().catch(console.error);
