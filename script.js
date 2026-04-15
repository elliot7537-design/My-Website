// Smooth scroll for anchor links
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

// Expand/collapse service rows on click (mobile-friendly)
document.querySelectorAll('.service').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('is-open');
    const plus = item.querySelector('.plus');
    if (plus) {
      plus.style.transform = item.classList.contains('is-open')
        ? 'rotate(45deg)'
        : 'rotate(0deg)';
    }
  });
});

// Fade-in observer for sections
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.project, .stat, .service, .about-stat').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  io.observe(el);
});

const style = document.createElement('style');
style.textContent = `
  .in-view { opacity: 1 !important; transform: translateY(0) !important; }
`;
document.head.appendChild(style);
