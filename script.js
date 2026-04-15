/* ============================================================
   PixelForge — interactions
   ============================================================ */

/* ---------- Smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id.length <= 1) return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------- Scroll progress bar ---------- */
const progress = document.querySelector('.scroll-progress');
if (progress) {
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = scrolled + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* ---------- Reveal on scroll ---------- */
const revealTargets = document.querySelectorAll(
  '.hero-copy, .hero-side, .stat, .services-head, .service, ' +
  '.work-head, .project, .about-left, .about-right, ' +
  '.about-stat, .cta-title, .cta-kicker, .cta-pill'
);
revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = Math.min(i % 4, 3) * 0.08 + 's';
});

const revealIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
revealTargets.forEach(el => revealIO.observe(el));

/* ---------- Count-up stats ---------- */
const counters = document.querySelectorAll('[data-count]');
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.floor(eased * target);
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(tick);
};
const countIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => countIO.observe(c));

/* ---------- Services accordion (one open at a time) ---------- */
const services = document.querySelectorAll('.service');
services.forEach((item, idx) => {
  // Open the first one by default for visual interest
  if (idx === 0) item.classList.add('is-open');

  item.querySelector('.service-head').addEventListener('click', () => {
    const wasOpen = item.classList.contains('is-open');
    services.forEach(s => s.classList.remove('is-open'));
    if (!wasOpen) item.classList.add('is-open');
  });
});

/* ---------- Magnetic buttons ---------- */
const magnets = document.querySelectorAll('.magnetic');
magnets.forEach(btn => {
  const strength = 0.25;
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ---------- Custom cursor ---------- */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

if (dot && ring && !matchMedia('(pointer: coarse)').matches) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    document.body.classList.add('cursor-ready');
  });

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  };
  animateRing();

  // Hover states over interactive elements
  const hoverables = document.querySelectorAll('a, button, .service-head, .project, .magnetic');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });

  // Detect dark sections for cursor color
  const darkSections = document.querySelectorAll('.services, .about, .cta, .midbar, .footer, .marquee-dark');
  const darkIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.5) {
        ring.classList.add('is-dark');
      }
    });
  }, { threshold: [0.5] });
  darkSections.forEach(s => darkIO.observe(s));

  window.addEventListener('mousemove', (e) => {
    // Re-evaluate dark on each move based on element under cursor
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const inDark = el.closest('.services, .about, .cta, .midbar, .footer, .marquee-dark');
    ring.classList.toggle('is-dark', !!inDark);
  });

  window.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-ready');
  });
  window.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-ready');
  });
}

/* ---------- Subtle hero parallax ---------- */
const heroPhoto = document.querySelector('.hero-photo');
const heroThumb = document.querySelector('.hero-thumb');
if (heroPhoto && heroThumb && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 800) return;
    heroPhoto.style.transform = `translateY(${y * 0.06}px)`;
    heroThumb.style.transform = `rotate(-6deg) translateY(${y * -0.04}px)`;
  }, { passive: true });
}
