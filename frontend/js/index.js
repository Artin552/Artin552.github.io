    // ============================================================
    // ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ UI
    // ============================================================
    // Молоток подпрыгивает при наведении
    const hammer = document.getElementById('hammer');
    if (hammer) {
      hammer.addEventListener('mouseenter', () => {
        hammer.style.transform = 'translateY(-2px) scale(1.08)';
      });
      hammer.addEventListener('mouseleave', () => {
        hammer.style.transform = '';
      });
    }

    // Шапка сайта сжимается при скроллинге
    const headerEl = document.getElementById('mainHeader');
    if (headerEl) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 60) headerEl.classList.add('shrink');
        else headerEl.classList.remove('shrink');
      });
    }

    // ============================================================
    // АККОРДЕОН "КАК ЭТО РАБОТАЕТ"
    // ============================================================
    (function setupAccordion() {
      const items = document.querySelectorAll('.accordion-item');
      items.forEach((it) => {
        const head = it.querySelector('.accordion-head');
        const body = it.querySelector('.accordion-body');
        const icon = it.querySelector('.icon');

        head.addEventListener('click', () => {
          const isOpen = body.classList.contains('open');

          // Закрываем все остальные аккордеоны
          document.querySelectorAll('.accordion-body.open').forEach((b) => {
            b.classList.remove('open');
            b.style.maxHeight = null;
          });
          document.querySelectorAll('.accordion-item .icon.open').forEach((ic) => ic.classList.remove('open'));

          // Открываем текущий аккордеон если он был закрыт
          if (!isOpen) {
            body.classList.add('open');
            body.style.maxHeight = body.scrollHeight + 'px';
            if (icon) icon.classList.add('open');

            // Специальная анимация для молотка на первом шаге
            if (it.dataset.step === '1') {
              icon.classList.add('swing');
              setTimeout(() => icon.classList.remove('swing'), 900);
            }
          }
        });
      });
    })();

    // ============================================================
    // ВИДЕО В ГЕРОЙ СЕКЦИИ
    // ============================================================
    // Обеспечиваем автоматическое воспроизведение видео и его повтор
    (function ensureHeroVideoLoop() {
      const heroVideo = document.getElementById('heroVideo');
      if (!heroVideo) return;

      // Устанавливаем необходимые атрибуты
      heroVideo.muted = true;
      heroVideo.loop = true;
      heroVideo.playsInline = true;

      // При завершении видео перезапускаем его
      heroVideo.addEventListener('ended', () => {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
      });

      // Когда вкладка становится видимой, возобновляем видео
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          heroVideo.play().catch(() => {});
        }
      });

      // Если видео неожиданно пауза во время просмотра, возобновляем его
      heroVideo.addEventListener('pause', () => {
        if (!document.hidden) {
          setTimeout(() => heroVideo.play().catch(() => {}), 150);
        }
      });
    })();