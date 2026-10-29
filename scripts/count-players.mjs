import fs from 'fs';
import path from 'path';

// Load TOP_PLAYERS_DATA
const playersDataJs = fs.readFileSync('./public/playersData.js', 'utf-8');
const topPlayersMatch = playersDataJs.match(/var TOP_PLAYERS_DATA = (\[[\s\S]*?\]);/);
let topPlayers = [];
if (topPlayersMatch) {
  topPlayers = eval(topPlayersMatch[1]);
}

// Load SPOTLIGHT_PLAYERS_MAP
const spotlightJs = fs.readFileSync('./public/playerSpotlight.js', 'utf-8');
const spotlightMatch = spotlightJs.match(/var SPOTLIGHT_PLAYERS_MAP = ({[\s\S]*?});/);
let spotlightMap = {};
if (spotlightMatch) {
  spotlightMap = eval('(' + spotlightMatch[1] + ')');
}

// Load all players in data/rosters-cache
const rostersDir = './data/rosters-cache';
const rosterFiles = fs.existsSync(rostersDir) ? fs.readdirSync(rostersDir).filter(f => f.endsWith('.json')) : [];

const allPlayersMap = new Map();

for (const p of topPlayers) {
  const norm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  allPlayersMap.set(norm, {
    name: p.name,
    team: p.team,
    league: p.league,
    source: 'TOP_PLAYERS_DATA',
    position: p.position,
    jersey: p.jersey,
  });
}

for (const [key, val] of Object.entries(spotlightMap)) {
  if (!allPlayersMap.has(key)) {
    allPlayersMap.set(key, {
      name: key,
      apiSportsId: val.id,
      source: 'SPOTLIGHT_MAP',
    });
  } else {
    allPlayersMap.get(key).apiSportsId = val.id;
  }
}

let totalRosterPlayers = 0;
for (const file of rosterFiles) {
  try {
    const raw = fs.readFileSync(path.join(rostersDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const clubName = data.club?.name || '';
    const leagueSlug = file.split('_')[0];
    const roster = data.roster || [];
    totalRosterPlayers += roster.length;
    for (const p of roster) {
      const pName = p.displayName || p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim();
      const norm = pName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!allPlayersMap.has(norm)) {
        allPlayersMap.set(norm, {
          name: pName,
          team: clubName,
          league: leagueSlug,
          espnId: p.id,
          source: 'ROSTER_CACHE',
          position: p.position?.displayName,
          jersey: p.jersey,
          citizenship: p.citizenship,
        });
      } else {
        const item = allPlayersMap.get(norm);
        if (!item.espnId && p.id) item.espnId = p.id;
        if (!item.team && clubName) item.team = clubName;
        if (!item.citizenship && p.citizenship) item.citizenship = p.citizenship;
      }
    }
  } catch (err) {
    console.error('Error reading', file, err.message);
  }
}

console.log('=== Player Population Summary ===');
console.log('TOP_PLAYERS_DATA count:', topPlayers.length);
console.log('SPOTLIGHT_PLAYERS_MAP keys:', Object.keys(spotlightMap).length);
console.log('Roster Cache files count:', rosterFiles.length);
console.log('Total entries in rosters cache:', totalRosterPlayers);
console.log('Total UNIQUE players across all sources:', allPlayersMap.size);

fs.writeFileSync('./scripts/all-players-catalog.json', JSON.stringify({
  uniquePlayersCount: allPlayersMap.size,
  topPlayersCount: topPlayers.length,
  spotlightKeysCount: Object.keys(spotlightMap).length,
  rosterFilesCount: rosterFiles.length,
  totalRosterEntries: totalRosterPlayers,
  samplePlayers: Array.from(allPlayersMap.values()).slice(0, 20),
}, null, 2));
