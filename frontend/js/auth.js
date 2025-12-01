// ============================================================
// МОДУЛЬ АУТЕНТИФИКАЦИИ (auth.js)
// ============================================================
// Этот скрипт загружается на все страницы и управляет:
// - Отображением кнопок "Вход/Регистрация" для неавторизованных пользователей
// - Отображением "Профиль/Выход" для авторизованных пользователей
// - Сохранением и загрузкой токена и email из localStorage/sessionStorage

(function() {
  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================
  
  // Проверяем, находимся ли мы в папке /frontend/
  // (нужно для правильного построения ссылок на разные страницы)
  function inFrontendFolder() {
    return window.location.pathname.split('/').includes('frontend');
  }

  // Генерируем ссылку на личный кабинет (зависит от текущей папки)
  function dashboardHref() {
    return inFrontendFolder() ? 'dashboard.html' : '/frontend/dashboard.html';
  }

  // Генерируем ссылку на страницу входа
  function authHref() {
    return inFrontendFolder() ? 'auth.html' : '/frontend/auth.html';
  }

  // Генерируем ссылку на страницу регистрации
  function regHref() {
    return inFrontendFolder() ? 'reg.html' : '/frontend/reg.html';
  }

  // Генерируем ссылку на страницу добавления объявления
  function addHref() {
    return inFrontendFolder() ? 'add.html' : '/frontend/add.html';
  }

  // ============================================================
  // ОСНОВНАЯ ФУНКЦИЯ: НАСТРОЙКА ССЫЛОК АУТЕНТИФИКАЦИИ
  // ============================================================
  function setupAuthLinks() {
    // Ищем контейнер для ссылок аутентификации
    const container = document.querySelector('.auth-links');
    if (!container) return; // Если контейнер не найден, выходим

    // Получаем токен и email из хранилища
    // Сначала проверяем sessionStorage (текущая сессия)
    // Потом проверяем localStorage (сохранённые данные)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const email = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    // Очищаем контейнер чтобы избежать дублирования элементов
    container.innerHTML = '';

    if (token && email) {
      // ========================
      // ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН
      // ========================
      
      // Создаём ссылку на профиль с email пользователя
      const profile = document.createElement('a');
      profile.href = dashboardHref();
      profile.className = 'btn secondary';
      profile.textContent = email;

      // Создаём кнопку выхода
      const logout = document.createElement('button');
      logout.className = 'btn';
      logout.textContent = 'Выйти';
      logout.addEventListener('click', () => {
        // Удаляем все данные авторизации из обоих хранилищ
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userEmail');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        
        // Перезагружаем страницу чтобы обновить интерфейс
        window.location.reload();
      });

      // Добавляем элементы в контейнер
      container.appendChild(profile);
      container.appendChild(logout);

    } else {
      // ========================
      // ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН
      // ========================

      // Создаём ссылку "Вход"
      const login = document.createElement('a');
      login.href = authHref();
      login.textContent = 'Вход';

      // Создаём ссылку "Регистрация"
      const reg = document.createElement('a');
      reg.href = regHref();
      reg.textContent = 'Регистрация';

      // Добавляем ссылки в контейнер
      container.appendChild(login);
      container.appendChild(reg);
    }
  }

  // ============================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================================
  // Вызываем функцию когда страница полностью загружена
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAuthLinks);
  } else {
    setupAuthLinks();
  }
})();