// ============================================================
// Craftmanship Day Q1 2026 — Live Timeline
// ============================================================

(function () {
  'use strict';

  const EVENT_DATE = '2026-04-08';
  const EVENT_START = '13:00';
  const EVENT_END = '20:00';

  function toMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); }

  function nowMinutes() {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;
  }

  function getNow() { return new Date(); }

  function fmtTime(d) { return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }); }

  function isEventDay() {
    return new Date().toISOString().slice(0, 10) === EVENT_DATE;
  }

  // --- Particles ---
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() { w = canvas.width = innerWidth; h = canvas.height = innerHeight; }

    function create() {
      particles = [];
      const count = Math.min(50, Math.floor((w * h) / 25000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
          o: Math.random() * 0.4 + 0.1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(65,195,135,${p.o})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(65,195,135,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize(); create(); draw();
    window.addEventListener('resize', () => { resize(); create(); });
  }

  // --- Scroll animations ---
  function initScrollAnimations() {
    const els = document.querySelectorAll('[data-animate]');
    document.querySelectorAll('.speakers-grid [data-animate]').forEach((el, i) => el.style.setProperty('--i', i));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  }

  // --- Header auto-hide ---
  function initHeaderScroll() {
    const header = document.getElementById('header');
    let lastY = 0, ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          header.classList.toggle('hidden', y > 200 && y > lastY);
          lastY = y; ticking = false;
        });
        ticking = true;
      }
    });
  }

  // --- Mobile nav ---
  function initMobileNav() {
    const items = document.querySelectorAll('.mobile-nav-item[data-section]');
    const sections = {};
    items.forEach(item => { sections[item.dataset.section] = document.getElementById(item.dataset.section); });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach(i => i.classList.remove('active'));
          const m = [...items].find(i => i.dataset.section === entry.target.id);
          if (m) m.classList.add('active');
        }
      });
    }, { threshold: 0.3 });
    Object.values(sections).forEach(s => { if (s) observer.observe(s); });

    document.getElementById('scrollToNow')?.addEventListener('click', () => {
      const active = document.querySelector('.time-block.is-active');
      (active || document.getElementById('agenda')).scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // --- Countdown ---
  function initCountdown() {
    const hEl = document.getElementById('countHours');
    const mEl = document.getElementById('countMinutes');
    const sEl = document.getElementById('countSeconds');
    const label = document.getElementById('countdownLabel');
    if (!hEl) return;

    function update() {
      const now = getNow();
      const start = new Date(EVENT_DATE + 'T' + EVENT_START + ':00');
      const end = new Date(EVENT_DATE + 'T' + EVENT_END + ':00');
      let diff, text;
      if (now < start) { diff = start - now; text = 'tot de start van Craftmanship Day'; }
      else if (now < end) { diff = end - now; text = 'resterend vandaag'; }
      else if (isEventDay()) { diff = 0; text = 'Craftmanship Day is afgelopen!'; }
      else { diff = start - now; text = 'tot Craftmanship Day'; }

      if (diff <= 0) { hEl.textContent = mEl.textContent = sEl.textContent = '00'; }
      else {
        const ts = Math.floor(diff / 1000);
        hEl.textContent = String(Math.floor(ts / 3600)).padStart(2, '0');
        mEl.textContent = String(Math.floor((ts % 3600) / 60)).padStart(2, '0');
        sEl.textContent = String(ts % 60).padStart(2, '0');
      }
      if (label) label.textContent = text;
    }
    update();
    setInterval(update, 1000);
  }

  // --- Live timeline ---
  function initTimeline() {
    const blocks = document.querySelectorAll('.time-block[data-start]');
    const timeline = document.getElementById('timeline');
    const headerProgress = document.getElementById('headerProgress');
    const headerClock = document.getElementById('headerClock');
    const liveBar = document.getElementById('liveBar');
    const liveStatus = document.getElementById('liveStatus');
    const liveTime = document.getElementById('liveTime');
    const liveProgress = document.getElementById('liveProgress');
    if (!blocks.length) return;

    const startMin = toMin(EVENT_START);
    const endMin = toMin(EVENT_END);

    function update() {
      const now = nowMinutes();
      const currentDate = getNow();

      if (headerClock) headerClock.textContent = fmtTime(currentDate);
      if (liveTime) liveTime.textContent = fmtTime(currentDate);

      const overall = Math.max(0, Math.min(1, (now - startMin) / (endMin - startMin)));
      const live = isEventDay() && now >= startMin && now <= endMin;

      if (headerProgress) headerProgress.style.width = live ? (overall * 100) + '%' : '0%';
      if (liveBar) liveBar.classList.toggle('visible', live);
      if (liveProgress) liveProgress.style.width = live ? (overall * 100) + '%' : '0%';

      let activeBlock = null, progressFraction = 0;
      blocks.forEach((block, i) => {
        const s = toMin(block.dataset.start), e = toMin(block.dataset.end);
        block.classList.remove('is-active', 'is-past');
        if (isEventDay()) {
          if (now >= e) block.classList.add('is-past');
          else if (now >= s && now < e) {
            block.classList.add('is-active');
            activeBlock = block;
            progressFraction = (i + (now - s) / (e - s)) / blocks.length;
          }
        }
      });

      if (timeline && isEventDay()) {
        timeline.style.setProperty('--timeline-progress', now >= endMin ? '100%' : now >= startMin ? (progressFraction * 100) + '%' : '0%');
      }

      if (liveStatus && isEventDay()) {
        if (activeBlock) {
          const h3 = activeBlock.querySelector('h3');
          const name = activeBlock.querySelector('.speaker-name');
          let s = 'Nu: ' + (h3 ? h3.textContent : '');
          if (name) s += ' — ' + name.textContent;
          liveStatus.textContent = s;
        } else if (now < startMin) liveStatus.textContent = 'Start om 13:00';
        else liveStatus.textContent = 'Afgelopen!';
      }
    }
    update();
    setInterval(update, 1000);
  }

  // --- Scroll indicator ---
  function initScrollIndicator() {
    const el = document.getElementById('scrollIndicator');
    if (!el) return;
    window.addEventListener('scroll', () => { el.style.opacity = window.scrollY > 100 ? '0' : ''; }, { passive: true });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollAnimations();
    initHeaderScroll();
    initMobileNav();
    initCountdown();
    initTimeline();
    initScrollIndicator();
  });

})();
