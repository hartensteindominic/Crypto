const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/exchange.db';

function initDatabase() {
  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }
    console.log('Database connected:', DB_PATH);
  });

  // Create tables
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT UNIQUE NOT NULL,
        email TEXT,
        username TEXT,
        kyc_status TEXT DEFAULT 'pending',
        premium_account BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        token_in TEXT,
        token_out TEXT,
        amount_in REAL,
        amount_out REAL,
        fee REAL,
        status TEXT DEFAULT 'pending',
        tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Staking positions table
    db.run(`
      CREATE TABLE IF NOT EXISTS staking_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL NOT NULL,
        rewards REAL DEFAULT 0,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Lending positions table
    db.run(`
      CREATE TABLE IF NOT EXISTS lending_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        token TEXT NOT NULL,
        amount REAL NOT NULL,
        interest_rate REAL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Proposals table
    db.run(`
      CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposer_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        for_votes REAL DEFAULT 0,
        against_votes REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_date DATETIME,
        FOREIGN KEY (proposer_id) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized');
  });

  return db;
}

function getDatabase() {
  return new sqlite3.Database(DB_PATH);
}

module.exports = {
  initDatabase,
  getDatabase
};
