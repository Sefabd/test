async function inspectComplaints() {
  const { pool, memData } = require('./config/db');

  console.log('--- MEM DATA COMPLAINTS ---');
  if (memData && memData.complaints) {
    memData.complaints.forEach(c => {
      console.log(`MEM: id=${c.id}, title="${c.title}", status="${c.status}", is_public=${c.is_public}`);
    });
  }

  console.log('--- MYSQL COMPLAINTS ---');
  try {
    const [rows] = await pool.query('SELECT id, title, status, is_public FROM complaints');
    rows.forEach(r => {
      console.log(`MYSQL: id=${r.id}, title="${r.title}", status="${r.status}", is_public=${r.is_public}`);
    });
  } catch (e) {
    console.error('MySQL query error:', e.message);
  }
}

inspectComplaints().then(() => process.exit(0)).catch(console.error);
