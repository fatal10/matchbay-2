/**
 * Match Details Adapter (Browser & Node compatible)
 * Provides pure logic for parsing formations, calculating pitch positions,
 * ordering events, formatting stats, and adapting match summary data.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MatchDetailsAdapter = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function parseClockMinute(minuteStr) {
    if (minuteStr == null) return 0;
    const str = String(minuteStr).trim().replace(/'/g, '');
    if (!str) return 0;
    if (str.toUpperCase() === 'HT') return 45.999;
    if (str.toUpperCase() === 'FT') return 999;

    if (str.includes('+')) {
      const parts = str.split('+');
      const base = parseFloat(parts[0]) || 0;
      const added = parseFloat(parts[1]) || 0;
      return base + added * 0.01;
    }

    const num = parseFloat(str);
    return Number.isFinite(num) ? num : 0;
  }

  function extractSurname(fullName, lastName) {
    if (lastName && lastName.trim()) return lastName.trim();
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || fullName;
  }

  function parseFormation(formationStr) {
    if (!formationStr || typeof formationStr !== 'string') return null;
    const clean = formationStr.trim().replace(/[^\d-]/g, '');
    if (!clean) return null;
    const parts = clean.split('-').map(function (n) { return parseInt(n, 10); }).filter(function (n) { return !isNaN(n) && n > 0; });
    if (parts.length < 2) return null;

    const outfieldCount = parts.reduce(function (acc, curr) { return acc + curr; }, 0);
    if (outfieldCount !== 10) return null;

    return [1].concat(parts);
  }

  function groupPlayersByPosition(players) {
    let gks = 0;
    let defs = 0;
    let mids = 0;
    let fwds = 0;

    players.forEach(function (p) {
      const pos = (p.position || p.pos || '').toUpperCase();
      if (pos.includes('G') || pos.includes('KEEP')) {
        gks++;
      } else if (pos.includes('D') || pos.includes('BACK') || pos.includes('DEF') || pos.includes('CB') || pos.includes('LB') || pos.includes('RB')) {
        defs++;
      } else if (pos.includes('M') || pos.includes('MID') || pos.includes('CM') || pos.includes('DM') || pos.includes('AM')) {
        mids++;
      } else {
        fwds++;
      }
    });

    if (gks === 0 && players.length > 0) gks = 1;
    const rows = [gks || 1];
    if (defs > 0) rows.push(defs);
    if (mids > 0) rows.push(mids);
    if (fwds > 0) rows.push(fwds);

    const sum = rows.reduce(function (a, b) { return a + b; }, 0);
    if (sum === players.length) return rows;

    return [1, 4, 4, 2];
  }

  function calculatePitchPositions(starters, formationStr, isAway, events) {
    if (!Array.isArray(starters) || starters.length === 0) return [];

    let rowCounts = parseFormation(formationStr);
    if (!rowCounts) {
      rowCounts = groupPlayersByPosition(starters);
    }

    const totalSlots = rowCounts.reduce(function (a, b) { return a + b; }, 0);
    if (totalSlots !== starters.length && starters.length === 11) {
      rowCounts = [1, 4, 3, 3];
    }

    const positions = [];
    let playerIdx = 0;
    const numRows = rowCounts.length;
    const minY = 6;
    const maxY = 45;
    const yStep = numRows > 1 ? (maxY - minY) / (numRows - 1) : 0;

    rowCounts.forEach(function (count, rowIndex) {
      let rowY = minY + rowIndex * yStep;
      if (isAway) {
        rowY = 100 - rowY;
      }

      for (let k = 0; k < count; k++) {
        if (playerIdx >= starters.length) break;
        const raw = starters[playerIdx++];
        const x = ((k + 1) / (count + 1)) * 100;

        const fullName = raw.name || (raw.athlete && (raw.athlete.displayName || raw.athlete.fullName)) || 'Player';
        const surname = raw.surname || extractSurname(fullName, raw.athlete && raw.athlete.lastName);
        const jersey = String(raw.jersey || (raw.athlete && raw.athlete.jersey) || playerIdx);
        const isCaptain = Boolean(raw.isCaptain || raw.captain || (raw.athlete && raw.athlete.captain) || raw.is_captain);

        const badges = {
          goals: 0,
          yellowCard: false,
          redCard: false,
          secondYellow: false,
          subbedOff: Boolean(raw.subbedOut),
          captain: isCaptain,
        };

        if (Array.isArray(raw.plays)) {
          raw.plays.forEach(function (play) {
            if (play.scoringPlay || play.didScore) badges.goals++;
            if (play.yellowCard) {
              if (badges.yellowCard) {
                badges.secondYellow = true;
                badges.redCard = true;
              } else {
                badges.yellowCard = true;
              }
            }
            if (play.redCard) badges.redCard = true;
            if (play.substitution) badges.subbedOff = true;
          });
        }

        if (Array.isArray(events)) {
          events.forEach(function (ev) {
            const evPlayer = ev.playerName || (ev.athlete && ev.athlete.displayName) || '';
            if (evPlayer && (evPlayer.includes(surname) || evPlayer.includes(fullName))) {
              const evType = ((ev.type && ev.type.text) || ev.text || '').toLowerCase();
              if (evType.includes('goal') && !evType.includes('own goal') && !evType.includes('missed')) {
                if (!raw.plays) badges.goals++;
              }
              if (evType.includes('yellow') && !raw.plays) {
                if (badges.yellowCard) {
                  badges.secondYellow = true;
                  badges.redCard = true;
                } else {
                  badges.yellowCard = true;
                }
              }
              if (evType.includes('red') && !raw.plays) badges.redCard = true;
              if (evType.includes('sub') && !raw.plays) badges.subbedOff = true;
            }
          });
        }

        positions.push({
          x: Math.round(x * 10) / 10,
          y: Math.round(rowY * 10) / 10,
          player: {
            id: raw.id || (raw.athlete && raw.athlete.id),
            name: fullName,
            surname: surname,
            jersey: jersey,
            position: (raw.position && (raw.position.name || raw.position.displayName)) || raw.position,
            isCaptain: isCaptain,
          },
          badges: badges,
          isAway: isAway,
        });
      }
    });

    return positions;
  }

  function orderMatchEvents(rawEvents, options) {
    if (!Array.isArray(rawEvents)) return [];
    options = options || {};

    const parsed = [];

    rawEvents.forEach(function (ev) {
      const rawMin = (ev.clock && ev.clock.displayValue) || ev.minute || (ev.clock && ev.clock.value != null ? Math.floor(ev.clock.value / 60) + "'" : '');
      const minuteSort = parseClockMinute(rawMin);

      let type = 'goal';
      const text = ev.text || (ev.type && ev.type.text) || 'Match event';
      const textLower = text.toLowerCase();

      const isPenalty = Boolean(ev.penaltyKick || textLower.includes('penalty'));
      const isOwnGoal = Boolean(ev.ownGoal || textLower.includes('own goal'));
      const isMissed = Boolean(textLower.includes('missed') || textLower.includes('penalty missed'));
      const isRed = Boolean(ev.redCard || textLower.includes('red card'));
      const isYellow = Boolean(ev.yellowCard || textLower.includes('yellow card'));
      const isSub = Boolean(ev.substitution || textLower.includes('substitution'));
      const isVar = Boolean(textLower.includes('var'));

      if (isMissed) {
        type = 'missed-penalty';
      } else if (isOwnGoal) {
        type = 'own-goal';
      } else if (isPenalty) {
        type = 'penalty';
      } else if (ev.scoringPlay || (ev.type && ev.type.id === '70') || textLower.includes('goal')) {
        type = 'goal';
      } else if (isRed) {
        type = textLower.includes('second yellow') ? 'second-yellow' : 'red-card';
      } else if (isYellow) {
        type = 'yellow-card';
      } else if (isSub) {
        type = 'substitution';
      } else if (isVar) {
        type = 'var';
      }

      const athlete = (ev.athletesInvolved && ev.athletesInvolved[0]) || ev.athlete || {};
      const athleteName = athlete.displayName || athlete.fullName || ev.playerName || '';

      let detail = '';
      if (ev.assist) {
        detail = 'Assist: ' + ev.assist;
      } else if (ev.athletesInvolved && ev.athletesInvolved.length > 1) {
        const second = ev.athletesInvolved[1];
        if (type === 'substitution') {
          detail = 'Out: ' + (second.displayName || second.fullName || 'Player');
        } else if (type === 'goal') {
          detail = 'Assist: ' + (second.displayName || second.fullName);
        }
      } else if (ev.subbedOutPlayer) {
        detail = 'Out: ' + ev.subbedOutPlayer;
      } else if (ev.assistPlayer) {
        detail = 'Assist: ' + ev.assistPlayer;
      }

      let side = 'home';
      if (ev.side === 'away' || ev.homeAway === 'away' || (ev.team && ev.team.homeAway === 'away') || ev.isAway) {
        side = 'away';
      } else if (ev.side === 'home' || ev.homeAway === 'home' || (ev.team && ev.team.homeAway === 'home') || ev.isHome) {
        side = 'home';
      }

      parsed.push({
        minute: rawMin ? (String(rawMin).includes("'") ? String(rawMin) : rawMin + "'") : '',
        minuteSort: minuteSort,
        side: side,
        type: type,
        playerName: athleteName,
        detail: detail,
        text: text,
      });
    });

    parsed.sort(function (a, b) { return a.minuteSort - b.minuteSort; });

    const result = [];
    let htInserted = false;
    const hasSecondHalfEvents = parsed.some(function (e) { return e.minuteSort > 45; });

    parsed.forEach(function (ev) {
      if (!htInserted && ev.minuteSort >= 46) {
        const htScore =
          options.homeScoreHT != null && options.awayScoreHT != null
            ? 'Half time ' + options.homeScoreHT + '-' + options.awayScoreHT
            : 'Half time';
        result.push({
          minute: 'HT',
          minuteSort: 45.999,
          side: 'center',
          type: 'separator',
          text: htScore,
          isSeparator: true,
        });
        htInserted = true;
      }
      result.push(ev);
    });

    if (!htInserted && (hasSecondHalfEvents || options.isFinished || options.isLive)) {
      const htScore =
        options.homeScoreHT != null && options.awayScoreHT != null
          ? 'Half time ' + options.homeScoreHT + '-' + options.awayScoreHT
          : 'Half time';
      result.push({
        minute: 'HT',
        minuteSort: 45.5,
        side: 'center',
        type: 'separator',
        text: htScore,
        isSeparator: true,
      });
    }

    if (options.isFinished) {
      result.push({
        minute: 'FT',
        minuteSort: 999,
        side: 'center',
        type: 'separator',
        text: 'Full time',
        isSeparator: true,
      });
    }

    return result;
  }

  function formatMatchStats(statistics) {
    if (!Array.isArray(statistics)) return [];

    return statistics
      .map(function (s) {
        const label = s.label || s.name || '';
        const homeRaw = s.home !== undefined ? s.home : (s.homeValue !== undefined ? s.homeValue : '');
        const awayRaw = s.away !== undefined ? s.away : (s.awayValue !== undefined ? s.awayValue : '');

        const isPercent = label.includes('%') || String(homeRaw).includes('%');
        const cleanLabel = label.replace(/\s*\(%\)/i, '');

        const homeVal = parseFloat(String(homeRaw).replace('%', '')) || 0;
        const awayVal = parseFloat(String(awayRaw).replace('%', '')) || 0;
        const total = homeVal + awayVal;

        let homePct = 50;
        let awayPct = 50;
        if (total > 0) {
          homePct = Math.round((homeVal / total) * 100);
          awayPct = 100 - homePct;
        }

        return {
          label: cleanLabel,
          home: isPercent ? homeVal + '%' : homeRaw,
          away: isPercent ? awayVal + '%' : awayRaw,
          homeVal: homeVal,
          awayVal: awayVal,
          homePct: homePct,
          awayPct: awayPct,
          unit: isPercent ? '%' : '',
        };
      })
      .filter(function (s) { return s.label && (s.home !== '' || s.away !== ''); });
  }

  return {
    parseClockMinute: parseClockMinute,
    extractSurname: extractSurname,
    parseFormation: parseFormation,
    groupPlayersByPosition: groupPlayersByPosition,
    calculatePitchPositions: calculatePitchPositions,
    orderMatchEvents: orderMatchEvents,
    formatMatchStats: formatMatchStats,
  };
});
