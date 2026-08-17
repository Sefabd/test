const { memData } = require('./config/db');

const BULANCAK_30 = [
  'Acısu Mahallesi', 'Ahurlu Mahallesi', 'Alibey Mahallesi', 'Arifli Mahallesi',
  'Aydınlar Mahallesi', 'Bahçelievler Mahallesi', 'Ballıca Mahallesi', 'Bulancak Mahallesi',
  'Derecikalan Mahallesi', 'Duacıoğlu Mahallesi', 'Düz Mahallesi', 'Güney Mahallesi',
  'Güzelyalı Mahallesi', 'Güzelyurt Mahallesi', 'İhsaniye Mahallesi', 'İsmet Paşa Mahallesi',
  'İsmetpaşa Mahallesi', 'Kızılot Mahallesi', 'Merkez Mahallesi', 'Pazarsuyu Mahallesi',
  'Pazarsuyu Emecen Mahallesi', 'Sanayi Mahallesi', 'Saraçlı Mahallesi', 'Şemsettin Mahallesi',
  'Sisin Mahallesi', 'Sofulu Mahallesi', 'Soğuksu Mahallesi', 'Toprakdeğirmeni Mahallesi',
  'Uçarlı Mahallesi', 'Yeni Mahallesi', 'Yunuslu Mahallesi'
];

const bulancakLowerSet = new Set(BULANCAK_30.map(n => n.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().replace(' mahallesi', '')));

console.log('=== TÜM MEVCUT TALEPLER VE MAHALLELERİ ===\n');

(memData.complaints || []).forEach(c => {
  const nName = (c.neighborhood_name || '').toString();
  const nId = c.neighborhood_id;
  const nObj = (memData.neighborhoods || []).find(n => Number(n.id) === Number(nId));
  const effectiveNeigh = nName || nObj?.name || 'Bilinmiyor';

  const effNorm = effectiveNeigh.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().replace(' mahallesi', '').trim();
  const isBulancak = bulancakLowerSet.has(effNorm);

  const titleNorm = (c.title || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  const descNorm = (c.description || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  const hasGiresunKeyword = titleNorm.includes('hacısiyam') || titleNorm.includes('çaykara') || titleNorm.includes('caykara') || titleNorm.includes('aksu') || titleNorm.includes('gazi caddesi') || titleNorm.includes('atatürk bulvarı') || titleNorm.includes('ataturk bulvari') || descNorm.includes('hacısiyam') || descNorm.includes('çaykara') || descNorm.includes('caykara') || descNorm.includes('aksu');

  console.log(`ID: ${c.id} | Kod: ${c.tracking_code} | Mahalle: "${effectiveNeigh}" | Başlık: "${c.title}" | Bulancak Mahallesinde mi?: ${isBulancak && !hasGiresunKeyword ? '✅ EVET' : '❌ HAYIR (Giresun/Geçersiz)'}`);
});
