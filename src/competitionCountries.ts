/**
 * MatchBay Competition to Country Mapping & Resolution Registry
 *
 * Requirements:
 * - Uses ISO 3166-1 alpha-2 codes (fr, it, de, es, pt, tr, br, ar, us, nl, sa, etc.)
 * - Subdivision codes: gb-eng (England), gb-sct (Scotland), gb-wls (Wales), gb-nir (Northern Ireland).
 *   Never use the UK (gb) flag for English or Scottish competitions!
 * - International markers:
 *   - UEFA competitions (Champions League, Europa League, Conference League, Nations League, Super Cup): Europe (eu) flag.
 *   - FIFA competitions (World Cup, Club World Cup): neutral world / globe icon.
 *   - CONMEBOL competitions (Libertadores, Copa América): South America marker.
 *   - CONCACAF competitions: North America marker.
 * - Resolves country from feed's country field where present, using mapping as override/fallback.
 */

export interface CountryFlagInfo {
  code: string;
  country: string;
  flagUrl: string;
}

// Canonical ISO 3166-1 alpha-2 and UK subdivision mappings
export const COUNTRY_CODE_MAP: Record<string, CountryFlagInfo> = {
  // UK subdivisions
  england: { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  scotland: { code: 'gb-sct', country: 'Scotland', flagUrl: '/flags/gb-sct.svg' },
  wales: { code: 'gb-wls', country: 'Wales', flagUrl: '/flags/gb-wls.svg' },
  'northern ireland': { code: 'gb-nir', country: 'Northern Ireland', flagUrl: '/flags/gb-nir.svg' },

  // European nations
  spain: { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },
  germany: { code: 'de', country: 'Germany', flagUrl: '/flags/de.svg' },
  italy: { code: 'it', country: 'Italy', flagUrl: '/flags/it.svg' },
  france: { code: 'fr', country: 'France', flagUrl: '/flags/fr.svg' },
  netherlands: { code: 'nl', country: 'Netherlands', flagUrl: '/flags/nl.svg' },
  holland: { code: 'nl', country: 'Netherlands', flagUrl: '/flags/nl.svg' },
  portugal: { code: 'pt', country: 'Portugal', flagUrl: '/flags/pt.svg' },
  belgium: { code: 'be', country: 'Belgium', flagUrl: '/flags/be.svg' },
  austria: { code: 'at', country: 'Austria', flagUrl: '/flags/at.svg' },
  turkey: { code: 'tr', country: 'Turkey', flagUrl: '/flags/tr.svg' },
  türkiye: { code: 'tr', country: 'Turkey', flagUrl: '/flags/tr.svg' },
  croatia: { code: 'hr', country: 'Croatia', flagUrl: '/flags/hr.svg' },
  switzerland: { code: 'ch', country: 'Switzerland', flagUrl: '/flags/ch.svg' },
  denmark: { code: 'dk', country: 'Denmark', flagUrl: '/flags/dk.svg' },
  sweden: { code: 'se', country: 'Sweden', flagUrl: '/flags/se.svg' },
  norway: { code: 'no', country: 'Norway', flagUrl: '/flags/no.svg' },
  poland: { code: 'pl', country: 'Poland', flagUrl: '/flags/pl.svg' },
  greece: { code: 'gr', country: 'Greece', flagUrl: '/flags/gr.svg' },
  czechia: { code: 'cz', country: 'Czechia', flagUrl: '/flags/cz.svg' },
  ukraine: { code: 'ua', country: 'Ukraine', flagUrl: '/flags/ua.svg' },

  // Americas
  'united states': { code: 'us', country: 'United States', flagUrl: '/flags/us.svg' },
  usa: { code: 'us', country: 'United States', flagUrl: '/flags/us.svg' },
  us: { code: 'us', country: 'United States', flagUrl: '/flags/us.svg' },
  mexico: { code: 'mx', country: 'Mexico', flagUrl: '/flags/mx.svg' },
  argentina: { code: 'ar', country: 'Argentina', flagUrl: '/flags/ar.svg' },
  brazil: { code: 'br', country: 'Brazil', flagUrl: '/flags/br.svg' },
  uruguay: { code: 'uy', country: 'Uruguay', flagUrl: '/flags/uy.svg' },
  colombia: { code: 'co', country: 'Colombia', flagUrl: '/flags/co.svg' },
  chile: { code: 'cl', country: 'Chile', flagUrl: '/flags/cl.svg' },
  canada: { code: 'ca', country: 'Canada', flagUrl: '/flags/ca.svg' },

  // Asia & Middle East & Africa
  'saudi arabia': { code: 'sa', country: 'Saudi Arabia', flagUrl: '/flags/sa.svg' },
  japan: { code: 'jp', country: 'Japan', flagUrl: '/flags/jp.svg' },
  'south korea': { code: 'kr', country: 'South Korea', flagUrl: '/flags/kr.svg' },
  australia: { code: 'au', country: 'Australia', flagUrl: '/flags/au.svg' },
  morocco: { code: 'ma', country: 'Morocco', flagUrl: '/flags/ma.svg' },
  egypt: { code: 'eg', country: 'Egypt', flagUrl: '/flags/eg.svg' },
  nigeria: { code: 'ng', country: 'Nigeria', flagUrl: '/flags/ng.svg' },
  senegal: { code: 'sn', country: 'Senegal', flagUrl: '/flags/sn.svg' },
  cameroon: { code: 'cm', country: 'Cameroon', flagUrl: '/flags/cm.svg' },
  ghana: { code: 'gh', country: 'Ghana', flagUrl: '/flags/gh.svg' },

  // Continental & International markers
  europe: { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  uefa: { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  'south america': { code: 'south-america', country: 'South America', flagUrl: '/flags/south-america.svg' },
  conmebol: { code: 'south-america', country: 'South America', flagUrl: '/flags/south-america.svg' },
  'north america': { code: 'north-america', country: 'North America', flagUrl: '/flags/north-america.svg' },
  concacaf: { code: 'north-america', country: 'North America', flagUrl: '/flags/north-america.svg' },
  international: { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
  world: { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
  fifa: { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
};

// Full competition mapping covering EVERY competition in MatchBay
export const COMPETITION_COUNTRY_MAP: Record<string, CountryFlagInfo> = {
  // English competitions (always gb-eng)
  'eng.1': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.2': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.3': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.4': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.5': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.fa': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.league_cup': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.trophy': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.charity': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.asia_trophy': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.w.1': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.w.fa': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
  'eng.w.charity': { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },

  // Spanish competitions
  'esp.1': { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },
  'esp.2': { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },
  'esp.copa_del_rey': { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },
  'esp.super_cup': { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },
  'esp.joan_gamper': { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },
  'esp.w.1': { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },
  'esp.copa_de_la_reina': { code: 'es', country: 'Spain', flagUrl: '/flags/es.svg' },

  // German competitions
  'ger.1': { code: 'de', country: 'Germany', flagUrl: '/flags/de.svg' },
  'ger.2': { code: 'de', country: 'Germany', flagUrl: '/flags/de.svg' },
  'ger.dfb_pokal': { code: 'de', country: 'Germany', flagUrl: '/flags/de.svg' },

  // Italian competitions
  'ita.1': { code: 'it', country: 'Italy', flagUrl: '/flags/it.svg' },
  'ita.2': { code: 'it', country: 'Italy', flagUrl: '/flags/it.svg' },
  'ita.coppa_italia': { code: 'it', country: 'Italy', flagUrl: '/flags/it.svg' },

  // French competitions
  'fra.1': { code: 'fr', country: 'France', flagUrl: '/flags/fr.svg' },
  'fra.2': { code: 'fr', country: 'France', flagUrl: '/flags/fr.svg' },

  // Dutch competitions
  'ned.1': { code: 'nl', country: 'Netherlands', flagUrl: '/flags/nl.svg' },

  // Scottish competitions (always gb-sct)
  'sco.1': { code: 'gb-sct', country: 'Scotland', flagUrl: '/flags/gb-sct.svg' },

  // Portuguese competitions
  'por.1': { code: 'pt', country: 'Portugal', flagUrl: '/flags/pt.svg' },
  'por.taca_de_portugal': { code: 'pt', country: 'Portugal', flagUrl: '/flags/pt.svg' },

  // Belgian competitions
  'bel.1': { code: 'be', country: 'Belgium', flagUrl: '/flags/be.svg' },

  // Austrian competitions
  'aut.1': { code: 'at', country: 'Austria', flagUrl: '/flags/at.svg' },

  // Turkish competitions
  'tur.1': { code: 'tr', country: 'Turkey', flagUrl: '/flags/tr.svg' },

  // USA competitions
  'usa.1': { code: 'us', country: 'United States', flagUrl: '/flags/us.svg' },

  // Mexican competitions
  'mex.1': { code: 'mx', country: 'Mexico', flagUrl: '/flags/mx.svg' },

  // Argentine competitions
  'arg.1': { code: 'ar', country: 'Argentina', flagUrl: '/flags/ar.svg' },

  // Brazilian competitions
  'bra.1': { code: 'br', country: 'Brazil', flagUrl: '/flags/br.svg' },

  // Saudi Arabian competitions
  'ksa.1': { code: 'sa', country: 'Saudi Arabia', flagUrl: '/flags/sa.svg' },

  // Japanese competitions
  'jpn.1': { code: 'jp', country: 'Japan', flagUrl: '/flags/jp.svg' },

  // UEFA International Club & National competitions -> Europe (EU) flag
  'uefa.champions': { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  'uefa.europa': { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  'uefa.conference': { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  'uefa.europa.conf': { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  'uefa.super_cup': { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  'uefa.nations': { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
  'uefa.euro': { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },

  // CONMEBOL International competitions -> South America marker
  'conmebol.libertadores': { code: 'south-america', country: 'South America', flagUrl: '/flags/south-america.svg' },
  'conmebol.copa_america': { code: 'south-america', country: 'South America', flagUrl: '/flags/south-america.svg' },
  'conmebol.sudamericana': { code: 'south-america', country: 'South America', flagUrl: '/flags/south-america.svg' },

  // CONCACAF International competitions -> North America marker
  'concacaf.champions': { code: 'north-america', country: 'North America', flagUrl: '/flags/north-america.svg' },
  'concacaf.gold_cup': { code: 'north-america', country: 'North America', flagUrl: '/flags/north-america.svg' },
  'concacaf.nations': { code: 'north-america', country: 'North America', flagUrl: '/flags/north-america.svg' },

  // FIFA & Global competitions -> World / Globe marker
  'fifa.world_cup': { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
  'fifa.world': { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
  'fifa.club_world_cup': { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
  'international.friendly': { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
};

/**
 * Normalizes input string for robust lookup
 */
function normalizeKey(str: unknown): string {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Resolves country code, country name, and flag URL for any competition or country input.
 * Priority:
 * 1. Explicit international override for UEFA / CONMEBOL / CONCACAF / FIFA slugs
 * 2. Feed country field (derived directly from API data if provided)
 * 3. Exact competition slug match
 * 4. Prefix match (e.g. 'eng.*' -> England, 'esp.*' -> Spain)
 * 5. Name match (e.g. 'Premier League', 'Bundesliga', 'Ligue 1')
 * 6. Neutral Globe fallback with warning in development
 */
export function getCountryForCompetition(
  compOrSlug: any,
  explicitCountry?: string
): CountryFlagInfo {
  // If object passed, extract slug, country, name
  let slug = '';
  let compName = '';
  let countryField = explicitCountry || '';

  if (typeof compOrSlug === 'string') {
    slug = compOrSlug.trim().toLowerCase();
    compName = compOrSlug;
  } else if (compOrSlug && typeof compOrSlug === 'object') {
    slug = String(compOrSlug.slug || compOrSlug.k || compOrSlug.id || '').trim().toLowerCase();
    compName = String(compOrSlug.name || compOrSlug.competitionName || compOrSlug.abbreviation || '');
    if (!countryField) {
      countryField = String(compOrSlug.country || compOrSlug.competitionCountry || '');
    }
  }

  // 1. Check for international overrides first (even if country is passed as "Europe" or empty)
  if (slug) {
    if (COMPETITION_COUNTRY_MAP[slug]) {
      return COMPETITION_COUNTRY_MAP[slug];
    }
  }

  // 2. Derive from data feed's country field where it exists
  if (countryField) {
    const normCountry = normalizeKey(countryField);
    if (COUNTRY_CODE_MAP[normCountry]) {
      return COUNTRY_CODE_MAP[normCountry];
    }
    // Check partial matches on country name
    for (const [key, info] of Object.entries(COUNTRY_CODE_MAP)) {
      if (normCountry.includes(key) || key.includes(normCountry)) {
        return info;
      }
    }
  }

  // 3. Match by competition slug prefix (e.g., 'eng.fa' -> gb-eng)
  if (slug) {
    const prefix = slug.split('.')[0];
    switch (prefix) {
      case 'eng':
        return COMPETITION_COUNTRY_MAP['eng.1'];
      case 'esp':
        return COMPETITION_COUNTRY_MAP['esp.1'];
      case 'ger':
        return COMPETITION_COUNTRY_MAP['ger.1'];
      case 'ita':
        return COMPETITION_COUNTRY_MAP['ita.1'];
      case 'fra':
        return COMPETITION_COUNTRY_MAP['fra.1'];
      case 'ned':
        return COMPETITION_COUNTRY_MAP['ned.1'];
      case 'sco':
        return COMPETITION_COUNTRY_MAP['sco.1'];
      case 'por':
        return COMPETITION_COUNTRY_MAP['por.1'];
      case 'bel':
        return COMPETITION_COUNTRY_MAP['bel.1'];
      case 'aut':
        return COMPETITION_COUNTRY_MAP['aut.1'];
      case 'tur':
        return COMPETITION_COUNTRY_MAP['tur.1'];
      case 'usa':
        return COMPETITION_COUNTRY_MAP['usa.1'];
      case 'mex':
        return COMPETITION_COUNTRY_MAP['mex.1'];
      case 'arg':
        return COMPETITION_COUNTRY_MAP['arg.1'];
      case 'bra':
        return COMPETITION_COUNTRY_MAP['bra.1'];
      case 'ksa':
        return COMPETITION_COUNTRY_MAP['ksa.1'];
      case 'jpn':
        return COMPETITION_COUNTRY_MAP['jpn.1'];
      case 'uefa':
        return COMPETITION_COUNTRY_MAP['uefa.champions'];
      case 'conmebol':
        return COMPETITION_COUNTRY_MAP['conmebol.libertadores'];
      case 'concacaf':
        return COMPETITION_COUNTRY_MAP['concacaf.champions'];
      case 'fifa':
        return COMPETITION_COUNTRY_MAP['fifa.world_cup'];
    }
  }

  // 4. Match by competition name keywords
  const normName = normalizeKey(compName);
  if (normName) {
    if (normName.includes('premier league') || normName.includes('fa cup') || normName.includes('carabao') || normName.includes('championship') || normName.includes('efl') || normName.includes('english')) {
      return COMPETITION_COUNTRY_MAP['eng.1'];
    }
    if (normName.includes('laliga') || normName.includes('copa del rey') || normName.includes('supercopa') || normName.includes('spanish') || normName.includes('liga f')) {
      return COMPETITION_COUNTRY_MAP['esp.1'];
    }
    if (normName.includes('bundesliga') || normName.includes('dfb') || normName.includes('german')) {
      return COMPETITION_COUNTRY_MAP['ger.1'];
    }
    if (normName.includes('serie a') || normName.includes('serie b') || normName.includes('coppa italia') || normName.includes('italian')) {
      return COMPETITION_COUNTRY_MAP['ita.1'];
    }
    if (normName.includes('ligue 1') || normName.includes('ligue 2') || normName.includes('french')) {
      return COMPETITION_COUNTRY_MAP['fra.1'];
    }
    if (normName.includes('eredivisie') || normName.includes('dutch')) {
      return COMPETITION_COUNTRY_MAP['ned.1'];
    }
    if (normName.includes('premiership') || normName.includes('spfl') || normName.includes('scottish')) {
      return COMPETITION_COUNTRY_MAP['sco.1'];
    }
    if (normName.includes('primeira liga') || normName.includes('taca') || normName.includes('portuguese')) {
      return COMPETITION_COUNTRY_MAP['por.1'];
    }
    if (normName.includes('pro league') || normName.includes('belgian')) {
      return COMPETITION_COUNTRY_MAP['bel.1'];
    }
    if (normName.includes('austrian')) {
      return COMPETITION_COUNTRY_MAP['aut.1'];
    }
    if (normName.includes('super lig') || normName.includes('turkish')) {
      return COMPETITION_COUNTRY_MAP['tur.1'];
    }
    if (normName.includes('mls') || normName.includes('major league soccer')) {
      return COMPETITION_COUNTRY_MAP['usa.1'];
    }
    if (normName.includes('liga mx') || normName.includes('mexican')) {
      return COMPETITION_COUNTRY_MAP['mex.1'];
    }
    if (normName.includes('argentin') || normName.includes('lpf')) {
      return COMPETITION_COUNTRY_MAP['arg.1'];
    }
    if (normName.includes('brasileir') || normName.includes('brazil')) {
      return COMPETITION_COUNTRY_MAP['bra.1'];
    }
    if (normName.includes('saudi')) {
      return COMPETITION_COUNTRY_MAP['ksa.1'];
    }
    if (normName.includes('j.league') || normName.includes('j1') || normName.includes('japanese')) {
      return COMPETITION_COUNTRY_MAP['jpn.1'];
    }
    if (normName.includes('champions league') || normName.includes('europa') || normName.includes('conference') || normName.includes('nations league') || normName.includes('uefa')) {
      return COMPETITION_COUNTRY_MAP['uefa.champions'];
    }
    if (normName.includes('libertadores') || normName.includes('sudamericana') || normName.includes('conmebol') || normName.includes('copa america')) {
      return COMPETITION_COUNTRY_MAP['conmebol.libertadores'];
    }
    if (normName.includes('world cup') || normName.includes('fifa')) {
      return COMPETITION_COUNTRY_MAP['fifa.world_cup'];
    }
  }

  // 5. Fallback with console warning in dev
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(`[CompetitionCountry] No country mapping found for "${slug || compName}". Falling back to neutral globe.`);
  }

  return {
    code: 'globe',
    country: 'International',
    flagUrl: '/flags/globe.svg',
  };
}
