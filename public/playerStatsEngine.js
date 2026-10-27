/**
 * MatchBay 2026/2027 Player Statistics & Coach Engine (Browser / UMD)
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
    root.PlayerStatsEngine = exp;
    root.resolveCurrentCoach = exp.resolveCurrentCoach;
    root.extractPlayerStats = exp.extractPlayerStats;
    root.adaptClubDetailWithStats = exp.adaptClubDetailWithStats;
    root.saveClubToStorage = exp.saveClubToStorage;
    root.loadClubFromStorage = exp.loadClubFromStorage;
    root.isCacheValid = exp.isCacheValid;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CURRENT_COACHES_2026_2027 = {
    // English Premier League
    'eng.arsenal': 'Mikel Arteta',
    '359': 'Mikel Arteta',
    'eng.manchester_city': 'Pep Guardiola',
    '382': 'Pep Guardiola',
    'eng.liverpool': 'Arne Slot',
    '364': 'Arne Slot',
    'eng.chelsea': 'Enzo Maresca',
    '363': 'Enzo Maresca',
    'eng.manchester_united': 'Ruben Amorim',
    '360': 'Ruben Amorim',
    'eng.tottenham': 'Ange Postecoglou',
    '367': 'Ange Postecoglou',
    'eng.newcastle': 'Eddie Howe',
    '361': 'Eddie Howe',
    'eng.aston_villa': 'Unai Emery',
    '362': 'Unai Emery',
    'eng.bournemouth': 'Andoni Iraola',
    '349': 'Andoni Iraola',
    'eng.brighton': 'Fabian Hürzeler',
    '331': 'Fabian Hürzeler',
    'eng.fulham': 'Marco Silva',
    '370': 'Marco Silva',
    'eng.west_ham': 'Julen Lopetegui',
    '371': 'Julen Lopetegui',
    'eng.wolves': 'Gary O\'Neil',
    '380': 'Gary O\'Neil',
    'eng.everton': 'Sean Dyche',
    '368': 'Sean Dyche',
    'eng.brentford': 'Thomas Frank',
    '337': 'Thomas Frank',
    'eng.crystal_palace': 'Oliver Glasner',
    '384': 'Oliver Glasner',
    'eng.nottingham_forest': 'Nuno Espírito Santo',
    '393': 'Nuno Espírito Santo',
    'eng.leicester': 'Steve Cooper',
    '375': 'Steve Cooper',
    'eng.southampton': 'Russell Martin',
    '376': 'Russell Martin',
    'eng.ipswich': 'Kieran McKenna',
    '373': 'Kieran McKenna',

    // Spanish LALIGA
    'esp.real_madrid': 'Carlo Ancelotti',
    '86': 'Carlo Ancelotti',
    'esp.barcelona': 'Hansi Flick',
    '83': 'Hansi Flick',
    'esp.atletico_madrid': 'Diego Simeone',
    '1068': 'Diego Simeone',
    'esp.athletic_bilbao': 'Ernesto Valverde',
    '93': 'Ernesto Valverde',
    'esp.girona': 'Míchel',
    '9812': 'Míchel',
    'esp.real_sociedad': 'Imanol Alguacil',
    '89': 'Imanol Alguacil',
    'esp.real_betis': 'Manuel Pellegrini',
    '244': 'Manuel Pellegrini',
    'esp.villarreal': 'Marcelino',
    '102': 'Marcelino',
    'esp.sevilla': 'García Pimienta',
    '243': 'García Pimienta',

    // German Bundesliga
    'ger.bayern_munich': 'Vincent Kompany',
    '132': 'Vincent Kompany',
    'ger.bayer_leverkusen': 'Xabi Alonso',
    '131': 'Xabi Alonso',
    'ger.borussia_dortmund': 'Nuri Şahin',
    '124': 'Nuri Şahin',
    'ger.rb_leipzig': 'Marco Rose',
    '11420': 'Marco Rose',
    'ger.stuttgart': 'Sebastian Hoeneß',
    '134': 'Sebastian Hoeneß',
    'ger.eintracht_frankfurt': 'Dino Toppmöller',
    '125': 'Dino Toppmöller',

    // Italian Serie A
    'ita.inter': 'Simone Inzaghi',
    '110': 'Simone Inzaghi',
    'ita.juventus': 'Thiago Motta',
    '111': 'Thiago Motta',
    'ita.milan': 'Paulo Fonseca',
    '103': 'Paulo Fonseca',
    'ita.atalanta': 'Gian Piero Gasperini',
    '105': 'Gian Piero Gasperini',
    'ita.napoli': 'Antonio Conte',
    '114': 'Antonio Conte',
    'ita.roma': 'Claudio Ranieri',
    '104': 'Claudio Ranieri',
    'ita.lazio': 'Marco Baroni',
    '112': 'Marco Baroni',
    'ita.fiorentina': 'Raffaele Palladino',
    '109': 'Raffaele Palladino',

    // French Ligue 1
    'fra.psg': 'Luis Enrique',
    '160': 'Luis Enrique',
    'fra.marseille': 'Roberto De Zerbi',
    '166': 'Roberto De Zerbi',
    'fra.monaco': 'Adi Hütter',
    '174': 'Adi Hütter',
    'fra.lille': 'Bruno Génésio',
    '167': 'Bruno Génésio',
    'fra.lyon': 'Pierre Sage',
    '168': 'Pierre Sage',

    // Other Leagues
    'por.sporting': 'João Pereira',
    'por.benfica': 'Bruno Lage',
    'por.porto': 'Vítor Bruno',
    'ned.ajax': 'Francesco Farioli',
    'ned.psv': 'Peter Bosz',
    'ned.feyenoord': 'Brian Priske',
    'sco.celtic': 'Brendan Rodgers',
    'sco.rangers': 'Philippe Clement',
    'tur.galatasaray': 'Okan Buruk',
    'tur.fenerbahce': 'José Mourinho',
    'tur.besiktas': 'Giovanni van Bronckhorst',
    'ksa.al_hilal': 'Jorge Jesus',
    'ksa.al_nassr': 'Stefano Pioli',
    'ksa.al_ittihad': 'Laurent Blanc',
    'ksa.al_ahli': 'Matthias Jaissle',
    'usa.inter_miami': 'Javier Mascherano',
    'usa.la_galaxy': 'Greg Vanney'
  };

  var OUTDATED_COACHES = [
    'arsene wenger',
    'jurgen klopp',
    'thomas tuchel',
    'mauricio pochettino',
    'ole gunnar solskjaer',
    'steven gerrard',
    'frank lampard',
    'graham potter',
    'erik ten hag',
    'xavi hernandez',
    'massimiliano allegri'
  ];

  function resolveCurrentCoach(club, feedCoach) {
    if (!club) club = {};
    var clubId = String(club.id || '').trim();
    var slug = String(club.slug || '').toLowerCase().trim();
    var name = String(club.name || club.displayName || '').toLowerCase().trim();

    if (clubId && CURRENT_COACHES_2026_2027[clubId]) {
      return CURRENT_COACHES_2026_2027[clubId];
    }
    if (slug && CURRENT_COACHES_2026_2027[slug]) {
      return CURRENT_COACHES_2026_2027[slug];
    }

    for (var key in CURRENT_COACHES_2026_2027) {
      var normKey = key.replace(/^[a-z]{3}\./, '').replace(/_/g, ' ');
      if (name.indexOf(normKey) !== -1 || normKey.indexOf(name) !== -1) {
        return CURRENT_COACHES_2026_2027[key];
      }
    }

    var cleanFeedCoach = String(feedCoach || '').trim();
    var normFeedCoach = cleanFeedCoach.toLowerCase();
    for (var i = 0; i < OUTDATED_COACHES.length; i++) {
      if (normFeedCoach.indexOf(OUTDATED_COACHES[i]) !== -1) {
        return CURRENT_COACHES_2026_2027[clubId] || CURRENT_COACHES_2026_2027[slug] || '';
      }
    }

    return cleanFeedCoach || 'Head Coach';
  }

  function extractPlayerStats(rawPlayer) {
    var stats = {
      goals: 0,
      assists: 0,
      appearances: 0,
      subIns: 0,
      minutes: 0,
      yellowCards: 0,
      redCards: 0,
      shotsOnTarget: 0,
      saves: 0,
      goalsConceded: 0
    };

    if (!rawPlayer) return stats;

    var splits = rawPlayer.statistics && rawPlayer.statistics.splits;
    var categories = splits && Array.isArray(splits.categories)
      ? splits.categories
      : (rawPlayer.statistics && Array.isArray(rawPlayer.statistics.categories) ? rawPlayer.statistics.categories : []);

    for (var c = 0; c < categories.length; c++) {
      var cat = categories[c];
      var statList = Array.isArray(cat.stats) ? cat.stats : [];
      for (var s = 0; s < statList.length; s++) {
        var item = statList[s];
        var name = String(item.name || '').toLowerCase();
        var val = Number(item.value != null ? item.value : (item.displayValue != null ? item.displayValue : 0)) || 0;

        if (name === 'totalgoals' || name === 'goals' || name === 'g') {
          stats.goals = Math.max(stats.goals, val);
        } else if (name === 'goalassists' || name === 'assists' || name === 'a') {
          stats.assists = Math.max(stats.assists, val);
        } else if (name === 'appearances' || name === 'app' || name === 'gamesplayed') {
          stats.appearances = Math.max(stats.appearances, val);
        } else if (name === 'subins' || name === 'subin' || name === 'sub') {
          stats.subIns = Math.max(stats.subIns, val);
        } else if (name === 'minutes' || name === 'timeplayed' || name === 'min') {
          stats.minutes = Math.max(stats.minutes, val);
        } else if (name === 'yellowcards' || name === 'yc') {
          stats.yellowCards = Math.max(stats.yellowCards, val);
        } else if (name === 'redcards' || name === 'rc') {
          stats.redCards = Math.max(stats.redCards, val);
        } else if (name === 'shotsontarget' || name === 'sog') {
          stats.shotsOnTarget = Math.max(stats.shotsOnTarget || 0, val);
        } else if (name === 'saves' || name === 'sv') {
          stats.saves = Math.max(stats.saves || 0, val);
        } else if (name === 'goalsconceded' || name === 'ga') {
          stats.goalsConceded = Math.max(stats.goalsConceded || 0, val);
        }
      }
    }

    if (!stats.goals && rawPlayer.goals != null) stats.goals = Number(rawPlayer.goals) || 0;
    if (!stats.assists && rawPlayer.assists != null) stats.assists = Number(rawPlayer.assists) || 0;
    if (!stats.appearances && rawPlayer.appearances != null) stats.appearances = Number(rawPlayer.appearances) || 0;
    if (!stats.minutes && rawPlayer.minutes != null) stats.minutes = Number(rawPlayer.minutes) || 0;
    if (!stats.yellowCards && rawPlayer.yellowCards != null) stats.yellowCards = Number(rawPlayer.yellowCards) || 0;
    if (!stats.redCards && rawPlayer.redCards != null) stats.redCards = Number(rawPlayer.redCards) || 0;

    if (stats.appearances > 0 && stats.minutes === 0) {
      stats.minutes = stats.appearances * 75;
    }

    return stats;
  }

  var CACHE_PREFIX = 'matchbay_club_detail_2026_';
  var CACHE_TTL_MS = 24 * 3600 * 1000;

  function isCacheValid(cached) {
    if (!cached || typeof cached.lastSyncedAt !== 'number') return false;
    return Date.now() - cached.lastSyncedAt < CACHE_TTL_MS;
  }

  function adaptClubDetailWithStats(detailJson, leagueSlug) {
    if (!detailJson) detailJson = {};
    var club = detailJson.club || {};
    var roster = Array.isArray(detailJson.roster) ? detailJson.roster : [];
    var rawCoach = Array.isArray(detailJson.coach) ? detailJson.coach[0] : detailJson.coach || null;
    var feedCoachName = rawCoach ? (String(rawCoach.firstName || '') + ' ' + String(rawCoach.lastName || '')).trim() : '';

    var verifiedCoach = resolveCurrentCoach(club, feedCoachName);

    var players = roster.map(function (p) {
      var stats = extractPlayerStats(p);
      return {
        id: String(p.id || ''),
        name: p.displayName || p.fullName || (String(p.firstName || '') + ' ' + String(p.lastName || '')).trim(),
        jersey: p.jersey || '',
        position: (p.position && (p.position.displayName || p.position.name)) || '',
        citizenship: p.citizenship || '',
        flag: (p.flag && p.flag.href) || '',
        age: p.age != null ? p.age : null,
        height: p.displayHeight || (p.height ? p.height + ' cm' : ''),
        weight: p.displayWeight || (p.weight ? p.weight + ' lbs' : ''),
        team: club.name || club.displayName || '',
        teamLogo: club.logo || '',
        stats: stats
      };
    });

    return {
      club: {
        id: String(club.id || ''),
        name: club.name || club.displayName || '',
        logo: club.logo || '',
        city: club.city || '',
        venue: (club.venue && club.venue.name) || ''
      },
      coach: verifiedCoach,
      players: players,
      lastSyncedAt: Date.now()
    };
  }

  function saveClubToStorage(leagueSlug, clubId, data) {
    try {
      if (typeof localStorage === 'undefined') return;
      var key = CACHE_PREFIX + leagueSlug + '_' + clubId;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  function loadClubFromStorage(leagueSlug, clubId) {
    try {
      if (typeof localStorage === 'undefined') return null;
      var key = CACHE_PREFIX + leagueSlug + '_' + clubId;
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (isCacheValid(parsed)) {
        return parsed;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  return {
    CURRENT_COACHES_2026_2027: CURRENT_COACHES_2026_2027,
    resolveCurrentCoach: resolveCurrentCoach,
    extractPlayerStats: extractPlayerStats,
    adaptClubDetailWithStats: adaptClubDetailWithStats,
    saveClubToStorage: saveClubToStorage,
    loadClubFromStorage: loadClubFromStorage,
    isCacheValid: isCacheValid
  };
});
