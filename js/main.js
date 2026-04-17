'use strict';

// --- Config ---
const SCROLL_THRESHOLD = 20;

// --- DOM Elements ---
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const fadeEls = document.querySelectorAll('.fade-in');

// --- Utilities ---
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- Features ---

function handleNavbarScroll() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}

function toggleMobileMenu() {
  if (!mobileMenu || !menuToggle) return;
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
}

function closeMobileMenuOnLink() {
  if (!mobileMenu) return;
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      if (menuToggle) {
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Intersection Observer for fade-in elements
function initFadeIn() {
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => observer.observe(el));
}

// Highlight active nav link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === currentPage);
  });
}

// --- Event Listeners ---
window.addEventListener('scroll', debounce(handleNavbarScroll, 8));

if (menuToggle) {
  menuToggle.addEventListener('click', toggleMobileMenu);
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!mobileMenu || !menuToggle) return;
  if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

// --- Lightbox ---
function initLightbox() {
  // Inject lightbox into DOM
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox__close" aria-label="Close image">✕</button>
    <img src="" alt="">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox__close');

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  // Make all content images zoomable
  document.querySelectorAll('.content-row__image img, .image-grid__item img, .brief-image img').forEach(img => {
    img.classList.add('zoomable');
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

// --- Contact Modal ---
function initContactModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;

  const openers = [
    document.getElementById('open-contact'),
    document.getElementById('open-contact-footer'),
  ].filter(Boolean);

  const closer = document.getElementById('close-contact');

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openers.forEach(btn => btn.addEventListener('click', openModal));
  if (closer) closer.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}


// --- Hero Dotted Wave Background ---
function initHeroDots() {
  const container = document.getElementById('hero-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const SEPARATION = 120;
  const AMOUNTX = 45;
  const AMOUNTY = 25;

  const scene = new THREE.Scene();

  const w = container.offsetWidth;
  const h = container.offsetHeight;

  const camera = new THREE.PerspectiveCamera(60, w / h, 1, 10000);
  camera.position.set(0, 355, 1220);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  const isDark = document.body.classList.contains('dark-theme');
  const dotColor = isDark ? 0.9 : 0.29;

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions.push(
        ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
        0,
        iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
      );
      colors.push(dotColor, dotColor, dotColor);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 6,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let count = 0;
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);
    const posAttr = geometry.attributes.position;
    const pos = posAttr.array;

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        pos[i * 3 + 1] =
          Math.sin((ix + count) * 0.3) * 50 +
          Math.sin((iy + count) * 0.5) * 50;
        i++;
      }
    }
    posAttr.needsUpdate = true;
    renderer.render(scene, camera);
    count += 0.1;
  }

  animate();

  window.addEventListener('resize', () => {
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// --- Letter-by-letter animation ---
function animateByLetter(el, startDelay = 0, DELAY = 38) {
  if (!el) return 0;
  const segments = el.innerHTML.split(/(<br\s*\/?>)/i);
  let i = startDelay;

  el.innerHTML = segments.map(seg => {
    if (/<br/i.test(seg)) return seg;
    // Split into words and spaces, preserving whitespace tokens
    return seg.split(/(\s+)/).map(token => {
      if (/^\s+$/.test(token)) return token; // keep spaces as plain text
      // Wrap word's letters in a no-break container
      const chars = [...token].map(char => {
        const delay = i++ * DELAY;
        return `<span class="char" style="animation-delay:${delay}ms">${char}</span>`;
      }).join('');
      return `<span style="display:inline-block;white-space:nowrap">${chars}</span>`;
    }).join('');
  }).join('');

  return i;
}

function initHeroLetterAnimation() {
  animateByLetter(document.querySelector('.statement-section__text'));
}


// --- Project title slide-in on scroll ---
function initProjectTitleAnimation() {
  const sections = document.querySelectorAll('.s2, .s3');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        // Remove so it re-animates when scrolled back in
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(s => observer.observe(s));
}

// --- Section scale + fade on scroll ---
function initSectionSlide() {
  const pairs = [
    { section: document.querySelector('.hero'),  inner: document.querySelector('.hero__main') },
    { section: document.querySelector('.s2'),    inner: document.querySelector('.s2 .s2__main') },
    { section: document.querySelector('.s3'),    inner: document.querySelector('.s3 .s2__main') },
  ].filter(p => p.section && p.inner);

  if (!pairs.length) return;

  const vh = window.innerHeight;

  pairs.forEach(p => {
    p.inner.style.willChange = 'transform, opacity';
  });

  function update() {
    const scrollY = window.scrollY;
    pairs.forEach(({ inner }, i) => {
      const sectionStart = i * vh;
      const progress = Math.max(0, Math.min(1, (scrollY - sectionStart) / vh));
      const opacity = 1 - progress;
      const scale   = 1 - progress * 0.1;
      const slideX  = progress * 120;
      inner.style.opacity   = opacity;
      inner.style.transform = `scale(${scale}) translateX(${slideX}px)`;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// --- Init ---
function init() {
  handleNavbarScroll();
  initFadeIn();
  closeMobileMenuOnLink();
  setActiveNavLink();
  initContactModal();
  initLightbox();
  initHeroDots();
  initHeroLetterAnimation();
  initProjectTitleAnimation();
  initSectionSlide();
}

document.addEventListener('DOMContentLoaded', init);
