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

// --- Case study section scroll animation (scale + fade + slide) ---
function initCsSectionSlide() {
  const sections = [...document.querySelectorAll('.s2')];
  if (!sections.length) return;

  const vh = window.innerHeight;

  sections.forEach(s => {
    const inner = s.querySelector('.s2__main');
    if (inner) {
      inner.style.willChange = 'transform, opacity';
      inner.style.transformOrigin = 'top center';
    }
  });

  function update() {
    const scrollY = window.scrollY;
    sections.forEach((section, i) => {
      const inner = section.querySelector('.s2__main');
      if (!inner) return;
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

document.addEventListener('DOMContentLoaded', () => {
  initCsSectionSlide();
  initCsLightbox();
});
