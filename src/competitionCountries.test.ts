import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getCountryForCompetition, COMPETITION_COUNTRY_MAP, COUNTRY_CODE_MAP } from './competitionCountries';
import { CountryFlag } from './countryFlag';

// Full list of 35 leagues from the live MatchBay data feed
const DATA_FEED_LEAGUES = [
  { slug: 'eng.1', name: 'English Premier League', abbreviation: 'Premier League', country: 'England' },
  { slug: 'eng.2', name: 'English League Championship', abbreviation: 'EFL Championship', country: 'England' },
  { slug: 'eng.3', name: 'English League One', abbreviation: 'EFL League One', country: 'England' },
  { slug: 'eng.4', name: 'English League Two', abbreviation: 'EFL League Two', country: 'England' },
  { slug: 'eng.5', name: 'English National League', abbreviation: 'National League', country: 'England' },
  { slug: 'eng.fa', name: 'English FA Cup', abbreviation: 'English FA Cup', country: 'England' },
  { slug: 'eng.league_cup', name: 'English Carabao Cup', abbreviation: 'Carabao Cup', country: 'England' },
  { slug: 'eng.trophy', name: 'English EFL Trophy', abbreviation: 'EFL Trophy', country: 'England' },
  { slug: 'eng.charity', name: 'English FA Community Shield', abbreviation: 'Community Shield', country: 'England' },
  { slug: 'eng.asia_trophy', name: 'Premier League Asia Trophy', abbreviation: 'Premier League Asia Trophy', country: 'England' },
  { slug: 'eng.w.1', name: "English Women's Super League", abbreviation: "Women's Super League", country: 'England' },
  { slug: 'eng.w.fa', name: "English Women's FA Cup", abbreviation: "Women's FA Cup", country: 'England' },
  { slug: 'eng.w.charity', name: "English Women's FA Community Shield", abbreviation: "Women's FA Community Shield", country: 'England' },
  { slug: 'esp.1', name: 'Spanish LALIGA', abbreviation: 'LALIGA', country: 'Spain' },
  { slug: 'esp.2', name: 'Spanish LALIGA 2', abbreviation: 'LALIGA 2', country: 'Spain' },
  { slug: 'esp.copa_del_rey', name: 'Spanish Copa del Rey', abbreviation: 'Copa del Rey', country: 'Spain' },
  { slug: 'esp.super_cup', name: 'Spanish Supercopa', abbreviation: 'Spanish Supercopa', country: 'Spain' },
  { slug: 'esp.joan_gamper', name: 'Trofeo Joan Gamper', abbreviation: 'Trofeo Joan Gamper', country: 'Spain' },
  { slug: 'esp.w.1', name: 'Spanish Liga F', abbreviation: 'Liga F', country: 'Spain' },
  { slug: 'esp.copa_de_la_reina', name: 'Spanish Copa de la Reina', abbreviation: 'Copa de la Reina', country: 'Spain' },
  { slug: 'ger.1', name: 'German Bundesliga', abbreviation: 'Bundesliga', country: 'Germany' },
  { slug: 'ger.2', name: 'German 2. Bundesliga', abbreviation: '2. Bundesliga', country: 'Germany' },
  { slug: 'ger.dfb_pokal', name: 'German DFB-Pokal', abbreviation: 'DFB-Pokal', country: 'Germany' },
  { slug: 'ita.1', name: 'Italian Serie A', abbreviation: 'Serie A', country: 'Italy' },
  { slug: 'ita.2', name: 'Italian Serie B', abbreviation: 'Serie B', country: 'Italy' },
  { slug: 'ita.coppa_italia', name: 'Italian Coppa Italia', abbreviation: 'Coppa Italia', country: 'Italy' },
  { slug: 'fra.1', name: 'French Ligue 1', abbreviation: 'Ligue 1', country: 'France' },
  { slug: 'fra.2', name: 'French Ligue 2', abbreviation: 'Ligue 2', country: 'France' },
  { slug: 'ned.1', name: 'Dutch Eredivisie', abbreviation: 'Eredivisie', country: 'Netherlands' },
  { slug: 'sco.1', name: 'Scottish Premiership', abbreviation: 'SPFL Premiership', country: 'Scotland' },
  { slug: 'por.1', name: 'Portuguese Primeira Liga', abbreviation: 'Portuguese Liga', country: 'Portugal' },
  { slug: 'por.taca_de_portugal', name: 'Taça de Portugal', abbreviation: 'Taça de Portugal', country: 'Portugal' },
  { slug: 'bel.1', name: 'Belgian Pro League', abbreviation: 'Belgian Pro League', country: 'Belgium' },
  { slug: 'aut.1', name: 'Austrian Bundesliga', abbreviation: 'Austrian Bundesliga', country: 'Austria' },
  { slug: 'tur.1', name: 'Turkish Super Lig', abbreviation: 'Turkish Super Lig', country: 'Turkey' },
  { slug: 'usa.1', name: 'MLS', abbreviation: 'MLS', country: 'United States' },
  { slug: 'mex.1', name: 'Mexican Liga BBVA MX', abbreviation: 'Liga MX', country: 'Mexico' },
  { slug: 'arg.1', name: 'Argentine Liga Profesional de Fútbol', abbreviation: 'Argentine LPF', country: 'Argentina' },
  { slug: 'bra.1', name: 'Brazilian Serie A', abbreviation: 'Brazil Serie A', country: 'Brazil' },
  { slug: 'ksa.1', name: 'Saudi Pro League', abbreviation: 'Saudi Pro League', country: 'Saudi Arabia' },
  { slug: 'jpn.1', name: 'Japanese J.League', abbreviation: 'Japanese J1 League', country: 'Japan' },
  // International competitions
  { slug: 'uefa.champions', name: 'UEFA Champions League', abbreviation: 'UCL', country: 'Europe' },
  { slug: 'uefa.europa', name: 'UEFA Europa League', abbreviation: 'UEL', country: 'Europe' },
  { slug: 'uefa.conference', name: 'UEFA Conference League', abbreviation: 'UECL', country: 'Europe' },
  { slug: 'uefa.europa.conf', name: 'UEFA Conference League', abbreviation: 'UECL', country: 'Europe' },
  { slug: 'uefa.super_cup', name: 'UEFA Super Cup', abbreviation: 'UEFA Super Cup', country: 'Europe' },
  { slug: 'uefa.nations', name: 'UEFA Nations League', abbreviation: 'UNL', country: 'Europe' },
  { slug: 'fifa.world_cup', name: 'FIFA World Cup 2026', abbreviation: 'World Cup', country: 'International' },
  { slug: 'fifa.world', name: 'FIFA World Cup', abbreviation: 'WC', country: 'International' },
  { slug: 'fifa.club_world_cup', name: 'FIFA Club World Cup', abbreviation: 'Club World Cup', country: 'International' },
  { slug: 'conmebol.libertadores', name: 'Copa Libertadores', abbreviation: 'Libertadores', country: 'South America' },
  { slug: 'conmebol.copa_america', name: 'Copa América', abbreviation: 'Copa América', country: 'South America' },
];

test('Every competition in the data feed has a mapped country and existing flag file', () => {
  const missing: string[] = [];

  for (const league of DATA_FEED_LEAGUES) {
    const result = getCountryForCompetition(league);
    if (!result || !result.code) {
      missing.push(`${league.slug} (${league.name}) has no country mapping`);
      continue;
    }

    // Verify flag file exists on disk
    const flagPath = path.resolve(process.cwd(), 'public', result.flagUrl.replace(/^\//, ''));
    if (!fs.existsSync(flagPath)) {
      missing.push(`Flag file missing on disk for ${league.slug}: ${result.flagUrl} -> ${flagPath}`);
    }
  }

  assert.equal(missing.length, 0, `Missing country mappings or files: \n${missing.join('\n')}`);
});

test('Every competition slug in COMPETITION_COUNTRY_MAP has an existing SVG flag file', () => {
  const missingFiles: string[] = [];

  for (const [slug, info] of Object.entries(COMPETITION_COUNTRY_MAP)) {
    const flagPath = path.resolve(process.cwd(), 'public', info.flagUrl.replace(/^\//, ''));
    if (!fs.existsSync(flagPath)) {
      missingFiles.push(`Flag missing for ${slug}: ${info.flagUrl} at ${flagPath}`);
    }
  }

  assert.equal(missingFiles.length, 0, `Missing flag SVG files:\n${missingFiles.join('\n')}`);
});

test('England and Scotland use subdivision codes (gb-eng, gb-sct), NEVER UK flag (gb)', () => {
  const premierLeague = getCountryForCompetition('eng.1');
  assert.equal(premierLeague.code, 'gb-eng');
  assert.equal(premierLeague.flagUrl, '/flags/gb-eng.svg');
  assert.notEqual(premierLeague.code, 'gb');

  const faCup = getCountryForCompetition('eng.fa');
  assert.equal(faCup.code, 'gb-eng');

  const scotland = getCountryForCompetition('sco.1');
  assert.equal(scotland.code, 'gb-sct');
  assert.notEqual(scotland.code, 'gb');
});

test('International competitions have consistent neutral markers (Europe eu, World, South America)', () => {
  const ucl = getCountryForCompetition('uefa.champions');
  assert.equal(ucl.code, 'eu');
  assert.equal(ucl.flagUrl, '/flags/eu.svg');

  const uel = getCountryForCompetition('uefa.europa');
  assert.equal(uel.code, 'eu');

  const conf = getCountryForCompetition('uefa.conference');
  assert.equal(conf.code, 'eu');

  const worldCup = getCountryForCompetition('fifa.world_cup');
  assert.equal(worldCup.code, 'world');
  assert.equal(worldCup.flagUrl, '/flags/world.svg');

  const libertadores = getCountryForCompetition('conmebol.libertadores');
  assert.equal(libertadores.code, 'south-america');
  assert.equal(libertadores.flagUrl, '/flags/south-america.svg');
});

test('CountryFlag component renders circular flag with proper alt text and thin border', () => {
  const html = CountryFlag({ competition: 'eng.1', size: 18 });
  assert.match(html, /class="country-flag-badge/);
  assert.match(html, /width:18px/);
  assert.match(html, /border:1px solid #143034/);
  assert.match(html, /object-fit:cover/);
  assert.match(html, /alt="England"/);
  assert.match(html, /src="\/flags\/gb-eng\.svg"/);
});

test('Fallback mechanism returns neutral globe when competition is unknown', () => {
  const fallback = getCountryForCompetition('unknown.competition.xyz');
  assert.equal(fallback.code, 'globe');
  assert.equal(fallback.flagUrl, '/flags/globe.svg');
  assert.equal(fs.existsSync(path.resolve(process.cwd(), 'public/flags/globe.svg')), true);
});
