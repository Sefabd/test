const fs = require('fs');
const path = require('path');
const { pool, memData, saveDbJson } = require('./config/db');

async function deleteIzolasyonComplaints() {
  console.log('=== İZOLASYON TEST TALEPLERİNİ TEMİZLEME ===\n');

  const normalizeStr = (s) => (s || '').toString().replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

  const deletedIds = [];
  const keptComplaints = [];

  (memData.complaints || []).forEach(c => {
    const titleNorm = normalizeStr(c.title);
    const descNorm = normalizeStr(c.description);
    if (titleNorm.includes('izolasyon') || descNorm.includes('izolasyon') || titleNorm.includes('debug')) {
      deletedIds.push(Number(c.id));
      console.log(`[SILINIYOR] ID: ${c.id} | Takip Kodu: ${c.tracking_code} | Başlık: "${c.title}"`);
    } else {
      keptComplaints.push(c);
    }
  });

  console.log(`\nToplam silinecek test talebi sayısı: ${deletedIds.length}`);
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

  // Clean MySQL if any
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
    console.log('MySQL cleanup notice:', e.message);
  }

  // Save to disk
  saveDbJson();
  console.log('\n✅ data/db.json başarıyla güncellendi ve kaydedildi.');

  console.log(`\n=== KALAN GERÇEK TALEPLER (${memData.complaints.length}) ===`);
  memData.complaints.forEach((c, idx) => {
    console.log(`[${idx+1}] ID: ${c.id} | Kod: ${c.tracking_code} | Durum: ${c.status} | Başlık: "${c.title}"`);
  });
}

deleteIzolasyonComplaints().then(() => process.exit(0)).catch(console.error);
