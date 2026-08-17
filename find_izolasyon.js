const { pool, memData } = require('./config/db');

async function findIzolasyonComplaints() {
  console.log('--- Checking memData.complaints ---');
  if (memData && Array.isArray(memData.complaints)) {
    const memFound = memData.complaints.filter(c => 
      (c.title && c.title.toLowerCase().includes('izolasyon')) ||
      (c.description && c.description.toLowerCase().includes('izolasyon'))
    );
    console.log(`Found in memData (${memFound.length}):`);
    memFound.forEach(c => console.log(`ID: ${c.id} | Code: ${c.tracking_code} | Title: "${c.title}"`));
  }

  console.log('\n--- Checking MySQL complaints ---');
  try {
    const [rows] = await pool.query(`
      SELECT id, tracking_code, title, description, status 
      FROM complaints 
      WHERE LOWER(title) LIKE '%izolasyon%' OR LOWER(description) LIKE '%izolasyon%'
    `);
    console.log(`Found in MySQL (${rows.length}):`);
    rows.forEach(c => console.log(`ID: ${c.id} | Code: ${c.tracking_code} | Title: "${c.title}"`));
  } catch (e) {
    console.log('MySQL error:', e.message);
  }
}

findIzolasyonComplaints().then(() => process.exit(0)).catch(console.error);
