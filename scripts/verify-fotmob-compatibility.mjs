import https from 'https';

// Test list of real football players with FotMob IDs vs ESPN IDs vs API-Sports IDs
const testPlayers = [
  { name: 'Erling Haaland', fotmobId: 1038373, apiSportsId: 1100, espnId: 247547, team: 'Manchester City' },
  { name: 'Kylian Mbappé', fotmobId: 737066, apiSportsId: 278, espnId: 215093, team: 'Real Madrid' },
  { name: 'Jude Bellingham', fotmobId: 1096706, apiSportsId: 152982, espnId: 254884, team: 'Real Madrid' },
  { name: 'Vinícius Júnior', fotmobId: 994249, apiSportsId: 54, espnId: 238713, team: 'Real Madrid' },
  { name: 'Mohamed Salah', fotmobId: 292462, apiSportsId: 306, espnId: 118748, team: 'Liverpool' },
  { name: 'Bukayo Saka', fotmobId: 1021469, apiSportsId: 1466, espnId: 249673, team: 'Arsenal' },
  { name: 'Kevin De Bruyne', fotmobId: 209787, apiSportsId: 629, espnId: 132757, team: 'Manchester City' },
  { name: 'Robert Lewandowski', fotmobId: 96653, apiSportsId: 521, espnId: 88701, team: 'Barcelona' },
  { name: 'Lamine Yamal', fotmobId: 1444983, apiSportsId: 380063, espnId: 326725, team: 'Barcelona' },
  { name: 'Phil Foden', fotmobId: 829562, apiSportsId: 633, espnId: 236896, team: 'Manchester City' },
  { name: 'Rodri', fotmobId: 673623, apiSportsId: 645, espnId: 226998, team: 'Manchester City' },
  { name: 'Cole Palmer', fotmobId: 1096707, apiSportsId: 152982, espnId: 260383, team: 'Chelsea' },
  { name: 'Florian Wirtz', fotmobId: 1138883, apiSportsId: 161907, espnId: 270380, team: 'Bayer Leverkusen' },
  { name: 'Harry Kane', fotmobId: 178224, apiSportsId: 184, espnId: 120150, team: 'Bayern Munich' },
  { name: 'Declan Rice', fotmobId: 834927, apiSportsId: 2936, espnId: 231575, team: 'Arsenal' },
  { name: 'Virgil van Dijk', fotmobId: 203389, apiSportsId: 290, espnId: 154561, team: 'Liverpool' },
  { name: 'Son Heung-min', fotmobId: 210215, apiSportsId: 186, espnId: 141974, team: 'Tottenham' },
  { name: 'Martin Ødegaard', fotmobId: 541014, apiSportsId: 379, espnId: 198270, team: 'Arsenal' },
  { name: 'Jamal Musiala', fotmobId: 1133036, apiSportsId: 161908, espnId: 266187, team: 'Bayern Munich' },
  { name: 'Bruno Fernandes', fotmobId: 440306, apiSportsId: 1485, espnId: 177747, team: 'Manchester United' },
  { name: 'Alisson Becker', fotmobId: 388107, apiSportsId: 282, espnId: 186981, team: 'Liverpool' },
  { name: 'Lautaro Martínez', fotmobId: 712071, apiSportsId: 187, espnId: 217621, team: 'Inter' },
  { name: 'Rafael Leão', fotmobId: 919746, apiSportsId: 22221, espnId: 239920, team: 'AC Milan' },
  { name: 'Pedri', fotmobId: 1111933, apiSportsId: 138806, espnId: 265882, team: 'Barcelona' },
  { name: 'Federico Valverde', fotmobId: 752203, apiSportsId: 759, espnId: 219762, team: 'Real Madrid' },
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.google.com/',
        },
      },
      (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
        });
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: 'timeout' });
    });
    req.end();
  });
}

async function run() {
  console.log('=== Step 1 & 2: Testing FotMob Image URL Pattern & Compatibility ===\n');

  let fotmobSuccess = 0;
  let fotmobFail = 0;
  const results = [];

  for (const p of testPlayers) {
    const fotmobUrl = `https://images.fotmob.com/image_resources/playerimages/${p.fotmobId}.png`;
    const res = await checkUrl(fotmobUrl);
    const ok = res.statusCode === 200;
    if (ok) fotmobSuccess++;
    else fotmobFail++;

    results.push({
      player: p.name,
      team: p.team,
      fotmobId: p.fotmobId,
      status: res.statusCode,
      contentType: res.headers ? res.headers['content-type'] : null,
      contentLength: res.headers ? res.headers['content-length'] : null,
      cacheControl: res.headers ? res.headers['cache-control'] : null,
      cfRay: res.headers ? res.headers['cf-ray'] : null,
      accessControlAllowOrigin: res.headers ? res.headers['access-control-allow-origin'] : null,
    });
  }

  console.log(`Tested ${testPlayers.length} verified FotMob player IDs:`);
  console.log(`- Success (HTTP 200 PNG): ${fotmobSuccess}`);
  console.log(`- Failed: ${fotmobFail}`);
  console.log('\nSample header details from first successful response:');
  const sample = results[0];
  console.log({
    player: sample.player,
    status: sample.status,
    contentType: sample.contentType,
    contentLength: sample.contentLength,
    cacheControl: sample.cacheControl,
    cors: sample.accessControlAllowOrigin || '(wildcard / standard)',
  });

  // Now test: Do MatchBay's IDs (API-Sports or ESPN) work directly with FotMob's URL pattern?
  console.log('\n=== Testing direct MatchBay IDs vs FotMob Image URL ===');
  let matchbayDirectMatches = 0;
  for (const p of testPlayers.slice(0, 5)) {
    const testUrlApiSports = `https://images.fotmob.com/image_resources/playerimages/${p.apiSportsId}.png`;
    const resApi = await checkUrl(testUrlApiSports);
    console.log(`Testing API-Sports ID ${p.apiSportsId} for ${p.name}: HTTP ${resApi.statusCode} (Expected FotMob ID: ${p.fotmobId})`);

    const testUrlEspn = `https://images.fotmob.com/image_resources/playerimages/${p.espnId}.png`;
    const resEspn = await checkUrl(testUrlEspn);
    console.log(`Testing ESPN ID ${p.espnId} for ${p.name}: HTTP ${resEspn.statusCode} (Expected FotMob ID: ${p.fotmobId})`);
  }
}

run();
