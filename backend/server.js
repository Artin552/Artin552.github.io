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

// Stricter limiter for password reset (forgot) endpoint to prevent abuse
const forgotLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3, message: { error: 'Too many password reset attempts, please try later' } });
app.use('/api/auth/forgot', forgotLimiter);

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
// Serve frontend asset folders at root-relative paths so links like /css/styles.css work
app.use('/css', express.static(path.join(__dirname, '..', 'frontend', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'frontend', 'js')));
app.use('/img', express.static(path.join(__dirname, '..', 'frontend', 'img')));
// Serve uploaded images from a dedicated uploads folder (outside frontend) with safe headers
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filepath) => {
    const ext = path.extname(filepath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext.slice(1)}`);
    }
  }
}));
// Serve only the frontend folder to avoid exposing repository root (hide .env, server.js, *.db)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

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
