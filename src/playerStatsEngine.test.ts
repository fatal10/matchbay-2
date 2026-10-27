import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractPlayerStats,
  resolveCurrentCoach,
  isCacheValid,
  adaptClubDetailWithStats,
  CURRENT_COACHES_2026_2027,
} from './playerStatsEngine';

test('extractPlayerStats parses categories correctly from LiveScore/ESPN split structure', () => {
  const mockPlayer = {
    displayName: 'Bukayo Saka',
    statistics: {
      splits: {
        categories: [
          {
            name: 'general',
            stats: [
              { name: 'appearances', value: 24, displayValue: '24' },
              { name: 'yellowCards', value: 3, displayValue: '3' },
              { name: 'redCards', value: 0, displayValue: '0' },
            ],
          },
          {
            name: 'offensive',
            stats: [
              { name: 'totalGoals', value: 12, displayValue: '12' },
              { name: 'goalAssists', value: 9, displayValue: '9' },
              { name: 'shotsOnTarget', value: 34, displayValue: '34' },
            ],
          },
        ],
      },
    },
  };

  const stats = extractPlayerStats(mockPlayer);
  assert.equal(stats.goals, 12);
  assert.equal(stats.assists, 9);
  assert.equal(stats.appearances, 24);
  assert.equal(stats.yellowCards, 3);
  assert.equal(stats.redCards, 0);
  assert.equal(stats.shotsOnTarget, 34);
  assert.ok(stats.minutes > 0, 'Minutes should be non-zero when appearances exist');
});

test('extractPlayerStats handles empty or missing stats gracefully without breaking', () => {
  const statsEmpty = extractPlayerStats(null);
  assert.equal(statsEmpty.goals, 0);
  assert.equal(statsEmpty.assists, 0);
  assert.equal(statsEmpty.appearances, 0);
  assert.equal(statsEmpty.minutes, 0);
  assert.equal(statsEmpty.yellowCards, 0);
  assert.equal(statsEmpty.redCards, 0);

  const statsNoStats = extractPlayerStats({ displayName: 'Young Player' });
  assert.equal(statsNoStats.goals, 0);
});

test('resolveCurrentCoach verifies and fixes 2026/2027 managers', () => {
  // Arsenal: Outdated Wenger in feed -> corrected to Mikel Arteta
  const arsenalCoach = resolveCurrentCoach({ id: '359', name: 'Arsenal' }, 'Arsene Wenger');
  assert.equal(arsenalCoach, 'Mikel Arteta');

  // Bournemouth: Outdated Eddie Howe in feed -> corrected to Andoni Iraola
  const bouCoach = resolveCurrentCoach({ id: '349', name: 'AFC Bournemouth' }, 'Eddie Howe');
  assert.equal(bouCoach, 'Andoni Iraola');

  // Liverpool: Arne Slot
  const livCoach = resolveCurrentCoach({ id: '364', name: 'Liverpool' }, 'Jurgen Klopp');
  assert.equal(livCoach, 'Arne Slot');

  // Barcelona: Hansi Flick
  const barcaCoach = resolveCurrentCoach({ id: '83', name: 'Barcelona' }, 'Xavi Hernandez');
  assert.equal(barcaCoach, 'Hansi Flick');

  // Real Madrid: Carlo Ancelotti
  const rmaCoach = resolveCurrentCoach({ id: '86', name: 'Real Madrid' });
  assert.equal(rmaCoach, 'Carlo Ancelotti');
});

test('isCacheValid accurately tracks 24-hour smart TTL', () => {
  const now = Date.now();
  // 1 hour ago -> valid
  assert.equal(isCacheValid({ lastSyncedAt: now - 3600 * 1000 }), true);
  // 23 hours ago -> valid
  assert.equal(isCacheValid({ lastSyncedAt: now - 23 * 3600 * 1000 }), true);
  // 25 hours ago -> expired
  assert.equal(isCacheValid({ lastSyncedAt: now - 25 * 3600 * 1000 }), false);
  // null or undefined -> invalid
  assert.equal(isCacheValid(null), false);
  assert.equal(isCacheValid({}), false);
});

test('adaptClubDetailWithStats formats complete 2026/2027 roster with stats and verified coach', () => {
  const mockApiJson = {
    club: {
      id: '359',
      name: 'Arsenal',
      logo: 'https://example.com/arsenal.png',
      city: 'London',
      venue: { name: 'Emirates Stadium' },
    },
    coach: [{ id: '5', firstName: 'Arsene', lastName: 'Wenger' }],
    roster: [
      {
        id: '12345',
        displayName: 'Bukayo Saka',
        jersey: '7',
        position: { displayName: 'Forward' },
        citizenship: 'England',
        flag: { href: 'https://example.com/eng.png' },
        age: 25,
        statistics: {
          splits: {
            categories: [
              {
                name: 'offensive',
                stats: [
                  { name: 'totalGoals', value: 8 },
                  { name: 'goalAssists', value: 7 },
                ],
              },
              {
                name: 'general',
                stats: [{ name: 'appearances', value: 18 }],
              },
            ],
          },
        },
      },
    ],
  };

  const adapted = adaptClubDetailWithStats(mockApiJson, 'eng.1');
  assert.equal(adapted.club.name, 'Arsenal');
  assert.equal(adapted.coach, 'Mikel Arteta', 'Coach should be corrected to Mikel Arteta');
  assert.equal(adapted.players.length, 1);
  assert.equal(adapted.players[0].name, 'Bukayo Saka');
  assert.equal(adapted.players[0].jersey, '7');
  assert.equal(adapted.players[0].stats.goals, 8);
  assert.equal(adapted.players[0].stats.assists, 7);
  assert.equal(adapted.players[0].stats.appearances, 18);
  assert.ok(adapted.lastSyncedAt! > 0);
});
