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

test('FootyLogos image URL pattern structure', () => {
  const getFootyLogosPreviewUrl = (hash: string) =>
    `https://assets.footylogos.com/player-pngs/previews/v1/${hash}.webp`;

  const sampleHash = '1fe23c0e5a5a1d7131eb296655cb07b2721b51da0ed8fc8639ebb86be1484f07';
  assert.equal(
    getFootyLogosPreviewUrl(sampleHash),
    'https://assets.footylogos.com/player-pngs/previews/v1/1fe23c0e5a5a1d7131eb296655cb07b2721b51da0ed8fc8639ebb86be1484f07.webp'
  );
  assert.match(getFootyLogosPreviewUrl(sampleHash), /^https:\/\/assets\.footylogos\.com\/player-pngs\/previews\/v1\/[a-f0-9]{64}\.webp$/);
});

test('FootyLogos slug generation normalizes names correctly', () => {
  const toFootySlug = (name: string) =>
    name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ø/g, 'o')
      .replace(/æ/g, 'ae')
      .replace(/ß/g, 'ss')
      .replace(/\b(jr|sr|ii|iii|iv)\b/gi, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .trim();

  assert.equal(toFootySlug('Erling Haaland'), 'erling-haaland');
  assert.equal(toFootySlug('Mohamed Salah'), 'mohamed-salah');
  assert.equal(toFootySlug('Jude Bellingham'), 'jude-bellingham');
  assert.equal(toFootySlug('Lamine Yamal'), 'lamine-yamal');
  assert.equal(toFootySlug('Neymar Jr'), 'neymar');
});

test('Unverified players cleanly return empty string for avatar fallback', () => {
  const player = { id: '9999999', name: 'Nonexistent Player' };
  const mockDb = { players: {} };
  const norm = normalizePlayerKey(player.name);
  const photo = (mockDb.players as any)[norm]?.photoUrl || '';
  assert.equal(photo, '');
});
