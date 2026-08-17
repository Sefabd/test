const { memData } = require('./config/db');

console.log('Total memData.complaints:', memData.complaints?.length);
(memData.complaints || []).forEach(c => {
  console.log(`ID: ${c.id} | Code: ${c.tracking_code} | Status: "${c.status}" | Title: "${c.title}"`);
});
