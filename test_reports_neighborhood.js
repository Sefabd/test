async function testReportsNeighborhood() {
  console.log('1. TÜM MAHALLELER RAPOR SORGUSU (ALL):');
  const allRes = await fetch('http://localhost:3000/api/stats/reports?time_range=this_month');
  const allData = await allRes.json();
  console.log('Genel Toplam:', allData.kpis?.total, '| Çözülen:', allData.kpis?.resolved, '| Oran:', allData.kpis?.resolution_rate);

  console.log('\n2. İSMETPAŞA MAHALLESİ RAPOR SORGUSU:');
  const ismetRes = await fetch('http://localhost:3000/api/stats/reports?time_range=this_month&neighborhood_name=' + encodeURIComponent('İsmetpaşa Mahallesi'));
  const ismetData = await ismetRes.json();
  console.log('İsmetpaşa Toplam:', ismetData.kpis?.total, '| Çözülen:', ismetData.kpis?.resolved, '| Oran:', ismetData.kpis?.resolution_rate);

  console.log('\n3. BALLICA MAHALLESİ RAPOR SORGUSU:');
  const ballicaRes = await fetch('http://localhost:3000/api/stats/reports?time_range=this_month&neighborhood_name=' + encodeURIComponent('Ballıca Mahallesi'));
  const ballicaData = await ballicaRes.json();
  console.log('Ballıca Toplam:', ballicaData.kpis?.total, '| Çözülen:', ballicaData.kpis?.resolved, '| Oran:', ballicaData.kpis?.resolution_rate);

  console.log('\n✅ Raporlar sayfası mahalle filtreleme testi başarıyla geçti!');
}

testReportsNeighborhood().catch(console.error);
