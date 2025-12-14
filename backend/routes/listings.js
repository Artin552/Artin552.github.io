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
  const category = req.query.category || req.query.cat || '';
  const in_stock = req.query.in_stock === 'true' || req.query.in_stock === '1';
  const onlyDiscount = req.query.discount === 'true' || req.query.discount === '1';
  const minRating = Number(req.query.minRating || req.query.rating || 0) || 0;
  const minPrice = Number(req.query.minPrice || 0) || 0;
  const maxPrice = Number(req.query.maxPrice || 0) || 0;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));

  // base
  let baseSql = 'FROM listings';
  const params = [];
  const where = [];

  if (q) {
    where.push('(title LIKE ? OR description LIKE ? OR category LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (mine && user) {
    where.push('owner_id = ?');
    params.push(user.id);
  }
  if (in_stock) {
    where.push('(in_stock = 1 OR in_stock IS NULL)');
  }
  if (onlyDiscount) {
    where.push('discount > 0');
  }
  if (minRating) {
    where.push('rating >= ?'); params.push(minRating);
  }
  if (minPrice) {
    where.push('CAST(price AS INTEGER) >= ?'); params.push(minPrice);
  }
  if (maxPrice) {
    where.push('CAST(price AS INTEGER) <= ?'); params.push(maxPrice);
  }

  const whereSql = where.length ? (' WHERE ' + where.join(' AND ')) : '';

  // count total
  const countSql = `SELECT COUNT(*) as cnt ${baseSql} ${whereSql}`;
  db.get(countSql, params, (cErr, cRow) => {
    if (cErr) return res.status(500).json({ error: 'DB error' });
    const total = cRow ? cRow.cnt : 0;

    const offset = (page - 1) * limit;
    const sql = `SELECT id, title, category, price, description, imagePath, created_at, owner_id ${baseSql} ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const finalParams = params.concat([limit, offset]);
    db.all(sql, finalParams, (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      // map rows so imagePath becomes a safe public URL when present
      const mapped = (rows || []).map(r => {
        return Object.assign({}, r, { imagePath: r.imagePath ? ('/uploads' + r.imagePath) : '' });
      });
      res.set('X-Total-Count', total);
      res.json(mapped);
    });
  });
});

// Get single listing by id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT id, title, category, price, description, imagePath, created_at, owner_id FROM listings WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    const mapped = Object.assign({}, row, { imagePath: row.imagePath ? ('/uploads' + row.imagePath) : '' });
    res.json(mapped);
  });
});

// Create new listing
router.post('/', async (req, res) => {
  const user = getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, category, price, description, imagePath, imageBase64 } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title and price required' });
  const created_at = Date.now();
  // If imageBase64 is provided as data URL, write to disk and set imagePath
  let finalImagePath = imagePath || '';
  if (!finalImagePath && imageBase64 && imageBase64.startsWith('data:')) {
    try{
      const parts = imageBase64.split(',');
      const meta = parts[0];
      const extCandidate = meta.indexOf('image/') !== -1 ? meta.split('image/')[1].split(';')[0] : 'png';
      const buffer = Buffer.from(parts[1], 'base64');
      // validation: size limit 5MB
      const MAX_BYTES = 5 * 1024 * 1024;
      if (buffer.length > MAX_BYTES) throw new Error('File too large');
      const fileType = require('file-type');
      const ft = await fileType.fromBuffer(buffer);
      if (!ft || !ft.mime.startsWith('image/')) throw new Error('Not an image');
      // whitelist extensions
      const allowed = ['jpg', 'jpeg', 'png', 'webp'];
      const ext = ft.ext && allowed.includes(ft.ext) ? ft.ext : (allowed.includes(extCandidate) ? extCandidate : null);
      if (!ext) throw new Error('Disallowed image type');
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(__dirname, '..', 'uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `listing_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const savePath = path.join(uploadDir, filename);
      fs.writeFileSync(savePath, buffer, { flag: 'w' });
      // Store only filename in DB; map to /uploads/ on read
      finalImagePath = filename;
    }catch(err){ console.error('Failed to save image', err); return res.status(400).json({ error: 'Invalid image upload' }); }
  }
  db.run(
  `INSERT INTO listings (title, category, price, description, imagePath, created_at, owner_id) VALUES (?,?,?,?,?,?,?)`,
  [title, category || '', price, description || '', finalImagePath || '', created_at, user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      const id = this.lastID;
  db.get('SELECT id, title, category, price, description, imagePath, created_at, owner_id FROM listings WHERE id = ?', [id], (err2, row) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        // expose imagePath as /uploads/<filename>
        const mapped = Object.assign({}, row, { imagePath: row.imagePath ? ('/uploads' + row.imagePath) : '' });
        res.status(201).json(mapped);
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
    // If client sends imageBase64 to update image, save it to uploads and store filename only
    if (imageBase64 !== undefined) {
      try{
        if (imageBase64 && imageBase64.startsWith('data:')){
          const parts = imageBase64.split(',');
          const meta = parts[0];
          const ext = meta.indexOf('image/') !== -1 ? meta.split('image/')[1].split(';')[0] : 'png';
          const buffer = Buffer.from(parts[1], 'base64');
          const fs = require('fs'); const path = require('path');
          const uploadDir = path.join(__dirname, '..', 'uploads');
          fs.mkdirSync(uploadDir, { recursive: true });
          const filename = `listing_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const savePath = path.join(uploadDir, filename);
          fs.writeFileSync(savePath, buffer, { flag: 'w' });
          updates.push('imagePath = ?'); params.push(filename);
        }
      }catch(e){ console.error('failed to save updated image', e); }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(id);
    const sql = `UPDATE listings SET ${updates.join(', ')} WHERE id = ?`;
    db.run(sql, params, function (err2) {
      if (err2) return res.status(500).json({ error: 'DB error' });
      db.get('SELECT id, title, category, price, description, imagePath, created_at, owner_id FROM listings WHERE id = ?', [id], (err3, updated) => {
        if (err3) return res.status(500).json({ error: 'DB error' });
        res.json(updated);
      });
    });
  });
});

module.exports = router;

