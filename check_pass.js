const { memData } = require('./config/db');
console.log('Caner:', memData.users.find(u => u.email === 'caner@gmail.com'));
