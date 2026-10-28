/**
 * sync-player-photos.ts
 * Re-runnable, idempotent, and resumable sync job for FootyRenders.com player cutouts.
 * Processes ALL players across every league, club, and squad in MatchBay.
 *
 * Usage:
 *   npx tsx scripts/sync-player-photos.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  matchFootyRender,
  normalizePlayerKey,
  TargetPlayer,
  FootyRenderEntry,
  StoredPlayerPhoto
} from '../src/footyRendersMatcher';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ROSTERS_DIR = path.resolve(DATA_DIR, 'rosters-cache');
const RENDER_CACHE_DIR = path.resolve(DATA_DIR, 'render-cache');
const FOOTY_INDEX_FILE = path.resolve(DATA_DIR, 'footyrenders-index.json');

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const PHOTOS_DIR = path.resolve(PUBLIC_DIR, 'player-photos');
const DB_FILE = path.resolve(PUBLIC_DIR, 'player-photos-db.json');
const REPORTS_DIR = path.resolve(process.cwd(), 'reports');
const REVIEW_HTML_FILE = path.resolve(REPORTS_DIR, 'photo-review.html');
const COVERAGE_MD_FILE = path.resolve(REPORTS_DIR, 'coverage-table.md');
const COVERAGE_JSON_FILE = path.resolve(REPORTS_DIR, 'coverage-table.json');

// Disable sharp caching to prevent libvips memory buildup during batch processing
sharp.cache(false);
sharp.concurrency(1);

// Ensure necessary directories exist
[DATA_DIR, ROSTERS_DIR, RENDER_CACHE_DIR, PHOTOS_DIR, REPORTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<Buffer | null> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MatchBay/1.0' },
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer());
      }
      if (res.status === 404) return null;
    } catch (e) {
      // transient network glitch
    }
    attempt++;
    await sleep(200 * Math.pow(2, attempt));
  }
  return null;
}

/**
 * Crops a transparent PNG cutout to a centered head-and-shoulders avatar in WebP.
 */
async function processCutoutToAvatar(rawPngBuffer: Buffer, outFilePath: string): Promise<boolean> {
  try {
    const trimmed = await sharp(rawPngBuffer).trim().toBuffer({ resolveWithObject: true });
    const tw = trimmed.info.width;
    const th = trimmed.info.height;

    // Head-and-shoulders crop: square box focused on upper 38-42% of trimmed cutout
    const headBoxSize = Math.min(tw, Math.round(th * 0.40));
    if (!tw || !th || headBoxSize <= 5) return false;
    const cropLeft = Math.max(0, Math.round((tw - headBoxSize) / 2));
    const cropTop = 0;

    // 256x256 main avatar
    const avatar = await sharp(trimmed.data)
      .extract({ left: cropLeft, top: cropTop, width: headBoxSize, height: headBoxSize })
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 90, alphaQuality: 100 })
      .toBuffer();

    fs.writeFileSync(outFilePath, avatar);

    // Also write a 128x128 thumbnail
    const thumbPath = outFilePath.replace(/\.webp$/, '-sm.webp');
    const thumb = await sharp(avatar).resize(128, 128).webp({ quality: 85 }).toBuffer();
    fs.writeFileSync(thumbPath, thumb);

    return true;
  } catch (err) {
    console.warn(`[ImageProcessing] Failed to crop cutout:`, (err as Error).message);
    return false;
  }
}

/**
 * Loads all players across every league, club squad, and database in MatchBay.
 */
export function loadAllAppPlayers(): { players: TargetPlayer[]; clubsMap: Map<string, TargetPlayer[]> } {
  const playersMap = new Map<string, TargetPlayer>();
  const clubsMap = new Map<string, TargetPlayer[]>();

  // 1. Squad rosters from all 96 clubs in top 5 leagues
  if (fs.existsSync(ROSTERS_DIR)) {
    const files = fs.readdirSync(ROSTERS_DIR).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(ROSTERS_DIR, f), 'utf-8'));
        const clubName = data.club?.name || 'Club';
        const leagueSlug = f.split('_')[0] || '';
        const roster = data.roster || [];

        const clubList: TargetPlayer[] = [];
        for (const p of roster) {
          const playerName = p.displayName || p.fullName || p.name;
          const key = `${playerName}:${clubName}`.toLowerCase();
          const target: TargetPlayer = {
            id: p.id,
            name: playerName,
            team: clubName,
            league: leagueSlug,
            position: p.position?.name || p.position?.displayName || 'Player',
            jersey: p.jersey,
            citizenship: p.citizenship,
            age: p.age,
            slug: p.slug || normalizePlayerKey(playerName)
          };
          playersMap.set(key, target);
          clubList.push(target);
        }
        clubsMap.set(clubName, clubList);
      } catch {}
    }
  }

  // 2. Stars from TOP_PLAYERS_DATA (MLS, Saudi Pro League, etc.)
  const playersDataPath = path.resolve(PUBLIC_DIR, 'playersData.js');
  if (fs.existsSync(playersDataPath)) {
    try {
      const code = fs.readFileSync(playersDataPath, 'utf-8');
      const func = new Function('const self = {}; ' + code + '; return self.TOP_PLAYERS_DATA;');
      const list: any[] = func() || [];
      for (const tp of list) {
        const key = `${tp.name}:${tp.team}`.toLowerCase();
        if (!playersMap.has(key)) {
          const target: TargetPlayer = {
            name: tp.name,
            team: tp.team,
            league: tp.league,
            position: tp.position,
            jersey: tp.jersey,
            citizenship: tp.country,
            slug: normalizePlayerKey(tp.name)
          };
          playersMap.set(key, target);
          const existingClub = clubsMap.get(tp.team) || [];
          existingClub.push(target);
          clubsMap.set(tp.team, existingClub);
        }
      }
    } catch {}
  }

  return { players: Array.from(playersMap.values()), clubsMap };
}

export async function runSync() {
  console.log('=====================================================');
  console.log('   MatchBay FootyRenders Player Photo Sync Engine    ');
  console.log('=====================================================');

  // Step 0: Count ALL football players
  const { players: allTargetPlayers, clubsMap } = loadAllAppPlayers();
  const totalTargetCount = allTargetPlayers.length;
  console.log(`[Step 0] TARGET TOTAL FOOTBALL PLAYERS COUNT: ${totalTargetCount}`);
  console.log(`[Step 0] Across ${clubsMap.size} clubs/national teams.\n`);

  // Load existing DB to preserve locked overrides
  let existingDb: { players: Record<string, StoredPlayerPhoto>; overrides?: Record<string, StoredPlayerPhoto> } = {
    players: {},
    overrides: {}
  };
  if (fs.existsSync(DB_FILE)) {
    try {
      existingDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!existingDb.players) existingDb.players = {};
    } catch {}
  }

  // Load FootyRenders Index
  if (!fs.existsSync(FOOTY_INDEX_FILE)) {
    throw new Error(`FootyRenders index not found at ${FOOTY_INDEX_FILE}`);
  }
  console.log('[Step 2] Loading FootyRenders index (33,171 cataloged renders)...');
  const footyIndex: FootyRenderEntry[] = JSON.parse(fs.readFileSync(FOOTY_INDEX_FILE, 'utf-8'));
  console.log(`[Step 2] FootyRenders index loaded: ${footyIndex.length} render entries.\n`);

  // Categorization lists
  const matchedList: Array<{ player: TargetPlayer; photo: StoredPlayerPhoto }> = [];
  const needsReviewList: Array<{ player: TargetPlayer; reason: string; candidate?: FootyRenderEntry; score: number }> = [];
  const notFoundList: Array<{ player: TargetPlayer; reason: string }> = [];

  const updatedDb = { ...existingDb };

  let processedCount = 0;
  console.log(`[Step 3] Matching & processing all ${totalTargetCount} players...`);

  for (const player of allTargetPlayers) {
    processedCount++;
    const slug = normalizePlayerKey(player.name);
    const existing = updatedDb.players[slug];

    // Preserve locked photos unconditionally
    if (existing && existing.locked) {
      matchedList.push({ player, photo: existing });
      continue;
    }

    // Match against FootyRenders catalog
    const matchRes = matchFootyRender(player, footyIndex);

    if (matchRes.status === 'HIGH_CONFIDENCE' && matchRes.candidate) {
      const cand = matchRes.candidate;
      const fileName = `${slug}.webp`;
      const localFilePath = path.resolve(PHOTOS_DIR, fileName);
      const localUrl = `/player-photos/${fileName}`;

      // Download and crop image (idempotent / cached)
      let photoSaved = false;
      if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 500) {
        photoSaved = true;
      } else {
        const renderCachePath = path.resolve(RENDER_CACHE_DIR, `${cand.slug}.png`);
        let rawBuffer: Buffer | null = null;

        if (fs.existsSync(renderCachePath) && fs.statSync(renderCachePath).size > 1000) {
          rawBuffer = fs.readFileSync(renderCachePath);
        } else {
          rawBuffer = await fetchWithRetry(cand.imgUrl);
          if (rawBuffer) {
            fs.writeFileSync(renderCachePath, rawBuffer);
          }
          await sleep(40);
        }

        if (rawBuffer) {
          photoSaved = await processCutoutToAvatar(rawBuffer, localFilePath);
        }
      }

      if (photoSaved) {
        const storedPhoto: StoredPlayerPhoto = {
          key: slug,
          slug,
          name: player.name,
          team: player.team,
          league: player.league,
          position: player.position || 'Player',
          photoUrl: localUrl,
          sourceUrl: cand.pageUrl,
          credit: cand.author || 'FootyRenders',
          source: 'footyrenders',
          confidence: matchRes.confidence,
          locked: false,
          matchedAt: new Date().toISOString()
        };

        // Also index under normalized variations for seamless resolution
        updatedDb.players[slug] = storedPhoto;
        const shortKey = normalizePlayerKey(player.name.split(' ').pop() || '');
        if (shortKey && !updatedDb.players[shortKey]) {
          updatedDb.players[shortKey] = storedPhoto;
        }

        matchedList.push({ player, photo: storedPhoto });
      } else {
        notFoundList.push({ player, reason: 'Failed to download or crop render PNG' });
      }
    } else if (matchRes.status === 'NEEDS_REVIEW') {
      needsReviewList.push({
        player,
        reason: matchRes.reason,
        candidate: matchRes.candidate,
        score: matchRes.confidence
      });
    } else {
      notFoundList.push({ player, reason: matchRes.reason });
    }

    if (processedCount % 200 === 0 || processedCount === totalTargetCount) {
      fs.writeFileSync(DB_FILE, JSON.stringify(updatedDb, null, 2), 'utf-8');
      console.log(`[Progress] Processed ${processedCount}/${totalTargetCount} players (Matched: ${matchedList.length})...`);
    }
  }

  // Save updated DB
  fs.writeFileSync(DB_FILE, JSON.stringify(updatedDb, null, 2), 'utf-8');
  console.log(`\n[DB] Saved ${Object.keys(updatedDb.players).length} keys in ${DB_FILE}`);

  // Summary counts
  const finalSummary = {
    targetTotal: totalTargetCount,
    processedTotal: processedCount,
    matchedWithPhoto: matchedList.length,
    needsReview: needsReviewList.length,
    notFound: notFoundList.length,
    coveragePercent: ((matchedList.length / totalTargetCount) * 100).toFixed(1) + '%'
  };

  console.log('=====================================================');
  console.log('                   FINAL NUMBERS                     ');
  console.log('=====================================================');
  console.log(`Target Total Players:    ${finalSummary.targetTotal}`);
  console.log(`Processed Total Players: ${finalSummary.processedTotal}`);
  console.log(`With Photo (Matched):    ${finalSummary.matchedWithPhoto} (${finalSummary.coveragePercent})`);
  console.log(`Needs Review:            ${finalSummary.needsReview}`);
  console.log(`Not Found (Fallback):    ${finalSummary.notFound}`);
  console.log('=====================================================\n');

  // Step 6: Generate Coverage Tables & Review HTML Page
  generateCoverageReports(allTargetPlayers, clubsMap, updatedDb, matchedList, needsReviewList, notFoundList, finalSummary);

  return finalSummary;
}

function generateCoverageReports(
  allPlayers: TargetPlayer[],
  clubsMap: Map<string, TargetPlayer[]>,
  db: { players: Record<string, StoredPlayerPhoto> },
  matched: Array<{ player: TargetPlayer; photo: StoredPlayerPhoto }>,
  needsReview: Array<{ player: TargetPlayer; reason: string; candidate?: FootyRenderEntry; score: number }>,
  notFound: Array<{ player: TargetPlayer; reason: string }>,
  summary: any
) {
  const matchedSlugs = new Set(matched.map((m) => normalizePlayerKey(m.player.name)));
  const reviewSlugs = new Set(needsReview.map((r) => normalizePlayerKey(r.player.name)));

  // Coverage per club
  const clubRows: Array<{
    club: string;
    league: string;
    total: number;
    withPhoto: number;
    needsReview: number;
    notFound: number;
    percent: string;
  }> = [];

  for (const [clubName, roster] of clubsMap.entries()) {
    let withPhoto = 0;
    let inReview = 0;
    let notF = 0;

    for (const p of roster) {
      const slug = normalizePlayerKey(p.name);
      if (db.players[slug]) withPhoto++;
      else if (reviewSlugs.has(slug)) inReview++;
      else notF++;
    }

    const pct = roster.length > 0 ? ((withPhoto / roster.length) * 100).toFixed(1) + '%' : '0%';
    clubRows.push({
      club: clubName,
      league: roster[0]?.league || 'other',
      total: roster.length,
      withPhoto,
      needsReview: inReview,
      notFound: notF,
      percent: pct
    });
  }

  // Sort by league then club
  clubRows.sort((a, b) => a.league.localeCompare(b.league) || a.club.localeCompare(b.club));

  // Extract AC Milan Squad Details
  const acMilanPlayers = allPlayers.filter((p) => p.team.toLowerCase().includes('milan') && !p.team.toLowerCase().includes('inter'));
  const acMilanRows = acMilanPlayers.map((p) => {
    const slug = normalizePlayerKey(p.name);
    const photo = db.players[slug];
    const isReview = needsReview.find((r) => normalizePlayerKey(r.player.name) === slug);
    let status = 'Not Found (Fallback)';
    let photoUrl = '—';
    let conf = '0.00';
    let source = '—';

    if (photo) {
      status = 'Matched (FootyRenders)';
      photoUrl = photo.photoUrl;
      conf = photo.confidence.toFixed(2);
      source = photo.sourceUrl;
    } else if (isReview) {
      status = `Needs Review (${isReview.reason})`;
      conf = isReview.score.toFixed(2);
    }

    return {
      name: p.name,
      pos: p.position || 'Player',
      jersey: p.jersey ? `#${p.jersey}` : '—',
      status,
      confidence: conf,
      photoUrl,
      source
    };
  });

  // 1. Generate reports/coverage-table.md
  const mdLines: string[] = [
    '# MatchBay Player Photo Coverage Table',
    '',
    `**Photo Source:** [FootyRenders.com](https://www.footyrenders.com/)  `,
    `**Total Target Players:** ${summary.targetTotal}  `,
    `**Total Processed Players:** ${summary.processedTotal}  `,
    `**Matched With Real Cutout:** ${summary.matchedWithPhoto} (${summary.coveragePercent})  `,
    `**Needs Review:** ${summary.needsReview}  `,
    `**Safe Fallbacks:** ${summary.notFound}  `,
    '',
    '---',
    '',
    '## AC Milan Squad Photo Status (Complete Roster)',
    '',
    '| Player | Jersey | Position | Status | Confidence | Photo Preview | FootyRenders Source |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
  ];

  for (const m of acMilanRows) {
    const preview = m.photoUrl !== '—' ? `![](${m.photoUrl})` : '⚽ Badge';
    const sourceLink = m.source !== '—' ? `[View on FootyRenders](${m.source})` : '—';
    mdLines.push(`| **${m.name}** | ${m.jersey} | ${m.pos} | ${m.status} | \`${m.confidence}\` | ${preview} | ${sourceLink} |`);
  }

  mdLines.push('', '---', '', '## Coverage Per Club (Top 5 Leagues & Others)', '');
  mdLines.push('| League | Club | Squad Total | With Photo | Needs Review | Not Found | Coverage % |', '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |');

  for (const r of clubRows) {
    mdLines.push(`| ${r.league} | **${r.club}** | ${r.total} | ${r.withPhoto} | ${r.needsReview} | ${r.notFound} | **${r.percent}** |`);
  }

  fs.writeFileSync(COVERAGE_MD_FILE, mdLines.join('\n'), 'utf-8');
  fs.writeFileSync(COVERAGE_JSON_FILE, JSON.stringify({ summary, clubRows, acMilanRows }, null, 2), 'utf-8');

  // 2. Generate reports/photo-review.html (Interactive HTML review gallery)
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MatchBay Player Cutout Review — FootyRenders</title>
  <style>
    :root {
      --bg: #050d0e;
      --card-bg: #0e1e21;
      --text: #e2f1f2;
      --muted: #8fa6a8;
      --accent: #3ddc97;
      --border: rgba(255, 255, 255, 0.08);
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 24px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 30px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
    }
    h1 { margin: 0 0 10px; font-size: 28px; }
    .stat-bar { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 15px; }
    .stat-chip {
      background: var(--card-bg);
      padding: 10px 18px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .stat-chip b { color: var(--accent); font-size: 18px; }
    .club-section {
      max-width: 1200px;
      margin: 30px auto;
    }
    .club-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--accent);
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .avatar-wrapper {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 2px solid var(--accent);
      background: radial-gradient(circle, #1a2f33 0%, #0d1a1c 100%);
      overflow: hidden;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .card-meta { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
    .conf-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 12px;
      background: rgba(61, 220, 151, 0.15);
      color: var(--accent);
      font-weight: 600;
    }
    .source-link {
      margin-top: 8px;
      font-size: 11px;
      color: var(--accent);
      text-decoration: none;
    }
    .source-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MatchBay Player Cutout Review</h1>
    <p style="color:var(--muted);margin:0;">Source: FootyRenders.com · Head & shoulders transparent WebP avatars</p>
    <div class="stat-bar">
      <div class="stat-chip">Target Players: <b>${summary.targetTotal}</b></div>
      <div class="stat-chip">Processed: <b>${summary.processedTotal}</b></div>
      <div class="stat-chip">With Photo: <b>${summary.matchedWithPhoto}</b></div>
      <div class="stat-chip">Coverage: <b>${summary.coveragePercent}</b></div>
      <div class="stat-chip">Needs Review: <b>${summary.needsReview}</b></div>
    </div>
  </div>

  <div class="content">
    ${Array.from(clubsMap.entries())
      .filter(([, roster]) => roster.some((p) => db.players[normalizePlayerKey(p.name)]))
      .map(([clubName, roster]) => {
        const clubMatched = roster.filter((p) => db.players[normalizePlayerKey(p.name)]);
        return `
          <div class="club-section">
            <div class="club-title">${clubName} (${clubMatched.length}/${roster.length} cutouts)</div>
            <div class="gallery">
              ${clubMatched
                .map((p) => {
                  const photo = db.players[normalizePlayerKey(p.name)];
                  return `
                    <div class="card">
                      <div class="avatar-wrapper">
                        <img loading="lazy" src="${photo.photoUrl}" alt="${p.name}" />
                      </div>
                      <div class="card-name">${p.name}</div>
                      <div class="card-meta">${p.position || 'Player'}${p.jersey ? ' · #' + p.jersey : ''}</div>
                      <span class="conf-badge">Score: ${(photo.confidence * 100).toFixed(0)}%</span>
                      <a class="source-link" href="${photo.sourceUrl}" target="_blank" rel="noopener">FootyRenders Render ↗</a>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>
        `;
      })
      .join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(REVIEW_HTML_FILE, htmlContent, 'utf-8');
  console.log(`[Reports] Generated review page: ${REVIEW_HTML_FILE}`);
  console.log(`[Reports] Generated coverage report: ${COVERAGE_MD_FILE}`);
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runSync().catch((err) => {
    console.error('[Sync Error]', err);
    process.exit(1);
  });
}
