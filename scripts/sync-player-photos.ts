/**
 * sync-player-photos.ts
 * Re-runnable, idempotent script to sync verified football player headshots
 * from inthegame.blog (Wikimedia Commons open licenses) to local storage.
 *
 * Usage:
 *   npx tsx scripts/sync-player-photos.ts
 */

import fs from 'fs';
import path from 'path';
import { parquetRead } from 'hyparquet';
import {
  matchPlayerPhoto,
  normalizePlayerKey,
  tokenizePlayerName,
  TargetPlayer,
  CandidatePhoto,
  StoredPlayerPhoto
} from '../src/playerPhotoMatcher';

const DATA_BASE_URL = 'https://data.inthegame.blog/';
const CREDITS_URL = `${DATA_BASE_URL}football/headshot-credits.json`;
const RATINGS_URL = `${DATA_BASE_URL}football/ratings.parquet`;
const HEADSHOT_IMG_BASE = `${DATA_BASE_URL}football/headshots/`;

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const PHOTOS_DIR = path.resolve(PUBLIC_DIR, 'player-photos');
const DB_FILE = path.resolve(PUBLIC_DIR, 'player-photos-db.json');
const REPORT_JSON = path.resolve(process.cwd(), 'player-photos-report.json');
const REPORT_MD = path.resolve(process.cwd(), 'player-photos-report.md');

// Polite rate-limiting delay between network downloads (ms)
const DOWNLOAD_DELAY_MS = 60;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 404) return res;
    } catch (err) {
      // network glitch, backoff
    }
    attempt++;
    await sleep(200 * Math.pow(2, attempt));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

async function downloadPhoto(url: string, destPath: string): Promise<boolean> {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
    // Already downloaded and valid
    return true;
  }
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return false;
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength < 200) return false;
    fs.writeFileSync(destPath, Buffer.from(arrayBuf));
    return true;
  } catch (e) {
    console.warn(`[Sync] Error downloading ${url}:`, (e as Error).message);
    return false;
  }
}

export async function runSync(options: { downloadImages?: boolean; verbose?: boolean } = {}) {
  const downloadImages = options.downloadImages ?? true;
  const verbose = options.verbose ?? true;

  console.log('=== MatchBay Player Photo Sync ===');

  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  // 1. Load existing DB to respect locked photos and manual overrides
  let existingDb: { players: Record<string, StoredPlayerPhoto>; overrides?: Record<string, StoredPlayerPhoto> } = {
    players: {},
    overrides: {}
  };
  if (fs.existsSync(DB_FILE)) {
    try {
      existingDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!existingDb.players) existingDb.players = {};
      if (!existingDb.overrides) existingDb.overrides = {};
    } catch (e) {
      console.warn('[Sync] Could not parse existing DB, initializing fresh:', (e as Error).message);
    }
  }

  // 2. Fetch credits JSON and ratings Parquet from source
  if (verbose) console.log('[Sync] Fetching headshot credits catalog...');
  const creditsRes = await fetchWithRetry(CREDITS_URL);
  if (!creditsRes.ok) throw new Error(`Failed to fetch ${CREDITS_URL}`);
  const creditsMap: Record<string, { a?: string; l?: string; u?: string }> = await creditsRes.json();
  const creditsKeys = Object.keys(creditsMap);
  if (verbose) console.log(`[Sync] Loaded ${creditsKeys.length} headshot credits.`);

  if (verbose) console.log('[Sync] Fetching ratings parquet dataset...');
  const ratingsRes = await fetchWithRetry(RATINGS_URL);
  if (!ratingsRes.ok) throw new Error(`Failed to fetch ${RATINGS_URL}`);
  const ratingsBuffer = await ratingsRes.arrayBuffer();

  const ratingsRows = await new Promise<any[]>((resolve) => {
    parquetRead({
      file: ratingsBuffer,
      rowFormat: 'object',
      onComplete: resolve
    });
  });
  if (verbose) console.log(`[Sync] Parsed ${ratingsRows.length} player ratings rows.`);

  // 3. Build candidate index with photo availability
  const candidates: CandidatePhoto[] = [];
  for (const r of ratingsRows) {
    if (!r.player_id) continue;
    const cred = creditsMap[r.player_id];
    if (!cred) continue; // Only players with verified Wikimedia Commons photos

    let wikiName = '';
    if (cred.u) {
      const m = cred.u.match(/File:([^?#]+)/);
      if (m) {
        wikiName = decodeURIComponent(m[1])
          .replace(/_/g, ' ')
          .replace(/\.[a-zA-Z0-9]+$/, '')
          .replace(/\(cropped\)/i, '')
          .trim();
      }
    }

    candidates.push({
      id: r.player_id,
      ratingsName: r.player_name || '',
      team: r.team || '',
      league: r.league || '',
      position: r.position || '',
      wikiName,
      credit: cred.a || 'Wikimedia Commons',
      license: cred.l || 'Open License',
      sourceUrl: cred.u || ''
    });
  }
  if (verbose) console.log(`[Sync] Indexed ${candidates.length} photo candidate players.`);

  // 4. Gather Target Players from codebase
  const targetPlayers: TargetPlayer[] = [];
  const targetSeen = new Set<string>();

  // From playersData.js
  const playersDataPath = path.resolve(PUBLIC_DIR, 'playersData.js');
  if (fs.existsSync(playersDataPath)) {
    const code = fs.readFileSync(playersDataPath, 'utf-8');
    const func = new Function('const self = {}; ' + code + '; return self.TOP_PLAYERS_DATA;');
    const list: TargetPlayer[] = func() || [];
    for (const p of list) {
      const key = normalizePlayerKey(p.name);
      if (!targetSeen.has(key)) {
        targetSeen.add(key);
        targetPlayers.push(p);
      }
    }
  }

  // From playerSpotlight.js
  const spotlightPath = path.resolve(PUBLIC_DIR, 'playerSpotlight.js');
  if (fs.existsSync(spotlightPath)) {
    const code = fs.readFileSync(spotlightPath, 'utf-8');
    const spotlightMatches = [...code.matchAll(/['"]([a-z0-9]+)['"]:\s*{\s*id:\s*(\d+)/g)];
    for (const m of spotlightMatches) {
      const key = m[1];
      if (!targetSeen.has(key)) {
        targetSeen.add(key);
        // Synthesize target
        targetPlayers.push({
          name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
          slug: key
        });
      }
    }
  }

  if (verbose) console.log(`[Sync] Found ${targetPlayers.length} target players to evaluate.`);

  // 5. Match and evaluate each player
  const highConfidenceList: Array<{ player: TargetPlayer; match: any; localUrl: string }> = [];
  const needsReviewList: Array<{ player: TargetPlayer; match: any }> = [];
  const noPhotoList: Array<{ player: TargetPlayer; reason: string }> = [];

  const updatedDb = { ...existingDb };

  for (const target of targetPlayers) {
    const slug = normalizePlayerKey(target.slug || target.name);
    const existing = updatedDb.players[slug] || (updatedDb.overrides ? updatedDb.overrides[slug] : undefined);

    // If locked or manual override exists, honor it
    if (existing && existing.locked) {
      if (verbose) console.log(`[Sync] Player ${target.name} is locked/overridden. Preserving.`);
      highConfidenceList.push({
        player: target,
        match: {
          candidate: {
            ratingsName: existing.name,
            credit: existing.credit,
            license: existing.license,
            sourceUrl: existing.sourceUrl
          },
          confidence: existing.confidence,
          reason: 'Manually locked override'
        },
        localUrl: existing.photoUrl
      });
      continue;
    }

    const matchRes = matchPlayerPhoto(target, candidates);

    if (matchRes.status === 'HIGH_CONFIDENCE' && matchRes.candidate) {
      const cand = matchRes.candidate;
      const fileName = `${slug}.webp`;
      const localFilePath = path.resolve(PHOTOS_DIR, fileName);
      const localUrl = `/player-photos/${fileName}`;
      const remoteImgUrl = `${HEADSHOT_IMG_BASE}${cand.id}.webp`;

      if (downloadImages) {
        await downloadPhoto(remoteImgUrl, localFilePath);
        await sleep(DOWNLOAD_DELAY_MS);
      }

      const photoRecord: StoredPlayerPhoto = {
        key: slug,
        slug,
        name: target.name,
        team: target.team || cand.team || '',
        position: target.position || cand.position || '',
        photoUrl: localUrl,
        credit: cand.credit,
        license: cand.license,
        sourceUrl: cand.sourceUrl,
        confidence: matchRes.confidence,
        locked: false,
        matchedAt: new Date().toISOString(),
        sourcePlayerId: cand.id
      };

      updatedDb.players[slug] = photoRecord;
      highConfidenceList.push({ player: target, match: matchRes, localUrl });
    } else if (matchRes.status === 'NEEDS_REVIEW') {
      needsReviewList.push({ player: target, match: matchRes });
    } else {
      noPhotoList.push({ player: target, reason: matchRes.reason });
    }
  }

  // 6. Save updated DB
  fs.writeFileSync(DB_FILE, JSON.stringify(updatedDb, null, 2), 'utf-8');
  if (verbose) console.log(`[Sync] Saved ${Object.keys(updatedDb.players).length} photos to ${DB_FILE}`);

  // 7. Generate Report Artifacts
  const reportData = {
    generatedAt: new Date().toISOString(),
    totalEvaluated: targetPlayers.length,
    highConfidenceCount: highConfidenceList.length,
    needsReviewCount: needsReviewList.length,
    noPhotoFoundCount: noPhotoList.length,
    highConfidence: highConfidenceList.map((h) => ({
      name: h.player.name,
      team: h.player.team || '—',
      confidence: h.match.confidence,
      reason: h.match.reason,
      localUrl: h.localUrl,
      photographer: h.match.candidate?.credit || 'Wikimedia Commons',
      license: h.match.candidate?.license || 'Open License',
      sourceUrl: h.match.candidate?.sourceUrl || ''
    })),
    needsReview: needsReviewList.map((r) => ({
      name: r.player.name,
      team: r.player.team || '—',
      confidence: r.match.confidence,
      reason: r.match.reason,
      bestCandidate: r.match.candidate?.ratingsName || '—',
      candidateTeam: r.match.candidate?.team || '—'
    })),
    noPhotoFound: noPhotoList.map((n) => ({
      name: n.player.name,
      team: n.player.team || '—',
      reason: n.reason
    }))
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(reportData, null, 2), 'utf-8');

  // Generate Markdown Report
  const mdLines: string[] = [
    '# MatchBay Player Photo Sync Report',
    '',
    `**Generated:** ${reportData.generatedAt}  `,
    `**Source:** https://inthegame.blog/football/photo-credits (Wikimedia Commons Open Licenses)  `,
    `**Total Target Players:** ${reportData.totalEvaluated}  `,
    `**High Confidence (Auto-Accepted):** ${reportData.highConfidenceCount}  `,
    `**Needs Manual Review:** ${reportData.needsReviewCount}  `,
    `**No Photo Found (Using Badge Fallback):** ${reportData.noPhotoFoundCount}  `,
    '',
    '---',
    '',
    '## 1. High Confidence Matches (Auto-Accepted & Saved Locally)',
    '',
    '| Player | Team | Confidence | Photographer / Credit | License | Local File | Source |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
  ];

  for (const item of reportData.highConfidence) {
    mdLines.push(
      `| **${item.name}** | ${item.team} | \`${item.confidence}\` | ${item.photographer} | ${item.license} | \`${item.localUrl}\` | [Wikimedia](${item.sourceUrl}) |`
    );
  }

  mdLines.push('', '---', '', '## 2. Players Needing Manual Review (Uncertain / Ambiguous)', '');
  if (reportData.needsReview.length === 0) {
    mdLines.push('_None. Zero ambiguous matches._', '');
  } else {
    mdLines.push('| Player | Team | Confidence | Potential Candidate | Candidate Team | Reason |', '| :--- | :--- | :--- | :--- | :--- | :--- |');
    for (const item of reportData.needsReview) {
      mdLines.push(
        `| **${item.name}** | ${item.team} | \`${item.confidence}\` | ${item.bestCandidate} | ${item.candidateTeam} | ${item.reason} |`
      );
    }
  }

  mdLines.push('', '---', '', '## 3. Players With No Photo Found (Safe Placeholder Fallback)', '');
  if (reportData.noPhotoFound.length === 0) {
    mdLines.push('_None._', '');
  } else {
    mdLines.push('| Player | Team | Reason / Status |', '| :--- | :--- | :--- |');
    for (const item of reportData.noPhotoFound) {
      mdLines.push(`| **${item.name}** | ${item.team} | ${item.reason} |`);
    }
  }

  fs.writeFileSync(REPORT_MD, mdLines.join('\n'), 'utf-8');
  if (verbose) console.log(`[Sync] Generated report files: ${REPORT_JSON} and ${REPORT_MD}`);

  console.log(`=== Sync Completed: ${reportData.highConfidenceCount} matched, ${reportData.needsReviewCount} review, ${reportData.noPhotoFoundCount} fallback ===`);
  return reportData;
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runSync().catch((err) => {
    console.error('[Sync Error]', err);
    process.exit(1);
  });
}
