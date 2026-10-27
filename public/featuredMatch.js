/**
 * MatchBay Featured Match Scoring, Selection, and Formatting (Browser Bundle)
 * Pure logic and configurable weights for selecting the single top match to feature.
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
    root.FeaturedMatch = exp;
    root.FEATURED_WEIGHTS_CONFIG = exp.FEATURED_WEIGHTS_CONFIG;
    root.normalizeName = exp.normalizeName;
    root.getCompetitionWeight = exp.getCompetitionWeight;
    root.getTeamWeight = exp.getTeamWeight;
    root.isDerbyMatch = exp.isDerbyMatch;
    root.computeMatchPopularity = exp.computeMatchPopularity;
    root.pickFeaturedMatch = exp.pickFeaturedMatch;
    root.getKickoffCountdown = exp.getKickoffCountdown;
    root.parseLiveMinute = exp.parseLiveMinute;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var FEATURED_WEIGHTS_CONFIG = {
    // 1. Competition weights
    competitionWeights: {
      'uefa.champions': 100,
      'fifa.world_cup': 100,
      'eng.1': 80, // Premier League
      'esp.1': 80, // LaLiga
      'ger.1': 80, // Bundesliga
      'ita.1': 80, // Serie A
      'fra.1': 80, // Ligue 1
      'uefa.europa': 60, // Europa League
      'uefa.conference': 45,
      'uefa.super_cup': 60,
      'uefa.nations': 50,
      'conmebol.libertadores': 65,
      'conmebol.copa_america': 75,
      'eng.fa': 50, // FA Cup
      'eng.league_cup': 50, // Carabao Cup
      'esp.copa_del_rey': 50, // Copa del Rey
      'ger.dfb_pokal': 50, // DFB-Pokal
      'ita.coppa_italia': 50, // Coppa Italia
      'por.taca_de_portugal': 40,
      'esp.super_cup': 45,
      'eng.charity': 45,
      'eng.2': 35, // Championship
      'ned.1': 35, // Eredivisie
      'por.1': 35, // Primeira Liga
      'ksa.1': 35, // Saudi Pro League
      'usa.1': 35, // MLS
      'bra.1': 35, // Brasileirão
      'arg.1': 35, // Liga Argentina
      'mex.1': 35, // Liga MX
      'tur.1': 35, // Süper Lig
      'bel.1': 30,
      'aut.1': 30,
      'sco.1': 30,
      'jpn.1': 30,
    },
    defaultCompetitionWeight: 20,

    // 2. Team weight points
    tier1TeamBonus: 30,
    tier2TeamBonus: 15,

    tier1Teams: [
      'real madrid',
      'barcelona',
      'manchester city',
      'man city',
      'liverpool',
      'arsenal',
      'manchester united',
      'man united',
      'bayern munich',
      'bayern münchen',
      'bayern',
      'paris saint-germain',
      'psg',
      'juventus',
      'inter milan',
      'internazionale',
      'inter',
      'ac milan',
      'milan',
      'chelsea',
      'atletico madrid',
      'atlético madrid',
      'tottenham hotspur',
      'tottenham',
      'spurs',
      'borussia dortmund',
      'dortmund',
      'bvb',
      'brazil',
      'argentina',
      'france',
      'england',
      'germany',
      'spain',
      'italy',
      'portugal',
      'netherlands',
    ],

    tier2Teams: [
      'aston villa',
      'newcastle united',
      'newcastle',
      'west ham united',
      'west ham',
      'everton',
      'bayer leverkusen',
      'leverkusen',
      'rb leipzig',
      'eintracht frankfurt',
      'vfb stuttgart',
      'napoli',
      'as roma',
      'roma',
      'lazio',
      'atalanta',
      'fiorentina',
      'marseille',
      'monaco',
      'lyon',
      'lille',
      'sporting cp',
      'sporting',
      'benfica',
      'porto',
      'fc porto',
      'ajax',
      'psv eindhoven',
      'psv',
      'feyenoord',
      'celtic',
      'rangers',
      'galatasaray',
      'fenerbahce',
      'fenerbahçe',
      'besiktas',
      'beşiktaş',
      'al nassr',
      'al hilal',
      'al ittihad',
      'al ahli',
      'inter miami',
      'la galaxy',
      'lafc',
      'seattle sounders',
      'boca juniors',
      'river plate',
      'flamengo',
      'palmeiras',
      'corinthians',
      'sao paulo',
      'são paulo',
      'america',
      'américa',
      'chivas',
      'guadalajara',
      'cruz azul',
      'tigres',
      'monterrey',
    ],

    // 3. Derby or rivalry pairs (+20 points)
    derbyBonus: 20,
    rivalries: [
      ['real madrid', 'barcelona'],
      ['real madrid', 'atletico madrid'],
      ['real madrid', 'atlético madrid'],
      ['barcelona', 'espanyol'],
      ['manchester united', 'manchester city'],
      ['man united', 'man city'],
      ['manchester united', 'liverpool'],
      ['man united', 'liverpool'],
      ['arsenal', 'tottenham hotspur'],
      ['arsenal', 'tottenham'],
      ['arsenal', 'spurs'],
      ['arsenal', 'chelsea'],
      ['chelsea', 'tottenham hotspur'],
      ['chelsea', 'tottenham'],
      ['liverpool', 'everton'],
      ['bayern munich', 'borussia dortmund'],
      ['bayern', 'borussia dortmund'],
      ['bayern', 'dortmund'],
      ['inter milan', 'ac milan'],
      ['inter', 'milan'],
      ['internazionale', 'milan'],
      ['juventus', 'inter milan'],
      ['juventus', 'inter'],
      ['juventus', 'internazionale'],
      ['juventus', 'ac milan'],
      ['juventus', 'milan'],
      ['as roma', 'lazio'],
      ['roma', 'lazio'],
      ['paris saint-germain', 'marseille'],
      ['psg', 'marseille'],
      ['celtic', 'rangers'],
      ['ajax', 'feyenoord'],
      ['benfica', 'sporting cp'],
      ['benfica', 'sporting'],
      ['fc porto', 'benfica'],
      ['porto', 'benfica'],
      ['galatasaray', 'fenerbahce'],
      ['galatasaray', 'fenerbahçe'],
      ['al hilal', 'al nassr'],
      ['boca juniors', 'river plate'],
      ['flamengo', 'fluminense'],
      ['corinthians', 'palmeiras'],
      ['america', 'chivas'],
      ['américa', 'guadalajara'],
    ],

    feedHighlightBonus: 15,
  };

  function normalizeName(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function getCompetitionWeight(competitionSlug, competitionName, config) {
    if (!config) config = FEATURED_WEIGHTS_CONFIG;
    var slug = String(competitionSlug || '').trim().toLowerCase();
    if (config.competitionWeights[slug] !== undefined) {
      return config.competitionWeights[slug];
    }

    var normName = normalizeName(competitionName);
    if (normName.indexOf('champions league') !== -1 || normName.indexOf('world cup') !== -1) {
      return 100;
    }
    if (
      normName.indexOf('premier league') !== -1 ||
      normName.indexOf('laliga') !== -1 ||
      normName.indexOf('la liga') !== -1 ||
      normName.indexOf('serie a') !== -1 ||
      normName.indexOf('bundesliga') !== -1 ||
      normName.indexOf('ligue 1') !== -1
    ) {
      return 80;
    }
    if (normName.indexOf('europa league') !== -1) {
      return 60;
    }
    if (
      normName.indexOf('cup') !== -1 ||
      normName.indexOf('copa') !== -1 ||
      normName.indexOf('pokal') !== -1 ||
      normName.indexOf('coupe') !== -1 ||
      normName.indexOf('taca') !== -1
    ) {
      return 50;
    }

    return config.defaultCompetitionWeight;
  }

  function getTeamWeight(teamName, config) {
    if (!config) config = FEATURED_WEIGHTS_CONFIG;
    var norm = normalizeName(teamName);
    if (!norm) return 0;

    var i, t, normT;
    for (i = 0; i < config.tier1Teams.length; i++) {
      t = config.tier1Teams[i];
      normT = normalizeName(t);
      if (norm === normT || norm.indexOf(normT) !== -1 || normT.indexOf(norm) !== -1) {
        return config.tier1TeamBonus;
      }
    }

    for (i = 0; i < config.tier2Teams.length; i++) {
      t = config.tier2Teams[i];
      normT = normalizeName(t);
      if (norm === normT || norm.indexOf(normT) !== -1 || normT.indexOf(norm) !== -1) {
        return config.tier2TeamBonus;
      }
    }

    return 0;
  }

  function isDerbyMatch(homeName, awayName, config) {
    if (!config) config = FEATURED_WEIGHTS_CONFIG;
    var h = normalizeName(homeName);
    var a = normalizeName(awayName);
    if (!h || !a) return false;

    for (var i = 0; i < config.rivalries.length; i++) {
      var pair = config.rivalries[i];
      var normA = normalizeName(pair[0]);
      var normB = normalizeName(pair[1]);
      if (
        (h.indexOf(normA) !== -1 && a.indexOf(normB) !== -1) ||
        (h.indexOf(normB) !== -1 && a.indexOf(normA) !== -1)
      ) {
        return true;
      }
    }

    return false;
  }

  function computeMatchPopularity(match, config) {
    if (!match) return 0;
    if (!config) config = FEATURED_WEIGHTS_CONFIG;

    var score = 0;
    score += getCompetitionWeight(match.k || match.slug, match.competitionName, config);
    score += getTeamWeight(match.homeName, config);
    score += getTeamWeight(match.awayName, config);

    if (isDerbyMatch(match.homeName, match.awayName, config)) {
      score += config.derbyBonus;
    }

    if (
      match.raw?.highlights ||
      match.raw?.featured ||
      match.raw?.isTopMatch ||
      match.isTopMatch ||
      match.featured
    ) {
      score += config.feedHighlightBonus;
    }

    return score;
  }

  function pickFeaturedMatch(matches, options) {
    if (!Array.isArray(matches) || matches.length === 0) {
      return null;
    }
    if (!options) options = {};
    var now = typeof options.now === 'number' ? options.now : Date.now();
    var config = options.config || FEATURED_WEIGHTS_CONFIG;

    var parseKickoff = function (m) {
      if (!m) return Infinity;
      if (m.kickoff) {
        var parsed = Date.parse(m.kickoff);
        if (!isNaN(parsed)) return parsed;
      }
      if (m.dateISO) {
        var pDate = Date.parse(m.dateISO + 'T' + (m.tm || '12:00') + ':00Z');
        if (!isNaN(pDate)) return pDate;
      }
      return Infinity;
    };

    // 1. Check for live matches
    var liveMatches = [];
    var i, m;
    for (i = 0; i < matches.length; i++) {
      m = matches[i];
      if (m && m.st === 'live') {
        liveMatches.push(m);
      }
    }

    if (liveMatches.length > 0) {
      var scoredLive = liveMatches.map(function (item) {
        return {
          match: item,
          score: computeMatchPopularity(item, config),
          kickoffTime: parseKickoff(item),
        };
      });

      scoredLive.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.kickoffTime - b.kickoffTime;
      });

      return scoredLive[0].match;
    }

    // 2. Upcoming matches
    var upcomingMatches = [];
    for (i = 0; i < matches.length; i++) {
      m = matches[i];
      if (m && m.st === 'up') {
        upcomingMatches.push(m);
      }
    }

    if (upcomingMatches.length === 0) {
      return null;
    }

    var scoredUpcoming = upcomingMatches.map(function (item) {
      var kickoffTime = parseKickoff(item);
      var diffMs = kickoffTime - now;
      return {
        match: item,
        score: computeMatchPopularity(item, config),
        kickoffTime: kickoffTime,
        diffMs: diffMs,
        within24h: diffMs > 0 && diffMs <= 24 * 3600 * 1000,
        isFuture: diffMs > 0,
      };
    });

    // 2a. Within 24h
    var within24h = scoredUpcoming.filter(function (x) { return x.within24h; });
    if (within24h.length > 0) {
      within24h.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.kickoffTime - b.kickoffTime;
      });
      return within24h[0].match;
    }

    // 2b. Future upcoming overall
    var futureUpcoming = scoredUpcoming.filter(function (x) {
      return x.isFuture || x.kickoffTime !== Infinity;
    });
    if (futureUpcoming.length > 0) {
      futureUpcoming.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.kickoffTime - b.kickoffTime;
      });
      return futureUpcoming[0].match;
    }

    return null;
  }

  function getKickoffCountdown(kickoffTimestamp, currentTimestamp) {
    if (typeof currentTimestamp !== 'number') currentTimestamp = Date.now();
    var target = typeof kickoffTimestamp === 'number'
      ? kickoffTimestamp
      : kickoffTimestamp instanceof Date
      ? kickoffTimestamp.getTime()
      : Date.parse(kickoffTimestamp);

    if (isNaN(target)) {
      return {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        totalSeconds: 0,
        isPassed: true,
      };
    }

    var diffMs = target - currentTimestamp;
    if (diffMs <= 0) {
      return {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        totalSeconds: 0,
        isPassed: true,
      };
    }

    var totalSeconds = Math.floor(diffMs / 1000);
    var d = Math.floor(totalSeconds / 86400);
    var h = Math.floor((totalSeconds % 86400) / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = totalSeconds % 60;

    var pad = function (n) { return String(n).padStart(2, '0'); };

    return {
      days: pad(d),
      hours: pad(h),
      minutes: pad(m),
      seconds: pad(s),
      totalSeconds: totalSeconds,
      isPassed: false,
    };
  }

  function parseLiveMinute(pr, when, statusName) {
    var raw = String(pr || when || '').trim().toUpperCase();
    var sName = String(statusName || '').toUpperCase();

    if (raw === 'HT' || raw.indexOf('HALFTIME') !== -1 || sName.indexOf('HALFTIME') !== -1) {
      return {
        displayMinute: 'HT',
        hasApostrophe: false,
        phase: 'Halftime',
        percent: 50,
        isSpecial: true,
      };
    }

    if (raw.indexOf('PEN') !== -1 || sName.indexOf('PENALTY') !== -1) {
      return {
        displayMinute: 'PEN',
        hasApostrophe: false,
        phase: 'Penalties',
        percent: 100,
        isSpecial: true,
      };
    }

    if (raw.indexOf('ET') !== -1 || raw.indexOf('EXTRA') !== -1 || sName.indexOf('EXTRA') !== -1) {
      return {
        displayMinute: raw.replace(/[^0-9+]/g, '') || 'ET',
        hasApostrophe: true,
        phase: 'Extra time',
        percent: 100,
        isSpecial: false,
      };
    }

    var stoppageMatch = raw.match(/^(\d+)\s*\+\s*(\d+)/);
    if (stoppageMatch) {
      var base = Number(stoppageMatch[1]);
      var added = Number(stoppageMatch[2]);
      var phase = base <= 45 ? 'First half' : 'Second half';
      var percent = base <= 45 ? 50 : 100;
      return {
        displayMinute: base + '+' + added,
        hasApostrophe: true,
        phase: phase,
        percent: percent,
        isSpecial: false,
      };
    }

    var numMatch = raw.match(/^(\d+)/);
    if (numMatch) {
      var min = Number(numMatch[1]);
      var phaseNum = min <= 45 ? 'First half' : 'Second half';
      var percentNum = Math.max(0, Math.min(100, (min / 90) * 100));
      return {
        displayMinute: String(min),
        hasApostrophe: true,
        phase: phaseNum,
        percent: percentNum,
        isSpecial: false,
      };
    }

    return {
      displayMinute: raw.replace(/'/g, '') || 'LIVE',
      hasApostrophe: raw.indexOf("'") !== -1,
      phase: 'In progress',
      percent: 50,
      isSpecial: true,
    };
  }

  return {
    FEATURED_WEIGHTS_CONFIG: FEATURED_WEIGHTS_CONFIG,
    normalizeName: normalizeName,
    getCompetitionWeight: getCompetitionWeight,
    getTeamWeight: getTeamWeight,
    isDerbyMatch: isDerbyMatch,
    computeMatchPopularity: computeMatchPopularity,
    pickFeaturedMatch: pickFeaturedMatch,
    getKickoffCountdown: getKickoffCountdown,
    parseLiveMinute: parseLiveMinute,
  };
});
