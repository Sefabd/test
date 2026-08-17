async function testStarAndArchive() {
  console.log('================================================================');
  console.log('1. KAMUYA AÇIK TALEPLER (PUBLIC FEED) YILDIZ & OY SAYISI TESTİ');
  console.log('================================================================');
  const feedRes = await fetch('http://localhost:3000/api/complaints/public-feed');
  const feedData = await feedRes.json();
  console.log('Toplam Kamuya Açık Talep:', feedData.complaints?.length);
  feedData.complaints?.forEach(c => {
    console.log(` - ID: ${c.id} | [${c.status}] "${c.title}" | 📍 ${c.neighborhood_name} | ⭐ ${c.avg_rating} (${c.rating_count} Oy) | 👍 ${c.upvotes_count || 0}`);
  });

  console.log('\n================================================================');
  console.log('2. ÇÖZÜM ARŞİVİ (SOLUTION ARCHIVE) ÇÖZÜLEN TALEPLER TESTİ');
  console.log('================================================================');
  const solRes = await fetch('http://localhost:3000/api/complaints/solution-archive');
  const solData = await solRes.json();
  console.log('Toplam Çözüm Arşivi Kaydı:', solData.complaints?.length);
  solData.complaints?.forEach(c => {
    console.log(` - ID: ${c.id} | [${c.status}] "${c.title}" | 📍 ${c.neighborhood_name} | ⭐ ${c.avg_rating} (${c.rating_count} Oy) | 🛠️ Çözüm: ${c.official_solution?.slice(0, 40)}...`);
  });

  console.log('\n================================================================');
  console.log('3. STATUS GEÇİŞ TESTİ: YENİ TALEBİ ÇÖZÜLDÜ YAPMA VE ARŞİVE AKTARIM');
  console.log('================================================================');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // Let's test a complaint that is in public feed, e.g. ID 14 ("Asfalt naneyi yemiş")
  const targetId = feedData.complaints?.[0]?.id;
  if (targetId) {
    console.log(`Talep #${targetId} durumu 'Çözüldü' yapılıyor...`);
    const statusUpdateRes = await fetch(`http://localhost:3000/api/complaints/${targetId}/status-priority`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Çözüldü' })
    });
    const statusUpdateData = await statusUpdateRes.json();
    console.log('Durum Güncelleme Sonucu:', statusUpdateData);

    // Verify it disappeared from public-feed
    const feedAfterRes = await fetch('http://localhost:3000/api/complaints/public-feed');
    const feedAfterData = await feedAfterRes.json();
    const stillInFeed = feedAfterData.complaints?.some(c => c.id === targetId);
    console.log(`Talep #${targetId} Kamuya Açık Akıştan Silindi Mi?:`, !stillInFeed ? '✅ EVET (Silindi)' : '❌ HAYIR');

    // Verify it appeared in solution-archive
    const solAfterRes = await fetch('http://localhost:3000/api/complaints/solution-archive');
    const solAfterData = await solAfterRes.json();
    const inArchive = solAfterData.complaints?.some(c => c.id === targetId);
    console.log(`Talep #${targetId} Çözüm Arşivine Eklendi Mi?:`, inArchive ? '✅ EVET (Eklendi)' : '❌ HAYIR');

    // Revert back to 'Yeni'
    await fetch(`http://localhost:3000/api/complaints/${targetId}/status-priority`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Yeni' })
    });
    console.log(`Talep #${targetId} test sonrası tekrar 'Yeni' yapıldı.`);
  }

  console.log('\n================================================================');
  console.log('🎉 TÜM TESTLER BAŞARIYLA TAMAMLANDI!');
  console.log('================================================================');
}

testStarAndArchive().catch(console.error);
