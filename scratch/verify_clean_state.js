async function verifyCleanState() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  const res = await fetch('http://localhost:3000/api/complaints/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();

  console.log('Total complaints remaining:', data.complaints?.length);
  const izoCount = (data.complaints || []).filter(c => (c.title || '').toLowerCase().includes('izolasyon')).length;
  console.log('Izolasyon test complaints remaining:', izoCount);

  (data.complaints || []).forEach((c, i) => {
    console.log(`[${i+1}] ID: ${c.id} | Kod: ${c.tracking_code} | Durum: ${c.status} | Başlık: "${c.title}"`);
  });
}

verifyCleanState().catch(console.error);
