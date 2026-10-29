/**
 * MatchBay — Pure Football PWA
 * Powered exclusively by livescoreFootball (worldcup26.ir)
 */

/* ============ 1. ICONS ============ */
const I = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  matches: '<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 5h-5L8 10zM12 3v4M16 10l4-1M14.5 15l2.5 4M9.5 15L7 19M8 10L4 9"/>',
  tables: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  profile: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
  bm: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  dots: '<path d="M12 5v.01M12 12v.01M12 19v.01"/>',
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
};
const svg = (k, s = 20) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k] || ''}</svg>`;

/* ============ 2. CONFIG & HELPERS ============ */
const CONFIG = {
  API_BASE: location.origin,
  PREFIX: '/api/soccer',
  FALLBACK_ORIGIN: 'https://worldcup26.ir',
  FALLBACK_PREFIX: '/get/soccer',
  POLL_INTERVAL_SECONDS: 20,
  CACHE_KEY: 'matchbay_ls_v15',
  CACHE_MAX_AGE_MS: 48 * 3600 * 1000,
};


const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const COUNTRY_FLAGS = {
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Spain: '🇪🇸',
  Germany: '🇩🇪',
  Italy: '🇮🇹',
  France: '🇫🇷',
  Netherlands: '🇳🇱',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Portugal: '🇵🇹',
  Belgium: '🇧🇪',
  Austria: '🇦🇹',
  Turkey: '🇹🇷',
  'United States': '🇺🇸',
  USA: '🇺🇸',
  Mexico: '🇲🇽',
  Argentina: '🇦🇷',
  Brazil: '🇧🇷',
  'Saudi Arabia': '🇸🇦',
  Japan: '🇯🇵',
  International: '🌍',
};

const countryFlag = (country) => (country ? COUNTRY_FLAGS[country] || '🌍' : '🌍');

const DAY_MS = 86400000;
const API_OFFSETS = [-3, -2, -1, 0, 1, 2, 3];

const localDateKey = (date) => {
  const x = date instanceof Date ? date : new Date(date);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const dateISO = (offset = 0) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + Number(offset || 0));
  return localDateKey(d);
};

const toYYYYMMDD = (isoStr) => isoStr.replace(/-/g, '');

const localDateText = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const localTimeText = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const dateOffsetFromISO = (iso, base = dateISO(0)) => {
  const a = String(iso || '').split('-').map(Number);
  const b = String(base || '').split('-').map(Number);
  if (a.length !== 3 || b.length !== 3 || a.some(Number.isNaN) || b.some(Number.isNaN)) return 0;
  return Math.round((Date.UTC(a[0], a[1] - 1, a[2]) - Date.UTC(b[0], b[1] - 1, b[2])) / DAY_MS);
};

/* ============ 3. DATA & STATE ============ */
const DATA = {
  matches: {},
  leagues: [],
  leaguesByCountry: {},
  leaguesMap: {},
  standings: {},
  standingsStatus: {},
  clubs: {},
  clubsStatus: {},
  clubDetails: {},
  clubDetailsStatus: {},
  details: {},
  detailStatus: {},
  loadingDates: {},
  dateErrors: {},
  playerPhotosDb: null,
  status: 'loading',
  lastSuccess: null,
  lastError: null,
  fromCache: false,
};

const S = {
  tab: 'home',
  D: 0,
  q: '',
  searchCat: 'all', // search category: all, comps, players, matches
  ms: 'all', // filter: all, live, up, ft
  selectedLeague: null, // slug e.g. 'eng.1'
  selectedTableLeague: 'eng.1',
  selectedTableSeason: null,
  selectedClubId: null,
  selectedClubLeague: null,
  selectedPlayerId: null,
  selectedPlayerClubKey: null,
  mt: null, // active match details modal { uid, league, id, tab }
  set: false, // settings modal
  notif: false,
  ar: true,
  ri: 20,
  lang: 'en',
  bm: {},
  savedMatches: {},
  favoriteTeams: {},
  favoritePlayers: {},
  wv: {},
};

let PULSE = null;

try {
  const stored = JSON.parse(localStorage.getItem('matchbay_ls_v15') || '{}');
  Object.assign(S, stored);
  S.bm = stored.bm || {};
  S.savedMatches = stored.savedMatches || {};
  S.favoriteTeams = stored.favoriteTeams || {};
  S.favoritePlayers = stored.favoritePlayers || {};
  S.wv = stored.wv || {};
  // Purge any old fd: keys
  Object.keys(S.bm).forEach((id) => {
    if (id.startsWith('fd:')) {
      delete S.bm[id];
      delete S.savedMatches[id];
    }
  });
} catch {}

const save = () => {
  try {
    localStorage.setItem(
      'matchbay_ls_v15',
      JSON.stringify({
        bm: S.bm,
        savedMatches: S.savedMatches,
        favoriteTeams: S.favoriteTeams,
        wv: S.wv,
        notif: S.notif,
        lang: S.lang,
        ar: S.ar,
        ri: S.ri,
        selectedTableLeague: S.selectedTableLeague,
      })
    );
  } catch {}
};

/* ============ 4. ADAPTER (livescoreFootball -> MatchBay) ============ */
function mapStatus(statusObj = {}) {
  const type = statusObj.type || {};
  const name = type.name || '';
  const state = type.state || '';
  const completed = Boolean(type.completed);
  const displayClock = statusObj.displayClock || '';
  const detail = type.detail || type.shortDetail || '';

  if (state === 'in' || name === 'STATUS_IN_PROGRESS' || name === 'STATUS_HALFTIME') {
    if (name === 'STATUS_HALFTIME' || detail === 'HT') {
      return { st: 'live', when: 'HT', pr: 'HT' };
    }
    const minute = displayClock || detail || 'LIVE';
    return { st: 'live', when: minute, pr: minute };
  }

  if (completed || state === 'post' || name.startsWith('STATUS_FULL_TIME') || name === 'STATUS_FINAL') {
    if (name === 'STATUS_POSTPONED') return { st: 'postponed', when: 'Postponed', pr: '' };
    if (name === 'STATUS_CANCELED' || name === 'STATUS_CANCELLED') return { st: 'cancelled', when: 'Cancelled', pr: '' };
    if (name === 'STATUS_SUSPENDED') return { st: 'suspended', when: 'Suspended', pr: '' };
    return { st: 'ft', when: 'FT', pr: '' };
  }

  if (name === 'STATUS_POSTPONED') return { st: 'postponed', when: 'Postponed', pr: '' };
  if (name === 'STATUS_CANCELED' || name === 'STATUS_CANCELLED') return { st: 'cancelled', when: 'Cancelled', pr: '' };
  return { st: 'up', when: 'Scheduled', pr: '' };
}

function adaptEvents(events = [], leagueSlug = 'eng.1', leagueMeta = {}) {
  if (!Array.isArray(events)) return [];

  return events.map((event, index) => {
    const id = String(event.id || '');
    const competition = event.competitions?.[0] || {};
    const competitors = competition.competitors || [];

    const homeComp = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
    const awayComp = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};

    const homeTeam = homeComp.team || {};
    const awayTeam = awayComp.team || {};

    const homeName = homeTeam.name || homeTeam.displayName || 'Home Team';
    const awayName = awayTeam.name || awayTeam.displayName || 'Away Team';

    const homeCode = homeTeam.abbreviation || homeTeam.shortDisplayName || homeName.slice(0, 3).toUpperCase();
    const awayCode = awayTeam.abbreviation || awayTeam.shortDisplayName || awayName.slice(0, 3).toUpperCase();

    const homeLogo = homeTeam.logo || '';
    const awayLogo = awayTeam.logo || '';

    const statusInfo = mapStatus(event.status);

    const parseScore = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const num = Number(val);
      return Number.isFinite(num) ? num : null;
    };

    const isPlayed = statusInfo.st === 'live' || statusInfo.st === 'ft';
    const a = isPlayed ? parseScore(homeComp.score) : null;
    const b = isPlayed ? parseScore(awayComp.score) : null;
    const scoreAvailable = a !== null && b !== null;

    const kickoff = event.date || '';
    let dateISOVal = '';
    let tm = '';
    if (kickoff) {
      try {
        const d = new Date(kickoff);
        dateISOVal = localDateKey(d);
        tm = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      } catch {}
    }

    const competitionName = leagueMeta.name || event.season?.type_name || event.season?.display_name || leagueSlug;
    const leagueFlag = leagueMeta.flag || countryFlag(leagueMeta.country);

    return {
      uid: `ls:${leagueSlug}:${id}`,
      providerId: id,
      slug: leagueSlug,
      apiSport: 'football',
      k: leagueSlug,
      j: index,
      dateOffset: 0,
      dateISO: dateISOVal,
      A: [homeCode, '#183b3b'],
      B: [awayCode, '#183b3b'],
      homeName,
      awayName,
      homeLogo,
      awayLogo,
      homeSlug: homeTeam.slug || String(homeTeam.id || ''),
      awaySlug: awayTeam.slug || String(awayTeam.id || ''),
      homeId: String(homeTeam.id || ''),
      awayId: String(awayTeam.id || ''),
      a,
      b,
      scoreAvailable,
      st: statusInfo.st,
      when: statusInfo.when,
      pr: statusInfo.pr,
      tm,
      kickoff,
      competitionName,
      competitionCountry: leagueMeta.country || '',
      leagueFlag,
      compEmblem: leagueMeta.logo || '',
      areaFlag: '',
      referee: '',
      round: event.season?.type_name || '',
      venue: event.venue?.fullName || '',
      raw: event,
    };
  });
}

function adaptSummary(summary = {}) {
  const result = {
    timeline: [],
    statistics: [],
    lineups: null,
    venue: summary.gameInfo?.venue?.fullName || '',
    referee: summary.gameInfo?.officials?.[0]?.displayName || '',
    attendance: summary.header?.competitions?.[0]?.attendance || summary.gameInfo?.attendance || '',
  };

  const homeTeamId = String(summary.header?.competitions?.[0]?.competitors?.find((c) => c.homeAway === 'home')?.team?.id || summary.boxscore?.teams?.find((t) => t.homeAway === 'home')?.team?.id || '');
  const awayTeamId = String(summary.header?.competitions?.[0]?.competitors?.find((c) => c.homeAway === 'away')?.team?.id || summary.boxscore?.teams?.find((t) => t.homeAway === 'away')?.team?.id || '');

  // 1. Timeline from keyEvents
  const keyEvents = Array.isArray(summary.keyEvents) ? summary.keyEvents : [];
  keyEvents.forEach((ev) => {
    const clock = ev.clock?.displayValue || (ev.clock?.value != null ? `${Math.floor(ev.clock.value / 60)}'` : '');
    const athlete = ev.athletesInvolved?.[0] || {};
    const athleteName = athlete.displayName || athlete.fullName || '';
    const teamName = ev.team?.name || '';
    const teamId = String(ev.team?.id || '');

    let side = 'home';
    if (teamId && awayTeamId && teamId === awayTeamId) {
      side = 'away';
    } else if (ev.team?.homeAway === 'away') {
      side = 'away';
    }

    let text = ev.type?.text || 'Match event';
    if (ev.scoringPlay || ev.type?.id === '70') {
      text = `⚽ Goal${ev.penaltyKick ? ' (penalty)' : ev.ownGoal ? ' (own goal)' : ''}`;
    } else if (ev.redCard) {
      text = '🟥 Red card';
    } else if (ev.yellowCard) {
      text = '🟨 Yellow card';
    } else if (ev.substitution) {
      text = '🔁 Substitution';
    }

    const playerDesc = [athleteName, teamName].filter(Boolean).join(' · ');
    result.timeline.push({
      minute: clock,
      text,
      playerName: playerDesc,
      athleteName,
      side,
      type: ev.type,
      athletesInvolved: ev.athletesInvolved || [],
      scoringPlay: Boolean(ev.scoringPlay),
      penaltyKick: Boolean(ev.penaltyKick),
      ownGoal: Boolean(ev.ownGoal),
      redCard: Boolean(ev.redCard),
      yellowCard: Boolean(ev.yellowCard),
      substitution: Boolean(ev.substitution),
      raw: ev,
    });
  });

  // 2. Statistics from boxscore.teams
  const boxTeams = summary.boxscore?.teams;
  if (Array.isArray(boxTeams) && boxTeams.length >= 2) {
    const homeTeam = boxTeams.find((t) => t.homeAway === 'home') || boxTeams[0];
    const awayTeam = boxTeams.find((t) => t.homeAway === 'away') || boxTeams[1];
    const homeStats = homeTeam.statistics || [];
    const awayStats = awayTeam.statistics || [];

    const statNameMap = {
      possessionPct: 'Possession (%)',
      totalShots: 'Total Shots',
      shotsOnTarget: 'Shots on Target',
      wonCorners: 'Corners',
      foulsCommitted: 'Fouls',
      offsides: 'Offsides',
      saves: 'Saves',
      yellowCards: 'Yellow Cards',
      redCards: 'Red Cards',
    };

    Object.entries(statNameMap).forEach(([key, label]) => {
      const h = homeStats.find((s) => s.name === key);
      const a = awayStats.find((s) => s.name === key);
      if (h || a) {
        result.statistics.push({
          label,
          home: h?.displayValue ?? '—',
          away: a?.displayValue ?? '—',
        });
      }
    });
  }

  // 3. Lineups from rosters
  const rosters = summary.rosters;
  if (Array.isArray(rosters) && rosters.length >= 2) {
    const homeRoster = rosters.find((r) => r.homeAway === 'home') || rosters[0];
    const awayRoster = rosters.find((r) => r.homeAway === 'away') || rosters[1];

    const mapPlayers = (list = [], teamSide = 'home') => {
      return list.map((p) => {
        const num = p.jersey ? `#${p.jersey}` : '';
        const pos = p.position?.displayName || p.position?.name || '';
        const posStr = [num, pos].filter(Boolean).join(' · ');
        const playerName = p.athlete?.displayName || p.athlete?.fullName || 'Player';
        const surname = p.athlete?.lastName || playerName.split(' ').pop() || playerName;

        if (p.subbedOut && p.subbedOutFor?.athlete) {
          const subPlay = p.plays?.find((pl) => pl.substitution);
          const subClock = subPlay?.clock?.displayValue || '';
          const subInAthlete = p.subbedOutFor.athlete;
          const exists = result.timeline.some((e) => e.substitution && e.minute === subClock && e.playerName.includes(subInAthlete.displayName));
          if (!exists && subClock) {
            result.timeline.push({
              minute: subClock,
              text: '🔁 Substitution',
              playerName: `${subInAthlete.displayName || 'Player'} · ${teamSide === 'home' ? 'Home' : 'Away'}`,
              athleteName: subInAthlete.displayName || 'Player',
              subbedOutPlayer: playerName,
              side: teamSide,
              substitution: true,
              athletesInvolved: [subInAthlete, p.athlete].filter(Boolean),
            });
          }
        }

        const assistPlay = p.plays?.find((pl) => pl.didAssist);
        if (assistPlay?.clock?.displayValue) {
          const goalEv = result.timeline.find((e) => e.scoringPlay && e.minute === assistPlay.clock.displayValue && e.side === teamSide);
          if (goalEv && !goalEv.assist) {
            goalEv.assist = surname;
          }
        }

        return {
          id: p.athlete?.id || '',
          name: playerName,
          surname,
          jersey: String(p.jersey || p.athlete?.jersey || ''),
          position: p.starter ? posStr : ['Bench', posStr].filter(Boolean).join(' · '),
          rawPosition: pos,
          starter: Boolean(p.starter),
          subbedIn: Boolean(p.subbedIn),
          subbedOut: Boolean(p.subbedOut),
          subbedOutFor: p.subbedOutFor,
          isCaptain: Boolean(p.isCaptain || p.captain || p.athlete?.captain),
          plays: p.plays || [],
          athlete: p.athlete,
        };
      });
    };

    const homeCoach = homeRoster.coaches?.[0]?.displayName || homeRoster.coaches?.[0]?.fullName || homeRoster.coach || '';
    const awayCoach = awayRoster.coaches?.[0]?.displayName || awayRoster.coaches?.[0]?.fullName || awayRoster.coach || '';

    result.lineups = {
      home: mapPlayers(homeRoster.roster, 'home'),
      away: mapPlayers(awayRoster.roster, 'away'),
      homeFormation: homeRoster.formation || '',
      awayFormation: awayRoster.formation || '',
      homeCoach,
      awayCoach,
    };
  }

  return result;
}

function adaptStandings(standingsJson = {}) {
  const groups = [];
  const children = Array.isArray(standingsJson.children) ? standingsJson.children : [];

  children.forEach((group) => {
    const entries = group.standings?.entries || [];
    const rows = entries.map((item) => {
      const team = item.team || {};
      const stats = item.stats || [];

      const getStat = (name) => {
        const s = stats.find((x) => x.name === name);
        return s?.displayValue ?? '0';
      };

      return {
        rank: item.rank ?? Number(getStat('rank')),
        team: {
          id: String(team.id || ''),
          name: team.name || team.displayName || '',
          shortDisplayName: team.shortDisplayName || team.abbreviation || '',
          abbreviation: team.abbreviation || '',
          logo: team.logo || '',
        },
        played: Number(getStat('gamesPlayed')),
        won: Number(getStat('wins')),
        drawn: Number(getStat('ties')),
        lost: Number(getStat('losses')),
        gf: Number(getStat('pointsFor')),
        ga: Number(getStat('pointsAgainst')),
        gd: Number(getStat('pointDifferential')),
        pts: Number(getStat('points')),
        note: item.note || null,
      };
    });

    groups.push({
      id: group.id || '',
      name: group.name || standingsJson.name || 'Standings',
      rows,
    });
  });

  return groups;
}

function adaptClubs(clubsJson = {}) {
  const clubs = Array.isArray(clubsJson.clubs) ? clubsJson.clubs : [];
  return clubs.map((c) => ({
    id: String(c.id || ''),
    name: c.name || c.displayName || '',
    shortName: c.shortDisplayName || c.abbreviation || '',
    abbreviation: c.abbreviation || '',
    logo: c.logo || '',
    color: c.color ? `#${c.color}` : '#183b3b',
  }));
}

function adaptClubDetail(detailJson = {}, leagueSlug = '') {
  if (typeof window !== 'undefined' && window.PlayerStatsEngine && window.PlayerStatsEngine.adaptClubDetailWithStats) {
    return window.PlayerStatsEngine.adaptClubDetailWithStats(detailJson, leagueSlug);
  }
  const club = detailJson.club || {};
  const roster = Array.isArray(detailJson.roster) ? detailJson.roster : [];
  const coach = Array.isArray(detailJson.coach) ? detailJson.coach[0] : detailJson.coach || null;

  return {
    club: {
      id: String(club.id || ''),
      name: club.name || club.displayName || '',
      logo: club.logo || '',
      city: club.city || '',
      venue: club.venue?.name || '',
    },
    coach: coach ? `${coach.firstName || ''} ${coach.lastName || ''}`.trim() : '',
    players: roster.map((p) => ({
      id: String(p.id || ''),
      name: p.displayName || p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      jersey: p.jersey || '',
      position: p.position?.displayName || p.position?.name || '',
      citizenship: p.citizenship || '',
      flag: p.flag?.href || '',
      age: p.age ?? null,
      stats: { goals: 0, assists: 0, appearances: 0, subIns: 0, minutes: 0, yellowCards: 0, redCards: 0 },
    })),
  };
}

/* ============ 5. API SERVICE ============ */
const isStaticWorkerHost = typeof location !== 'undefined' && (
  location.hostname.includes('workers.dev') ||
  location.hostname.includes('pages.dev') ||
  location.hostname.includes('github.io')
);

const API = {
  useDirectFallback: Boolean(isStaticWorkerHost),

  async get(endpoint, params = {}) {
    if (API.useDirectFallback) {
      return API.getDirect(endpoint, params);
    }

    try {
      return await API.fetchFromOrigin(CONFIG.API_BASE, endpoint, params);
    } catch (err) {
      const errMsg = String(err?.message || '');
      const isHtmlError = errMsg.includes('<!doctype') || errMsg.includes('not valid JSON') || errMsg.includes('HTML response') || errMsg.includes('Unexpected token');
      const isNetworkError = err?.name === 'TypeError' || errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || errMsg.includes('502');

      // Attempt one quick retry on the local proxy endpoint before fallback
      if (isHtmlError || isNetworkError) {
        await new Promise((r) => setTimeout(r, 300));
        try {
          return await API.fetchFromOrigin(CONFIG.API_BASE, endpoint, params);
        } catch (retryErr) {
          // If running on a static worker host where direct fetch is expected, try direct backend
          if (isStaticWorkerHost) {
            try {
              return await API.getDirect(endpoint, params);
            } catch (directErr) {
              console.warn('[MatchBay API] Direct fallback also failed:', directErr);
            }
          }
          throw retryErr;
        }
      }
      throw err;
    }
  },

  async getDirect(endpoint, params = {}) {
    let directPath = endpoint;
    if (directPath.startsWith(CONFIG.PREFIX)) {
      directPath = CONFIG.FALLBACK_PREFIX + directPath.slice(CONFIG.PREFIX.length);
    } else if (!directPath.startsWith('/get/soccer')) {
      directPath = CONFIG.FALLBACK_PREFIX + (directPath.startsWith('/') ? directPath : '/' + directPath);
    }
    return await API.fetchFromOrigin(CONFIG.FALLBACK_ORIGIN, directPath, params);
  },

  async fetchFromOrigin(baseUrl, path, params = {}) {
    const url = new URL(path, baseUrl);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Received HTML response instead of JSON');
      }

      const text = await res.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
        throw new Error(`Received HTML response: ${trimmed.slice(0, 40)}...`);
      }

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const body = JSON.parse(text);
          if (body?.error) msg = body.error;
        } catch {}
        throw new Error(msg);
      }

      return JSON.parse(text);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  },

  populateLeagues(leagues = []) {
    DATA.leaguesMap = {};
    const byCountry = {};
    leagues.forEach((l) => {
      const country = l.country || 'International';
      if (!byCountry[country]) {
        byCountry[country] = {
          name: country,
          flag: countryFlag(country),
          leagues: [],
        };
      }

      const leagueItem = {
        id: String(l.id || ''),
        slug: l.slug,
        name: l.name,
        abbreviation: l.abbreviation || l.name,
        country: l.country,
        flag: countryFlag(l.country),
        logo: l.logo || '',
        season: l.season,
        calendar: l.calendar || [],
        active: Boolean(l.active),
        matchesCount: l.coverage?.matches || 0,
        clubsCount: l.coverage?.clubs || 0,
      };

      byCountry[country].leagues.push(leagueItem);
      DATA.leaguesMap[l.slug] = leagueItem;
    });
    DATA.leaguesByCountry = byCountry;
  },

  async loadPlayerPhotosDb() {
    try {
      const res = await fetch('./player-photos-db.json');
      if (res.ok) {
        const db = await res.json();
        if (db && db.players) {
          window.PLAYER_PHOTOS_DB = db;
          DATA.playerPhotosDb = db;
        }
      }
    } catch {}

    try {
      if (!window.PLAYER_PHOTOS_DB || !window.PLAYER_PHOTOS_DB.players) {
        const fRes = await fetch('./fotmob-player-ids.json');
        if (fRes.ok) {
          const fDb = await fRes.json();
          if (fDb && fDb.players) {
            window.PLAYER_PHOTOS_DB = fDb;
            DATA.playerPhotosDb = fDb;
          }
        }
      }
    } catch {}
  },

  async loadLeagues() {
    try {
      const data = await API.get(`${CONFIG.PREFIX}/leagues`, { kind: 'all', available: 'true' });
      const leagues = Array.isArray(data.leagues) ? data.leagues : [];
      if (leagues.length) {
        DATA.leagues = leagues;
        API.populateLeagues(leagues);
        try {
          localStorage.setItem('matchbay_leagues_cache', JSON.stringify(leagues));
        } catch {}
        return leagues;
      }
    } catch (err) {
      console.warn('Failed to load leagues from API:', err?.message || err);
    }

    // Try localStorage cache
    try {
      const cached = localStorage.getItem('matchbay_leagues_cache');
      if (cached) {
        const leagues = JSON.parse(cached);
        if (Array.isArray(leagues) && leagues.length) {
          DATA.leagues = leagues;
          API.populateLeagues(leagues);
          return leagues;
        }
      }
    } catch {}

    // Fallback: top core competitions to keep app interactive
    if (!DATA.leagues || !DATA.leagues.length) {
      const fallbackLeagues = [
        { id: '1', slug: 'eng.1', name: 'Premier League', country: 'England', active: true },
        { id: '2', slug: 'esp.1', name: 'LaLiga', country: 'Spain', active: true },
        { id: '3', slug: 'ger.1', name: 'Bundesliga', country: 'Germany', active: true },
        { id: '4', slug: 'ita.1', name: 'Serie A', country: 'Italy', active: true },
        { id: '5', slug: 'fra.1', name: 'Ligue 1', country: 'France', active: true },
        { id: '6', slug: 'uefa.champions', name: 'UEFA Champions League', country: 'International', active: true },
        { id: '7', slug: 'ned.1', name: 'Eredivisie', country: 'Netherlands', active: true },
        { id: '8', slug: 'por.1', name: 'Primeira Liga', country: 'Portugal', active: true },
        { id: '9', slug: 'usa.1', name: 'Major League Soccer', country: 'USA', active: true },
        { id: '10', slug: 'bra.1', name: 'Brasileirão', country: 'Brazil', active: true },
        { id: '11', slug: 'ksa.1', name: 'Saudi Pro League', country: 'Saudi Arabia', active: true },
      ];
      DATA.leagues = fallbackLeagues;
      API.populateLeagues(fallbackLeagues);
      return fallbackLeagues;
    }
    return DATA.leagues;
  },

  async loadOffset(offset = 0, { force = false } = {}) {
    const targetDate = dateISO(offset);
    const dateNum = toYYYYMMDD(targetDate);
    DATA.loadingDates[targetDate] = true;
    delete DATA.dateErrors[targetDate];

    try {
      if (!DATA.leagues.length) {
        await API.loadLeagues();
      }

      // Discover which leagues play on targetDate (supporting both string dates and tournament range objects)
      let targetLeagues = DATA.leagues.filter((l) => {
        if (!Array.isArray(l.calendar)) return false;
        return l.calendar.some((c) => {
          if (typeof c === 'string') return c.startsWith(targetDate);
          if (typeof c === 'object' && c) {
            if (c.startDate && c.endDate) {
              const s = c.startDate.slice(0, 10);
              const e = c.endDate.slice(0, 10);
              return targetDate >= s && targetDate <= e;
            }
            if (Array.isArray(c.entries)) {
              return c.entries.some((en) => en.startDate && en.endDate && targetDate >= en.startDate.slice(0, 10) && targetDate <= en.endDate.slice(0, 10));
            }
          }
          return false;
        });
      });

      // Always ensure top competitions are queried if calendar match count is low
      const prioritySlugs = ['eng.1', 'esp.1', 'ger.1', 'ita.1', 'fra.1', 'uefa.champions', 'ned.1', 'usa.1', 'bra.1', 'ksa.1'];
      if (targetLeagues.length < 4) {
        prioritySlugs.forEach((slug) => {
          if (!targetLeagues.some((l) => l.slug === slug)) {
            const found = DATA.leagues.find((l) => l.slug === slug);
            if (found) targetLeagues.push(found);
            else targetLeagues.push({ slug, name: slug });
          }
        });
      }

      // Fetch scoreboards concurrently for active leagues on this date
      const promises = targetLeagues.map(async (league) => {
        try {
          const res = await API.get(`${CONFIG.PREFIX}/${league.slug}/scoreboard`, { dates: dateNum });
          const events = Array.isArray(res.events) ? res.events : [];
          return adaptEvents(events, league.slug, league);
        } catch (err) {
          return [];
        }
      });

      const matchArrays = await Promise.all(promises);
      const allMatches = matchArrays.flat();

      // Store in DATA.matches
      // Clear previous matches for this date
      Object.keys(DATA.matches).forEach((key) => {
        if (DATA.matches[key].dateISO === targetDate) {
          delete DATA.matches[key];
        }
      });

      allMatches.forEach((m, idx) => {
        m.dateOffset = offset;
        m.j = idx;
        const key = `${m.k}:${offset}:${idx}`;
        m.key = key;
        DATA.matches[key] = m;
      });

      DATA.status = 'connected';
      DATA.fromCache = false;
      DATA.lastSuccess = new Date().toISOString();
      DATA.loadingDates[targetDate] = false;

      API.persist();
      return { success: true, count: allMatches.length };
    } catch (err) {
      DATA.status = DATA.lastSuccess ? 'cached' : 'error';
      DATA.fromCache = Boolean(DATA.lastSuccess);
      DATA.lastError = err.message || 'Could not load matches';
      DATA.dateErrors[targetDate] = DATA.lastError;
      DATA.loadingDates[targetDate] = false;
      return { success: false, error: err.message };
    }
  },

  async loadStandings(leagueSlug, season) {
    const key = `${leagueSlug}:${season || 'current'}`;
    const storageKey = `matchbay_standings_${key}`;

    if (DATA.standings[key] && DATA.standings[key].length) {
      return DATA.standings[key];
    }

    // Attempt restoring from localStorage cache
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          DATA.standings[key] = parsed;
          DATA.standingsStatus[key] = 'loaded';
        }
      }
    } catch {}

    DATA.standingsStatus[key] = DATA.standings[key] ? 'loaded' : 'loading';

    try {
      const params = {};
      if (season) params.season = season;
      const res = await API.get(`${CONFIG.PREFIX}/${leagueSlug}/standings`, params);
      const adapted = adaptStandings(res);
      if (Array.isArray(adapted) && adapted.length) {
        DATA.standings[key] = adapted;
        DATA.standingsStatus[key] = 'loaded';
        try {
          localStorage.setItem(storageKey, JSON.stringify(adapted));
        } catch {}
        return adapted;
      }
      return DATA.standings[key] || [];
    } catch (err) {
      console.warn(`[MatchBay] Could not refresh live standings for ${leagueSlug}:`, err?.message || err);
      DATA.standingsStatus[key] = DATA.standings[key] ? 'loaded' : 'error';
      return DATA.standings[key] || [];
    }
  },

  async loadClubs(leagueSlug) {
    const storageKey = `matchbay_clubs_${leagueSlug}`;
    if (DATA.clubs[leagueSlug] && DATA.clubs[leagueSlug].length) {
      return DATA.clubs[leagueSlug];
    }

    // Attempt restoring from localStorage cache
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          DATA.clubs[leagueSlug] = parsed;
          DATA.clubsStatus[leagueSlug] = 'loaded';
        }
      }
    } catch {}

    DATA.clubsStatus[leagueSlug] = DATA.clubs[leagueSlug] ? 'loaded' : 'loading';

    try {
      const res = await API.get(`${CONFIG.PREFIX}/${leagueSlug}/clubs`);
      const clubs = adaptClubs(res);
      if (Array.isArray(clubs) && clubs.length) {
        DATA.clubs[leagueSlug] = clubs;
        DATA.clubsStatus[leagueSlug] = 'loaded';
        try {
          localStorage.setItem(storageKey, JSON.stringify(clubs));
        } catch {}
        return clubs;
      }
      return DATA.clubs[leagueSlug] || [];
    } catch (err) {
      console.warn(`[MatchBay] Could not refresh clubs catalog for ${leagueSlug}:`, err?.message || err);
      DATA.clubsStatus[leagueSlug] = DATA.clubs[leagueSlug] ? 'loaded' : 'error';
      return DATA.clubs[leagueSlug] || [];
    }
  },

  async loadClubDetail(leagueSlug, clubId, forceRefresh = false) {
    const key = `${leagueSlug}:${clubId}`;
    if (!forceRefresh) {
      if (DATA.clubDetails[key]) return DATA.clubDetails[key];
      if (typeof window !== 'undefined' && window.PlayerStatsEngine && window.PlayerStatsEngine.loadClubFromStorage) {
        const cached = window.PlayerStatsEngine.loadClubFromStorage(leagueSlug, clubId);
        if (cached) {
          DATA.clubDetails[key] = cached;
          DATA.clubDetailsStatus[key] = 'loaded';
          return cached;
        }
      }
    }

    DATA.clubDetailsStatus[key] = DATA.clubDetails[key] ? 'loaded' : 'loading';
    try {
      const res = await API.get(`${CONFIG.PREFIX}/${leagueSlug}/clubs/${clubId}`);
      let detail;
      if (typeof window !== 'undefined' && window.PlayerStatsEngine && window.PlayerStatsEngine.adaptClubDetailWithStats) {
        detail = window.PlayerStatsEngine.adaptClubDetailWithStats(res, leagueSlug);
        window.PlayerStatsEngine.saveClubToStorage(leagueSlug, clubId, detail);
      } else {
        detail = adaptClubDetail(res, leagueSlug);
      }
      DATA.clubDetails[key] = detail;
      DATA.clubDetailsStatus[key] = 'loaded';
      return detail;
    } catch (err) {
      console.warn(`[MatchBay] Could not refresh club detail ${clubId}:`, err?.message || err);
      if (typeof window !== 'undefined' && window.PlayerStatsEngine && window.PlayerStatsEngine.loadClubFromStorage) {
        const fallback = window.PlayerStatsEngine.loadClubFromStorage(leagueSlug, clubId);
        if (fallback) {
          DATA.clubDetails[key] = fallback;
          DATA.clubDetailsStatus[key] = 'loaded';
          return fallback;
        }
      }
      DATA.clubDetailsStatus[key] = DATA.clubDetails[key] ? 'loaded' : 'error';
      return DATA.clubDetails[key] || null;
    }
  },

  async loadMatchDetails(match) {
    if (!match) return null;
    if (DATA.details[match.uid] && match.st !== 'live') return DATA.details[match.uid];

    DATA.detailStatus[match.uid] = 'loading';
    try {
      const res = await API.get(`${CONFIG.PREFIX}/${match.k}/summary`, { event: match.providerId });
      const summary = adaptSummary(res);

      DATA.details[match.uid] = summary;
      DATA.detailStatus[match.uid] = 'loaded';
      return summary;
    } catch (err) {
      DATA.detailStatus[match.uid] = 'error';
      return null;
    }
  },

  persist() {
    try {
      const matches = Object.values(DATA.matches);
      localStorage.setItem(
        CONFIG.CACHE_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          lastSuccess: DATA.lastSuccess,
          matches,
        })
      );
    } catch {}
  },

  restore() {
    try {
      const raw = localStorage.getItem(CONFIG.CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.matches)) {
          parsed.matches.forEach((m) => {
            if (m?.key) DATA.matches[m.key] = m;
          });
          DATA.fromCache = true;
          DATA.status = 'cached';
          DATA.lastSuccess = parsed.lastSuccess || null;
        }
      }
    } catch {}

    // Restore cached leagues catalog immediately so UI has competitions on first render
    try {
      const cached = localStorage.getItem('matchbay_leagues_cache');
      if (cached) {
        const leagues = JSON.parse(cached);
        if (Array.isArray(leagues) && leagues.length && (!DATA.leagues || !DATA.leagues.length)) {
          DATA.leagues = leagues;
          API.populateLeagues(leagues);
        }
      }
    } catch {}
  },
};

/* ============ 6. LANGUAGES & TRANSLATIONS ============ */
const TX = {
  fr: {
    Home: 'Accueil',
    Matches: 'Matchs',
    Tables: 'Classements',
    Profile: 'Profil',
    'Live Scores': 'Scores en direct',
    'Match details': 'Détails du match',
    'Official match statistics': 'Statistiques officielles',
    Lineups: 'Compositions',
    Plays: 'Actions',
    'Head to head': 'Face à face',
    'League tables': 'Classements des ligues',
    'Select a competition': 'Sélectionnez une compétition',
    'Clubs participating': 'Clubs engagés',
    'No matches found': 'Aucun match trouvé',
    'No matches scheduled': 'Aucun match prévu pour cette date',
    'No standings available': 'Aucun classement disponible pour cette saison',
    'Follow': 'Suivre',
    'Following': 'Suivi',
    'Saved matches': 'Matchs enregistrés',
  },
  ar: {
    Home: 'الرئيسية',
    Matches: 'المباريات',
    Tables: 'الترتيب',
    Profile: 'الملف',
    'Live Scores': 'النتائج المباشرة',
    'Match details': 'تفاصيل المباراة',
    'Official match statistics': 'إحصائيات المباراة',
    Lineups: 'التشكيلة',
    Plays: 'مجريات اللقاء',
    'Head to head': 'المواجهات المباشرة',
    'League tables': 'ترتيب الدوريات',
    'Select a competition': 'اختر المسابقة',
    'Clubs participating': 'الأندية المشاركة',
    'No matches found': 'لم يتم العثور على مباريات',
    'No matches scheduled': 'لا توجد مباريات مجدولة في هذا التاريخ',
    'No standings available': 'الترتيب غير متاح حالياً لهذا الموسم',
    'Follow': 'متابعة',
    'Following': 'تتابع',
    'Saved matches': 'المباريات المحفوظة',
  },
};
const t = (str) => (TX[S.lang] || {})[str] || str;

/* ============ 7. UI RENDERERS ============ */
const tst = (text) => {
  const x = document.getElementById('toast');
  if (x) {
    x.textContent = text;
    x.classList.add('on');
    setTimeout(() => x.classList.remove('on'), 1800);
  }
};

const getMatchByUid = (uid) =>
  Object.values(DATA.matches).find((m) => m.uid === uid) || S.savedMatches?.[uid] || null;

const toggleBookmark = (uid) => {
  const g = getMatchByUid(uid);
  if (S.bm[uid]) {
    delete S.bm[uid];
    delete S.savedMatches[uid];
  } else {
    S.bm[uid] = true;
    if (g) S.savedMatches[uid] = JSON.parse(JSON.stringify(g));
  }
  save();
};

const teamBadge = (teamCode, logo, sizeClass = 'crest') => {
  const initials = esc(String(teamCode || '—').slice(0, 3));
  return logo
    ? `<div class="${sizeClass} logo-wrap" style="position:relative;overflow:hidden;background:#183b3b">
        <span style="position:absolute;inset:0;display:grid;place-items:center;font-size:10px">${initials}</span>
        <img referrerpolicy="no-referrer" src="${esc(logo)}" alt="" loading="lazy" onerror="this.style.display='none'" style="position:relative;width:100%;height:100%;object-fit:contain">
      </div>`
    : `<div class="${sizeClass}" style="background:#183b3b">${initials}</div>`;
};

const datesBar = () =>
  `<div class="days">${API_OFFSETS.map((i) => {
    const d = dateISO(i);
    const date = new Date(`${d}T12:00:00`);
    const label = i === 0 ? 'Today' : i === -1 ? 'Yesterday' : i === 1 ? 'Tomorrow' : date.toLocaleDateString(undefined, { weekday: 'short' });
    return `<button class="day${S.D == i ? ' on' : ''}" data-d="${i}" aria-label="${esc(d)}"><span>${esc(label)}</span><b>${esc(d.slice(-2))}</b></button>`;
  }).join('')}</div>`;

const outdatedBanner = () => {
  if (DATA.fromCache || DATA.status === 'cached' || DATA.status === 'error') {
    return `<div class="outdated-banner">
      <span>⚠️</span>
      <span>${esc(DATA.lastError || 'Live service temporarily unreachable. Showing cached data which may be outdated.')}</span>
    </div>`;
  }
  return '';
};

const attribution = () =>
  `<div class="m" style="font-size:11px;text-align:center;padding:18px 6px 12px;line-height:1.6">
    Live football scores &amp; data powered by <a href="https://github.com/rezarahiminia/livescoreFootball" rel="noopener" target="_blank" style="color:var(--ac);text-decoration:none;font-weight:700">livescoreFootball</a>
    <br>Competition logos via <a href="https://football-logos.cc/" rel="noopener" target="_blank" style="color:var(--ac);text-decoration:none;font-weight:700">football-logos.cc</a> · Flag icons via <a href="https://github.com/lipis/flag-icons" rel="noopener" target="_blank" style="color:var(--ac);text-decoration:none;font-weight:700">flag-icons</a> (MIT)
    <br>Player cutouts courtesy of <a href="https://www.footyrenders.com/" target="_blank" rel="noopener" style="color:var(--ac);text-decoration:none;font-weight:700">FootyRenders</a>
  </div>`;

const miniCard = (g) => {
  if (!g) return '';
  const id = g.uid;
  const showScore = g.scoreAvailable && ['live', 'ft'].includes(g.st);
  const timeLabel =
    g.st === 'live'
      ? `<span class="live">LIVE</span><br>${esc(g.pr || g.when || 'In progress')}`
      : g.st === 'ft'
      ? (g.scoreAvailable ? 'FT' : 'Finished')
      : g.st === 'up'
      ? esc(g.tm || 'Scheduled')
      : esc(g.when || 'Status unavailable');

  const row = (name, logo, score) =>
    `<div class="r">${teamBadge(name, logo, 'cs')}<b title="${esc(name)}">${esc(name)}</b>${showScore ? `<em>${esc(score)}</em>` : ''}</div>`;

  return `<div class="mini${g.st === 'live' ? ' lv' : ''}" data-match="${esc(g.uid)}" role="button" tabindex="0" aria-label="Open ${esc(g.homeName)} vs ${esc(g.awayName)}">
    <div class="mt">${timeLabel}</div>
    <div class="tm">${row(g.homeName, g.homeLogo, g.a)}${row(g.awayName, g.awayLogo, g.b)}</div>
    ${!showScore && ['live', 'ft'].includes(g.st) ? `<span class="score-missing" title="Score unavailable">—</span>` : ''}
    <button class="bm${S.bm[id] ? ' on' : ''}" data-bm="${esc(id)}" aria-label="Save match">${svg('bm', 16)}</button>
  </div>`;
};

/* ============ 7.0 MATCHDAY STORIES & SHARING ============ */

const LEAGUE_COLOR = {
  'eng.1': '#00FF85', // Premier League
  'esp.1': '#FF7A00', // LaLiga
  'ger.1': '#E4003B', // Bundesliga
  'ita.1': '#1E88E5', // Serie A
  'fra.1': '#155DFB', // Ligue 1
  'ksa.1': '#00A651', // Saudi Pro League
  'usa.1': '#1560BD', // MLS
  'ned.1': '#FF6200', // Eredivisie
  'por.1': '#D4001F', // Liga Portugal
  'bra.1': '#009739', // Brasileirão
  'arg.1': '#75AADB', // Primera Argentina
  'tur.1': '#E30A17', // Süper Lig
  'mex.1': '#006847', // Liga MX
  'sco.1': '#1B365D', // Scottish Premiership
  'bel.1': '#000000', // Belgian Pro League
  'aut.1': '#DF0024', // Austrian Bundesliga
  'jpn.1': '#E60012', // J1 League
  'eng.2': '#F4A900', // Championship
  'eng.3': '#00A3E0', // League One
  'eng.4': '#4A90E2', // League Two
  'eng.fa': '#D4001F', // FA Cup
  'eng.league_cup': '#00A3E0', // League Cup / Carabao
  'esp.copa_del_rey': '#FFB81C', // Copa del Rey
  'esp.2': '#FF9E1B', // LaLiga 2
};

function getLeagueColor(slug) {
  if (LEAGUE_COLOR[slug]) return LEAGUE_COLOR[slug];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash << 5) - hash + slug.charCodeAt(i);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 85%, 55%)`;
}

const LEAGUE_CODES = {
  'eng.1': 'PL',
  'esp.1': 'LL',
  'ger.1': 'BL',
  'ita.1': 'SA',
  'fra.1': 'L1',
  'ksa.1': 'SPL',
  'usa.1': 'MLS',
  'ned.1': 'ERE',
  'por.1': 'PRT',
  'bra.1': 'BRA',
  'arg.1': 'ARG',
  'tur.1': 'TUR',
  'mex.1': 'MEX',
  'sco.1': 'SCO',
  'bel.1': 'BEL',
  'aut.1': 'AUT',
  'jpn.1': 'J1',
  'eng.2': 'EFL',
  'eng.3': 'L1',
  'eng.4': 'L2',
  'eng.fa': 'FAC',
  'eng.league_cup': 'EFLC',
  'esp.copa_del_rey': 'CDR',
  'esp.2': 'LL2',
};

const LEAGUE_SHORT_NAMES = {
  'eng.1': 'Premier',
  'esp.1': 'LaLiga',
  'ger.1': 'Bundesliga',
  'ita.1': 'Serie A',
  'fra.1': 'Ligue 1',
  'ksa.1': 'Saudi Pro',
  'usa.1': 'MLS',
  'ned.1': 'Eredivisie',
  'por.1': 'Primeira',
  'bra.1': 'Brasileirão',
  'arg.1': 'Argentina',
  'tur.1': 'Süper Lig',
  'mex.1': 'Liga MX',
  'sco.1': 'Premiership',
  'bel.1': 'Pro League',
  'aut.1': 'Bundesliga',
  'jpn.1': 'J.League',
  'eng.2': 'Championship',
  'eng.fa': 'FA Cup',
  'eng.league_cup': 'EFL Cup',
  'esp.copa_del_rey': 'Copa del Rey',
  'esp.2': 'LaLiga 2',
};

const matchLeagueLabel = (g) => {
  const meta = DATA.leaguesMap[g?.k] || {};
  const name = meta.name || g?.competitionName || 'Competition';
  const logoHtml = typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: g?.k || name, size: 24 }) : '';
  const flagHtml = typeof CountryFlag === 'function' ? CountryFlag({ competition: g?.k || name, country: meta.country || g?.competitionCountry, size: 16 }) : '';
  return `<span class="league-label" style="display:inline-flex;align-items:center;gap:6px">${logoHtml}<span class="league-name" style="display:inline-flex;align-items:center;gap:6px">${flagHtml}<span>${esc(name)}</span></span></span>`;
};

const cdn = (g) => {
  if (!g?.kickoff) return ['KICK-OFF', 'Time unavailable'];
  const ms = Date.parse(g.kickoff) - Date.now();
  if (ms <= 0) return ['KICK-OFF', 'Starting or in progress'];
  const p = (n) => String(n).padStart(2, '0');
  return [
    'KICK-OFF IN',
    `${p(Math.floor(ms / DAY_MS))}D : ${p(Math.floor((ms % DAY_MS) / 3600000))}H : ${p(Math.floor((ms % 3600000) / 60000))}M`,
  ];
};

const upc = (k) => {
  const all = Object.values(DATA.matches).filter((g) => g.k === k);
  const upcoming = all.filter((g) => g.st === 'up');
  const others = all.filter((g) => ['live', 'ft'].includes(g.st));

  upcoming.sort((a, b) => {
    const ta = a.kickoff ? Date.parse(a.kickoff) : (a.dateISO ? Date.parse(a.dateISO) : Infinity);
    const tb = b.kickoff ? Date.parse(b.kickoff) : (b.dateISO ? Date.parse(b.dateISO) : Infinity);
    return ta - tb;
  });

  const list = upcoming.length ? upcoming : others;
  return list.slice(0, 5).map((g) => ({ g, d: g.dateOffset || 0, j: g.j || 0 }));
};

// 6.2 Stories Mode & Round Detection Helper
function getLeagueRoundStoriesMode(k, now = Date.now()) {
  const meta = DATA.leaguesMap[k] || DATA.leagues.find((l) => l.slug === k) || {};
  const calendar = Array.isArray(meta.calendar) ? meta.calendar : [];

  let currentCluster = null;
  let nextKickoffUtc = null;
  if (typeof StoriesModeEngine !== 'undefined' && StoriesModeEngine.detectCurrentAndNextRounds) {
    const detected = StoriesModeEngine.detectCurrentAndNextRounds(calendar, now);
    currentCluster = detected.currentCluster;
    nextKickoffUtc = detected.nextKickoffUtc;
  }

  const allLeagueMatches = Object.values(DATA.matches).filter((m) => m.k === k);

  let roundMatches = [];
  let roundName = (meta.name || k) + ' Round';

  if (currentCluster && Array.isArray(currentCluster.dates) && currentCluster.dates.length) {
    roundName = `Matchday ${currentCluster.index}`;
    const dateSet = new Set(currentCluster.dates);
    roundMatches = allLeagueMatches.filter((m) => {
      const dIso = m.dateISO || (m.kickoff ? m.kickoff.slice(0, 10) : '');
      return dateSet.has(dIso);
    });
  }

  // If calendar cluster matches not in local memory, check finished matches
  if (!roundMatches.length && allLeagueMatches.length) {
    const finishedMatches = allLeagueMatches.filter((m) => m.st === 'ft' || m.st === 'postponed' || m.st === 'cancelled');
    if (finishedMatches.length) {
      finishedMatches.sort((a, b) => (Date.parse(b.kickoff || b.dateISO || 0) || 0) - (Date.parse(a.kickoff || a.dateISO || 0) || 0));
      const latest = finishedMatches[0];
      const targetRound = latest.round || latest.dateISO;
      roundName = latest.round || `Matchday ${latest.dateISO || ''}`;
      roundMatches = allLeagueMatches.filter((m) => (m.round && m.round === targetRound) || (m.dateISO && m.dateISO === latest.dateISO));
    }
  }

  if (!nextKickoffUtc && allLeagueMatches.length) {
    const upcoming = allLeagueMatches.filter((m) => m.st === 'up');
    if (upcoming.length) {
      upcoming.sort((a, b) => (Date.parse(a.kickoff || 0) || 0) - (Date.parse(b.kickoff || 0) || 0));
      nextKickoffUtc = upcoming[0].kickoff || null;
    }
  }

  const storyMatches = roundMatches.map((m) => {
    const scorers = (typeof StoriesModeEngine !== 'undefined' && StoriesModeEngine.extractScorers)
      ? StoriesModeEngine.extractScorers(m)
      : [];
    return {
      id: m.uid || m.id,
      uid: m.uid,
      leagueSlug: m.k,
      competitionName: m.competitionName,
      roundName: m.round || roundName,
      homeName: m.homeName,
      awayName: m.awayName,
      homeLogo: m.homeLogo,
      awayLogo: m.awayLogo,
      homeScore: m.a,
      awayScore: m.b,
      homeShootoutScore: m.raw?.competitions?.[0]?.competitors?.find((c) => c.homeAway === 'home')?.shootoutScore ?? null,
      awayShootoutScore: m.raw?.competitions?.[0]?.competitors?.find((c) => c.homeAway === 'away')?.shootoutScore ?? null,
      status: m.st,
      statusDetail: m.raw?.status?.type?.detail || m.raw?.status?.type?.shortDetail || (m.st === 'ft' ? 'FT' : m.when),
      kickoff: m.kickoff || m.dateISO,
      venue: m.venue,
      scorers,
      raw: m.raw,
      g: m,
    };
  });

  const storiesMode = (typeof StoriesModeEngine !== 'undefined' && StoriesModeEngine.getStoriesMode)
    ? StoriesModeEngine.getStoriesMode({
        currentRound: { name: roundName, matches: storyMatches },
        nextRoundFirstKickoffUtc: nextKickoffUtc,
        nowUtc: now,
      })
    : { mode: 'default', reason: 'engine_missing', finishedCount: 0, postponedCount: 0, cancelledCount: 0, totalMatches: 0, isAllConcluded: false };

  return {
    modeResult: storiesMode,
    storyMatches,
    roundName,
    nextKickoffUtc,
    currentCluster,
    allLeagueMatches,
  };
}

const stv_ = document.getElementById('stv');
let SG = null;
let SGT = null;

function stRender() {
  if (!SG || !SG.list.length || !stv_) return;
  const { k, list, i, mode, roundName } = SG;
  const item = list[i];
  const g = item.g || item;
  const fav = Boolean(S.bm[g.uid]);

  // Handle RESULTS MODE
  if (mode === 'results') {
    const badgeInfo = (typeof StoriesModeEngine !== 'undefined' && StoriesModeEngine.formatMatchResultBadge)
      ? StoriesModeEngine.formatMatchResultBadge(g)
      : { badge: 'FINAL RESULT', scoreText: `${g.a ?? 0} – ${g.b ?? 0}`, isPostponed: g.st === 'postponed', isCancelled: g.st === 'cancelled', isPenalties: false, isExtraTime: false };

    const kickoffText = (typeof StoriesModeEngine !== 'undefined' && StoriesModeEngine.formatKickoffLocal)
      ? StoriesModeEngine.formatKickoffLocal(g.kickoff)
      : (g.dateISO || 'Match completed');

    const scorers = Array.isArray(g.scorers) && g.scorers.length
      ? g.scorers
      : ((typeof StoriesModeEngine !== 'undefined' && StoriesModeEngine.extractScorers) ? StoriesModeEngine.extractScorers(g) : []);

    const homeScoreDisplay = badgeInfo.isPostponed ? '—' : (g.a !== null ? g.a : '—');
    const awayScoreDisplay = badgeInfo.isPostponed ? '—' : (g.b !== null ? g.b : '—');

    stv_.innerHTML = `
      <div class="sgp">
        ${list.map((_, x) => `<span><i style="width:${x < i ? 100 : x === i ? Math.min(100, SG.t / 90) : 0}%"></i></span>`).join('')}
      </div>
      <header class="sgt">
        <div class="sgb">
          <div class="sgm">M</div>
          <div>MATCHBAY<small>ROUND RESULTS · ${esc(roundName || 'MATCHDAY')}</small></div>
        </div>
        <div class="r" style="gap:7px">
          <button class="sgi" data-sa="pause" aria-label="Pause results slide">${SG.p ? '▶' : 'Ⅱ'}</button>
          <button class="sgi" data-sa="close" aria-label="Close story viewer">×</button>
        </div>
      </header>
      <section class="sgl">
        <div class="sgpill">${matchLeagueLabel(g)}</div>
        <div class="sgmd">${esc(kickoffText)}</div>
      </section>
      <section class="sgh">
        <div class="sge">ROUND RESULTS</div>
        <h1>${esc(g.homeName)} <em>${esc(badgeInfo.scoreText)}</em> ${esc(g.awayName)}</h1>
      </section>
      <section class="sgv">
        <div class="sgtm">
          ${teamBadge(g.homeName, g.homeLogo, 'sgk')}
          <b title="${esc(g.homeName)}">${esc(g.homeName)}</b>
          <small>HOME</small>
        </div>
        <div class="sg-results-center">
          <div class="sg-results-score">
            <span>${esc(String(homeScoreDisplay))}</span>
            <span style="opacity:0.5;font-size:24px">–</span>
            <span>${esc(String(awayScoreDisplay))}</span>
          </div>
          ${badgeInfo.shootoutText ? `<div class="sg-results-shootout">${esc(badgeInfo.shootoutText)}</div>` : ''}
          <div class="sg-badge-pill ${badgeInfo.isPostponed ? 'postponed' : badgeInfo.isCancelled ? 'cancelled' : 'ft'}">${esc(badgeInfo.badge)}</div>
        </div>
        <div class="sgtm">
          ${teamBadge(g.awayName, g.awayLogo, 'sgk')}
          <b title="${esc(g.awayName)}">${esc(g.awayName)}</b>
          <small>AWAY</small>
        </div>
      </section>
      <section class="sgn" style="top:47%">
        ${scorers.length ? `
          <div class="sg-scorers-box">
            ${scorers.map((s) => {
              const photoUrl = (typeof window !== 'undefined' && window.PlayerSpotlight && window.PlayerSpotlight.getSpotlightPlayerPhoto)
                ? window.PlayerSpotlight.getSpotlightPlayerPhoto({ name: s.player })
                : '';
              return `
                <div class="sg-scorer-row">
                  <span class="min">${esc(s.minute || '⚽')}</span>
                  ${photoUrl ? `<img referrerpolicy="no-referrer" loading="lazy" src="${esc(photoUrl)}" alt="${esc(s.player)}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;vertical-align:middle;margin:0 4px;border:1px solid rgba(255,255,255,.2);flex:none" onerror="this.remove()" />` : ''}
                  <span style="font-weight:700">${esc(s.player)}</span>
                  <span class="m" style="font-size:10px">(${s.team === 'home' ? esc(g.homeName) : esc(g.awayName)})</span>
                  ${s.isPenalty ? '<span class="m" style="font-size:9px">(P)</span>' : ''}
                  ${s.isOwnGoal ? '<span class="m" style="font-size:9px">(OG)</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="sgdt">${esc(badgeInfo.isPostponed ? 'Match postponed to a future date' : 'Official Full-Time Result')}</div>
          <div class="sgcd"><span>⚽</span><span>${esc(g.homeName)} ${esc(badgeInfo.scoreText)} ${esc(g.awayName)}</span></div>
        `}
      </section>
      <section class="sgcard">
        <div class="r sb">
          <div class="sgcl">MATCH DETAILS</div>
          <div class="sgst">${esc(badgeInfo.isPostponed ? 'POSTPONED' : 'FULL TIME')}</div>
        </div>
        <div class="sgvn">${esc(g.venue || 'Venue confirmed')}</div>
        <div class="sgvs2">${matchLeagueLabel(g)}</div>
        <div class="sgdv"></div>
        <div class="r" style="gap:8px">
          <button class="sgpr" data-sa="mc">MATCH CENTRE ↗</button>
          <button class="sgsc${fav ? ' on' : ''}" data-sa="fav" aria-label="Save match">${fav ? '♥' : '♡'}</button>
          <button class="sgsc" data-sa="share" aria-label="Share">↗</button>
        </div>
      </section>
      <div class="sgfoot">ROUND RESULTS · MATCHBAY LIVE SCORES</div>
      <div class="sgz">
        <button data-sa="prev" aria-label="Previous match"></button>
        <button data-sa="next" aria-label="Next match"></button>
      </div>
    `;
    return;
  }

  // DEFAULT FIXTURE PREVIEW MODE
  const dt = g.kickoff ? new Date(g.kickoff) : null;
  const c = cdn(g);
  const dl = dt
    ? dt.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    : (g.dateISO || 'Date unavailable');

  const tm = (teamName, logo) => `
    <div class="sgtm">
      ${teamBadge(teamName, logo, 'sgk')}
      <b title="${esc(teamName)}">${esc(teamName)}</b>
      <small>TEAM</small>
    </div>
  `;

  stv_.innerHTML = `
    <div class="sgp">
      ${list.map((_, x) => `<span><i style="width:${x < i ? 100 : x === i ? Math.min(100, SG.t / 90) : 0}%"></i></span>`).join('')}
    </div>
    <header class="sgt">
      <div class="sgb">
        <div class="sgm">M</div>
        <div>MATCHBAY<small>FIXTURE PREVIEW</small></div>
      </div>
      <div class="r" style="gap:7px">
        <button class="sgi" data-sa="pause" aria-label="Pause preview">${SG.p ? '▶' : 'Ⅱ'}</button>
        <button class="sgi" data-sa="close" aria-label="Close preview">×</button>
      </div>
    </header>
    <section class="sgl">
      <div class="sgpill">${matchLeagueLabel(g)}</div>
      <div class="sgmd">${esc(dl)}</div>
    </section>
    <section class="sgh">
      <div class="sge">UPCOMING FIXTURE</div>
      <h1>${esc(g.homeName)} <em>vs</em> ${esc(g.awayName)}</h1>
    </section>
    <section class="sgv">
      ${tm(g.homeName, g.homeLogo)}
      <div class="sgvs">VS</div>
      ${tm(g.awayName, g.awayLogo)}
    </section>
    <section class="sgn">
      <div class="sgdt">${esc(dt ? dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Kick-off time unavailable')}</div>
      <div class="sgcd"><span>◷</span><span>${esc(c[0])}</span><b id="sgc">${esc(c[1])}</b></div>
    </section>
    <section class="sgcard">
      <div class="r sb">
        <div class="sgcl">MATCH DETAILS</div>
        <div class="sgst">${esc(g.st === 'up' ? 'SCHEDULED' : g.st === 'live' ? 'LIVE' : 'FINISHED')}</div>
      </div>
      <div class="sgvn">${esc(g.venue || 'Venue not supplied')}</div>
      <div class="sgvs2">${matchLeagueLabel(g)}</div>
      <div class="sgdv"></div>
      <div class="r" style="gap:8px">
        <button class="sgpr" data-sa="mc">MATCH CENTRE ↗</button>
        <button class="sgsc${fav ? ' on' : ''}" data-sa="fav" aria-label="Save match">${fav ? '♥' : '♡'}</button>
        <button class="sgsc" data-sa="share" aria-label="Share">↗</button>
      </div>
    </section>
    <div class="sgfoot">FIXTURE DATA BY LIVESCOREFOOTBALL</div>
    <div class="sgz">
      <button data-sa="prev" aria-label="Previous match"></button>
      <button data-sa="next" aria-label="Next match"></button>
    </div>
  `;
}

async function stOpen(k) {
  let modeInfo = getLeagueRoundStoriesMode(k);

  // If already in results mode and story matches are loaded
  if (modeInfo.modeResult.mode === 'results' && modeInfo.storyMatches.length > 0) {
    const list = modeInfo.storyMatches.map((m) => ({ g: m.g || m, d: 0, j: 0 }));
    SG = { k, mode: 'results', list, i: 0, t: 0, p: false, roundName: modeInfo.roundName, cutoffTimeUtc: modeInfo.modeResult.cutoffTimeUtc };
    S.wv[k] = true;
    save();
    if (stv_) {
      stv_.hidden = false;
      stRender();
      clearInterval(SGT);
      SGT = setInterval(stTick, 100);
    }
    return;
  }

  // If in results mode according to calendar but matches need to be fetched for that round
  if (modeInfo.currentCluster && modeInfo.currentCluster.dates && modeInfo.currentCluster.dates.length) {
    try {
      const datesToFetch = modeInfo.currentCluster.dates.slice(-2);
      for (const dStr of datesToFetch) {
        const dNum = dStr.replace(/-/g, '');
        const res = await API.get(`${CONFIG.PREFIX}/${k}/scoreboard`, { dates: dNum });
        const events = Array.isArray(res.events) ? res.events : [];
        if (events.length) {
          const meta = DATA.leaguesMap[k] || {};
          const adapted = adaptEvents(events, k, meta);
          adapted.forEach((m, idx) => {
            m.dateOffset = 0;
            m.j = idx;
            DATA.matches[`${k}:${dStr}:${idx}`] = m;
          });
        }
      }
      modeInfo = getLeagueRoundStoriesMode(k);
      if (modeInfo.modeResult.mode === 'results' && modeInfo.storyMatches.length > 0) {
        const list = modeInfo.storyMatches.map((m) => ({ g: m.g || m, d: 0, j: 0 }));
        SG = { k, mode: 'results', list, i: 0, t: 0, p: false, roundName: modeInfo.roundName, cutoffTimeUtc: modeInfo.modeResult.cutoffTimeUtc };
        S.wv[k] = true;
        save();
        if (stv_) {
          stv_.hidden = false;
          stRender();
          clearInterval(SGT);
          SGT = setInterval(stTick, 100);
        }
        return;
      }
    } catch {}
  }

  // Otherwise, default fixture preview mode
  let list = upc(k);
  if (!list.length) {
    try {
      const todayNum = toYYYYMMDD(dateISO(0));
      const res = await API.get(`${CONFIG.PREFIX}/${k}/scoreboard`, { dates: todayNum });
      const events = Array.isArray(res.events) ? res.events : [];
      if (events.length) {
        const meta = DATA.leaguesMap[k] || {};
        const adapted = adaptEvents(events, k, meta);
        adapted.forEach((m, idx) => {
          m.dateOffset = 0;
          m.j = idx;
          DATA.matches[`${k}:0:${idx}`] = m;
        });
        list = upc(k);
      }
    } catch {}
  }

  if (!list.length) {
    const anyMatches = Object.values(DATA.matches).filter((m) => m.k === k);
    if (anyMatches.length) {
      list = anyMatches.slice(0, 5).map((g) => ({ g, d: g.dateOffset || 0, j: g.j || 0 }));
    }
  }

  if (!list.length) {
    tst('No matches currently stored for this competition.');
    return;
  }

  SG = { k, mode: 'default', list, i: 0, t: 0, p: false };
  S.wv[k] = true;
  save();
  if (stv_) {
    stv_.hidden = false;
    stRender();
    clearInterval(SGT);
    SGT = setInterval(stTick, 100);
  }
}

function stClose() {
  clearInterval(SGT);
  SG = null;
  if (stv_) {
    stv_.hidden = true;
    stv_.innerHTML = '';
  }
  draw();
}

function stGo(n) {
  if (!SG?.list?.length) return;
  SG.i = (SG.i + n + SG.list.length) % SG.list.length;
  SG.t = 0;
  stRender();
}

function stTick() {
  if (!SG || SG.p || !stv_) return;
  SG.t += 100;
  const f = stv_.querySelectorAll('.sgp i')[SG.i];
  if (f) f.style.width = Math.min(100, SG.t / 90) + '%';
  const item = SG.list[SG.i];
  const g = item?.g || item;
  if (SG.mode !== 'results') {
    const c = cdn(g);
    const e = document.getElementById('sgc');
    if (e) e.textContent = c[1];
  }
  if (SG.t >= 9000) stGo(1);
}

function scoreCardText(g) {
  const result = g.scoreAvailable && ['live', 'ft'].includes(g.st) ? `${g.a} – ${g.b}` : g.st === 'up' ? 'VS' : 'Score unavailable';
  return `${g.homeName} ${result} ${g.awayName} · ${g.competitionName || 'MatchBay'} · ${g.when || g.dateISO || ''}`;
}

async function createScoreCardBlob(g) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const bg = ctx.createLinearGradient(0, 0, 1200, 630);
    bg.addColorStop(0, '#102c2c');
    bg.addColorStop(0.55, '#071516');
    bg.addColorStop(1, '#050d0e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = 'rgba(63,214,192,.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 1128, 558);

    ctx.fillStyle = '#3fd6c0';
    ctx.fillRect(72, 72, 8, 42);
    ctx.fillStyle = '#eaf6f4';
    ctx.font = '800 36px Sora, Arial, sans-serif';
    ctx.fillText('MatchBay', 96, 103);

    ctx.fillStyle = '#93aaa7';
    ctx.font = '600 21px Sora, Arial, sans-serif';
    ctx.fillText(String(g.competitionName || 'FOOTBALL SCORE').toUpperCase().slice(0, 72), 72, 160, 1050);

    const initials = (name) =>
      String(name || '?').trim().split(/\s+/).map((x) => x[0] || '').join('').slice(0, 3).toUpperCase();

    const badge = (x, abbr) => {
      ctx.beginPath();
      ctx.arc(x, 300, 58, 0, Math.PI * 2);
      ctx.fillStyle = '#183b3b';
      ctx.fill();
      ctx.strokeStyle = 'rgba(63,214,192,.55)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#3fd6c0';
      ctx.font = '800 30px Sora, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(abbr, x, 310, 100);
    };

    badge(255, initials(g.homeName));
    badge(945, initials(g.awayName));
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eaf6f4';
    ctx.font = '700 32px Sora, Arial, sans-serif';
    ctx.fillText(String(g.homeName || 'Home').slice(0, 28), 255, 405, 390);
    ctx.fillText(String(g.awayName || 'Away').slice(0, 28), 945, 405, 390);

    ctx.fillStyle = g.st === 'live' ? '#ff7777' : '#eaf6f4';
    ctx.font = '800 62px Sora, Arial, sans-serif';
    const score = g.scoreAvailable && ['live', 'ft'].includes(g.st) ? `${g.a} – ${g.b}` : g.st === 'up' ? 'VS' : '—';
    ctx.fillText(score, 600, 317, 260);

    ctx.fillStyle = '#93aaa7';
    ctx.font = '600 20px Sora, Arial, sans-serif';
    const status = g.st === 'live' ? 'LIVE' : g.st === 'ft' ? 'FULL TIME' : g.st === 'up' ? 'UPCOMING' : String(g.when || 'STATUS UNAVAILABLE').toUpperCase();
    ctx.fillText(status, 600, 362, 300);

    ctx.fillStyle = '#93aaa7';
    ctx.font = '500 17px Sora, Arial, sans-serif';
    ctx.fillText(`${g.kickoff ? new Date(g.kickoff).toLocaleString() : g.dateISO || ''}  ·  MatchBay Football`, 600, 535, 1000);

    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } catch (e) {
    return null;
  }
}

async function shareMatchScore(uid) {
  const g = getMatchByUid(uid);
  if (!g) return;
  const text = scoreCardText(g);
  try {
    const blob = await createScoreCardBlob(g);
    if (blob) {
      const file = new File([blob], `matchbay-${String(g.uid).replace(/[^a-z0-9-]/gi, '-').slice(-48)}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'MatchBay score card', text });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matchbay-score-${String(g.dateISO || 'match').replace(/[^0-9-]/g, '')}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
      tst('Score card downloaded as PNG');
      return;
    }
  } catch (e) {
    if (e?.name === 'AbortError') return;
  }

  if (navigator.share) {
    navigator.share({ title: 'MatchBay score', text }).catch(() => {});
  } else if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => tst('Match details copied')).catch(() => tst(text));
  } else {
    tst(text);
  }
}

/* ============ 7.05 FEATURED MATCH HERO ============ */
let heroCountdownTimer = null;
let heroLiveMinuteTimer = null;
let lastAriaMinuteUpdate = 0;
let currentFeaturedMatchUid = null;

function renderFeaturedHero(dayMatches, dayISO, precalculatedFeatured) {
  // If loading and no matches, render skeleton without layout shift
  if (DATA.loadingDates[dayISO] && (!dayMatches || dayMatches.length === 0)) {
    return `
      <section class="hero-skeleton" aria-label="Loading featured match">
        <div class="sk-row">
          <div class="sk-block" style="width:140px;height:24px;"></div>
          <div class="sk-block" style="width:78px;height:24px;border-radius:99px;"></div>
        </div>
        <div class="teams" style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin:22px 0 10px;">
          <div style="text-align:center;">
            <div class="sk-block" style="width:76px;height:76px;border-radius:50%;margin:0 auto 9px;"></div>
            <div class="sk-block" style="width:84px;height:14px;margin:0 auto;"></div>
          </div>
          <div style="min-width:84px;text-align:center;">
            <span class="sk-block" style="display:inline-block;width:28px;height:14px;"></span>
          </div>
          <div style="text-align:center;">
            <div class="sk-block" style="width:76px;height:76px;border-radius:50%;margin:0 auto 9px;"></div>
            <div class="sk-block" style="width:84px;height:14px;margin:0 auto;"></div>
          </div>
        </div>
        <div class="sk-block" style="width:100%;height:68px;border-radius:14px;margin-top:16px;"></div>
        <div class="sk-block" style="width:100%;height:46px;border-radius:14px;margin-top:14px;"></div>
      </section>
    `;
  }

  let featured = precalculatedFeatured !== undefined ? precalculatedFeatured : null;
  if (!featured && typeof pickFeaturedMatch === 'function') {
    featured = pickFeaturedMatch(dayMatches);
    if (!featured) {
      featured = pickFeaturedMatch(Object.values(DATA.matches));
    }
  }

  if (!featured) {
    currentFeaturedMatchUid = null;
    return '';
  }

  currentFeaturedMatchUid = featured.uid;
  const g = featured;
  const isLive = g.st === 'live';

  const homeColor = g.A?.[1] && g.A[1] !== '#183b3b' ? g.A[1] : (typeof getLeagueColor === 'function' ? getLeagueColor(g.k) : '#19e3b1');
  const awayColor = g.B?.[1] && g.B[1] !== '#183b3b' ? g.B[1] : '#ff5d5d';

  const teamRingInner = (teamName, teamCode, logo) => {
    const initials = esc(String(teamCode || teamName || '?').slice(0, 3).toUpperCase());
    if (logo) {
      return `<i>
        <span style="position:absolute;inset:0;display:grid;place-items:center;font-size:16px;font-weight:800;color:#e8f6f4;">${initials}</span>
        <img referrerpolicy="no-referrer" src="${esc(logo)}" alt="${esc(teamName)}" loading="lazy" onerror="this.style.display='none'" style="position:relative;width:72%;height:72%;object-fit:contain;display:block;">
      </i>`;
    }
    return `<i>${initials}</i>`;
  };

  const compLogo = typeof CompetitionLogo === 'function'
    ? CompetitionLogo({ competition: g.k || g.competitionName, size: 30 })
    : '';

  const roundText = g.round || (DATA.leaguesMap[g.k]?.name ? 'Regular Season' : 'Featured match');

  if (isLive) {
    const liveMin = typeof parseLiveMinute === 'function'
      ? parseLiveMinute(g.pr, g.when, g.raw?.status?.type?.name)
      : { displayMinute: g.pr || g.when || 'LIVE', hasApostrophe: true, phase: 'In progress', percent: 50 };

    const scoreA = g.scoreAvailable && g.a !== null ? g.a : 0;
    const scoreB = g.scoreAvailable && g.b !== null ? g.b : 0;

    return `
      <section class="hero featured-hero live" id="hero" data-match="${esc(g.uid)}" role="region" aria-label="Featured match live: ${esc(g.homeName)} vs ${esc(g.awayName)}">
        <div class="top">
          <div class="comp">
            ${compLogo}
            <div>
              <b style="display:inline-flex;align-items:center;gap:6px">${typeof CountryFlag === 'function' ? CountryFlag({ competition: g.k || g.competitionName, country: g.competitionCountry || DATA.leaguesMap[g.k]?.country, size: 16 }) : ''}<span>${esc(g.competitionName || 'Football')}</span></b>
              <small>${esc(roundText)}</small>
            </div>
          </div>
          <span class="pill lv"><span class="dot" aria-hidden="true"></span>LIVE</span>
        </div>

        <div class="teams">
          <div class="team">
            <div class="ring" style="--c:${homeColor}">
              ${teamRingInner(g.homeName, g.A?.[0], g.homeLogo)}
            </div>
            <span title="${esc(g.homeName)}">${esc(g.homeName)}</span>
          </div>
          <div class="mid">
            <div class="score">${scoreA}<s>-</s>${scoreB}</div>
          </div>
          <div class="team">
            <div class="ring" style="--c:${awayColor}">
              ${teamRingInner(g.awayName, g.B?.[0], g.awayLogo)}
            </div>
            <span title="${esc(g.awayName)}">${esc(g.awayName)}</span>
          </div>
        </div>

        <div class="minute" role="timer" aria-label="Match minute ${liveMin.displayMinute}">
          <div class="m" id="hero-live-minute">${liveMin.displayMinute}${liveMin.hasApostrophe ? '<em>\'</em>' : ''}</div>
          <small id="hero-live-phase">${esc(liveMin.phase)}</small>
          <div class="bar" aria-hidden="true">
            <i id="hero-live-bar" style="width:${liveMin.percent}%"></i>
            <u></u>
          </div>
        </div>

        <button class="btn" data-match="${esc(g.uid)}" aria-label="Follow ${esc(g.homeName)} vs ${esc(g.awayName)} live">Follow live</button>
      </section>
    `;
  } else {
    const cd = typeof getKickoffCountdown === 'function'
      ? getKickoffCountdown(g.kickoff)
      : { days: '00', hours: '00', minutes: '00', seconds: '00', isPassed: false };

    let kickoffMeta = '';
    if (g.kickoff) {
      try {
        const d = new Date(g.kickoff);
        const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
        const day = d.getDate();
        const month = d.toLocaleDateString(undefined, { month: 'short' });
        const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        kickoffMeta = `Kicks off ${weekday} ${day} ${month} at ${time}`;
      } catch {}
    }
    if (!kickoffMeta && g.dateISO) {
      kickoffMeta = `Kicks off ${localDateText(g.dateISO)}${g.tm ? ` at ${g.tm}` : ''}`;
    }
    if (g.venue) {
      kickoffMeta += kickoffMeta ? `, ${g.venue}` : g.venue;
    }
    if (!kickoffMeta) {
      kickoffMeta = 'Upcoming kickoff';
    }

    const ariaLabel = `Kickoff in ${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes`;

    return `
      <section class="hero featured-hero" id="hero" data-match="${esc(g.uid)}" role="region" aria-label="Featured match: ${esc(g.homeName)} vs ${esc(g.awayName)}">
        <div class="top">
          <div class="comp">
            ${compLogo}
            <div>
              <b style="display:inline-flex;align-items:center;gap:6px">${typeof CountryFlag === 'function' ? CountryFlag({ competition: g.k || g.competitionName, country: g.competitionCountry || DATA.leaguesMap[g.k]?.country, size: 16 }) : ''}<span>${esc(g.competitionName || 'Football')}</span></b>
              <small>${esc(roundText)}</small>
            </div>
          </div>
          <span class="pill up">Most popular</span>
        </div>

        <div class="teams">
          <div class="team">
            <div class="ring" style="--c:${homeColor}">
              ${teamRingInner(g.homeName, g.A?.[0], g.homeLogo)}
            </div>
            <span title="${esc(g.homeName)}">${esc(g.homeName)}</span>
          </div>
          <div class="mid">
            <div class="vs">vs</div>
          </div>
          <div class="team">
            <div class="ring" style="--c:${awayColor}">
              ${teamRingInner(g.awayName, g.B?.[0], g.awayLogo)}
            </div>
            <span title="${esc(g.awayName)}">${esc(g.awayName)}</span>
          </div>
        </div>

        <div class="count" role="timer" id="hero-countdown" aria-label="${ariaLabel}">
          <div class="cell"><strong id="hero-d">${cd.days}</strong><span>Days</span></div>
          <div class="cell"><strong id="hero-hh">${cd.hours}</strong><span>Hours</span></div>
          <div class="cell"><strong id="hero-mm">${cd.minutes}</strong><span>Min</span></div>
          <div class="cell sec"><strong id="hero-ss">${cd.seconds}</strong><span>Sec</span></div>
        </div>

        <div class="meta">${esc(kickoffMeta)}</div>

        <button class="btn" data-match="${esc(g.uid)}" aria-label="View match details for ${esc(g.homeName)} vs ${esc(g.awayName)}">Match details</button>
      </section>
    `;
  }
}

function tickHeroCountdown() {
  if (document.hidden) return;
  const featured = currentFeaturedMatchUid ? getMatchByUid(currentFeaturedMatchUid) : null;
  if (!featured || featured.st !== 'up') return;

  const cd = typeof getKickoffCountdown === 'function'
    ? getKickoffCountdown(featured.kickoff)
    : null;
  if (!cd) return;

  const elD = document.getElementById('hero-d');
  const elH = document.getElementById('hero-hh');
  const elM = document.getElementById('hero-mm');
  const elS = document.getElementById('hero-ss');
  if (elD) elD.textContent = cd.days;
  if (elH) elH.textContent = cd.hours;
  if (elM) elM.textContent = cd.minutes;
  if (elS) elS.textContent = cd.seconds;

  const now = Date.now();
  if (now - lastAriaMinuteUpdate > 55000) {
    lastAriaMinuteUpdate = now;
    const countEl = document.getElementById('hero-countdown');
    if (countEl) {
      countEl.setAttribute('aria-label', `Kickoff in ${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes`);
    }
  }

  // Never show negative numbers; transition to live when reaches zero
  if (cd.isPassed) {
    featured.st = 'live';
    featured.when = '1\'';
    featured.pr = '1\'';
    draw();
    API.loadOffset(S.D, { force: true }).then(() => draw());
  }
}

function tickHeroLiveMinute() {
  if (document.hidden) return;
  const featured = currentFeaturedMatchUid ? getMatchByUid(currentFeaturedMatchUid) : null;
  if (!featured || featured.st !== 'live') return;

  const parsed = typeof parseLiveMinute === 'function'
    ? parseLiveMinute(featured.pr, featured.when, featured.raw?.status?.type?.name)
    : null;
  if (!parsed || parsed.isSpecial) return;

  const num = Number(parsed.displayMinute);
  if (Number.isFinite(num) && num < 90) {
    const newMin = num + 1;
    featured.pr = `${newMin}'`;
    featured.when = `${newMin}'`;

    const minEl = document.getElementById('hero-live-minute');
    if (minEl) {
      minEl.innerHTML = `${newMin}<em>'</em>`;
    }
    const barEl = document.getElementById('hero-live-bar');
    if (barEl) {
      barEl.style.width = `${Math.min(100, (newMin / 90) * 100)}%`;
    }
    const phaseEl = document.getElementById('hero-live-phase');
    if (phaseEl) {
      phaseEl.textContent = newMin <= 45 ? 'First half' : 'Second half';
    }
  }
}

function startHeroTimers() {
  stopHeroTimers();
  heroCountdownTimer = setInterval(tickHeroCountdown, 1000);
  heroLiveMinuteTimer = setInterval(tickHeroLiveMinute, 60000);
}

function stopHeroTimers() {
  if (heroCountdownTimer) {
    clearInterval(heroCountdownTimer);
    heroCountdownTimer = null;
  }
  if (heroLiveMinuteTimer) {
    clearInterval(heroLiveMinuteTimer);
    heroLiveMinuteTimer = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopHeroTimers();
  } else {
    tickHeroCountdown();
    tickHeroLiveMinute();
    if (S.tab === 'home') {
      startHeroTimers();
    }
  }
});

// 7.1 Home View
function home() {
  const dayISO = dateISO(S.D);
  const dayMatches = Object.values(DATA.matches).filter((m) => m.dateISO === dayISO);
  const allKnownMatches = Object.values(DATA.matches);

  // 1. Determine featured match using pure pickFeaturedMatch
  // If selected day has a live/upcoming match, pick it; otherwise pick from all loaded matches within 24h / overall
  let featured = typeof pickFeaturedMatch === 'function' ? pickFeaturedMatch(dayMatches) : null;
  if (!featured && typeof pickFeaturedMatch === 'function') {
    featured = pickFeaturedMatch(allKnownMatches);
  }

  // 2. Remove featured match from the normal list below so it is NEVER shown twice
  const filteredMatches = featured
    ? dayMatches.filter((m) => m.uid !== featured.uid)
    : dayMatches;

  const liveMatches = filteredMatches.filter((m) => m.st === 'live');
  const trending = filteredMatches.filter((m) => ['live', 'ft', 'up'].includes(m.st)).slice(0, 8);

  const priorityOrder = [
    'eng.1',
    'esp.1',
    'ita.1',
    'ger.1',
    'fra.1',
    'ksa.1',
    'usa.1',
    'ned.1',
    'por.1',
    'bra.1',
    'arg.1',
    'tur.1',
    'mex.1',
    'eng.2',
    'eng.fa',
    'esp.copa_del_rey',
    'jpn.1',
    'sco.1',
    'bel.1',
    'aut.1',
  ];

  const sortedLeagues = [...DATA.leagues].sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.slug);
    const idxB = priorityOrder.indexOf(b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  const storiesList = sortedLeagues.length
    ? sortedLeagues.slice(0, 20)
    : priorityOrder.map((slug) => ({
        slug,
        name: slug,
        country: 'International',
        flag: '⚽',
      }));

  const storiesHtml = storiesList
    .map((l) => {
      const slug = l.slug;
      const color = getLeagueColor(slug);
      const shortCode = LEAGUE_CODES[slug] || (l.abbreviation || l.name || slug).slice(0, 3).toUpperCase();
      const shortName =
        LEAGUE_SHORT_NAMES[slug] ||
        l.abbreviation ||
        (l.name || slug).replace(/^(English|Spanish|German|Italian|French|Portuguese|Dutch|Saudi|American)\s+/i, '').slice(0, 10);
      const isWatched = Boolean(S.wv?.[slug]);
      const isPulse = PULSE === slug;
      const flagHtml = typeof CountryFlag === 'function'
        ? CountryFlag({ competition: slug, country: l.country, size: 18, marginRight: 0 })
        : (l.flagUrl ? `<img referrerpolicy="no-referrer" src="${esc(l.flagUrl)}" alt="" onerror="this.remove()">` : esc(l.flag || countryFlag(l.country) || '⚽'));

      const logoCircle = typeof CompetitionLogo === 'function'
        ? CompetitionLogo({ competition: slug, size: 68, glow: !isWatched, alt: l.name })
        : `<div class="comp-logo-circle" style="width:68px;height:68px"><div class="comp-logo-disc"><span class="comp-logo-code">${esc(shortCode)}</span></div></div>`;

      const modeInfo = getLeagueRoundStoriesMode(slug);
      const isResultsMode = modeInfo.modeResult?.mode === 'results';
      const resultsTagHtml = isResultsMode ? `<b class="story-results-tag" title="Round match results">FT</b>` : '';

      return `<button class="story${isWatched ? ' watched' : ''}${isPulse ? ' pulse' : ''}${isResultsMode ? ' results-mode' : ''}" data-st="${esc(slug)}" style="--c:${color}" aria-label="${isResultsMode ? 'Match results for' : 'Upcoming'} ${esc(l.name || slug)} fixtures${isWatched ? ', watched' : ''}">
        <div class="ring">
          ${logoCircle}
          ${resultsTagHtml}
          <b class="story-check" aria-hidden="true">✓</b>
          <b class="story-flag" title="${esc(l.country || 'Football')}">${flagHtml}</b>
        </div>
        <span>${esc(shortName)}</span>
      </button>`;
    })
    .join('');

  const feedHtml = trending.length
    ? trending.map((g) => miniCard(g)).join('')
    : `<div class="empty">${DATA.loadingDates[dayISO] ? 'Loading real football fixtures…' : 'No football matches scheduled for this date.'}</div>`;

  return `
    <div class="r sb">
      <div class="r ttl" style="gap:10px">
        <div class="logo">${svg('matches', 20)}</div>MatchBay
      </div>
      <button class="ib" data-tg aria-label="Notifications" aria-pressed="${Boolean(S.notif)}">${svg('bell')}</button>
    </div>

    ${outdatedBanner()}

    <div class="stories">${storiesHtml}</div>
    ${datesBar()}

    ${renderFeaturedHero(dayMatches, dayISO, featured)}

    ${liveMatches.length ? `<div class="status-group-title" style="margin-top:20px"><span class="live">LIVE MATCHES</span><span class="m">${liveMatches.length}</span></div>${liveMatches.map((g) => miniCard(g)).join('')}` : ''}

    <div class="r sb" style="margin-top:24px">
      <div class="h">Featured Matches</div>
      <button class="m" data-go="matches" style="background:none;border:0;color:var(--ac);font-weight:700">See all</button>
    </div>
    <div style="margin-top:10px">${feedHtml}</div>

    ${attribution()}
  `;
}

// Helper: Filter matches based on search query, date, league, and status
function getMatchesForView(q, dayISO) {
  const query = (q || '').toLowerCase().trim();
  // When searching, remove date restriction and search across all loaded matches;
  // otherwise, restrict to the currently selected day.
  let list = query
    ? Object.values(DATA.matches)
    : Object.values(DATA.matches).filter((m) => m.dateISO === dayISO);

  // Keep leagues filter
  if (S.selectedLeague) {
    list = list.filter((m) => m.k === S.selectedLeague);
  }

  // Keep status filter ('all', 'live', 'up', 'ft')
  if (S.ms !== 'all') {
    list = list.filter((m) => m.st === S.ms);
  }

  // Search filter by team name or league/competition
  if (query) {
    list = list.filter((m) =>
      `${m.homeName} ${m.awayName} ${m.competitionName || ''} ${m.k || ''}`.toLowerCase().includes(query)
    );

    // Deduplicate any overlapping fixtures
    const seenUids = new Set();
    list = list.filter((m) => {
      const id = m.uid || m.id || `${m.k}:${m.homeName}:${m.awayName}:${m.dateISO}`;
      if (seenUids.has(id)) return false;
      seenUids.add(id);
      return true;
    });

    // Sort search results: live matches first, then upcoming (earliest kickoff), then finished
    list.sort((a, b) => {
      const order = { live: 0, up: 1, ft: 2 };
      const diff = (order[a.st] ?? 3) - (order[b.st] ?? 3);
      if (diff !== 0) return diff;
      return (a.kickoff ? Date.parse(a.kickoff) : 0) - (b.kickoff ? Date.parse(b.kickoff) : 0);
    });
  }

  return list;
}

// Helper: Get all searchable leagues/competitions (from DATA.leagues + verified tournament registry)
function getAllSearchableLeagues() {
  const map = new Map();
  (DATA.leagues || []).forEach((l) => {
    map.set(l.slug, {
      slug: l.slug,
      name: l.name,
      country: l.country || 'International',
      flag: l.flag || countryFlag(l.country) || '⚽',
      code: l.abbreviation || l.code || l.slug.toUpperCase(),
    });
  });

  const extraTournaments = [
    { slug: 'uefa.champions', name: 'UEFA Champions League', country: 'Europe', flag: '🇪🇺', code: 'UCL' },
    { slug: 'uefa.europa', name: 'UEFA Europa League', country: 'Europe', flag: '🇪🇺', code: 'UEL' },
    { slug: 'uefa.europa.conf', name: 'UEFA Conference League', country: 'Europe', flag: '🇪🇺', code: 'UECL' },
    { slug: 'fifa.world', name: 'FIFA World Cup', country: 'International', flag: '🌍', code: 'WC' },
    { slug: 'conmebol.libertadores', name: 'Copa Libertadores', country: 'South America', flag: '🌎', code: 'LIB' },
  ];
  extraTournaments.forEach((t) => {
    if (!map.has(t.slug)) map.set(t.slug, t);
  });

  return Array.from(map.values());
}

// Helper: Collect dynamically loaded players from squads & match lineups
function getAllSearchablePlayers() {
  const extraPlayers = [];

  // From loaded club squads
  Object.values(DATA.clubDetails || {}).forEach((detail) => {
    if (detail && Array.isArray(detail.players)) {
      const clubName = detail.club?.name || 'Club';
      const clubLogo = detail.club?.logo || '';
      detail.players.forEach((p) => {
        if (p && p.name) {
          extraPlayers.push({
            name: p.name,
            team: clubName,
            teamLogo: clubLogo,
            position: p.position?.slice(0, 2).toUpperCase() || 'MF',
            jersey: p.jersey || '',
            country: p.nationality || '',
            flag: countryFlag(p.nationality) || '⚽',
          });
        }
      });
    }
  });

  // From loaded match lineups
  Object.values(DATA.details || {}).forEach((det) => {
    if (det && det.lineups) {
      ['home', 'away'].forEach((side) => {
        const teamName = side === 'home' ? det.homeName : det.awayName;
        const roster = det.lineups[side];
        if (Array.isArray(roster)) {
          roster.forEach((p) => {
            if (p && p.name) {
              extraPlayers.push({
                name: p.name,
                team: teamName || 'Club',
                position: p.position?.slice(0, 2).toUpperCase() || 'MF',
                jersey: p.jersey || '',
                country: '',
                flag: '⚽',
              });
            }
          });
        }
      });
    }
  });

  return extraPlayers;
}

// Render a single competition search card
function renderCompetitionSearchCard(comp) {
  const logo = typeof CompetitionLogo === 'function'
    ? CompetitionLogo({ competition: comp.slug, size: 36 })
    : `<div class="comp-logo-circle" style="width:36px;height:36px"><div class="comp-logo-disc"><span class="comp-logo-code">${esc(comp.code || comp.slug.slice(0, 3))}</span></div></div>`;

  return `
    <div class="search-comp-card">
      <div class="r" style="gap:12px;align-items:center;min-width:0;flex:1">
        ${logo}
        <div style="min-width:0;flex:1">
          <div class="r" style="gap:6px;align-items:center">
            ${typeof CountryFlag === 'function' ? CountryFlag({ competition: comp.slug, country: comp.country, size: 16 }) : ''}
            <span class="comp-name" title="${esc(comp.name)}">${esc(comp.name)}</span>
          </div>
          <small style="color:var(--m);font-size:11px">${esc(comp.country || 'Football')} · ${esc(comp.code || comp.slug.toUpperCase())}</small>
        </div>
      </div>
      <div class="r" style="gap:6px;flex:none">
        <button class="clr" data-filter-league="${esc(comp.slug)}" style="font-size:11px;padding:6px 10px;border-radius:8px;background:rgba(25,227,177,.1);color:var(--ac);border:1px solid rgba(25,227,177,.3);font-weight:700;cursor:pointer">Matches</button>
        <button class="clr" data-select-table-league="${esc(comp.slug)}" data-go="tables" style="font-size:11px;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.06);color:var(--t);border:1px solid var(--ln);font-weight:700;cursor:pointer">Table</button>
      </div>
    </div>
  `;
}

// Render a single player search card
function renderPlayerSearchCard(p) {
  const posColors = {
    FW: '#ff5c5c',
    MF: '#38bdf8',
    DF: '#34d399',
    GK: '#fbbf24',
  };
  const posColor = posColors[p.position] || 'var(--ac)';
  const photoUrl = (typeof window !== 'undefined' && window.PlayerSpotlight && window.PlayerSpotlight.getSpotlightPlayerPhoto)
    ? window.PlayerSpotlight.getSpotlightPlayerPhoto(p)
    : (p.photo || '');

  return `
    <div class="search-player-card" data-search-player="${esc(p.name)}" data-player-team="${esc(p.team)}" data-player-pos="${esc(p.position || '')}" data-player-jersey="${esc(p.jersey || '')}" data-player-country="${esc(p.country || '')}" role="button" tabindex="0" aria-label="Player ${esc(p.name)}, ${esc(p.team)}">
      <div class="r" style="gap:10px;align-items:center">
        ${photoUrl ? `
          <div style="width:36px;height:36px;border-radius:50%;overflow:hidden;border:2px solid ${posColor};flex:none;background:#0D1A1C;display:flex;align-items:center;justify-content:center">
            <img referrerpolicy="no-referrer" loading="lazy" src="${esc(photoUrl)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <div style="display:none;font-size:12px;font-weight:700;color:${posColor}">${p.jersey ? `#${p.jersey}` : esc(p.position || '⚽')}</div>
          </div>
        ` : `
          <div class="player-avatar-badge" style="border:2px solid ${posColor};color:${posColor}">
            ${p.jersey ? `#${p.jersey}` : esc(p.position || '⚽')}
          </div>
        `}
        <div style="flex:1;min-width:0">
          <div class="r" style="gap:5px;align-items:center">
            <b style="font-size:13px;color:var(--t);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(p.name)}">${esc(p.name)}</b>
            <span style="font-size:12px;flex:none">${esc(p.flag || '')}</span>
          </div>
          <div class="r" style="gap:5px;align-items:center;margin-top:2px;font-size:11px;color:var(--m)">
            <span style="color:${posColor};font-weight:700">${esc(p.position || 'MF')}</span>
            <span>·</span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(p.team)}">${esc(p.team)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Helper: Render grouped match lists by league
function renderMatchesGroups(list, query, dayISO) {
  const grouped = new Map();
  list.forEach((m) => {
    if (!grouped.has(m.k)) grouped.set(m.k, []);
    grouped.get(m.k).push(m);
  });

  if (!grouped.size) {
    const emptyText = query
      ? `No matches found for "${esc(query)}"${S.selectedLeague || S.ms !== 'all' ? ' with current filters.' : '.'}`
      : (DATA.loadingDates[dayISO] ? 'Loading fixtures…' : 'No matches found matching your filters.');
    return `<div class="empty">${emptyText}</div>`;
  }

  return [...grouped.entries()].map(([slug, rows]) => {
    const meta = DATA.leaguesMap[slug] || {};
    const leagueName = meta.name || rows[0]?.competitionName || slug;
    const flag = meta.flag || countryFlag(meta.country);
    const liveCount = rows.filter((r) => r.st === 'live').length;
    return `
      <div class="r sb league-section-head" style="margin-top:20px;margin-bottom:8px">
        <span class="h" style="display:flex;align-items:center;gap:10px">
          ${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: slug, size: 28 }) : ''}
          <b style="display:inline-flex;align-items:center;gap:6px">${typeof CountryFlag === 'function' ? CountryFlag({ competition: slug, country: meta.country, size: 18 }) : ''}<span>${esc(leagueName)}</span></b>
        </span>
        ${liveCount ? `<span class="live" style="font-size:12px">${liveCount} live</span>` : `<span class="m">${rows.length}</span>`}
      </div>
      ${rows.map((g) => miniCard(g)).join('')}
    `;
  }).join('');
}

// Helper: Render unified search results across Competitions, Players, and Matches
function renderMatchesViewContent(q, dayISO) {
  if (!q) {
    const list = getMatchesForView('', dayISO);
    return renderMatchesGroups(list, '', dayISO);
  }

  // 1. Search Competitions & Leagues
  const allLeagues = getAllSearchableLeagues();
  const matchingComps = typeof searchCompetitions === 'function'
    ? searchCompetitions(q, allLeagues)
    : [];

  // 2. Search Players
  const extraPlayers = getAllSearchablePlayers();
  const matchingPlayers = typeof searchPlayers === 'function'
    ? searchPlayers(q, extraPlayers, 24)
    : [];

  // 3. Search Matches (across all dates, filtered by league & status)
  const matchingMatches = getMatchesForView(q, dayISO);

  const totalResults = matchingComps.length + matchingPlayers.length + matchingMatches.length;
  const currentCat = S.searchCat || 'all';

  // Category switcher chips
  const catSwitcher = `
    <div class="chips search-cat-chips" style="margin-top:12px">
      <button class="chip${currentCat === 'all' ? ' on' : ''}" data-search-cat="all">All (${totalResults})</button>
      <button class="chip${currentCat === 'comps' ? ' on' : ''}" data-search-cat="comps">🏆 Competitions (${matchingComps.length})</button>
      <button class="chip${currentCat === 'players' ? ' on' : ''}" data-search-cat="players">👤 Players (${matchingPlayers.length})</button>
      <button class="chip${currentCat === 'matches' ? ' on' : ''}" data-search-cat="matches">⚽ Matches (${matchingMatches.length})</button>
    </div>
  `;

  if (totalResults === 0) {
    return `
      ${catSwitcher}
      <div class="empty" style="margin-top:30px">
        No competitions, players, or matches found matching "${esc(q)}".
      </div>
    `;
  }

  let html = catSwitcher;

  // Render Competitions section
  if ((currentCat === 'all' || currentCat === 'comps') && matchingComps.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-head">
          <span>🏆 COMPETITIONS & LEAGUES (${matchingComps.length})</span>
        </div>
        <div class="search-comp-grid">
          ${matchingComps.map(renderCompetitionSearchCard).join('')}
        </div>
      </div>
    `;
  } else if (currentCat === 'comps' && matchingComps.length === 0) {
    html += `<div class="empty">No competitions or leagues found matching "${esc(q)}".</div>`;
  }

  // Render Players section
  if ((currentCat === 'all' || currentCat === 'players') && matchingPlayers.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-head">
          <span>👤 PLAYERS (${matchingPlayers.length})</span>
        </div>
        <div class="search-players-grid">
          ${matchingPlayers.map(renderPlayerSearchCard).join('')}
        </div>
      </div>
    `;
  } else if (currentCat === 'players' && matchingPlayers.length === 0) {
    html += `<div class="empty">No players found matching "${esc(q)}".</div>`;
  }

  // Render Matches section
  if ((currentCat === 'all' || currentCat === 'matches') && matchingMatches.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-head">
          <span>⚽ MATCHES (${matchingMatches.length})</span>
        </div>
        ${renderMatchesGroups(matchingMatches, q, dayISO)}
      </div>
    `;
  } else if (currentCat === 'matches' && matchingMatches.length === 0) {
    html += `<div class="empty">No matches found matching "${esc(q)}"${S.selectedLeague || S.ms !== 'all' ? ' with current filters.' : '.'}</div>`;
  }

  return html;
}

// 7.2 Matches View
function matches() {
  const dayISO = dateISO(S.D);
  const q = S.q.toLowerCase().trim();
  const searchHtml = renderMatchesViewContent(q, dayISO);

  return `
    <div class="ttl">Matches</div>
    <label class="srch" style="margin-top:14px">
      ${svg('search', 18)}
      <input id="q" type="search" placeholder="Search competitions, players, teams or matches" value="${esc(S.q)}" autocomplete="off" aria-label="Search">
      ${S.q ? `<button id="q-clear" type="button" aria-label="Clear search" style="background:none;border:0;color:var(--m);cursor:pointer;padding:4px 6px;display:flex;align-items:center;font-size:16px;line-height:1">✕</button>` : ''}
    </label>

    ${outdatedBanner()}

    <!-- Leagues filter (kept during search) -->
    <div class="chips" style="margin-top:12px">
      <button class="chip${!S.selectedLeague ? ' on' : ''}" data-filter-league="">All Leagues</button>
      ${DATA.leagues.slice(0, 10).map((l) => `<button class="chip${S.selectedLeague === l.slug ? ' on' : ''}" data-filter-league="${esc(l.slug)}" style="display:inline-flex;align-items:center;gap:6px">${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: l.slug, size: 20 }) : ''}${typeof CountryFlag === 'function' ? CountryFlag({ competition: l.slug, country: l.country, size: 16 }) : ''}<span>${esc(l.abbreviation || l.name)}</span></button>`).join('')}
    </div>

    <!-- Dates bar (removed during search, restored when search is cleared) -->
    <div id="matches-dates-bar" style="${q ? 'display:none;' : ''}">
      ${datesBar()}
    </div>

    <!-- Status filter (kept during search) -->
    <div class="chips status-filters" style="margin-top:12px">
      <button class="chip${S.ms === 'all' ? ' on' : ''}" data-ms="all">All</button>
      <button class="chip${S.ms === 'live' ? ' on' : ''}" data-ms="live">Live</button>
      <button class="chip${S.ms === 'up' ? ' on' : ''}" data-ms="up">Upcoming</button>
      <button class="chip${S.ms === 'ft' ? ' on' : ''}" data-ms="ft">Finished</button>
    </div>

    <div id="mres">${searchHtml}</div>
    ${attribution()}
  `;
}

// 7.3 Tables / Standings & Clubs View
function tables() {
  const currentSlug = S.selectedTableLeague || 'eng.1';
  const leagueMeta = DATA.leaguesMap[currentSlug] || DATA.leagues.find((l) => l.slug === currentSlug) || {};
  const flag = leagueMeta.flag || countryFlag(leagueMeta.country);
  const standingsKey = `${currentSlug}:${S.selectedTableSeason || 'current'}`;
  const standingsData = DATA.standings[standingsKey] || [];
  const clubsData = DATA.clubs[currentSlug] || [];

  const countries = Object.values(DATA.leaguesByCountry);

  // Standings table render
  let tableHtml = '';
  if (DATA.standingsStatus[standingsKey] === 'loading') {
    tableHtml = `<div class="empty">Loading official standings…</div>`;
  } else if (!standingsData.length || !standingsData[0]?.rows?.length) {
    if (DATA.standingsStatus[standingsKey] === 'error') {
      tableHtml = `
        <div class="empty" style="padding:28px 16px;text-align:center">
          <div style="font-weight:600;font-size:14px;margin-bottom:6px">Standings currently unavailable</div>
          <div style="font-size:12px;opacity:0.7;margin-bottom:14px">Could not retrieve the updated table from the data service.</div>
          <button data-refresh-table="true" style="padding:8px 16px;border-radius:12px;background:var(--ac);color:#050d0e;font-weight:700;font-size:13px;border:none;cursor:pointer">Retry loading</button>
        </div>`;
    } else {
      tableHtml = `<div class="empty">No standings data currently stored for ${esc(leagueMeta.name || currentSlug)}.</div>`;
    }
  } else {
    tableHtml = standingsData.map((group) => `
      <div class="standings-wrap">
        ${group.name ? `<div style="padding:10px 14px;font-weight:700;font-size:13px;border-bottom:1px solid var(--ln);background:rgba(255,255,255,.02)">${esc(group.name)}</div>` : ''}
        <div class="standings-head-row">
          <span>#</span>
          <span>Club</span>
          <span>P</span>
          <span>GD</span>
          <span>PTS</span>
          <span>Form</span>
        </div>
        ${group.rows.map((r) => `
          <div class="standings-item-row" data-open-club="${esc(r.team.id)}" data-club-league="${esc(currentSlug)}" role="button" tabindex="0">
            <span class="st-rank">${r.rank}</span>
            <div class="st-team-col">
              ${r.team.logo ? `<img referrerpolicy="no-referrer" src="${esc(r.team.logo)}" alt="" loading="lazy">` : ''}
              <b>${esc(r.team.name)}</b>
              ${r.note?.description ? `<span class="st-note-pill" style="background:${esc(r.note.color || '#3fd6c0')}22;color:${esc(r.note.color || '#3fd6c0')}">${esc(r.note.description)}</span>` : ''}
            </div>
            <span>${r.played}</span>
            <span>${r.gd > 0 ? `+${r.gd}` : r.gd}</span>
            <span class="st-pts">${r.pts}</span>
            <span class="m" style="font-size:10px">${r.won}W ${r.drawn}D</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  // Clubs grid
  const clubsHtml = clubsData.length
    ? `<div class="clubs-grid">
        ${clubsData.map((c) => `
          <div class="club-card" data-open-club="${esc(c.id)}" data-club-league="${esc(currentSlug)}" role="button" tabindex="0">
            ${c.logo ? `<img referrerpolicy="no-referrer" src="${esc(c.logo)}" alt="" loading="lazy">` : `<div class="crest" style="width:44px;height:44px">${esc(c.name.slice(0, 3))}</div>`}
            <span>${esc(c.name)}</span>
          </div>
        `).join('')}
      </div>`
    : `<div class="empty">No dedicated club catalog returned for this competition.</div>`;

  return `
    <div class="ttl">Tables &amp; Clubs</div>
    ${outdatedBanner()}

    <div class="r sb" style="margin-top:14px;background:rgba(255,255,255,.04);border:1px solid var(--ln);border-radius:22px;padding:16px 18px;align-items:center;gap:16px">
      <div class="r" style="gap:16px;align-items:center;min-width:0">
        ${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: currentSlug, size: 112, glow: true }) : ''}
        <div style="min-width:0">
          <div class="h" style="font-size:18px;line-height:1.25;display:flex;align-items:center;gap:8px">${typeof CountryFlag === 'function' ? CountryFlag({ competition: currentSlug, country: leagueMeta.country, size: 20 }) : ''}<span>${esc(leagueMeta.name || currentSlug)}</span></div>
          <div class="m" style="margin-top:6px;display:flex;align-items:center;gap:6px">${typeof CountryFlag === 'function' ? CountryFlag({ competition: currentSlug, country: leagueMeta.country, size: 16 }) : ''}<span>${esc(leagueMeta.country || 'Football')} · ${esc(leagueMeta.season?.display_name || 'Current season')}</span></div>
        </div>
      </div>
    </div>

    <!-- Country-grouped League Selector -->
    <div style="margin-top:18px">
      <div class="h" style="font-size:14px;color:var(--m)">DISCOVER ALL LEAGUES BY COUNTRY</div>
      <div class="country-selector">
        ${countries.map((c) => `
          <div class="country-section">
            <div class="country-title" style="display:flex;align-items:center;gap:8px">
              <span>${typeof CountryFlag === 'function' ? CountryFlag({ country: c.name, size: 18 }) : c.flag}</span>
              <span>${esc(c.name)}</span>
              <span class="m" style="margin-left:auto">${c.leagues.length} leagues</span>
            </div>
            <div class="country-leagues">
              ${c.leagues.map((l) => `
                <button class="league-pill${l.slug === currentSlug ? ' on' : ''}" data-select-table-league="${esc(l.slug)}" style="display:inline-flex;align-items:center;gap:8px">
                  ${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: l.slug, size: 22 }) : ''}
                  ${typeof CountryFlag === 'function' ? CountryFlag({ competition: l.slug, country: l.country, size: 16 }) : ''}
                  <span>${esc(l.name)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Standings Table -->
    <div style="margin-top:24px">
      <div class="r sb">
        <div class="h">League Standings</div>
        <button class="chip" data-refresh-table="1" style="height:32px;padding:0 12px;font-size:11px">Refresh</button>
      </div>
      ${tableHtml}
    </div>

    <!-- Clubs Grid -->
    <div style="margin-top:28px">
      <div class="h">Clubs in this Competition</div>
      ${clubsHtml}
    </div>

    ${attribution()}
  `;
}

// 7.4 Club Details View
function clubModal() {
  if (!S.selectedClubId || !S.selectedClubLeague) return '';
  const key = `${S.selectedClubLeague}:${S.selectedClubId}`;
  const detail = DATA.clubDetails[key];

  if (!detail) {
    return `
      <div class="dh">
        <button class="ib" data-close-club="1" aria-label="Back">${svg('back')}</button>
        <div class="ttl">Club Roster</div>
      </div>
      <div class="empty" style="margin-top:40px">Loading squad and coach details…</div>
    `;
  }

  const { club, coach, players } = detail;
  const groups = { Goalkeepers: [], Defenders: [], Midfielders: [], Forwards: [], Other: [] };
  players.forEach((p) => {
    const pos = (p.position || '').toLowerCase();
    if (pos.includes('goal')) groups.Goalkeepers.push(p);
    else if (pos.includes('defend') || pos.includes('back')) groups.Defenders.push(p);
    else if (pos.includes('midfield')) groups.Midfielders.push(p);
    else if (pos.includes('forward') || pos.includes('attack') || pos.includes('striker') || pos.includes('winger')) groups.Forwards.push(p);
    else groups.Other.push(p);
  });

  return `
    <div class="dh">
      <button class="ib" data-close-club="1" aria-label="Back">${svg('back')}</button>
      <div class="ttl">${esc(club.name)}</div>
    </div>

    <div class="club-hero">
      ${club.logo ? `<img referrerpolicy="no-referrer" src="${esc(club.logo)}" alt="">` : ''}
      <h2>${esc(club.name)}</h2>
      <div class="m" style="margin-top:4px">${esc(club.city || club.venue || 'Football Club')}</div>
      ${coach ? `<div class="m" style="margin-top:6px;color:var(--ac);font-weight:700">Head Coach: ${esc(coach)}</div>` : ''}
    </div>

    <div style="margin-top:20px">
      ${Object.entries(groups).filter(([, list]) => list.length > 0).map(([groupTitle, list]) => `
        <div style="margin-top:18px">
          <div class="h" style="font-size:13px;color:var(--m);margin-bottom:8px">${esc(groupTitle)}</div>
          <div class="roster-grid">
            ${list.map((p) => {
              const s = p.stats || { goals: 0, assists: 0, appearances: 0 };
              const photoUrl = (typeof window !== 'undefined' && window.PlayerSpotlight && window.PlayerSpotlight.getSpotlightPlayerPhoto)
                ? window.PlayerSpotlight.getSpotlightPlayerPhoto(p)
                : (p.photo || '');
              return `
              <div class="player-row" data-open-player="${esc(p.id)}" data-player-club="${esc(key)}" role="button" tabindex="0" aria-label="View player profile for ${esc(p.name)}">
                <span class="player-num">${esc(p.jersey ? `#${p.jersey}` : '—')}</span>
                ${photoUrl ? `
                  <img referrerpolicy="no-referrer" loading="lazy" src="${esc(photoUrl)}" alt="${esc(p.name)}" class="player-squad-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                  <div class="player-squad-fallback" style="display:none;">${esc(p.jersey ? `#${p.jersey}` : '⚽')}</div>
                ` : `
                  <div class="player-squad-fallback">${esc(p.jersey ? `#${p.jersey}` : '⚽')}</div>
                `}
                <div class="player-info">
                  <b>${esc(p.name)}</b>
                  <small>${esc(p.position || 'Player')}${p.age ? ` · ${p.age} yrs` : ''}</small>
                </div>
                <div class="player-stat-pills">
                  <span class="stat-pill g" title="Goals">⚽ ${s.goals}</span>
                  <span class="stat-pill a" title="Assists">👟 ${s.assists}</span>
                  <span class="stat-pill app" title="Appearances">👕 ${s.appearances}</span>
                </div>
                ${p.flag ? `<img referrerpolicy="no-referrer" src="${esc(p.flag)}" alt="" style="width:16px;height:12px;border-radius:2px" title="${esc(p.citizenship)}">` : p.citizenship ? `<span style="font-size:11px" class="m">${esc(p.citizenship)}</span>` : ''}
              </div>
            `;}).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 7.4.1 Open Player Profile helper
function openPlayerProfile(playerIdOrName, clubKeyOrTeam = null, playerObj = null) {
  if (!playerIdOrName) return;
  const idStr = String(playerIdOrName).trim();
  S.selectedPlayerId = idStr;
  S.selectedPlayerClubKey = clubKeyOrTeam || null;

  if (!DATA.playerProfiles) DATA.playerProfiles = {};
  if (playerObj) {
    DATA.playerProfiles[idStr] = playerObj;
    const norm = (typeof normalizePlayerKey === 'function')
      ? normalizePlayerKey(playerObj.name || idStr)
      : idStr.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm) DATA.playerProfiles[norm] = playerObj;
  }

  // If clubKeyOrTeam is 'league:clubId', verify if club roster needs background fetch for stats
  if (clubKeyOrTeam && typeof clubKeyOrTeam === 'string' && clubKeyOrTeam.includes(':')) {
    const parts = clubKeyOrTeam.split(':');
    const league = parts[0];
    const clubId = parts[1];
    if (league && clubId && !DATA.clubDetails[clubKeyOrTeam]) {
      API.loadClubDetail(league, clubId).then(() => draw());
    }
  } else if (typeof clubKeyOrTeam === 'string' && clubKeyOrTeam) {
    // Try to locate club in already loaded league club lists
    for (const l of DATA.leagues || []) {
      const clubsList = DATA.clubs?.[l.slug];
      if (Array.isArray(clubsList)) {
        const c = clubsList.find((cl) => (cl.name || '').toLowerCase().includes(clubKeyOrTeam.toLowerCase()));
        if (c) {
          const key = `${l.slug}:${c.id}`;
          S.selectedPlayerClubKey = key;
          if (!DATA.clubDetails[key]) {
            API.loadClubDetail(l.slug, c.id).then(() => draw());
          }
          break;
        }
      }
    }
  }

  draw();
}

// 7.4.2 Player Details View (Full Profile Page with Football Spotlight Data & Design)
function playerModal() {
  if (!S.selectedPlayerId) return '';
  let player = null;
  let clubName = '';
  let clubLogo = '';
  let clubId = '';

  const idStr = String(S.selectedPlayerId).trim();
  const normId = (typeof normalizePlayerKey === 'function')
    ? normalizePlayerKey(idStr)
    : idStr.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Check DATA.playerProfiles cache
  if (DATA.playerProfiles && DATA.playerProfiles[idStr]) {
    player = DATA.playerProfiles[idStr];
    clubName = player.team || '';
  }
  if (!player && DATA.playerProfiles && DATA.playerProfiles[normId]) {
    player = DATA.playerProfiles[normId];
    clubName = player.team || '';
  }

  // 2. Check S.selectedPlayerClubKey in DATA.clubDetails
  if (!player && S.selectedPlayerClubKey && DATA.clubDetails[S.selectedPlayerClubKey]) {
    const detail = DATA.clubDetails[S.selectedPlayerClubKey];
    clubName = detail.club?.name || '';
    clubLogo = detail.club?.logo || '';
    clubId = detail.club?.id || '';
    player = detail.players?.find((p) => String(p.id) === idStr || ((typeof normalizePlayerKey === 'function') && normalizePlayerKey(p.name) === normId));
  }

  // 3. Search across all loaded clubs in DATA.clubDetails
  if (!player) {
    for (const key of Object.keys(DATA.clubDetails || {})) {
      const d = DATA.clubDetails[key];
      const found = d.players?.find((p) => {
        if (String(p.id) === idStr) return true;
        const pNorm = (typeof normalizePlayerKey === 'function') ? normalizePlayerKey(p.name) : p.name.toLowerCase();
        return pNorm === normId || (normId.length >= 4 && pNorm.includes(normId));
      });
      if (found) {
        player = found;
        clubName = d.club?.name || '';
        clubLogo = d.club?.logo || '';
        clubId = d.club?.id || '';
        break;
      }
    }
  }

  // 4. Search across loaded match lineups in DATA.matchDetails
  if (!player && DATA.matchDetails) {
    for (const uid of Object.keys(DATA.matchDetails)) {
      const md = DATA.matchDetails[uid];
      if (md?.lineups) {
        const allLineupPlayers = [
          ...(md.lineups.home || []),
          ...(md.lineups.away || [])
        ];
        const matchFound = allLineupPlayers.find((p) => {
          if (String(p.id) === idStr) return true;
          const pNorm = (typeof normalizePlayerKey === 'function') ? normalizePlayerKey(p.name) : p.name.toLowerCase();
          return pNorm === normId || (normId.length >= 4 && pNorm.includes(normId));
        });
        if (matchFound) {
          const isHome = (md.lineups.home || []).includes(matchFound);
          clubName = isHome ? (md.homeName || '') : (md.awayName || '');
          clubLogo = isHome ? (md.homeLogo || '') : (md.awayLogo || '');
          clubId = isHome ? (md.homeId || '') : (md.awayId || '');
          player = {
            id: String(matchFound.id || matchFound.name),
            name: matchFound.name,
            jersey: matchFound.jersey || '',
            position: matchFound.position || 'Player',
            citizenship: matchFound.athlete?.citizenship || matchFound.citizenship || '',
            flag: matchFound.flag || '',
            age: matchFound.athlete?.age || matchFound.age || null,
            team: clubName,
            stats: { goals: 0, assists: 0, appearances: 1, subIns: 0, minutes: 75, yellowCards: 0, redCards: 0, shotsOnTarget: 0, saves: 0, goalsConceded: 0 }
          };
          break;
        }
      }
    }
  }

  // 5. Search TOP_PLAYERS_DATA
  if (!player && typeof TOP_PLAYERS_DATA !== 'undefined' && Array.isArray(TOP_PLAYERS_DATA)) {
    const tp = TOP_PLAYERS_DATA.find((p) => {
      const pNorm = (typeof normalizePlayerKey === 'function') ? normalizePlayerKey(p.name) : p.name.toLowerCase();
      return pNorm === normId || (normId.length >= 4 && pNorm.includes(normId));
    });
    if (tp) {
      clubName = tp.team;
      player = {
        id: String(tp.name),
        name: tp.name,
        jersey: String(tp.jersey || ''),
        position: tp.position || 'Player',
        citizenship: tp.country || '',
        flag: tp.flag || '',
        team: tp.team,
        stats: { goals: 0, assists: 0, appearances: 0, subIns: 0, minutes: 0, yellowCards: 0, redCards: 0, shotsOnTarget: 0, saves: 0, goalsConceded: 0 }
      };
    }
  }

  // 6. Final fallback: synthesized player record so page ALWAYS renders
  if (!player) {
    const readableName = idStr.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    player = {
      id: idStr,
      name: readableName,
      jersey: '',
      position: 'Player',
      citizenship: 'International',
      flag: '🌍',
      team: clubName || 'Football Club',
      stats: { goals: 0, assists: 0, appearances: 0, subIns: 0, minutes: 0, yellowCards: 0, redCards: 0, shotsOnTarget: 0, saves: 0, goalsConceded: 0 }
    };
  }

  const s = player.stats || { goals: 0, assists: 0, appearances: 0, subIns: 0, minutes: 0, yellowCards: 0, redCards: 0, shotsOnTarget: 0, saves: 0, goalsConceded: 0 };
  const team = player.team || clubName || 'Football Club';
  const isGoalkeeper = (player.position || '').toLowerCase().includes('goal') || (player.position || '').toUpperCase() === 'GK' || s.saves > 0;
  const isFav = Boolean(S.favoritePlayers && S.favoritePlayers[player.id || player.name]);

  // Resolve Football Spotlight / API-Sports photo and facts
  let details = {
    photo: '',
    preferredFoot: 'Right',
    height: '—',
    nationality: player.citizenship || player.nationality || '—',
    shirtNumber: player.jersey ? `#${player.jersey}` : '—'
  };
  if (typeof window !== 'undefined' && window.PlayerSpotlight && window.PlayerSpotlight.getSpotlightPlayerDetails) {
    details = window.PlayerSpotlight.getSpotlightPlayerDetails(player);
  }

  const photoUrl = details.photo || player.photo || '';
  const posDisplay = player.position || 'Player';

  // Nationality Flag
  const countryName = details.nationality && details.nationality !== '—' ? details.nationality : (player.citizenship || '');
  let flagHtml = '';
  if (typeof CountryFlag === 'function' && countryName && countryName !== 'International') {
    flagHtml = CountryFlag({ country: countryName, size: 18 });
  } else if (player.flag && player.flag.startsWith('http')) {
    flagHtml = `<img referrerpolicy="no-referrer" src="${esc(player.flag)}" alt="" style="width:18px;height:13px;border-radius:2px;object-fit:cover;margin-right:6px">`;
  } else if (player.flag) {
    flagHtml = `<span style="font-size:16px;margin-right:6px">${esc(player.flag)}</span>`;
  }

  return `
    <div class="player-profile-view">
      <!-- Top Bar -->
      <div class="player-top-bar">
        <button class="player-action-btn" data-close-player="1" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5 L8 12 L15 19"></path></svg>
        </button>
        <span class="player-page-title">Player</span>
        <button class="player-action-btn ${isFav ? 'is-fav' : ''}" data-fav-player="${esc(player.id || player.name)}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? '#3DDC97' : 'none'}" stroke="${isFav ? '#3DDC97' : 'currentColor'}" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 L14.8 9 L21 9.7 L16.4 14 L17.7 20.4 L12 17.2 L6.3 20.4 L7.6 14 L3 9.7 L9.2 9 Z"></path></svg>
        </button>
      </div>

      <!-- Player Identity Hero (Matching Design Template) -->
      <div class="player-identity-hero">
        <div class="player-avatar-ring">
          <div class="player-avatar-inner">
            ${photoUrl ? `
              <img referrerpolicy="no-referrer" loading="lazy" src="${esc(photoUrl)}" alt="${esc(player.name)}" class="player-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
              <div class="player-photo-fallback" style="display:none;">
                <svg width="64" height="64" viewBox="0 0 120 120" fill="none" stroke="#5E7B7E" stroke-width="5" stroke-linecap="round" role="img" aria-label="Player photo placeholder"><circle cx="60" cy="42" r="20"></circle><path d="M20 106 C22 80 40 70 60 70 C80 70 98 80 100 106"></path></svg>
              </div>
            ` : `
              <div class="player-photo-fallback">
                <svg width="64" height="64" viewBox="0 0 120 120" fill="none" stroke="#5E7B7E" stroke-width="5" stroke-linecap="round" role="img" aria-label="Player photo placeholder"><circle cx="60" cy="42" r="20"></circle><path d="M20 106 C22 80 40 70 60 70 C80 70 98 80 100 106"></path></svg>
              </div>
            `}
          </div>
        </div>
        <div class="player-name-block">
          <h1 class="player-hero-name">${esc(player.name)}</h1>
          ${clubId ? `
            <button class="player-hero-club" data-open-club="${esc(clubId)}" style="background:none;border:none;cursor:pointer;color:#8FA6A8;display:inline-flex;align-items:center;gap:6px;font-size:15px;padding:0;font-family:inherit">
              ${clubLogo ? `<img referrerpolicy="no-referrer" src="${esc(clubLogo)}" alt="" style="width:16px;height:16px;object-fit:contain" onerror="this.remove()">` : ''}
              <span>${esc(team)}</span>
            </button>
          ` : `
            <span class="player-hero-club">
              ${clubLogo ? `<img referrerpolicy="no-referrer" src="${esc(clubLogo)}" alt="" style="width:16px;height:16px;object-fit:contain;margin-right:6px;vertical-align:middle" onerror="this.remove()">` : ''}
              ${esc(team)}
            </span>
          `}
        </div>
        <span class="player-hero-pos">${esc(posDisplay)}</span>
        ${details.fotmobId ? `
          <div class="player-photo-credit" style="font-size:11px;color:#8FA6A8;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px">
            <span>Photo: FotMob</span>
          </div>
        ` : details.credit ? `
          <div class="player-photo-credit" style="font-size:11px;color:#8FA6A8;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px">
            <span>${esc(details.credit)}</span>
          </div>
        ` : ''}
      </div>

      <!-- Facts Card (From Design Template: Nationality, Age, Position, Club, Height, Preferred foot, Shirt number) -->
      <div class="player-facts-card">
        <div class="player-fact-row">
          <span class="player-fact-label">Nationality</span>
          <span class="player-fact-value">${flagHtml}<span>${esc(countryName || '—')}</span></span>
        </div>
        <div class="player-fact-row">
          <span class="player-fact-label">Age</span>
          <span class="player-fact-value">${player.age ? `${player.age} yrs` : '—'}</span>
        </div>
        <div class="player-fact-row">
          <span class="player-fact-label">Position</span>
          <span class="player-fact-value">${esc(posDisplay || '—')}</span>
        </div>
        <div class="player-fact-row">
          <span class="player-fact-label">Club</span>
          <span class="player-fact-value">
            ${clubLogo ? `<img referrerpolicy="no-referrer" src="${esc(clubLogo)}" alt="" style="width:16px;height:16px;object-fit:contain;margin-right:4px;" onerror="this.remove()">` : ''}
            <span>${esc(team)}</span>
          </span>
        </div>
        <div class="player-fact-row">
          <span class="player-fact-label">Height</span>
          <span class="player-fact-value">${esc(details.height || '—')}</span>
        </div>
        <div class="player-fact-row">
          <span class="player-fact-label">Preferred foot</span>
          <span class="player-fact-value">${esc(details.preferredFoot || 'Right')}</span>
        </div>
        <div class="player-fact-row no-border">
          <span class="player-fact-label">Shirt number</span>
          <span class="player-fact-value">${esc(details.shirtNumber || (player.jersey ? `#${player.jersey}` : '—'))}</span>
        </div>
      </div>

      <!-- 2026/2027 Season Stats Grid -->
      <div class="player-stats-section">
        <div class="player-season-banner">
          <div>
            <div class="season-badge-title">2026/2027 Season Stats</div>
            <div class="season-badge-sub">Live feed sync · All competitions</div>
          </div>
          <div class="season-tag">Live Feed</div>
        </div>

        <div class="player-stats-grid">
          <div class="player-stat-card">
            <div class="lbl">Goals</div>
            <div class="val highlight">${s.goals}</div>
            <div class="sub">Season total</div>
          </div>
          <div class="player-stat-card">
            <div class="lbl">Assists</div>
            <div class="val highlight-blue">${s.assists}</div>
            <div class="sub">Key passes</div>
          </div>
          <div class="player-stat-card">
            <div class="lbl">Appearances</div>
            <div class="val">${s.appearances}</div>
            <div class="sub">${s.subIns ? `${s.subIns} as sub` : 'Matches'}</div>
          </div>
          <div class="player-stat-card">
            <div class="lbl">Minutes</div>
            <div class="val">${s.minutes ? s.minutes.toLocaleString() : '0'}'</div>
            <div class="sub">Time on pitch</div>
          </div>
          <div class="player-stat-card">
            <div class="lbl">Yellow Cards</div>
            <div class="val highlight-yellow">${s.yellowCards}</div>
            <div class="sub">Cautions</div>
          </div>
          <div class="player-stat-card">
            <div class="lbl">Red Cards</div>
            <div class="val highlight-red">${s.redCards}</div>
            <div class="sub">Dismissals</div>
          </div>
          ${isGoalkeeper ? `
            <div class="player-stat-card">
              <div class="lbl">Saves</div>
              <div class="val highlight">${s.saves || 0}</div>
              <div class="sub">Shots stopped</div>
            </div>
            <div class="player-stat-card">
              <div class="lbl">Conceded</div>
              <div class="val">${s.goalsConceded || 0}</div>
              <div class="sub">Goals allowed</div>
            </div>
          ` : `
            <div class="player-stat-card">
              <div class="lbl">Shots on Target</div>
              <div class="val highlight">${s.shotsOnTarget || 0}</div>
              <div class="sub">Efforts tested</div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

// 7.5 Redesigned Match Details Modal
function matchDetailModal() {
  if (!S.mt) return '';
  const g = getMatchByUid(S.mt.uid);
  if (!g) return `<div class="detail-shell"><div class="bar"><button class="detail-back-btn" data-close-detail="1" aria-label="Back">&larr;</button></div><div class="empty">Match data not available.</div></div>`;

  // URL hash sync: #details, #lineups, #stats
  let tab = 0;
  const hash = (location.hash || '').toLowerCase();
  if (hash === '#lineups') {
    tab = 1;
  } else if (hash === '#stats') {
    tab = 2;
  } else if (S.mt.tab !== undefined) {
    tab = S.mt.tab;
  }
  S.mt.tab = tab;

  const detail = DATA.details[g.uid] || {};
  const isLive = g.st === 'live';
  const isFinished = g.st === 'ft';
  const isUpcoming = g.st === 'up';

  // 1. Header bar: Back button + Competition & Round
  const roundText = g.round || g.raw?.season?.type_name || '';
  const headerTitle = roundText && !g.competitionName.includes(roundText)
    ? `${g.competitionName}, ${roundText}`
    : g.competitionName;

  // 2. Scoreboard card
  // Team logos/crests
  const homeInitials = g.A?.[0] || g.homeName.slice(0, 3).toUpperCase();
  const awayInitials = g.B?.[0] || g.awayName.slice(0, 3).toUpperCase();

  const homeCrest = g.homeLogo
    ? `<img referrerpolicy="no-referrer" src="${esc(g.homeLogo)}" alt="${esc(g.homeName)} logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><i style="display:none">${esc(homeInitials)}</i>`
    : `<i>${esc(homeInitials)}</i>`;

  const awayCrest = g.awayLogo
    ? `<img referrerpolicy="no-referrer" src="${esc(g.awayLogo)}" alt="${esc(g.awayName)} logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><i style="display:none">${esc(awayInitials)}</i>`
    : `<i>${esc(awayInitials)}</i>`;

  let middleScoreHtml = '';
  if (isLive) {
    const liveMin = g.when || g.pr || (typeof parseLiveMinute === 'function' ? parseLiveMinute(g.tm) : 'LIVE');
    middleScoreHtml = `
      <div class="big">${g.a != null ? g.a : 0}<s>-</s>${g.b != null ? g.b : 0}</div>
      <div class="min"><span class="dot" aria-hidden="true"></span>${esc(liveMin)}</div>
    `;
  } else if (isFinished) {
    middleScoreHtml = `
      <div class="big">${g.a != null ? g.a : 0}<s>-</s>${g.b != null ? g.b : 0}</div>
      <div class="ft-label">FT</div>
    `;
  } else {
    // Upcoming match
    const cd = typeof getKickoffCountdown === 'function' ? getKickoffCountdown(g.kickoff) : null;
    if (cd && !cd.isPast) {
      middleScoreHtml = `
        <div class="big" style="font-size:24px;color:var(--muted)">VS</div>
        <div class="countdown-box" aria-label="Kickoff in ${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes">
          <span class="countdown-cell">${cd.days}d</span>
          <span class="countdown-cell">${cd.hours}h</span>
          <span class="countdown-cell">${cd.minutes}m</span>
        </div>
      `;
    } else {
      middleScoreHtml = `
        <div class="big" style="font-size:24px;color:var(--muted)">VS</div>
        <div class="ft-label">${esc(localTimeText(g.kickoff))}</div>
      `;
    }
  }

  const refreshErrorNote = DATA.detailStatus[g.uid] === 'error' && DATA.details[g.uid]
    ? `<div style="grid-column:1/-1;text-align:center"><span class="refresh-note">Couldn't refresh</span></div>`
    : '';

  // 3. Tab semantics
  const tabsHtml = `
    <div class="tabs" role="tablist" aria-label="Match information">
      <button role="tab" id="tab-details" aria-controls="panel-details" aria-selected="${tab === 0}" data-detail-tab="0" tabindex="${tab === 0 ? '0' : '-1'}">Details</button>
      <button role="tab" id="tab-lineups" aria-controls="panel-lineups" aria-selected="${tab === 1}" data-detail-tab="1" tabindex="${tab === 1 ? '0' : '-1'}">Lineups</button>
      <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="${tab === 2}" data-detail-tab="2" tabindex="${tab === 2 ? '0' : '-1'}">Stats</button>
    </div>
  `;

  // 4. Details Panel
  let detailsPanelHtml = '';
  {
    // Match events timeline
    let timelineEvents = [];
    if (typeof MatchDetailsAdapter !== 'undefined' && MatchDetailsAdapter.orderMatchEvents) {
      timelineEvents = MatchDetailsAdapter.orderMatchEvents(detail.timeline || [], {
        homeScoreHT: detail.homeScoreHT,
        awayScoreHT: detail.awayScoreHT,
        isFinished,
        isLive,
      });
    } else {
      timelineEvents = detail.timeline || [];
    }

    let timelineHtml = '';
    if (timelineEvents.length > 0) {
      timelineHtml = timelineEvents.map((ev) => {
        if (ev.isSeparator) {
          return `<div class="ev"><div class="sep">${esc(ev.text)}</div></div>`;
        }

        // Build event content
        let icon = '';
        if (ev.type === 'goal') icon = '⚽';
        else if (ev.type === 'own-goal') icon = '⚽ (OG)';
        else if (ev.type === 'penalty') icon = '⚽ (PEN)';
        else if (ev.type === 'missed-penalty') icon = '❌';
        else if (ev.type === 'second-yellow') icon = '<span class="yc" aria-label="Yellow card"></span><span class="rc" aria-label="Red card"></span>';
        else if (ev.type === 'yellow-card') icon = '<span class="yc" aria-label="Yellow card"></span>';
        else if (ev.type === 'red-card') icon = '<span class="rc" aria-label="Red card"></span>';
        else if (ev.type === 'substitution') icon = '⇄';
        else if (ev.type === 'var') icon = '🖥️ VAR';
        else icon = '•';

        const nameStr = esc(ev.playerName || '');
        const detailStr = ev.detail ? `<small>${esc(ev.detail)}</small>` : '';

        if (ev.side === 'home') {
          return `
            <div class="ev">
              <div class="l">${icon} ${nameStr}${detailStr}</div>
              <div class="t">${esc(ev.minute)}</div>
              <div class="r"></div>
            </div>
          `;
        } else {
          return `
            <div class="ev">
              <div class="l"></div>
              <div class="t">${esc(ev.minute)}</div>
              <div class="r">${icon} ${nameStr}${detailStr}</div>
            </div>
          `;
        }
      }).join('');
    } else if (DATA.detailStatus[g.uid] === 'loading') {
      timelineHtml = `<div class="detail-skel" style="height:120px;margin:8px 0"></div>`;
    } else {
      timelineHtml = `<div class="empty" style="padding:24px 10px">No goals or cards recorded for this match yet.</div>`;
    }

    // Match Info Card (Omit missing fields)
    const venue = g.venue || detail.venue || g.raw?.venue?.fullName || '';
    const referee = detail.referee || g.raw?.gameInfo?.officials?.[0]?.displayName || '';
    const rawAttendance = detail.attendance || g.raw?.attendance || g.raw?.competitions?.[0]?.attendance;
    const attendance = rawAttendance && Number(rawAttendance) > 0 ? Number(rawAttendance).toLocaleString() : '';

    let infoRowsHtml = '';
    if (g.kickoff) {
      infoRowsHtml += `<div><span>Kickoff</span><b>${esc(localDateText(g.kickoff))}, ${esc(localTimeText(g.kickoff))}</b></div>`;
    }
    if (venue) {
      infoRowsHtml += `<div><span>Stadium</span><b>${esc(venue)}</b></div>`;
    }
    if (referee) {
      infoRowsHtml += `<div><span>Referee</span><b>${esc(referee)}</b></div>`;
    }
    if (attendance) {
      infoRowsHtml += `<div><span>Attendance</span><b>${esc(attendance)}</b></div>`;
    }

    detailsPanelHtml = `
      <section class="panel" id="panel-details" role="tabpanel" aria-labelledby="tab-details" ${tab !== 0 ? 'hidden' : ''}>
        <div class="card">
          <h3>Match events</h3>
          ${timelineHtml}
        </div>
        ${infoRowsHtml ? `
          <div class="card info">
            <h3>Match info</h3>
            ${infoRowsHtml}
          </div>
        ` : ''}
      </section>
    `;
  }

  // 5. Lineups Panel
  let lineupsPanelHtml = '';
  {
    const lineups = detail.lineups;
    const homeStarters = lineups?.home?.filter((p) => p.starter) || [];
    const awayStarters = lineups?.away?.filter((p) => p.starter) || [];
    const hasLineups = homeStarters.length > 0 && awayStarters.length > 0;

    if (!hasLineups) {
      if (DATA.detailStatus[g.uid] === 'loading') {
        lineupsPanelHtml = `
          <section class="panel" id="panel-lineups" role="tabpanel" aria-labelledby="tab-lineups" ${tab !== 1 ? 'hidden' : ''}>
            <div class="card"><div class="detail-skel" style="height:380px"></div></div>
          </section>
        `;
      } else {
        lineupsPanelHtml = `
          <section class="panel" id="panel-lineups" role="tabpanel" aria-labelledby="tab-lineups" ${tab !== 1 ? 'hidden' : ''}>
            <div class="card" style="text-align:center;padding:48px 18px;color:var(--muted)">
              <div style="font-size:36px;margin-bottom:12px">📋</div>
              <b style="color:var(--text);font-size:16px;display:block">Lineups not announced yet</b>
              <div style="margin-top:6px;font-size:13px">Lineups usually appear about an hour before kickoff.</div>
            </div>
          </section>
        `;
      }
    } else {
      const homeFormation = lineups.homeFormation || '4-4-2';
      const awayFormation = lineups.awayFormation || '4-4-2';

      // Pitch positions
      const homePos = typeof MatchDetailsAdapter !== 'undefined'
        ? MatchDetailsAdapter.calculatePitchPositions(homeStarters, homeFormation, false, detail.timeline)
        : [];
      const awayPos = typeof MatchDetailsAdapter !== 'undefined'
        ? MatchDetailsAdapter.calculatePitchPositions(awayStarters, awayFormation, true, detail.timeline)
        : [];

      const renderPlayerNode = (p, isAway) => {
        const badgesHtml = [];
        if (p.badges.goals > 0) badgesHtml.push(p.badges.goals > 1 ? `⚽${p.badges.goals}` : '⚽');
        if (p.badges.secondYellow) badgesHtml.push('<span class="yc" style="width:7px;height:10px"></span><span class="rc" style="width:7px;height:10px"></span>');
        else if (p.badges.redCard) badgesHtml.push('<span class="rc" style="width:7px;height:10px"></span>');
        else if (p.badges.yellowCard) badgesHtml.push('<span class="yc" style="width:7px;height:10px"></span>');
        if (p.badges.subbedOff) badgesHtml.push('<span class="sub-arrow">⇄</span>');

        const kColor = isAway ? '#ff5d5d' : '#e8f6f4';
        const teamName = isAway ? g.awayName : g.homeName;
        const teamId = isAway ? g.awayId : g.homeId;
        const clubKey = `${g.k}:${teamId}`;
        return `
          <div class="p${isAway ? ' a' : ''}" style="left:${p.x}%;top:${p.y}%;--k:${kColor};cursor:pointer" data-open-player="${esc(p.player.id || p.player.name)}" data-player-club="${esc(clubKey)}" data-player-name="${esc(p.player.name)}" data-player-team="${esc(teamName)}" role="button" tabindex="0" title="View profile for ${esc(p.player.name)}">
            <b>
              ${esc(p.player.jersey)}
              ${p.badges.captain ? '<span class="cap" title="Captain">C</span>' : ''}
              ${badgesHtml.length ? `<u>${badgesHtml.join('')}</u>` : ''}
            </b>
            <em>${esc(p.player.surname)}</em>
          </div>
        `;
      };

      const homePlayersHtml = homePos.map((p) => renderPlayerNode(p, false)).join('');
      const awayPlayersHtml = awayPos.map((p) => renderPlayerNode(p, true)).join('');

      // Accessible list for screen readers
      const srHomeList = homeStarters.map((p) => `<li>#${esc(p.jersey)} ${esc(p.name)} (${esc(p.position)})</li>`).join('');
      const srAwayList = awayStarters.map((p) => `<li>#${esc(p.jersey)} ${esc(p.name)} (${esc(p.position)})</li>`).join('');

      // Substitutes
      const homeSubs = lineups.home?.filter((p) => !p.starter) || [];
      const awaySubs = lineups.away?.filter((p) => !p.starter) || [];

      const renderBenchCol = (list, isAway) => {
        if (!list.length) return `<div class="m" style="padding:8px 0">None listed</div>`;
        const teamName = isAway ? g.awayName : g.homeName;
        const teamId = isAway ? g.awayId : g.homeId;
        const clubKey = `${g.k}:${teamId}`;
        return list.map((p) => {
          const photoUrl = (typeof window !== 'undefined' && window.PlayerSpotlight && window.PlayerSpotlight.getSpotlightPlayerPhoto)
            ? window.PlayerSpotlight.getSpotlightPlayerPhoto(p)
            : '';
          return `
            <div class="bench-player-row" data-open-player="${esc(p.id || p.name)}" data-player-club="${esc(clubKey)}" data-player-name="${esc(p.name)}" data-player-team="${esc(teamName)}" role="button" tabindex="0" style="cursor:pointer;padding:4px 0;display:flex;align-items:center;gap:8px" title="View ${esc(p.name)} profile">
              <span class="m" style="width:20px;text-align:right">${esc(p.jersey || '—')}</span>
              ${photoUrl ? `
                <img referrerpolicy="no-referrer" loading="lazy" src="${esc(photoUrl)}" alt="${esc(p.name)}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;background:#0D1A1C;flex:none;border:1px solid rgba(255,255,255,.15)" onerror="this.remove()" />
              ` : ''}
              <b style="font-weight:600;color:var(--t)">${esc(p.name)}</b>
            </div>
          `;
        }).join('');
      };

      const homeCoach = lineups.homeCoach || DATA.clubDetails?.[`${g.k}:${g.homeId}`]?.coach || '';
      const awayCoach = lineups.awayCoach || DATA.clubDetails?.[`${g.k}:${g.awayId}`]?.coach || '';

      lineupsPanelHtml = `
        <section class="panel" id="panel-lineups" role="tabpanel" aria-labelledby="tab-lineups" ${tab !== 1 ? 'hidden' : ''}>
          <div class="card">
            <div class="fm">
              <span>${esc(g.homeName)} <b>${esc(homeFormation)}</b></span>
              <span>${esc(g.awayName)} <b>${esc(awayFormation)}</b></span>
            </div>
            <div class="pitch" id="pitch" aria-label="Starting lineups pitch: ${esc(g.homeName)} vs ${esc(g.awayName)}">
              <i class="ln" style="left:0;right:0;top:50%"></i>
              <i class="ln" style="left:50%;top:50%;width:90px;height:90px;transform:translate(-50%,-50%);border-radius:50%"></i>
              <i class="ln" style="left:22%;right:22%;top:0;height:15%;border-top:0"></i>
              <i class="ln" style="left:22%;right:22%;bottom:0;height:15%;border-bottom:0"></i>
              <i class="ln" style="left:35%;right:35%;top:0;height:6%;border-top:0"></i>
              <i class="ln" style="left:35%;right:35%;bottom:0;height:6%;border-bottom:0"></i>
              ${homePlayersHtml}
              ${awayPlayersHtml}
            </div>
            <div class="sr-only">
              <h4>${esc(g.homeName)} Starting Lineup (${esc(homeFormation)})</h4>
              <ul>${srHomeList}</ul>
              <h4>${esc(g.awayName)} Starting Lineup (${esc(awayFormation)})</h4>
              <ul>${srAwayList}</ul>
            </div>
          </div>

          <div class="card">
            <h3>Substitutes</h3>
            <div class="bench">
              <div>${renderBenchCol(homeSubs, false)}</div>
              <div>${renderBenchCol(awaySubs, true)}</div>
            </div>
            ${(homeCoach || awayCoach) ? `
              <div class="coach">
                <span>${homeCoach ? `Coach: <b>${esc(homeCoach)}</b>` : ''}</span>
                <span>${awayCoach ? `Coach: <b>${esc(awayCoach)}</b>` : ''}</span>
              </div>
            ` : ''}
          </div>
        </section>
      `;
    }
  }

  // 6. Stats Panel
  let statsPanelHtml = '';
  {
    const rawStats = detail.statistics || [];
    let formattedStats = [];
    if (typeof MatchDetailsAdapter !== 'undefined' && MatchDetailsAdapter.formatMatchStats) {
      formattedStats = MatchDetailsAdapter.formatMatchStats(rawStats);
    } else {
      formattedStats = rawStats.map((s) => ({
        label: s.label,
        home: s.home,
        away: s.away,
        homePct: 50,
        awayPct: 50,
      }));
    }

    if (formattedStats.length > 0) {
      statsPanelHtml = `
        <section class="panel" id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" ${tab !== 2 ? 'hidden' : ''}>
          <div class="card">
            ${formattedStats.map((s) => `
              <div class="st">
                <div><b>${esc(s.home)}</b><em>${esc(s.label)}</em><b>${esc(s.away)}</b></div>
                <div class="tr"><i style="flex:${s.homePct}"></i><i style="flex:${s.awayPct}"></i></div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    } else if (DATA.detailStatus[g.uid] === 'loading') {
      statsPanelHtml = `
        <section class="panel" id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" ${tab !== 2 ? 'hidden' : ''}>
          <div class="card"><div class="detail-skel" style="height:240px"></div></div>
        </section>
      `;
    } else {
      statsPanelHtml = `
        <section class="panel" id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" ${tab !== 2 ? 'hidden' : ''}>
          <div class="card"><div class="empty" style="padding:32px 10px">No match statistics available yet.</div></div>
        </section>
      `;
    }
  }

  return `
    <div class="detail-shell">
      <div class="bar">
        <button class="detail-back-btn" data-close-detail="1" aria-label="Back">&larr;</button>
        <span class="bar-title" style="display:inline-flex;align-items:center;gap:8px">${typeof CountryFlag === 'function' ? CountryFlag({ competition: g.k || g.competitionName, country: g.competitionCountry || DATA.leaguesMap[g.k]?.country, size: 18 }) : ''}<span>${esc(headerTitle)}</span></span>
      </div>

      <div class="score">
        <div class="sb">
          <div class="team-col" data-open-club="${esc(g.homeId)}" data-club-league="${esc(g.k)}" role="button" tabindex="0">
            <span class="ring" style="--c:#e8f6f4">${homeCrest}</span>
            <span class="team-name">${esc(g.homeName)}</span>
          </div>
          <div>
            ${middleScoreHtml}
          </div>
          <div class="team-col" data-open-club="${esc(g.awayId)}" data-club-league="${esc(g.k)}" role="button" tabindex="0">
            <span class="ring" style="--c:#ff5d5d">${awayCrest}</span>
            <span class="team-name">${esc(g.awayName)}</span>
          </div>
        </div>
        ${refreshErrorNote}
      </div>

      ${tabsHtml}
      ${detailsPanelHtml}
      ${lineupsPanelHtml}
      ${statsPanelHtml}
    </div>
  `;
}

// 7.6 News View
function news() {
  return `
    <div class="ttl">${t('News')}</div>
    <div class="empty" style="margin-top:20px">Football headlines and updates are delivered via the live scores feed.</div>
    ${attribution()}
  `;
}

// 7.7 Profile & Settings View
function profile() {
  const savedCount = Object.keys(S.bm).filter((k) => S.bm[k]).length;
  return `
    <div class="ttl">Profile</div>
    <div class="av">MB</div>
    <div style="text-align:center;font-weight:800;font-size:18px">MatchBay</div>
    <div class="m" style="text-align:center">Live Football Scores &amp; Fixtures</div>

    <div class="card" style="margin-top:22px">
      <div class="row">
        <span>Match Alerts</span>
        <button class="tg${S.notif ? ' on' : ''}" data-tg aria-label="Toggle match alerts" aria-pressed="${Boolean(S.notif)}"></button>
      </div>
      <div class="row">
        <span>Auto-refresh Live Scores</span>
        <button class="tg${S.ar ? ' on' : ''}" data-toggle-ar="1"></button>
      </div>
      <div class="row">
        <span>Saved Matches</span>
        <span class="m">${savedCount}</span>
      </div>
      <div class="row">
        <span>Active Competitions</span>
        <span class="m">${DATA.leagues.length || 35}</span>
      </div>
    </div>

    <button class="set" data-so="1" style="margin-top:16px">Settings &amp; Preferences</button>
    ${attribution()}
  `;
}

// 7.8 Settings Overlay
function settings() {
  const ids = Object.keys(S.bm).filter((k) => S.bm[k]);
  return `
    <div class="dh">
      <button class="ib" data-sc="1" aria-label="Back">${svg('back')}</button>
      <div class="ttl">Settings</div>
    </div>

    <div class="card" style="margin-top:18px">
      <div class="row"><span>Language</span></div>
      <div class="chips" style="margin:0;padding:0 14px 14px">
        <button class="chip${S.lang === 'en' ? ' on' : ''}" data-lang="en">English</button>
        <button class="chip${S.lang === 'fr' ? ' on' : ''}" data-lang="fr">Français</button>
        <button class="chip${S.lang === 'ar' ? ' on' : ''}" data-lang="ar">العربية</button>
      </div>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="row">
        <span>Refresh Interval</span>
        <span class="r" style="gap:6px">
          ${[15, 20, 30, 60].map((sec) => `<button class="chip${S.ri === sec ? ' on' : ''}" style="height:32px;padding:0 10px" data-ri="${sec}">${sec}s</button>`).join('')}
        </span>
      </div>
    </div>

    <div class="r sb" style="margin-top:20px">
      <span class="h">Saved Matches</span>
      ${ids.length ? `<button class="clr" data-clear-saved="1">Clear all</button>` : ''}
    </div>
    ${ids.length
      ? ids.map((uid) => {
          const g = getMatchByUid(uid);
          if (!g) return '';
          return miniCard(g);
        }).join('')
      : `<div class="empty">No saved matches yet. Tap the bookmark icon on any match to save it.</div>`}

    ${attribution()}
  `;
}

/* ============ 8. MAIN DRAW & NAVIGATION ============ */
const navs = [
  ['home', 'Home', 'home'],
  ['matches', 'Matches', 'matches'],
  ['tables', 'Tables', 'tables'],
  ['news', 'News', 'news'],
  ['profile', 'Profile', 'profile'],
];

const home_ = document.getElementById('home');
const matches_ = document.getElementById('matches');
const tables_ = document.getElementById('tables');
const news_ = document.getElementById('news');
const profile_ = document.getElementById('profile');
const det_ = document.getElementById('detail');
const club_ = document.getElementById('club');
const player_ = document.getElementById('player');
const set_ = document.getElementById('set');

function draw() {
  const sl = [...document.querySelectorAll('.stories, .chips, .days')].map((e) => e.scrollLeft);
  const dy0 = det_ ? det_.scrollTop : 0;

  const navEl = document.querySelector('.nav');
  if (navEl) {
    navEl.hidden = Boolean(S.mt || S.selectedClubId || S.selectedPlayerId || S.set || (SG && !stv_?.hidden));
    navEl.innerHTML = navs
      .map(([k, label, iconKey]) => `
        <button class="nb${S.tab === k ? ' on' : ''}" data-go="${k}" aria-label="${label}">
          ${svg(iconKey)}
          <span>${t(label)}</span>
        </button>
      `)
      .join('');
  }

  if (home_) home_.innerHTML = home();
  if (matches_) matches_.innerHTML = matches();
  if (tables_) tables_.innerHTML = tables();
  if (news_) news_.innerHTML = news();
  if (profile_) profile_.innerHTML = profile();

  if (det_) {
    det_.hidden = !S.mt;
    det_.innerHTML = S.mt ? matchDetailModal() : '';
    if (S.mt) {
      det_.scrollTop = dy0;
      const tabBtns = det_.querySelectorAll('[role="tab"]');
      tabBtns.forEach((btn, idx) => {
        btn.onkeydown = (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const step = e.key === 'ArrowRight' ? 1 : -1;
            const nextIdx = (idx + step + tabBtns.length) % tabBtns.length;
            tabBtns[nextIdx].focus();
            tabBtns[nextIdx].click();
          }
        };
      });
    }
  }

  if (club_) {
    club_.hidden = !S.selectedClubId;
    club_.innerHTML = S.selectedClubId ? clubModal() : '';
  }

  if (player_) {
    player_.hidden = !S.selectedPlayerId;
    player_.innerHTML = S.selectedPlayerId ? playerModal() : '';
  }

  if (set_) {
    set_.hidden = !S.set;
    set_.innerHTML = S.set ? settings() : '';
  }

  document.querySelectorAll('.stories, .chips, .days').forEach((e, i) => {
    if (sl[i] !== undefined) e.scrollLeft = sl[i];
  });

  document.querySelectorAll('.pg').forEach((p) => {
    p.classList.toggle('on', p.id === S.tab);
  });

  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';

  if (S.tab === 'home' && !S.mt && !S.set && !S.selectedClubId && !S.selectedPlayerId && (!SG || stv_?.hidden)) {
    startHeroTimers();
  } else {
    stopHeroTimers();
  }

  save();
}

// URL Hash synchronization for match details tabs
window.addEventListener('hashchange', () => {
  if (S.mt) {
    let t = 0;
    const h = (location.hash || '').toLowerCase();
    if (h === '#lineups') t = 1;
    else if (h === '#stats') t = 2;
    if (S.mt.tab !== t) {
      S.mt.tab = t;
      draw();
    }
  }
});

/* ============ 9. EVENT LISTENERS ============ */
document.addEventListener('click', (e) => {
  if (e.target.closest('#q-clear')) {
    S.q = '';
    draw();
    return;
  }

  const target = e.target.closest('[data-open-player],[data-close-player],[data-fav-player],[data-search-cat],[data-search-player],[data-go],[data-d],[data-ms],[data-filter-league],[data-story-league],[data-st],[data-select-table-league],[data-open-club],[data-close-club],[data-match],[data-close-detail],[data-detail-tab],[data-open-table-from-match],[data-bm],[data-refresh-table],[data-so],[data-sc],[data-lang],[data-ri],[data-toggle-ar],[data-clear-saved],[data-tg],[data-share-match]');
  if (!target) return;

  const d = target.dataset;

  if (d.searchCat) {
    S.searchCat = d.searchCat;
    draw();
    return;
  }

  if (d.searchPlayer) {
    const pName = d.searchPlayer;
    const pTeam = d.playerTeam || '';
    const pPos = d.playerPos || '';
    const pJersey = d.playerJersey || '';
    const pCountry = d.playerCountry || '';
    const playerObj = {
      id: pName,
      name: pName,
      team: pTeam,
      position: pPos,
      jersey: pJersey,
      citizenship: pCountry,
      stats: { goals: 0, assists: 0, appearances: 0, subIns: 0, minutes: 0, yellowCards: 0, redCards: 0 }
    };
    openPlayerProfile(pName, pTeam, playerObj);
    return;
  }

  if (d.go) {
    S.tab = d.go;
    S.mt = null;
    S.set = false;
    S.selectedClubId = null;
    S.selectedPlayerId = null;
    draw();
    if (d.go === 'tables' && !DATA.standings[`${S.selectedTableLeague}:current`]) {
      API.loadStandings(S.selectedTableLeague).then(() => draw()).catch(() => draw());
      API.loadClubs(S.selectedTableLeague).then(() => draw()).catch(() => draw());
    }
    return;
  }

  if (d.d !== undefined) {
    S.D = Number(d.d);
    draw();
    API.loadOffset(S.D, { force: true }).then(() => draw()).catch(() => draw());
    return;
  }

  if (d.ms) {
    S.ms = d.ms;
    draw();
    return;
  }

  if (d.filterLeague !== undefined) {
    S.selectedLeague = d.filterLeague || null;
    draw();
    return;
  }

  if (d.st || d.storyLeague) {
    const slug = d.st || d.storyLeague;
    PULSE = slug;
    draw();
    setTimeout(() => {
      if (PULSE === slug) {
        PULSE = null;
        draw();
      }
    }, 450);
    stOpen(slug);
    return;
  }

  if (d.selectTableLeague) {
    S.selectedTableLeague = d.selectTableLeague;
    draw();
    API.loadStandings(S.selectedTableLeague).then(() => draw()).catch(() => draw());
    API.loadClubs(S.selectedTableLeague).then(() => draw()).catch(() => draw());
    return;
  }

  if (d.refreshTable) {
    delete DATA.standings[`${S.selectedTableLeague}:${S.selectedTableSeason || 'current'}`];
    draw();
    API.loadStandings(S.selectedTableLeague, S.selectedTableSeason).then(() => draw()).catch(() => draw());
    return;
  }

  if (d.openTableFromMatch) {
    S.selectedTableLeague = d.openTableFromMatch;
    S.mt = null;
    S.tab = 'tables';
    draw();
    API.loadStandings(S.selectedTableLeague).then(() => draw()).catch(() => draw());
    API.loadClubs(S.selectedTableLeague).then(() => draw()).catch(() => draw());
    return;
  }

  if (d.openClub) {
    S.selectedClubId = d.openClub;
    S.selectedClubLeague = d.clubLeague || S.selectedTableLeague || 'eng.1';
    draw();
    API.loadClubDetail(S.selectedClubLeague, S.selectedClubId).then(() => draw()).catch(() => draw());
    return;
  }

  if (d.closeClub) {
    S.selectedClubId = null;
    S.selectedPlayerId = null;
    draw();
    return;
  }

  if (d.openPlayer) {
    const pid = d.openPlayer;
    const pClub = d.playerClub || (S.selectedClubLeague && S.selectedClubId ? `${S.selectedClubLeague}:${S.selectedClubId}` : null);
    const pName = d.playerName || pid;
    const pTeam = d.playerTeam || '';
    const pObj = (d.playerName || d.playerTeam) ? {
      id: pid,
      name: pName,
      team: pTeam,
      stats: { goals: 0, assists: 0, appearances: 1, subIns: 0, minutes: 75, yellowCards: 0, redCards: 0 }
    } : null;
    openPlayerProfile(pid, pClub || pTeam, pObj);
    return;
  }

  if (d.closePlayer) {
    S.selectedPlayerId = null;
    draw();
    return;
  }

  if (d.favPlayer) {
    const pid = d.favPlayer;
    S.favoritePlayers = S.favoritePlayers || {};
    S.favoritePlayers[pid] = !S.favoritePlayers[pid];
    save();
    draw();
    tst(S.favoritePlayers[pid] ? 'Added to favorite players' : 'Removed from favorite players');
    return;
  }

  if (d.match) {
    const match = getMatchByUid(d.match);
    if (match) {
      let initialTab = 0;
      const h = (location.hash || '').toLowerCase();
      if (h === '#lineups') initialTab = 1;
      else if (h === '#stats') initialTab = 2;
      else {
        history.replaceState(null, '', '#details');
      }
      S.mt = { uid: match.uid, league: match.k, id: match.providerId, tab: initialTab };
      if (det_) det_.scrollTop = 0;
      draw();
      API.loadMatchDetails(match).then(() => {
        if (S.mt?.uid === match.uid) draw();
      }).catch(() => {});
    }
    return;
  }

  if (d.closeDetail) {
    S.mt = null;
    if (['#details', '#lineups', '#stats'].includes(location.hash)) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    draw();
    return;
  }

  if (d.detailTab !== undefined) {
    if (S.mt) {
      const idx = Number(d.detailTab);
      S.mt.tab = idx;
      const tabHashes = ['#details', '#lineups', '#stats'];
      if (tabHashes[idx]) {
        history.replaceState(null, '', tabHashes[idx]);
      }
      draw();
    }
    return;
  }

  if (d.bm) {
    toggleBookmark(d.bm);
    draw();
    return;
  }

  if (d.shareMatch) {
    shareMatchScore(d.shareMatch);
    return;
  }

  if (d.so) {
    S.set = true;
    draw();
    return;
  }

  if (d.sc) {
    S.set = false;
    draw();
    return;
  }

  if (d.lang) {
    S.lang = d.lang;
    draw();
    return;
  }

  if (d.ri) {
    S.ri = Number(d.ri);
    save();
    restartPolling();
    draw();
    return;
  }

  if (d.toggleAr) {
    S.ar = !S.ar;
    save();
    restartPolling();
    draw();
    return;
  }

  if (d.clearSaved) {
    S.bm = {};
    S.savedMatches = {};
    save();
    draw();
    tst('Saved matches cleared');
    return;
  }

  if (d.tg !== undefined) {
    S.notif = !S.notif;
    save();
    draw();
    tst(S.notif ? 'Match alerts enabled' : 'Match alerts disabled');
    return;
  }
});

// Story Viewer interactive clicks
if (stv_) {
  stv_.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sa]');
    if (!b || !SG) return;
    const a = b.dataset.sa;
    const { g } = SG.list[SG.i];

    if (a === 'prev') {
      stGo(-1);
    } else if (a === 'next') {
      stGo(1);
    } else if (a === 'pause') {
      SG.p = !SG.p;
      b.textContent = SG.p ? '▶' : 'Ⅱ';
    } else if (a === 'close') {
      stClose();
    } else if (a === 'mc') {
      stClose();
      S.mt = { uid: g.uid, league: g.k, id: g.providerId, tab: 0 };
      draw();
      if (det_) det_.scrollTop = 0;
      API.loadMatchDetails(g).then(() => {
        if (S.mt?.uid === g.uid) draw();
      });
    } else if (a === 'fav') {
      toggleBookmark(g.uid);
      b.textContent = S.bm[g.uid] ? '♥' : '♡';
      b.classList.toggle('on', Boolean(S.bm[g.uid]));
    } else if (a === 'share') {
      shareMatchScore(g.uid);
    }
  });

  let sx = 0;
  let sy = 0;
  stv_.addEventListener('touchstart', (e) => {
    sx = e.changedTouches[0].clientX;
    sy = e.changedTouches[0].clientY;
  }, { passive: true });

  stv_.addEventListener('touchend', (e) => {
    if (!SG) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      stGo(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

// Story Viewer keyboard controls
document.addEventListener('keydown', (e) => {
  if (SG) {
    if (e.key === 'ArrowRight') stGo(1);
    if (e.key === 'ArrowLeft') stGo(-1);
    if (e.key === 'Escape') stClose();
  }
});

// Mouse drag-to-scroll on horizontal lists
document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return;
  const r = e.target.closest('.stories, .chips, .days');
  if (!r) return;
  const x0 = e.clientX;
  const s0 = r.scrollLeft;
  let mv = false;
  const m = (v) => {
    if (Math.abs(v.clientX - x0) > 4) {
      mv = true;
      r.classList.add('dg');
    }
    if (mv) r.scrollLeft = s0 - (v.clientX - x0);
  };
  const u = () => {
    document.removeEventListener('pointermove', m);
    r.classList.remove('dg');
    if (mv) {
      const h = (c) => {
        c.stopPropagation();
        c.preventDefault();
      };
      document.addEventListener('click', h, true);
      setTimeout(() => document.removeEventListener('click', h, true), 60);
    }
  };
  document.addEventListener('pointermove', m);
  document.addEventListener('pointerup', u, { once: true });
});

// Search input
document.addEventListener('input', (e) => {
  if (e.target.id === 'q') {
    S.q = e.target.value;
    const mres = document.getElementById('mres');
    if (mres && S.tab === 'matches') {
      const q = S.q.toLowerCase().trim();
      const datesBarEl = document.getElementById('matches-dates-bar');
      if (datesBarEl) {
        datesBarEl.style.display = q ? 'none' : '';
      }

      // Dynamically toggle clear button
      let clearBtn = document.getElementById('q-clear');
      if (S.q && !clearBtn) {
        const srchLabel = e.target.closest('.srch');
        if (srchLabel) {
          const btn = document.createElement('button');
          btn.id = 'q-clear';
          btn.type = 'button';
          btn.setAttribute('aria-label', 'Clear search');
          btn.style.cssText = 'background:none;border:0;color:var(--m);cursor:pointer;padding:4px 6px;display:flex;align-items:center;font-size:16px;line-height:1';
          btn.textContent = '✕';
          srchLabel.appendChild(btn);
        }
      } else if (!S.q && clearBtn) {
        clearBtn.remove();
      }

      const dayISO = dateISO(S.D);
      mres.innerHTML = renderMatchesViewContent(q, dayISO);
    }
  }
});

/* ============ 10. POLLING & INITIALIZATION ============ */
let pollTimer = null;

async function poll() {
  if (document.hidden || !S.ar) return;

  // Poll scoreboard only if we are viewing today or have live matches
  if (S.D === 0) {
    const todayISO = dateISO(0);
    const dayMatches = Object.values(DATA.matches).filter((m) => m.dateISO === todayISO);
    const hasLive = dayMatches.some((m) => m.st === 'live');

    // If there are live matches or matches today, poll scoreboard
    if (hasLive || dayMatches.length > 0) {
      await API.loadOffset(0, { force: true });
      draw();
    }
  }

  // If a live match is currently open in modal, refresh its details
  if (S.mt) {
    const current = getMatchByUid(S.mt.uid);
    if (current && current.st === 'live') {
      await API.loadMatchDetails(current);
      draw();
    }
  }
}

function restartPolling() {
  if (pollTimer) clearInterval(pollTimer);
  if (S.ar) {
    pollTimer = setInterval(poll, S.ri * 1000);
  }
}

// Initial boot
API.restore();
draw();
API.loadPlayerPhotosDb().then(() => draw()).catch(() => {});

API.loadLeagues().then(() => {
  draw();
  API.loadOffset(S.D, { force: true }).then(() => {
    draw();
    if (S.D === 0) {
      API.loadOffset(1).then(() => draw()).catch(() => {});
    }
  }).catch(() => draw());
  // Preload initial standings for default table league
  API.loadStandings(S.selectedTableLeague).then(() => draw()).catch(() => draw());
  API.loadClubs(S.selectedTableLeague).then(() => draw()).catch(() => draw());
}).catch(() => draw());

restartPolling();

// Stories Mode automatic switch check (evaluated dynamically on clock)
function checkStoriesAutoRefresh() {
  if (SG && SG.k) {
    const currentMode = SG.mode;
    const modeInfo = getLeagueRoundStoriesMode(SG.k);
    if (currentMode !== modeInfo.modeResult.mode) {
      // Automatic transition when cutoff is reached!
      if (modeInfo.modeResult.mode === 'results' && modeInfo.storyMatches.length > 0) {
        SG.mode = 'results';
        SG.list = modeInfo.storyMatches.map((m) => ({ g: m.g || m, d: 0, j: 0 }));
        SG.roundName = modeInfo.roundName;
        stRender();
      } else if (modeInfo.modeResult.mode === 'default') {
        const upcomingList = upc(SG.k);
        if (upcomingList.length) {
          SG.mode = 'default';
          SG.list = upcomingList;
          stRender();
        }
      }
    }
  }
}
setInterval(checkStoriesAutoRefresh, 15000);

/* ============ 11. PWA SERVICE WORKER ============ */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=matchbay-v17').catch(() => {});
  });
}
