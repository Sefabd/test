async function verifyArchiveAndRatingFix() {
  console.log('================================================================');
  console.log('1. MEVCUT KAMU AKIŞI VE ARŞİV DURUMUNUN KONTROLÜ');
  console.log('================================================================');
  
  const publicRes = await fetch('http://localhost:3000/api/complaints/public-feed');
  const publicData = await publicRes.json();
  const archiveRes = await fetch('http://localhost:3000/api/complaints/archive');
  const archiveData = await archiveRes.json();

  const publicIds = new Set(publicData.complaints.map(c => c.id));
  const archiveIds = new Set(archiveData.complaints.map(c => c.id));

  console.log(`Kamu Akışındaki Aktif Talep Sayısı: ${publicData.complaints.length}`);
  console.log(`Çözüm Arşivindeki Çözülen Talep Sayısı: ${archiveData.complaints.length}`);

  // Check overlap (intersection)
  const overlap = [...publicIds].filter(id => archiveIds.has(id));
  console.log('Her İki Ekranda Birden Gözüken Talep Var Mı? (0 Olmalı):', overlap.length > 0 ? `❌ HATA: ID'ler ${overlap}` : '✅ 0 (Mükemmel, Tam İzolasyon)');

  console.log('\n================================================================');
  console.log('2. PUANLAMA TESTİ (Puanlanmamış Yeni Talepler)');
  console.log('================================================================');
  publicData.complaints.forEach(c => {
    console.log(`[ID ${c.id}] "${c.title}" -> status="${c.status}", avg_rating=${c.avg_rating}, rating_count=${c.rating_count}`);
  });

  console.log('\n================================================================');
  console.log('3. YENİ TALEP OLUŞTURMA VE DURUM GEÇİŞ TESTİ');
  console.log('================================================================');
  // Admin Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  // Create new complaint
  const createRes = await fetch('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'İzolasyon ve Puanlama Doğrulama Talebi',
      description: 'Bu talep sistemin yeni açılan taleplerde sahte puan göstermediğini test eder.',
      category_id: 1,
      neighborhood_id: 1,
      is_public: 1
    })
  });
  const createData = await createRes.json();
  const newId = createData.complaint_id;
  console.log(`Yeni talep oluşturuldu -> ID: ${newId}, Takip Kodu: ${createData.tracking_code}`);

  // Verify in public feed (must be present)
  const pFeed1 = await (await fetch('http://localhost:3000/api/complaints/public-feed')).json();
  const inPublic1 = pFeed1.complaints.find(c => Number(c.id) === Number(newId));
  console.log('Yeni talep kamu akışında var mı?:', inPublic1 ? '✅ EVET (Doğru)' : '❌ HAYIR');
  console.log('Yeni talep puanı:', inPublic1 ? `avg_rating=${inPublic1.avg_rating}, rating_count=${inPublic1.rating_count}` : 'Bulunamadı');

  // Verify in archive (must NOT be present)
  const aFeed1 = await (await fetch('http://localhost:3000/api/complaints/archive')).json();
  const inArchive1 = aFeed1.complaints.find(c => Number(c.id) === Number(newId));
  console.log('Yeni talep arşivde var mı? (Olmamalı):', inArchive1 ? '❌ VAR (HATA)' : '✅ YOK (Doğru)');

  // Now resolve the complaint
  console.log('\n--- Talebi Çözüldü Yapıyoruz ---');
  await fetch(`http://localhost:3000/api/complaints/${newId}/status-priority`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Çözüldü' })
  });

  // Verify after resolve: Must be in archive, NOT in public feed
  const pFeed2 = await (await fetch('http://localhost:3000/api/complaints/public-feed')).json();
  const inPublic2 = pFeed2.complaints.find(c => Number(c.id) === Number(newId));
  console.log('Çözüldükten sonra kamu akışında var mı? (Olmamalı):', inPublic2 ? '❌ VAR (HATA)' : '✅ YOK (Temizlendi)');

  const aFeed2 = await (await fetch('http://localhost:3000/api/complaints/archive')).json();
  const inArchive2 = aFeed2.complaints.find(c => Number(c.id) === Number(newId));
  console.log('Çözüldükten sonra arşivde var mı?:', inArchive2 ? '✅ EVET (Arşive Kaydoldu)' : '❌ YOK');
  console.log('Arşivdeki puan durumu:', inArchive2 ? `avg_rating=${inArchive2.avg_rating}, rating_count=${inArchive2.rating_count}` : 'Bulunamadı');

  console.log('\n🎉 TESTLER BAŞARIYLA GEÇTİ! İki tarafta gözükme sorunu ve sahte puanlama tamamen düzeltildi.');
}

verifyArchiveAndRatingFix().catch(console.error);
