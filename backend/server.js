// backend/server.js
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;
  
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логируем все запросы к /api/auth
app.use('/api/auth', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // обязательно вызываем next(), чтобы запрос пошёл дальше к маршрутам
}, authRoutes);


// Подключаем маршруты
app.use('/api/auth', authRoutes);

// Раздаём HTML и CSS (frontend)
app.use('/', express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
