async function inspectXml() {
  const url = 'https://images.fotmob.com/image_resources/playerimages/1038373.png';
  const res = await fetch(url);
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  const body = await res.text();
  console.log('Body:', body);
}
inspectXml();
