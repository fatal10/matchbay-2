import fs from 'fs';

async function test() {
  const result = {
    startedAt: new Date().toISOString(),
    tests: [],
  };

  const players = [
    { name: 'Erling Haaland', fotmobId: 1038373, matchbayId: '1100' },
    { name: 'Kylian Mbappé', fotmobId: 737066, matchbayId: '278' },
    { name: 'Mohamed Salah', fotmobId: 292462, matchbayId: '306' },
    { name: 'Kevin De Bruyne', fotmobId: 209787, matchbayId: '629' },
    { name: 'Jude Bellingham', fotmobId: 1096706, matchbayId: '152982' },
    { name: 'Vinícius Júnior', fotmobId: 994249, matchbayId: '54' },
    { name: 'Robert Lewandowski', fotmobId: 96653, matchbayId: '521' },
    { name: 'Bukayo Saka', fotmobId: 1021469, matchbayId: '1466' },
    { name: 'Rodri', fotmobId: 673623, matchbayId: '645' },
    { name: 'Lamine Yamal', fotmobId: 1444983, matchbayId: '380063' },
  ];

  for (const p of players) {
    const fotmobUrl = `https://images.fotmob.com/image_resources/playerimages/${p.fotmobId}.png`;
    const matchbayUrl = `https://images.fotmob.com/image_resources/playerimages/${p.matchbayId}.png`;

    let fotmobRes = { status: null, ok: false, error: null };
    try {
      const res = await fetch(fotmobUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Referer': 'https://www.fotmob.com/',
        },
      });
      fotmobRes = {
        status: res.status,
        ok: res.ok,
        contentType: res.headers.get('content-type'),
        contentLength: res.headers.get('content-length'),
      };
    } catch (err) {
      fotmobRes = { error: err.message };
    }

    let matchbayRes = { status: null, ok: false, error: null };
    try {
      const res = await fetch(matchbayUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Referer': 'https://www.fotmob.com/',
        },
      });
      matchbayRes = {
        status: res.status,
        ok: res.ok,
        contentType: res.headers.get('content-type'),
        contentLength: res.headers.get('content-length'),
      };
    } catch (err) {
      matchbayRes = { error: err.message };
    }

    result.tests.push({
      player: p.name,
      fotmobId: p.fotmobId,
      matchbayId: p.matchbayId,
      fotmobUrl,
      fotmobRes,
      matchbayUrl,
      matchbayRes,
    });
  }

  result.finishedAt = new Date().toISOString();
  fs.writeFileSync('./scripts/fotmob-test-results.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('Results written to scripts/fotmob-test-results.json');
}

test();
