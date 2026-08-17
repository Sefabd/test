const { pool, memData, saveDbJson } = require('./config/db');

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

const bulancakSet = new Set(
  BULANCAK_30.map(n => n.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().replace(' mahallesi', '').trim())
);

async function purgeNonBulancakComplaints() {
  console.log('=== BULANCAK DIŞI MAHALLELERİN TALEPLERİNİ SİLME ===\n');

  const normalizeStr = (s) => (s || '').toString().replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

  const deletedIds = [];
  const keptComplaints = [];

  (memData.complaints || []).forEach(c => {
    const titleNorm = normalizeStr(c.title);
    const descNorm = normalizeStr(c.description);
    const nName = (c.neighborhood_name || '').toString();
    const nObj = (memData.neighborhoods || []).find(n => Number(n.id) === Number(c.neighborhood_id));
    const effectiveNeigh = nName || nObj?.name || '';
    const effNorm = normalizeStr(effectiveNeigh).replace(' mahallesi', '').trim();

    const isBulancakNeigh = bulancakSet.has(effNorm);
    const isTestTalep = titleNorm.startsWith('test ') || titleNorm.includes('izolasyon') || titleNorm.includes('debug');
    const isGiresunTitle = titleNorm.includes('hacısiyam') || titleNorm.includes('çaykara') || titleNorm.includes('caykara') || titleNorm.includes('aksu') || titleNorm.includes('gazi caddesi') || titleNorm.includes('atatürk bulvarı') || titleNorm.includes('giresun atatürk');

    if (!isBulancakNeigh || isTestTalep || isGiresunTitle) {
      deletedIds.push(Number(c.id));
      console.log(`[SİLİNDİ] ID: ${c.id} | Takip Kodu: ${c.tracking_code} | Mahalle: "${effectiveNeigh}" | Başlık: "${c.title}"`);
    } else {
      keptComplaints.push(c);
    }
  });

  console.log(`\nToplam silinen talep sayısı: ${deletedIds.length}`);
  const idSet = new Set(deletedIds);

  // Update memData.complaints
  memData.complaints = keptComplaints;

  // Clean related tables
  if (Array.isArray(memData.complaint_files)) {
    memData.complaint_files = memData.complaint_files.filter(f => !idSet.has(Number(f.complaint_id)));
  }
  if (Array.isArray(memData.complaint_actions)) {
    memData.complaint_actions = memData.complaint_actions.filter(a => !idSet.has(Number(a.complaint_id)));
  }
  if (Array.isArray(memData.complaint_status_history)) {
    memData.complaint_status_history = memData.complaint_status_history.filter(h => !idSet.has(Number(h.complaint_id)));
  }
  if (Array.isArray(memData.satisfaction_surveys)) {
    memData.satisfaction_surveys = memData.satisfaction_surveys.filter(s => !idSet.has(Number(s.complaint_id)));
  }
  if (Array.isArray(memData.complaint_assignments)) {
    memData.complaint_assignments = memData.complaint_assignments.filter(a => !idSet.has(Number(a.complaint_id)));
  }

  // Delete from MySQL
  try {
    for (const id of deletedIds) {
      await pool.query('DELETE FROM satisfaction_surveys WHERE complaint_id = ?', [id]);
      await pool.query('DELETE FROM complaint_actions WHERE complaint_id = ?', [id]);
      await pool.query('DELETE FROM complaint_files WHERE complaint_id = ?', [id]);
      await pool.query('DELETE FROM complaint_status_history WHERE complaint_id = ?', [id]);
      await pool.query('DELETE FROM complaint_assignments WHERE complaint_id = ?', [id]);
      await pool.query('DELETE FROM complaints WHERE id = ?', [id]);
    }
  } catch (e) {
    console.log('MySQL deletion notice:', e.message);
  }

  saveDbJson();
  console.log('\n✅ data/db.json başarıyla güncellendi.');

  console.log(`\n=== KALAN TÜM BULANCAK TALEPLERİ (${memData.complaints.length}) ===`);
  memData.complaints.forEach((c, idx) => {
    console.log(`[${idx+1}] ID: ${c.id} | Kod: ${c.tracking_code} | Mahalle: "${c.neighborhood_name}" | Durum: "${c.status}" | Başlık: "${c.title}"`);
  });
}

purgeNonBulancakComplaints().then(() => process.exit(0)).catch(console.error);
