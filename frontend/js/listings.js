// ================================================
// ПЕРЕМЕННЫЕ И КОНСТАНТЫ
// ================================================
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentCategory = null;
let allListings = [];


// ================================================
// ЗАГРУЗКА ТОВАРОВ С СЕРВЕРА
// ================================================
/**
 * Загружает все товары с сервера
 */
async function fetchAllListings() {
  try {
    console.log('📡 Загружаю товары с сервера...');
    const response = await fetch('/api/listings?limit=1000');
    
    if (!response.ok) {
      throw new Error('Ошибка при получении ответа от сервера');
    }
    
    allListings = await response.json();
    console.log(`✅ Загружено ${allListings.length} товаров`);
    
    return allListings;
  } catch (error) {
    console.error('❌ Ошибка при загрузке товаров:', error);
    return [];
  }
}


// ================================================
// ПОЛУЧЕНИЕ УНИКАЛЬНЫХ КАТЕГОРИЙ
// ================================================
/**
 * Извлекает уникальные категории из товаров
 * и подсчитывает товары в каждой категории
 */
function getCategories(listings) {
  const categoryMap = new Map();

  // Проходим по каждому товару
  listings.forEach(product => {
    const category = product.category || 'Без категории';
    
    // Если категория новая, создаем запись
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        count: 0,
        firstProduct: null
      });
    }

    // Увеличиваем счетчик товаров в категории
    const categoryData = categoryMap.get(category);
    categoryData.count++;

    // Сохраняем первый товар (для изображения)
    if (!categoryData.firstProduct) {
      categoryData.firstProduct = product;
    }
  });

  // Преобразуем в массив и сортируем по названию
  return Array.from(categoryMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}


// ================================================
// ОТОБРАЖЕНИЕ КАТЕГОРИЙ НА ГЛАВНОЙ СТРАНИЦЕ
// ================================================
/**
 * Отображает карточки категорий на странице
 */
function displayCategories(categories) {
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = '';

  // Если нет категорий
  if (categories.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column: 1/-1;
        text-align: center;
        padding: 40px 20px;
        color: #999;
      ">
        <p>Категории не найдены</p>
      </div>
    `;
    return;
  }

  // Создаем карточку для каждой категории
  categories.forEach(category => {
    // Элемент карточки
    const card = document.createElement('article');
    card.style.cssText = `
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid rgba(0, 0, 0, 0.05);
    `;

    // Эффект при наведении мыши
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-12px)';
      this.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
      this.style.borderColor = 'rgba(110, 68, 255, 0.2)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
      this.style.borderColor = 'rgba(0, 0, 0, 0.05)';
    });

    // Контейнер изображения
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 160px;
      overflow: hidden;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    `;

    // Изображение категории
    const imageUrl = category.firstProduct?.imagePath || 
                    `https://picsum.photos/seed/${encodeURIComponent(category.name)}/300/200`;
    
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = category.name;
    image.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    `;

    // Увеличение изображения при наведении
    card.addEventListener('mouseenter', function() {
      image.style.transform = 'scale(1.1)';
    });

    card.addEventListener('mouseleave', function() {
      image.style.transform = 'scale(1)';
    });

    // Обработчик ошибки загрузки изображения
    image.addEventListener('error', function() {
      this.src = '/img/placeholder.svg';
    });

    // Градиент поверх изображения
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%);
    `;

    imageContainer.appendChild(image);
    imageContainer.appendChild(overlay);

    // Информация о категории (название и количество)
    const info = document.createElement('div');
    info.style.cssText = `
      padding: 20px;
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: white;
    `;

    // Название категории
    const title = document.createElement('h3');
    title.textContent = category.name;
    title.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      word-wrap: break-word;
    `;

    // Количество товаров в категории
    const count = document.createElement('p');
    count.textContent = `${category.count} товаров`;
    count.style.cssText = `
      margin: 0;
      font-size: 13px;
      color: #999;
      font-weight: 500;
    `;

    // Собираем информацию в один блок
    info.appendChild(title);
    info.appendChild(count);

    // Собираем карточку
    card.appendChild(imageContainer);
    card.appendChild(info);

    // Обработчик клика на карточку категории
    card.addEventListener('click', () => {
      showProducts(category.name);
    });

    // Добавляем карточку на страницу
    grid.appendChild(card);
  });
}


// ================================================
// ПЕРЕКЛЮЧЕНИЕ НА ПРОСМОТР ТОВАРОВ
// ================================================
/**
 * Показывает товары выбранной категории
 */
function showProducts(categoryName) {
  currentCategory = categoryName;
  currentPage = 1;

  // Скрываем раздел категорий
  document.getElementById('categoriesSection').style.display = 'none';

  // Показываем раздел товаров
  document.getElementById('productsSection').style.display = 'block';

  // Устанавливаем название категории
  document.getElementById('categoryTitle').textContent = categoryName;

  // Загружаем и показываем товары
  displayProducts(categoryName);

  // Прокручиваем страницу вверх
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ================================================
// ФИЛЬТРАЦИЯ И ОТОБРАЖЕНИЕ ТОВАРОВ
// ================================================
/**
 * Фильтрует товары по выбранным критериям
 * и показывает их на странице
 */
function displayProducts(categoryName) {
  // Фильтруем товары по категории
  let filtered = allListings.filter(product => 
    product.category === categoryName
  );

  // Фильтр: В наличии
  if (document.getElementById('fInStock').checked) {
    filtered = filtered.filter(p => p.in_stock !== false);
  }

  // Фильтр: Со скидкой
  if (document.getElementById('fDiscount').checked) {
    filtered = filtered.filter(p => p.discount > 0);
  }

  // Фильтр: Минимальный рейтинг
  const minRating = Number(document.getElementById('fRating').value);
  if (minRating > 0) {
    filtered = filtered.filter(p => (p.rating || 0) >= minRating);
  }

  // Фильтр: Максимальная цена
  const maxPrice = Number(document.getElementById('fMaxPrice').value);
  if (maxPrice > 0) {
    filtered = filtered.filter(p => (p.price || 0) <= maxPrice);
  }

  // Показываем товары на странице
  displayProductsOnPage(filtered);
}


// ================================================
// ОТОБРАЖЕНИЕ ТОВАРОВ НА СТРАНИЦЕ (С ПАГИНАЦИЕЙ)
// ================================================
/**
 * Отображает товары на текущей странице
 */
function displayProductsOnPage(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  // Если товары не найдены
  if (products.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column: 1/-1;
        text-align: center;
        padding: 40px 20px;
        color: #999;
      ">
        <p>Товары не найдены с выбранными фильтрами</p>
      </div>
    `;
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  // Вычисляем диапазон товаров для текущей страницы
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageProducts = products.slice(startIndex, endIndex);

  // Создаем карточку для каждого товара
  pageProducts.forEach(product => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.cssText = `
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    `;

    // Изображение товара
    const imageUrl = product.imagePath || 
                    `https://picsum.photos/seed/${encodeURIComponent(product.title)}/400/300`;
    
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = product.title;
    image.style.cssText = `
      width: 100%;
      height: 200px;
      object-fit: cover;
    `;

    // Обработчик ошибки загрузки изображения
    image.addEventListener('error', function() {
      this.src = '/img/placeholder.svg';
    });

    // Информация о товаре
    const info = document.createElement('div');
    info.style.cssText = `
      padding: 12px;
    `;

    // Название товара
    const title = document.createElement('div');
    title.textContent = product.title || 'Без названия';
    title.style.cssText = `
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--primary);
    `;

    // Описание товара
    const desc = document.createElement('div');
    desc.textContent = product.description || '';
    desc.style.cssText = `
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    `;

    // Блок с ценой и кнопкой
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    // Цена товара
    const price = document.createElement('div');
    price.textContent = product.price ? `${product.price} ₽` : 'По договоренности';
    price.style.cssText = `
      font-size: 16px;
      font-weight: 700;
      color: var(--primary);
    `;

    // Кнопка "Открыть"
    const openBtn = document.createElement('a');
    openBtn.href = `/frontend/product.html?id=${product.id}`;
    openBtn.className = 'btn secondary';
    openBtn.textContent = 'Открыть →';
    openBtn.style.cssText = `
      padding: 6px 12px;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
    `;

    // Собираем информацию о товаре
    footer.appendChild(price);
    footer.appendChild(openBtn);
    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(footer);

    // Собираем карточку товара
    card.appendChild(image);
    card.appendChild(info);

    // Добавляем карточку на страницу
    grid.appendChild(card);
  });

  // Показываем пагинацию
  displayPagination(products.length);
}


// ================================================
// ОТОБРАЖЕНИЕ ПАГИНАЦИИ
// ================================================
/**
 * Показывает кнопки пагинации
 */
function displayPagination(totalProducts) {
  const container = document.getElementById('paginationContainer');
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Если всего одна страница - не показываем пагинацию
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '';

  // Кнопка "Предыдущая"
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Предыдущая';
  prevBtn.className = 'btn';
  prevBtn.disabled = currentPage <= 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayProducts(currentCategory);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Информация о текущей странице
  const info = document.createElement('span');
  info.textContent = `Страница ${currentPage} из ${totalPages}`;
  info.style.cssText = `
    margin: 0 12px;
    vertical-align: middle;
  `;

  // Кнопка "Следующая"
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Следующая →';
  nextBtn.className = 'btn';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayProducts(currentCategory);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Собираем пагинацию
  container.appendChild(prevBtn);
  container.appendChild(info);
  container.appendChild(nextBtn);
}


// ================================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ================================================

// Кнопка "Вернуться к категориям"
document.getElementById('backBtn').addEventListener('click', () => {
  document.getElementById('categoriesSection').style.display = 'block';
  document.getElementById('productsSection').style.display = 'none';
  currentCategory = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Кнопка "Применить фильтры"
document.getElementById('applyFiltersBtn').addEventListener('click', () => {
  if (currentCategory) {
    displayProducts(currentCategory);
  }
});

// Кнопка "Сбросить фильтры"
document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  // Очищаем все фильтры
  document.getElementById('fInStock').checked = false;
  document.getElementById('fDiscount').checked = false;
  document.getElementById('fRating').value = '0';
  document.getElementById('fMaxPrice').value = '';
  
  // Перезагружаем товары
  if (currentCategory) {
    displayProducts(currentCategory);
  }
});

// Кнопка поиска
document.getElementById('searchBtn').addEventListener('click', () => {
  const searchQuery = document.getElementById('searchInput').value.trim();
  if (searchQuery) {
    // Перенаправляем на главную страницу с поиском
    window.location.href = `/?q=${encodeURIComponent(searchQuery)}`;
  }
});

// Поиск по нажатию Enter в поле ввода
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
  }
});

// Применять фильтры при изменении чекбоксов (автоматически)
document.getElementById('fInStock').addEventListener('change', () => {
  if (currentCategory) displayProducts(currentCategory);
});

document.getElementById('fDiscount').addEventListener('change', () => {
  if (currentCategory) displayProducts(currentCategory);
});

document.getElementById('fRating').addEventListener('change', () => {
  if (currentCategory) displayProducts(currentCategory);
});

document.getElementById('fMaxPrice').addEventListener('change', () => {
  if (currentCategory) displayProducts(currentCategory);
});


// ================================================
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ
// ================================================
/**
 * Загружает товары и показывает категории
 * при загрузке страницы
 */
async function initPage() {
  console.log('🚀 Инициализация страницы категорий...');
  console.log('📋 Контейнер категорий:', document.getElementById('categoryGrid'));
  
  try {
    // Загружаем все товары с сервера
    console.log('📡 Начинаю загрузку товаров...');
    await fetchAllListings();
    console.log('✅ Товары загружены, всего:', allListings.length);
    
    // Получаем уникальные категории
    const categories = getCategories(allListings);
    console.log('📦 Найдено категорий:', categories.length);
    console.log('📋 Категории:', categories);
    
    // Отображаем категории
    console.log('🎨 Отображаю категории на странице...');
    displayCategories(categories);
    
    console.log(`✅ Готово! Найдено ${categories.length} категорий`);
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
  }
}

// Запускаем инициализацию при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
