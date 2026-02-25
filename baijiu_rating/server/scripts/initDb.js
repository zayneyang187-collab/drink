const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function resolveDbPath(configPath) {
  if (!configPath) {
    return path.resolve(__dirname, '../../db/baijiu.sqlite');
  }

  if (path.isAbsolute(configPath)) {
    return configPath;
  }

  return path.resolve(__dirname, '..', configPath);
}

const dbPath = resolveDbPath(process.env.DB_PATH);
const shouldReset = process.argv.includes('--reset');

if (shouldReset && fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log(`[init-db] removed existing db: ${dbPath}`);
}

const sqlite = require('../db/sqlite');
sqlite.initSchema();
const seeded = sqlite.seedIfEmpty();

const liquorCount = sqlite.db.prepare('SELECT COUNT(1) AS count FROM Liquor').get();
const ratingCount = sqlite.db.prepare('SELECT COUNT(1) AS count FROM Rating').get();

console.log(`[init-db] db path: ${sqlite.getDbPath()}`);
console.log(`[init-db] liquor count: ${liquorCount.count}`);
console.log(`[init-db] rating count: ${ratingCount.count}`);
console.log(`[init-db] seeded: ${seeded}`);
