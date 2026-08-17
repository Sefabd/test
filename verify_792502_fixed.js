const { memData } = require('./config/db');

const c = memData.complaints.find(item => item.tracking_code === 'BLD-2026-792502');
console.log('Talep:', c?.tracking_code, '| Başlık:', c?.title, '| Oluşturan:', c?.citizen_name);

const history = memData.complaint_status_history.filter(h => h.complaint_id == c?.id);
console.log('\nAktif History Sayısı:', history.length);
history.forEach((h, i) => {
  console.log(`[${i+1}] İşlem Yapan: "${h.changed_by_name}" | Durum: ${h.new_status} | Açıklama: "${h.change_reason}" | Tarih: ${h.created_at}`);
});
