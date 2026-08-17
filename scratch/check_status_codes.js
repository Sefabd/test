const { memData } = require('../config/db');

const c15 = memData.complaints.find(c => c.id == 15);
console.log('c15 status:', JSON.stringify(c15?.status));
console.log('c15 status === "Çözüldü":', c15?.status === 'Çözüldü');
console.log('c15 status charCodes:', Array.from(c15?.status || '').map(ch => ch.charCodeAt(0)));
console.log('"Çözüldü" charCodes:', Array.from('Çözüldü').map(ch => ch.charCodeAt(0)));
