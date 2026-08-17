const { memData, saveDbJson } = require('./config/db');

memData.announcements = [
  {
    id: 1,
    title: '📢 Bulancak Belediyesi 153 Çözüm Merkezi Dijital Portalı Hizmete Girdi!',
    content: 'Bulancaklı hemşehrilerimizin belediye hizmetlerine 7/24 daha hızlı erişebilmesi, talep ve şikâyetlerini anlık iletebilmesi amacıyla yeni çözüm merkezimiz yayına alınmıştır.',
    category: 'Genel Duyuru',
    priority: 'Yüksek',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_by_name: 'Ahmet Yılmaz (Sistem Yöneticisi)',
    is_active: 1
  },
  {
    id: 2,
    title: '💧 Ballıca ve İhsaniye Mahallelerinde Planlı Su Şebekesi İyileştirmesi',
    content: 'Su ve Kanalizasyon Müdürlüğümüz tarafından ana iletim hattı bakım çalışmaları sebebiyle perşembe günü 09:00 - 15:00 saatleri arasında kısmi su kesintisi yaşanacaktır.',
    category: 'Altyapı & Su Kesintisi',
    priority: 'Acil',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_by_name: 'Ahmet Yılmaz (Sistem Yöneticisi)',
    is_active: 1
  },
  {
    id: 3,
    title: '🚧 Bulancak Sahil Caddesi Yol ve Kaldırım Yenileme Çalışmaları Başladı',
    content: 'Fen İşleri Müdürlüğümüz tarafından sahil bandı ve bağlantı yollarında asfalt serim ve çevre düzenleme çalışmaları başlatılmıştır.',
    category: 'Yol Çalışması',
    priority: 'Normal',
    created_at: new Date().toISOString(),
    created_by_name: 'Ahmet Yılmaz (Sistem Yöneticisi)',
    is_active: 1
  }
];

saveDbJson();
console.log('✅ Duyurular Bulancak Belediyesi olarak data/db.json içerisine güncellendi.');
