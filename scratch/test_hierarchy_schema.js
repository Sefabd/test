async function testHierarchySchema() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  const vmRes = await fetch('http://localhost:3000/api/admin/vice-mayors', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const vmData = await vmRes.json();

  console.log('Success:', vmData.success);
  console.log('Total Vice Mayors count:', vmData.vice_mayors?.length);
  vmData.vice_mayors.forEach((vm, i) => {
    console.log(`[${i+1}] ${vm.full_name} (${vm.departments?.length || 0} Müdürlük):`, (vm.departments || []).map(d => d.name).join(', '));
  });
}

testHierarchySchema().catch(console.error);
