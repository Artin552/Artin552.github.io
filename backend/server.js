// server.js
// Нужные пакеты: express, cors, body-parser, uuid, fs
// Установить: npm i express cors uuid

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // чтобы принимать base64 больших изображений

// Папки для данных/загрузок
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS = path.join(__dirname, 'uploads');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive:true });
if(!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive:true });

const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');

// Помощь: читать/писать JSON-файл (простой "файл как БД")
function readListings(){
  try{
    const raw = fs.readFileSync(LISTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  }catch(e){
    return []; // если файл не существует — пустой массив
  }
}
function writeListings(arr){
  fs.writeFileSync(LISTINGS_FILE, JSON.stringify(arr, null, 2));
}

// --- РОУТЫ ---
// GET /api/listings?q=...
app.get('/api/listings', (req,res)=>{
  const q = (req.query.q || '').toLowerCase();
  const all = readListings();
  const filtered = q ? all.filter(it=>{
    return (it.title && it.title.toLowerCase().includes(q))
      || (it.description && it.description.toLowerCase().includes(q));
  }) : all;
  res.json(filtered);
});

// POST /api/listings
app.post('/api/listings', async (req,res)=>{
  const { title, category, price, description, imageBase64 } = req.body;
  if(!title) return res.status(400).json({ error: 'title required' });

  const arr = readListings();
  const id = uuidv4();
  let imagePath = null;

  // Если пришла base64-строка — сохранить в файл
  if(imageBase64 && imageBase64.startsWith('data:')){
    try{
      // формат: data:<mime>;base64,xxxxx
      const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if(matches){
        const mime = matches[1]; const ext = mime.split('/')[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `${id}.${ext}`;
        const filepath = path.join(UPLOADS, filename);
        fs.writeFileSync(filepath, buffer);
        // Для разработки: сделать доступной через /uploads/
        imagePath = `http://localhost:4000/uploads/${filename}`;
      }
    }catch(e){ console.error('save image error', e) }
  }

  const item = {
    id, title, category, price, description, imagePath,
    createdAt: new Date().toISOString()
  };
  arr.unshift(item); // последние сверху
  writeListings(arr);
  res.status(201).json({ id });
});

// DELETE /api/listings/:id
app.delete('/api/listings/:id', (req,res)=>{
  const id = req.params.id;
  let arr = readListings();
  const idx = arr.findIndex(x => x.id === id);
  if(idx === -1) return res.status(404).json({ error: 'not found' });
  // удаляем файл изображения, если есть
  const item = arr[idx];
  if(item.imagePath){
    const fname = path.basename(item.imagePath);
    const fpath = path.join(UPLOADS, fname);
    if(fs.existsSync(fpath)) fs.unlinkSync(fpath);
  }
  arr.splice(idx,1);
  writeListings(arr);
  res.json({ ok: true });
});

// Статическая раздача загруженных изображений (для демо)
app.use('/uploads', express.static(UPLOADS));

// Простая заглушка auth (НЕ ПРОДАКШЕН)
app.post('/api/auth/register', (req,res)=>{
  const { name, email, password } = req.body;
  // В продакшене: валидируйте, проверяйте уникальность и хешируйте пароли
  if(!email||!password) return res.status(400).json({error:'email and password required'});
  // Для демо просто возвращаем mock token
  res.json({ ok:true, token: 'demo-token', user: { id: uuidv4(), name, email } });
});
app.post('/api/auth/login', (req,res)=>{
  const { email, password } = req.body;
  if(!email||!password) return res.status(400).json({error:'email and password required'});
  // Демонстрация: всегда успешный вход
  res.json({ ok:true, token: 'demo-token', user: { id: uuidv4(), email } });
});

// Запуск сервера
const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Server start on', PORT));
