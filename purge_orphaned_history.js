const { pool, memData, saveDbJson } = require('./config/db');

async function purgeAllOrphanedAndInvalidHistory() {
  console.log('=== TÜM ORPHANED VE GEÇERSİZ STATUS HISTORY TEMİZLİĞİ ===\n');

  const validComplaintIds = new Set((memData.complaints || []).map(c => Number(c.id)));
  const complaintCreatedAtMap = new Map();
  const complaintCitizenNameMap = new Map();

  (memData.complaints || []).forEach(c => {
    complaintCreatedAtMap.set(Number(c.id), new Date(c.created_at).getTime());
    complaintCitizenNameMap.set(Number(c.id), c.citizen_name || c.user_name || 'Vatandaş');
  });

  const cleanedHistory = [];
  let deletedCount = 0;

  (memData.complaint_status_history || []).forEach(h => {
    const cId = Number(h.complaint_id);
    // 1. Complaint exists?
    if (!validComplaintIds.has(cId)) {
      console.log(`[SİLİNDİ - Orphaned] Complaint ID ${cId} artık mevcut değil.`);
      deletedCount++;
      return;
    }

    // 2. Created at before complaint was created?
    const compCreatedAt = complaintCreatedAtMap.get(cId) || 0;
    const historyCreatedAt = new Date(h.created_at).getTime();

    if (historyCreatedAt < compCreatedAt - 10000) { // 10s tolerance
      console.log(`[SİLİNDİ - Zaman Uyuşmazlığı] Complaint ID ${cId} için talep tarihinden (${new Date(compCreatedAt).toISOString()}) önce oluşmuş eski log (${new Date(historyCreatedAt).toISOString()}) silindi.`);
      deletedCount++;
      return;
    }

    // 3. Fix initial creation log creator name if needed
    if (h.old_status === 'Yok' || (h.new_status === 'Yeni' && !h.old_status)) {
      const citizenName = complaintCitizenNameMap.get(cId);
      if (citizenName && !h.changed_by_name?.includes('Vatandaş')) {
        h.changed_by_name = citizenName;
      }
    }

    cleanedHistory.push(h);
  });

  memData.complaint_status_history = cleanedHistory;
  console.log(`\nToplam silinen geçersiz / eski log sayısı: ${deletedCount}`);
  console.log(`Kalan geçerli log sayısı: ${cleanedHistory.length}`);

  saveDbJson();
  console.log('✅ data/db.json başarıyla güncellendi.');
}

purgeAllOrphanedAndInvalidHistory().then(() => process.exit(0)).catch(console.error);
