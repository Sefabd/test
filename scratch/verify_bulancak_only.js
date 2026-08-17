async function verifyBulancakOnly() {
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

  console.log('Kalan Toplam Talep:', data.complaints?.length);
  console.log('\n--- KALAN TALEPLERİN MAHALLE LİSTESİ ---');
  data.complaints.forEach((c, i) => {
    console.log(`[${i+1}] ID: ${c.id} | Kod: ${c.tracking_code} | Mahalle: "${c.neighborhood_name}" | Başlık: "${c.title}"`);
  });
}

verifyBulancakOnly().catch(console.error);
