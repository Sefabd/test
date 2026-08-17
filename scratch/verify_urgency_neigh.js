async function verifyUrgencyAndNeighborhoods() {
  const locRes = await fetch('http://localhost:3000/api/public/districts-neighborhoods');
  const locData = await locRes.json();

  console.log('Location success:', locData.success);
  console.log('Total neighborhoods in API:', locData.neighborhoods?.length);
  console.log('Sample first 5 neighborhoods:', locData.neighborhoods?.slice(0, 5).map(n => n.name));
  console.log('Sample last 5 neighborhoods:', locData.neighborhoods?.slice(-5).map(n => n.name));

  // Check 3-urgency options
  console.log('\n--- URGENCY LEVELS TEST ---');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  for (const urgency of ['Acil', 'Normal', 'Düşük']) {
    const cRes = await fetch('http://localhost:3000/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: `Test ${urgency} Talep`,
        description: `Bu bir ${urgency} aciliyet testidir.`,
        department_id: 1,
        category_id: 1,
        neighborhood_id: 8, // Bulancak Mahallesi
        district_id: 1,
        urgency_level: urgency,
        is_public: 1
      })
    });
    const cData = await cRes.json();
    console.log(`Created complaint with urgency "${urgency}":`, cData.success, '| Tracking Code:', cData.tracking_code, '| Urgency:', cData.complaint?.urgency_level || urgency);
    
    // Clean it up immediately
    if (cData.complaint?.id) {
      await fetch(`http://localhost:3000/api/admin/complaints/${cData.complaint.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  }
}

verifyUrgencyAndNeighborhoods().catch(console.error);
