const fs = require('fs');

let app = fs.readFileSync('/tmp/matchbay/app.js', 'utf8');

// 1. Attribution footer
const oldAttr = `Competition logos via <a href="https://football-logos.cc/" rel="noopener" target="_blank" style="color:var(--ac);text-decoration:none;font-weight:700">football-logos.cc</a> · All trademarks belong to their respective owners`;
const newAttr = `Competition logos via <a href="https://football-logos.cc/" rel="noopener" target="_blank" style="color:var(--ac);text-decoration:none;font-weight:700">football-logos.cc</a> · Flag icons via <a href="https://github.com/lipis/flag-icons" rel="noopener" target="_blank" style="color:var(--ac);text-decoration:none;font-weight:700">flag-icons</a> (MIT) · All trademarks belong to their respective owners`;
app = app.replaceAll(oldAttr, newAttr);
console.log('1. Attribution updated');

// 2. matchLeagueLabel
const oldMatchLeagueLabel = `const matchLeagueLabel = (g) => {
  const meta = DATA.leaguesMap[g?.k] || {};
  const name = meta.name || g?.competitionName || 'Competition';
  const logoHtml = typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: g?.k || name, size: 24 }) : '';
  return \`<span class="league-label" style="display:inline-flex;align-items:center;gap:8px">\${logoHtml}<span class="league-name">\${esc(name)}</span></span>\`;
};`;

const newMatchLeagueLabel = `const matchLeagueLabel = (g) => {
  const meta = DATA.leaguesMap[g?.k] || {};
  const name = meta.name || g?.competitionName || 'Competition';
  const logoHtml = typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: g?.k || name, size: 24 }) : '';
  const flagHtml = typeof CountryFlag === 'function' ? CountryFlag({ competition: g?.k || name, country: meta.country || g?.competitionCountry, size: 16 }) : '';
  return \`<span class="league-label" style="display:inline-flex;align-items:center;gap:6px">\${logoHtml}<span class="league-name" style="display:inline-flex;align-items:center;gap:6px">\${flagHtml}<span>\${esc(name)}</span></span></span>\`;
};`;

if (app.includes(oldMatchLeagueLabel)) {
  app = app.replace(oldMatchLeagueLabel, newMatchLeagueLabel);
  console.log('2. matchLeagueLabel updated');
} else {
  console.error('FAILED 2: matchLeagueLabel');
}

// 3. Featured hero competition label (in both live and upcoming hero templates)
const oldCompTop = `<div class="comp">
            \${compLogo}
            <div>
              <b>\${esc(g.competitionName || 'Football')}</b>
              <small>\${esc(roundText)}</small>
            </div>
          </div>`;

const newCompTop = `<div class="comp">
            \${compLogo}
            <div>
              <b style="display:inline-flex;align-items:center;gap:6px">\${typeof CountryFlag === 'function' ? CountryFlag({ competition: g.k || g.competitionName, country: g.competitionCountry || DATA.leaguesMap[g.k]?.country, size: 16 }) : ''}<span>\${esc(g.competitionName || 'Football')}</span></b>
              <small>\${esc(roundText)}</small>
            </div>
          </div>`;

if (app.includes(oldCompTop)) {
  app = app.replaceAll(oldCompTop, newCompTop);
  console.log('3. Featured hero updated');
} else {
  console.error('FAILED 3: Featured hero');
}

// 4. storiesHtml
const oldStoryFlag = `      const flagVal = l.flag || countryFlag(l.country) || '⚽';
      const flagHtml = l.flagUrl
        ? \`<img referrerpolicy="no-referrer" src="\${esc(l.flagUrl)}" alt="" onerror="this.remove()">\`
        : esc(flagVal);`;

const newStoryFlag = `      const flagHtml = typeof CountryFlag === 'function'
        ? CountryFlag({ competition: slug, country: l.country, size: 18, marginRight: 0 })
        : (l.flagUrl ? \`<img referrerpolicy="no-referrer" src="\${esc(l.flagUrl)}" alt="" onerror="this.remove()">\` : esc(l.flag || countryFlag(l.country) || '⚽'));`;

if (app.includes(oldStoryFlag)) {
  app = app.replace(oldStoryFlag, newStoryFlag);
  console.log('4. Story flags updated');
} else {
  console.error('FAILED 4: Story flags');
}

// 5. Matches group head (renderMatchesGroups)
const oldGroupHead = `      <div class="r sb league-section-head" style="margin-top:20px;margin-bottom:8px">
        <span class="h" style="display:flex;align-items:center;gap:10px">
          \${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: slug, size: 28 }) : ''}
          <b>\${esc(leagueName)}</b>
        </span>`;

const newGroupHead = `      <div class="r sb league-section-head" style="margin-top:20px;margin-bottom:8px">
        <span class="h" style="display:flex;align-items:center;gap:10px">
          \${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: slug, size: 28 }) : ''}
          <b style="display:inline-flex;align-items:center;gap:6px">\${typeof CountryFlag === 'function' ? CountryFlag({ competition: slug, country: meta.country, size: 18 }) : ''}<span>\${esc(leagueName)}</span></b>
        </span>`;

if (app.includes(oldGroupHead)) {
  app = app.replace(oldGroupHead, newGroupHead);
  console.log('5. Matches group head updated');
} else {
  console.error('FAILED 5: Matches group head');
}

// 6. Matches filter chips
const oldChips = `\${DATA.leagues.slice(0, 10).map((l) => \`<button class="chip\${S.selectedLeague === l.slug ? ' on' : ''}" data-filter-league="\${esc(l.slug)}" style="display:inline-flex;align-items:center;gap:8px">\${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: l.slug, size: 22 }) : ''}<span>\${esc(l.abbreviation || l.name)}</span></button>\`).join('')}`;

const newChips = `\${DATA.leagues.slice(0, 10).map((l) => \`<button class="chip\${S.selectedLeague === l.slug ? ' on' : ''}" data-filter-league="\${esc(l.slug)}" style="display:inline-flex;align-items:center;gap:6px">\${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: l.slug, size: 20 }) : ''}\${typeof CountryFlag === 'function' ? CountryFlag({ competition: l.slug, country: l.country, size: 16 }) : ''}<span>\${esc(l.abbreviation || l.name)}</span></button>\`).join('')}`;

if (app.includes(oldChips)) {
  app = app.replace(oldChips, newChips);
  console.log('6. Matches filter chips updated');
} else {
  console.error('FAILED 6: Matches filter chips');
}

// 7. Tables view header & selector
const oldTableHeader = `<div class="h" style="font-size:18px;line-height:1.25">\${esc(leagueMeta.name || currentSlug)}</div>
          <div class="m" style="margin-top:6px">\${flag} \${esc(leagueMeta.country || 'Football')} · \${esc(leagueMeta.season?.display_name || 'Current season')}</div>`;

const newTableHeader = `<div class="h" style="font-size:18px;line-height:1.25;display:flex;align-items:center;gap:8px">\${typeof CountryFlag === 'function' ? CountryFlag({ competition: currentSlug, country: leagueMeta.country, size: 20 }) : ''}<span>\${esc(leagueMeta.name || currentSlug)}</span></div>
          <div class="m" style="margin-top:6px;display:flex;align-items:center;gap:6px">\${typeof CountryFlag === 'function' ? CountryFlag({ competition: currentSlug, country: leagueMeta.country, size: 16 }) : ''}<span>\${esc(leagueMeta.country || 'Football')} · \${esc(leagueMeta.season?.display_name || 'Current season')}</span></div>`;

if (app.includes(oldTableHeader)) {
  app = app.replace(oldTableHeader, newTableHeader);
  console.log('7a. Tables header updated');
} else {
  console.error('FAILED 7a: Tables header');
}

const oldCountryTitle = `<div class="country-title">
              <span>\${c.flag}</span>
              <span>\${esc(c.name)}</span>`;

const newCountryTitle = `<div class="country-title" style="display:flex;align-items:center;gap:8px">
              <span>\${typeof CountryFlag === 'function' ? CountryFlag({ country: c.name, size: 18 }) : c.flag}</span>
              <span>\${esc(c.name)}</span>`;

if (app.includes(oldCountryTitle)) {
  app = app.replace(oldCountryTitle, newCountryTitle);
  console.log('7b. Country title updated');
} else {
  console.error('FAILED 7b: Country title');
}

const oldLeaguePill = `<button class="league-pill\${l.slug === currentSlug ? ' on' : ''}" data-select-table-league="\${esc(l.slug)}" style="display:inline-flex;align-items:center;gap:8px">
                  \${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: l.slug, size: 22 }) : ''}
                  <span>\${esc(l.name)}</span>
                </button>`;

const newLeaguePill = `<button class="league-pill\${l.slug === currentSlug ? ' on' : ''}" data-select-table-league="\${esc(l.slug)}" style="display:inline-flex;align-items:center;gap:8px">
                  \${typeof CompetitionLogo === 'function' ? CompetitionLogo({ competition: l.slug, size: 22 }) : ''}
                  \${typeof CountryFlag === 'function' ? CountryFlag({ competition: l.slug, country: l.country, size: 16 }) : ''}
                  <span>\${esc(l.name)}</span>
                </button>`;

if (app.includes(oldLeaguePill)) {
  app = app.replace(oldLeaguePill, newLeaguePill);
  console.log('7c. League pills updated');
} else {
  console.error('FAILED 7c: League pills');
}

// 8. Search results competition card
const oldSearchComp = `<div class="r" style="gap:6px;align-items:center">
            <span class="comp-name" title="\${esc(comp.name)}">\${esc(comp.name)}</span>
            <span style="font-size:13px">\${esc(comp.flag || '⚽')}</span>
          </div>`;

const newSearchComp = `<div class="r" style="gap:6px;align-items:center">
            \${typeof CountryFlag === 'function' ? CountryFlag({ competition: comp.slug, country: comp.country, size: 16 }) : ''}
            <span class="comp-name" title="\${esc(comp.name)}">\${esc(comp.name)}</span>
          </div>`;

if (app.includes(oldSearchComp)) {
  app = app.replace(oldSearchComp, newSearchComp);
  console.log('8. Search competition card updated');
} else {
  console.error('FAILED 8: Search competition card');
}

// 9. Match details header bar
const oldDetailBar = `<span class=\"bar-title\">\${esc(headerTitle)}</span>`;
const newDetailBar = `<span class=\"bar-title\" style=\"display:inline-flex;align-items:center;gap:8px\">\${typeof CountryFlag === 'function' ? CountryFlag({ competition: g.k || g.competitionName, country: g.competitionCountry || DATA.leaguesMap[g.k]?.country, size: 18 }) : ''}<span>\${esc(headerTitle)}</span></span>`;

if (app.includes(oldDetailBar)) {
  app = app.replace(oldDetailBar, newDetailBar);
  console.log('9. Match detail bar updated');
} else {
  console.error('FAILED 9: Match detail bar');
}

fs.writeFileSync('public/app.js', app);
console.log('Successfully written to public/app.js!');
