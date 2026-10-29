import fs from 'fs';

const fotmobData = JSON.parse(fs.readFileSync('./public/fotmob-player-ids.json', 'utf-8'));
const oldDb = JSON.parse(fs.readFileSync('./public/player-photos-db.json', 'utf-8'));

// Extract locked players
const lockedPlayers = {};
for (const [key, p] of Object.entries(oldDb.players || {})) {
  if (p && p.locked) {
    lockedPlayers[key] = p;
  }
}

console.log('Preserved locked players:', Object.keys(lockedPlayers));

const mergedPlayers = { ...lockedPlayers };

for (const [key, p] of Object.entries(fotmobData.players || {})) {
  if (mergedPlayers[key] && mergedPlayers[key].locked) {
    continue; // preserve locked
  }
  mergedPlayers[key] = {
    key: key,
    name: p.name,
    fotmobName: p.fotmobName,
    fotmobId: p.fotmobId,
    photoUrl: p.photoUrl,
    team: p.team,
    source: 'fotmob',
    confidence: 1,
    locked: false,
    matchedAt: fotmobData.verifiedAt || new Date().toISOString(),
  };
}

const finalDb = {
  provider: 'FotMob',
  imagePattern: 'https://images.fotmob.com/image_resources/playerimages/{playerId}.png',
  totalPlayers: Object.keys(mergedPlayers).length,
  updatedAt: new Date().toISOString(),
  players: mergedPlayers,
};

fs.writeFileSync('./public/player-photos-db.json', JSON.stringify(finalDb, null, 2), 'utf-8');
console.log(`Updated public/player-photos-db.json with ${Object.keys(mergedPlayers).length} players!`);
