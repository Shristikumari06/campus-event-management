/**
 * SQLite Database Connection & Promise Wrapper
 * CampusConnect — University Event Management Portal
 * 
 * Supports both Node.js built-in node:sqlite (zero compilation needed!)
 * and legacy sqlite3 module for seamless cross-platform execution.
 */

const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'campusconnect.db');

let queryHelpers = {};

// 1. Try Node.js built-in SQLite (Node 22+, Node 26+)
let DatabaseSync;
try {
  const sqlite = require('node:sqlite');
  DatabaseSync = sqlite.DatabaseSync;
} catch (e) {
  DatabaseSync = null;
}

if (DatabaseSync) {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  console.log(`📦 Connected to persistent SQLite database at: ${dbPath} (via Node native SQLite)`);

  queryHelpers = {
    db,
    get: (sql, params = []) => {
      return Promise.resolve().then(() => {
        const p = Array.isArray(params) ? params : [params];
        const stmt = db.prepare(sql);
        const row = stmt.get(...p);
        return row ? { ...row } : undefined;
      });
    },
    all: (sql, params = []) => {
      return Promise.resolve().then(() => {
        const p = Array.isArray(params) ? params : [params];
        const stmt = db.prepare(sql);
        const rows = stmt.all(...p);
        return Array.isArray(rows) ? rows.map(r => ({ ...r })) : [];
      });
    },
    run: (sql, params = []) => {
      return Promise.resolve().then(() => {
        const p = Array.isArray(params) ? params : [params];
        const stmt = db.prepare(sql);
        const res = stmt.run(...p);
        return {
          lastID: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : 0,
          changes: res.changes || 0
        };
      });
    },
    exec: (sql) => {
      return Promise.resolve().then(() => {
        db.exec(sql);
      });
    }
  };
} else {
  // 2. Fallback to sqlite3 npm package for older Node versions
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to connect to SQLite database:', err.message);
    } else {
      console.log(`📦 Connected to SQLite database at: ${dbPath}`);
    }
  });

  db.run('PRAGMA foreign_keys = ON;');

  queryHelpers = {
    db,
    get: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    all: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },
    run: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    exec: (sql) => {
      return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  };
}

module.exports = queryHelpers;


