async function testMapSync() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  const allRes = await fetch('http://localhost:3000/api/complaints/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const allData = await allRes.json();

  console.log('Map Data success:', allData.success);
  console.log('Total complaints for Map:', allData.complaints?.length);

  const activeComplaints = allData.complaints.filter(c => c.status !== 'Çözüldü' && c.status !== 'İptal edildi' && c.status !== 'passive');
  const resolvedComplaints = allData.complaints.filter(c => c.status === 'Çözüldü');

  console.log('Active (Default Map View) count:', activeComplaints.length);
  console.log('Resolved (Archive/Filtered View) count:', resolvedComplaints.length);

  // Check sample statuses
  console.log('\nSample 5 complaints status & urgency:');
  allData.complaints.slice(0, 5).forEach((c, i) => {
    console.log(`[${i+1}] #${c.tracking_code || c.id} | Status: "${c.status}" | Urgency: "${c.urgency_level || c.priority_level}" | Neighborhood: "${c.neighborhood_name}"`);
  });
}

testMapSync().catch(console.error);
