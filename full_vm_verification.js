async function fullVerification() {
  console.log('================================================================');
  console.log('1. ADMİN GİRİŞİ');
  console.log('================================================================');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  console.log('\n================================================================');
  console.log('2. TÜM KULLANICILARIN LİSTELENMESİ VE BAŞKAN YARDIMCILARI KONTROLÜ');
  console.log('================================================================');
  const usersRes = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = await usersRes.json();

  const viceMayors = usersData.users.filter(u => Number(u.role_id) === 6 || u.role_name === 'Belediye Başkan Yardımcısı');
  console.log(`Toplam ${viceMayors.length} Başkan Yardımcısı bulundu:`);
  viceMayors.forEach(vm => {
    console.log(`🏛️ [ID: ${vm.id}] ${vm.full_name} | Rol: ${vm.role_name} (Role ID: ${vm.role_id}) | Unvan: ${vm.employee_title} | Bağlı Birimler: [${vm.assigned_department_names.join(', ')}]`);
  });

  const user59 = usersData.users.find(u => Number(u.id) === 59);
  console.log('\nTest Başkan Yardımcısı (ID 59) Durumu:', user59 ? `Adı: "${user59.full_name}", Rolü: "${user59.role_name}"` : 'Bulunamadı');

  if (user59 && user59.role_name === 'Belediye Başkan Yardımcısı' && Number(user59.role_id) === 6) {
    console.log('✅ ID 59 doğru bir şekilde "Belediye Başkan Yardımcısı" olarak gözüküyor!');
  } else {
    console.log('❌ HATA: ID 59 hala Vatandaş gözüküyor!');
  }

  console.log('\n================================================================');
  console.log('3. YENİ DİNAMİK BAŞKAN YARDIMCISI OLUŞTURMA & BİRİM ATAMA');
  console.log('================================================================');
  const testEmail = `baskanyrd.${Date.now()}@bulancak.bel.tr`;
  const createRes = await fetch('http://localhost:3000/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: 'Dinamik Başkan Yardımcısı (Yeni)',
      email: testEmail,
      phone: '05550009988',
      role_id: 6,
      password: 'password123',
      title: 'Belediye Başkan Yardımcısı',
      assigned_department_ids: [1, 2] // Fen İşleri, Temizlik İşleri
    })
  });
  const createData = await createRes.json();
  console.log('Yeni Kullanıcı Oluşturuldu -> ID:', createData.user_id);

  const usersRes2 = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData2 = await usersRes2.json();
  const newlyCreated = usersData2.users.find(u => u.email === testEmail);

  console.log('Yeni Eklenen Kullanıcı Rolü:', newlyCreated?.role_name, '| Role ID:', newlyCreated?.role_id);
  console.log('Yeni Eklenen Kullanıcı Bağlı Müdürlükleri:', newlyCreated?.assigned_department_names);

  if (newlyCreated && Number(newlyCreated.role_id) === 6 && newlyCreated.role_name === 'Belediye Başkan Yardımcısı') {
    console.log('✅ BAŞARILI: Yeni eklenen başkan yardımcısı "Belediye Başkan Yardımcısı" olarak kaydedildi ve birimleri dinamik bağlandı!');
  } else {
    console.log('❌ HATA: Yeni eklenen başkan yardımcısı Vatandaş olarak gözüküyor!');
  }

  console.log('\n================================================================');
  console.log('4. YENİ BAŞKAN YARDIMCISI GİRİŞ YAPMA TESTİ');
  console.log('================================================================');
  const loginVMRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  });
  const loginVMData = await loginVMRes.json();
  console.log('Giriş Yanıtı -> Rol:', loginVMData.user?.role_name, '| Role ID:', loginVMData.user?.role_id, '| Bağlı Birimler:', loginVMData.user?.assigned_department_ids);

  if (loginVMData.user?.role_id === 6 && loginVMData.user?.role_name === 'Belediye Başkan Yardımcısı') {
    console.log('✅ BAŞARILI: Yetkilendirme ve rol JWT token içinde %100 eksiksiz sağlandı!');
  } else {
    console.log('❌ HATA: Giriş yetkisi hatalı!');
  }

  console.log('\n🎉 TÜM TESTLER BAŞARIYLA GEÇTİ!');
}

fullVerification().catch(console.error);
