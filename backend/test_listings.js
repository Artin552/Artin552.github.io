const fetch = require('node-fetch');
(async ()=>{
  const base = 'http://localhost:4000';
  try{
    // 1) register
    let r = await fetch(base + '/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name:'Tester', email:'tester@example.com', password:'123456' }) });
    const reg = await r.json();
    console.log('register:', r.status, reg);
    // 2) login
    r = await fetch(base + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:'tester@example.com', password:'123456' }) });
    const login = await r.json();
    console.log('login:', r.status, login);
    const token = login.token;
    if(!token) return console.error('No token');
    // 3) create listing
    r = await fetch(base + '/api/listings', { method:'POST', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify({ title:'Автозапчасти', category:'Материалы', price:'2000', description:'desc' }) });
    const created = await r.json(); console.log('created', r.status, created);
    const id = created.id;
    // 4) get mine
    r = await fetch(base + '/api/listings?mine=true', { headers:{ Authorization: 'Bearer ' + token } }); const mine = await r.json(); console.log('mine count', mine.length);
    // 5) update
    r = await fetch(base + '/api/listings/' + id, { method:'PUT', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify({ price:'2500' }) }); const updated = await r.json(); console.log('updated', r.status, updated);
    // 6) delete
    r = await fetch(base + '/api/listings/' + id, { method:'DELETE', headers:{ Authorization: 'Bearer ' + token } }); const del = await r.json(); console.log('deleted', r.status, del);
  }catch(e){ console.error(e); }
})();
