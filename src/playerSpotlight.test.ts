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
