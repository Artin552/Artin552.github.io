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

  // Таблица объявлений
  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      price TEXT,
      description TEXT,
      imagePath TEXT,
      imageBase64 TEXT,
      created_at INTEGER
    )
  `);

  // Безопасная миграция: добавим owner_id, если его нет
  db.all("PRAGMA table_info('listings')", (err, cols) => {
    if (err) return console.error('DB pragma error', err);
    const hasOwner = cols && cols.some(c => c.name === 'owner_id');
    if (!hasOwner) {
      db.run('ALTER TABLE listings ADD COLUMN owner_id INTEGER', (err2) => {
        if (err2) console.error('Не удалось добавить owner_id:', err2);
        else console.log('Добавлен столбец owner_id в listings');
      });
    }
  });
});

module.exports = db;
