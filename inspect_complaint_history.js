const { memData } = require('./config/db');

console.log('=== BLD-2026-793619 İNCELEMESİ ===');
const c = memData.complaints?.find(item => item.tracking_code === 'BLD-2026-793619' || item.title?.includes('Park yeri'));
console.log('Talep:', c);
if (c) {
  const histories = memData.complaint_status_history?.filter(h => Number(h.complaint_id) === Number(c.id));
  console.log('\nHistories for this complaint:', histories);
  const actions = memData.complaint_actions?.filter(a => Number(a.complaint_id) === Number(c.id));
  console.log('\nActions for this complaint:', actions);
}

console.log('\nTÜM STATUS HISTORY LİSTESİ:');
(memData.complaint_status_history || []).forEach(h => {
  console.log(`ID: ${h.id}, Complaint ID: ${h.complaint_id}, Old: ${h.old_status}, New: ${h.new_status}, Reason: "${h.change_reason}", Date: ${h.created_at}`);
});
