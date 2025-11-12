// backend/server.js
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const authRoutes = require('./routes/auth');
  const listingsRoutes = require('./routes/listings');

const app = express();
const PORT = process.env.PORT || 4000;
  
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование для /api/*
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Подключаем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);

// Раздаём HTML и CSS (frontend)
app.use('/', express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
