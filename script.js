/* ===========================
   CUSTOM CURSOR — DESKTOP ONLY
   WITH TOGGLE (PRO MOVE)
=========================== */
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
const cursorToggle = document.getElementById('cursorToggle');
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
let cursorEnabled = false; // OFF by default — recruiter-safe

function enableCursor() {
  document.body.classList.add('cursor-active');
  cursorToggle.classList.add('active');
  cursorEnabled = true;

  document.addEventListener('mousemove', trackMouse);
  if (!animationStarted) {
    animationStarted = true;
    animateCursor();
  }
  attachHoverListeners();
}

function disableCursor() {
  document.body.classList.remove('cursor-active');
  cursorToggle.classList.remove('active');
  cursorEnabled = false;
  document.removeEventListener('mousemove', trackMouse);
}

function trackMouse(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
}

let animationStarted = false;

function animateCursor() {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursor.style.left = curX + 'px';
  cursor.style.top = curY + 'px';
  requestAnimationFrame(animateCursor);
}

function attachHoverListeners() {
  document.querySelectorAll('a, button, .pill, .project-item, .contact-card, .edu-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!cursorEnabled) return;
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursor.style.borderColor = 'rgba(99,179,237,0.4)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.borderColor = 'rgba(99,179,237,0.6)';
    });
  });
}

if (!isTouchDevice() && cursorToggle) {
  cursorToggle.addEventListener('click', () => {
    if (cursorEnabled) {
      disableCursor();
    } else {
      enableCursor();
    }
  });
}

/* ===========================
   STICKY HEADER
=========================== */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* ===========================
   SMOOTH ANCHOR SCROLL
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ===========================
   SCROLL REVEAL
=========================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===========================
   COUNT-UP ANIMATION
=========================== */
function countUp(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const duration = 1600;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      countUp(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

/* ===========================
   ACTIVE NAV HIGHLIGHTING
=========================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 110) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}, { passive: true });

/* ===========================
   PROJECT ROW CLICK → GITHUB
=========================== */
document.querySelectorAll('.project-item[data-href]').forEach(item => {
  item.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.closest('a')) return;
    window.open(item.getAttribute('data-href'), '_blank');
  });
});