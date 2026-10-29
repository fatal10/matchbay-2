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

// Additional verified players and spotlight corrections
const additions = [
  { key: 'erlinghaaland', fotmobId: '737066', name: 'Erling Haaland', team: 'Manchester City' },
  { key: 'haaland', fotmobId: '737066', name: 'Erling Haaland', team: 'Manchester City' },
  { key: 'ehaaland', fotmobId: '737066', name: 'Erling Haaland', team: 'Manchester City' },
  { key: 'kylianmbappe', fotmobId: '701154', name: 'Kylian Mbappé', team: 'Real Madrid' },
  { key: 'mbappe', fotmobId: '701154', name: 'Kylian Mbappé', team: 'Real Madrid' },
  { key: 'kmbappe', fotmobId: '701154', name: 'Kylian Mbappé', team: 'Real Madrid' },
  { key: 'judebellingham', fotmobId: '1077894', name: 'Jude Bellingham', team: 'Real Madrid' },
  { key: 'bellingham', fotmobId: '1077894', name: 'Jude Bellingham', team: 'Real Madrid' },
  { key: 'jbellingham', fotmobId: '1077894', name: 'Jude Bellingham', team: 'Real Madrid' },
  { key: 'viniciusjunior', fotmobId: '846033', name: 'Vinícius Júnior', team: 'Real Madrid' },
  { key: 'vinicius', fotmobId: '846033', name: 'Vinícius Júnior', team: 'Real Madrid' },
  { key: 'mohamedsalah', fotmobId: '292462', name: 'Mohamed Salah', team: 'Liverpool' },
  { key: 'salah', fotmobId: '292462', name: 'Mohamed Salah', team: 'Liverpool' },
  { key: 'msalah', fotmobId: '292462', name: 'Mohamed Salah', team: 'Liverpool' },
  { key: 'bukayosaka', fotmobId: '961995', name: 'Bukayo Saka', team: 'Arsenal' },
  { key: 'saka', fotmobId: '961995', name: 'Bukayo Saka', team: 'Arsenal' },
  { key: 'bsaka', fotmobId: '961995', name: 'Bukayo Saka', team: 'Arsenal' },
  { key: 'kevindebruyne', fotmobId: '169200', name: 'Kevin De Bruyne', team: 'Manchester City' },
  { key: 'debruyne', fotmobId: '169200', name: 'Kevin De Bruyne', team: 'Manchester City' },
  { key: 'kdebruyne', fotmobId: '169200', name: 'Kevin De Bruyne', team: 'Manchester City' },
  { key: 'robertlewandowski', fotmobId: '93447', name: 'Robert Lewandowski', team: 'Barcelona' },
  { key: 'lewandowski', fotmobId: '93447', name: 'Robert Lewandowski', team: 'Barcelona' },
  { key: 'lamineyamal', fotmobId: '1467236', name: 'Lamine Yamal', team: 'Barcelona' },
  { key: 'yamal', fotmobId: '1467236', name: 'Lamine Yamal', team: 'Barcelona' },
  { key: 'lyamal', fotmobId: '1467236', name: 'Lamine Yamal', team: 'Barcelona' },
  { key: 'philfoden', fotmobId: '815006', name: 'Phil Foden', team: 'Manchester City' },
  { key: 'foden', fotmobId: '815006', name: 'Phil Foden', team: 'Manchester City' },
  { key: 'pfoden', fotmobId: '815006', name: 'Phil Foden', team: 'Manchester City' },
  { key: 'colepalmer', fotmobId: '1096353', name: 'Cole Palmer', team: 'Chelsea' },
  { key: 'palmer', fotmobId: '1096353', name: 'Cole Palmer', team: 'Chelsea' },
  { key: 'cpalmer', fotmobId: '1096353', name: 'Cole Palmer', team: 'Chelsea' },
  { key: 'florianwirtz', fotmobId: '1152455', name: 'Florian Wirtz', team: 'Bayer Leverkusen' },
  { key: 'wirtz', fotmobId: '1152455', name: 'Florian Wirtz', team: 'Bayer Leverkusen' },
  { key: 'harrykane', fotmobId: '194165', name: 'Harry Kane', team: 'Bayern Munich' },
  { key: 'kane', fotmobId: '194165', name: 'Harry Kane', team: 'Bayern Munich' },
  { key: 'hkane', fotmobId: '194165', name: 'Harry Kane', team: 'Bayern Munich' },
  { key: 'declanrice', fotmobId: '654096', name: 'Declan Rice', team: 'Arsenal' },
  { key: 'rice', fotmobId: '654096', name: 'Declan Rice', team: 'Arsenal' },
  { key: 'drice', fotmobId: '654096', name: 'Declan Rice', team: 'Arsenal' },
  { key: 'virgilvandijk', fotmobId: '209405', name: 'Virgil van Dijk', team: 'Liverpool' },
  { key: 'vandijk', fotmobId: '209405', name: 'Virgil van Dijk', team: 'Liverpool' },
  { key: 'vvandijk', fotmobId: '209405', name: 'Virgil van Dijk', team: 'Liverpool' },
  { key: 'heungminson', fotmobId: '212867', name: 'Heung-Min Son', team: 'Tottenham Hotspur' },
  { key: 'sonheungmin', fotmobId: '212867', name: 'Heung-Min Son', team: 'Tottenham Hotspur' },
  { key: 'son', fotmobId: '212867', name: 'Heung-Min Son', team: 'Tottenham Hotspur' },
  { key: 'hson', fotmobId: '212867', name: 'Heung-Min Son', team: 'Tottenham Hotspur' },
  { key: 'martinodegaard', fotmobId: '534670', name: 'Martin Ødegaard', team: 'Arsenal' },
  { key: 'odegaard', fotmobId: '534670', name: 'Martin Ødegaard', team: 'Arsenal' },
  { key: 'modegaard', fotmobId: '534670', name: 'Martin Ødegaard', team: 'Arsenal' },
  { key: 'jamalmusiala', fotmobId: '1156141', name: 'Jamal Musiala', team: 'Bayern Munich' },
  { key: 'musiala', fotmobId: '1156141', name: 'Jamal Musiala', team: 'Bayern Munich' },
  { key: 'jmusiala', fotmobId: '1156141', name: 'Jamal Musiala', team: 'Bayern Munich' },
  { key: 'brunofernandes', fotmobId: '422685', name: 'Bruno Fernandes', team: 'Manchester United' },
  { key: 'bfernandes', fotmobId: '422685', name: 'Bruno Fernandes', team: 'Manchester United' },
  { key: 'alissonbecker', fotmobId: '319784', name: 'Alisson Becker', team: 'Liverpool' },
  { key: 'alisson', fotmobId: '319784', name: 'Alisson Becker', team: 'Liverpool' },
  { key: 'lautaromartinez', fotmobId: '712071', name: 'Lautaro Martínez', team: 'Inter' },
  { key: 'rafaelleao', fotmobId: '919746', name: 'Rafael Leão', team: 'AC Milan' },
  { key: 'pedri', fotmobId: '1076756', name: 'Pedri', team: 'Barcelona' },
  { key: 'federicovalverde', fotmobId: '752203', name: 'Federico Valverde', team: 'Real Madrid' },
  { key: 'fvalverde', fotmobId: '752203', name: 'Federico Valverde', team: 'Real Madrid' },
  { key: 'valverde', fotmobId: '752203', name: 'Federico Valverde', team: 'Real Madrid' },
  { key: 'viktorgjokeres', fotmobId: '664500', name: 'Viktor Gyökeres', team: 'Arsenal' },
  { key: 'viktorkerekes', fotmobId: '664500', name: 'Viktor Gyökeres', team: 'Arsenal' },
  { key: 'viktorgzokeres', fotmobId: '664500', name: 'Viktor Gyökeres', team: 'Arsenal' },
  { key: 'viktorgoykeres', fotmobId: '664500', name: 'Viktor Gyökeres', team: 'Arsenal' },
  { key: 'viktorgzookeres', fotmobId: '664500', name: 'Viktor Gyökeres', team: 'Arsenal' },
  { key: 'gyokeres', fotmobId: '664500', name: 'Viktor Gyökeres', team: 'Arsenal' },
  { key: 'vgyokeres', fotmobId: '664500', name: 'Viktor Gyökeres', team: 'Arsenal' },
  { key: 'matthijsdeligt', fotmobId: '769895', name: 'Matthijs de Ligt', team: 'Manchester United' },
  { key: 'deligt', fotmobId: '769895', name: 'Matthijs de Ligt', team: 'Manchester United' },
  { key: 'mdelight', fotmobId: '769895', name: 'Matthijs de Ligt', team: 'Manchester United' },
  { key: 'nathanake', fotmobId: '417068', name: 'Nathan Aké', team: 'Manchester City' },
  { key: 'ake', fotmobId: '417068', name: 'Nathan Aké', team: 'Manchester City' },
  { key: 'nake', fotmobId: '417068', name: 'Nathan Aké', team: 'Manchester City' },
  { key: 'keparrizabalaga', fotmobId: '317564', name: 'Kepa Arrizabalaga', team: 'Arsenal' },
  { key: 'kepaarrizabalaga', fotmobId: '317564', name: 'Kepa Arrizabalaga', team: 'Arsenal' },
  { key: 'kepa', fotmobId: '317564', name: 'Kepa Arrizabalaga', team: 'Arsenal' },
  { key: 'gabrielmagalhaes', fotmobId: '795179', name: 'Gabriel Magalhães', team: 'Arsenal' },
  { key: 'gabriel', fotmobId: '795179', name: 'Gabriel Magalhães', team: 'Arsenal' },
  { key: 'myleslewisskelly', fotmobId: '1406436', name: 'Myles Lewis-Skelly', team: 'Arsenal' },
  { key: 'lewisskelly', fotmobId: '1406436', name: 'Myles Lewis-Skelly', team: 'Arsenal' },
  { key: 'ethannwaneri', fotmobId: '1406437', name: 'Ethan Nwaneri', team: 'Arsenal' },
  { key: 'nwaneri', fotmobId: '1406437', name: 'Ethan Nwaneri', team: 'Arsenal' },
  { key: 'williamsaliba', fotmobId: '942468', name: 'William Saliba', team: 'Arsenal' },
  { key: 'saliba', fotmobId: '942468', name: 'William Saliba', team: 'Arsenal' },
  { key: 'wsaliba', fotmobId: '942468', name: 'William Saliba', team: 'Arsenal' },
  { key: 'davidraya', fotmobId: '542617', name: 'David Raya', team: 'Arsenal' },
  { key: 'raya', fotmobId: '542617', name: 'David Raya', team: 'Arsenal' },
  { key: 'benwhite', fotmobId: '730245', name: 'Ben White', team: 'Arsenal' },
  { key: 'jurrientimber', fotmobId: '1075677', name: 'Jurriën Timber', team: 'Arsenal' },
  { key: 'timber', fotmobId: '1075677', name: 'Jurriën Timber', team: 'Arsenal' },
  { key: 'riccardocalafiori', fotmobId: '1097285', name: 'Riccardo Calafiori', team: 'Arsenal' },
  { key: 'calafiori', fotmobId: '1097285', name: 'Riccardo Calafiori', team: 'Arsenal' },
  { key: 'mikelmerino', fotmobId: '542743', name: 'Mikel Merino', team: 'Arsenal' },
  { key: 'merino', fotmobId: '542743', name: 'Mikel Merino', team: 'Arsenal' },
  { key: 'kaihavertz', fotmobId: '739460', name: 'Kai Havertz', team: 'Arsenal' },
  { key: 'havertz', fotmobId: '739460', name: 'Kai Havertz', team: 'Arsenal' },
  { key: 'khavertz', fotmobId: '739460', name: 'Kai Havertz', team: 'Arsenal' },
  { key: 'gabrielmartinelli', fotmobId: '992015', name: 'Gabriel Martinelli', team: 'Arsenal' },
  { key: 'martinelli', fotmobId: '992015', name: 'Gabriel Martinelli', team: 'Arsenal' },
  { key: 'leandrotrossard', fotmobId: '298711', name: 'Leandro Trossard', team: 'Arsenal' },
  { key: 'trossard', fotmobId: '298711', name: 'Leandro Trossard', team: 'Arsenal' },
  { key: 'rodri', photoUrl: '/player-photos/rodri.webp', fotmobId: '675088', name: 'Rodri', team: 'Manchester City', locked: true },
];

for (const a of additions) {
  if (mergedPlayers[a.key] && mergedPlayers[a.key].locked && a.key !== 'rodri') continue;
  mergedPlayers[a.key] = {
    key: a.key,
    name: a.name,
    fotmobName: a.name,
    fotmobId: a.fotmobId,
    photoUrl: a.photoUrl || `https://images.fotmob.com/image_resources/playerimages/${a.fotmobId}.png`,
    team: a.team,
    source: 'fotmob',
    confidence: 1,
    locked: Boolean(a.locked),
    matchedAt: new Date().toISOString(),
  };
}

// Generate surname and initial aliases for all players
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

for (const p of Object.values(mergedPlayers)) {
  const fullName = p.name || p.fotmobName || '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    const surname = normalizeKey(parts[parts.length - 1]);
    const initialSurname = normalizeKey(parts[0].charAt(0) + parts[parts.length - 1]);
    if (surname.length >= 3 && !mergedPlayers[surname]) {
      mergedPlayers[surname] = {
        key: surname,
        name: p.name,
        fotmobName: p.fotmobName,
        fotmobId: p.fotmobId,
        photoUrl: p.photoUrl,
        team: p.team,
        source: 'fotmob',
        confidence: 0.95,
        locked: false,
        matchedAt: new Date().toISOString(),
      };
    }
    if (initialSurname.length >= 4 && !mergedPlayers[initialSurname]) {
      mergedPlayers[initialSurname] = {
        key: initialSurname,
        name: p.name,
        fotmobName: p.fotmobName,
        fotmobId: p.fotmobId,
        photoUrl: p.photoUrl,
        team: p.team,
        source: 'fotmob',
        confidence: 0.98,
        locked: false,
        matchedAt: new Date().toISOString(),
      };
    }
  }
}

const finalDb = {
  provider: 'FotMob',
  imagePattern: 'https://images.fotmob.com/image_resources/playerimages/{playerId}.png',
  totalPlayers: Object.keys(mergedPlayers).length,
  updatedAt: new Date().toISOString(),
  players: mergedPlayers,
};

// 1. Write public/player-photos-db.json
fs.writeFileSync('./public/player-photos-db.json', JSON.stringify(finalDb, null, 2), 'utf-8');
console.log(`Updated public/player-photos-db.json with ${Object.keys(mergedPlayers).length} players!`);

// 2. Write public/fotmob-player-ids.json
fs.writeFileSync('./public/fotmob-player-ids.json', JSON.stringify(finalDb, null, 2), 'utf-8');
console.log(`Updated public/fotmob-player-ids.json with ${Object.keys(mergedPlayers).length} players!`);

// 3. Write public/playerPhotosDb.js (Synchronous bootstrap bundle)
const jsBundle = `/**
 * MatchBay Verified Player Photos Database (FotMob)
 * Auto-generated synchronous database bundle.
 */
(function (root) {
  var db = ${JSON.stringify(finalDb)};
  if (root) {
    root.PLAYER_PHOTOS_DB = db;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = db;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
`;
fs.writeFileSync('./public/playerPhotosDb.js', jsBundle, 'utf-8');
console.log('Saved public/playerPhotosDb.js synchronous bootstrap bundle!');
