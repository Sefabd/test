async function verifyFinal() {
  const adminRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token: adminToken } = await adminRes.json();

  const compRes = await fetch('http://localhost:3000/api/complaints/all', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const compData = await compRes.json();

  console.log('Total complaints:', compData.complaints?.length);
  const resolvedWithRating = compData.complaints.filter(c => c.status === 'Çözüldü' && c.avg_rating !== null);
  console.log('Resolved complaints with fake rating (should be 0):', resolvedWithRating.length);
}
verifyFinal().catch(console.error);
