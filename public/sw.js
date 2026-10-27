/* MatchBay service worker: offline app shell. Bump V to force an update. */
const V = 'matchbay-v22',
  SHELL = [
    './',
    'index.html',
    'style.css',
    'competitionCountries.js',
    'countryFlag.js',
    'competitionLogos.js',
    'featuredMatch.js',
    'playersData.js',
    'playerSpotlight.js',
    'playerStatsEngine.js',
    'matchDetailsAdapter.js',
    'app.js',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'flags/gb-eng.svg',
    'flags/gb-sct.svg',
    'flags/gb-wls.svg',
    'flags/gb-nir.svg',
    'flags/es.svg',
    'flags/de.svg',
    'flags/it.svg',
    'flags/fr.svg',
    'flags/nl.svg',
    'flags/pt.svg',
    'flags/be.svg',
    'flags/at.svg',
    'flags/tr.svg',
    'flags/us.svg',
    'flags/mx.svg',
    'flags/ar.svg',
    'flags/br.svg',
    'flags/sa.svg',
    'flags/jp.svg',
    'flags/eu.svg',
    'flags/world.svg',
    'flags/globe.svg',
    'flags/south-america.svg',
    'flags/north-america.svg',
  ];
self.addEventListener('install', (e) =>
  e.waitUntil(
    caches
      .open(V)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  )
);
self.addEventListener('activate', (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x))))
      .then(() => self.clients.claim())
  )
);
self.addEventListener('fetch', (e) => {
  const r = e.request,
    u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (u.pathname.startsWith('/api/soccer/')) return; /* livescore API proxy: always live network, edge-cached by Worker */
  if (u.origin === location.origin) {
    /* app files & flags: network first, then the matching cached asset. Never return index.html as a stylesheet or script. */
    e.respondWith(
      fetch(r)
        .then((res) => {
          if (res.ok) {
            const cp = res.clone();
            caches.open(V).then((c) => c.put(r, cp));
          }
          if (!res.ok) return caches.match(r, { ignoreSearch: true }).then((m) => m || res);
          return res;
        })
        .catch(() =>
          caches.match(r, { ignoreSearch: true }).then((m) => {
            if (m) return m;
            if (r.mode === 'navigate')
              return caches.match('./index.html', { ignoreSearch: true }).then((page) => page || Response.error());
            return Response.error();
          })
        )
    );
  } else if (/googleapis\.com|gstatic\.com/.test(u.hostname)) {
    /* fonts: cache first */
    e.respondWith(
      caches.match(r).then((m) =>
        m ||
        fetch(r).then((res) => {
          const cp = res.clone();
          caches.open(V).then((c) => c.put(r, cp));
          return res;
        })
      )
    );
  }
});
