 async function loadMy(){
    // В реальном приложении: отправляйте токен (Authorization) и получайте только свои объявления.
    try{
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const res = await fetch('/api/listings?mine=true', { headers: token?{ Authorization: 'Bearer ' + token } : {} });
      const data = await res.json();
      const root = document.getElementById('myListings');
      root.innerHTML = '';
      data.forEach(item=>{
        // пока просто показываем все объявления (демо)
        const card = document.createElement('article');
        card.className = 'card';
        const imgUrl = item.imagePath || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/300`;
        // build content safely using DOM APIs
        const img = document.createElement('img');
        img.className = 'thumb';
        img.alt = item.title || '';
        img.src = imgUrl;
        img.setAttribute('onerror', "this.onerror=null; this.src='/img/placeholder.svg'");

        const meta = document.createElement('div');
        meta.className = 'meta';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'title';
        titleDiv.textContent = item.title || '';

        const muted = document.createElement('div');
        muted.className = 'muted';
        muted.textContent = item.category || '';

        const actionsWrap = document.createElement('div');
        actionsWrap.style.display = 'flex';
        actionsWrap.style.gap = '8px';
        actionsWrap.style.marginTop = '8px';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn secondary';
        editBtn.type = 'button';
        editBtn.textContent = 'Редактировать';
        editBtn.addEventListener('click', () => editItem(item.id, item.title, item.price || ''));

        const delBtn = document.createElement('button');
        delBtn.className = 'btn';
        delBtn.type = 'button';
        delBtn.textContent = 'Удалить';
        delBtn.addEventListener('click', () => deleteItem(item.id));

        actionsWrap.appendChild(editBtn);
        actionsWrap.appendChild(delBtn);

        meta.appendChild(titleDiv);
        meta.appendChild(muted);
        meta.appendChild(actionsWrap);

        card.appendChild(img);
        card.appendChild(meta);

        root.appendChild(card);
      });
    }catch(e){ console.error(e) }
  }

  async function deleteItem(id){
    if(!confirm('Удалить объявление?')) return;
    try{
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/listings/' + id, { method:'DELETE', headers: token?{ Authorization: 'Bearer ' + token }: {} });
      if(res.ok){ alert('Удалено'); loadMy(); } else { const err = await res.json(); alert('Ошибка удаления: ' + (err.error||JSON.stringify(err))); }
    }catch(e){ alert('Ошибка'); }
  }

  async function editItem(id, currentTitle, currentPrice){
    const newTitle = prompt('Новый заголовок', currentTitle) || currentTitle;
    const newPrice = prompt('Новая цена', currentPrice) || currentPrice;
    if(newTitle === currentTitle && newPrice === currentPrice) return;
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    try{
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/listings/' + id, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, token?{ Authorization: 'Bearer ' + token }: {}), body: JSON.stringify({ title: newTitle, price: newPrice }) });
      if(res.ok){ alert('Сохранено'); loadMy(); } else { const err = await res.json(); alert('Ошибка: ' + (err.error || JSON.stringify(err))); }
    }catch(e){ alert('Ошибка'); }
  }

  loadMy();