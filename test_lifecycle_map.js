async function testLifecycleMapSync() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  // 1. Get initial map data
  const r1 = await fetch('http://localhost:3000/api/complaints/all', { headers: { 'Authorization': `Bearer ${token}` } });
  const d1 = await r1.json();
  const c = d1.complaints[0];
  const oldStatus = c.status;
  console.log(`[Initial] Complaint #${c.tracking_code} (ID: ${c.id}) Status: "${oldStatus}"`);

  // 2. Toggle status
  const nextStatus = oldStatus === 'Çözüldü' ? 'İşlemde' : 'Çözüldü';
  const putRes = await fetch(`http://localhost:3000/api/complaints/${c.id}/status-priority`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ complaint_id: c.id, status: nextStatus, priority_level: c.priority_level || 'Normal' })
  });
  console.log('Update Status Result:', (await putRes.json()).success);

  // 3. Immediately re-fetch map data (without F5 / restart)
  const r2 = await fetch('http://localhost:3000/api/complaints/all', { headers: { 'Authorization': `Bearer ${token}` } });
  const d2 = await r2.json();
  const updatedC = d2.complaints.find(x => x.id === c.id);
  console.log(`[After Update] Complaint #${updatedC.tracking_code} Status is NOW: "${updatedC.status}"`);

  // 4. Revert back to original
  await fetch(`http://localhost:3000/api/complaints/${c.id}/status-priority`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ complaint_id: c.id, status: oldStatus, priority_level: c.priority_level || 'Normal' })
  });
  console.log('Reverted back to original status cleanly.');
}

testLifecycleMapSync().catch(console.error);
