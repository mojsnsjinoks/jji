/**
 * Chef Leo Character State & Avatar Controller
 *
 * Manages Chef Leo's 2D cartoon character states:
 * - idle      (default)                   → assets/chef-idle.png
 * - thinking  (waiting for AI response)   → assets/chef-thinking.png
 * - happy     (successful recommendation) → assets/chef-happy.png
 * - confused  (error/no match)            → falls back to assets/chef-idle.png
 *                                            until a dedicated confused asset exists.
 *
 * State transitions use a CSS opacity fade (via the .chef-avatar-fading class).
 * The container size stays fixed, so no layout shift occurs.
 */

const CHEF_STATES = {
  idle: {
    filename: 'assets/chef-idle.png',
    statusText: 'شيف ليو جاهز لمساعدتك 👨‍🍳',
    badgeColor: '#e6c875',
    emoji: '👨‍🍳',
    bgColor: '#1e2638'
  },
  thinking: {
    filename: 'assets/chef-thinking.png',
    statusText: 'شيف ليو بيحضر لك أحلى الاقتراحات... 🤔',
    badgeColor: '#60a5fa',
    emoji: '🤔',
    bgColor: '#1e293b'
  },
  happy: {
    filename: 'assets/chef-happy.png',
    statusText: 'بالهنا والشفا! دي أحلى أكلات تناسب طلبك 😋🎉',
    badgeColor: '#4ade80',
    emoji: '😋',
    bgColor: '#14532d'
  },
  // No dedicated confused PNG yet — falls back to chef-idle.png gracefully.
  confused: {
    filename: 'assets/chef-idle.png',
    statusText: 'معلش مقدرتش أفهم قصدك بالظبط، جرب توضح لي أكتر! 😅',
    badgeColor: '#f87171',
    emoji: '😅',
    bgColor: '#7f1d1d'
  }
};

let currentState = 'idle';

/**
 * Creates SVG fallback data URI for Chef Leo character state
 */
function createChefSvgPlaceholder(stateKey) {
  const config = CHEF_STATES[stateKey] || CHEF_STATES.idle;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.bgColor}" />
        <stop offset="100%" stop-color="#0b0e14" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#e6c875" />
        <stop offset="100%" stop-color="#f3e5ab" />
      </linearGradient>
    </defs>
    <!-- Background Circle -->
    <circle cx="100" cy="100" r="92" fill="url(#bgGrad)" stroke="${config.badgeColor}" stroke-width="4"/>
    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(230,200,117,0.2)" stroke-width="2" stroke-dasharray="6,4"/>
    
    <!-- Chef Jacket Body -->
    <path d="M 50 170 C 50 135, 150 135, 150 170 L 150 190 L 50 190 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
    <path d="M 85 140 L 100 175 L 115 140" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Red Scarf / Apron Detail -->
    <path d="M 80 138 C 90 148, 110 148, 120 138 L 100 160 Z" fill="#ef4444"/>
    <!-- Gold Buttons -->
    <circle cx="90" cy="165" r="3.5" fill="#d4af37"/>
    <circle cx="110" cy="165" r="3.5" fill="#d4af37"/>

    <!-- Head -->
    <circle cx="100" cy="105" r="35" fill="#ffdfc4"/>
    
    <!-- Eyes -->
    ${stateKey === 'thinking' ? `
      <circle cx="88" cy="98" r="4" fill="#1e293b"/>
      <circle cx="112" cy="94" r="5" fill="#1e293b"/>
    ` : stateKey === 'happy' ? `
      <path d="M 82 98 Q 88 90 94 98" fill="none" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 106 98 Q 112 90 118 98" fill="none" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
    ` : stateKey === 'confused' ? `
      <circle cx="86" cy="98" r="5" fill="#1e293b"/>
      <line x1="106" y1="94" x2="118" y2="102" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
    ` : `
      <circle cx="86" cy="98" r="4" fill="#1e293b"/>
      <circle cx="114" cy="98" r="4" fill="#1e293b"/>
    `}

    <!-- Mustache -->
    <path d="M 100 110 C 85 105, 75 116, 70 114 C 78 122, 95 118, 100 113 C 105 118, 122 122, 130 114 C 125 116, 115 105, 100 110 Z" fill="#475569"/>

    <!-- Mouth -->
    ${stateKey === 'happy' ? `
      <path d="M 90 120 Q 100 130 110 120 Z" fill="#ef4444"/>
    ` : stateKey === 'confused' ? `
      <path d="M 92 124 Q 100 118 108 124" fill="none" stroke="#1e293b" stroke-width="3"/>
    ` : `
      <path d="M 93 120 Q 100 125 107 120" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
    `}

    <!-- Chef Hat -->
    <path d="M 68 80 C 60 40, 140 40, 132 80 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
    <rect x="72" y="74" width="56" height="12" rx="4" fill="url(#goldGrad)"/>
    <text x="100" y="83" font-size="7" font-weight="bold" fill="#000" text-anchor="middle" font-family="sans-serif">CHEF LEO</text>

    <!-- Emoji Badge -->
    <circle cx="155" cy="45" r="20" fill="#0b0e14" stroke="${config.badgeColor}" stroke-width="2.5"/>
    <text x="155" y="52" font-size="18" text-anchor="middle">${config.emoji}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/**
 * Sets Chef Leo's state ('idle', 'thinking', 'happy', 'confused')
 *
 * Performs a smooth opacity crossfade between images so the layout
 * never shifts (the wrapper keeps its fixed dimensions throughout).
 *
 * @param {string} state - Desired state name
 */
function setChefState(state) {
  if (!CHEF_STATES[state]) state = 'idle';
  currentState = state;

  const imgEl = document.getElementById('chef-avatar-img');
  const statusBadgeEl = document.getElementById('chef-status-badge');
  const config = CHEF_STATES[state];

  // Update status badge
  if (statusBadgeEl) {
    statusBadgeEl.textContent = config.statusText;
    statusBadgeEl.style.borderColor = config.badgeColor;
  }

  if (imgEl) {
    // --- Fade-out → swap src → fade-in sequence ---
    imgEl.style.opacity = '0';

    // Wait for fade-out to complete (matches CSS transition duration)
    setTimeout(() => {
      imgEl.onerror = () => {
        // PNG not found yet — fall back to the SVG placeholder
        imgEl.src = createChefSvgPlaceholder(state);
        imgEl.style.opacity = '1';
      };

      // Swap to the new state image
      imgEl.src = config.filename;

      // Update animation class for the new state
      imgEl.className = 'chef-avatar-img chef-state-' + state;

      // Fade back in once the image is ready
      imgEl.onload = () => { imgEl.style.opacity = '1'; };

      // Safety net: if the browser skips onload (cached image), fade in anyway
      setTimeout(() => { imgEl.style.opacity = '1'; }, 50);
    }, 200); // match the CSS transition: opacity 0.2s
  }
}

/**
 * Initializes Chef Leo character avatar
 */
function initChefCharacter() {
  setChefState('idle');
}

// Attach to window object for frontend accessibility
if (typeof window !== 'undefined') {
  window.setChefState = setChefState;
  window.initChefCharacter = initChefCharacter;
}

if (typeof module !== 'undefined') {
  module.exports = { setChefState, CHEF_STATES, createChefSvgPlaceholder };
}
