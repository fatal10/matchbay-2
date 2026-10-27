/**
 * MatchBay Competition to Country Mapping & Resolution Registry (Browser / UMD)
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
    root.CompetitionCountries = exp;
    root.COUNTRY_CODE_MAP = exp.COUNTRY_CODE_MAP;
    root.COMPETITION_COUNTRY_MAP = exp.COMPETITION_COUNTRY_MAP;
    root.getCountryForCompetition = exp.getCountryForCompetition;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var COUNTRY_CODE_MAP = {
    england: { code: 'gb-eng', country: 'England', flagUrl: '/flags/gb-eng.svg' },
    scotland: { code: 'gb-sct', country: 'Scotland', flagUrl: '/flags/gb-sct.svg' },
    wales: { code: 'gb-wls', country: 'Wales', flagUrl: '/flags/gb-wls.svg' },
    'northern ireland': { code: 'gb-nir', country: 'Northern Ireland', flagUrl: '/flags/gb-nir.svg' },
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
    europe: { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
    uefa: { code: 'eu', country: 'Europe', flagUrl: '/flags/eu.svg' },
    'south america': { code: 'south-america', country: 'South America', flagUrl: '/flags/south-america.svg' },
    conmebol: { code: 'south-america', country: 'South America', flagUrl: '/flags/south-america.svg' },
    'north america': { code: 'north-america', country: 'North America', flagUrl: '/flags/north-america.svg' },
    concacaf: { code: 'north-america', country: 'North America', flagUrl: '/flags/north-america.svg' },
    international: { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
    world: { code: 'world', country: 'International', flagUrl: '/flags/world.svg' },
    fifa: { code: 'world', country: 'International', flagUrl: '/flags/world.svg' }
  };

  var COMPETITION_COUNTRY_MAP = {
    // English competitions (subdivision gb-eng)
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

    // Scottish competitions (subdivision gb-sct)
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
    'international.friendly': { code: 'world', country: 'International', flagUrl: '/flags/world.svg' }
  };

  function normalizeKey(str) {
    return String(str || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  function getCountryForCompetition(compOrSlug, explicitCountry) {
    var slug = '';
    var compName = '';
    var countryField = explicitCountry || '';

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

    // 1. Direct slug match
    if (slug && COMPETITION_COUNTRY_MAP[slug]) {
      return COMPETITION_COUNTRY_MAP[slug];
    }

    // 2. Data feed country field
    if (countryField) {
      var normCountry = normalizeKey(countryField);
      if (COUNTRY_CODE_MAP[normCountry]) {
        return COUNTRY_CODE_MAP[normCountry];
      }
      for (var key in COUNTRY_CODE_MAP) {
        if (normCountry.indexOf(key) !== -1 || key.indexOf(normCountry) !== -1) {
          return COUNTRY_CODE_MAP[key];
        }
      }
    }

    // 3. Slug prefix match
    if (slug) {
      var prefix = slug.split('.')[0];
      switch (prefix) {
        case 'eng': return COMPETITION_COUNTRY_MAP['eng.1'];
        case 'esp': return COMPETITION_COUNTRY_MAP['esp.1'];
        case 'ger': return COMPETITION_COUNTRY_MAP['ger.1'];
        case 'ita': return COMPETITION_COUNTRY_MAP['ita.1'];
        case 'fra': return COMPETITION_COUNTRY_MAP['fra.1'];
        case 'ned': return COMPETITION_COUNTRY_MAP['ned.1'];
        case 'sco': return COMPETITION_COUNTRY_MAP['sco.1'];
        case 'por': return COMPETITION_COUNTRY_MAP['por.1'];
        case 'bel': return COMPETITION_COUNTRY_MAP['bel.1'];
        case 'aut': return COMPETITION_COUNTRY_MAP['aut.1'];
        case 'tur': return COMPETITION_COUNTRY_MAP['tur.1'];
        case 'usa': return COMPETITION_COUNTRY_MAP['usa.1'];
        case 'mex': return COMPETITION_COUNTRY_MAP['mex.1'];
        case 'arg': return COMPETITION_COUNTRY_MAP['arg.1'];
        case 'bra': return COMPETITION_COUNTRY_MAP['bra.1'];
        case 'ksa': return COMPETITION_COUNTRY_MAP['ksa.1'];
        case 'jpn': return COMPETITION_COUNTRY_MAP['jpn.1'];
        case 'uefa': return COMPETITION_COUNTRY_MAP['uefa.champions'];
        case 'conmebol': return COMPETITION_COUNTRY_MAP['conmebol.libertadores'];
        case 'concacaf': return COMPETITION_COUNTRY_MAP['concacaf.champions'];
        case 'fifa': return COMPETITION_COUNTRY_MAP['fifa.world_cup'];
      }
    }

    // 4. Name match
    var normName = normalizeKey(compName);
    if (normName) {
      if (normName.indexOf('premier league') !== -1 || normName.indexOf('fa cup') !== -1 || normName.indexOf('carabao') !== -1 || normName.indexOf('championship') !== -1 || normName.indexOf('efl') !== -1 || normName.indexOf('english') !== -1) {
        return COMPETITION_COUNTRY_MAP['eng.1'];
      }
      if (normName.indexOf('laliga') !== -1 || normName.indexOf('copa del rey') !== -1 || normName.indexOf('supercopa') !== -1 || normName.indexOf('spanish') !== -1 || normName.indexOf('liga f') !== -1) {
        return COMPETITION_COUNTRY_MAP['esp.1'];
      }
      if (normName.indexOf('bundesliga') !== -1 || normName.indexOf('dfb') !== -1 || normName.indexOf('german') !== -1) {
        return COMPETITION_COUNTRY_MAP['ger.1'];
      }
      if (normName.indexOf('serie a') !== -1 || normName.indexOf('serie b') !== -1 || normName.indexOf('coppa italia') !== -1 || normName.indexOf('italian') !== -1) {
        return COMPETITION_COUNTRY_MAP['ita.1'];
      }
      if (normName.indexOf('ligue 1') !== -1 || normName.indexOf('ligue 2') !== -1 || normName.indexOf('french') !== -1) {
        return COMPETITION_COUNTRY_MAP['fra.1'];
      }
      if (normName.indexOf('eredivisie') !== -1 || normName.indexOf('dutch') !== -1) {
        return COMPETITION_COUNTRY_MAP['ned.1'];
      }
      if (normName.indexOf('premiership') !== -1 || normName.indexOf('spfl') !== -1 || normName.indexOf('scottish') !== -1) {
        return COMPETITION_COUNTRY_MAP['sco.1'];
      }
      if (normName.indexOf('primeira liga') !== -1 || normName.indexOf('taca') !== -1 || normName.indexOf('portuguese') !== -1) {
        return COMPETITION_COUNTRY_MAP['por.1'];
      }
      if (normName.indexOf('pro league') !== -1 || normName.indexOf('belgian') !== -1) {
        return COMPETITION_COUNTRY_MAP['bel.1'];
      }
      if (normName.indexOf('austrian') !== -1) {
        return COMPETITION_COUNTRY_MAP['aut.1'];
      }
      if (normName.indexOf('super lig') !== -1 || normName.indexOf('turkish') !== -1) {
        return COMPETITION_COUNTRY_MAP['tur.1'];
      }
      if (normName.indexOf('mls') !== -1 || normName.indexOf('major league soccer') !== -1) {
        return COMPETITION_COUNTRY_MAP['usa.1'];
      }
      if (normName.indexOf('liga mx') !== -1 || normName.indexOf('mexican') !== -1) {
        return COMPETITION_COUNTRY_MAP['mex.1'];
      }
      if (normName.indexOf('argentin') !== -1 || normName.indexOf('lpf') !== -1) {
        return COMPETITION_COUNTRY_MAP['arg.1'];
      }
      if (normName.indexOf('brasileir') !== -1 || normName.indexOf('brazil') !== -1) {
        return COMPETITION_COUNTRY_MAP['bra.1'];
      }
      if (normName.indexOf('saudi') !== -1) {
        return COMPETITION_COUNTRY_MAP['ksa.1'];
      }
      if (normName.indexOf('j.league') !== -1 || normName.indexOf('j1') !== -1 || normName.indexOf('japanese') !== -1) {
        return COMPETITION_COUNTRY_MAP['jpn.1'];
      }
      if (normName.indexOf('champions league') !== -1 || normName.indexOf('europa') !== -1 || normName.indexOf('conference') !== -1 || normName.indexOf('nations league') !== -1 || normName.indexOf('uefa') !== -1) {
        return COMPETITION_COUNTRY_MAP['uefa.champions'];
      }
      if (normName.indexOf('libertadores') !== -1 || normName.indexOf('sudamericana') !== -1 || normName.indexOf('conmebol') !== -1 || normName.indexOf('copa america') !== -1) {
        return COMPETITION_COUNTRY_MAP['conmebol.libertadores'];
      }
      if (normName.indexOf('world cup') !== -1 || normName.indexOf('fifa') !== -1) {
        return COMPETITION_COUNTRY_MAP['fifa.world_cup'];
      }
    }

    // 5. Fallback
    if (typeof console !== 'undefined' && console.warn && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      console.warn('[CompetitionCountry] No country mapping found for "' + (slug || compName) + '". Using neutral globe fallback.');
    }

    return {
      code: 'globe',
      country: 'International',
      flagUrl: '/flags/globe.svg'
    };
  }

  return {
    COUNTRY_CODE_MAP: COUNTRY_CODE_MAP,
    COMPETITION_COUNTRY_MAP: COMPETITION_COUNTRY_MAP,
    getCountryForCompetition: getCountryForCompetition
  };
});
