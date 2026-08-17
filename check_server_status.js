async function checkStatus() {
  const res = await fetch('http://localhost:3000/api/public/categories');
  const data = await res.json();
  console.log('Server is running, categories success:', data.success);
}
checkStatus().catch(console.error);
