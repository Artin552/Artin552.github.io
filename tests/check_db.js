// Check listings in database
// Run from project root: node tests/check_db.js

const db = require('../backend/db');

db.all('SELECT id, title, category, price FROM listings LIMIT 10', (err, rows) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
  console.log('Listings in database:');
  rows.forEach(row => {
    console.log(`  - ${row.id}: ${row.title} (${row.category}) - ${row.price} руб`);
  });
  process.exit(0);
});
