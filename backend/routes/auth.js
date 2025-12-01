// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const nodemailer = require('nodemailer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'; // в реале — хранить в .env
// Email transporter will be created lazily if env vars present
const EMAIL_HOST = process.env.EMAIL_HOST || null;
const EMAIL_PORT = process.env.EMAIL_PORT || null;
const EMAIL_USER = process.env.EMAIL_USER || null;
const EMAIL_PASS = process.env.EMAIL_PASS || null;

let transporter = null;
if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({ host: EMAIL_HOST, port: Number(EMAIL_PORT), secure: false, auth: { user: EMAIL_USER, pass: EMAIL_PASS } });
}

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
        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        // Return token so client can stay logged in; redirect to root
        res.json({ success: true, user, token, email: user.email, redirect: '/' });
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

// === Забыли пароль: генерируем код и отправляем в Telegram (если настроен)
router.post('/forgot', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  // Note: we intentionally never reveal whether an email exists in the system.
  // Always respond with a generic success message so attackers cannot enumerate accounts.
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) {
      // generic reply
      return res.json({ message: 'Если email зарегистрирован, вы получите код.' });
    }

    // генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // сохраняем код и метку времени
    const now = Date.now();
    db.run('UPDATE users SET reset_token = ?, reset_requested_at = ? WHERE id = ?', [code, now, user.id], (err2) => {
      if (err2) {
        console.error('Не удалось сохранить код сброса пароля', err2);
        // still return generic message to avoid leaking info
        return res.json({ message: 'Если email зарегистрирован, вы получите код.' });
      }

      // отправляем по email, если настроен transporter
      if (!transporter) {
        console.log('Email transporter not configured; code:', code);
        return res.json({ message: 'Если email зарегистрирован, вы получите код.' });
      }

      const mail = {
        from: EMAIL_USER,
        to: user.email,
        subject: 'Сброс пароля — BuildStoreNET',
        text: `Код для сброса пароля: ${code}. Он действителен 15 минут.`
      };

      transporter.sendMail(mail, (errSend, info) => {
        if (errSend) {
          console.error('Mail send error', errSend);
          return res.json({ message: 'Если email зарегистрирован, вы получите код.' });
        }
        // Regardless of success detail, return the same generic message
        return res.json({ message: 'Если email зарегистрирован, вы получите код.' });
      });
    });
  });
});

// === Сброс пароля по коду
router.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Код и новый пароль обязательны' });

  db.get('SELECT * FROM users WHERE reset_token = ?', [token], async (err, user) => {
    if (!user) return res.status(400).json({ error: 'Неверный код' });

    // проверим TTL: 15 минут
    const now = Date.now();
    if (!user.reset_requested_at || (now - Number(user.reset_requested_at)) > (15 * 60 * 1000)) {
      return res.status(400).json({ error: 'Срок действия кода истёк' });
    }

    const hash = await bcrypt.hash(password, 10);
    db.run('UPDATE users SET password = ?, reset_token = NULL, reset_requested_at = NULL WHERE id = ?', [hash, user.id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Ошибка при обновлении пароля' });
      res.json({ message: 'Пароль успешно изменён' });
    });
  });
});

module.exports = router;
