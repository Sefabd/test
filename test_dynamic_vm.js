async function testDynamicViceMayorCreation() {
  console.log('================================================================');
  console.log('1. ADMİN GİRİŞİ YAPILIYOR');
  console.log('================================================================');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();
  console.log('Admin token alındı.');

  console.log('\n================================================================');
  console.log('2. DİNAMİK YENİ BAŞKAN YARDIMCISI OLUŞTURULUYOR');
  console.log('================================================================');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const vmEmail = `baskanyrd.${randomSuffix}@bulancak.bel.tr`;
  const vmName = `Mustafa Yıldırım ${randomSuffix}`;

  const createRes = await fetch('http://localhost:3000/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: vmName,
      email: vmEmail,
      phone: '05329998877',
      role_id: 6, // Belediye Başkan Yardımcısı
      password: 'password123',
      title: 'Belediye Başkan Yardımcısı (Teknik Birimler)',
      assigned_department_ids: [1, 5, 7] // Fen İşleri, Su ve Kanalizasyon, Ulaşım
    })
  });
  const createData = await createRes.json();
  console.log('Oluşturma Yanıtı:', createData);
  const newUserId = createData.user_id;

  console.log('\n================================================================');
  console.log('3. KULLANICI LİSTESİNDE ROL KONTROLÜ (Vatandaş mı / Başkan Yrd mı?)');
  console.log('================================================================');
  const usersRes = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  const createdUser = usersData.users.find(u => u.email.toLowerCase() === vmEmail.toLowerCase() || Number(u.id) === Number(newUserId));

  console.log('Eklenen Kullanıcı ID:', createdUser?.id);
  console.log('Eklenen Kullanıcı Adı:', createdUser?.full_name);
  console.log('Eklenen Kullanıcı role_id:', createdUser?.role_id);
  console.log('Eklenen Kullanıcı role_name:', createdUser?.role_name);
  console.log('Eklenen Kullanıcı employee_title:', createdUser?.employee_title);
  console.log('Eklenen Kullanıcı assigned_department_ids:', createdUser?.assigned_department_ids);
  console.log('Eklenen Kullanıcı assigned_department_names:', createdUser?.assigned_department_names);

  if (createdUser && Number(createdUser.role_id) === 6 && createdUser.role_name === 'Belediye Başkan Yardımcısı') {
    console.log('✅ BAŞARILI: Kullanıcı doğru bir şekilde "Belediye Başkan Yardımcısı" olarak kaydedildi ve listelendi!');
  } else {
    console.log('❌ HATA: Kullanıcı hala Vatandaş veya yanlış rolde gözüküyor!');
  }

  console.log('\n================================================================');
  console.log('4. BAŞKAN YARDIMCILARI TEŞKİLAT VE HİYERARŞİ LİSTESİNDE KONTROL');
  console.log('================================================================');
  const vmsRes = await fetch('http://localhost:3000/api/admin/vice-mayors', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const vmsData = await vmsRes.json();
  const foundInVmList = vmsData.vice_mayors.find(v => v.email?.toLowerCase() === vmEmail.toLowerCase() || Number(v.id) === Number(newUserId));
  console.log('Başkan Yardımcıları API listesinde var mı?:', foundInVmList ? '✅ EVET' : '❌ HAYIR');
  if (foundInVmList) {
    console.log('Bağlı Müdürlük Sayısı:', foundInVmList.department_count);
    console.log('Bağlı Müdürlükler:', foundInVmList.departments.map(d => d.name));
  }

  const hierRes = await fetch('http://localhost:3000/api/admin/organization-hierarchy', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const hierData = await hierRes.json();
  const foundInHier = hierData.vice_mayors.find(v => v.email?.toLowerCase() === vmEmail.toLowerCase() || Number(v.id) === Number(newUserId));
  console.log('Teşkilat Şemasında (Hierarchy) var mı?:', foundInHier ? '✅ EVET' : '❌ HAYIR');

  console.log('\n================================================================');
  console.log('5. YENİ BAŞKAN YARDIMCISININ SİSTEME GİRİŞ YAPMA TESTİ (LOGIN)');
  console.log('================================================================');
  const vmLoginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: vmEmail, password: 'password123' })
  });
  const vmLoginData = await vmLoginRes.json();
  console.log('Giriş Başarılı Mı?:', vmLoginData.success);
  console.log('Giriş Yapan Rol:', vmLoginData.user?.role_name);
  console.log('Giriş Yapan Role ID:', vmLoginData.user?.role_id);
  console.log('Giriş Yapan Bağlı Birimler:', vmLoginData.user?.assigned_department_ids);

  if (vmLoginData.user?.role_id === 6 && vmLoginData.user?.role_name === 'Belediye Başkan Yardımcısı') {
    console.log('✅ BAŞARILI: Yeni Başkan Yardımcısı sisteme kendi rolü ve yetkileriyle giriş yapabiliyor!');
  } else {
    console.log('❌ HATA: Giriş yetkisi veya rolü yanlış!');
  }

  console.log('\n🎉 DİNAMİK BAŞKAN YARDIMCISI YÖNETİMİ TESTİ TAMAMLANDI!');
}

testDynamicViceMayorCreation().catch(console.error);
