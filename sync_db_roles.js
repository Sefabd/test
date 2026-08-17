const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');
if (fs.existsSync(dbPath)) {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const roleNameMap = {
    1: 'Sistem Yöneticisi',
    2: 'Birim Yöneticisi',
    3: 'Personel',
    4: 'Vatandaş',
    5: 'Belediye Başkanı',
    6: 'Belediye Başkan Yardımcısı'
  };

  const uniqueMap = new Map();
  (data.users || []).forEach(u => {
    const roleId = Number(u.role_id);
    const correctRoleName = roleNameMap[roleId] || 'Vatandaş';
    const numId = Number(u.id);

    uniqueMap.set(numId, {
      ...u,
      id: numId,
      role_id: roleId,
      role_name: correctRoleName,
      employee_title: roleId === 6 ? (u.employee_title && u.employee_title !== 'Vatandaş' ? u.employee_title : 'Belediye Başkan Yardımcısı') : u.employee_title
    });
  });

  data.users = Array.from(uniqueMap.values());
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ data/db.json kullanıcı rolleri ve hiyerarşi senkronize edildi. Toplam tekil kullanıcı:', data.users.length);
}
