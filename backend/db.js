// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// база хранится рядом, в файле users.db
const db = new sqlite3.Database(path.join(__dirname, 'users.db'));

// создаём таблицу, если её нет
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});

module.exports = db;
