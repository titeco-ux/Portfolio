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

  // Background-image divs (StructureIQ)
  const bgSelectors = [
    '.cs-v1','.cs-v2','.cs-v3','.cs-v4','.cs-v5','.cs-v6','.cs-v7',
    '.cs-siq-1','.cs-siq-raw','.cs-siq-sensor',
    '.cs-siq-img-1','.cs-siq-img-2','.cs-siq-img-3','.cs-siq-img-4',
    '.cs-siq-warn','.cs-siq-alert','.cs-siq-ds','.cs-siq-raw-2',
    '.cs-siq-login','.cs-siq-assets','.cs-siq-assets-2'
  ];
  document.querySelectorAll(bgSelectors.join(',')).forEach(el => {
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

  // <img> tag wrappers (Veturmusic + StructureIQ early)
  document.querySelectorAll('.cs-img-wrap img, .cs-img-inline-wrap img, .cs-siq-early-wrap img, .cs-col-img img, .cs-col-imgs img').forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => {
      img.src = el.src;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCsLightbox();
});
