async function testSecondViceMayor() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  const vmEmail = `baskan.yrd.yeni@bulancak.bel.tr`;
  const createRes = await fetch('http://localhost:3000/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: 'Kemal Sunal (3. Başkan Yardımcısı)',
      email: vmEmail,
      phone: '05443332211',
      role_id: 6,
      password: 'password123',
      title: 'Belediye Başkan Yardımcısı',
      assigned_department_ids: [3, 4, 6] // Park, Zabıta, Veteriner
    })
  });
  const createData = await createRes.json();
  console.log('Create result:', createData);

  const usersRes = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  const created = usersData.users.find(u => u.email === vmEmail);
  console.log('Created User Role:', created?.role_name, 'Role ID:', created?.role_id);
  console.log('Assigned Depts:', created?.assigned_department_names);

  const vmsRes = await fetch('http://localhost:3000/api/admin/vice-mayors', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const vmsData = await vmsRes.json();
  console.log('Total Vice Mayors in list:', vmsData.vice_mayors.length);
  vmsData.vice_mayors.forEach(vm => {
    console.log(`- [ID: ${vm.id}] ${vm.full_name} (${vm.departments.length} bağlı müdürlük)`);
  });
}

testSecondViceMayor().catch(console.error);
