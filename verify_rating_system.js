async function verifyRatingSystem() {
  console.log('=== DİNAMİK PUANLAMA TESTİ ===\n');

  // 1. Login as Admin
  const adminRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token: adminToken } = await adminRes.json();

  // 2. Fetch a resolved complaint (ID 12)
  const compRes = await fetch('http://localhost:3000/api/complaints/12', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const compData = await compRes.json();
  console.log('Talep #12 Başlangıç Durumu:');
  console.log('  Durum:', compData.complaint?.status);
  console.log('  avg_rating:', compData.complaint?.avg_rating);
  console.log('  rating_count:', compData.complaint?.rating_count);

  if (compData.complaint?.avg_rating === null && Number(compData.complaint?.rating_count || 0) === 0) {
    console.log('✅ DOĞRU: Başlangıçta sahte 4.8 puanı YOK, avg_rating: null ve rating_count: 0.');
  }

  // 3. Login as Citizen (Caner) and Submit a Survey (Rating = 5)
  const citizenRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'caner@gmail.com', password: '123456' })
  });
  const { token: citizenToken } = await citizenRes.json();

  const surveyRes = await fetch('http://localhost:3000/api/complaints/12/survey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`
    },
    body: JSON.stringify({
      rating: 5,
      review_comment: 'Ekipler çok hızlı geldi, teşekkürler!'
    })
  });
  const surveyData = await surveyRes.json();
  console.log('\n1. Vatandaş 5 Yıldızlı Değerlendirme Gönderdi -> Yanıt:', surveyData.success, '| Yeni Puan:', surveyData.avg_rating);

  // 4. Fetch detail again
  const compResAfter = await fetch('http://localhost:3000/api/complaints/12', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const compDataAfter = await compResAfter.json();
  console.log('\nTalep #12 1. Değerlendirme Sonrası:');
  console.log('  avg_rating:', compDataAfter.complaint?.avg_rating);
  console.log('  rating_count:', compDataAfter.complaint?.rating_count);
  console.log('  rating_comment:', compDataAfter.complaint?.rating_comment);

  // 5. Login as 2nd Citizen (Sefa) and Submit a Survey (Rating = 3)
  const citizen2Res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sefa@gmail.com', password: '123456' })
  });
  const { token: citizen2Token } = await citizen2Res.json();

  const survey2Res = await fetch('http://localhost:3000/api/complaints/12/survey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizen2Token}`
    },
    body: JSON.stringify({
      rating: 3,
      review_comment: 'İyi yapıldı fakat biraz geç gelindi.'
    })
  });
  const survey2Data = await survey2Res.json();
  console.log('\n2. Vatandaş 3 Yıldızlı Değerlendirme Gönderdi -> Yanıt:', survey2Data.success, '| Yeni Ortalama:', survey2Data.avg_rating);

  // 6. Fetch detail again (Average of 5 and 3 should be 4.0 with 2 votes)
  const compResFinal = await fetch('http://localhost:3000/api/complaints/12', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const compDataFinal = await compResFinal.json();
  console.log('\nTalep #12 2 Değerlendirme Sonrası Final Durumu:');
  console.log('  avg_rating:', compDataFinal.complaint?.avg_rating);
  console.log('  rating_count:', compDataFinal.complaint?.rating_count);
  console.log('  rating_comment:', compDataFinal.complaint?.rating_comment);

  if (Number(compDataFinal.complaint?.avg_rating) === 4 && Number(compDataFinal.complaint?.rating_count) === 2) {
    console.log('\n🎉 TEST BAŞARILI: Kullanıcıdan veri geldikçe gerçek ortalama ( (5+3)/2 = 4.0 ) ve oy sayısı kusursuz hesaplanıyor!');
  } else {
    console.log('❌ HATA: Ortalama yanlış!');
  }
}

verifyRatingSystem().catch(console.error);
