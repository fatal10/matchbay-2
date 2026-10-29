import fs from 'fs';

async function inspectSearch() {
  const url = 'https://apigw.fotmob.com/searchapi/suggest?term=haaland';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    },
  });
  const data = await res.json();
  fs.writeFileSync('./scripts/fotmob-search-haaland.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('Saved fotmob search haaland response');
}
inspectSearch();
