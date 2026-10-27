import { test } from 'node:test';
import assert from 'node:assert';
import {
  normalizePlayerKey,
  tokenizePlayerName,
  compareTeams,
  comparePositions,
  matchPlayerPhoto,
  CandidatePhoto,
  TargetPlayer
} from './playerPhotoMatcher';

test('1. Name normalization strips diacritics, accents, and punctuation', () => {
  assert.strictEqual(normalizePlayerKey('Luka Modrić'), 'lukamodric');
  assert.strictEqual(normalizePlayerKey('Martin Ødegaard'), 'martinodegaard');
  assert.strictEqual(normalizePlayerKey('Kylian Mbappé'), 'kylianmbappe');
  assert.strictEqual(normalizePlayerKey('Jules Koundé'), 'juleskounde');
  assert.strictEqual(normalizePlayerKey('Nicolò Barella'), 'nicolobarella');
  assert.strictEqual(normalizePlayerKey('Hakan Çalhanoğlu'), 'hakancalhanoglu');
  assert.strictEqual(normalizePlayerKey('Dušan Vlahović'), 'dusanvlahovic');
});

test('2. Tokenization removes suffixes like Jr, Junior, II without mutating base name', () => {
  const viniTokens = tokenizePlayerName('Vinícius Júnior');
  assert.deepStrictEqual(viniTokens, ['vinicius']);

  const neymarTokens = tokenizePlayerName('Neymar Jr');
  assert.deepStrictEqual(neymarTokens, ['neymar']);

  const haalandTokens = tokenizePlayerName('Erling Haaland');
  assert.deepStrictEqual(haalandTokens, ['erling', 'haaland']);
});

test('3. Team synonym comparison recognises club variants and codes', () => {
  assert.strictEqual(compareTeams('Manchester City', 'MCI'), 1.0);
  assert.strictEqual(compareTeams('Arsenal', 'ARS'), 1.0);
  assert.strictEqual(compareTeams('Inter Milan', 'Internazionale'), 1.0);
  assert.strictEqual(compareTeams('Bayern Munich', 'Bayern München'), 1.0);
  assert.strictEqual(compareTeams('Paris Saint-Germain', 'PSG'), 1.0);
  assert.strictEqual(compareTeams('Al Nassr', 'Al-Nassr'), 1.0);
  assert.strictEqual(compareTeams('Liverpool', 'Real Madrid'), 0);
});

test('4. Cristiano Ronaldo case: matches Cristiano Ronaldo and NEVER other Ronaldos', () => {
  const candidates: CandidatePhoto[] = [
    {
      id: 'cr7_id',
      ratingsName: 'Cristiano Ronaldo',
      team: 'Al Nassr',
      wikiName: 'Cristiano Ronaldo Croatia v Portugal 2 July 2026-075 (cropped).jpg',
      credit: 'Bryan Berlin',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_(cropped).jpg'
    },
    {
      id: 'r9_id',
      ratingsName: 'Ronaldo Nazário',
      team: 'Brazil Legend',
      wikiName: 'Ronaldo 2002.jpg',
      credit: 'Wiki Contributor',
      license: 'Public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ronaldo_2002.jpg'
    },
    {
      id: 'other_ronaldo',
      ratingsName: 'Ronaldo Vieira',
      team: 'Sampdoria',
      wikiName: 'Ronaldo Vieira 2023.jpg',
      credit: 'Photographer',
      license: 'CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ronaldo_Vieira.jpg'
    }
  ];

  const targetCR7: TargetPlayer = {
    name: 'Cristiano Ronaldo',
    team: 'Al Nassr',
    position: 'FW'
  };

  const res = matchPlayerPhoto(targetCR7, candidates);
  assert.strictEqual(res.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(res.candidate?.id, 'cr7_id');
  assert.strictEqual(res.candidate?.ratingsName, 'Cristiano Ronaldo');
  assert.ok(res.confidence >= 0.95, `Expected >= 0.95 but got ${res.confidence}`);

  // Conversely, target non-Cristiano Ronaldo must NOT match Cristiano Ronaldo
  const targetR9: TargetPlayer = {
    name: 'Ronaldo Nazário',
    team: 'Real Madrid Legends',
    position: 'FW'
  };
  const resR9 = matchPlayerPhoto(targetR9, candidates);
  assert.strictEqual(resR9.candidate?.id, 'r9_id');
  assert.notStrictEqual(resR9.candidate?.id, 'cr7_id');
});

test('5. Same-name players disambiguation (Silvas, Gabriels) prevents incorrect cross-assignment', () => {
  const candidates: CandidatePhoto[] = [
    {
      id: 'bernardo_id',
      ratingsName: 'Bernardo Silva',
      team: 'Manchester City',
      position: 'Attacking Midfielder',
      wikiName: 'Bernardo Silva Croatia v Portugal.jpg',
      credit: 'Bryan Berlin',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bernardo_Silva.jpg'
    },
    {
      id: 'thiago_id',
      ratingsName: 'Thiago Silva',
      team: 'Fluminense',
      position: 'Central Defender',
      wikiName: 'Thiago Silva 2024.jpg',
      credit: 'Photographer',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Thiago_Silva.jpg'
    },
    {
      id: 'gabriel_m_id',
      ratingsName: 'Gabriel Magalhães',
      team: 'Arsenal',
      position: 'Central Defender',
      wikiName: 'Gabriel Magalhaes Arsenal 2024.jpg',
      credit: 'Stuart MacFarlane',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gabriel_Magalhaes.jpg'
    },
    {
      id: 'gabriel_j_id',
      ratingsName: 'Gabriel Jesus',
      team: 'Arsenal',
      position: 'Forward',
      wikiName: 'Gabriel Jesus Arsenal 2024.jpg',
      credit: 'Stuart MacFarlane',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gabriel_Jesus.jpg'
    }
  ];

  // Bernardo Silva must match Bernardo Silva, NEVER Thiago Silva
  const resBernardo = matchPlayerPhoto(
    { name: 'Bernardo Silva', team: 'Manchester City', position: 'MF' },
    candidates
  );
  assert.strictEqual(resBernardo.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resBernardo.candidate?.id, 'bernardo_id');

  // Gabriel Magalhaes (DF) must match Gabriel Magalhaes, NEVER Gabriel Jesus (FW)
  const resGabrielM = matchPlayerPhoto(
    { name: 'Gabriel Magalhães', team: 'Arsenal', position: 'DF' },
    candidates
  );
  assert.strictEqual(resGabrielM.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resGabrielM.candidate?.id, 'gabriel_m_id');

  // Gabriel Jesus (FW) must match Gabriel Jesus, NEVER Gabriel Magalhaes (DF)
  const resGabrielJ = matchPlayerPhoto(
    { name: 'Gabriel Jesus', team: 'Arsenal', position: 'FW' },
    candidates
  );
  assert.strictEqual(resGabrielJ.status, 'HIGH_CONFIDENCE');
  assert.strictEqual(resGabrielJ.candidate?.id, 'gabriel_j_id');
});

test('6. Confidence scoring threshold: auto-accepts only >= 0.85, flags review or rejects ambiguous cases', () => {
  // Case A: High confidence match (exact full name + verified team)
  const candA: CandidatePhoto = {
    id: 'haaland_id',
    ratingsName: 'E. Haaland',
    team: 'Manchester City',
    wikiName: 'Erling Haaland France v Norway 26 June 26-008.jpg',
    credit: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Erling_Haaland.jpg'
  };

  const resHigh = matchPlayerPhoto(
    { name: 'Erling Haaland', team: 'Manchester City', position: 'FW' },
    [candA]
  );
  assert.strictEqual(resHigh.status, 'HIGH_CONFIDENCE');
  assert.ok(resHigh.confidence >= 0.85);

  // Case B: Uncertain match (initial match, but completely different team)
  const candB: CandidatePhoto = {
    id: 'unknown_haaland',
    ratingsName: 'E. Haaland',
    team: 'Random FC',
    wikiName: 'Unknown Match.jpg',
    credit: 'Anon',
    license: 'CC0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Unknown.jpg'
  };

  const resReview = matchPlayerPhoto(
    { name: 'Erling Haaland', team: 'Manchester City', position: 'FW' },
    [candB]
  );
  assert.strictEqual(resReview.status, 'NEEDS_REVIEW');
  assert.ok(resReview.confidence < 0.85 && resReview.confidence >= 0.50);

  // Case C: No match at all
  const resNoMatch = matchPlayerPhoto(
    { name: 'Nonexistent Player', team: 'No Club' },
    [candA, candB]
  );
  assert.strictEqual(resNoMatch.status, 'NO_PHOTO_FOUND');
  assert.strictEqual(resNoMatch.confidence, 0);
});
