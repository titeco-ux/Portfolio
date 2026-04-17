'use strict';

// --- Lightbox for background-image divs ---
function initCsLightbox() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'cs-lightbox';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.92);
    display: none; align-items: center; justify-content: center;
    cursor: zoom-out;
  `;
  const img = document.createElement('img');
  img.style.cssText = `
    max-width: 90vw; max-height: 90vh;
    object-fit: contain; display: block;
    transition: transform 0.3s ease;
  `;
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  // Close on click
  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    img.src = '';
    document.body.style.overflow = '';
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.click();
  });

  // Make image divs clickable
  const selectors = ['.cs-v1','.cs-v2','.cs-v3','.cs-v4','.cs-v5','.cs-v6','.cs-v7','.cs-pattern'];
  document.querySelectorAll(selectors.join(',')).forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => {
      const bg = window.getComputedStyle(el).backgroundImage;
      const url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      if (!url || url === 'none') return;
      img.src = url;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });
}

// --- Case study section snap scroll (auto-advance on single scroll) ---
function initCsSectionSlide() {
  const sections = [...document.querySelectorAll('.s2')];
  if (!sections.length) return;

  let currentIndex = 0;
  let isAnimating  = false;
  let vh = window.innerHeight;

  sections.forEach(s => {
    const inner = s.querySelector('.s2__main');
    if (inner) {
      inner.style.willChange = 'transform, opacity';
      inner.style.transformOrigin = 'top center';
    }
  });

  window.addEventListener('resize', () => { vh = window.innerHeight; });

  function applyProgress(i, progress) {
    const inner = sections[i]?.querySelector('.s2__main');
    if (!inner) return;
    inner.style.opacity   = 1 - progress;
    inner.style.transform = `scale(${1 - progress * 0.1}) translateX(${progress * 120}px)`;
  }

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function goTo(index) {
    if (isAnimating || index < 0 || index >= sections.length) return;
    isAnimating = true;

    const startY    = window.scrollY;
    const targetY   = index * vh;
    const duration  = 750;
    const startTime = performance.now();

    function frame(now) {
      const t     = Math.min((now - startTime) / duration, 1);
      const y     = startY + (targetY - startY) * ease(t);
      window.scrollTo(0, y);
      sections.forEach((_, i) => {
        applyProgress(i, Math.max(0, Math.min(1, (y - i * vh) / vh)));
      });
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        currentIndex = index;
        isAnimating  = false;
      }
    }

    requestAnimationFrame(frame);
  }

  // Snap to nearest section on load
  const nearest = Math.round(window.scrollY / vh);
  currentIndex = Math.max(0, Math.min(nearest, sections.length - 1));
  sections.forEach((_, i) => {
    applyProgress(i, Math.max(0, Math.min(1, (window.scrollY - i * vh) / vh)));
  });

  // Wheel
  window.addEventListener('wheel', e => {
    e.preventDefault();
    if (isAnimating) return;
    goTo(e.deltaY > 0 ? currentIndex + 1 : currentIndex - 1);
  }, { passive: false });

  // Keyboard arrows
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(currentIndex + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(currentIndex - 1); }
  });

  // Touch
  let touchY = 0;
  window.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend',   e => {
    if (isAnimating) return;
    const diff = touchY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initCsSectionSlide();
  initCsLightbox();
});
