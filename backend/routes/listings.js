const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function getUserFromAuthHeader(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const token = parts[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Get all listings, optional search q
router.get('/', (req, res) => {
  const q = req.query.q;
  const mine = req.query.mine === 'true';
  const user = getUserFromAuthHeader(req);

  let sql = 'SELECT id, title, category, price, description, imagePath, imageBase64, created_at, owner_id FROM listings';
  const params = [];
  const where = [];

  if (q) {
    where.push('(title LIKE ? OR description LIKE ? OR category LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  if (mine && user) {
    where.push('owner_id = ?');
    params.push(user.id);
  }

  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows || []);
  });
});

// Get single listing by id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT id, title, category, price, description, imagePath, imageBase64, created_at, owner_id FROM listings WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Create new listing
router.post('/', (req, res) => {
  const user = getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, category, price, description, imagePath, imageBase64 } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title and price required' });
  const created_at = Date.now();
  db.run(
    `INSERT INTO listings (title, category, price, description, imagePath, imageBase64, created_at, owner_id) VALUES (?,?,?,?,?,?,?,?)`,
    [title, category || '', price, description || '', imagePath || '', imageBase64 || '', created_at, user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      const id = this.lastID;
      db.get('SELECT id, title, category, price, description, imagePath, imageBase64, created_at, owner_id FROM listings WHERE id = ?', [id], (err2, row) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        res.status(201).json(row);
      });
    }
  );
});

// Delete listing by id
router.delete('/:id', (req, res) => {
  const user = getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id;
  // Проверяем владельца
  db.get('SELECT owner_id FROM listings WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.owner_id !== user.id) return res.status(403).json({ error: 'Forbidden' });
    db.run('DELETE FROM listings WHERE id = ?', [id], function (err2) {
      if (err2) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true });
    });
  });
});

// Update a listing (owner only)
router.put('/:id', (req, res) => {
  const user = getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id;
  const { title, category, price, description, imagePath, imageBase64 } = req.body;

  db.get('SELECT owner_id FROM listings WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.owner_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

    const updates = [];
    const params = [];
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (imagePath !== undefined) { updates.push('imagePath = ?'); params.push(imagePath); }
    if (imageBase64 !== undefined) { updates.push('imageBase64 = ?'); params.push(imageBase64); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(id);
    const sql = `UPDATE listings SET ${updates.join(', ')} WHERE id = ?`;
    db.run(sql, params, function (err2) {
      if (err2) return res.status(500).json({ error: 'DB error' });
      db.get('SELECT id, title, category, price, description, imagePath, imageBase64, created_at, owner_id FROM listings WHERE id = ?', [id], (err3, updated) => {
        if (err3) return res.status(500).json({ error: 'DB error' });
        res.json(updated);
      });
    });
  });
});

module.exports = router;

