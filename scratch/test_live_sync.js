async function testLiveSync() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  // Check /api/complaints/all
  const res = await fetch('http://localhost:3000/api/complaints/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Tüm talepler API yanıt verdi, talep sayısı:', data.complaints?.length);
  console.log('Çözüldü olan talep sayısı:', data.complaints?.filter(c => c.status === 'Çözüldü').length);
}

testLiveSync().catch(console.error);
