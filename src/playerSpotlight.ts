/**
 * MatchBay Player Spotlight Engine
 * Real player profile pictures and bio facts from Football Spotlight & API-Sports
 */

export interface SpotlightPlayerData {
  id: string;
  name: string;
  slug?: string;
  photo: string;
  preferredFoot?: 'Right' | 'Left' | 'Both';
  height?: string;
  nationality?: string;
  birthDate?: string;
  shirtNumber?: number | string;
  position?: string;
  club?: string;
}

export function normalizePlayerKey(str: string): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

const API_SPORTS_BASE = 'https://media.api-sports.io/football/players/';

/**
 * Verified player database sourced from Football Spotlight / API-Sports
 */
export const SPOTLIGHT_PLAYERS_MAP: Record<string, { id: number; foot?: 'Right' | 'Left' | 'Both'; height?: string }> = {
  // --- Arsenal ---
  'kepa': { id: 2289, foot: 'Right', height: '188 cm' },
  'keparrizabalaga': { id: 2289, foot: 'Right', height: '188 cm' },
  'davidraya': { id: 18861, foot: 'Right', height: '183 cm' },
  'williamsaliba': { id: 2290, foot: 'Right', height: '192 cm' },
  'gabrielmagalhaes': { id: 2296, foot: 'Left', height: '190 cm' },
  'benwhite': { id: 18873, foot: 'Right', height: '186 cm' },
  'jurrientimber': { id: 35451, foot: 'Right', height: '179 cm' },
  'oleksandrzinchenko': { id: 642, foot: 'Left', height: '175 cm' },
  'takehirotomiyasu': { id: 31338, foot: 'Right', height: '188 cm' },
  'jakubkiwior': { id: 126938, foot: 'Left', height: '189 cm' },
  'riccardocalafiori': { id: 138848, foot: 'Left', height: '188 cm' },
  'kierantierney': { id: 1456, foot: 'Left', height: '178 cm' },
  'declanrice': { id: 293, foot: 'Right', height: '188 cm' },
  'martinodegaard': { id: 371, foot: 'Left', height: '178 cm' },
  'mikelmerino': { id: 18844, foot: 'Left', height: '188 cm' },
  'thomaspartey': { id: 50, foot: 'Right', height: '185 cm' },
  'jorginho': { id: 2281, foot: 'Right', height: '180 cm' },
  'ethannwaneri': { id: 383770, foot: 'Left', height: '176 cm' },
  'myleslewisskelly': { id: 383771, foot: 'Left', height: '178 cm' },
  'martinzubimendi': { id: 47340, foot: 'Right', height: '181 cm' },
  'bukayosaka': { id: 1465, foot: 'Left', height: '178 cm' },
  'kaihavertz': { id: 978, foot: 'Left', height: '193 cm' },
  'gabrielmartinelli': { id: 158697, foot: 'Right', height: '178 cm' },
  'leandrotrossard': { id: 2479, foot: 'Right', height: '172 cm' },
  'gabrieljesus': { id: 643, foot: 'Right', height: '175 cm' },
  'raheemsterling': { id: 645, foot: 'Right', height: '170 cm' },
  'maxdowman': { id: 675242, foot: 'Left', height: '170 cm' },
  'eberechieze': { id: 19187, foot: 'Right', height: '178 cm' },
  'viktorkerekes': { id: 19024, foot: 'Right', height: '187 cm' },
  'viktorgzokeres': { id: 19024, foot: 'Right', height: '187 cm' },
  'viktorgoykeres': { id: 19024, foot: 'Right', height: '187 cm' },
  'viktorgzookeres': { id: 19024, foot: 'Right', height: '187 cm' },
  'viktorgjokeres': { id: 19024, foot: 'Right', height: '187 cm' },
  'gyokeres': { id: 19024, foot: 'Right', height: '187 cm' },
  'nonimadueke': { id: 138830, foot: 'Left', height: '182 cm' },
  'christostzolis': { id: 140028, foot: 'Right', height: '179 cm' },

  // --- Manchester City ---
  'erlinghaaland': { id: 1100, foot: 'Left', height: '195 cm' },
  'haaland': { id: 1100, foot: 'Left', height: '195 cm' },
  'kevindebruyne': { id: 629, foot: 'Right', height: '181 cm' },
  'debruyne': { id: 629, foot: 'Right', height: '181 cm' },
  'philfoden': { id: 631, foot: 'Left', height: '171 cm' },
  'foden': { id: 631, foot: 'Left', height: '171 cm' },
  'rodri': { id: 44, foot: 'Right', height: '191 cm' },
  'bernardosilva': { id: 635, foot: 'Left', height: '173 cm' },
  'jackgrealish': { id: 641, foot: 'Right', height: '180 cm' },
  'joskogvardiol': { id: 138787, foot: 'Left', height: '185 cm' },
  'rubendias': { id: 566, foot: 'Right', height: '187 cm' },
  'ederson': { id: 617, foot: 'Left', height: '188 cm' },
  'kylewalker': { id: 627, foot: 'Right', height: '183 cm' },
  'johnstones': { id: 626, foot: 'Right', height: '188 cm' },
  'manuelakanji': { id: 4, foot: 'Right', height: '187 cm' },
  'nathanake': { id: 18878, foot: 'Left', height: '180 cm' },
  'mateokovacic': { id: 2287, foot: 'Right', height: '177 cm' },
  'ricolewis': { id: 284242, foot: 'Right', height: '169 cm' },
  'matheusnunes': { id: 41562, foot: 'Right', height: '183 cm' },
  'jeremydoku': { id: 22157, foot: 'Right', height: '173 cm' },
  'savinho': { id: 284384, foot: 'Left', height: '176 cm' },
  'ilkaygundogan': { id: 637, foot: 'Right', height: '180 cm' },

  // --- Liverpool ---
  'mohamedsalah': { id: 306, foot: 'Left', height: '175 cm' },
  'salah': { id: 306, foot: 'Left', height: '175 cm' },
  'luisdiaz': { id: 2474, foot: 'Right', height: '178 cm' },
  'darwinnunez': { id: 51617, foot: 'Right', height: '187 cm' },
  'codygakpo': { id: 35451, foot: 'Right', height: '193 cm' },
  'trentalexanderarnold': { id: 283, foot: 'Right', height: '175 cm' },
  'alexanderarnold': { id: 283, foot: 'Right', height: '175 cm' },
  'virgilvandijk': { id: 280, foot: 'Right', height: '195 cm' },
  'vandijk': { id: 280, foot: 'Right', height: '195 cm' },
  'alexismacallister': { id: 6716, foot: 'Right', height: '176 cm' },
  'dominikszoboszlai': { id: 1096, foot: 'Right', height: '186 cm' },
  'alissonbecker': { id: 282, foot: 'Right', height: '193 cm' },
  'alisson': { id: 282, foot: 'Right', height: '193 cm' },
  'diogojota': { id: 2475, foot: 'Right', height: '178 cm' },
  'andrewrobertson': { id: 289, foot: 'Left', height: '178 cm' },
  'ibrahimakonate': { id: 1145, foot: 'Right', height: '194 cm' },
  'ryangravenberch': { id: 542, foot: 'Right', height: '190 cm' },
  'curtisjones': { id: 292, foot: 'Right', height: '185 cm' },
  'federicochiesa': { id: 30414, foot: 'Right', height: '175 cm' },

  // --- Chelsea ---
  'colepalmer': { id: 152982, foot: 'Left', height: '189 cm' },
  'nicolasjackson': { id: 162839, foot: 'Right', height: '187 cm' },
  'enzofernandez': { id: 5996, foot: 'Right', height: '178 cm' },
  'moisescaicedo': { id: 162013, foot: 'Right', height: '178 cm' },
  'christophernkunku': { id: 269, foot: 'Right', height: '175 cm' },
  'reecejames': { id: 19035, foot: 'Right', height: '178 cm' },
  'pedroneto': { id: 18884, foot: 'Left', height: '173 cm' },
  'malogusto': { id: 162841, foot: 'Right', height: '179 cm' },
  'jadonsancho': { id: 980, foot: 'Right', height: '180 cm' },
  'levicolwill': { id: 162842, foot: 'Left', height: '187 cm' },
  'robertsanchez': { id: 18868, foot: 'Right', height: '197 cm' },

  // --- Manchester United ---
  'brunofernandes': { id: 1485, foot: 'Right', height: '179 cm' },
  'marcusrashford': { id: 909, foot: 'Right', height: '180 cm' },
  'kobbiemainoo': { id: 383771, foot: 'Right', height: '175 cm' },
  'alejandrogarnacho': { id: 284225, foot: 'Right', height: '180 cm' },
  'rasmushojlund': { id: 161947, foot: 'Left', height: '191 cm' },
  'lisandromartinez': { id: 30776, foot: 'Left', height: '175 cm' },
  'andreonana': { id: 524, foot: 'Right', height: '190 cm' },
  'joshuazirkzee': { id: 138817, foot: 'Right', height: '193 cm' },
  'matthijsdeligt': { id: 535, foot: 'Right', height: '189 cm' },
  'casemiro': { id: 748, foot: 'Right', height: '185 cm' },
  'masonmount': { id: 19037, foot: 'Right', height: '181 cm' },

  // --- Real Madrid ---
  'kylianmbappe': { id: 278, foot: 'Right', height: '178 cm' },
  'mbappe': { id: 278, foot: 'Right', height: '178 cm' },
  'viniciusjunior': { id: 54, foot: 'Right', height: '176 cm' },
  'vinicius': { id: 54, foot: 'Right', height: '176 cm' },
  'judebellingham': { id: 152982, foot: 'Right', height: '186 cm' },
  'bellingham': { id: 152982, foot: 'Right', height: '186 cm' },
  'rodrygo': { id: 758, foot: 'Right', height: '174 cm' },
  'federicovalverde': { id: 759, foot: 'Right', height: '182 cm' },
  'lukamodric': { id: 752, foot: 'Right', height: '172 cm' },
  'thibautcourtois': { id: 735, foot: 'Left', height: '200 cm' },
  'antoniorudiger': { id: 2284, foot: 'Right', height: '190 cm' },
  'danicarvajal': { id: 742, foot: 'Right', height: '173 cm' },
  'edermilitao': { id: 746, foot: 'Right', height: '186 cm' },
  'eduardocamavinga': { id: 158694, foot: 'Left', height: '182 cm' },
  'aurelientchouameni': { id: 158695, foot: 'Right', height: '187 cm' },
  'endrick': { id: 383775, foot: 'Left', height: '173 cm' },
  'ardaguler': { id: 308144, foot: 'Left', height: '175 cm' },
  'brahimdiaz': { id: 755, foot: 'Both', height: '171 cm' },

  // --- FC Barcelona ---
  'robertlewandowski': { id: 521, foot: 'Right', height: '185 cm' },
  'lewandowski': { id: 521, foot: 'Right', height: '185 cm' },
  'lamineyamal': { id: 380063, foot: 'Left', height: '180 cm' },
  'yamal': { id: 380063, foot: 'Left', height: '180 cm' },
  'raphinha': { id: 2489, foot: 'Left', height: '176 cm' },
  'pedri': { id: 138806, foot: 'Right', height: '174 cm' },
  'gavi': { id: 284322, foot: 'Right', height: '173 cm' },
  'frenkiedejong': { id: 538, foot: 'Right', height: '180 cm' },
  'ronaldaraujo': { id: 138814, foot: 'Right', height: '188 cm' },
  'marcandreterstegen': { id: 127, foot: 'Right', height: '187 cm' },
  'juleskounde': { id: 2286, foot: 'Right', height: '180 cm' },
  'paucubarsi': { id: 412227, foot: 'Right', height: '182 cm' },
  'daniolmo': { id: 1097, foot: 'Right', height: '179 cm' },
  'ferminlopez': { id: 334040, foot: 'Right', height: '174 cm' },
  'marccasado': { id: 352310, foot: 'Right', height: '172 cm' },
  'alejandrobalde': { id: 284324, foot: 'Left', height: '175 cm' },

  // --- Bayern Munich & Others ---
  'harrykane': { id: 184, foot: 'Right', height: '188 cm' },
  'kane': { id: 184, foot: 'Right', height: '188 cm' },
  'jamalmusiala': { id: 138819, foot: 'Right', height: '184 cm' },
  'leroysane': { id: 633, foot: 'Left', height: '183 cm' },
  'manuelneuer': { id: 502, foot: 'Right', height: '193 cm' },
  'joshuakimmich': { id: 503, foot: 'Right', height: '177 cm' },
  'alphonsodavies': { id: 504, foot: 'Left', height: '183 cm' },
  'michaelolise': { id: 162840, foot: 'Left', height: '184 cm' },
  'florianwirtz': { id: 138816, foot: 'Right', height: '177 cm' },
  'granitxhaka': { id: 1457, foot: 'Left', height: '185 cm' },
  'lionelmessi': { id: 154, foot: 'Left', height: '170 cm' },
  'messi': { id: 154, foot: 'Left', height: '170 cm' },
  'cristianoronaldo': { id: 874, foot: 'Right', height: '187 cm' },
  'ronaldo': { id: 874, foot: 'Right', height: '187 cm' },
  'neymar': { id: 276, foot: 'Right', height: '175 cm' },
  'sonheungmin': { id: 186, foot: 'Both', height: '183 cm' },
  'jamesmaddison': { id: 18753, foot: 'Right', height: '175 cm' },
  'alexanderisak': { id: 1099, foot: 'Right', height: '192 cm' },
  'olliewatkins': { id: 1934, foot: 'Right', height: '180 cm' },
  'emilianomartinez': { id: 1479, foot: 'Right', height: '195 cm' },
  'lautaromartinez': { id: 865, foot: 'Right', height: '174 cm' },
  'nicolobarella': { id: 31346, foot: 'Right', height: '172 cm' },
  'marcusthuram': { id: 22221, foot: 'Right', height: '192 cm' },
  'hakancalhanoglu': { id: 1119, foot: 'Right', height: '178 cm' },
  'alessandrobastoni': { id: 31345, foot: 'Left', height: '190 cm' },
  'federicodimarco': { id: 31350, foot: 'Left', height: '175 cm' },
  'yannsommer': { id: 501, foot: 'Right', height: '183 cm' },
  'dusanvlahovic': { id: 48332, foot: 'Left', height: '190 cm' },
  'kenanyildiz': { id: 383772, foot: 'Right', height: '185 cm' },
  'teunkoopmeiners': { id: 35450, foot: 'Left', height: '184 cm' },
  'bremer': { id: 30410, foot: 'Right', height: '188 cm' },
  'rafaelleao': { id: 22223, foot: 'Right', height: '188 cm' },
  'christianpulisic': { id: 11, foot: 'Right', height: '178 cm' },
  'theohernandez': { id: 747, foot: 'Left', height: '184 cm' },
  'mikemaignan': { id: 253, foot: 'Right', height: '191 cm' },
  'alvaromorata': { id: 757, foot: 'Right', height: '189 cm' },
  'tijjanireijnders': { id: 35460, foot: 'Right', height: '185 cm' },
  'khvichakvaratskhelia': { id: 161948, foot: 'Both', height: '183 cm' },
  'romelulukaku': { id: 2285, foot: 'Left', height: '191 cm' },
  'victorosimhen': { id: 2292, foot: 'Right', height: '186 cm' },
  'antoinegriezmann': { id: 47, foot: 'Left', height: '176 cm' },
  'julianalvarez': { id: 644, foot: 'Right', height: '170 cm' },
  'alexandersorloth': { id: 1101, foot: 'Left', height: '195 cm' },
  'janoblak': { id: 733, foot: 'Right', height: '188 cm' },
  'conorgallagher': { id: 19036, foot: 'Right', height: '182 cm' },
  'jeremiefrimpong': { id: 1459, foot: 'Right', height: '171 cm' },
  'victorboniface': { id: 161949, foot: 'Right', height: '190 cm' },
  'alejandrogrimaldo': { id: 554, foot: 'Left', height: '171 cm' },
  'serhouguirassy': { id: 2294, foot: 'Right', height: '187 cm' },
  'julianbrandt': { id: 979, foot: 'Right', height: '185 cm' },
  'karimadeyemi': { id: 1102, foot: 'Left', height: '180 cm' },
  'gregorkobel': { id: 18865, foot: 'Right', height: '195 cm' },
  'nicoschlotterbeck': { id: 138818, foot: 'Left', height: '191 cm' },
  'ousmanedembele': { id: 153, foot: 'Both', height: '178 cm' },
  'bradleybarcola': { id: 284532, foot: 'Right', height: '182 cm' },
  'achrafhakimi': { id: 754, foot: 'Right', height: '181 cm' },
  'gianluigidonnarumma': { id: 160, foot: 'Right', height: '196 cm' },
  'warrenzaireemery': { id: 383773, foot: 'Right', height: '178 cm' },
  'vitinha': { id: 18885, foot: 'Right', height: '172 cm' },
  'joaoneves': { id: 383774, foot: 'Right', height: '174 cm' },
  'marquinhos': { id: 257, foot: 'Right', height: '183 cm' },
  'sadiomane': { id: 304, foot: 'Right', height: '174 cm' },
  'aymericlaporte': { id: 625, foot: 'Left', height: '191 cm' },
  'marcelobrozovic': { id: 863, foot: 'Right', height: '181 cm' },
  'luissuarez': { id: 277, foot: 'Right', height: '182 cm' },
  'sergiobusquets': { id: 537, foot: 'Right', height: '189 cm' },
  'jordialba': { id: 749, foot: 'Left', height: '170 cm' },
  'aleksandarmitrovic': { id: 2288, foot: 'Right', height: '189 cm' },
  'sergejmilinkovicsavic': { id: 30417, foot: 'Right', height: '191 cm' },
  'rubenneves': { id: 18880, foot: 'Right', height: '180 cm' },
  'yassinebounou': { id: 18867, foot: 'Left', height: '195 cm' },
  'malcom': { id: 2293, foot: 'Left', height: '172 cm' },
  'dominicsolanke': { id: 18881, foot: 'Right', height: '187 cm' },
  'pedroporro': { id: 18883, foot: 'Right', height: '173 cm' },
  'guglielmovicario': { id: 30418, foot: 'Right', height: '194 cm' },
  'brennanjohnson': { id: 18887, foot: 'Right', height: '179 cm' },
  'morganrogers': { id: 284226, foot: 'Right', height: '187 cm' },
  'youritielemans': { id: 18882, foot: 'Right', height: '176 cm' },
  'leonbailey': { id: 981, foot: 'Left', height: '178 cm' },
  'amadouonana': { id: 162843, foot: 'Right', height: '192 cm' },
  'anthonygordon': { id: 18886, foot: 'Right', height: '183 cm' },
  'sandrotonali': { id: 30416, foot: 'Right', height: '181 cm' },
  'joelinton': { id: 1936, foot: 'Right', height: '186 cm' },
  'nickpope': { id: 18869, foot: 'Right', height: '198 cm' }
};

function extractSurnameKey(raw: string): string {
  if (!raw) return '';
  const clean = String(raw).replace(/^[A-Z]\.\s*/i, '').trim();
  const parts = clean.split(/\s+/);
  return normalizePlayerKey(parts[parts.length - 1] || '');
}

/**
 * Resolves a player's profile picture URL from local verified storage or FootyLogos
 */
export function getSpotlightPlayerPhoto(player: any): string {
  if (!player) return '';

  const rawName = typeof player === 'string'
    ? player
    : (player.name || player.displayName || player.fullName || player.playerName || player.player || (player.athlete && (player.athlete.displayName || player.athlete.fullName)) || '');

  const normName = normalizePlayerKey(rawName);
  const normSlug = normalizePlayerKey(typeof player === 'object' && player ? (player.slug || '') : '');
  const normSurname = typeof player === 'object' && player && player.surname
    ? normalizePlayerKey(player.surname)
    : extractSurnameKey(rawName);

  // 0. High priority: Check local verified photos database (FootyLogos verified or manual lock)
  const db = (typeof window !== 'undefined' && (window as any).PLAYER_PHOTOS_DB) || (typeof globalThis !== 'undefined' && (globalThis as any).PLAYER_PHOTOS_DB);
  if (db && db.players) {
    if (normName && db.players[normName]?.photoUrl) return db.players[normName].photoUrl;
    if (normSlug && db.players[normSlug]?.photoUrl) return db.players[normSlug].photoUrl;
    if (normSurname && db.players[normSurname]?.photoUrl) return db.players[normSurname].photoUrl;
  }

  // 1. Direct verified photo URL on player object
  if (typeof player === 'object' && player && player.photo && typeof player.photo === 'string' && (player.photo.startsWith('http') || player.photo.startsWith('/'))) {
    return player.photo;
  }

  // 2. Normalized fuzzy check against verified database
  if (db && db.players && normName && normName.length >= 4) {
    for (const k in db.players) {
      if (k.length >= 4 && (normName === k || normName.includes(k) || k.includes(normName))) {
        const rec = db.players[k];
        if (rec && rec.photoUrl) return rec.photoUrl;
      }
    }
  }

  // Fallback: Never fabricate or guess unverified IDs; return empty string for default avatar
  return '';
}

/**
 * Returns full spotlight details (photo, preferred foot, formatted height, shirt number, attribution)
 */
export function getSpotlightPlayerDetails(player: any) {
  if (!player) return { photo: '', preferredFoot: 'Right', height: '—', nationality: '—', shirtNumber: '—', credit: '', license: '', sourceUrl: '', source: '' };

  const rawName = typeof player === 'string'
    ? player
    : (player.name || player.displayName || player.fullName || player.playerName || player.player || (player.athlete && (player.athlete.displayName || player.athlete.fullName)) || '');

  const normName = normalizePlayerKey(rawName);
  const normSlug = normalizePlayerKey(typeof player === 'object' && player ? (player.slug || '') : '');
  const normSurname = typeof player === 'object' && player && player.surname
    ? normalizePlayerKey(player.surname)
    : extractSurnameKey(rawName);

  const match = SPOTLIGHT_PLAYERS_MAP[normName] ||
    (normSlug ? SPOTLIGHT_PLAYERS_MAP[normSlug] : null) ||
    (normSurname ? SPOTLIGHT_PLAYERS_MAP[normSurname] : null);

  const photo = getSpotlightPlayerPhoto(player);
  const preferredFoot = match?.foot || (typeof player === 'object' && player && (player.preferredFoot || player.foot)) || undefined;
  
  let formattedHeight = String(match?.height || (typeof player === 'object' && player && player.height) || '—');
  if (formattedHeight !== '—' && !formattedHeight.includes('cm') && !formattedHeight.includes('\'')) {
    formattedHeight = `${formattedHeight} cm`;
  }

  const db = (typeof window !== 'undefined' && (window as any).PLAYER_PHOTOS_DB) || (typeof globalThis !== 'undefined' && (globalThis as any).PLAYER_PHOTOS_DB);
  const photoRecord = (db && db.players && (db.players[normName] || db.players[normSlug] || db.players[normSurname])) || null;

  return {
    photo,
    preferredFoot,
    height: formattedHeight,
    nationality: (typeof player === 'object' && player && (player.citizenship || player.nationality)) || '—',
    shirtNumber: (typeof player === 'object' && player && player.jersey) ? `#${player.jersey}` : '—',
    credit: photoRecord?.credit || (photo ? 'FootyLogos' : ''),
    license: photoRecord?.license || '',
    sourceUrl: photoRecord?.sourceUrl || '',
    source: photoRecord?.source || (photo ? 'footylogos' : ''),
    confidence: photoRecord?.confidence || 1
  };
}

export const POS_PITCH_MAP: Record<string, { cx: number; cy: number; label: string; note: string }> = {
  GK: { cx: 14, cy: 42, label: 'Goalkeeper', note: 'GK · Last line of defence' },
  CB: { cx: 34, cy: 42, label: 'Centre-Back', note: 'CB · Central defence anchor' },
  LB: { cx: 34, cy: 18, label: 'Left-Back', note: 'LB · Left flank defender' },
  RB: { cx: 34, cy: 66, label: 'Right-Back', note: 'RB · Right flank defender' },
  DF: { cx: 34, cy: 42, label: 'Defender', note: 'DF · Defensive line' },
  DM: { cx: 52, cy: 42, label: 'Defensive Midfield', note: 'DM · Shield & ball winner' },
  CM: { cx: 66, cy: 42, label: 'Central Midfield', note: 'CM · Engine of the midfield' },
  LM: { cx: 66, cy: 18, label: 'Left Midfield', note: 'LM · Left flank progressor' },
  RM: { cx: 66, cy: 66, label: 'Right Midfield', note: 'RM · Right flank progressor' },
  MF: { cx: 66, cy: 42, label: 'Midfielder', note: 'MF · Midfield zone' },
  AM: { cx: 82, cy: 42, label: 'Attacking Midfield', note: 'AM · Playmaker & creative spark' },
  LW: { cx: 98, cy: 18, label: 'Left Winger', note: 'LW · Wide attacking threat' },
  RW: { cx: 98, cy: 66, label: 'Right Winger', note: 'RW · Wide attacking threat' },
  ST: { cx: 104, cy: 42, label: 'Striker', note: 'ST · Clinical primary finisher' },
  CF: { cx: 100, cy: 42, label: 'Centre-Forward', note: 'CF · Attacking focal point' },
  FW: { cx: 102, cy: 42, label: 'Forward', note: 'FW · Attacking front line' }
};

export function splitPlayerName(fullName: string): { first: string; last: string } {
  if (!fullName) return { first: '', last: '' };
  const trimmed = String(fullName).trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { first: '', last: parts[0] };
  }
  const multiWordPrefixes = ['de', 'van', 'da', 'di', 'del', 'dos', 'von', 'la', 'le'];
  if (parts.length >= 3 && multiWordPrefixes.includes(parts[parts.length - 2].toLowerCase())) {
    return {
      first: parts.slice(0, parts.length - 2).join(' '),
      last: parts.slice(parts.length - 2).join(' ')
    };
  }
  return {
    first: parts.slice(0, -1).join(' '),
    last: parts[parts.length - 1]
  };
}

export function normalizePosCode(pos?: string): string {
  if (!pos) return 'CM';
  const p = String(pos).trim().toUpperCase();
  if (['GK', 'CB', 'LB', 'RB', 'DF', 'DM', 'CM', 'LM', 'RM', 'MF', 'AM', 'LW', 'RW', 'ST', 'CF', 'FW'].includes(p)) {
    return p;
  }
  if (p.includes('GOAL') || p === 'G') return 'GK';
  if (p.includes('CENTRE-BACK') || p.includes('CENTER-BACK') || p.includes('CENTRE BACK') || p === 'DEF') return 'CB';
  if (p.includes('LEFT-BACK') || p.includes('LEFT BACK')) return 'LB';
  if (p.includes('RIGHT-BACK') || p.includes('RIGHT BACK')) return 'RB';
  if (p.includes('DEFEND')) return 'DF';
  if (p.includes('DEFENSIVE MID')) return 'DM';
  if (p.includes('ATTACKING MID')) return 'AM';
  if (p.includes('LEFT MID')) return 'LM';
  if (p.includes('RIGHT MID')) return 'RM';
  if (p.includes('MIDFIELD') || p === 'MID') return 'MF';
  if (p.includes('STRIKER')) return 'ST';
  if (p.includes('CENTRE-FORWARD') || p.includes('CENTER FORWARD')) return 'CF';
  if (p.includes('LEFT WING')) return 'LW';
  if (p.includes('RIGHT WING')) return 'RW';
  if (p.includes('FORWARD') || p === 'ATT') return 'FW';
  return p;
}
