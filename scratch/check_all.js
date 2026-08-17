async function checkAllComplaints() {
  const { pool, memData } = require('./config/db');
  const [rows] = await pool.query('SELECT id, title, status, is_public, created_at FROM complaints ORDER BY id DESC');
  console.log('All complaints in MySQL count:', rows.length);
  rows.forEach(r => {
    console.log(`[${r.id}] "${r.title}" -> status="${r.status}", is_public=${r.is_public}`);
  });
  if (memData && memData.complaints) {
    console.log('Mem complaints count:', memData.complaints.length);
    memData.complaints.forEach(r => {
      console.log(`MEM: [${r.id}] "${r.title}" -> status="${r.status}", is_public=${r.is_public}`);
    });
  }
}
checkAllComplaints().then(() => process.exit(0)).catch(console.error);
