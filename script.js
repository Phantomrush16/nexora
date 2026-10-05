document.addEventListener('DOMContentLoaded', () => {

  /* ----- Прелоадер ----- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('is-hidden'), 300);
    });
  }

  /* ----- Reveal при скролле ----- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ----- Кнопка наверх ----- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    });
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----- Параллакс на Hero ----- */
  const hero = document.querySelector('.hero__visual');
  if (hero && window.matchMedia('(pointer: fine)').matches) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      hero.style.transform = `translate(${x}px, ${y}px)`;
    });
    document.querySelector('.hero').addEventListener('mouseleave', () => {
      hero.style.transform = 'translate(0, 0)';
    });
  }

  /* ----- Счётчики ----- */
  const stats = document.querySelectorAll('.stat__num');
  if (stats.length && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const step = Math.max(1, Math.round(target / 40));
        const tick = () => {
          current += step;
          if (current >= target) { el.textContent = target; return; }
          el.textContent = current;
          requestAnimationFrame(tick);
        };
        tick();
        statObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    stats.forEach(el => statObserver.observe(el));
  }

  /* ----- Плавный скролл с учётом шапки ----- */
  const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----- Тема ----- */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle?.querySelector('.theme-toggle__icon');
  const savedTheme = localStorage.getItem('nexora-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    if (themeIcon) themeIcon.textContent = '☀️';
  }
  themeToggle?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    if (themeIcon) themeIcon.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('nexora-theme', isLight ? 'light' : 'dark');
  });

  /* ----- Форма ----- */
  /* ----- Форма (реальная отправка через Formspree) ----- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    note.textContent = '';
    note.className = 'contact-form__note';

    const fields = form.querySelectorAll('[required]');
    let hasError = false;
    fields.forEach(f => {
      if (!f.value.trim()) {
        f.classList.add('is-error');
        hasError = true;
      } else {
        f.classList.remove('is-error');
      }
    });

    if (hasError) {
      note.textContent = 'Заполните все поля';
      note.classList.add('is-error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Отправляем...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        note.textContent = 'Заявка отправлена! Свяжусь с вами в течение часа.';
        note.classList.add('is-success');
        form.reset();
      } else {
        const data = await response.json().catch(() => ({}));
        note.textContent = data?.errors?.[0]?.message || 'Ошибка отправки. Попробуйте ещё раз.';
        note.classList.add('is-error');
      }
    } catch (err) {
      note.textContent = 'Нет соединения. Проверьте интернет.';
      note.classList.add('is-error');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });

});
