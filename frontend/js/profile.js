// profile.js — только для dashboard.html

async function loadProfile() {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) {
    window.location.href = '/auth.html';
    return;
  }

  let user;
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!res.ok) {
      throw new Error('Unauthorized');
    }

    user = await res.json();

    // Обновляем имя и email
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const sinceEl = document.getElementById('userSince');

    if (nameEl) nameEl.textContent = user.name || 'Пользователь';
    if (emailEl) emailEl.textContent = user.email;

    if (sinceEl && user.created_at) {
      const joinDate = new Date(user.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      sinceEl.textContent = `На сайте с ${joinDate}`;
    }

    // Обновляем аватар
    const avatarImg = document.querySelector('.profile-avatar img');
    if (avatarImg) {
      const avatarUrl = user.avatar_path
        ? '/uploads/' + user.avatar_path
        : '/img/default-avatar.svg';
      avatarImg.src = avatarUrl;
    }
  } catch (e) {
    console.error('Ошибка загрузки профиля:', e);
    alert('Не удалось загрузить профиль. Попробуйте войти снова.');
    window.location.href = '/auth.html';
  }
}

function setupLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/';
    });
  }
}

// Загрузка аватара (остаётся без изменений)
async function uploadAvatar(file) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ imageBase64: reader.result })
      });
      const data = await res.json();
      if (res.ok) {
        document.querySelector('.profile-avatar img').src = data.avatarPath + '?t=' + Date.now();
        document.getElementById('avatarStatus').textContent = 'Аватар обновлён';
      } else {
        throw new Error(data.error || 'Ошибка');
      }
    } catch (e) {
      document.getElementById('avatarStatus').textContent = 'Ошибка: ' + e.message;
    }
  };
  reader.readAsDataURL(file);
}

// Обработчик выбора файла
document.addEventListener('DOMContentLoaded', () => {
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const statusEl = document.getElementById('avatarStatus');
      if (file && file.type.startsWith('image/')) {
        if (statusEl) statusEl.textContent = 'Загрузка...';
        uploadAvatar(file);
      } else {
        if (statusEl) statusEl.textContent = 'Выберите изображение';
      }
    });
  }
});

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('userName')) {
    loadProfile();
    setupLogout();
  }
});