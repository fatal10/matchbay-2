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

test('getSpotlightPlayerPhoto resolves verified photo URLs from Football Spotlight / API-Sports', () => {
  const merinoPhoto = getSpotlightPlayerPhoto({ name: 'Mikel Merino' });
  assert.equal(merinoPhoto, 'https://media.api-sports.io/football/players/18844.png');

  const haalandPhoto = getSpotlightPlayerPhoto({ name: 'Erling Haaland' });
  assert.equal(haalandPhoto, 'https://media.api-sports.io/football/players/1100.png');

  const sakaPhoto = getSpotlightPlayerPhoto({ name: 'Bukayo Saka' });
  assert.equal(sakaPhoto, 'https://media.api-sports.io/football/players/1465.png');

  const kepaPhoto = getSpotlightPlayerPhoto({ name: 'Kepa Arrizabalaga' });
  assert.equal(kepaPhoto, 'https://media.api-sports.io/football/players/2289.png');

  const messiPhoto = getSpotlightPlayerPhoto({ name: 'Lionel Messi' });
  assert.equal(messiPhoto, 'https://media.api-sports.io/football/players/154.png');
});

test('getSpotlightPlayerPhoto matches player by slug as fallback', () => {
  const photo = getSpotlightPlayerPhoto({ name: 'Kepa', slug: 'kepa-arrizabalaga' });
  assert.equal(photo, 'https://media.api-sports.io/football/players/2289.png');
});

test('getSpotlightPlayerDetails provides preferred foot, height, and nationality facts', () => {
  const details = getSpotlightPlayerDetails({
    name: 'Mikel Merino',
    citizenship: 'Spain',
    jersey: 23
  });
  assert.equal(details.photo, 'https://media.api-sports.io/football/players/18844.png');
  assert.equal(details.preferredFoot, 'Left');
  assert.equal(details.height, '188 cm');
  assert.equal(details.nationality, 'Spain');
  assert.equal(details.shirtNumber, '#23');
});
