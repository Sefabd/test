async function testStatusPriority() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  const updateRes = await fetch(`http://localhost:3000/api/complaints/19/status-priority`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Çözüldü' })
  });
  const updateData = await updateRes.json();
  console.log('Update Response:', updateData);

  const { pool, memData } = require('./config/db');
  const [rows] = await pool.query('SELECT id, title, status FROM complaints WHERE id = 19');
  console.log('MySQL complaint 19:', rows);
  const memC = memData.complaints.find(c => c.id === 19);
  console.log('Mem complaint 19:', memC?.status);
}

testStatusPriority().then(() => process.exit(0)).catch(console.error);
