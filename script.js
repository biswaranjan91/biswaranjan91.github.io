/* ══════════════════════════════════════════════════
   νIDEA Lab — Dr. Biswaranjan Behera
   script.js — Animations, Particles, Interactions
   ══════════════════════════════════════════════════ */

'use strict';

// ── THEME TOGGLE ──
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  initParticles(); // re-init with new theme colors
});

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id], div[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });

// ── MOBILE NAV TOGGLE ──
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) navLinksEl.classList.remove('open');
});
navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinksEl.classList.remove('open'));
});

// ── TYPED TEXT ANIMATION ──
const phrases = [
  'Experimental Neutrino Physics',
  'Detector Instrumentation R&D',
  'Power-over-Fiber Technology',
  'DUNE · ICARUS · SBND',
  'Cryogenic Photon Detection',
  'Ramanujan Fellow @ IISc Bangalore',
];
let phraseIdx = 0, charIdx = 0, isDeleting = false;
const typedEl = document.getElementById('typedText');

function typeWriter() {
  const phrase = phrases[phraseIdx];
  if (!isDeleting) {
    typedEl.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) {
      isDeleting = true;
      setTimeout(typeWriter, 2200);
      return;
    }
  } else {
    typedEl.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  setTimeout(typeWriter, isDeleting ? 40 : 75);
}
setTimeout(typeWriter, 800);

// ── PARTICLE CANVAS ──
const canvas  = document.getElementById('particleCanvas');
const ctx     = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x    = Math.random() * canvas.width;
    this.y    = Math.random() * canvas.height;
    this.vx   = (Math.random() - 0.5) * 0.3;
    this.vy   = (Math.random() - 0.5) * 0.3;
    this.r    = Math.random() * 1.5 + 0.4;
    this.life = Math.random();
    this.maxLife = Math.random() * 0.4 + 0.3;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life += 0.003;
    if (this.life > this.maxLife) this.reset();
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    const dark = html.getAttribute('data-theme') === 'dark';
    const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * (dark ? 0.25 : 0.12);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = dark
      ? `rgba(100,160,255,${alpha})`
      : `rgba(26,63,110,${alpha})`;
    ctx.fill();
  }
}

// Track lines between nearby particles
function drawConnections() {
  const dark = html.getAttribute('data-theme') === 'dark';
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        const alpha = (1 - dist / 90) * (dark ? 0.08 : 0.04);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = dark
          ? `rgba(100,160,255,${alpha})`
          : `rgba(26,63,110,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function initParticles() {
  cancelAnimationFrame(animFrame);
  resizeCanvas();
  const count = Math.min(Math.floor(window.innerWidth * window.innerHeight / 14000), 80);
  particles = Array.from({ length: count }, () => new Particle());
  animateParticles();
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  animFrame = requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); }, { passive: true });
initParticles();

// ── SCROLL FADE-IN ANIMATIONS ──
const fadeEls = document.querySelectorAll(
  '.timeline-card, .project-card, .award-card, .interest-card, ' +
  '.leadership-card, .pub-item, .media-card, .student-item, ' +
  '.mentorship-stat, .outreach-item, .about-text, .about-interests'
);
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Staggered delay for grid children
      const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
      let delay = 0;
      siblings.forEach((sib, idx) => { if (sib === entry.target) delay = idx * 80; });
      setTimeout(() => entry.target.classList.add('visible'), Math.min(delay, 400));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// ── PUBLICATION FILTER ──
const pubFilters = document.querySelectorAll('.pub-filter');
const pubItems   = document.querySelectorAll('.pub-item');

pubFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    pubFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    pubItems.forEach(item => {
      const cats = item.dataset.category || '';
      const show = filter === 'all' || cats.includes(filter);
      item.classList.toggle('hidden', !show);
      if (show) {
        item.style.animation = 'none';
        item.offsetHeight; // reflow
        item.style.animation = 'pubAppear 0.4s ease forwards';
      }
    });
  });
});

// ── CONTACT FORM — open mailto ──
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('name').value;
    const email   = document.getElementById('email').value;
    const subject = document.getElementById('subject').value || 'Website Inquiry';
    const message = document.getElementById('message').value;
    const mailto  = `mailto:biswaranjanb@iisc.ac.in`
      + `?subject=${encodeURIComponent('[Website] ' + subject + ' — ' + name)}`
      + `&body=${encodeURIComponent('From: ' + name + ' <' + email + '>\n\n' + message)}`;
    window.location.href = mailto;
  });
}

// ── CV DOWNLOAD PLACEHOLDER ──
document.getElementById('cvDownload').addEventListener('click', e => {
  e.preventDefault();
  alert('Please replace this with your actual CV PDF link.\nUpdate href in index.html to: href="cv.pdf"');
});

// ── NEWS TRACK DUPLICATE (for seamless loop) ──
const newsTrack = document.getElementById('newsTrack');
if (newsTrack) {
  newsTrack.innerHTML += newsTrack.innerHTML; // duplicate for infinite scroll
}

// ── SMOOTH ANCHOR SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── STATS COUNTER ANIMATION ──
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const isDecimal = String(target).includes('.');
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value + (progress === 1 ? suffix : suffix);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-number');
      nums.forEach(el => {
        const raw = el.textContent.replace(/[^0-9.]/g, '');
        const suffix = el.textContent.replace(/[0-9.]/g, '');
        if (raw) animateCounter(el, parseFloat(raw), suffix);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ── ADD KEYFRAME FOR PUB FILTER ──
const style = document.createElement('style');
style.textContent = `
  @keyframes pubAppear {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
