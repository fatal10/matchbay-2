/**
 * MatchBay Competition Logo Registry and Helpers
 * Logos sourced directly from https://football-logos.cc/
 * 
 * Circle design specifications:
 * - Dark disc (#0a1a1c outer, #050d0e inner)
 * - Thin gradient ring (per-competition accent color fading to mint #19e3b1)
 * - White logo scaled to ~60% of circle diameter with object-fit: contain
 * - Colored logos converted to pure white monochrome via brightness(0) invert(1)
 * - Fallback with 2-4 letter competition code if no logo or on error
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
    root.CompetitionLogos = exp;
    root.COMPETITION_LOGOS = exp.COMPETITION_LOGOS;
    root.COMPETITION_ACCENTS = exp.COMPETITION_ACCENTS;
    root.COMPETITION_SHORT_CODES = exp.COMPETITION_SHORT_CODES;
    root.getCompetitionLogoConfig = exp.getCompetitionLogoConfig;
    root.CompetitionLogo = exp.CompetitionLogo;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var COMPETITION_ACCENTS = {
    'eng.1': '#00FF85', // Premier League
    'eng.2': '#F4A900', // EFL Championship
    'eng.3': '#00A3E0', // EFL League One
    'eng.4': '#4A90E2', // EFL League Two
    'eng.5': '#E27D18', // National League
    'eng.fa': '#D4001F', // FA Cup
    'eng.league_cup': '#00A3E0', // Carabao Cup
    'eng.charity': '#E03A3E', // FA Community Shield
    'eng.trophy': '#00A3E0', // EFL Trophy
    'eng.asia_trophy': '#00FF85', // PL Asia Trophy
    'eng.w.1': '#00FF85', // Women's Super League
    'eng.w.fa': '#D4001F', // Women's FA Cup
    'eng.w.charity': '#E03A3E', // Women's Community Shield
    'esp.1': '#FF7A00', // LaLiga
    'esp.2': '#FF9E1B', // LaLiga 2
    'esp.copa_del_rey': '#FFB81C', // Copa del Rey
    'esp.super_cup': '#E63946', // Supercopa de España
    'esp.joan_gamper': '#A50044', // Trofeo Joan Gamper
    'esp.w.1': '#FF7A00', // Liga F
    'esp.copa_de_la_reina': '#FFB81C', // Copa de la Reina
    'ger.1': '#E4003B', // Bundesliga
    'ger.2': '#C40030', // 2. Bundesliga
    'ger.dfb_pokal': '#00843D', // DFB-Pokal
    'ita.1': '#1E88E5', // Serie A
    'ita.2': '#00A859', // Serie B
    'ita.coppa_italia': '#008FD7', // Coppa Italia
    'fra.1': '#155DFB', // Ligue 1
    'fra.2': '#091C3E', // Ligue 2
    'ned.1': '#FF6200', // Eredivisie
    'sco.1': '#1B365D', // Scottish Premiership
    'por.1': '#D4001F', // Primeira Liga
    'por.taca_de_portugal': '#008542', // Taça de Portugal
    'bel.1': '#D4AF37', // Belgian Pro League
    'aut.1': '#DF0024', // Austrian Bundesliga
    'tur.1': '#E30A17', // Süper Lig
    'usa.1': '#1560BD', // MLS
    'mex.1': '#006847', // Liga MX
    'arg.1': '#75AADB', // Primera Argentina
    'bra.1': '#009739', // Brasileirão
    'ksa.1': '#00A651', // Saudi Pro League
    'jpn.1': '#E60012', // J1 League
    'uefa.champions': '#0E2356', // UEFA Champions League
    'uefa.europa': '#F37021', // UEFA Europa League
    'uefa.conference': '#00D287', // UEFA Conference League
    'uefa.super_cup': '#0A3066', // UEFA Super Cup
    'uefa.nations': '#E5243B', // UEFA Nations League
    'fifa.world_cup': '#FF004F', // FIFA World Cup
    'fifa.club_world_cup': '#C79F32', // FIFA Club World Cup
    'conmebol.libertadores': '#D4AF37', // Copa Libertadores
    'conmebol.copa_america': '#0C2340', // Copa America
  };

  var COMPETITION_SHORT_CODES = {
    'eng.1': 'PL',
    'eng.2': 'EFL',
    'eng.3': 'L1',
    'eng.4': 'L2',
    'eng.5': 'NL',
    'eng.fa': 'FAC',
    'eng.league_cup': 'EFLC',
    'eng.charity': 'FACS',
    'eng.trophy': 'EFLT',
    'eng.asia_trophy': 'PLAT',
    'eng.w.1': 'WSL',
    'eng.w.fa': 'WFAC',
    'eng.w.charity': 'WFCS',
    'esp.1': 'LL',
    'esp.2': 'LL2',
    'esp.copa_del_rey': 'CDR',
    'esp.super_cup': 'SDC',
    'esp.joan_gamper': 'TJG',
    'esp.w.1': 'LGF',
    'esp.copa_de_la_reina': 'CDLR',
    'ger.1': 'BL',
    'ger.2': '2BL',
    'ger.dfb_pokal': 'DFB',
    'ita.1': 'SA',
    'ita.2': 'SB',
    'ita.coppa_italia': 'COP',
    'fra.1': 'L1',
    'fra.2': 'L2',
    'ned.1': 'ERE',
    'sco.1': 'SCO',
    'por.1': 'PRT',
    'por.taca_de_portugal': 'TCP',
    'bel.1': 'BEL',
    'aut.1': 'AUT',
    'tur.1': 'TUR',
    'usa.1': 'MLS',
    'mex.1': 'MEX',
    'arg.1': 'ARG',
    'bra.1': 'BRA',
    'ksa.1': 'SPL',
    'jpn.1': 'J1',
    'uefa.champions': 'UCL',
    'uefa.europa': 'UEL',
    'uefa.conference': 'UECL',
    'uefa.super_cup': 'USC',
    'uefa.nations': 'UNL',
    'fifa.world_cup': 'WC',
    'fifa.club_world_cup': 'CWC',
    'conmebol.libertadores': 'LIB',
    'conmebol.copa_america': 'CA',
  };

  var COMPETITION_LOGOS = {
    // England
    'eng.1': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/english-premier-league.b597f797.png',
      isWhite: false,
      name: 'Premier League',
    },
    'eng.2': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/efl-championship.2766b536.png',
      isWhite: false,
      name: 'EFL Championship',
    },
    'eng.3': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/efl-league-one.5e95a41e.png',
      isWhite: false,
      name: 'EFL League One',
    },
    'eng.4': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/efl-league-two.bd6b1083.png',
      isWhite: false,
      name: 'EFL League Two',
    },
    'eng.5': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/national-league.652256c7.png',
      isWhite: false,
      name: 'National League',
    },
    'eng.fa': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/emirates-fa-cup.cb30a62f.png',
      isWhite: false,
      name: 'FA Cup',
    },
    'eng.league_cup': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/efl-cup.667da864.png',
      isWhite: false,
      name: 'EFL Cup',
    },
    'eng.charity': {
      url: 'https://assets.football-logos.cc/logos/england/512x512/fa-community-shield.3436f44c.png',
      isWhite: false,
      name: 'FA Community Shield',
    },

    // Spain
    'esp.1': {
      url: 'https://assets.football-logos.cc/logos/spain/512x512/la-liga--no-text.dfa1dfcb.png',
      isWhite: false,
      name: 'LALIGA',
    },
    'esp.2': {
      url: 'https://assets.football-logos.cc/logos/spain/512x512/la-liga-2--no-text.9733e0e8.png',
      isWhite: false,
      name: 'LALIGA 2',
    },
    'esp.copa_del_rey': {
      url: 'https://assets.football-logos.cc/logos/spain/512x512/copa-del-rey.d48736b4.png',
      isWhite: false,
      name: 'Copa del Rey',
    },
    'esp.super_cup': {
      url: 'https://assets.football-logos.cc/logos/spain/512x512/supercopa-de-espana.1b9709b2.png',
      isWhite: false,
      name: 'Supercopa de España',
    },

    // Germany
    'ger.1': {
      url: 'https://assets.football-logos.cc/logos/germany/512x512/bundesliga.24d9c6f9.png',
      isWhite: false,
      name: 'Bundesliga',
    },
    'ger.2': {
      url: 'https://assets.football-logos.cc/logos/germany/512x512/2-bundesliga.11755b17.png',
      isWhite: false,
      name: '2. Bundesliga',
    },
    'ger.dfb_pokal': {
      url: 'https://assets.football-logos.cc/logos/germany/512x512/dfb-pokal.f99edcba.png',
      isWhite: false,
      name: 'DFB-Pokal',
    },

    // Italy
    'ita.1': {
      url: 'https://assets.football-logos.cc/logos/italy/512x512/serie-a.1289b16a.png',
      isWhite: false,
      name: 'Serie A',
    },
    'ita.2': {
      url: 'https://assets.football-logos.cc/logos/italy/512x512/serie-b.bb0c0fde.png',
      isWhite: false,
      name: 'Serie B',
    },
    'ita.coppa_italia': {
      url: 'https://assets.football-logos.cc/logos/italy/512x512/coppa-italia.c154e4b2.png',
      isWhite: false,
      name: 'Coppa Italia',
    },

    // France
    'fra.1': {
      url: 'https://assets.football-logos.cc/logos/france/512x512/ligue-1--white.4072671a.png',
      isWhite: true,
      name: 'Ligue 1',
    },
    'fra.2': {
      url: 'https://assets.football-logos.cc/logos/france/512x512/ligue-2--white.c112a648.png',
      isWhite: true,
      name: 'Ligue 2',
    },

    // Netherlands
    'ned.1': {
      url: 'https://assets.football-logos.cc/logos/netherlands/512x512/eredivisie.a718427b.png',
      isWhite: false,
      name: 'Eredivisie',
    },

    // Scotland
    'sco.1': {
      url: 'https://assets.football-logos.cc/logos/scotland/512x512/scottish-premiership--no-text-white.8b92ef0c.png',
      isWhite: true,
      name: 'Scottish Premiership',
    },

    // Portugal
    'por.1': {
      url: 'https://assets.football-logos.cc/logos/portugal/512x512/primeira-liga--horizontal-white.7237854c.png',
      isWhite: true,
      name: 'Primeira Liga',
    },
    'por.taca_de_portugal': {
      url: 'https://assets.football-logos.cc/logos/portugal/512x512/taca-de-portugal.7a663fe9.png',
      isWhite: false,
      name: 'Taça de Portugal',
    },

    // Belgium
    'bel.1': {
      url: 'https://assets.football-logos.cc/logos/belgium/512x512/belgian-pro-league.af260e34.png',
      isWhite: false,
      name: 'Belgian Pro League',
    },

    // Austria
    'aut.1': {
      url: 'https://assets.football-logos.cc/logos/austria/512x512/austrian-football-bundesliga.bdc8c58e.png',
      isWhite: false,
      name: 'Austrian Bundesliga',
    },

    // Turkey
    'tur.1': {
      url: 'https://assets.football-logos.cc/logos/turkey/512x512/super-lig.80720189.png',
      isWhite: false,
      name: 'Süper Lig',
    },

    // USA
    'usa.1': {
      url: 'https://assets.football-logos.cc/logos/usa/512x512/mls.389fae67.png',
      isWhite: false,
      name: 'Major League Soccer',
    },

    // Mexico
    'mex.1': {
      url: 'https://assets.football-logos.cc/logos/mexico/512x512/liga-mx.15273233.png',
      isWhite: false,
      name: 'Liga MX',
    },

    // Argentina
    'arg.1': {
      url: 'https://assets.football-logos.cc/logos/argentina/512x512/argentina-primera-division.98bf8e3e.png',
      isWhite: false,
      name: 'Liga Profesional Argentina',
    },

    // Brazil
    'bra.1': {
      url: 'https://assets.football-logos.cc/logos/brazil/512x512/brazilian-serie-a.f7cd00c8.png',
      isWhite: false,
      name: 'Brasileirão Série A',
    },

    // Saudi Arabia
    'ksa.1': {
      url: 'https://assets.football-logos.cc/logos/saudi-arabia/512x512/saudi-professional-league.59d5c8af.png',
      isWhite: false,
      name: 'Saudi Pro League',
    },

    // Japan
    'jpn.1': {
      url: 'https://assets.football-logos.cc/logos/japan/512x512/j-league.337e64b4.png',
      isWhite: false,
      name: 'J1 League',
    },

    // Tournaments & International
    'uefa.champions': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/uefa-champions-league--no-text-white.8a19633c.png',
      isWhite: true,
      name: 'UEFA Champions League',
    },
    'uefa.europa': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/uefa-europa-league--no-text.f5242ab6.png',
      isWhite: false,
      name: 'UEFA Europa League',
    },
    'uefa.conference': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/uefa-conference-league--no-text.11cffd52.png',
      isWhite: false,
      name: 'UEFA Conference League',
    },
    'uefa.super_cup': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/uefa-super-cup--white.9c22dbe7.png',
      isWhite: true,
      name: 'UEFA Super Cup',
    },
    'uefa.nations': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/uefa-nations-league--no-text.3f99cc03.png',
      isWhite: false,
      name: 'UEFA Nations League',
    },
    'fifa.world_cup': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/fifa-world-cup-2026--white.12f8795d.png',
      isWhite: true,
      name: 'FIFA World Cup 2026',
    },
    'fifa.club_world_cup': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/fifa-club-world-cup.75620a01.png',
      isWhite: false,
      name: 'FIFA Club World Cup',
    },
    'conmebol.libertadores': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/conmebol-libertadores.38816506.png',
      isWhite: false,
      name: 'CONMEBOL Libertadores',
    },
    'conmebol.copa_america': {
      url: 'https://assets.football-logos.cc/logos/tournaments/512x512/conmebol-copa-america-2024.e4b7ac5e.png',
      isWhite: false,
      name: 'Copa América',
    },
  };

  var COMPETITION_ALIASES = {
    '700': 'eng.1',
    '3914': 'eng.2',
    '3915': 'eng.3',
    '3916': 'eng.4',
    '3917': 'eng.5',
    '3918': 'eng.fa',
    '3920': 'eng.league_cup',
    '18481': 'eng.trophy',
    '5329': 'eng.charity',
    '17928': 'eng.asia_trophy',
    '8097': 'eng.w.1',
    '20226': 'eng.w.fa',
    '19907': 'eng.w.charity',
    '740': 'esp.1',
    '3921': 'esp.2',
    '3951': 'esp.copa_del_rey',
    '8102': 'esp.super_cup',
    '17929': 'esp.joan_gamper',
    '20956': 'esp.w.1',
    '20381': 'esp.copa_de_la_reina',
    '720': 'ger.1',
    '730': 'ita.1',
    '710': 'fra.1',
    '725': 'ned.1',
    '735': 'sco.1',
    '715': 'por.1',
    '3901': 'bel.1',
    '3907': 'aut.1',
    '3946': 'tur.1',
    '770': 'usa.1',
    '760': 'mex.1',
    '745': 'arg.1',
    '630': 'bra.1',
    '21231': 'ksa.1',
    '750': 'jpn.1',
    'uefa.1': 'uefa.champions',
    'uefa.2': 'uefa.europa',
    'champions': 'uefa.champions',
    'europa': 'uefa.europa',
    'worldcup': 'fifa.world_cup',
    'world_cup': 'fifa.world_cup',
  };

  function normalizeCompName(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  var NAME_TO_SLUG = {
    premierleague: 'eng.1',
    englishpremierleague: 'eng.1',
    eflchampionship: 'eng.2',
    championship: 'eng.2',
    eflleagueone: 'eng.3',
    leagueone: 'eng.3',
    eflleaguetwo: 'eng.4',
    leaguetwo: 'eng.4',
    nationalleague: 'eng.5',
    facup: 'eng.fa',
    englishfacup: 'eng.fa',
    carabaocup: 'eng.league_cup',
    eflcup: 'eng.league_cup',
    leaguecup: 'eng.league_cup',
    facommunityshield: 'eng.charity',
    communityshield: 'eng.charity',
    efltrophy: 'eng.trophy',
    laliga: 'esp.1',
    spanishlaliga: 'esp.1',
    laliga2: 'esp.2',
    spanishlaliga2: 'esp.2',
    copadelrey: 'esp.copa_del_rey',
    spanishcopadelrey: 'esp.copa_del_rey',
    supercopadeespana: 'esp.super_cup',
    spanishsupercopa: 'esp.super_cup',
    bundesliga: 'ger.1',
    germanbundesliga: 'ger.1',
    '2bundesliga': 'ger.2',
    dfbpokal: 'ger.dfb_pokal',
    seriea: 'ita.1',
    italianseriea: 'ita.1',
    serieb: 'ita.2',
    coppaitalia: 'ita.coppa_italia',
    ligue1: 'fra.1',
    frenchligue1: 'fra.1',
    ligue2: 'fra.2',
    eredivisie: 'ned.1',
    dutcheredivisie: 'ned.1',
    scottishpremiership: 'sco.1',
    premiership: 'sco.1',
    primeiraliga: 'por.1',
    portugueseprimeiraliga: 'por.1',
    belgianproleague: 'bel.1',
    proleague: 'bel.1',
    austrianbundesliga: 'aut.1',
    superlig: 'tur.1',
    turkishsuperlig: 'tur.1',
    mls: 'usa.1',
    majorleaguesoccer: 'usa.1',
    ligamx: 'mex.1',
    mexicanligamx: 'mex.1',
    ligaprofesional: 'arg.1',
    argentinaligaprofesional: 'arg.1',
    brasileirao: 'bra.1',
    brazilianseriea: 'bra.1',
    saudiproleague: 'ksa.1',
    saudipro: 'ksa.1',
    j1league: 'jpn.1',
    jleague: 'jpn.1',
    uefachampionsleague: 'uefa.champions',
    championsleague: 'uefa.champions',
    uefaeuropaleague: 'uefa.europa',
    europaleague: 'uefa.europa',
    uefaconferenceleague: 'uefa.conference',
    conferenceleague: 'uefa.conference',
    fifaworldcup: 'fifa.world_cup',
    worldcup: 'fifa.world_cup',
    uefanationsleague: 'uefa.nations',
    uefasupercup: 'uefa.super_cup',
    fifaclubworldcup: 'fifa.club_world_cup',
    copalibertadores: 'conmebol.libertadores',
    copaamerica: 'conmebol.copa_america',
  };

  function getCompetitionLogoConfig(competition) {
    var slug = '';
    var rawName = '';

    if (typeof competition === 'string') {
      slug = competition.trim();
    } else if (competition && typeof competition === 'object') {
      slug = competition.slug || competition.k || competition.leagueSlug || competition.id || '';
      rawName = competition.name || competition.competitionName || competition.abbreviation || '';
    }

    var resolvedSlug = slug;
    if (COMPETITION_ALIASES[resolvedSlug]) {
      resolvedSlug = COMPETITION_ALIASES[resolvedSlug];
    }

    if (!COMPETITION_LOGOS[resolvedSlug]) {
      var norm = normalizeCompName(slug || rawName);
      if (NAME_TO_SLUG[norm]) {
        resolvedSlug = NAME_TO_SLUG[norm];
      }
    }

    var logoData = COMPETITION_LOGOS[resolvedSlug];
    var accentColor = COMPETITION_ACCENTS[resolvedSlug] || '#19e3b1';
    var shortCode =
      COMPETITION_SHORT_CODES[resolvedSlug] ||
      (rawName || slug || 'FB')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 3)
        .toUpperCase() ||
      'FB';
    var name = logoData?.name || rawName || slug || 'Competition';

    return {
      id: typeof competition === 'object' ? String(competition.id || '') : undefined,
      slug: resolvedSlug || slug,
      name: name,
      url: logoData?.url,
      isWhite: Boolean(logoData?.isWhite),
      accentColor: accentColor,
      shortCode: shortCode,
    };
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function CompetitionLogo(props) {
    if (!props) props = {};
    var competition = props.competition;
    var size = typeof props.size === 'number' ? props.size : 32;
    var className = props.className || '';
    var glow = props.glow;
    var alt = props.alt;

    var config = getCompetitionLogoConfig(competition);
    var shouldGlow = typeof glow === 'boolean' ? glow : size >= 48;
    var imgSize = Math.max(12, Math.round(size * 0.6));
    var fontSize = Math.max(8, Math.round(size * 0.26));
    var ringPadding = Math.max(1, Math.min(3, Math.round(size * 0.04)));

    var altText = alt || config.name + ' logo';

    var glowStyle = shouldGlow
      ? 'box-shadow: 0 0 ' + Math.round(size * 0.22) + 'px -1px ' + config.accentColor + '55, 0 0 6px rgba(25, 227, 177, 0.35);'
      : '';

    var circleStyle = [
      'position:relative;',
      'display:inline-grid;',
      'place-items:center;',
      'width:' + size + 'px;',
      'height:' + size + 'px;',
      'border-radius:50%;',
      'flex:none;',
      'box-sizing:border-box;',
      'padding:' + ringPadding + 'px;',
      'background:conic-gradient(from 145deg, ' + config.accentColor + ', #19e3b1, ' + config.accentColor + ');',
      'vertical-align:middle;',
      glowStyle,
    ].join('');

    var discStyle = [
      'position:relative;',
      'width:100%;',
      'height:100%;',
      'border-radius:50%;',
      'background:radial-gradient(circle at 50% 35%, #0a1a1c 0%, #050d0e 100%);',
      'display:grid;',
      'place-items:center;',
      'overflow:hidden;',
      'box-sizing:border-box;',
    ].join('');

    var imgFilter = config.isWhite ? '' : 'filter:brightness(0) invert(1);';
    var imgStyle = [
      'width:' + imgSize + 'px;',
      'height:' + imgSize + 'px;',
      'max-width:60%;',
      'max-height:60%;',
      'object-fit:contain;',
      'display:block;',
      'pointer-events:none;',
      imgFilter,
    ].join('');

    var codeStyle = [
      'position:absolute;',
      'inset:0;',
      'display:none;',
      'place-items:center;',
      'font-family:\'Sora\',system-ui,sans-serif;',
      'font-weight:800;',
      'font-size:' + fontSize + 'px;',
      'letter-spacing:0.5px;',
      'color:#19e3b1;',
      'text-transform:uppercase;',
      'user-select:none;',
    ].join('');

    var directCodeStyle = [
      'position:relative;',
      'display:grid;',
      'place-items:center;',
      'width:100%;',
      'height:100%;',
      'font-family:\'Sora\',system-ui,sans-serif;',
      'font-weight:800;',
      'font-size:' + fontSize + 'px;',
      'letter-spacing:0.5px;',
      'color:#19e3b1;',
      'text-transform:uppercase;',
      'user-select:none;',
    ].join('');

    var innerContent = config.url
      ? '<img referrerpolicy="no-referrer" src="' + esc(config.url) + '" alt="' + esc(altText) + '" loading="lazy" width="' + imgSize + '" height="' + imgSize + '" style="' + imgStyle + '" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s){s.style.display=\'grid\';}"/><span class="comp-fallback" style="' + codeStyle + '">' + esc(config.shortCode) + '</span>'
      : '<span class="comp-fallback" style="' + directCodeStyle + '">' + esc(config.shortCode) + '</span>';

    return '<div class="comp-logo-circle ' + esc(className) + '" data-comp="' + esc(config.slug) + '" style="' + circleStyle + '"><div class="comp-logo-disc" style="' + discStyle + '">' + innerContent + '</div></div>';
  }

  return {
    COMPETITION_ACCENTS: COMPETITION_ACCENTS,
    COMPETITION_SHORT_CODES: COMPETITION_SHORT_CODES,
    COMPETITION_LOGOS: COMPETITION_LOGOS,
    COMPETITION_ALIASES: COMPETITION_ALIASES,
    normalizeCompName: normalizeCompName,
    getCompetitionLogoConfig: getCompetitionLogoConfig,
    CompetitionLogo: CompetitionLogo,
  };
});
