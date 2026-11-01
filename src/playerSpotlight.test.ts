import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePlayerKey,
  getSpotlightPlayerPhoto,
  getSpotlightPlayerDetails,
  SPOTLIGHT_PLAYERS_MAP
} from './playerSpotlight';

test('normalizePlayerKey strips accents, spaces, and punctuation', () => {
  assert.equal(normalizePlayerKey('Mikel Merino'), 'mikelmerino');
  assert.equal(normalizePlayerKey('Martin Ødegaard'), 'martinodegaard');
  assert.equal(normalizePlayerKey('Kylian Mbappé'), 'kylianmbappe');
  assert.equal(normalizePlayerKey('Darwin Núñez'), 'darwinnunez');
  assert.equal(normalizePlayerKey('Julián Álvarez'), 'julianalvarez');
});

test('getSpotlightPlayerPhoto resolves verified photo URLs from FotMob DB', () => {
  (globalThis as any).PLAYER_PHOTOS_DB = {
    players: {
      erlinghaaland: {
        name: 'Erling Haaland',
        fotmobId: '737066',
        photoUrl: 'https://images.fotmob.com/image_resources/playerimages/737066.png'
      },
      kylianmbappe: {
        name: 'Kylian Mbappé',
        fotmobId: '701154',
        photoUrl: 'https://images.fotmob.com/image_resources/playerimages/701154.png'
      },
      rodri: {
        name: 'Rodri',
        photoUrl: '/player-photos/rodri.webp',
        locked: true
      }
    }
  };

  const haalandPhoto = getSpotlightPlayerPhoto({ name: 'Erling Haaland' });
  assert.equal(haalandPhoto, 'https://images.fotmob.com/image_resources/playerimages/737066.png');

  // String input
  const haalandStringPhoto = getSpotlightPlayerPhoto('Erling Haaland');
  assert.equal(haalandStringPhoto, 'https://images.fotmob.com/image_resources/playerimages/737066.png');

  // Initial notation (e.g. from match timeline / events: E. Haaland)
  (globalThis as any).PLAYER_PHOTOS_DB.players.haaland = {
    fotmobId: '737066',
    photoUrl: 'https://images.fotmob.com/image_resources/playerimages/737066.png'
  };
  const haalandInitialPhoto = getSpotlightPlayerPhoto({ name: 'E. Haaland' });
  assert.equal(haalandInitialPhoto, 'https://images.fotmob.com/image_resources/playerimages/737066.png');

  const mbappePhoto = getSpotlightPlayerPhoto({ name: 'Kylian Mbappé' });
  assert.equal(mbappePhoto, 'https://images.fotmob.com/image_resources/playerimages/701154.png');

  const rodriPhoto = getSpotlightPlayerPhoto({ name: 'Rodri' });
  assert.equal(rodriPhoto, '/player-photos/rodri.webp');
});

test('getSpotlightPlayerPhoto returns empty string when unverified so UI uses clean fallback avatar', () => {
  const unknownPhoto = getSpotlightPlayerPhoto({ name: 'Unknown Player 12345' });
  assert.equal(unknownPhoto, '');
});

test('getSpotlightPlayerDetails provides preferred foot, height, and nationality facts', () => {
  const details = getSpotlightPlayerDetails({
    name: 'Mikel Merino',
    citizenship: 'Spain',
    jersey: 23
  });
  assert.equal(details.preferredFoot, 'Left');
  assert.equal(details.height, '188 cm');
  assert.equal(details.nationality, 'Spain');
  assert.equal(details.shirtNumber, '#23');
});

test('splitPlayerName handles single names, two-word names, and multi-word surnames', async () => {
  const { splitPlayerName } = await import('./playerSpotlight');
  assert.deepEqual(splitPlayerName('Pedrinho'), { first: '', last: 'Pedrinho' });
  assert.deepEqual(splitPlayerName('Robert Sánchez'), { first: 'Robert', last: 'Sánchez' });
  assert.deepEqual(splitPlayerName('Kevin De Bruyne'), { first: 'Kevin', last: 'De Bruyne' });
  assert.deepEqual(splitPlayerName('Virgil van Dijk'), { first: 'Virgil', last: 'van Dijk' });
  assert.deepEqual(splitPlayerName('Trent Alexander-Arnold'), { first: 'Trent', last: 'Alexander-Arnold' });
});

test('normalizePosCode and POS_PITCH_MAP drive correct mini-pitch coordinates', async () => {
  const { normalizePosCode, POS_PITCH_MAP } = await import('./playerSpotlight');
  assert.equal(normalizePosCode('Goalkeeper'), 'GK');
  assert.equal(normalizePosCode('GK'), 'GK');
  assert.equal(POS_PITCH_MAP.GK.cx, 14);
  assert.equal(POS_PITCH_MAP.GK.cy, 42);

  assert.equal(normalizePosCode('Striker'), 'ST');
  assert.equal(POS_PITCH_MAP.ST.cx, 104);

  assert.equal(normalizePosCode('Attacking Midfield'), 'AM');
  assert.equal(POS_PITCH_MAP.AM.cx, 82);

  // Unknown pos returns raw code
  assert.equal(normalizePosCode('LIBERO'), 'LIBERO');
});

test('Test Case 1: Goalkeeper with verified photo resolves photo, GK position and facts', () => {
  const details = getSpotlightPlayerDetails({
    name: 'Robert Sánchez',
    team: 'Como',
    position: 'GK',
    citizenship: 'Spain',
    jersey: 1
  });
  assert.equal(details.preferredFoot, 'Right');
  assert.equal(details.height, '197 cm');
  assert.equal(details.nationality, 'Spain');
});

test('Test Case 2: Defender with no age/height/foot handles missing data gracefully', async () => {
  const { splitPlayerName, normalizePosCode, POS_PITCH_MAP } = await import('./playerSpotlight');
  const player = {
    name: 'Unknown Defender',
    position: 'CB',
    club: 'Everton'
  };
  const parsed = splitPlayerName(player.name);
  assert.equal(parsed.first, 'Unknown');
  assert.equal(parsed.last, 'Defender');
  const posCode = normalizePosCode(player.position);
  assert.equal(posCode, 'CB');
  assert.equal(POS_PITCH_MAP[posCode].label, 'Centre-Back');
});

test('Test Case 3: Midfielder who plays with both feet resolves foot: Both', () => {
  const details = getSpotlightPlayerDetails({
    name: 'Brahim Díaz',
    citizenship: 'Morocco',
    team: 'Real Madrid'
  });
  assert.equal(details.preferredFoot, 'Both');
});

test('Test Case 4: Long surname splits correctly without truncating', async () => {
  const { splitPlayerName } = await import('./playerSpotlight');
  const parsed = splitPlayerName('Jan Blaszczykowski-Papastathopoulos');
  assert.equal(parsed.first, 'Jan');
  assert.equal(parsed.last, 'Blaszczykowski-Papastathopoulos');
});

test('Test Case 5: Single-name player with no club and no photo', async () => {
  const { splitPlayerName } = await import('./playerSpotlight');
  const parsed = splitPlayerName('Pedrinho');
  assert.equal(parsed.first, '');
  assert.equal(parsed.last, 'Pedrinho');
  const photo = getSpotlightPlayerPhoto({ name: 'Pedrinho' });
  assert.equal(photo, '');
});

