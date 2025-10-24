// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = 'dev-secret-key'; // в реале — хранить в .env

// === Регистрация ===
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  // проверим, нет ли уже такого email
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
    if (row) return res.status(400).json({ error: 'Пользователь уже существует' });

    const hash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name || '', email, hash],
      function (err) {
        if (err) return res.status(500).json({ error: 'Ошибка при регистрации' });
        const user = { id: this.lastID, name, email };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });


        res.json({ success: true, user, token, redirect: '/frontend/auth.html' });
      }
    );
  });
});

// === Авторизация ===
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, email: user.email, token, redirect: '/frontend/index.html' });
  });
});

module.exports = router;
