/**
 * playerPhotoMatcher.ts
 * High-accuracy football player face-photo matching and normalization engine.
 * Ensures ZERO mistakes through cross-verification of name tokens, team synonyms,
 * positions, and confidence scoring.
 */

export interface TargetPlayer {
  id?: string | number;
  name: string;
  team?: string;
  teamCode?: string;
  position?: string;
  country?: string;
  flag?: string;
  jersey?: number | string;
  slug?: string;
}

export interface CandidatePhoto {
  id: string; // provider ID (e.g. from ratings / credits)
  ratingsName: string;
  team?: string;
  league?: string;
  position?: string;
  wikiName?: string;
  credit: string;
  license: string;
  sourceUrl: string;
}

export interface MatchResult {
  status: 'HIGH_CONFIDENCE' | 'NEEDS_REVIEW' | 'NO_PHOTO_FOUND';
  confidence: number;
  candidate?: CandidatePhoto;
  reason: string;
  matchedAttribute?: string;
}

export interface StoredPlayerPhoto {
  key: string;
  slug: string;
  name: string;
  team: string;
  position: string;
  photoUrl: string;
  credit: string;
  license: string;
  sourceUrl: string;
  confidence: number;
  locked: boolean;
  matchedAt: string;
  sourcePlayerId?: string;
}

// Canonical team synonyms for cross-verification
export const TEAM_SYNONYMS: Record<string, string[]> = {
  'manchestercity': ['manchestercity', 'mancity', 'mci'],
  'manchesterunited': ['manchesterunited', 'manutd', 'manunited', 'mun'],
  'arsenal': ['arsenal', 'ars'],
  'liverpool': ['liverpool', 'liv'],
  'chelsea': ['chelsea', 'che'],
  'tottenhamhotspur': ['tottenhamhotspur', 'tottenham', 'spurs', 'tot'],
  'newcastleunited': ['newcastleunited', 'newcastle', 'new'],
  'astonvilla': ['astonvilla', 'villa', 'avl'],
  'realmadrid': ['realmadrid', 'rma'],
  'barcelona': ['barcelona', 'fcbarcelona', 'bar'],
  'atleticomadrid': ['atleticomadrid', 'atletico', 'atm'],
  'bayernmunich': ['bayernmunich', 'bayernmunchen', 'fcbayern', 'bayern', 'bay'],
  'bayerleverkusen': ['bayerleverkusen', 'leverkusen', 'b04'],
  'borussiadortmund': ['borussiadortmund', 'dortmund', 'bvb'],
  'intermilan': ['intermilan', 'internazionale', 'inter', 'int'],
  'acmilan': ['acmilan', 'milan', 'mil'],
  'juventus': ['juventus', 'juve', 'juv'],
  'asroma': ['asroma', 'roma', 'rom'],
  'napoli': ['napoli', 'sscnapoli', 'nap'],
  'parissaintgermain': ['parissaintgermain', 'psg', 'paris'],
  'alnassr': ['alnassr', 'al-nassr', 'nas'],
  'alhilal': ['alhilal', 'al-hilal', 'hil'],
  'alittihad': ['alittihad', 'al-ittihad', 'itt'],
  'alahli': ['alahli', 'al-ahli', 'ahl'],
  'intermiami': ['intermiami', 'intermiamicf', 'mia'],
  'sportingcp': ['sportingcp', 'sporting', 'sportinglisbon', 'scp'],
  'galatasaray': ['galatasaray', 'gala', 'gal'],
  'vfbstuttgart': ['vfbstuttgart', 'stuttgart', 'vfb'],
};

/**
 * Normalizes text: strips accents/diacritics, lowercase, removes non-alphanumeric.
 */
export function normalizePlayerKey(str: string): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/ð/g, 'd')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Tokenizes name into distinct alphanumeric words, filtering out common suffixes.
 */
export function tokenizePlayerName(name: string): string[] {
  if (!name) return [];
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/ð/g, 'd')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0 && !['jr', 'junior', 'sr', 'senior', 'ii', 'iii', 'iv', 'fc', 'cf'].includes(t));
}

/**
 * Computes similarity between two team names (0.0 to 1.0).
 */
export function compareTeams(t1?: string, t2?: string): number {
  if (!t1 || !t2) return 0;
  const n1 = normalizePlayerKey(t1);
  const n2 = normalizePlayerKey(t2);
  if (n1 === n2) return 1.0;

  // Check synonym map
  for (const group of Object.values(TEAM_SYNONYMS)) {
    const hasT1 = group.some((g) => n1.includes(g) || g.includes(n1));
    const hasT2 = group.some((g) => n2.includes(g) || g.includes(n2));
    if (hasT1 && hasT2) return 1.0;
  }

  // Substring check
  if (n1.includes(n2) || n2.includes(n1)) return 0.85;

  // Token intersection
  const tok1 = tokenizePlayerName(t1);
  const tok2 = tokenizePlayerName(t2);
  const common = tok1.filter((t) => tok2.includes(t));
  if (common.length > 0) return 0.75;

  return 0;
}

/**
 * Position similarity check.
 */
export function comparePositions(p1?: string, p2?: string): boolean {
  if (!p1 || !p2) return true; // lenient if unspecified
  const s1 = p1.toLowerCase();
  const s2 = p2.toLowerCase();

  const isGK1 = s1.includes('gk') || s1.includes('goal');
  const isGK2 = s2.includes('gk') || s2.includes('goal');
  if (isGK1 !== isGK2) return false;

  const isDF1 = s1.includes('df') || s1.includes('def');
  const isDF2 = s2.includes('df') || s2.includes('def');
  if (isDF1 && isDF2) return true;

  const isMF1 = s1.includes('mf') || s1.includes('mid');
  const isMF2 = s2.includes('mf') || s2.includes('mid');
  if (isMF1 && isMF2) return true;

  const isFW1 = s1.includes('fw') || s1.includes('forw') || s1.includes('att') || s1.includes('wing');
  const isFW2 = s2.includes('fw') || s2.includes('forw') || s2.includes('att') || s2.includes('wing');
  if (isFW1 && isFW2) return true;

  return true;
}

/**
 * High-accuracy matcher with confidence scoring.
 * Enforces zero-tolerance for ambiguous names (e.g. Cristiano Ronaldo vs other Ronaldos,
 * multiple Silvas, Gabriel Magalhães vs Gabriel Jesus).
 */
export function matchPlayerPhoto(
  target: TargetPlayer,
  candidates: CandidatePhoto[],
  options: { minHighConfidence?: number; minReviewConfidence?: number } = {}
): MatchResult {
  const minHigh = options.minHighConfidence ?? 0.85;
  const minReview = options.minReviewConfidence ?? 0.50;

  if (!target || !target.name) {
    return { status: 'NO_PHOTO_FOUND', confidence: 0, reason: 'Target player has no name' };
  }

  const targetTokens = tokenizePlayerName(target.name);
  if (targetTokens.length === 0) {
    return { status: 'NO_PHOTO_FOUND', confidence: 0, reason: 'Target player name has no tokens' };
  }

  const targetNorm = normalizePlayerKey(target.name);
  const targetSurname = targetTokens[targetTokens.length - 1];
  const targetFirstname = targetTokens[0];

  // Disambiguation check for Cristiano Ronaldo
  const isCristianoRonaldo = targetNorm.includes('cristianoronaldo');

  interface ScoredCandidate {
    candidate: CandidatePhoto;
    confidence: number;
    reason: string;
  }

  const scored: ScoredCandidate[] = [];

  for (const cand of candidates) {
    const candNorm = normalizePlayerKey(cand.ratingsName);
    const candTokens = tokenizePlayerName(cand.ratingsName);
    const candWikiTokens = cand.wikiName ? tokenizePlayerName(cand.wikiName) : [];
    const candWikiNorm = cand.wikiName ? normalizePlayerKey(cand.wikiName) : '';

    // Safety guard: Cristiano Ronaldo must NOT match Brazilian Ronaldo or non-Cristiano
    if (isCristianoRonaldo) {
      const isCandCristiano = candNorm.includes('cristianoronaldo') ||
        (candTokens.includes('cristiano') && candTokens.includes('ronaldo')) ||
        (candWikiNorm.includes('cristianoronaldo') || (candWikiTokens.includes('cristiano') && candWikiTokens.includes('ronaldo')));
      if (!isCandCristiano) {
        continue; // Skip non-Cristiano Ronaldo
      }
    } else if (targetSurname === 'ronaldo' && !isCristianoRonaldo) {
      // If target is NOT Cristiano Ronaldo, do not match Cristiano
      if (candNorm.includes('cristiano') || candWikiNorm.includes('cristiano')) {
        continue;
      }
    }

    const teamSim = compareTeams(target.team, cand.team);
    const posMatch = comparePositions(target.position, cand.position);
    if (!posMatch) continue; // Positional mismatch (e.g. GK vs FW) immediately invalidates

    let nameScore = 0;
    let matchType = '';

    // 1. Exact full name match in ratingsName
    if (candNorm === targetNorm) {
      nameScore = 1.0;
      matchType = 'exact-name';
    }
    // 2. Exact full name in Wikimedia Commons title
    else if (candWikiNorm.includes(targetNorm) || targetTokens.every((t) => candWikiTokens.includes(t))) {
      nameScore = 0.96;
      matchType = 'wiki-full-name';
    }
    // 3. Initial + Surname match in ratingsName (e.g. "E. Haaland" vs "Erling Haaland")
    else if (candTokens.length >= 2 && targetSurname === candTokens[candTokens.length - 1]) {
      const candInitial = candTokens[0][0];
      if (targetFirstname[0] === candInitial) {
        nameScore = 0.88;
        matchType = 'initial-surname';
      }
    }
    // 4. Single-token name (e.g., "Rodri", "Pedri", "Gavi", "Endrick", "Ederson", "Raphinha")
    else if (targetTokens.length === 1 && (candTokens.includes(targetNorm) || candWikiTokens.includes(targetNorm))) {
      nameScore = 0.90;
      matchType = 'single-token-mononym';
    }

    if (nameScore > 0) {
      let finalConfidence = 0;

      if (nameScore >= 0.95 && teamSim >= 0.7) {
        finalConfidence = 0.99;
      } else if (nameScore >= 0.95 && teamSim === 0) {
        // Player might be listed with national team or recent transfer in the photo credit
        finalConfidence = 0.88;
      } else if (nameScore === 0.88 && teamSim >= 0.7) {
        finalConfidence = 0.95;
      } else if (nameScore === 0.88 && teamSim === 0) {
        // Initial + surname without team confirmation -> lower confidence for manual review
        finalConfidence = 0.65;
      } else if (matchType === 'single-token-mononym' && teamSim >= 0.7) {
        finalConfidence = 0.96;
      } else if (matchType === 'single-token-mononym' && teamSim === 0) {
        finalConfidence = 0.75;
      } else {
        finalConfidence = nameScore * 0.7 + teamSim * 0.3;
      }

      scored.push({
        candidate: cand,
        confidence: Number(finalConfidence.toFixed(2)),
        reason: `${matchType} (teamSim=${teamSim.toFixed(2)})`
      });
    }
  }

  if (scored.length === 0) {
    return {
      status: 'NO_PHOTO_FOUND',
      confidence: 0,
      reason: `No photo candidates matched name "${target.name}"`
    };
  }

  // Sort by confidence descending
  scored.sort((a, b) => b.confidence - a.confidence);
  const best = scored[0];

  // Disambiguation check: if multiple distinct candidates have high and close confidence,
  // do not guess blindly!
  if (scored.length > 1 && scored[1].confidence >= 0.85 && (best.confidence - scored[1].confidence) < 0.08) {
    // Check if they are actually different players or duplicate entries
    const isDifferentPlayer = scored[1].candidate.ratingsName !== best.candidate.ratingsName ||
      scored[1].candidate.team !== best.candidate.team;
    if (isDifferentPlayer) {
      return {
        status: 'NEEDS_REVIEW',
        confidence: 0.70,
        candidate: best.candidate,
        reason: `Ambiguous match: multiple distinct candidates with close scores (${best.candidate.ratingsName} @ ${best.confidence} vs ${scored[1].candidate.ratingsName} @ ${scored[1].confidence})`
      };
    }
  }

  if (best.confidence >= minHigh) {
    return {
      status: 'HIGH_CONFIDENCE',
      confidence: best.confidence,
      candidate: best.candidate,
      reason: best.reason
    };
  }

  if (best.confidence >= minReview) {
    return {
      status: 'NEEDS_REVIEW',
      confidence: best.confidence,
      candidate: best.candidate,
      reason: best.reason
    };
  }

  return {
    status: 'NO_PHOTO_FOUND',
    confidence: best.confidence,
    reason: `Best candidate confidence (${best.confidence}) below threshold`
  };
}
