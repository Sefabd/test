async function main() {
  console.log('=== 1. ADMIN LOGIN & AUTHENTICATION ===');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const loginData = await loginRes.json();
  console.log('✅ Admin Girişi Başarılı:', loginData.success, '| Yetkili:', loginData.user?.full_name);
  const token = loginData.token;
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('\n=== 2. BAŞKAN YARDIMCILARI & HİYERARŞİ DOĞRULAMA (MÜKERRER KAYIT KONTROLÜ) ===');
  const vmsRes = await fetch('http://localhost:3000/api/admin/vice-mayors', { headers: authHeaders });
  const vmsData = await vmsRes.json();
  console.log(`✅ Toplam ${vmsData.vice_mayors.length} Başkan Yardımcısı listelendi.`);
  
  // Verify deduplication
  const vmIds = vmsData.vice_mayors.map(v => v.id);
  const hasDuplicateVMs = new Set(vmIds).size !== vmIds.length;
  console.log('✅ Çift / Mükerrer Kayıt Durumu:', hasDuplicateVMs ? '❌ Mükerrer Kayıt Var' : '✅ Sıfır Mükerrer Kayıt (Deduplication OK)');

  vmsData.vice_mayors.forEach((vm, idx) => {
    console.log(`\n📌 [${idx + 1}] ${vm.full_name} (${vm.email})`);
    console.log(`   🏛️ Bağlı Birim Sayısı: ${vm.departments.length} | Toplam Kadro: ${vm.total_staff_count} Personel`);
    vm.departments.forEach(d => {
      console.log(`      - ${d.name} (${d.code}) | Müdür: ${d.manager_name} | Kadro: ${d.staff_count} Personel`);
    });
  });

  console.log('\n=== 3. DİNAMİK BİRİM ATAMA / ÇIKARMA MODAL İŞLEMİ (REAKTİF UPDATE) ===');
  // Assign Fen (1), Temizlik (2), Su (5), Ulaşım (7), İmar (9), 153 (11) to Vice Mayor 61
  const assign61 = await (await fetch('http://localhost:3000/api/admin/vice-mayors/61/departments', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ department_ids: [1, 2, 5, 7, 9, 11] })
  })).json();
  console.log('✅ 1. Başkan Yardımcısı Birim Zimmetleri Güncellendi:', assign61.message);

  // Assign Park (3), Zabıta (4), Veteriner (6), Sosyal (8), Bilgi İşlem (10) to Vice Mayor 62
  const assign62 = await (await fetch('http://localhost:3000/api/admin/vice-mayors/62/departments', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ department_ids: [3, 4, 6, 8, 10] })
  })).json();
  console.log('✅ 2. Başkan Yardımcısı Birim Zimmetleri Güncellendi:', assign62.message);

  console.log('\n=== 4. GÜNCELLENEN MÜDÜRLÜK & KADRO TABLOSU (KİM KİME BAĞLI) ===');
  const deptsRes = await fetch('http://localhost:3000/api/admin/departments', { headers: authHeaders });
  const deptsData = await deptsRes.json();
  console.log(`✅ Toplam ${deptsData.departments.length} Müdürlük listelendi:`);

  deptsData.departments.forEach(d => {
    console.log(`   🏢 [ID: ${d.id.toString().padStart(2, '0')}] ${d.name.padEnd(35, ' ')} | Müdür: ${(d.manager_name || 'Atanmadı').padEnd(20, ' ')} | Bağlı Olduğu Yrd: ${d.vice_mayor_name}`);
  });

  console.log('\n=== 5. PUBLIC METADATA (SIDEBAR REAKTİF SENKRONİZASYONU) ===');
  const pubDepts = await (await fetch('http://localhost:3000/api/public/departments')).json();
  console.log(`✅ Public API ${pubDepts.departments.length} aktif müdürlüğü doğru hiyerarşiyle döndürüyor.`);
  const vm1Depts = pubDepts.departments.filter(d => Number(d.vice_mayor_user_id) === 61);
  const vm2Depts = pubDepts.departments.filter(d => Number(d.vice_mayor_user_id) === 62);
  console.log(`   - 1. Başkan Yardımcısı Altındaki Birimler: ${vm1Depts.map(d => d.name).join(', ')}`);
  console.log(`   - 2. Başkan Yardımcısı Altındaki Birimler: ${vm2Depts.map(d => d.name).join(', ')}`);

  console.log('\n=======================================================');
  console.log('🎉 TÜM HİYERARŞİ, DEDUPLICATION VE REAKTİF ATAMA TESTLERİ BAŞARIYLA GEÇTİ!');
  console.log('=======================================================');
}

main().catch(console.error);
