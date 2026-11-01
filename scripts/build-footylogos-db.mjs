import fs from 'node:fs';
import path from 'node:path';

const CACHE_DIR = './data/footylogos-cache';
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const USER_AGENT = 'MatchBay/1.0 (+https://matchbay.app)';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

function toSlug(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/\b(jr|sr|ii|iii|iv)\b/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

const SLUG_ALIASES = {
  'neymar-jr': 'neymar',
  'neymar-junior': 'neymar',
  'vinicius-jr': 'vinicius-junior',
  'son-heung-min': 'son-heung-min',
  'heung-min-son': 'son-heung-min',
  'rodrigo-hernandez': 'rodri',
  'rodri': 'rodri',
  'gavi': 'gavi',
  'pedri': 'pedri',
  'kepa': 'kepa-arrizabalaga',
  'unai-simon': 'unai-simon'
};

async function fetchSitemapData() {
  const sitemapHashes = new Map();
  for (const s of ['image-sitemap-1.xml', 'image-sitemap-2.xml']) {
    try {
      const res = await fetch('https://www.footylogos.com/' + s, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (res.ok) {
        const text = await res.text();
        const urlBlocks = text.split('<url>');
        for (let i = 1; i < urlBlocks.length; i++) {
          const b = urlBlocks[i];
          const locMatch = b.match(/<loc>https:\/\/www\.footylogos\.com\/player-pngs\/([^<]+)<\/loc>/);
          if (!locMatch) continue;
          const slug = locMatch[1].trim();
          const hashes = [];
          const imgMatches = b.matchAll(/https:\/\/assets\.footylogos\.com\/player-pngs\/png\/([a-f0-9]{64})\.png/g);
          for (const im of imgMatches) {
            hashes.push(im[1]);
          }
          if (hashes.length > 0) {
            sitemapHashes.set(slug, hashes);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching sitemap:', s, e.message);
    }
  }
  return sitemapHashes;
}

async function fetchPlayerProfile(slug) {
  const cachePath = path.join(CACHE_DIR, `${slug}.json`);
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch {}
  }

  // Polite delay: 1050ms
  await sleep(1050);

  const url = `https://www.footylogos.com/player-pngs/${slug}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<script type=\"application\/json\" id=\"player-profile-data\">([\s\S]*?)<\/script>/i);
    if (!match) return null;
    const data = JSON.parse(match[1]);
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.warn(`Failed fetching ${slug}:`, err.message);
    return null;
  }
}

/**
 * Image choice priority:
 * 1. square headshot or portrait (square / headshot / 1:1 portrait)
 * 2. portrait
 * 3. circle
 * 4. front
 * 5. any other
 */
function pickBestAsset(assets, preferredClub) {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  function scoreAsset(a) {
    let rank = 5;
    const f = (a.f || '').toLowerCase();
    const l = (a.l || '').toLowerCase();
    const isSquare = a.w && a.h && Math.abs(a.w - a.h) <= 15;

    if (f === 'headshot' || l.includes('headshot') || f === 'square' || l.includes('square') || (f === 'portrait' && isSquare)) {
      rank = 1;
    } else if (f === 'portrait' || l.includes('portrait')) {
      rank = 2;
    } else if (f === 'circle' || l.includes('circle')) {
      rank = 3;
    } else if (f === 'front' || l.includes('front')) {
      rank = 4;
    } else {
      rank = 5;
    }

    let seasonScore = 0;
    if (a.s) {
      if (a.s.includes('2026/27') || a.s === '2026') seasonScore = 30;
      else if (a.s.includes('2025/26') || a.s === '2025') seasonScore = 20;
      else if (a.s.includes('2024/25') || a.s === '2024') seasonScore = 10;
    }

    let clubBonus = 0;
    if (preferredClub && a.c && preferredClub.toLowerCase().includes(a.c.toLowerCase())) {
      clubBonus = 5;
    }

    return (6 - rank) * 200 + seasonScore + clubBonus;
  }

  const sorted = [...assets].sort((a, b) => scoreAsset(b) - scoreAsset(a));
  return sorted[0];
}

async function main() {
  console.log('=== Step 1: Loading FootyLogos image sitemaps & app catalog ===');
  const sitemapHashes = await fetchSitemapData();
  console.log(`Indexed ${sitemapHashes.size} unique player slugs from image sitemaps.`);

  const playersDataJs = fs.readFileSync('./public/playersData.js', 'utf-8');
  const topPlayers = eval(playersDataJs.match(/var TOP_PLAYERS_DATA = (\[[\s\S]*?\]);/)[1]);

  const spotlightJs = fs.readFileSync('./public/playerSpotlight.js', 'utf-8');
  const spotlightMap = eval('(' + spotlightJs.match(/var SPOTLIGHT_PLAYERS_MAP = ({[\s\S]*?});/)[1] + ')');

  const rostersDir = './data/rosters-cache';
  const rosterFiles = fs.existsSync(rostersDir) ? fs.readdirSync(rostersDir).filter(f => f.endsWith('.json')) : [];

  const MUST_HAVE_SLUGS = [
    'erling-haaland',
    'mohamed-salah',
    'jude-bellingham',
    'lamine-yamal',
    'harry-kane',
    'lionel-messi',
    'cristiano-ronaldo',
    'david-brooks',
    'cristhian-mosquera',
    'andrei-ratiu',
    'josh-dasilva',
    'florian-lejeune',
    'unai-simon'
  ];

  const appPlayers = [];
  const processedKeys = new Set();

  function addPlayer(name, team, league, extra = {}) {
    if (!name) return;
    const key = normalizeKey(name);
    if (!key || processedKeys.has(key)) return;
    processedKeys.add(key);
    appPlayers.push({ name, key, team: team || '', league: league || '', ...extra });
  }

  for (const slug of MUST_HAVE_SLUGS) {
    const formatted = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    addPlayer(formatted, '', '', { forcedSlug: slug, priority: true });
  }

  for (const p of topPlayers) {
    addPlayer(p.name, p.team, p.league, { position: p.position, jersey: p.jersey, priority: true });
  }

  for (const [key, val] of Object.entries(spotlightMap)) {
    addPlayer(key, '', '', { spotlightKey: key, priority: true });
  }

  const leagueTotalStats = {};
  for (const f of rosterFiles) {
    const league = f.split('_')[0];
    if (!leagueTotalStats[league]) leagueTotalStats[league] = { total: 0, matched: 0 };
    try {
      const data = JSON.parse(fs.readFileSync(path.join(rostersDir, f), 'utf8'));
      const clubName = data.club?.name || '';
      for (const p of (data.roster || [])) {
        leagueTotalStats[league].total++;
        const pName = p.displayName || p.fullName || (p.firstName ? `${p.firstName} ${p.lastName || ''}` : '');
        addPlayer(pName, clubName, league, { jersey: p.jersey, position: p.position?.displayName });
      }
    } catch {}
  }

  console.log(`Total unique app players collected: ${appPlayers.length}`);

  const matchedList = [];
  const unmatchedList = [];
  const ambiguousReport = [];

  const slugToPlayers = new Map();

  for (const p of appPlayers) {
    let candidateSlug = p.forcedSlug;
    if (!candidateSlug) {
      const directSlug = toSlug(p.name);
      if (SLUG_ALIASES[directSlug]) {
        candidateSlug = SLUG_ALIASES[directSlug];
      } else if (sitemapHashes.has(directSlug)) {
        candidateSlug = directSlug;
      } else {
        const parts = directSlug.split('-');
        if (parts.length > 2) {
          const fl = `${parts[0]}-${parts[parts.length - 1]}`;
          if (sitemapHashes.has(fl)) {
            candidateSlug = fl;
          }
        }
      }
    }

    if (candidateSlug && sitemapHashes.has(candidateSlug)) {
      p.matchedSlug = candidateSlug;
      if (!slugToPlayers.has(candidateSlug)) slugToPlayers.set(candidateSlug, []);
      slugToPlayers.get(candidateSlug).push(p);
    } else {
      unmatchedList.push({ name: p.name, club: p.team, league: p.league });
    }
  }

  const validMatches = [];
  for (const [slug, players] of slugToPlayers.entries()) {
    if (players.length > 1) {
      const teams = new Set(players.map(p => p.team).filter(Boolean));
      if (teams.size > 1) {
        ambiguousReport.push({ slug, players: players.map(p => ({ name: p.name, team: p.team })) });
        continue; // Zero guessing
      }
    }
    validMatches.push({ slug, player: players[0] });
  }

  console.log(`=== Step 2: Processing ${validMatches.length} valid matches ===`);
  const finalDb = {
    provider: 'FootyLogos',
    imagePattern: 'https://assets.footylogos.com/player-pngs/previews/v1/{hash}.webp',
    totalPlayers: 0,
    updatedAt: new Date().toISOString(),
    players: {}
  };

  // Build surname to count map to prevent ambiguous surname matching
  const surnameCount = new Map();
  for (const { player } of validMatches) {
    const parts = player.name.trim().split(/\s+/);
    if (parts.length > 1) {
      const s = normalizeKey(parts[parts.length - 1]);
      if (s.length >= 4) {
        surnameCount.set(s, (surnameCount.get(s) || 0) + 1);
      }
    }
  }

  let processedCount = 0;
  for (let i = 0; i < validMatches.length; i++) {
    const { slug, player } = validMatches[i];
    
    // Check if we have cached profile or if player is priority
    let profile = null;
    const cachePath = path.join(CACHE_DIR, `${slug}.json`);
    if (fs.existsSync(cachePath)) {
      try {
        profile = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      } catch {}
    } else if (player.priority) {
      profile = await fetchPlayerProfile(slug);
    }

    let photoUrl = '';
    let hash = '';
    let format = 'portrait';
    let label = 'Portrait';
    let season = '2026/27';

    if (profile && Array.isArray(profile.assets) && profile.assets.length > 0) {
      const best = pickBestAsset(profile.assets, player.team || profile.club);
      if (best) {
        hash = best.k;
        format = best.f || 'portrait';
        label = best.l || 'Portrait';
        season = best.s || '2026/27';
        photoUrl = `https://assets.footylogos.com/player-pngs/previews/v1/${hash}.webp`;
      }
    }

    // Fallback to sitemap hashes if profile not fetched
    if (!photoUrl) {
      const hashes = sitemapHashes.get(slug) || [];
      if (hashes.length > 0) {
        // In FootyLogos sitemaps, index 1 or 0 is typically square/portrait
        hash = hashes.length > 1 ? hashes[1] : hashes[0];
        photoUrl = `https://assets.footylogos.com/player-pngs/previews/v1/${hash}.webp`;
      }
    }

    if (!photoUrl) continue;

    processedCount++;

    const record = {
      key: player.key,
      name: (profile && profile.name) || player.name,
      slug: (profile && profile.slug) || slug,
      photoUrl,
      hash,
      format,
      label,
      season,
      team: (profile && profile.club) || player.team,
      country: (profile && profile.country) || '',
      position: (profile && profile.position) || player.position || '',
      source: 'footylogos',
      credit: 'FootyLogos',
      sourceUrl: `https://www.footylogos.com/player-pngs/${slug}`,
      confidence: 1,
      matchedAt: new Date().toISOString()
    };

    finalDb.players[player.key] = record;

    const normSlug = normalizeKey(slug);
    if (normSlug && !finalDb.players[normSlug]) {
      finalDb.players[normSlug] = record;
    }

    if (profile && Array.isArray(profile.aliases)) {
      for (const al of profile.aliases) {
        const alKey = normalizeKey(al);
        if (alKey && !finalDb.players[alKey]) {
          finalDb.players[alKey] = record;
        }
      }
    }

    const parts = player.name.trim().split(/\s+/);
    if (parts.length > 1) {
      const surname = normalizeKey(parts[parts.length - 1]);
      // Only map surname if UNAMBIGUOUS (appears only once in database)
      if (surname && surname.length >= 4 && surnameCount.get(surname) === 1 && !finalDb.players[surname]) {
        finalDb.players[surname] = record;
      }
      // Initial format e.g. "E. Haaland" -> "ehaaland"
      const initialKey = normalizeKey(`${parts[0][0]}${parts[parts.length - 1]}`);
      if (initialKey && !finalDb.players[initialKey]) {
        finalDb.players[initialKey] = record;
      }
    }

    matchedList.push({ name: record.name, slug, team: record.team, photoUrl });

    if (player.league && leagueTotalStats[player.league]) {
      leagueTotalStats[player.league].matched++;
    }
  }

  const uniqueSlugsInDb = new Set(Object.values(finalDb.players).map(p => p.slug));
  finalDb.totalPlayers = uniqueSlugsInDb.size;

  console.log(`Writing public/player-photos-db.json with ${finalDb.totalPlayers} verified players (${Object.keys(finalDb.players).length} lookup keys)...`);
  fs.writeFileSync('./public/player-photos-db.json', JSON.stringify(finalDb, null, 2));

  // Reports
  const reportsDir = './reports';
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  let md = '# MatchBay Player Photo Coverage (FootyLogos)\n\n';
  md += `**Photo Provider:** FootyLogos (https://www.footylogos.com/player-pngs)\n`;
  md += `**Total Unique Players With Photos:** ${finalDb.totalPlayers}\n`;
  md += `**Total Lookup Keys Registered:** ${Object.keys(finalDb.players).length}\n`;
  md += `**Ambiguous Skipped Cases:** ${ambiguousReport.length}\n`;
  md += `**Unmatched Players:** ${unmatchedList.length}\n\n`;

  md += `## League Coverage\n\n| League | Matched | Total | Coverage % |\n| :--- | :--- | :--- | :--- |\n`;
  for (const [league, stats] of Object.entries(leagueTotalStats)) {
    const pct = stats.total > 0 ? ((stats.matched / stats.total) * 100).toFixed(1) : '0.0';
    md += `| **${league}** | ${stats.matched} | ${stats.total} | ${pct}% |\n`;
  }

  md += `\n## Sample Verified Players\n\n| Player | Team | Image Label | Preview |\n| :--- | :--- | :--- | :--- |\n`;
  for (const m of matchedList.slice(0, 30)) {
    md += `| **${m.name}** | ${m.team} | ${m.slug} | [View Photo](${m.photoUrl}) |\n`;
  }

  if (ambiguousReport.length > 0) {
    md += `\n## Ambiguous Cases (Zero Guessing Policy)\n\n`;
    for (const a of ambiguousReport.slice(0, 20)) {
      md += `- Slug \`${a.slug}\`: ${a.players.map(p => `${p.name} (${p.team})`).join(' vs ')}\n`;
    }
  }

  fs.writeFileSync('./reports/footylogos-coverage.md', md);
  fs.writeFileSync('./reports/footylogos-unmatched.json', JSON.stringify(unmatchedList.slice(0, 500), null, 2));
  fs.writeFileSync('./reports/footylogos-ambiguous.json', JSON.stringify(ambiguousReport, null, 2));

  console.log(`=== Done! Matched: ${finalDb.totalPlayers} players, reports saved. ===`);
}

main().catch(console.error);
