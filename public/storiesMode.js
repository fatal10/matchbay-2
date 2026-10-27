/**
 * MatchBay Stories Mode Engine (Browser / UMD)
 *
 * Implements round detection, match results story presentation,
 * and the 24-hour next-round kickoff cutoff window.
 */
(function (root, factory) {
  var exp = factory();
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = exp;
  }
  if (typeof define === 'function' && define.amd) {
    define(function () { return exp; });
  }
  if (root) {
    root.StoriesModeEngine = exp;
    root.getStoriesMode = exp.getStoriesMode;
    root.toUtcEpoch = exp.toUtcEpoch;
    root.formatMatchResultBadge = exp.formatMatchResultBadge;
    root.formatKickoffLocal = exp.formatKickoffLocal;
    root.extractScorers = exp.extractScorers;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var MS_PER_HOUR = 60 * 60 * 1000;
  var CUTOFF_WINDOW_MS = 24 * MS_PER_HOUR; // 24 hours

  function toUtcEpoch(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (value instanceof Date) {
      var time = value.getTime();
      return Number.isFinite(time) ? time : null;
    }
    if (typeof value === 'string') {
      var parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  function getStoriesMode(options) {
    var currentRound = options ? options.currentRound : null;
    var nowEpoch = toUtcEpoch(options ? options.nowUtc : null);
    if (nowEpoch === null) nowEpoch = Date.now();

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

    var matches = Array.isArray(currentRound.matches) ? currentRound.matches : [];
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

    var finishedCount = 0;
    var postponedCount = 0;
    var cancelledCount = 0;
    var hasLive = false;
    var hasUpcoming = false;

    for (var i = 0; i < matches.length; i++) {
      var m = matches[i];
      var status = m.status;
      if (status === 'live') {
        hasLive = true;
      } else if (status === 'up') {
        hasUpcoming = true;
      } else if (status === 'postponed') {
        postponedCount++;
      } else if (status === 'cancelled') {
        cancelledCount++;
      } else if (status === 'ft') {
        if (m.homeScore !== null && m.awayScore !== null && Number.isFinite(Number(m.homeScore)) && Number.isFinite(Number(m.awayScore))) {
          finishedCount++;
        } else {
          hasUpcoming = true;
        }
      } else {
        hasUpcoming = true;
      }
    }

    if (hasLive) {
      return {
        mode: 'default',
        reason: 'round_in_progress',
        finishedCount: finishedCount,
        postponedCount: postponedCount,
        cancelledCount: cancelledCount,
        totalMatches: matches.length,
        isAllConcluded: false,
      };
    }

    if (hasUpcoming) {
      return {
        mode: 'default',
        reason: 'round_has_upcoming_matches',
        finishedCount: finishedCount,
        postponedCount: postponedCount,
        cancelledCount: cancelledCount,
        totalMatches: matches.length,
        isAllConcluded: false,
      };
    }

    if (finishedCount === 0) {
      return {
        mode: 'default',
        reason: 'no_matches_with_score',
        finishedCount: finishedCount,
        postponedCount: postponedCount,
        cancelledCount: cancelledCount,
        totalMatches: matches.length,
        isAllConcluded: false,
      };
    }

    var nextKickoffEpoch = toUtcEpoch(options ? options.nextRoundFirstKickoffUtc : null);

    if (nextKickoffEpoch === null) {
      return {
        mode: 'results',
        reason: 'no_next_round_scheduled',
        cutoffTimeUtc: null,
        nextKickoffUtc: null,
        finishedCount: finishedCount,
        postponedCount: postponedCount,
        cancelledCount: cancelledCount,
        totalMatches: matches.length,
        isAllConcluded: true,
      };
    }

    var cutoffEpoch = nextKickoffEpoch - CUTOFF_WINDOW_MS;
    var cutoffIso = new Date(cutoffEpoch).toISOString();
    var nextKickoffIso = new Date(nextKickoffEpoch).toISOString();

    if (nowEpoch < cutoffEpoch) {
      return {
        mode: 'results',
        reason: 'all_matches_finished',
        cutoffTimeUtc: cutoffIso,
        nextKickoffUtc: nextKickoffIso,
        finishedCount: finishedCount,
        postponedCount: postponedCount,
        cancelledCount: cancelledCount,
        totalMatches: matches.length,
        isAllConcluded: true,
      };
    }

    return {
      mode: 'default',
      reason: 'next_round_within_24h',
      cutoffTimeUtc: cutoffIso,
      nextKickoffUtc: nextKickoffIso,
      finishedCount: finishedCount,
      postponedCount: postponedCount,
      cancelledCount: cancelledCount,
      totalMatches: matches.length,
      isAllConcluded: true,
    };
  }

  function formatMatchResultBadge(match) {
    var detail = String(match.statusDetail || '').toUpperCase();
    var isPostponed = match.status === 'postponed' || detail.indexOf('POSTPONED') !== -1;
    var isCancelled = match.status === 'cancelled' || detail.indexOf('CANCEL') !== -1;
    var isPenalties =
      detail.indexOf('PEN') !== -1 ||
      detail.indexOf('SHOOTOUT') !== -1 ||
      (match.homeShootoutScore != null && match.awayShootoutScore != null);
    var isExtraTime = detail.indexOf('AET') !== -1 || detail.indexOf('EXTRA') !== -1 || detail.indexOf('ET') !== -1;

    var badge = 'FINAL RESULT';
    if (isPostponed) {
      badge = 'POSTPONED';
    } else if (isCancelled) {
      badge = 'CANCELLED';
    } else if (isPenalties) {
      badge = 'AFTER PENALTIES';
    } else if (isExtraTime) {
      badge = 'AFTER EXTRA TIME (AET)';
    }

    var scoreText = '—';
    if (!isPostponed && !isCancelled && match.homeScore !== null && match.awayScore !== null) {
      scoreText = match.homeScore + ' – ' + match.awayScore;
    } else if (isPostponed) {
      scoreText = 'POSTP.';
    } else if (isCancelled) {
      scoreText = 'CANC.';
    }

    var shootoutText = undefined;
    if (isPenalties && match.homeShootoutScore != null && match.awayShootoutScore != null) {
      shootoutText = '(' + match.homeShootoutScore + ' – ' + match.awayShootoutScore + ' on pens)';
    }

    return {
      badge: badge,
      isExtraTime: isExtraTime,
      isPenalties: isPenalties,
      isPostponed: isPostponed,
      isCancelled: isCancelled,
      scoreText: scoreText,
      shootoutText: shootoutText,
    };
  }

  function formatKickoffLocal(kickoffUtc) {
    if (!kickoffUtc) return 'Date unavailable';
    try {
      var d = new Date(kickoffUtc);
      if (!Number.isFinite(d.getTime())) return 'Date unavailable';
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Date unavailable';
    }
  }

  function extractScorers(match) {
    var scorers = [];
    if (!match) return scorers;

    if (Array.isArray(match.timeline)) {
      match.timeline.forEach(function (item) {
        if (item.scoringPlay || (item.text && item.text.indexOf('Goal') !== -1)) {
          var player = item.athleteName || (item.playerName ? item.playerName.split(' · ')[0] : 'Goal');
          scorers.push({
            minute: item.minute || '',
            player: player,
            team: item.side === 'away' ? 'away' : 'home',
            isPenalty: Boolean(item.penaltyKick),
            isOwnGoal: Boolean(item.ownGoal),
          });
        }
      });
    }

    var raw = match.raw;
    var rawDetails = (raw && raw.competitions && raw.competitions[0] && raw.competitions[0].details) || (raw && raw.details);
    if (Array.isArray(rawDetails) && scorers.length === 0) {
      var homeTeamId = '';
      try {
        var comps = raw.competitions[0].competitors;
        for (var i = 0; i < comps.length; i++) {
          if (comps[i].homeAway === 'home') {
            homeTeamId = String(comps[i].team && comps[i].team.id ? comps[i].team.id : '');
            break;
          }
        }
      } catch (e) {}

      rawDetails.forEach(function (d) {
        if (d.scoringPlay || (d.type && d.type.id === '70') || (d.type && d.type.text && d.type.text.toLowerCase().indexOf('goal') !== -1)) {
          var teamId = String(d.team && d.team.id ? d.team.id : '');
          var side = teamId && homeTeamId && teamId === homeTeamId ? 'home' : 'away';
          var player = (d.athletesInvolved && d.athletesInvolved[0] && d.athletesInvolved[0].displayName) || (d.athlete && d.athlete.displayName) || 'Goal';
          scorers.push({
            minute: (d.clock && d.clock.displayValue) || '',
            player: player,
            team: side,
            isPenalty: Boolean(d.penaltyKick),
            isOwnGoal: Boolean(d.ownGoal),
          });
        }
      });
    }

    return scorers;
  }

  function clusterCalendarDates(calendar) {
    if (!Array.isArray(calendar) || calendar.length === 0) return [];

    var parsedDates = [];
    for (var i = 0; i < calendar.length; i++) {
      var entry = calendar[i];
      if (typeof entry === 'string') {
        var ep = Date.parse(entry);
        if (Number.isFinite(ep)) {
          var d = new Date(ep);
          var iso = d.toISOString().slice(0, 10);
          parsedDates.push({ dateISO: iso, startEpoch: ep, endEpoch: ep + 24 * 3600 * 1000 });
        }
      } else if (entry && typeof entry === 'object') {
        var s = entry.startDate ? Date.parse(entry.startDate) : NaN;
        var e = entry.endDate ? Date.parse(entry.endDate) : NaN;
        if (Number.isFinite(s)) {
          var isoObj = new Date(s).toISOString().slice(0, 10);
          parsedDates.push({ dateISO: isoObj, startEpoch: s, endEpoch: Number.isFinite(e) ? e : s + 24 * 3600 * 1000 });
        }
      }
    }

    parsedDates.sort(function (a, b) { return a.startEpoch - b.startEpoch; });
    if (parsedDates.length === 0) return [];

    var clusters = [];
    var currentDates = [];
    var clusterStart = parsedDates[0].startEpoch;
    var clusterEnd = parsedDates[0].endEpoch;

    for (var j = 0; j < parsedDates.length; j++) {
      var item = parsedDates[j];
      if (j === 0) {
        currentDates.push(item.dateISO);
        continue;
      }

      var prev = parsedDates[j - 1];
      var gapMs = item.startEpoch - prev.endEpoch;
      var gapDays = gapMs / (24 * 3600 * 1000);

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

  function detectCurrentAndNextRounds(calendar, nowUtc) {
    var clusters = clusterCalendarDates(calendar);
    if (clusters.length === 0) {
      return { currentCluster: null, nextCluster: null, nextKickoffUtc: null };
    }

    var nowEpoch = toUtcEpoch(nowUtc);
    if (nowEpoch === null) nowEpoch = Date.now();

    if (nowEpoch < clusters[0].startEpoch) {
      return {
        currentCluster: clusters[0],
        nextCluster: clusters[1] || null,
        nextKickoffUtc: (clusters[1] && clusters[1].startDate) || null,
      };
    }

    for (var i = 0; i < clusters.length; i++) {
      var c = clusters[i];
      var nextC = clusters[i + 1] || null;

      if (nowEpoch >= c.startEpoch && nowEpoch <= c.endEpoch) {
        return {
          currentCluster: c,
          nextCluster: nextC,
          nextKickoffUtc: (nextC && nextC.startDate) || null,
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

    var last = clusters[clusters.length - 1];
    return {
      currentCluster: last,
      nextCluster: null,
      nextKickoffUtc: null,
    };
  }

  return {
    getStoriesMode: getStoriesMode,
    toUtcEpoch: toUtcEpoch,
    formatMatchResultBadge: formatMatchResultBadge,
    formatKickoffLocal: formatKickoffLocal,
    extractScorers: extractScorers,
    clusterCalendarDates: clusterCalendarDates,
    detectCurrentAndNextRounds: detectCurrentAndNextRounds,
  };
});
