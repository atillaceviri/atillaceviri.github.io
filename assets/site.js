(function () {
  'use strict';

  const PAGE_BASE = document.documentElement.dataset.base || './';
  const CURRENT_PAGE = document.documentElement.dataset.page || 'home';
  const LATEST_ANNOUNCEMENT_ID = '2026-11-22-tow-v11';

  // 1. Legacy single-page hash redirect (preserves old forum / Steam links)
  if (CURRENT_PAGE === 'home' && window.location.hash) {
    const legacyHashes = {
      '#outerworlds': 'outer-worlds/',
      '#outerworlds-surum-notlari': 'outer-worlds/#outerworlds-surum-notlari',
      '#outerworlds-kurulum': 'outer-worlds/#outerworlds-kurulum',
      '#codevein': 'code-vein/',
      '#codevein-surum-notlari': 'code-vein/#codevein-surum-notlari',
      '#codevein-kurulum': 'code-vein/#codevein-kurulum',
      '#expanse': 'the-expanse/',
      '#dlc-section': 'the-expanse/#dlc-section',
      '#expanse-surum-notlari': 'the-expanse/#expanse-surum-notlari',
      '#surum-notlari': 'the-expanse/#expanse-surum-notlari',
      '#kurulum-rehberi': 'the-expanse/#kurulum-rehberi',
      '#evilwest': 'evil-west/',
      '#duyurular': 'duyurular/'
    };
    const redirectTarget = legacyHashes[window.location.hash.toLowerCase()];
    if (redirectTarget) {
      window.location.replace(PAGE_BASE + redirectTarget);
      return;
    }
  }

  // 2. Dynamic Wallpaper Engine
  const bgPortal = document.getElementById('bg-portal');
  const bgExpanse = document.getElementById('bg-expanse');
  const bgDlc = document.getElementById('bg-dlc');
  const bgCodevein = document.getElementById('bg-codevein');
  const bgOuterworlds = document.getElementById('bg-outerworlds');
  const bgEvilwest = document.getElementById('bg-evilwest');

  let currentMode = CURRENT_PAGE === 'home' || CURRENT_PAGE === 'duyurular' ? 'portal' : (CURRENT_PAGE === 'the-expanse' ? 'expanse' : CURRENT_PAGE);
  let isManualNavigating = false;
  let navTimeout = null;

  function applyBackgroundEl(el, active) {
    if (!el) return;
    if (active) {
      if (el.dataset && el.dataset.bg && !el.style.backgroundImage) {
        el.style.backgroundImage = "url('" + el.dataset.bg + "')";
      }
      el.style.opacity = '1';
      el.style.transform = 'scale(1.0)';
    } else {
      el.style.opacity = '0';
      el.style.transform = 'scale(1.02)';
    }
  }

  function switchBackground(mode) {
    if (!mode || currentMode === mode) return;
    const layers = [
      { el: bgPortal, name: 'portal' },
      { el: bgExpanse, name: 'expanse' },
      { el: bgDlc, name: 'dlc' },
      { el: bgCodevein, name: 'codevein' },
      { el: bgOuterworlds, name: 'outerworlds' },
      { el: bgEvilwest, name: 'evilwest' }
    ];
    if (!layers.some(l => l.el && l.name === mode)) return;
    currentMode = mode;
    layers.forEach(({ el, name }) => applyBackgroundEl(el, name === mode));
  }

  function setPortalTheme(theme, skipScrollReset) {
    const allowed = ['cyberpunk', 'witcher', 'rdr2', 'detroit'];
    if (!allowed.includes(theme)) return;
    if (bgPortal) {
      bgPortal.style.backgroundImage = "url('" + PAGE_BASE + 'images/bg_' + theme + ".webp')";
    }
    allowed.forEach(t => {
      const btn = document.getElementById('btn-' + t);
      if (!btn) return;
      if (t === theme) {
        btn.className = 'px-3.5 py-1.5 rounded-lg font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 transition';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
      }
    });
    try { localStorage.setItem('atillaceviri_portal_theme', theme); } catch (e) {}
    if (!skipScrollReset) switchBackground('portal');
  }

  // Restore saved portal theme if present
  try {
    const savedTheme = localStorage.getItem('atillaceviri_portal_theme');
    if (savedTheme && bgPortal) setPortalTheme(savedTheme, true);
  } catch (e) {}

  // 3. Smooth Section Navigation
  function smoothScrollTo(elementId, bgMode) {
    if (bgMode) switchBackground(bgMode);
    isManualNavigating = true;
    clearTimeout(navTimeout);
    navTimeout = setTimeout(() => { isManualNavigating = false; }, 1100);

    const targetEl = document.getElementById(elementId);
    if (targetEl) {
      const headerOffset = 75;
      const offsetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }

  function goToSection(elementId, bgMode, e) {
    const targetEl = document.getElementById(elementId);
    if (targetEl) {
      if (e && e.preventDefault) e.preventDefault();
      smoothScrollTo(elementId, bgMode);
    }
  }

  function scrollToTop() {
    isManualNavigating = true;
    clearTimeout(navTimeout);
    navTimeout = setTimeout(() => { isManualNavigating = false; }, 1000);
    if (bgPortal) switchBackground('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 4. Mobile Menu
  function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    const openIcon = document.getElementById('icon-menu-open');
    const closeIcon = document.getElementById('icon-menu-close');
    if (!menu) return;
    const isHidden = menu.classList.toggle('hidden');
    if (btn) btn.setAttribute('aria-expanded', String(!isHidden));
    if (openIcon) openIcon.classList.toggle('hidden', !isHidden);
    if (closeIcon) closeIcon.classList.toggle('hidden', isHidden);
  }

  function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    const openIcon = document.getElementById('icon-menu-open');
    const closeIcon = document.getElementById('icon-menu-close');
    if (menu && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (openIcon) openIcon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
    }
  }

  // 5. Announcements (Top Bar + Badge + Filter)
  function dismissTopAnnouncement() {
    const bar = document.getElementById('top-announcement-bar');
    if (bar) bar.classList.add('hidden');
    try { localStorage.setItem('atillaceviri_dismissed_ann', LATEST_ANNOUNCEMENT_ID); } catch (e) {}
  }

  function markAnnouncementsSeen() {
    ['nav-ann-badge', 'mobile-ann-badge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    try { localStorage.setItem('atillaceviri_seen_ann', LATEST_ANNOUNCEMENT_ID); } catch (e) {}
  }

  function filterAnnouncements(type) {
    ['all', 'update', 'release', 'status'].forEach(t => {
      const btn = document.getElementById('ann-filter-' + t);
      if (!btn) return;
      if (t === type) {
        btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-brand-cyan transition cursor-pointer';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer';
      }
    });
    document.querySelectorAll('[data-ann-card]').forEach(card => {
      const cardType = card.dataset.annType || '';
      card.classList.toggle('hidden', type !== 'all' && cardType !== type);
    });
  }

  (function initAnnouncements() {
    try {
      if (localStorage.getItem('atillaceviri_dismissed_ann') === LATEST_ANNOUNCEMENT_ID) {
        const bar = document.getElementById('top-announcement-bar');
        if (bar) bar.classList.add('hidden');
      }
      if (CURRENT_PAGE === 'duyurular') {
        markAnnouncementsSeen();
      } else if (localStorage.getItem('atillaceviri_seen_ann') === LATEST_ANNOUNCEMENT_ID) {
        ['nav-ann-badge', 'mobile-ann-badge'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.add('hidden');
        });
      }
    } catch (e) {}
  })();

  // 6. Catalog Filter & Instant Search (Home)
  let activeCatalogFilter = 'all';
  function setCatalogFilter(status) {
    activeCatalogFilter = status;
    ['all', 'live', 'upcoming'].forEach(f => {
      const btn = document.getElementById('filter-' + f);
      if (!btn) return;
      if (f === status) {
        btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-brand-cyan transition cursor-pointer';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer';
      }
    });
    filterCatalog();
  }

  function filterCatalog() {
    const q = (document.getElementById('catalog-search')?.value || '').toLocaleLowerCase('tr-TR').trim();
    const cards = document.querySelectorAll('[data-project-card]');
    if (!cards.length) return;
    let visible = 0;
    cards.forEach(card => {
      const st = card.dataset.status || '';
      const text = (card.dataset.search || '').toLocaleLowerCase('tr-TR');
      const statusOk = activeCatalogFilter === 'all' || st === activeCatalogFilter;
      const queryOk = !q || text.includes(q);
      if (statusOk && queryOk) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });
    const emptyEl = document.getElementById('catalog-empty');
    if (emptyEl) emptyEl.classList.toggle('hidden', visible > 0);
  }

  function resetCatalogFilter() {
    const input = document.getElementById('catalog-search');
    if (input) input.value = '';
    setCatalogFilter('all');
  }

  // 7. FAQ Accordion
  function toggleFaq(btn) {
    const card = btn && btn.parentElement;
    if (!card) return;
    const body = card.querySelector('.faq-body');
    const chevron = btn.querySelector('.faq-chevron');
    if (!body) return;
    const isHidden = body.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!isHidden));
    if (chevron) chevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
  }

  // 8. Lightbox & Legal Modal
  function openLightbox(src, caption) {
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    const box = document.getElementById('lightbox');
    if (!img || !box) return;
    img.src = src;
    if (cap) cap.textContent = caption || '';
    box.classList.add('active');
  }

  function closeLightbox() {
    const box = document.getElementById('lightbox');
    if (box) box.classList.remove('active');
  }

  function openLegalModal() {
    const modal = document.getElementById('legal-modal');
    if (modal) modal.classList.add('active');
  }

  function closeLegalModal() {
    const modal = document.getElementById('legal-modal');
    if (modal) modal.classList.remove('active');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeLegalModal();
      closeMobileMenu();
    }
  });

  // 9. Back to Top & Background Reset on Scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      if (scrollY > 500) {
        backToTopBtn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
        backToTopBtn.classList.add('opacity-100', 'translate-y-0');
      } else {
        backToTopBtn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        backToTopBtn.classList.remove('opacity-100', 'translate-y-0');
      }
    }
    if (!isManualNavigating && CURRENT_PAGE === 'home' && scrollY < 280) {
      switchBackground('portal');
    }
  });

  // 10. Clipboard Helpers & Toast
  function showToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.remove('translate-y-28', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
    }, 4000);
  }

  function copyEmail(e, btn) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const email = 'atillaceviri@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email);
    } else {
      const temp = document.createElement('textarea');
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    if (btn) {
      const label = btn.querySelector('.btn-label') || btn.querySelector('span');
      if (label && !btn.dataset.originalText) btn.dataset.originalText = label.innerHTML;
      if (label) label.innerHTML = '✓ Kopyalandı!';
      btn.classList.add('border-emerald-500/60', 'text-emerald-300');
      clearTimeout(btn._resetTimer);
      btn._resetTimer = setTimeout(() => {
        if (label && btn.dataset.originalText) label.innerHTML = btn.dataset.originalText;
        btn.classList.remove('border-emerald-500/60', 'text-emerald-300');
      }, 2200);
    }
    showToast();
  }

  function copyHash(hash, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hash);
    } else {
      const temp = document.createElement('textarea');
      temp.value = hash;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    if (btn) {
      const label = btn.querySelector('.hash-label');
      if (label && !btn.dataset.origLabel) btn.dataset.origLabel = label.textContent;
      if (label) label.textContent = '✓ SHA-256 Kopyalandı!';
      clearTimeout(btn._hashTimer);
      btn._hashTimer = setTimeout(() => {
        if (label && btn.dataset.origLabel) label.textContent = btn.dataset.origLabel;
      }, 2200);
    }
  }

  // 11. Live GitHub Releases Download Counter (cached 10 min)
  (async function loadDownloadCounts() {
    const badges = ['dl-count-outerworlds', 'dl-count-codevein', 'dl-count-expanse']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!badges.length) return;

    const cacheKey = 'atillaceviri_gh_releases_v3';
    let releases = null;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < 10 * 60 * 1000) releases = parsed.data;
      }
    } catch (e) {}

    if (!releases) {
      try {
        const res = await fetch('https://api.github.com/repos/atillaceviri/atillaceviri.github.io/releases');
        if (res.ok) {
          releases = await res.json();
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: releases })); } catch (e) {}
        }
      } catch (e) { return; }
    }
    if (!Array.isArray(releases)) return;

    const map = {
      'outerworlds-v1.0': 'dl-count-outerworlds',
      'outerworlds-v1.1': 'dl-count-outerworlds',
      'codevein-v1.0': 'dl-count-codevein',
      'expanse-v1.0': 'dl-count-expanse'
    };
    const totals = {};
    for (const rel of releases) {
      const targetId = map[rel.tag_name];
      if (!targetId) continue;
      const count = (rel.assets || []).reduce((sum, a) => sum + (a.download_count || 0), 0);
      totals[targetId] = (totals[targetId] || 0) + count;
    }
    for (const [targetId, total] of Object.entries(totals)) {
      const el = document.getElementById(targetId);
      if (el && total > 0) {
        el.textContent = '⬇ ' + total.toLocaleString('tr-TR') + ' İndirme';
        el.classList.remove('hidden');
      }
    }
  })();

  // Expose inline HTML handlers globally
  window.switchBackground = switchBackground;
  window.setPortalTheme = setPortalTheme;
  window.smoothScrollTo = smoothScrollTo;
  window.goToSection = goToSection;
  window.scrollToTop = scrollToTop;
  window.toggleMobileMenu = toggleMobileMenu;
  window.closeMobileMenu = closeMobileMenu;
  window.dismissTopAnnouncement = dismissTopAnnouncement;
  window.markAnnouncementsSeen = markAnnouncementsSeen;
  window.filterAnnouncements = filterAnnouncements;
  window.setCatalogFilter = setCatalogFilter;
  window.filterCatalog = filterCatalog;
  window.resetCatalogFilter = resetCatalogFilter;
  window.toggleFaq = toggleFaq;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.openLegalModal = openLegalModal;
  window.closeLegalModal = closeLegalModal;
  window.copyEmail = copyEmail;
  window.copyHash = copyHash;
})();
