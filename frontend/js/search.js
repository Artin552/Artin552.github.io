// ============================================================
// ГЛОБАЛЬНЫЙ ПОИСК (search.js)
// ============================================================
// Этот скрипт обеспечивает единую функцию поиска на всех страницах
// Используется на index.html, listings.html и других страницах

// Функция для поиска объявлений на сервере
// q — строка поиска или query string с параметрами фильтров
async function loadListings(q = '') {
  // Ищем контейнер для результатов
  const root = document.getElementById('listings') || document.getElementById('resultsGrid');
  if (!root) return; // Если контейнер не найден, выходим

  // Показываем анимацию загрузки
  root.innerHTML = `
    <div style="display:flex;justify-content:center;padding:24px;">
      <div class="boxes" aria-hidden="true">
        <div class="box"><div></div><div></div><div></div><div></div></div>
        <div class="box"><div></div><div></div><div></div><div></div></div>
        <div class="box"><div></div><div></div><div></div><div></div></div>
        <div class="box"><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  `;

  try {
    // Формируем URL для запроса к API
    let fetchUrl;
    if (q && q.startsWith('?')) {
      fetchUrl = '/api/listings' + q;
    } else {
      fetchUrl = '/api/listings' + (q ? ('?q=' + encodeURIComponent(q)) : '');
    }

    // Отправляем GET запрос на сервер
    const res = await fetch(fetchUrl);
    const data = await res.json();

    // Проверяем, что ответ — это массив
    if (!Array.isArray(data)) {
      root.innerText = 'Ошибка формата ответа';
      return;
    }

    // Если результатов нет
    if (data.length === 0) {
      const msg = document.createElement('div');
      msg.textContent = 'Объявлений пока нет.';
      root.innerHTML = '';
      root.appendChild(msg);
      return;
    }

    // Очищаем контейнер и показываем результаты
    root.innerHTML = '';

    // Для каждого объявления создаём карточку
    data.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'card';

      // Определяем изображение
      const imgUrl = item.imagePath || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/300`;
      const priceText = item.price ? (item.price + ' ₽') : 'Цена по договорённости';
      const discount = item.discount || 0;
      const rating = item.rating || 0;
      const reviews = item.reviewsCount || 0;
      const inStock = item.in_stock !== undefined ? Boolean(item.in_stock) : Boolean(item.stock);
      const isHot = item.is_hot || (item.tags && item.tags.includes('hot'));

      // Создаём изображение
      const preview = document.createElement('div');
      preview.className = 'preview';
      const img = document.createElement('img');
      img.className = 'thumb';
      img.alt = item.title || '';
      img.src = imgUrl;
      img.addEventListener('error', function onErr() {
        this.removeEventListener('error', onErr);
        this.src = '/img/placeholder.svg'; // Плейсхолдер при ошибке
      });
      preview.appendChild(img);

      // Добавляем скидку если есть
      if (discount) {
        const d = document.createElement('div');
        d.className = 'discount';
        d.textContent = `-${discount}%`;
        preview.appendChild(d);
      }

      // Добавляем "хит продаж" если есть
      if (isHot) {
        const h = document.createElement('div');
        h.className = 'hot-badge';
        h.textContent = '🔥 Хит продаж';
        preview.appendChild(h);
      }

      // Создаём информацию об объявлении
      const meta = document.createElement('div');
      meta.className = 'meta';
      const metaLeft = document.createElement('div');

      const titleDiv = document.createElement('div');
      titleDiv.className = 'title';
      titleDiv.textContent = item.title || '';

      const muted = document.createElement('div');
      muted.className = 'muted small';
      muted.textContent = (item.category || '').trim();

      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'rating';
      ratingDiv.textContent = `⭐ ${rating} (${reviews})`;

      metaLeft.appendChild(titleDiv);
      metaLeft.appendChild(muted);
      metaLeft.appendChild(ratingDiv);

      // Правая часть (цена, наличие, кнопка открыть)
      const metaRight = document.createElement('div');
      metaRight.style.display = 'flex';
      metaRight.style.flexDirection = 'column';
      metaRight.style.alignItems = 'flex-end';
      metaRight.style.gap = '8px';

      const priceEl = document.createElement('div');
      priceEl.className = 'price';
      priceEl.textContent = priceText;

      const stock = document.createElement('div');
      stock.className = 'stock';
      stock.textContent = inStock ? '✅ В наличии' : '❌ Нет в наличии';

      const openA = document.createElement('a');
      openA.className = 'btn open-btn';
      openA.href = '/frontend/product.html?id=' + encodeURIComponent(item.id);
      openA.textContent = 'Открыть →';

      metaRight.appendChild(priceEl);
      metaRight.appendChild(stock);
      metaRight.appendChild(openA);

      meta.appendChild(metaLeft);
      meta.appendChild(metaRight);

      card.appendChild(preview);
      card.appendChild(meta);

      card.classList.add('slide-in');
      root.appendChild(card);

      // Добавляем анимацию появления
      setTimeout(() => card.classList.add('animate-in'), 80 * idx + 50);
    });

  } catch (e) {
    root.innerText = 'Не удалось загрузить объявления.';
    console.error('Ошибка загрузки объявлений:', e);
  }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ПОИСКА НА СТРАНИЦЕ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Находим все элементы поиска на странице
  const heroFindBtn = document.getElementById('heroFind');
  const searchBtn = document.getElementById('searchBtn');
  const heroQuery = document.getElementById('heroQuery');
  const searchInput = document.getElementById('searchInput');
  const heroCategory = document.getElementById('heroCategory');

  // 2. При клике на кнопку "Найти" в герой секции
  if (heroFindBtn) {
    heroFindBtn.addEventListener('click', () => {
      const cat = heroCategory ? heroCategory.value : '';
      const qv = heroQuery ? heroQuery.value.trim() : '';
      const qstr = [cat, qv].filter(Boolean).join(' ');
      loadListings(qstr);
    });
  }

  // 3. При нажатии Enter в поле поиска герой
  if (heroQuery) {
    heroQuery.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cat = heroCategory ? heroCategory.value : '';
        const qv = heroQuery.value.trim();
        const q = [cat, qv].filter(Boolean).join(' ');
        loadListings(q);
      }
    });
  }

  // 4. При клике на кнопку "Поиск" на странице listings
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const q = searchInput.value.trim();
      loadListings(q);
    });
  }

  // 5. При нажатии Enter в поле поиска на listings
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        loadListings(q);
      }
    });
  }

  // 6. Проверяем, есть ли контейнер listings (для index.html)
  // На listings.html используется свой loadAll() с фильтрами
  const listingsContainer = document.getElementById('listings');
  if (!listingsContainer) {
    // Это listings.html, не запускаем поиск (там своя логика loadAll)
    return;
  }

  // Для index.html: если в URL есть параметр поиска, выполняем поиск
  const params = new URLSearchParams(window.location.search);
  const urlQ = params.get('q');

  if (urlQ) {
    if (heroQuery) heroQuery.value = urlQ;
    loadListings(urlQ);
  } else {
    // Загружаем последние объявления при первом посещении
    loadListings('');
  }
});
