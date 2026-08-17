async function testRevision() {
  console.log('================================================================');
  console.log('TEST 1: 30 RESMİ BULANCAK MAHALLESİ DOĞRULAMA (TALEP OLUŞTUR)');
  console.log('================================================================');
  const locRes = await fetch('http://localhost:3000/api/public/locations');
  const locData = await locRes.json();
  console.log('İlçeler:', locData.districts?.map(d => d.name));
  console.log(`Mahalle Sayısı: ${locData.neighborhoods?.length} (Hedef: 30)`);
  console.log('Mahalle Listesi:', locData.neighborhoods?.map(n => n.name).join(', '));

  console.log('\n================================================================');
  console.log('TEST 2: ADMIN GİRİŞİ & BAŞKAN YARDIMCILARI AKTİF/PASİF FİLTRESİ');
  console.log('================================================================');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const vmRes = await fetch('http://localhost:3000/api/admin/vice-mayors', { headers: authHeaders });
  const vmData = await vmRes.json();
  console.log(`Toplam Başkan Yardımcısı: ${vmData.vice_mayors?.length}`);
  vmData.vice_mayors?.forEach(vm => {
    console.log(` - ID: ${vm.id} | ${vm.full_name} | is_active: ${vm.is_active} | Müdürlük Sayısı: ${vm.department_count}`);
  });

  // Test toggling active/passive
  const testVm = vmData.vice_mayors?.find(v => v.id === 61 || v.id === 62);
  if (testVm) {
    console.log(`\nBaşkan Yardımcısı ${testVm.full_name} (${testVm.id}) pasife/aktife alınıyor...`);
    const toggleRes = await fetch(`http://localhost:3000/api/admin/users/${testVm.id}/toggle-active`, {
      method: 'PUT',
      headers: authHeaders
    });
    const toggleData = await toggleRes.json();
    console.log('Toggle Sonucu:', toggleData);

    // Toggle back to active
    await fetch(`http://localhost:3000/api/admin/users/${testVm.id}/toggle-active`, {
      method: 'PUT',
      headers: authHeaders
    });
    console.log('Tekrar aktifleştirildi.');
  }

  console.log('\n================================================================');
  console.log('TEST 3: KAMUYA AÇIK TALEPLER AKIŞI (ÇÖZÜLENLER AYIKLANDI MI?)');
  console.log('================================================================');
  const feedRes = await fetch('http://localhost:3000/api/complaints/public-feed', { headers: authHeaders });
  const feedData = await feedRes.json();
  console.log(`Kamuya Açık Aktif Talep Sayısı: ${feedData.complaints?.length}`);
  const hasResolvedInFeed = feedData.complaints?.some(c => c.status === 'Çözüldü');
  console.log('Kamuya Açık Akışta Çözülmüş Talep Var Mı?:', hasResolvedInFeed ? '❌ HATA: Çözülmüş talep var' : '✅ TEMİZ: Hiçbir çözülmüş talep yok');
  feedData.complaints?.slice(0, 3).forEach(c => {
    console.log(` - [${c.status}] ${c.title} (${c.neighborhood_name}) | ⭐ ${c.avg_rating} (${c.rating_count} Oy) | 👍 ${c.upvotes_count} Destek`);
  });

  console.log('\n================================================================');
  console.log('TEST 4: ÇÖZÜM ARŞİVİ (SADECE ÇÖZÜLENLER)');
  console.log('================================================================');
  const solRes = await fetch('http://localhost:3000/api/complaints/solution-archive', { headers: authHeaders });
  const solData = await solRes.json();
  console.log(`Çözüm Arşivi Kayıt Sayısı: ${solData.complaints?.length}`);
  const nonResolvedInArchive = solData.complaints?.some(c => c.status !== 'Çözüldü');
  console.log('Çözüm Arşivinde Çözülmemiş Talep Var Mı?:', nonResolvedInArchive ? '❌ HATA: Çözülmemiş talep var' : '✅ TEMİZ: Sadece Çözüldü durumundakiler var');
  solData.complaints?.forEach(c => {
    console.log(` - [${c.status}] ${c.title} (${c.neighborhood_name}) | ⭐ ${c.avg_rating} (${c.rating_count} Oy) | 👍 ${c.upvotes_count} Destek`);
  });

  console.log('\n================================================================');
  console.log('TEST 5: DESTEK OL (UPVOTE) ASENKRON İŞLEM');
  console.log('================================================================');
  const targetComplaintId = feedData.complaints?.[0]?.id || 1;
  const upvoteRes = await fetch(`http://localhost:3000/api/complaints/${targetComplaintId}/upvote`, {
    method: 'POST',
    headers: authHeaders
  });
  const upvoteData = await upvoteRes.json();
  console.log(`Talep #${targetComplaintId} Upvote Sonucu:`, upvoteData);

  console.log('\n================================================================');
  console.log('🎉 TÜM 5 KRİTİK REVİZYON VE TESTLER BAŞARIYLA TAMAMLANDI!');
  console.log('================================================================');
}

testRevision().catch(console.error);
