const mysql = require('mysql2/promise');
const { memData, saveDbJson } = require('./config/db');

async function purgeAllIzolasyon() {
  console.log('--- PURGING FROM MYSQL DATABASE ---');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'belediye_talep'
    });

    const [all] = await connection.query('SELECT id, tracking_code, title FROM complaints');
    console.log(`MySQL complaints count: ${all.length}`);

    const normalizeStr = (s) => (s || '').toString().replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

    for (const row of all) {
      const t = normalizeStr(row.title);
      if (t.includes('izolasyon') || t.includes('debug')) {
        console.log(`Deleting from MySQL: ID ${row.id} | Code: ${row.tracking_code} | Title: "${row.title}"`);
        await connection.query('DELETE FROM satisfaction_surveys WHERE complaint_id = ?', [row.id]);
        await connection.query('DELETE FROM complaint_actions WHERE complaint_id = ?', [row.id]);
        await connection.query('DELETE FROM complaint_files WHERE complaint_id = ?', [row.id]);
        await connection.query('DELETE FROM complaint_status_history WHERE complaint_id = ?', [row.id]);
        await connection.query('DELETE FROM complaint_assignments WHERE complaint_id = ?', [row.id]);
        await connection.query('DELETE FROM complaints WHERE id = ?', [row.id]);
      }
    }

    const [remaining] = await connection.query('SELECT id, tracking_code, title, status FROM complaints');
    console.log(`\nMySQL complaints remaining count: ${remaining.length}`);
    remaining.forEach(r => console.log(`ID: ${r.id} | ${r.tracking_code} | ${r.status} | "${r.title}"`));

    await connection.end();
  } catch (e) {
    console.error('MySQL connection error:', e.message);
  }

  console.log('\n--- PURGING FROM MEMDATA & DB.JSON ---');
  const normalizeStr = (s) => (s || '').toString().replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  const kept = (memData.complaints || []).filter(c => {
    const t = normalizeStr(c.title);
    return !t.includes('izolasyon') && !t.includes('debug');
  });
  memData.complaints = kept;
  saveDbJson();
  console.log(`memData complaints remaining count: ${memData.complaints.length}`);
}

purgeAllIzolasyon().then(() => process.exit(0)).catch(console.error);
