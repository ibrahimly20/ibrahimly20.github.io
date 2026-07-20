(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const THEME_KEY = 'ily-theme';
  const order = ['auto', 'dark', 'light'];
  const labels = { auto: 'Mode — Auto', dark: 'Mode — Sombre', light: 'Mode — Clair' };

  function applyTheme(mode) {
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    themeBtn.textContent = labels[mode];
  }

  let saved = localStorage.getItem(THEME_KEY) || 'auto';
  if (!order.includes(saved)) saved = 'auto';
  let idx = order.indexOf(saved);
  applyTheme(saved);

  themeBtn.addEventListener('click', () => {
    idx = (idx + 1) % order.length;
    const mode = order[idx];
    applyTheme(mode);
    localStorage.setItem(THEME_KEY, mode);
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    });
  });

  /* ---------- Scrollspy ---------- */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...document.querySelectorAll('[data-nav]')];
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && revealEls.length) {
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => reveal.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = [...document.querySelectorAll('[data-count]')];
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion || target === 0) { el.textContent = String(target); return; }
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    const countObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => countObs.observe(c));
  }

  /* ---------- Experience accordion ---------- */
  document.querySelectorAll('.acc-item').forEach((item) => {
    const head = item.querySelector('.acc-head');
    head.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Ambient mouse-follow glow + reticle ---------- */
  if (!isCoarsePointer) {
    const blob = document.querySelector('#ambient-glow .blob');
    const reticle = document.getElementById('reticle');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let glowX = mouseX, glowY = mouseY;
    let hasMoved = false;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (!hasMoved) { glowX = mouseX; glowY = mouseY; hasMoved = true; }
      reticle.classList.add('is-visible');
      reticle.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    window.addEventListener('pointerleave', () => reticle.classList.remove('is-visible'));

    document.querySelectorAll('a, button, .proj-card, .bracketed').forEach((el) => {
      el.addEventListener('mouseenter', () => reticle.classList.add('is-active'));
      el.addEventListener('mouseleave', () => reticle.classList.remove('is-active'));
    });

    if (reduceMotion) {
      blob.style.display = 'none';
    } else {
      function raf() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        blob.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Contact form -> mailto fallback ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const subject = encodeURIComponent(`Contact portfolio — ${name}`);
      const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
      window.location.href = `mailto:contact@ibrahimly.com?subject=${subject}&body=${body}`;
    });
  }
})();
