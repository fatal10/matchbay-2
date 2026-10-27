/**
 * MatchBay Stories Mode Engine
 *
 * Implements round detection, match results story presentation,
 * and the 24-hour next-round kickoff cutoff window.
 *
 * Postponed / Cancelled policy:
 * - Cancelled matches ('cancelled') will not be played; they do not block round completion.
 * - Postponed matches ('postponed') are moved outside the round window; they do not block
 *   the round from entering Results mode, and are displayed with a clear "POSTPONED" badge.
 * - Any scheduled ('up') or in-progress ('live') match blocks Results mode (returns 'default').
 */

export interface MatchScorer {
  minute: string;
  player: string;
  team: 'home' | 'away';
  isPenalty?: boolean;
  isOwnGoal?: boolean;
}

export interface MatchStoryItem {
  id: string | number;
  uid?: string;
  leagueSlug?: string;
  competitionName?: string;
  roundName?: string;
  homeName: string;
  awayName: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  homeShootoutScore?: number | null;
  awayShootoutScore?: number | null;
  status: 'ft' | 'live' | 'up' | 'postponed' | 'cancelled' | 'suspended';
  statusDetail?: string; // e.g. "FT", "AET", "PEN", "Postponed", "Cancelled", "HT", "90+2'"
  kickoff: string; // ISO 8601 UTC string (e.g. "2026-10-24T15:00:00Z")
  venue?: string;
  scorers?: MatchScorer[];
  raw?: unknown;
}

export interface StoriesRound {
  id?: string | number;
  name: string; // e.g. "Matchday 28", "Round 5", "Week 10"
  matches: MatchStoryItem[];
}

export interface StoriesModeOptions {
  currentRound: StoriesRound | null | undefined;
  nextRoundFirstKickoffUtc?: string | number | Date | null;
  nowUtc?: string | number | Date;
}

export interface StoriesModeResult {
  mode: 'results' | 'default';
  reason:
    | 'no_current_round'
    | 'round_empty'
    | 'round_in_progress'
    | 'round_has_upcoming_matches'
    | 'no_matches_with_score'
    | 'all_matches_finished'
    | 'no_next_round_scheduled'
    | 'next_round_within_24h';
  cutoffTimeUtc?: string | null;
  nextKickoffUtc?: string | null;
  finishedCount: number;
  postponedCount: number;
  cancelledCount: number;
  totalMatches: number;
  isAllConcluded: boolean;
}

const MS_PER_HOUR = 60 * 60 * 1000;
const CUTOFF_WINDOW_MS = 24 * MS_PER_HOUR; // 24 hours in milliseconds

/**
 * Converts any date representation to UTC milliseconds epoch
 */
export function toUtcEpoch(value?: string | number | Date | null): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Evaluates whether the stories feature should be in "results" mode or "default" mode.
 *
 * Rules:
 * 1. Current round must exist and contain at least one match.
 * 2. If any match is in 'live' or 'up' (scheduled) state, returns 'default'.
 * 3. Cancelled matches do not block the round.
 * 4. Postponed matches do not block the round (displayed as postponed in stories).
 * 5. All other matches must be finished with a final score available.
 * 6. If all are finished, checks nextRoundFirstKickoffUtc:
 *    - If no next round kickoff scheduled -> 'results'.
 *    - Cutoff is: (nextRoundFirstKickoffUtc - 24 hours).
 *    - If nowUtc < cutoff -> 'results'.
 *    - If nowUtc >= cutoff -> 'default' (exactly at 24h boundary or within 24h, back to default).
 */
export function getStoriesMode(options: StoriesModeOptions): StoriesModeResult {
  const currentRound = options?.currentRound;
  const nowEpoch = toUtcEpoch(options?.nowUtc) ?? Date.now();

  if (!currentRound) {
    return {
      mode: 'default',
      reason: 'no_current_round',
      finishedCount: 0,
      postponedCount: 0,
      cancelledCount: 0,
      totalMatches: 0,
      isAllConcluded: false,
    };
  }

  const matches = Array.isArray(currentRound.matches) ? currentRound.matches : [];
  if (matches.length === 0) {
    return {
      mode: 'default',
      reason: 'round_empty',
      finishedCount: 0,
      postponedCount: 0,
      cancelledCount: 0,
      totalMatches: 0,
      isAllConcluded: false,
    };
  }

  let finishedCount = 0;
  let postponedCount = 0;
  let cancelledCount = 0;
  let hasLive = false;
  let hasUpcoming = false;

  for (const m of matches) {
    const status = m.status;
    if (status === 'live') {
      hasLive = true;
    } else if (status === 'up') {
      hasUpcoming = true;
    } else if (status === 'postponed') {
      postponedCount++;
    } else if (status === 'cancelled') {
      cancelledCount++;
    } else if (status === 'ft') {
      // Check that final score is valid numbers
      if (m.homeScore !== null && m.awayScore !== null && Number.isFinite(m.homeScore) && Number.isFinite(m.awayScore)) {
        finishedCount++;
      } else {
        // Without final score, not considered finished
        hasUpcoming = true;
      }
    } else {
      // Any other unhandled or suspended state
      hasUpcoming = true;
    }
  }

  if (hasLive) {
    return {
      mode: 'default',
      reason: 'round_in_progress',
      finishedCount,
      postponedCount,
      cancelledCount,
      totalMatches: matches.length,
      isAllConcluded: false,
    };
  }

  if (hasUpcoming) {
    return {
      mode: 'default',
      reason: 'round_has_upcoming_matches',
      finishedCount,
      postponedCount,
      cancelledCount,
      totalMatches: matches.length,
      isAllConcluded: false,
    };
  }

  // Must have at least one finished match (cannot be all cancelled/postponed without results)
  if (finishedCount === 0) {
    return {
      mode: 'default',
      reason: 'no_matches_with_score',
      finishedCount,
      postponedCount,
      cancelledCount,
      totalMatches: matches.length,
      isAllConcluded: false,
    };
  }

  // All matches are finished or officially postponed/cancelled!
  const nextKickoffEpoch = toUtcEpoch(options?.nextRoundFirstKickoffUtc);

  // If no next round is scheduled yet, stay in results mode indefinitely until scheduled
  if (nextKickoffEpoch === null) {
    return {
      mode: 'results',
      reason: 'no_next_round_scheduled',
      cutoffTimeUtc: null,
      nextKickoffUtc: null,
      finishedCount,
      postponedCount,
      cancelledCount,
      totalMatches: matches.length,
      isAllConcluded: true,
    };
  }

  // Calculate cutoff: exactly 24 hours before next kickoff
  const cutoffEpoch = nextKickoffEpoch - CUTOFF_WINDOW_MS;
  const cutoffIso = new Date(cutoffEpoch).toISOString();
  const nextKickoffIso = new Date(nextKickoffEpoch).toISOString();

  // If now is strictly before the 24h cutoff, show results
  if (nowEpoch < cutoffEpoch) {
    return {
      mode: 'results',
      reason: 'all_matches_finished',
      cutoffTimeUtc: cutoffIso,
      nextKickoffUtc: nextKickoffIso,
      finishedCount,
      postponedCount,
      cancelledCount,
      totalMatches: matches.length,
      isAllConcluded: true,
    };
  }

  // At or after the 24h cutoff boundary (nowEpoch >= cutoffEpoch), switch back to default
  return {
    mode: 'default',
    reason: 'next_round_within_24h',
    cutoffTimeUtc: cutoffIso,
    nextKickoffUtc: nextKickoffIso,
    finishedCount,
    postponedCount,
    cancelledCount,
    totalMatches: matches.length,
    isAllConcluded: true,
  };
}

/**
 * Formats match status for results slides (e.g., FT, AET, PEN, Postponed)
 */
export function formatMatchResultBadge(match: MatchStoryItem): {
  badge: string;
  isExtraTime: boolean;
  isPenalties: boolean;
  isPostponed: boolean;
  isCancelled: boolean;
  scoreText: string;
  shootoutText?: string;
} {
  const detail = (match.statusDetail || '').toUpperCase();
  const isPostponed = match.status === 'postponed' || detail.includes('POSTPONED');
  const isCancelled = match.status === 'cancelled' || detail.includes('CANCEL');
  const isPenalties =
    detail.includes('PEN') ||
    detail.includes('SHOOTOUT') ||
    (match.homeShootoutScore != null && match.awayShootoutScore != null);
  const isExtraTime = detail.includes('AET') || detail.includes('EXTRA') || detail.includes('ET');

  let badge = 'FINAL RESULT';
  if (isPostponed) {
    badge = 'POSTPONED';
  } else if (isCancelled) {
    badge = 'CANCELLED';
  } else if (isPenalties) {
    badge = 'AFTER PENALTIES';
  } else if (isExtraTime) {
    badge = 'AFTER EXTRA TIME (AET)';
  }

  let scoreText = '—';
  if (!isPostponed && !isCancelled && match.homeScore !== null && match.awayScore !== null) {
    scoreText = `${match.homeScore} – ${match.awayScore}`;
  } else if (isPostponed) {
    scoreText = 'POSTP.';
  } else if (isCancelled) {
    scoreText = 'CANC.';
  }

  let shootoutText: string | undefined = undefined;
  if (isPenalties && match.homeShootoutScore != null && match.awayShootoutScore != null) {
    shootoutText = `(${match.homeShootoutScore} – ${match.awayShootoutScore} on pens)`;
  }

  return {
    badge,
    isExtraTime,
    isPenalties,
    isPostponed,
    isCancelled,
    scoreText,
    shootoutText,
  };
}

/**
 * Formats match kickoff timestamp into user's local timezone
 */
export function formatKickoffLocal(kickoffUtc?: string | null): string {
  if (!kickoffUtc) return 'Date unavailable';
  try {
    const d = new Date(kickoffUtc);
    if (!Number.isFinite(d.getTime())) return 'Date unavailable';
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Date unavailable';
  }
}

/**
 * Safely extracts goal scorers from an adapted match event
 */
export function extractScorers(match: { raw?: any; timeline?: any[] }): MatchScorer[] {
  const scorers: MatchScorer[] = [];

  // Check timeline if present
  if (Array.isArray(match.timeline)) {
    match.timeline.forEach((item) => {
      if (item.scoringPlay || (item.text && item.text.includes('Goal'))) {
        const player = item.athleteName || (item.playerName ? item.playerName.split(' · ')[0] : 'Goal');
        scorers.push({
          minute: item.minute || '',
          player,
          team: item.side === 'away' ? 'away' : 'home',
          isPenalty: Boolean(item.penaltyKick),
          isOwnGoal: Boolean(item.ownGoal),
        });
      }
    });
  }

  // Check raw ESPN / LiveScore structure
  const raw = match.raw as any;
  const rawDetails = raw?.competitions?.[0]?.details || raw?.details;
  if (Array.isArray(rawDetails) && scorers.length === 0) {
    const homeTeamId = String(raw?.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.id || '');
    rawDetails.forEach((d) => {
      if (d.scoringPlay || d.type?.id === '70' || (d.type?.text && d.type.text.toLowerCase().includes('goal'))) {
        const teamId = String(d.team?.id || '');
        const side = teamId && homeTeamId && teamId === homeTeamId ? 'home' : 'away';
        const player = d.athletesInvolved?.[0]?.displayName || d.athlete?.displayName || 'Goal';
        scorers.push({
          minute: d.clock?.displayValue || '',
          player,
          team: side,
          isPenalty: Boolean(d.penaltyKick),
          isOwnGoal: Boolean(d.ownGoal),
        });
      }
    });
  }

  return scorers;
}

export interface CalendarCluster {
  index: number;
  dates: string[];
  startDate: string;
  endDate: string;
  startEpoch: number;
  endEpoch: number;
}

/**
 * Clusters league calendar dates into weekly matchday rounds (dates with <= 2.5 day gap)
 */
export function clusterCalendarDates(calendar: Array<string | { startDate?: string; endDate?: string }>): CalendarCluster[] {
  if (!Array.isArray(calendar) || calendar.length === 0) return [];

  const parsedDates: { dateISO: string; startEpoch: number; endEpoch: number }[] = [];
  for (const entry of calendar) {
    if (typeof entry === 'string') {
      const ep = Date.parse(entry);
      if (Number.isFinite(ep)) {
        const d = new Date(ep);
        const iso = d.toISOString().slice(0, 10);
        parsedDates.push({ dateISO: iso, startEpoch: ep, endEpoch: ep + 24 * 3600 * 1000 });
      }
    } else if (entry && typeof entry === 'object') {
      const s = entry.startDate ? Date.parse(entry.startDate) : NaN;
      const e = entry.endDate ? Date.parse(entry.endDate) : NaN;
      if (Number.isFinite(s)) {
        const iso = new Date(s).toISOString().slice(0, 10);
        parsedDates.push({ dateISO: iso, startEpoch: s, endEpoch: Number.isFinite(e) ? e : s + 24 * 3600 * 1000 });
      }
    }
  }

  parsedDates.sort((a, b) => a.startEpoch - b.startEpoch);
  if (parsedDates.length === 0) return [];

  const clusters: CalendarCluster[] = [];
  let currentDates: string[] = [];
  let clusterStart = parsedDates[0].startEpoch;
  let clusterEnd = parsedDates[0].endEpoch;

  for (let i = 0; i < parsedDates.length; i++) {
    const item = parsedDates[i];
    if (i === 0) {
      currentDates.push(item.dateISO);
      continue;
    }

    const prev = parsedDates[i - 1];
    const gapMs = item.startEpoch - prev.endEpoch;
    const gapDays = gapMs / (24 * 3600 * 1000);

    if (gapDays <= 2.5) {
      currentDates.push(item.dateISO);
      clusterEnd = Math.max(clusterEnd, item.endEpoch);
    } else {
      clusters.push({
        index: clusters.length + 1,
        dates: Array.from(new Set(currentDates)),
        startDate: new Date(clusterStart).toISOString(),
        endDate: new Date(clusterEnd).toISOString(),
        startEpoch: clusterStart,
        endEpoch: clusterEnd,
      });
      currentDates = [item.dateISO];
      clusterStart = item.startEpoch;
      clusterEnd = item.endEpoch;
    }
  }

  if (currentDates.length > 0) {
    clusters.push({
      index: clusters.length + 1,
      dates: Array.from(new Set(currentDates)),
      startDate: new Date(clusterStart).toISOString(),
      endDate: new Date(clusterEnd).toISOString(),
      startEpoch: clusterStart,
      endEpoch: clusterEnd,
    });
  }

  return clusters;
}

/**
 * Identifies current round cluster and next round cluster's earliest kickoff
 */
export function detectCurrentAndNextRounds(
  calendar: Array<string | { startDate?: string; endDate?: string }>,
  nowUtc?: string | number | Date
): {
  currentCluster: CalendarCluster | null;
  nextCluster: CalendarCluster | null;
  nextKickoffUtc: string | null;
} {
  const clusters = clusterCalendarDates(calendar);
  if (clusters.length === 0) {
    return { currentCluster: null, nextCluster: null, nextKickoffUtc: null };
  }

  const nowEpoch = toUtcEpoch(nowUtc) ?? Date.now();

  if (nowEpoch < clusters[0].startEpoch) {
    return {
      currentCluster: clusters[0],
      nextCluster: clusters[1] || null,
      nextKickoffUtc: clusters[1]?.startDate || null,
    };
  }

  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    const nextC = clusters[i + 1] || null;

    if (nowEpoch >= c.startEpoch && nowEpoch <= c.endEpoch) {
      return {
        currentCluster: c,
        nextCluster: nextC,
        nextKickoffUtc: nextC?.startDate || null,
      };
    }

    if (nextC && nowEpoch > c.endEpoch && nowEpoch < nextC.startEpoch) {
      return {
        currentCluster: c,
        nextCluster: nextC,
        nextKickoffUtc: nextC.startDate,
      };
    }
  }

  const last = clusters[clusters.length - 1];
  return {
    currentCluster: last,
    nextCluster: null,
    nextKickoffUtc: null,
  };
}

// Global browser window export
if (typeof window !== 'undefined') {
  (window as any).StoriesModeEngine = {
    getStoriesMode,
    toUtcEpoch,
    formatMatchResultBadge,
    formatKickoffLocal,
    extractScorers,
    clusterCalendarDates,
    detectCurrentAndNextRounds,
  };
}

