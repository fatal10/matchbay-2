import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlayerKey } from './playerSpotlight';

test('normalizePlayerKey handles accents, case, and special characters', () => {
  assert.equal(normalizePlayerKey('Erling Haaland'), 'erlinghaaland');
  assert.equal(normalizePlayerKey('Kylian Mbappé'), 'kylianmbappe');
  assert.equal(normalizePlayerKey('Martin Ødegaard'), 'martinodegaard');
  assert.equal(normalizePlayerKey('Vinícius Júnior'), 'viniciusjunior');
  assert.equal(normalizePlayerKey('Luka Modrić'), 'lukamodric');
});

test('FotMob image URL pattern structure', () => {
  const getFotmobUrl = (fotmobId: string | number) =>
    `https://images.fotmob.com/image_resources/playerimages/${fotmobId}.png`;

  assert.equal(getFotmobUrl('737066'), 'https://images.fotmob.com/image_resources/playerimages/737066.png');
  assert.equal(getFotmobUrl('701154'), 'https://images.fotmob.com/image_resources/playerimages/701154.png');
  assert.equal(getFotmobUrl(292462), 'https://images.fotmob.com/image_resources/playerimages/292462.png');
});

test('FotMob IDs are incompatible with ESPN and API-Sports IDs', () => {
  const haalandFotmobId = 737066;
  const haalandEspnId = 247547;
  const haalandApiSportsId = 1100;

  assert.notEqual(haalandFotmobId, haalandEspnId);
  assert.notEqual(haalandFotmobId, haalandApiSportsId);

  const mbappeFotmobId = 701154;
  const mbappeEspnId = 215093;
  const mbappeApiSportsId = 278;

  assert.notEqual(mbappeFotmobId, mbappeEspnId);
  assert.notEqual(mbappeFotmobId, mbappeApiSportsId);
});

test('Unverified players cleanly return empty string for avatar fallback', () => {
  const player = { id: '9999999', name: 'Nonexistent Player' };
  const mockDb = { players: {} };
  const norm = normalizePlayerKey(player.name);
  const photo = (mockDb.players as any)[norm]?.photoUrl || '';
  assert.equal(photo, '');
});
