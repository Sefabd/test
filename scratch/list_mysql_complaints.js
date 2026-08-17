const mysql = require('mysql2/promise');

async function listComplaintsFromMySQL() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'belediye_talep'
  });

  const [rows] = await connection.query('SELECT id, tracking_code, title, description, status FROM complaints ORDER BY id DESC');
  console.log(`Total complaints in MySQL: ${rows.length}`);
  rows.forEach(r => {
    console.log(`ID: ${r.id} | Code: ${r.tracking_code} | Status: "${r.status}" | Title: "${r.title}"`);
  });
  await connection.end();
}

listComplaintsFromMySQL().catch(console.error);
