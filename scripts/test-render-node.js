import fs from 'fs';

// Setup browser globals
globalThis.self = globalThis;
globalThis.window = globalThis;

// 1. Load playersData.js
const playersDataCode = fs.readFileSync('./public/playersData.js', 'utf-8');
new Function(playersDataCode)();

// 2. Load playerSpotlight.js
const spotlightCode = fs.readFileSync('./public/playerSpotlight.js', 'utf-8');
new Function(spotlightCode)();

// 3. Load player-photos-db.json
const db = JSON.parse(fs.readFileSync('./public/player-photos-db.json', 'utf-8'));
globalThis.PLAYER_PHOTOS_DB = db;

console.log('window.PlayerSpotlight:', typeof globalThis.PlayerSpotlight);
console.log('window.getSpotlightPlayerPhoto:', typeof globalThis.getSpotlightPlayerPhoto);
console.log('DB total players:', db.totalPlayers);

// Test players
const testPlayers = [
  { name: 'Erling Haaland', team: 'Manchester City' },
  { name: 'Kylian Mbappé', team: 'Real Madrid' },
  { name: 'Bukayo Saka', team: 'Arsenal' },
  { name: 'Mohamed Salah', team: 'Liverpool' },
  { name: 'Kevin De Bruyne', team: 'Manchester City' },
  { name: 'Rodri', team: 'Manchester City' },
  { name: 'Jude Bellingham', team: 'Real Madrid' },
  { name: 'Vinícius Júnior', team: 'Real Madrid' }
];

for (const p of testPlayers) {
  const photo = globalThis.getSpotlightPlayerPhoto(p);
  const details = globalThis.PlayerSpotlight.getSpotlightPlayerDetails(p);
  console.log(`\nPlayer: ${p.name}`);
  console.log(`  photo: ${photo}`);
  console.log(`  details.photo: ${details.photo}`);
  console.log(`  details.fotmobId: ${details.fotmobId}`);
}
