import Database from 'better-sqlite3';
const db = new Database('database.sqlite');

db.exec(`
  DELETE FROM content WHERE key = 'home_hero_title2_color';
  DELETE FROM content WHERE key = 'home_sobre_title_color';
`);

console.log('Deleted color overrides for Raquel Neumann titles.');
