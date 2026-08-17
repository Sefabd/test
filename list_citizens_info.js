const { memData } = require('./config/db');

console.log('=== CITIZEN USERS ===');
memData.users.filter(u => u.role_id === 4 || u.role_name === 'Vatandaş').forEach(u => {
  console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.full_name}`);
});
