async function debugFeed() {
  const res = await fetch('http://localhost:3000/api/complaints/public-feed');
  const data = await res.json();
  console.log('Public Feed Items Count:', data.complaints.length);
  data.complaints.forEach(c => {
    console.log(`ID: ${c.id} | Title: "${c.title}" | Status: "${c.status}" | Neigh: ${c.neighborhood_name}`);
  });
}
debugFeed().catch(console.error);
