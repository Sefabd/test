const { memData } = require('./config/db');

const c = memData.complaints.find(item => item.tracking_code === 'BLD-2026-792502');
console.log('Talep 792502:', c);

const history = memData.complaint_status_history.filter(h => h.complaint_id == c?.id);
console.log('\nHistory 792502:', history);
