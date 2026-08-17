async function debugUpdate() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  const cRes = await fetch('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ title: 'Debug 1', description: 'test', category_id: 1, neighborhood_id: 1, is_public: 1 })
  });
  const cData = await cRes.json();
  console.log('Created complaint data:', cData);

  const uRes = await fetch(`http://localhost:3000/api/complaints/${cData.complaint_id}/status-priority`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'Çözüldü' })
  });
  console.log('Update HTTP Status:', uRes.status);
  const uData = await uRes.json();
  console.log('Update Response body:', uData);

  const getRes = await fetch(`http://localhost:3000/api/complaints/${cData.complaint_id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getData = await getRes.json();
  console.log('Complaint status after update in detail API:', getData.complaint?.status);
}

debugUpdate().catch(console.error);
