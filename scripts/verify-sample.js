import fs from 'fs';

const samplePlayers = [
  'Erling Haaland',
  'Kevin De Bruyne',
  'Phil Foden',
  'Rodri',
  'Bukayo Saka',
  'Martin Ødegaard',
  'Declan Rice',
  'Mohamed Salah',
  'Virgil van Dijk',
  'Trent Alexander-Arnold',
  'Cole Palmer',
  'Nicolas Jackson',
  'Bruno Fernandes',
  'Marcus Rashford',
  'Kobbie Mainoo',
  'Kylian Mbappé',
  'Vinícius Júnior',
  'Jude Bellingham',
  'Rodrygo',
  'Luka Modric',
  'Robert Lewandowski',
  'Lamine Yamal',
  'Pedri',
  'Raphinha',
  'Harry Kane',
  'Jamal Musiala',
  'Florian Wirtz',
  'Lautaro Martínez',
  'Rafael Leão',
  'Son Heung-min'
];

async function verifyAll() {
  const verified = [];
  const errors = [];

  for (const name of samplePlayers) {
    const q = encodeURIComponent(name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const searchUrl = `https://apigw.fotmob.com/searchapi/suggest?term=${q}`;
    try {
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!res.ok) {
        errors.push({ name, error: `Search API failed ${res.status}` });
        continue;
      }
      const data = await res.json();
      const squadOptions = (data.squadMemberSuggest && data.squadMemberSuggest[0] && data.squadMemberSuggest[0].options) || [];
      if (!squadOptions.length) {
        errors.push({ name, error: 'No suggestions found' });
        continue;
      }

      // Find best match by comparing name
      const best = squadOptions[0];
      const fotmobId = best.payload?.id;
      const teamName = best.payload?.teamName;
      const playerName = best.text.split('|')[0];

      // Now verify headshot image
      const imgUrl = `https://images.fotmob.com/image_resources/playerimages/${fotmobId}.png`;
      const imgRes = await fetch(imgUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (imgRes.ok) {
        verified.push({
          requestedName: name,
          fotmobName: playerName,
          fotmobId,
          teamName,
          imgUrl,
          status: imgRes.status,
          contentType: imgRes.headers.get('content-type'),
          bytes: imgRes.headers.get('content-length'),
          cfCache: imgRes.headers.get('cf-cache-status'),
        });
      } else {
        errors.push({
          requestedName: name,
          fotmobName: playerName,
          fotmobId,
          teamName,
          status: imgRes.status,
          error: 'Image returned non-200'
        });
      }
    } catch (err) {
      errors.push({ name, error: err.message });
    }
  }

  const report = {
    totalRequested: samplePlayers.length,
    verifiedCount: verified.length,
    errorCount: errors.length,
    verified,
    errors,
  };

  fs.writeFileSync('./scripts/sample-verified-fotmob.json', JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Verified: ${verified.length}/${samplePlayers.length}. Errors: ${errors.length}`);
}

verifyAll();
