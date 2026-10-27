import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoriesMode,
  toUtcEpoch,
  formatMatchResultBadge,
  formatKickoffLocal,
  StoriesRound,
  MatchStoryItem,
  detectCurrentAndNextRounds,
} from './storiesMode';

// Helper to create mock match
function mockMatch(
  id: string,
  homeName: string,
  awayName: string,
  status: MatchStoryItem['status'],
  homeScore: number | null = null,
  awayScore: number | null = null,
  extra: Partial<MatchStoryItem> = {}
): MatchStoryItem {
  return {
    id,
    homeName,
    awayName,
    status,
    homeScore,
    awayScore,
    kickoff: '2026-10-24T15:00:00Z',
    ...extra,
  };
}

test('1. Round unfinished: returns default mode when a match is still in progress (live)', () => {
  const round: StoriesRound = {
    name: 'Matchday 9',
    matches: [
      mockMatch('1', 'Arsenal', 'Chelsea', 'ft', 2, 1),
      mockMatch('2', 'Liverpool', 'Everton', 'ft', 3, 0),
      mockMatch('3', 'Man City', 'Tottenham', 'live', 1, 1, { statusDetail: "65'" }),
    ],
  };

  const result = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: '2026-10-31T12:30:00Z',
    nowUtc: '2026-10-24T16:30:00Z',
  });

  assert.equal(result.mode, 'default');
  assert.equal(result.reason, 'round_in_progress');
  assert.equal(result.isAllConcluded, false);
});

test('1b. Round unfinished: returns default mode when a match is upcoming (up)', () => {
  const round: StoriesRound = {
    name: 'Matchday 9',
    matches: [
      mockMatch('1', 'Arsenal', 'Chelsea', 'ft', 2, 1),
      mockMatch('2', 'Liverpool', 'Everton', 'ft', 1, 0),
      mockMatch('3', 'Man City', 'Tottenham', 'up', null, null),
    ],
  };

  const result = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: '2026-10-31T12:30:00Z',
    nowUtc: '2026-10-25T14:00:00Z',
  });

  assert.equal(result.mode, 'default');
  assert.equal(result.reason, 'round_has_upcoming_matches');
  assert.equal(result.isAllConcluded, false);
});

test('2. Round finished: returns results mode when all matches have finished status and scores', () => {
  const round: StoriesRound = {
    name: 'Matchday 9',
    matches: [
      mockMatch('1', 'Arsenal', 'Chelsea', 'ft', 2, 1),
      mockMatch('2', 'Liverpool', 'Everton', 'ft', 3, 0),
      mockMatch('3', 'Man City', 'Tottenham', 'ft', 0, 0),
    ],
  };

  // Next round kicks off on 2026-10-31T12:30:00Z (7 days later)
  // Cutoff is 2026-10-30T12:30:00Z
  // Current time is 2026-10-26T10:00:00Z (well before cutoff)
  const result = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: '2026-10-31T12:30:00Z',
    nowUtc: '2026-10-26T10:00:00Z',
  });

  assert.equal(result.mode, 'results');
  assert.equal(result.reason, 'all_matches_finished');
  assert.equal(result.finishedCount, 3);
  assert.equal(result.isAllConcluded, true);
  assert.equal(result.cutoffTimeUtc, '2026-10-30T12:30:00.000Z');
});

test('3. Exactly at the 24h boundary: switches back to default mode', () => {
  const round: StoriesRound = {
    name: 'Matchday 9',
    matches: [
      mockMatch('1', 'Arsenal', 'Chelsea', 'ft', 2, 1),
      mockMatch('2', 'Liverpool', 'Everton', 'ft', 3, 0),
    ],
  };

  const nextKickoff = '2026-10-31T12:00:00Z';
  const nextKickoffMs = Date.parse(nextKickoff); // 12:00 UTC
  const cutoffMs = nextKickoffMs - 24 * 60 * 60 * 1000; // 2026-10-30T12:00:00Z

  // 1 second BEFORE the 24h cutoff -> STILL in results mode
  const beforeCutoffResult = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: nextKickoff,
    nowUtc: cutoffMs - 1000,
  });
  assert.equal(beforeCutoffResult.mode, 'results');

  // EXACTLY at the 24h boundary (now === cutoff) -> SWITCHES to default mode
  const exactBoundaryResult = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: nextKickoff,
    nowUtc: cutoffMs,
  });
  assert.equal(exactBoundaryResult.mode, 'default');
  assert.equal(exactBoundaryResult.reason, 'next_round_within_24h');

  // 1 hour after the cutoff (23h before next kickoff) -> default mode
  const afterBoundaryResult = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: nextKickoff,
    nowUtc: cutoffMs + 3600000,
  });
  assert.equal(afterBoundaryResult.mode, 'default');
  assert.equal(afterBoundaryResult.reason, 'next_round_within_24h');
});

test('4. No next round scheduled: stays in results mode until next round is scheduled', () => {
  const round: StoriesRound = {
    name: 'Season Finale',
    matches: [
      mockMatch('1', 'Arsenal', 'Chelsea', 'ft', 1, 0),
      mockMatch('2', 'Liverpool', 'Everton', 'ft', 2, 2),
    ],
  };

  const resultNull = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: null,
    nowUtc: '2026-11-15T18:00:00Z',
  });
  assert.equal(resultNull.mode, 'results');
  assert.equal(resultNull.reason, 'no_next_round_scheduled');
  assert.equal(resultNull.cutoffTimeUtc, null);

  const resultUndefined = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: undefined,
  });
  assert.equal(resultUndefined.mode, 'results');
});

test('5. Postponed & cancelled matches: do not block round completion if all played matches are finished', () => {
  const round: StoriesRound = {
    name: 'Matchday 14',
    matches: [
      mockMatch('1', 'Arsenal', 'Wolves', 'ft', 2, 0),
      mockMatch('2', 'Aston Villa', 'Brighton', 'ft', 1, 1),
      mockMatch('3', 'Newcastle', 'Crystal Palace', 'postponed', null, null, { statusDetail: 'Postponed' }),
      mockMatch('4', 'Bournemouth', 'Luton', 'cancelled', null, null, { statusDetail: 'Cancelled' }),
    ],
  };

  const result = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: '2026-11-05T15:00:00Z',
    nowUtc: '2026-10-30T10:00:00Z',
  });

  assert.equal(result.mode, 'results');
  assert.equal(result.isAllConcluded, true);
  assert.equal(result.finishedCount, 2);
  assert.equal(result.postponedCount, 1);
  assert.equal(result.cancelledCount, 1);
});

test('5b. Postponed match does NOT allow results mode if another match is still in progress', () => {
  const round: StoriesRound = {
    name: 'Matchday 14',
    matches: [
      mockMatch('1', 'Arsenal', 'Wolves', 'ft', 2, 0),
      mockMatch('2', 'Aston Villa', 'Brighton', 'live', 1, 0),
      mockMatch('3', 'Newcastle', 'Crystal Palace', 'postponed', null, null),
    ],
  };

  const result = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: '2026-11-05T15:00:00Z',
    nowUtc: '2026-10-30T10:00:00Z',
  });

  assert.equal(result.mode, 'default');
  assert.equal(result.reason, 'round_in_progress');
});

test('6. Match result badge formatting handles extra time and penalties', () => {
  // Regular full time
  const ftMatch = mockMatch('1', 'Real Madrid', 'Barcelona', 'ft', 3, 2, { statusDetail: 'FT' });
  const ftBadge = formatMatchResultBadge(ftMatch);
  assert.equal(ftBadge.badge, 'FINAL RESULT');
  assert.equal(ftBadge.scoreText, '3 – 2');
  assert.equal(ftBadge.isExtraTime, false);
  assert.equal(ftBadge.isPenalties, false);

  // Extra time (AET)
  const aetMatch = mockMatch('2', 'PSG', 'Bayern', 'ft', 2, 1, { statusDetail: 'AET' });
  const aetBadge = formatMatchResultBadge(aetMatch);
  assert.equal(aetBadge.badge, 'AFTER EXTRA TIME (AET)');
  assert.equal(aetBadge.isExtraTime, true);
  assert.equal(aetBadge.scoreText, '2 – 1');

  // Penalty shootout
  const penMatch = mockMatch('3', 'Inter', 'Juventus', 'ft', 1, 1, {
    statusDetail: 'FT-PEN',
    homeShootoutScore: 5,
    awayShootoutScore: 4,
  });
  const penBadge = formatMatchResultBadge(penMatch);
  assert.equal(penBadge.badge, 'AFTER PENALTIES');
  assert.equal(penBadge.isPenalties, true);
  assert.equal(penBadge.shootoutText, '(5 – 4 on pens)');

  // Postponed match badge
  const postMatch = mockMatch('4', 'Celtic', 'Rangers', 'postponed', null, null, { statusDetail: 'Postponed' });
  const postBadge = formatMatchResultBadge(postMatch);
  assert.equal(postBadge.badge, 'POSTPONED');
  assert.equal(postBadge.isPostponed, true);
  assert.equal(postBadge.scoreText, 'POSTP.');
});

test('7. Timezone safety: all cutoff comparisons use UTC regardless of input formats', () => {
  const round: StoriesRound = {
    name: 'Round 10',
    matches: [mockMatch('1', 'Milan', 'Roma', 'ft', 2, 0)],
  };

  // Next round at 2026-11-01T20:00:00Z -> Cutoff is 2026-10-31T20:00:00Z
  const nextKickoffIso = '2026-11-01T20:00:00Z';
  const cutoffEpoch = Date.parse('2026-10-31T20:00:00Z');

  // Input as Date object
  const resDate = getStoriesMode({
    currentRound: round,
    nextRoundFirstKickoffUtc: nextKickoffIso,
    nowUtc: new Date(cutoffEpoch - 10000),
  });
  assert.equal(resDate.mode, 'results');
});

test('8. Calendar clustering groups matches across multiple kickoff days into rounds and finds next kickoff', () => {
  const calendar = [
    '2026-10-23T19:00Z', // Friday
    '2026-10-24T14:00Z', // Saturday
    '2026-10-25T16:30Z', // Sunday
    '2026-10-26T20:00Z', // Monday (round 1 ends)
    '2026-10-30T19:00Z', // Friday (round 2 starts)
    '2026-10-31T14:00Z',
    '2026-11-01T16:30Z',
  ];

  // Test during round 1
  const midRound = detectCurrentAndNextRounds(calendar, '2026-10-24T18:00:00Z');
  assert.ok(midRound.currentCluster);
  assert.equal(midRound.currentCluster?.dates.length, 4);
  assert.equal(midRound.nextKickoffUtc, '2026-10-30T19:00:00.000Z');

  // Test between round 1 and round 2 (e.g. Wednesday 2026-10-28)
  const betweenRounds = detectCurrentAndNextRounds(calendar, '2026-10-28T12:00:00Z');
  assert.ok(betweenRounds.currentCluster);
  assert.equal(betweenRounds.currentCluster?.dates[0], '2026-10-23');
  assert.equal(betweenRounds.nextKickoffUtc, '2026-10-30T19:00:00.000Z');

  // Next round kicks off on 2026-10-30T19:00Z.
  // 24 hours before is 2026-10-29T19:00Z.
  // When all matches of round 1 are finished:
  const round1Matches: MatchStoryItem[] = [
    mockMatch('m1', 'Team A', 'Team B', 'ft', 2, 1, { kickoff: '2026-10-23T19:00Z' }),
    mockMatch('m2', 'Team C', 'Team D', 'ft', 0, 0, { kickoff: '2026-10-24T14:00Z' }),
    mockMatch('m3', 'Team E', 'Team F', 'ft', 3, 2, { kickoff: '2026-10-25T16:30Z' }),
    mockMatch('m4', 'Team G', 'Team H', 'ft', 1, 0, { kickoff: '2026-10-26T20:00Z' }),
  ];

  // On Oct 27 (well within the results window):
  const modeOct27 = getStoriesMode({
    currentRound: { name: 'Matchday 9', matches: round1Matches },
    nextRoundFirstKickoffUtc: betweenRounds.nextKickoffUtc,
    nowUtc: '2026-10-27T10:00:00Z',
  });
  assert.equal(modeOct27.mode, 'results');

  // On Oct 29 at 18:59:59Z (1 second before 24h cutoff): STILL results
  const modeJustBefore = getStoriesMode({
    currentRound: { name: 'Matchday 9', matches: round1Matches },
    nextRoundFirstKickoffUtc: betweenRounds.nextKickoffUtc,
    nowUtc: '2026-10-29T18:59:59Z',
  });
  assert.equal(modeJustBefore.mode, 'results');

  // On Oct 29 at 19:00:00Z (exactly 24h before kickoff): Switches to DEFAULT mode!
  const modeAtCutoff = getStoriesMode({
    currentRound: { name: 'Matchday 9', matches: round1Matches },
    nextRoundFirstKickoffUtc: betweenRounds.nextKickoffUtc,
    nowUtc: '2026-10-29T19:00:00Z',
  });
  assert.equal(modeAtCutoff.mode, 'default');
  assert.equal(modeAtCutoff.reason, 'next_round_within_24h');
});

