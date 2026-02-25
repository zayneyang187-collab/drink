const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = resolveDbPath(process.env.DB_PATH);

ensureDirectory(path.dirname(dbPath));

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function resolveDbPath(configPath) {
  if (!configPath) {
    return path.resolve(__dirname, '../../db/baijiu.sqlite');
  }

  if (path.isAbsolute(configPath)) {
    return configPath;
  }

  return path.resolve(__dirname, '..', configPath);
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  db.exec(sql);
}

function initSchema() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  runSqlFile(schemaPath);
}

function seedIfEmpty() {
  const row = db.prepare(`SELECT COUNT(1) AS count FROM Liquor`).get();
  if (row && Number(row.count) > 0) {
    return false;
  }

  const seedPath = path.resolve(__dirname, 'seed.sql');
  runSqlFile(seedPath);
  return true;
}

function getDbPath() {
  return dbPath;
}

module.exports = {
  db,
  initSchema,
  seedIfEmpty,
  runSqlFile,
  getDbPath,
  resolveDbPath
};
