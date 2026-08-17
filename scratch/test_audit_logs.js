async function testAuditLogs() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@belediye.gov.tr', password: '123456' })
  });
  const { token } = await loginRes.json();

  console.log('Testing GET /api/admin/logs...');
  const logsRes = await fetch('http://localhost:3000/api/admin/logs', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const logsData = await logsRes.json();

  console.log('Logs success:', logsData.success);
  console.log('Total logs returned:', logsData.logs?.length);

  if (logsData.logs && logsData.logs.length > 0) {
    console.log('Sample first 3 logs:');
    logsData.logs.slice(0, 3).forEach((l, i) => {
      console.log(`[${i+1}] Date: ${l.created_at} | User: ${l.user_name} | Action: ${l.action} | Entity: ${l.entity_name} (#${l.entity_id}) | IP: ${l.ip_address}`);
    });
  }

  console.log('\nTesting GET /api/admin/audit-logs alias...');
  const auditRes = await fetch('http://localhost:3000/api/admin/audit-logs', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const auditData = await auditRes.json();
  console.log('Audit-logs alias success:', auditData.success, 'Total:', auditData.logs?.length);
}

testAuditLogs().catch(console.error);
