import fs from 'fs';

// Load TOP_PLAYERS_DATA
const playersDataJs = fs.readFileSync('./public/playersData.js', 'utf-8');
const topPlayersMatch = playersDataJs.match(/var TOP_PLAYERS_DATA = (\[[\s\S]*?\]);/);
let topPlayers = [];
if (topPlayersMatch) {
  topPlayers = eval(topPlayersMatch[1]);
}

const db = JSON.parse(fs.readFileSync('./public/player-photos-db.json', 'utf-8'));

function normalizeKey(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

console.log('Total top players in playersData.js:', topPlayers.length);

let matched = 0;
let missing = [];

for (const p of topPlayers) {
  const norm = normalizeKey(p.name);
  if (db.players[norm]) {
    matched++;
  } else {
    missing.push({ name: p.name, norm, team: p.team });
  }
}

console.log(`Matched in DB: ${matched}/${topPlayers.length}`);
console.log('Missing count:', missing.length);
if (missing.length > 0) {
  console.log('Sample missing:', missing.slice(0, 10));
}
