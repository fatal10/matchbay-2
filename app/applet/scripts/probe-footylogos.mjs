import fs from 'node:fs';

async function main() {
  const url = 'https://www.footylogos.com/player-pngs/erling-haaland';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MatchBay/1.0 (+https://matchbay.app)' }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  fs.writeFileSync('haaland.html', text);
  console.log('Saved haaland.html, size:', text.length);

  const images = [...text.matchAll(/https:\/\/[^"'\s]+\.(?:png|webp)/g)].map(m => m[0]);
  console.log('Unique image links:', [...new Set(images)]);
}

main().catch(console.error);
