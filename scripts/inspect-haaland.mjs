import fs from 'node:fs';

const html = fs.readFileSync('scripts/haaland.html', 'utf8');

const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (jsonLdMatch) {
  const parsed = JSON.parse(jsonLdMatch[1]);
  console.log('JSON-LD graph types:', parsed['@graph']?.map(x => x['@type']));
  const person = parsed['@graph']?.find(x => x['@type'] === 'Person');
  console.log('Person:', person);
}

// Check card contents
const cards = [...html.matchAll(/<div[^>]*class="[^"]*(?:card|photo|thumb|item|preview)[^"]*"[\s\S]*?<\/div>/gi)].map(m => m[0]);
console.log('Card snippet 0:\n', cards[0]?.slice(0, 500));
