async function main() {
  const loginData = JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' });

  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginData
  });
  const loginJson = await loginRes.json();
  console.log('Login success:', loginJson.success, 'User:', loginJson.user?.full_name);

  const token = loginJson.token;
  const headers = { 'Authorization': `Bearer ${token}` };

  // 1. Test GET /api/admin/vice-mayors
  const vmsRes = await fetch('http://localhost:3000/api/admin/vice-mayors', { headers });
  const vmsJson = await vmsRes.json();
  console.log('\nVice Mayors count:', vmsJson.vice_mayors?.length);
  console.log('Vice Mayors hierarchy:');
  vmsJson.vice_mayors.forEach(vm => {
    console.log(`\n🏛️ ${vm.full_name} (${vm.departments.length} Müdürlük | ${vm.total_staff_count} Toplam Personel):`);
    vm.departments.forEach(d => {
      console.log(`   - ${d.name} | Birim Müdürü: ${d.manager_name} | Kadro: ${d.staff_count} personel`);
    });
  });

  // 2. Test GET /api/admin/departments
  const deptsRes = await fetch('http://localhost:3000/api/admin/departments', { headers });
  const deptsJson = await deptsRes.json();
  console.log('\nDepartments count:', deptsJson.departments?.length);
  deptsJson.departments.slice(0, 4).forEach(d => {
    console.log(`🏢 [${d.id}] ${d.name} | Müdür: ${d.manager_name} | Bağlı Olduğu Yrd: ${d.vice_mayor_name}`);
  });

  // 3. Test bulk assign to Vice Mayor 61
  const assignRes = await fetch('http://localhost:3000/api/admin/vice-mayors/61/departments', {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ department_ids: [1, 2, 5, 7, 9, 11] })
  });
  const assignJson = await assignRes.json();
  console.log('\nAssign result:', assignJson.message);
}

main().catch(console.error);
