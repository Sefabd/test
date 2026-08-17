async function verifyLocations() {
  const res = await fetch('http://localhost:3000/api/public/locations');
  const data = await res.json();
  console.log('Success:', data.success);
  console.log('Total neighborhoods returned from API:', data.neighborhoods?.length);
  console.log('List of all 30 neighborhoods:');
  data.neighborhoods.forEach((n, i) => {
    console.log(`[${i+1}] ${n.name} (lat: ${n.lat}, lng: ${n.lng})`);
  });
}
verifyLocations().catch(console.error);
