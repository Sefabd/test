const { memData } = require('./config/db');
console.log('Vatandaş kullanıcıları:');
memData.users.filter(u => u.role_id === 4 || u.role_name === 'Vatandaş').slice(0, 5).forEach(u => {
  console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.full_name}`);
});
