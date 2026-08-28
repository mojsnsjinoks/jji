/* ==========================================================================
   BURGER HOUSE — ENGINE & INSTANT FRAME 001 ANIMATION PRELOADER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderNav();
    initHeroScrollAnimation();
    initMenuSection();
    if (typeof window.initChefCharacter === 'function') window.initChefCharacter();
    initChefLeoChat();
});

/* --------------------------------------------------------------------------
   1. HEADER & MOBILE DRAWER NAVIGATION
   -------------------------------------------------------------------------- */
function initHeaderNav() {
    const header = document.getElementById('site-header');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });

    const toggleMobileNav = (open) => {
        if (open) {
            mobileNav?.classList.add('open');
            mobileNavOverlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileNav?.classList.remove('open');
            mobileNavOverlay?.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    hamburgerBtn?.addEventListener('click', () => toggleMobileNav(true));
    mobileNavClose?.addEventListener('click', () => toggleMobileNav(false));
    mobileNavOverlay?.addEventListener('click', () => toggleMobileNav(false));

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMobileNav(false));
    });
}

/* --------------------------------------------------------------------------
   2. HERO SCROLL-DRIVEN FRAME VIDEO ANIMATION (100vw x 100vh EDGE-TO-EDGE)
   -------------------------------------------------------------------------- */
function initHeroScrollAnimation() {
    const canvas = document.getElementById('hero-canvas');
    const heroWrapper = document.getElementById('hero-scroll-wrapper');
    const loaderOverlay = document.getElementById('hero-loader');

    if (!canvas || !heroWrapper) return;

    const ctx = canvas.getContext('2d');
    const TOTAL_FRAMES = 300;
    const FRAME_FOLDER = './ezgif-61f464986be5122c-jpg/';
    const frameImages = new Array(TOTAL_FRAMES);
    let currentFrameIndex = 0;
    let isTicking = false;

    const getFrameUrl = (index) => {
        const paddedNum = String(index + 1).padStart(3, '0');
        return `${FRAME_FOLDER}ezgif-frame-${paddedNum}.jpg`;
    };

    // Draw image to fill full 100vw x 100vh canvas with object-fit: cover
    const drawCanvasImage = (img) => {
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const cWidth = canvas.width;
        const cHeight = canvas.height;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const ratio = Math.max(cWidth / imgWidth, cHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        const offsetX = (cWidth - newWidth) / 2;
        const offsetY = (cHeight - newHeight) / 2;

        ctx.fillStyle = '#0B0E14';
        ctx.fillRect(0, 0, cWidth, cHeight);
        ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
    };

    // Find nearest loaded frame if target frame is still downloading
    const findNearestLoadedFrame = (targetIndex) => {
        if (frameImages[targetIndex]?.complete && frameImages[targetIndex]?.naturalWidth > 0) {
            return frameImages[targetIndex];
        }

        for (let delta = 1; delta < TOTAL_FRAMES; delta++) {
            const prev = targetIndex - delta;
            const next = targetIndex + delta;
            if (prev >= 0 && frameImages[prev]?.complete && frameImages[prev]?.naturalWidth > 0) {
                return frameImages[prev];
            }
            if (next < TOTAL_FRAMES && frameImages[next]?.complete && frameImages[next]?.naturalWidth > 0) {
                return frameImages[next];
            }
        }
        return frameImages[0];
    };

    const renderFrame = (index) => {
        const img = findNearestLoadedFrame(index);
        drawCanvasImage(img);
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
        canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
        renderFrame(currentFrameIndex);
    };

    // PRIORITY 1: Load and display Frame 001 IMMEDIATELY
    const loadFirstFrameThenBackgroundPreload = () => {
        const firstImg = new Image();
        firstImg.src = getFrameUrl(0);
        
        firstImg.onload = () => {
            frameImages[0] = firstImg;
            renderFrame(0);
            if (loaderOverlay) {
                loaderOverlay.classList.add('hidden');
                loaderOverlay.style.display = 'none';
            }
            // PRIORITY 2 & 3: Preload remaining frames progressively in background
            preloadRemainingFrames();
        };

        firstImg.onerror = () => {
            preloadRemainingFrames();
        };
    };

    const preloadRemainingFrames = () => {
        for (let i = 1; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getFrameUrl(i);
            img.onload = () => {
                frameImages[i] = img;
                if (i === currentFrameIndex) {
                    renderFrame(currentFrameIndex);
                }
            };
            img.onerror = () => {
                frameImages[i] = frameImages[0];
            };
        }
    };

    const updateScrollFrame = () => {
        const rect = heroWrapper.getBoundingClientRect();
        const scrollableDistance = heroWrapper.clientHeight - window.innerHeight;
        
        if (scrollableDistance <= 0) return;

        const currentScroll = Math.max(0, -rect.top);
        const progress = Math.min(1, Math.max(0, currentScroll / scrollableDistance));

        const targetFrameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
        );

        if (targetFrameIndex !== currentFrameIndex) {
            currentFrameIndex = targetFrameIndex;
            renderFrame(currentFrameIndex);
        }

        isTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            requestAnimationFrame(updateScrollFrame);
            isTicking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    loadFirstFrameThenBackgroundPreload();
}

/* --------------------------------------------------------------------------
   3. AR MENU SECTION (INTEGRATED FROM index2.html)
   -------------------------------------------------------------------------- */
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS404mMlowqwF5q4go361vc__sHIW45Ys3aoibkjzpeYFufGX6vB-d-yUHM9AAjcWzhAdVhFLvJgf-Z/pub?gid=157455087&single=true&output=csv';
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const catEmoji = { 'برجر': '🍔', 'بيتزا': '🍕', 'مشويات': '🥩', 'مشروبات': '🧃', 'حلويات': '🍮', 'مقبلات': '🥗', 'سوشي': '🍣', 'لحوم': '🍖' };

const fallbackMenu = [
    {
        id: 0,
        name: "برجر تشيز أرستقراطي",
        price: "180",
        desc: "برجر لحم بلاك أنجوس مشوي على الفحم مع جبنة شيدر سويسرية",
        glb: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/untitled.glb",
        usdz: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/Chicken_Sandwich.usdz",
        cat: "برجر"
    },
    {
        id: 1,
        name: "ساندوتش زنجر آرتيزان",
        price: "310",
        desc: "دجاج مقرمش بخلطة الأعشاب الإيطالية وصوص الشيدر الذائب",
        glb: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/untitled1.glb",
        usdz: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/untitled.usdc",
        cat: "لحوم"
    },
    {
        id: 2,
        name: "بيتزا مارجريتا الفاخرة",
        price: "150",
        desc: "عجينة إيطالية مخمرة 48 ساعة مع موتزاريلا طازجة وريحان",
        glb: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/untitled2.glb",
        usdz: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/untitled1.usdc",
        cat: "بيتزا"
    },
    {
        id: 3,
        name: "كابوتشينو دبل إسباني",
        price: "30",
        desc: "قهوة إيطالية فاخرة محمصة بعناية مع رغوة الحليب المبخر",
        glb: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/cup_of_cappuccino.glb",
        usdz: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/Cup_of_cappuccino%20(1).usdz",
        cat: "مشروبات"
    },
    {
        id: 4,
        name: "سوشي قارب نيجيري",
        price: "368",
        desc: "تشكيلة سوشي طازجة مع صوص السيراتشا الحار",
        glb: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/sushi_boat_nigiri%20(1).glb",
        usdz: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/Sushi_Boat_Nigiri.usdz",
        cat: "سوشي"
    },
    {
        id: 5,
        name: "ساكورا كيك رول",
        price: "123",
        desc: "كيك كريمة ياباني بنكهة الساكورا والفراولة الطازجة",
        glb: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/sakura_cake_roll.glb",
        usdz: "https://cdn.jsdelivr.net/gh/mojsnsjinoks/klkmmm-@main/Sakura_Cake_Roll.usdz",
        cat: "حلويات"
    }
];

let allMenuItems = [];
let currentCat = 'all';

async function initMenuSection() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    try {
        const res = await fetch(`${CSV_URL}&t=${Date.now()}`);
        if (!res.ok) throw new Error("CSV Fetch failed");
        const text = await res.text();
        const rows = text.split('\n').filter(r => r.trim());

        if (rows.length > 1) {
            allMenuItems = rows.slice(1).map((row, i) => {
                const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                return {
                    id: i,
                    name: (cols[0] || '').replace(/"/g, '').trim(),
                    price: (cols[1] || '').trim(),
                    desc: (cols[2] || '').replace(/"/g, '').trim(),
                    glb: (cols[3] || '').trim(),
                    usdz: (cols[4] || '').trim(),
                    cat: (cols[5] || 'عام').trim(),
                };
            }).filter(i => i.name);
        } else {
            allMenuItems = fallbackMenu;
        }
    } catch (e) {
        console.warn("Using offline fallback menu data", e);
        allMenuItems = fallbackMenu;
    }

    buildCategories();
    applyFilters();

    const loader = document.getElementById('loader');
    const mainContainer = document.getElementById('main-container');
    if (loader) loader.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'block';
}

function buildCategories() {
    const catBar = document.getElementById('cat-bar');
    if (!catBar) return;

    catBar.innerHTML = `<button class="cat-btn active" onclick="setCategory('all', this)">الكل</button>`;

    const cats = [...new Set(allMenuItems.map(i => i.cat))];
    cats.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        btn.textContent = `${catEmoji[c] || '🍔'} ${c}`;
        btn.onclick = function() { setCategory(c, this); };
        catBar.appendChild(btn);
    });
}

window.setCategory = function(cat, btn) {
    currentCat = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
};

function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = allMenuItems;
    if (currentCat !== 'all') {
        filtered = filtered.filter(i => i.cat === currentCat);
    }
    if (query) {
        filtered = filtered.filter(i => i.name.toLowerCase().includes(query) || i.desc.toLowerCase().includes(query));
    }

    renderMenuItems(filtered);
}

function renderMenuItems(items) {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">لا توجد عناصر تطابق بحثك</div>`;
        return;
    }

    grid.innerHTML = items.map((item) => {
        const hasGlb = item.glb && item.glb.startsWith('http');
        const hasUsdz = item.usdz && item.usdz.startsWith('http');

        return `
        <div class="menu-card">
            <div class="menu-card-img">
                ${hasGlb ? `
                <model-viewer src="${item.glb}" 
                    ${hasUsdz ? `ios-src="${item.usdz}"` : ''}
                    ar ar-modes="scene-viewer webxr quick-look" 
                    ar-scale="fixed" 
                    camera-controls auto-rotate 
                    shadow-intensity="1.5" shadow-softness="0.5"
                    environment-image="neutral"
                    loading="lazy">
                </model-viewer>` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:40px;">🍔</div>`}
                
                ${(hasGlb || (isIOS && hasUsdz)) ? `
                <a class="ar-icon-btn" href="#" title="معاينة بالواقع المعزز AR"
                   onclick="startAR(event, '${item.glb}', '${item.usdz}', '${item.name}')">
                    <svg viewBox="0 0 24 24"><path d="M12,2L2,7V17L12,22L22,17V7L12,2M12,4.1L19.8,8L12,11.9L4.2,8L12,4.1M4,15.9V9.1L11,12.6V19.4L4,15.9M13,19.4V12.6L20,9.1V15.9L13,19.4Z"/></svg>
                </a>` : ''}
            </div>
            <div class="menu-card-info">
                <h3>${item.name}</h3>
                <div class="menu-card-desc">${item.desc || 'وجبة فاخرة مصنعة يدويًا بأجود المكونات'}</div>
                <div class="menu-card-footer">
                    <div class="menu-price">${item.price} <em>ج.م</em></div>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.startAR = function(e, glb, usdz, name) {
    e.preventDefault();
    if (isIOS && usdz) {
        const anchor = document.createElement('a');
        anchor.setAttribute('rel', 'ar');
        anchor.setAttribute('href', usdz);
        anchor.appendChild(document.createElement('img'));
        anchor.click();
    } else {
        const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glb)}&mode=ar_only&title=${encodeURIComponent(name)}&resizable=true&enable_vertical_placement=false#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(glb)};end;`;
        window.location.href = intent;
    }
};

/* --------------------------------------------------------------------------
   4. CHEF LEO AI ARABIC CHAT EXPERIENCE (GEMINI 1.5 FLASH)
   -------------------------------------------------------------------------- */
function initChefLeoChat() {
    const chatForm = document.getElementById('chef-chat-form');
    const chatInput = document.getElementById('chat-user-input');
    const chatThread = document.getElementById('chat-thread');
    const sendBtn = document.getElementById('chat-send-btn');

    if (!chatForm || !chatInput || !chatThread) return;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMsg = chatInput.value.trim();
        if (!userMsg) return;

        // Clear input field
        chatInput.value = '';

        // 1. Append User Message Bubble
        appendUserMessage(userMsg);

        // 2. Set Chef State: 'thinking'
        if (typeof window.setChefState === 'function') {
            window.setChefState('thinking');
        }

        // 3. Append Chef Typing Indicator Bubble
        const typingId = appendTypingIndicator();
        if (sendBtn) sendBtn.disabled = true;

        try {
            const response = await fetch('/api/menu-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg })
            });

            const data = await response.json();
            removeTypingIndicator(typingId);

            if (!response.ok || !data.success) {
                // Set Chef State: 'confused'
                if (typeof window.setChefState === 'function') {
                    window.setChefState('confused');
                    setTimeout(() => window.setChefState('idle'), 4000);
                }
                const errorMsg = data?.message || 'معلش، مقدرتش أفهم طلبك، ممكن تجرب توضحه أكتر؟ 😅';
                appendChefMessage(errorMsg, []);
                return;
            }

            // Set Chef State: 'happy'
            if (typeof window.setChefState === 'function') {
                window.setChefState('happy');
                setTimeout(() => window.setChefState('idle'), 3500);
            }

            const recs = data.recommendations || [];

            // Case A: Just a greeting or general message (no recommendations)
            if (recs.length === 0) {
                const greetingText = data.greeting || 'أهلاً بيك في مطعمنا يا فندم! 👨‍🍳 تحب أرشحلك ايه النهاردة؟';
                appendChefMessage(greetingText, []);
                return;
            }

            // Case B: Clear food request with dish recommendations
            const totalPrice = recs.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
            const introCopy = data.greeting || `أتفضل يا فندم! بناءً على طلبك، اخترت لك <strong>${recs.length} أطباق</strong> مميزة من المنيو بتاعنا، بإجمالي <strong>${totalPrice} جنيه</strong>:`;

            appendChefMessage(introCopy, recs);

        } catch (err) {
            console.error('Chef Leo Chat Error:', err);
            removeTypingIndicator(typingId);

            if (typeof window.setChefState === 'function') {
                window.setChefState('confused');
                setTimeout(() => window.setChefState('idle'), 4000);
            }

            appendChefMessage('معلش، مقدرتش أفهم طلبك، ممكن تجرب توضحه أكتر؟ 😅', []);
        } finally {
            if (sendBtn) sendBtn.disabled = false;
        }
    });

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg user-msg';
        msgDiv.innerHTML = `
            <div class="msg-content">
                <p class="msg-text">${escapeHtml(text)}</p>
            </div>
            <div class="msg-avatar">👤</div>
        `;
        chatThread.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg chef-msg typing-msg';
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="msg-avatar">👨‍🍳</div>
            <div class="msg-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatThread.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function appendChefMessage(introText, recommendations) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg chef-msg';

        let cardsHtml = '';
        if (recommendations && recommendations.length > 0) {
            cardsHtml = recommendations.map(rec => `
                <div class="dish-card">
                    <div class="dish-card-header">
                        <span class="dish-name">${escapeHtml(rec.item_name)}</span>
                        <span class="dish-price">${rec.price} ج.م</span>
                    </div>
                    <div class="dish-category">${escapeHtml(rec.category || '')}</div>
                    <div class="dish-reason">
                        <span class="reason-icon">👨‍🍳 رأي شيف ليو:</span>
                        <p class="reason-text">${escapeHtml(rec.reason)}</p>
                    </div>
                </div>
            `).join('');
        }

        msgDiv.innerHTML = `
            <div class="msg-avatar">👨‍🍳</div>
            <div class="msg-content">
                <p class="msg-text">${introText}</p>
                ${cardsHtml ? `<div class="chef-dish-cards">${cardsHtml}</div>` : ''}
            </div>
        `;

        chatThread.appendChild(msgDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatThread.scrollTop = chatThread.scrollHeight;
    }
}

window.sendQuickPrompt = function(promptText) {
    const input = document.getElementById('chat-user-input');
    const form = document.getElementById('chef-chat-form');
    if (input) {
        input.value = promptText;
        input.focus();
        if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


