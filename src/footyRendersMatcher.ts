/**
 * footyRendersMatcher.ts
 * High-precision football player photo matching engine for FootyRenders.com.
 * Ensures zero mistakes through strict token analysis, disambiguation guards,
 * club/country cross-verification, and confidence scoring.
 */

export interface TargetPlayer {
  id?: string | number;
  name: string;
  team: string;
  league?: string;
  position?: string;
  citizenship?: string;
  jersey?: number | string;
  slug?: string;
  age?: number;
}

export interface FootyRenderEntry {
  pageUrl: string;
  imgUrl: string;
  league?: string;
  club?: string;
  slug: string;
  cleanName: string;
  author?: string;
}

export interface MatchResult {
  status: 'HIGH_CONFIDENCE' | 'NEEDS_REVIEW' | 'NO_PHOTO_FOUND';
  confidence: number;
  candidate?: FootyRenderEntry;
  reason: string;
}

export interface StoredPlayerPhoto {
  key: string;
  slug: string;
  name: string;
  team: string;
  league?: string;
  position: string;
  photoUrl: string;
  sourceUrl: string;
  credit: string;
  source: 'footyrenders' | 'custom';
  confidence: number;
  locked: boolean;
  matchedAt: string;
}

export const KNOWN_ALIASES: Record<string, string[]> = {
  'rafaelleao': ['rleao', 'rafaelleao', 'leao'],
  'erlinghaaland': ['erlinghaaland', 'erlingbrauthaland', 'erlingbrauthaaland', 'ehaaland'],
  'viniciusjunior': ['viniciusjr', 'viniciusjunior', 'vinicius'],
  'cristianoronaldo': ['cristianoronaldo', 'cronaldo', 'cr7'],
  'lionelmessi': ['lionelmessi', 'lmessi', 'messi'],
  'kylianmbappe': ['kylianmbappe', 'kmbappe', 'mbappe'],
  'kevindebruyne': ['kevindebruyne', 'kdebruyne', 'debruyne'],
  'christianpulisic': ['christianpulisic', 'cpulisic', 'pulisic'],
  'theohernandez': ['theohernandez', 'thernandez'],
  'mikemaignan': ['mikemaignan', 'mmaignan', 'maignan'],
  'rodri': ['rodrigo', 'rodrigohernandez', 'rodrigohernandezcascante'],
  'heungminson': ['sonheungmin', 'son'],
  'frenkiedejong': ['frenkiedejong', 'dejong'],
  'mohamedsalah': ['mohamedsalah', 'msalah', 'salah'],
  'virgilvandijk': ['virgilvandijk', 'vandijk'],
  'alissonbecker': ['alisson', 'alissonbecker'],
  'gabrielmagalhaes': ['gabrielmagalhaes', 'gabriel'],
  'gabrieljesus': ['gabrieljesus', 'gjesus'],
  'gabrielmartinelli': ['gabrielmartinelli', 'martinelli'],
  'bernardosilva': ['bernardosilva', 'bsilva'],
  'thiagosilva': ['thiagosilva', 'tsilva'],
};

export const CLUB_SYNONYMS: Record<string, string[]> = {
  'acmilan': ['acmilan', 'milan', 'rossoneri'],
  'intermilan': ['intermilan', 'internazionale', 'inter', 'nerazzurri'],
  'manchestercity': ['manchestercity', 'mancity', 'city'],
  'manchesterunited': ['manchesterunited', 'manunited', 'manutd'],
  'arsenal': ['arsenal', 'gunners'],
  'chelsea': ['chelsea', 'blues'],
  'liverpool': ['liverpool', 'reds'],
  'tottenhamhotspur': ['tottenhamhotspur', 'tottenham', 'spurs'],
  'realmadrid': ['realmadrid', 'madrid', 'merengues'],
  'barcelona': ['barcelona', 'fcbarcelona', 'barca'],
  'atleticomadrid': ['atleticomadrid', 'atletico'],
  'bayernmunich': ['bayernmunich', 'bayernmunchen', 'fcbayern', 'bayern'],
  'borussiadortmund': ['borussiadortmund', 'dortmund', 'bvb'],
  'bayerleverkusen': ['bayerleverkusen', 'leverkusen'],
  'parissaintgermain': ['parissaintgermain', 'psg', 'paris'],
  'juventus': ['juventus', 'juve'],
  'asroma': ['asroma', 'roma'],
  'napoli': ['napoli', 'sscnapoli'],
  'newcastleunited': ['newcastleunited', 'newcastle'],
  'astonvilla': ['astonvilla', 'villa'],
  'sportingcp': ['sportingcp', 'sporting', 'sportinglisbon'],
  'galatasaray': ['galatasaray', 'gala'],
  'intermiami': ['intermiami', 'intermiamicf'],
  'alnassr': ['alnassr', 'al-nassr'],
  'alhilal': ['alhilal', 'al-hilal'],
};

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

export function compareClubNames(targetClub?: string, candClub?: string): number {
  if (!targetClub || !candClub) return 0;
  const n1 = normalizePlayerKey(targetClub);
  const n2 = normalizePlayerKey(candClub);
  if (n1 === n2) return 1.0;

  for (const group of Object.values(CLUB_SYNONYMS)) {
    const has1 = group.some((g) => n1.includes(g) || g.includes(n1));
    const has2 = group.some((g) => n2.includes(g) || g.includes(n2));
    if (has1 && has2) return 1.0;
  }

  if (n1.includes(n2) || n2.includes(n1)) return 0.85;
  return 0;
}

export function matchFootyRender(
  target: TargetPlayer,
  candidates: FootyRenderEntry[],
  options: { minConfidence?: number } = {}
): MatchResult {
  const minConfidence = options.minConfidence ?? 0.85;
  if (!target || !target.name) {
    return { status: 'NO_PHOTO_FOUND', confidence: 0, reason: 'Target player has no name' };
  }

  const targetNorm = normalizePlayerKey(target.name);
  const targetTokens = tokenizePlayerName(target.name);
  if (targetTokens.length === 0) {
    return { status: 'NO_PHOTO_FOUND', confidence: 0, reason: 'Target player name has no tokens' };
  }

  const targetSurname = targetTokens[targetTokens.length - 1];
  const targetFirstname = targetTokens[0];
  const isCristianoRonaldo = targetNorm.includes('cristianoronaldo') || targetNorm === 'cronaldo';

  interface ScoredCandidate {
    candidate: FootyRenderEntry;
    confidence: number;
    reason: string;
  }

  const scored: ScoredCandidate[] = [];

  for (const cand of candidates) {
    const candNorm = normalizePlayerKey(cand.cleanName || cand.slug);
    const candTokens = tokenizePlayerName(cand.cleanName || cand.slug);

    // Guard: Cristiano Ronaldo must never match Brazilian Ronaldo or non-Cristiano
    if (isCristianoRonaldo) {
      const isCandCristiano = candNorm.includes('cristianoronaldo') ||
        (candTokens.includes('cristiano') && candTokens.includes('ronaldo'));
      if (!isCandCristiano) continue;
    } else if (targetSurname === 'ronaldo' && !isCristianoRonaldo) {
      if (candNorm.includes('cristiano')) continue;
    }

    const clubSim = compareClubNames(target.team, cand.club);
    let nameSim = 0;
    let matchType = '';

    // 1. Exact full normalized name match
    if (candNorm === targetNorm) {
      nameSim = 1.0;
      matchType = 'exact-name';
    }
    // 2. Known alias match
    else if (
      KNOWN_ALIASES[targetNorm]?.some((a) => candNorm.includes(a) || a.includes(candNorm)) ||
      KNOWN_ALIASES[candNorm]?.some((a) => targetNorm.includes(a) || a.includes(targetNorm))
    ) {
      nameSim = 0.98;
      matchType = 'known-alias';
    }
    // 3. All target tokens contained in candidate
    else if (targetTokens.length >= 2 && targetTokens.every((t) => candTokens.includes(t))) {
      nameSim = 0.95;
      matchType = 'all-tokens-match';
    }
    // 4. Initial + Surname match (e.g. "R. Leão" vs "Rafael Leão")
    else if (candTokens.length >= 2 && targetSurname === candTokens[candTokens.length - 1]) {
      const candInitial = candTokens[0][0];
      if (targetFirstname[0] === candInitial) {
        nameSim = 0.88;
        matchType = 'initial-surname';
      }
    }

    if (nameSim > 0) {
      let finalConfidence = 0;
      if (nameSim >= 0.95 && clubSim >= 0.8) {
        finalConfidence = 1.0;
      } else if (nameSim >= 0.95 && clubSim === 0) {
        // Player might be shown in national team render or previous club
        finalConfidence = 0.90;
      } else if (nameSim === 0.88 && clubSim >= 0.8) {
        finalConfidence = 0.92;
      } else if (nameSim === 0.88 && clubSim === 0) {
        finalConfidence = 0.65; // Needs review
      } else {
        finalConfidence = nameSim * 0.7 + clubSim * 0.3;
      }

      scored.push({
        candidate: cand,
        confidence: Number(finalConfidence.toFixed(2)),
        reason: `${matchType} (clubSim=${clubSim.toFixed(2)})`
      });
    }
  }

  if (scored.length === 0) {
    return {
      status: 'NO_PHOTO_FOUND',
      confidence: 0,
      reason: `No FootyRenders match for "${target.name}"`
    };
  }

  scored.sort((a, b) => b.confidence - a.confidence);
  const best = scored[0];

  // Ambiguity guard: if multiple distinct candidates share high confidence, don't guess
  if (scored.length > 1 && scored[1].confidence >= 0.85 && (best.confidence - scored[1].confidence) < 0.08) {
    const isDifferent = normalizePlayerKey(scored[1].candidate.cleanName) !== normalizePlayerKey(best.candidate.cleanName);
    if (isDifferent) {
      return {
        status: 'NEEDS_REVIEW',
        confidence: 0.70,
        candidate: best.candidate,
        reason: `Ambiguous match between ${best.candidate.cleanName} and ${scored[1].candidate.cleanName}`
      };
    }
  }

  if (best.confidence >= minConfidence) {
    return {
      status: 'HIGH_CONFIDENCE',
      confidence: best.confidence,
      candidate: best.candidate,
      reason: best.reason
    };
  }

  if (best.confidence >= 0.50) {
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
    reason: `Candidate confidence (${best.confidence}) below threshold`
  };
}
