async function testNewUniqueVM() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  const vmEmail = `baskanyrd.${Date.now()}@bulancak.bel.tr`;
  const createRes = await fetch('http://localhost:3000/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: 'Ahmet Karadeniz (Yeni Başkan Yrd)',
      email: vmEmail,
      phone: '05301112233',
      role_id: 6,
      password: 'password123',
      title: 'Belediye Başkan Yardımcısı',
      assigned_department_ids: [10, 11] // Bilgi İşlem, 153
    })
  });
  const createData = await createRes.json();
  console.log('Unique VM createData:', createData);

  const usersRes = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  const created = usersData.users.find(u => u.email === vmEmail);
  console.log('Created User -> ID:', created?.id, '| Name:', created?.full_name, '| Role:', created?.role_name, '| RoleID:', created?.role_id, '| Title:', created?.employee_title);
  console.log('Assigned Depts:', created?.assigned_department_names);
}

testNewUniqueVM().catch(console.error);
