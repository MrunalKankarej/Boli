/* ui.js — Reusable DOM component builders */

/* ── Toast ─────────────────────────────────── */
let _toastTimer = null;
function showToast(emoji) {
  const el = document.getElementById('toast');
  el.textContent = emoji;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 900);
}

/* ── Photo Card ─────────────────────────────── */
/**
 * Creates a clickable photo card element.
 * @param {object} opts
 *   img, title, emoji, color, badge, cornerContent,
 *   height (px), extraClass, onClick
 */
function createPhotoCard({ img, title, emoji, color, badge, cornerContent, height = 160, extraClass = '', onClick }) {
  const card = document.createElement('div');
  card.className = `photo-card ${extraClass}`;
  card.style.borderColor = color;

  // shimmer placeholder
  const shimmer = document.createElement('div');
  shimmer.className = 'card-shimmer';
  shimmer.style.height = height + 'px';
  card.appendChild(shimmer);

  // image
  const imgEl = document.createElement('img');
  imgEl.src    = img;
  imgEl.alt    = title;
  imgEl.style.height  = height + 'px';
  imgEl.style.display = 'none';
  imgEl.addEventListener('load', () => {
    shimmer.remove();
    imgEl.style.display = 'block';
  });
  card.appendChild(imgEl);

  // gradient overlay
  const overlay = document.createElement('div');
  overlay.className = 'card-overlay';
  card.appendChild(overlay);

  // bottom content
  const content = document.createElement('div');
  content.className = 'card-content';

  if (badge) {
    const badgeEl = document.createElement('div');
    badgeEl.className = 'card-badge';
    badgeEl.style.background  = color + '33';
    badgeEl.style.color       = 'white';
    badgeEl.style.border      = `1px solid ${color}66`;
    badgeEl.innerHTML = `<span>${emoji}</span><span>${badge}</span>`;
    content.appendChild(badgeEl);
  }

  const titleEl = document.createElement('div');
  titleEl.className   = 'card-title';
  titleEl.textContent = title;
  content.appendChild(titleEl);
  card.appendChild(content);

  // corner decoration
  if (cornerContent) {
    const corner = document.createElement('div');
    corner.className   = 'card-corner';
    corner.textContent = cornerContent;
    card.appendChild(corner);
  }

  if (onClick) card.addEventListener('click', onClick);
  return card;
}

/* ── Top Navigation Bar ─────────────────────── */
/**
 * Renders a top nav bar into container.
 * @param {HTMLElement} container
 * @param {object} opts  onBack, progress (0-100), showBack
 */
function renderTopBar(container, { onBack, progress = 0, showBack = true }) {
  container.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = 'top-bar';

  // back button or spacer
  if (showBack) {
    const btn = document.createElement('button');
    btn.className     = 'nav-back';
    btn.setAttribute('aria-label', 'Back');
    btn.innerHTML     = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"/></svg>`;
    btn.addEventListener('click', onBack);
    bar.appendChild(btn);
  } else {
    const spacer = document.createElement('div');
    spacer.style.width = '48px';
    bar.appendChild(spacer);
  }

  // progress bar
  const wrap = document.createElement('div');
  wrap.className = 'progress-bar-wrap';
  const fill = document.createElement('div');
  fill.className    = 'progress-bar-fill';
  fill.style.width  = progress + '%';
  wrap.appendChild(fill);
  bar.appendChild(wrap);

  // globe icon
  const glob = document.createElement('div');
  glob.className   = 'nav-icon';
  glob.textContent = '🌐';
  bar.appendChild(glob);

  container.appendChild(bar);
}

/* ── Screen Header ──────────────────────────── */
function renderScreenHeader(container, { icon, eyebrow }) {
  const hdr = document.createElement('div');
  hdr.className = 'screen-header';
  hdr.innerHTML = `<span class="screen-icon">${icon}</span>
                   <div class="screen-eyebrow">${eyebrow}</div>`;
  container.appendChild(hdr);
}

/* ── Screen transition helpers ──────────────── */
function activateScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'exit');
  });
  const target = document.getElementById(id);
  if (target) {
    // Briefly set entering state, then make active
    target.style.transform  = 'translateX(60px)';
    target.style.opacity    = '0';
    target.style.pointerEvents = 'none';
    requestAnimationFrame(() => {
      target.classList.add('active');
      target.style.transform = '';
      target.style.opacity   = '';
      target.style.pointerEvents = '';
    });
  }
}

function exitScreen(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('exit');
}
