async function debugSurvey() {
  const citizenRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'caner@gmail.com', password: 'password123' })
  });
  const citizenData = await citizenRes.json();
  console.log('Login Response:', citizenData);

  if (!citizenData.token) {
    const try2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'caner@gmail.com', password: '123456' })
    });
    console.log('Login with 123456:', await try2.json());
  }

  const token = citizenData.token || (await (await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'caner@gmail.com', password: '123456' })
  })).json()).token;

  const surveyRes = await fetch('http://localhost:3000/api/complaints/11/survey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      rating: 5,
      review_comment: 'Ekipler çok hızlı geldi, teşekkürler!'
    })
  });
  const text = await surveyRes.text();
  console.log('Survey Status:', surveyRes.status);
  console.log('Survey Response:', text);
}
debugSurvey().catch(console.error);
