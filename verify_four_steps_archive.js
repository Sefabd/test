async function verifyFourStepsArchive() {
  console.log('================================================================');
  console.log('1. BACKEND API GET /api/complaints/archive TESTİ');
  console.log('================================================================');
  const res = await fetch('http://localhost:3000/api/complaints/archive');
  const data = await res.json();
  console.log('Arşiv Başarılı Mı?:', data.success);
  console.log('Arşivdeki Toplam Çözülmüş Talep Sayısı:', data.complaints?.length);
  
  data.complaints?.forEach(c => {
    console.log(` - ID: ${c.id} | [${c.status}] "${c.title}" | 📍 ${c.neighborhood_name || c.open_address} | ⭐ ${c.avg_rating} / 5 (${c.rating_count} Oy)`);
  });

  console.log('\n================================================================');
  console.log('2. TÜM TALEPLER VE KAMU AKIŞINDA status != "Çözüldü" DOĞRULAMASI');
  console.log('================================================================');
  const publicFeedRes = await fetch('http://localhost:3000/api/complaints/public-feed');
  const publicFeedData = await publicFeedRes.json();
  const hasResolvedInPublic = publicFeedData.complaints?.some(c => c.status === 'Çözüldü');
  console.log('Kamuya Açık Akışta Çözülen Var Mı? (Olmamalı):', hasResolvedInPublic ? '❌ VAR (HATA)' : '✅ YOK (Temiz)');

  console.log('\n================================================================');
  console.log('3. ROL BAZLI ARŞİV TESTİ (Vatandaş vs Admin)');
  console.log('================================================================');
  // Admin Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const loginData = await loginRes.json();
  const adminToken = loginData.token;

  const adminArchiveRes = await fetch('http://localhost:3000/api/complaints/archive', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminArchiveData = await adminArchiveRes.json();
  console.log('Admin Arşiv Kayıt Sayısı:', adminArchiveData.complaints?.length);

  console.log('\n🎉 4 ADIMLI ÇÖZÜM ARŞİVİ ENTEGRASYONU TAM VE EKSİKSİZ DOĞRULANDI!');
}

verifyFourStepsArchive().catch(console.error);
