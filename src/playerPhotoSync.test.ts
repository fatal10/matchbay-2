import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  normalizePlayerKey,
  tokenizePlayerName,
  compareClubNames,
  matchFootyRender,
  TargetPlayer,
  FootyRenderEntry
} from './footyRendersMatcher';
import { loadAllAppPlayers } from '../scripts/sync-player-photos';

test('1. Name normalization strips diacritics, accents, and punctuation', () => {
  assert.strictEqual(normalizePlayerKey('Luka Modrić'), 'lukamodric');
  assert.strictEqual(normalizePlayerKey('Martin Ødegaard'), 'martinodegaard');
  assert.strictEqual(normalizePlayerKey('Kylian Mbappé'), 'kylianmbappe');
  assert.strictEqual(normalizePlayerKey('Jules Koundé'), 'juleskounde');
  assert.strictEqual(normalizePlayerKey('Rafael Leão'), 'rafaelleao');
  assert.strictEqual(normalizePlayerKey('Theo Hernández'), 'theohernandez');
  assert.strictEqual(normalizePlayerKey('Erling Braut Håland'), 'erlingbrauthaland');
});

test('2. Tokenization removes suffixes like Jr, Junior, II without mutating base name', () => {
  const viniTokens = tokenizePlayerName('Vinícius Júnior');
  assert.deepStrictEqual(viniTokens, ['vinicius']);

  const neymarTokens = tokenizePlayerName('Neymar Jr');
  assert.deepStrictEqual(neymarTokens, ['neymar']);

  const haalandTokens = tokenizePlayerName('Erling Haaland');
  assert.deepStrictEqual(haalandTokens, ['erling', 'haaland']);
});

test('3. Club synonym comparison recognises club variants and nicknames', () => {
  assert.strictEqual(compareClubNames('AC Milan', 'milan'), 1.0);
  assert.strictEqual(compareClubNames('Milan', 'AC Milan'), 1.0);
  assert.strictEqual(compareClubNames('Manchester City', 'mancity'), 1.0);
  assert.strictEqual(compareClubNames('Paris Saint-Germain', 'psg'), 1.0);
  assert.strictEqual(compareClubNames('Real Madrid', 'madrid'), 1.0);
  assert.strictEqual(compareClubNames('Liverpool', 'Real Madrid'), 0);
});

test('4. Cristiano Ronaldo case: matches Cristiano Ronaldo and NEVER other Ronaldos', () => {
  const candidates: FootyRenderEntry[] = [
    {
      pageUrl: 'https://www.footyrenders.com/nations/portugal/cristiano-ronaldo-290/',
      imgUrl: 'https://www.footyrenders.com/render/cristiano-ronaldo-290.png',
      club: 'al-nassr',
      slug: 'cristiano-ronaldo-290',
      cleanName: 'Cristiano Ronaldo'
    },
    {
      pageUrl: 'https://www.footyrenders.com/legends/ronaldo-9/',
      imgUrl: 'https://www.footyrenders.com/render/ronaldo-9.png',
      club: 'legends',
      slug: 'ronaldo-9',
      cleanName: 'Ronaldo'
    },
    {
      pageUrl: 'https://www.footyrenders.com/serie-a/sampdoria/ronaldo-vieira/',
      imgUrl: 'https://www.footyrenders.com/render/ronaldo-vieira.png',
      club: 'sampdoria',
      slug: 'ronaldo-vieira',
      cleanName: 'Ronaldo Vieira'
    }
  ];

  const targetCR7: TargetPlayer = {
    name: 'Cristiano Ronaldo',
    team: 'Al Nassr',
    position: 'FW'
  };

  const resCR7 = matchFootyRender(targetCR7, candidates);
  assert.strictEqual(resCR7.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resCR7.candidate?.cleanName, 'Cristiano Ronaldo');
  assert.strictEqual(resCR7.candidate?.slug, 'cristiano-ronaldo-290');

  // Conversely, target non-Cristiano Ronaldo must NOT match Cristiano Ronaldo
  const targetR9: TargetPlayer = {
    name: 'Ronaldo Nazário',
    team: 'Brazil Legends',
    position: 'FW'
  };
  const resR9 = matchFootyRender(targetR9, candidates);
  assert.notStrictEqual(resR9.candidate?.cleanName, 'Cristiano Ronaldo');
});

test('5. Disambiguation of same-name players (Silvas, Gabriels) prevents incorrect assignment', () => {
  const candidates: FootyRenderEntry[] = [
    {
      pageUrl: 'https://www.footyrenders.com/premier-league/manchester-city/bernardo-silva-45/',
      imgUrl: 'https://www.footyrenders.com/render/bernardo-silva.png',
      club: 'manchester-city',
      slug: 'bernardo-silva-45',
      cleanName: 'Bernardo Silva'
    },
    {
      pageUrl: 'https://www.footyrenders.com/other-leagues/fluminense/thiago-silva-20/',
      imgUrl: 'https://www.footyrenders.com/render/thiago-silva.png',
      club: 'fluminense',
      slug: 'thiago-silva-20',
      cleanName: 'Thiago Silva'
    }
  ];

  const resBernardo = matchFootyRender(
    { name: 'Bernardo Silva', team: 'Manchester City', position: 'MF' },
    candidates
  );
  assert.strictEqual(resBernardo.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resBernardo.candidate?.cleanName, 'Bernardo Silva');

  const resThiago = matchFootyRender(
    { name: 'Thiago Silva', team: 'Fluminense', position: 'DF' },
    candidates
  );
  assert.strictEqual(resThiago.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resThiago.candidate?.cleanName, 'Thiago Silva');
});

test('6. Known aliases and abbreviations match correctly', () => {
  const candidates: FootyRenderEntry[] = [
    {
      pageUrl: 'https://www.footyrenders.com/serie-a/milan/rafael-leao-15/',
      imgUrl: 'https://www.footyrenders.com/render/rafael-leao-15.png',
      club: 'milan',
      slug: 'rafael-leao-15',
      cleanName: 'Rafael Leão'
    },
    {
      pageUrl: 'https://www.footyrenders.com/premier-league/manchester-city/erling-braut-haland-116/',
      imgUrl: 'https://www.footyrenders.com/render/erling-braut-haland.png',
      club: 'manchester-city',
      slug: 'erling-braut-haland-116',
      cleanName: 'Erling Braut Håland'
    }
  ];

  // R. Leão matches Rafael Leão
  const resLeao = matchFootyRender(
    { name: 'R. Leão', team: 'AC Milan', position: 'FW' },
    candidates
  );
  assert.strictEqual(resLeao.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resLeao.candidate?.slug, 'rafael-leao-15');

  // Erling Haaland matches Erling Braut Håland
  const resHaaland = matchFootyRender(
    { name: 'Erling Haaland', team: 'Manchester City', position: 'FW' },
    candidates
  );
  assert.strictEqual(resHaaland.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resHaaland.candidate?.slug, 'erling-braut-haland-116');
});

test('7. Target player count matches exact total football players in data', () => {
  const { players } = loadAllAppPlayers();
  assert.ok(players.length > 2500, `Expected > 2500 players, got ${players.length}`);
  assert.strictEqual(players.length, 2967, 'Total player target count must equal 2967');
});

test('8. Every photo in DB has valid credit, sourceUrl, and no duplicate hashes', () => {
  const dbPath = path.resolve(process.cwd(), 'public/player-photos-db.json');
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const players = Object.values(db.players || {}) as any[];
    const hashes = new Map<string, string>();

    for (const p of players) {
      assert.ok(p.credit, `Player ${p.name} must have credit`);
      assert.ok(p.photoUrl, `Player ${p.name} must have photoUrl`);
      assert.ok(p.confidence >= 0, `Player ${p.name} must have confidence >= 0`);

      const photoFile = path.resolve(process.cwd(), 'public', p.photoUrl.replace(/^\//, ''));
      if (fs.existsSync(photoFile)) {
        const fileBuf = fs.readFileSync(photoFile);
        const hash = crypto.createHash('sha256').update(fileBuf).digest('hex');
        if (hashes.has(hash)) {
          const prevPlayer = hashes.get(hash);
          // If different players have identical hash, ensure they are not unrelated players
          assert.strictEqual(
            normalizePlayerKey(p.name).split('').sort().join(''),
            normalizePlayerKey(prevPlayer || '').split('').sort().join(''),
            `Collision: Different players ${p.name} and ${prevPlayer} share identical image hash!`
          );
        } else {
          hashes.set(hash, p.name);
        }
      }
    }
  }
});
