const { pool, memData, saveDbJson } = require('./config/db');

async function deleteSpecificTestComplaints() {
  const targetCodes = ['BLD-2026-507098', 'BLD-2026-577960'];
  console.log('Silinecek Hedef Talepler:', targetCodes);

  const targets = (memData.complaints || []).filter(c => targetCodes.includes(c.tracking_code));
  console.log('Bulunan Talepler:', targets.map(t => ({ id: t.id, code: t.tracking_code, title: t.title })));

  const targetIds = targets.map(t => Number(t.id));

  if (targetIds.length > 0) {
    memData.complaints = memData.complaints.filter(c => !targetIds.includes(Number(c.id)));
    memData.complaint_status_history = (memData.complaint_status_history || []).filter(h => !targetIds.includes(Number(h.complaint_id)));
    memData.complaint_actions = (memData.complaint_actions || []).filter(a => !targetIds.includes(Number(a.complaint_id)));
    memData.complaint_files = (memData.complaint_files || []).filter(f => !targetIds.includes(Number(f.complaint_id)));
    memData.satisfaction_surveys = (memData.satisfaction_surveys || []).filter(s => !targetIds.includes(Number(s.complaint_id)));

    try {
      for (const id of targetIds) {
        await pool.query('DELETE FROM complaint_status_history WHERE complaint_id = ?', [id]);
        await pool.query('DELETE FROM complaint_actions WHERE complaint_id = ?', [id]);
        await pool.query('DELETE FROM complaint_files WHERE complaint_id = ?', [id]);
        await pool.query('DELETE FROM satisfaction_surveys WHERE complaint_id = ?', [id]);
        await pool.query('DELETE FROM complaints WHERE id = ?', [id]);
      }
    } catch (e) {
      console.log('MySQL deletion note:', e.message);
    }

    saveDbJson();
    console.log('✅ Sadece bu 2 test talebi başarıyla silindi ve data/db.json güncellendi.');
  } else {
    console.log('Talepler zaten mevcut değil.');
  }
}

deleteSpecificTestComplaints().then(() => process.exit(0)).catch(console.error);
