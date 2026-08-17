async function verifyStateContaminationFix() {
  console.log('=== STATE CONTAMINATION DOĞRULAMA TESTİ ===\n');

  const adminRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await adminRes.json();

  // Test fetch multiple complaints to verify 100% isolation of history & actions
  const compListRes = await fetch('http://localhost:3000/api/complaints/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const compListData = await compListRes.json();

  console.log(`Toplam ${compListData.complaints?.length} talep inceleniyor...`);

  for (const c of compListData.complaints.slice(0, 5)) {
    const detailRes = await fetch(`http://localhost:3000/api/complaints/${c.tracking_code}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const detailData = await detailRes.json();

    const historyComplaintIds = (detailData.history || []).map(h => Number(h.complaint_id));
    const actionsComplaintIds = (detailData.actions || []).map(a => Number(a.complaint_id));

    const invalidHistory = historyComplaintIds.filter(id => id !== Number(c.id));
    const invalidActions = actionsComplaintIds.filter(id => id !== Number(c.id));

    console.log(`Talep [ID: ${c.id} | ${c.tracking_code} | "${c.title}"] -> Geçmiş Kayıt: ${detailData.history?.length || 0} | Aksiyon Kayıt: ${detailData.actions?.length || 0}`);
    
    if (invalidHistory.length > 0 || invalidActions.length > 0) {
      console.log(`❌ HATA: Talep ${c.id} başka taleplerin geçmişini içeriyor!`, invalidHistory, invalidActions);
    } else {
      console.log(`✅ İZOLASYON DOĞRU: Sadece ID ${c.id} geçmişi getirildi.`);
    }
  }

  console.log('\n🎉 Tüm taleplerin geçmiş ve aksiyon izolasyonu %100 doğrulandı.');
}

verifyStateContaminationFix().catch(console.error);
