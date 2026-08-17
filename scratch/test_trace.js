const { pool, memData } = require('../config/db');

async function testTrace() {
  console.log('=== 1. memData active items ===');
  const activeItems = memData.complaints.filter(c => 
    (c.status !== 'Çözüldü' && c.status !== 'İptal edildi')
  );
  console.log('activeItems ids:', activeItems.map(c => `${c.id} (${c.status})`));

  console.log('\n=== 2. MySQL query test ===');
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.title, c.status
      FROM complaints c
      WHERE c.status != 'Çözüldü' AND c.status != 'İptal edildi'
    `);
    console.log('MySQL rows ids:', rows.map(r => `${r.id} (${r.status})`));
  } catch (err) {
    console.error('MySQL error:', err.message);
  }
}

testTrace().catch(console.error);
