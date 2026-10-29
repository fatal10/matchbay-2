import fs from 'fs';

// Mock DOM & global environment
globalThis.self = globalThis;
globalThis.window = globalThis;
globalThis.location = { origin: 'http://localhost:3000', hostname: 'localhost' };
globalThis.document = {
  getElementById: () => ({ innerHTML: '', hidden: false }),
};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
};

// Load dependencies
const playersDataCode = fs.readFileSync('./public/playersData.js', 'utf-8');
new Function(playersDataCode)();

const spotlightCode = fs.readFileSync('./public/playerSpotlight.js', 'utf-8');
new Function(spotlightCode)();

const db = JSON.parse(fs.readFileSync('./public/player-photos-db.json', 'utf-8'));
globalThis.PLAYER_PHOTOS_DB = db;

// Load app.js partially to test playerModal
const appCode = fs.readFileSync('./public/app.js', 'utf-8');

// We can run appCode or extract playerModal
console.log('Player photos DB loaded in test:', Boolean(globalThis.PLAYER_PHOTOS_DB));
console.log('Haaland in DB:', globalThis.PLAYER_PHOTOS_DB.players.erlinghaaland);

const details = globalThis.PlayerSpotlight.getSpotlightPlayerDetails({ name: 'Erling Haaland', team: 'Manchester City' });
console.log('Haaland details:', details);
