// backend/server.js
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  require('dotenv').config();
  const authRoutes = require('./routes/auth');
  const listingsRoutes = require('./routes/listings');

// Global handlers to surface uncaught errors during development
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 4000;
  
app.use(cors());
app.use(helmet());
// limit JSON size to prevent huge payloads
app.use(express.json({ limit: process.env.JSON_LIMIT || '2mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '2mb' }));

// basic rate limiter for auth routes
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'Too many requests, slow down' } });
app.use('/api/auth', authLimiter);

// Логирование для /api/*
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled route error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Подключаем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);

// Раздаём HTML и CSS (frontend)
app.use('/', express.static(path.join(__dirname, '..')));

const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Сервер запущен: http://${HOST}:${PORT}`);
});

process.on('SIGINT', ()=>{
  console.log('SIGINT received, shutting down');
  server.close(()=> process.exit(0));
});
process.on('SIGTERM', ()=>{
  console.log('SIGTERM received, shutting down');
  server.close(()=> process.exit(0));
});
