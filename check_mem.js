const { memData } = require('./config/db');

console.log('=== MEMORY COMPLAINTS STATUS CHECK ===');
memData.complaints.forEach(c => {
  console.log(`ID: ${c.id} | Title: ${c.title} | Status: "${c.status}" | is_public: ${c.is_public}`);
});

console.log('\n=== MEMORY DISTRICTS & NEIGHBORHOODS CHECK ===');
console.log('Districts:', memData.districts);
console.log('Neighborhoods Count:', memData.neighborhoods?.length);
