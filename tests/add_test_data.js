// Add test data to database
// Run from project root: node tests/add_test_data.js

const db = require('../backend/db');

// Sample listings
const listings = [
  {
    title: 'Цемент М400',
    category: 'Материалы',
    price: 450,
    description: 'Высокопрочный цемент для фундаментов. Доставка по городу.'
  },
  {
    title: 'Краска акриловая 5л',
    category: 'Материалы',
    price: 890,
    description: 'Белая износостойкая краска для внутренних работ.'
  },
  {
    title: 'Дрель электрическая Metabo',
    category: 'Инструменты',
    price: 2500,
    description: 'Профессиональная дрель с ударом. Состояние отличное.'
  },
  {
    title: 'Гвозди оцинкованные 100шт',
    category: 'Крепеж',
    price: 150,
    description: 'Набор гвоздей разных размеров. Качественный крепеж.'
  },
  {
    title: 'Шпатель малярный 20см',
    category: 'Инструменты',
    price: 200,
    description: 'Стальной шпатель для шпатлевки и краски.'
  }
];

// Insert into DB
let count = 0;
listings.forEach((item, idx) => {
  db.run(
    `INSERT INTO listings (title, category, price, description, imagePath, created_at, owner_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      item.title,
      item.category,
      item.price,
      item.description,
      '', // no image
      Date.now() + idx, // slightly different timestamps
      1 // owner_id = 1 (admin/first user)
    ],
    function(err) {
      if (err) {
        console.error('Error inserting listing:', err);
      } else {
        count++;
        console.log(`✓ Added: ${item.title}`);
        if (count === listings.length) {
          console.log('\nAll test listings added successfully!');
          process.exit(0);
        }
      }
    }
  );
});
