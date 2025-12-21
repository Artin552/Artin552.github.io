// ============================================================
// ГЛОБАЛЬНЫЙ ПОИСК (search.js)
// ============================================================

// Функция для поиска объявлений с поддержкой категории
async function loadListings(query = '', category = '') {
  const root = document.getElementById('listings') || document.getElementById('resultsGrid');
  if (!root) return;

  // Анимация загрузки
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
    // Формируем URL с параметрами
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);

    const fetchUrl = '/api/listings' + (params.toString() ? '?' + params.toString() : '');

    const res = await fetch(fetchUrl);
    const data = await res.json();

    if (!Array.isArray(data)) {
      root.innerText = 'Ошибка формата ответа';
      return;
    }

    if (data.length === 0) {
      root.innerHTML = '<div style="text-align:center; color:#aaa; padding:30px;">Объявлений не найдено</div>';
      return;
    }

    root.innerHTML = '';

    data.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'card';

      const imgUrl = item.imagePath || `https://picsum.photos/seed/${encodeURIComponent(item.title || 'default')}/400/300`;
      const priceText = item.price ? (item.price + ' ₽') : 'Цена по договорённости';
      const discount = item.discount || 0;
      const rating = item.rating || 0;
      const reviews = item.reviewsCount || 0;
      const inStock = item.in_stock !== undefined ? Boolean(item.in_stock) : Boolean(item.stock);
      const isHot = item.is_hot || (item.tags && item.tags.includes('hot'));

      // Preview
      const preview = document.createElement('div');
      preview.className = 'preview';
      const img = document.createElement('img');
      img.className = 'thumb';
      img.alt = item.title || '';
      img.src = imgUrl;
      img.addEventListener('error', function onErr() {
        this.removeEventListener('error', onErr);
        this.src = '/img/placeholder.svg';
      });
      preview.appendChild(img);

      if (discount) {
        const d = document.createElement('div');
        d.className = 'discount';
        d.textContent = `-${discount}%`;
        preview.appendChild(d);
      }

      if (isHot) {
        const h = document.createElement('div');
        h.className = 'hot-badge';
        h.textContent = '🔥 Хит продаж';
        preview.appendChild(h);
      }

      // Meta
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

      setTimeout(() => card.classList.add('animate-in'), 80 * idx + 50);
    });

  } catch (e) {
    root.innerText = 'Не удалось загрузить объявления.';
    console.error('Ошибка загрузки:', e);
  }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ПОИСКА
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Элементы на главной
  const heroFindBtn = document.getElementById('heroFind');
  const heroQuery = document.getElementById('heroQuery');
  const heroCategory = document.getElementById('heroCategory');

  // Элементы на listings.html
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.querySelector('select[name="category"]');

  // 🔹 1. Клик по кнопке "Найти" в герое
  if (heroFindBtn) {
    heroFindBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const q = heroQuery ? heroQuery.value.trim() : '';
      const cat = heroCategory ? heroCategory.value : '';
      loadListings(q, cat);
    });
  }

  // 🔹 2. Enter в поле поиска героя
  if (heroQuery) {
    heroQuery.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = heroQuery.value.trim();
        const cat = heroCategory ? heroCategory.value : '';
        loadListings(q, cat);
      }
    });
  }

  // 🔹 3. Клик по кнопке на listings.html
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const q = searchInput ? searchInput.value.trim() : '';
      const cat = categoryFilter ? categoryFilter.value : '';
      loadListings(q, cat);
    });
  }

  // 🔹 4. Enter на listings.html
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        const cat = categoryFilter ? categoryFilter.value : '';
        loadListings(q, cat);
      }
    });
  }

  // 🔹 5. Загрузка при открытии index.html
  const listingsContainer = document.getElementById('listings');
  if (listingsContainer) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const cat = params.get('category') || '';
    
    // Восстанавливаем значения в форме
    if (heroQuery) heroQuery.value = q;
    if (heroCategory) heroCategory.value = cat;

    // Запускаем поиск
    loadListings(q, cat);
  }
});