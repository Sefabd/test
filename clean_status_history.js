const { pool, memData, saveDbJson } = require('./config/db');

async function cleanStaleStatusHistory() {
  console.log('=== STATUS HISTORY TEMİZLİK VE NORMALİZASYONU ===\n');

  if (!Array.isArray(memData.complaint_status_history)) {
    memData.complaint_status_history = [];
  }

  const initialCount = memData.complaint_status_history.length;
  const validHistories = [];
  const seenKeys = new Set();

  memData.complaint_status_history.forEach(h => {
    const cId = Number(h.complaint_id);
    if (!cId || isNaN(cId)) return;

    // Filter out invalid/corrupted records
    if (h.old_status === 'undefined' && h.new_status === 'undefined') return;
    if (h.change_reason === 'undefined') return;

    const key = `${cId}_${h.new_status}_${h.change_reason}_${(h.created_at || '').substring(0, 16)}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      validHistories.push(h);
    }
  });

  memData.complaint_status_history = validHistories;
  console.log(`Temizlik öncesi: ${initialCount}, Temizlik sonrası: ${validHistories.length}`);

  try {
    await pool.query('DELETE FROM complaint_status_history WHERE change_reason = "undefined" OR (old_status = "undefined" AND new_status = "undefined")');
  } catch (e) {
    console.log('MySQL cleanup notice:', e.message);
  }

  saveDbJson();
  console.log('✅ data/db.json başarıyla güncellendi.');
}

cleanStaleStatusHistory().then(() => process.exit(0)).catch(console.error);
