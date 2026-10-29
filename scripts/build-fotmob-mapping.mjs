import fs from 'fs';

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

async function queryFotmob(name) {
  const cleanName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const url = `https://apigw.fotmob.com/searchapi/suggest?term=${encodeURIComponent(cleanName)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    const options = (data.squadMemberSuggest && data.squadMemberSuggest[0] && data.squadMemberSuggest[0].options) || [];
    return options;
  } catch {
    return null;
  }
}

async function verifyImage(fotmobId) {
  const url = `https://images.fotmob.com/image_resources/playerimages/${fotmobId}.png`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    return res.ok && res.headers.get('content-type')?.includes('png');
  } catch {
    return false;
  }
}

async function buildMapping() {
  console.log('Building FotMob verified player mapping...');
  const playerList = [];

  // Add top players
  for (const p of topPlayers) {
    playerList.push({
      name: p.name,
      team: p.team,
      league: p.league,
      position: p.position,
      jersey: p.jersey,
      country: p.country,
    });
  }

  // Add any spotlight players not already present
  for (const [key, val] of Object.entries(spotlightMap)) {
    const norm = normalizeKey(key);
    if (!playerList.some(p => normalizeKey(p.name) === norm)) {
      playerList.push({
        name: key.replace(/([a-z])([A-Z])/g, '$1 $2'),
        normKey: norm,
        foot: val.foot,
        height: val.height,
      });
    }
  }

  console.log(`Processing ${playerList.length} priority players...`);
  const mapping = {};
  let verifiedCount = 0;
  let missingCount = 0;

  for (let i = 0; i < playerList.length; i++) {
    const p = playerList[i];
    const normKey = normalizeKey(p.name);
    const options = await queryFotmob(p.name);
    if (!options || !options.length) {
      missingCount++;
      continue;
    }

    // Match candidate: prioritize exact or highest score match
    let best = null;
    for (const opt of options) {
      const optName = opt.text.split('|')[0];
      const optNorm = normalizeKey(optName);
      if (optNorm === normKey || optNorm.includes(normKey) || normKey.includes(optNorm)) {
        best = opt;
        break;
      }
    }
    if (!best) best = options[0];

    const fotmobId = best.payload?.id;
    if (!fotmobId) {
      missingCount++;
      continue;
    }

    const hasImage = await verifyImage(fotmobId);
    if (hasImage) {
      verifiedCount++;
      const fotmobName = best.text.split('|')[0];
      const record = {
        name: p.name,
        fotmobName: fotmobName,
        fotmobId: fotmobId,
        photoUrl: `https://images.fotmob.com/image_resources/playerimages/${fotmobId}.png`,
        team: best.payload?.teamName || p.team || '',
        verified: true,
      };
      mapping[normKey] = record;
      // also alias the fotmobName norm key
      const normFotmobName = normalizeKey(fotmobName);
      if (normFotmobName && !mapping[normFotmobName]) {
        mapping[normFotmobName] = record;
      }
    } else {
      missingCount++;
    }

    // Rate-limit nicely
    if (i % 10 === 0) {
      console.log(`Progress: ${i}/${playerList.length} (Verified: ${verifiedCount}, Missing/NoImg: ${missingCount})`);
    }
    await new Promise(r => setTimeout(r, 60));
  }

  const output = {
    source: 'https://images.fotmob.com/image_resources/playerimages/{playerId}.png',
    provider: 'FotMob',
    verifiedAt: new Date().toISOString(),
    totalPlayersProcessed: playerList.length,
    verifiedCount,
    missingCount,
    players: mapping,
  };

  fs.writeFileSync('./public/fotmob-player-ids.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Finished! Saved ${Object.keys(mapping).length} entries to public/fotmob-player-ids.json`);
}

buildMapping();
