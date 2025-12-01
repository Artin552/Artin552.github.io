// Smoke test - basic flow test (register, login, create listing)
// Run from project root: node tests/smoke_test.js

const http = require('http');

function req(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      host: '127.0.0.1',
      port: 4000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
    const r = http.request(opts, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => {
        try {
          const j = JSON.parse(d || 'null');
          resolve({ status: resp.statusCode, headers: resp.headers, body: j });
        } catch (e) {
          resolve({ status: resp.statusCode, headers: resp.headers, body: d });
        }
      });
    });
    r.on('error', reject);
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

(async () => {
  try {
    console.log('→ Register');
    const email = 'testuser+' + Date.now() + '@example.com';
    let reg = await req('/api/auth/register', 'POST', { name: 'Тест', email: email, password: 'password123' });
    console.log('reg', reg.status, reg.body);

    console.log('→ Login');
    let login = await req('/api/auth/login', 'POST', { email: email, password: 'password123' });
    console.log('login', login.status, login.body);
    const token = login.body && login.body.token;
    if (!token) throw new Error('No token from login');

    console.log('→ Create listing');
    let listing = await req('/api/listings', 'POST', { title: 'Тестовый товар', category: 'Материалы', price: '1000', description: 'Описание' }, token);
    console.log('listing', listing.status, listing.body);
    process.exit(0);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
