(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var SCRIPT = d.currentScript && d.currentScript.src || '';
  var BASE = SCRIPT.replace(/script\.js.*$/, '');
  var VER = (SCRIPT.match(/[?&]v=([^&]+)/) || [])[1] || '';
  var PAGE = root.getAttribute('data-page') || 'home';
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var RM = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS = !!(w.gsap && w.ScrollTrigger);
  var PHONE = '77778823020';
  var splits = [], lang = 'ru', onLang = [];

  if (!HAS) root.classList.remove('js');
  else {
    gsap.registerPlugin(ScrollTrigger);
    if (w.SplitText) gsap.registerPlugin(SplitText);
    gsap.defaults({ ease: 'power3.out', duration: 0.9 });
  }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- якоря: с отступом шапки ---------- */
  function hdrH() { var h = $('.hdr-in'); return h ? h.getBoundingClientRect().bottom + 16 : 80; }
  function goTo(el) {
    var y = el.getBoundingClientRect().top + w.pageYOffset - hdrH();
    w.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href'); if (h.length < 2) return;
    var el = d.getElementById(h.slice(1)); if (!el) return;
    e.preventDefault(); closeMenu(); goTo(el);
    if (history.replaceState) history.replaceState(null, '', h);
  });

  /* ---------- языки: словарь своей страницы ---------- */
  var RU = {};
  $$('[data-i18n]').forEach(function (el) { RU[el.getAttribute('data-i18n')] = el.textContent; });
  $$('[data-i18n-alt]').forEach(function (el) { RU[el.getAttribute('data-i18n-alt')] = el.getAttribute('alt'); });
  $$('[data-i18n-aria]').forEach(function (el) { RU[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label'); });
  var RUWA = w.SITE_RU_WA || {}; for (var k in RUWA) RU[k] = RUWA[k];
  var RUX = { 'st.concept': 'Концепция', 'st.agreed': 'Концепция согласована', 'st.built': 'Концепция бюро, объект построен', 'ar.read': 'Читать', 'pf.similar': 'Обсудить похожий проект' };
  for (k in RUX) if (!(k in RU)) RU[k] = RUX[k];
  function dict() { return lang === 'ru' ? RU : (w['SITE_' + lang.toUpperCase()] || RU); }
  function tr(key) { var v = dict()[key]; return v == null ? (RU[key] || '') : v; }
  function waUrl(text) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text); }
  function applyLang() {
    unsplit();
    $$('[data-i18n]').forEach(function (el) { el.textContent = tr(el.getAttribute('data-i18n')); });
    $$('[data-i18n-alt]').forEach(function (el) { el.setAttribute('alt', tr(el.getAttribute('data-i18n-alt'))); });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', tr(el.getAttribute('data-i18n-aria'))); });
    $$('[data-wa]').forEach(function (el) { el.href = waUrl(tr(el.getAttribute('data-wa'))); });
    $$('[data-wa-name]').forEach(function (el) { el.href = waUrl(tr('wa.t.similar') + '\n' + tr(el.getAttribute('data-wa-name'))); });
    root.lang = lang;
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    onLang.forEach(function (f) { f(); });
    split(true);
    if (HAS) ScrollTrigger.refresh();
  }
  function setLang(l, save) {
    if (['ru', 'kk', 'en'].indexOf(l) < 0) l = 'ru';
    if (save) { try { localStorage.setItem('arhion-lang', l); } catch (e) {} }
    if (l === 'ru' || w['SITE_' + l.toUpperCase()]) { lang = l; applyLang(); return; }
    var s = d.createElement('script');
    s.src = BASE + 'assets/lang/' + l + '-' + PAGE + '.js' + (VER ? '?v=' + VER : '');
    s.onload = function () { lang = l; applyLang(); };
    d.head.appendChild(s);
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); }); });

  /* ---------- заголовки строками из-под маски ---------- */
  function unsplit() { splits.forEach(function (s) { try { s.revert(); } catch (e) {} }); splits = []; }
  function split(again) {
    if (!HAS || !w.SplitText || RM) { $$('.about-t .w').forEach(function (x) { x.style.opacity = 1; }); return; }
    $$('[data-split]').forEach(function (el) {
      var s = new SplitText(el, { type: 'lines', linesClass: 'split-line-in', aria: 'none' });
      s.lines.forEach(function (l) { var m = d.createElement('div'); m.className = 'split-line'; l.parentNode.insertBefore(m, l); m.appendChild(l); });
      var rv = s.revert.bind(s), tw = null;
      s.revert = function () { if (tw) { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); } $$('.split-line', el).forEach(function (m) { while (m.firstChild) m.parentNode.insertBefore(m.firstChild, m); m.remove(); }); rv(); };
      splits.push(s);
      if (again || el.getBoundingClientRect().top < w.innerHeight * 0.9) return;
      tw = gsap.from(s.lines, { yPercent: 115, duration: 1, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-words]').forEach(function (el) {
      var s = new SplitText(el, { type: 'words', wordsClass: 'w', aria: 'none' });
      /* слова проявляются сами за ~1.5 с, как только абзац показался - не ждут прокрутки */
      var tw = gsap.to(s.words, { opacity: 1, ease: 'power1.out', duration: 0.5, stagger: 0.025, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      var rv = s.revert.bind(s);
      s.revert = function () { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); rv(); };
      splits.push(s);
    });
  }

  /* ---------- проявления ---------- */
  var io = null;
  function reveal(items) {
    if (!('IntersectionObserver' in w) || RM) { items.forEach(function (el) { el.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (es) {
      var i = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', (Math.min(i, 6) * 0.07) + 's'); i++;
        e.target.classList.add('in'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }
  function reveals(ctx) { reveal($$('[data-rv], .ph, [data-map], .st', ctx)); }

  /* ---------- параллакс кадров ---------- */
  function parallax() {
    if (!HAS || RM || !w.matchMedia('(min-width: 900px) and (hover: hover)').matches) return;
    $$('[data-plx]').forEach(function (el) {
      gsap.fromTo(el, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-plx-bg]').forEach(function (el) {
      gsap.fromTo(el, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- шапка, меню ---------- */
  var hdr = $('#hdr'), menu = $('#menu'), burger = $('.burger');
  function onScroll() { hdr.classList.toggle('is-solid', w.pageYOffset > 40); }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); d.body.classList.remove('menu-open');
    setTimeout(function () { menu.hidden = true; }, 300);
  }
  burger.addEventListener('click', function () {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false; d.body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });

  /* ---------- первый экран: спокойное появление кадра ---------- */
  var hero = $('.hero, .phero');
  if (hero) {
    var hi = $('.hero-img img, .phero-img img', hero);
    var go = function () { hero.classList.add('is-in'); };
    if (!hi || hi.complete) requestAnimationFrame(go); else { hi.addEventListener('load', go); hi.addEventListener('error', go); setTimeout(go, 1500); }
  }

  /* ---------- направления на главной ---------- */
  var svs = $$('.sv');
  svs.forEach(function (s) {
    var on = function () { svs.forEach(function (x) { x.classList.toggle('is-on', x === s); }); };
    s.addEventListener('mouseenter', on); s.addEventListener('focus', on);
  });

  /* ---------- фильтр проектов ---------- */
  var pg = $('#pg');
  if (pg && $('.chip[data-f]')) {
    var cards = $$('.pcard', pg), pgN = $('#pgN');
    var apply = function (f, push) {
      $$('.chip[data-f]').forEach(function (x) { var on = x.getAttribute('data-f') === f; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      if (push) cards.forEach(function (c) { c.classList.add('is-swap'); });
      setTimeout(function () {
        var n = 0;
        cards.forEach(function (c) {
          var show = f === 'all' || c.getAttribute('data-cat') === f;
          c.classList.toggle('is-hide', !show); if (show) n++;
          $$('.ph', c).forEach(function (p) { p.classList.add('in'); });
        });
        if (pgN) pgN.textContent = n;
        requestAnimationFrame(function () { cards.forEach(function (c, i) { c.style.transitionDelay = (Math.min(i, 8) * 0.03) + 's'; c.classList.remove('is-swap'); }); });
        setTimeout(function () { cards.forEach(function (c) { c.style.transitionDelay = ''; }); if (HAS) ScrollTrigger.refresh(); }, 700);
      }, RM || !push ? 0 : 240);
      if (push && history.replaceState) history.replaceState(null, '', f === 'all' ? location.pathname : '?f=' + f);
    };
    $$('.chip[data-f]').forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-f'), true); }); });
    var f0 = (location.search.match(/[?&]f=([a-z]+)/) || [])[1];
    if (f0 && $('.chip[data-f="' + f0 + '"]')) apply(f0, false);
  }

  /* ---------- ленты со стрелками ---------- */
  $$('.rib-nav[data-for]').forEach(function (nav) {
    var rib = d.getElementById(nav.getAttribute('data-for')); if (!rib) return;
    var rbs = $$('.rb', nav);
    var stepW = function () { var c = rib.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rib).columnGap || 16) : 320; };
    var upd = function () {
      var max = rib.scrollWidth - rib.clientWidth - 2;
      rbs[0].disabled = rib.scrollLeft <= 2; rbs[1].disabled = rib.scrollLeft >= max;
      nav.hidden = max <= 4;
    };
    rbs.forEach(function (b) { b.addEventListener('click', function () { rib.scrollBy({ left: stepW() * Number(b.getAttribute('data-dir')), behavior: RM ? 'auto' : 'smooth' }); }); });
    rib.addEventListener('scroll', upd, { passive: true }); w.addEventListener('resize', upd); upd();
  });

  /* ---------- окно-галерея ---------- */
  var mdl = $('#mdl'), mImg = $('#mdlImg'), mFrame = $('#mdlFrame'), mTh = $('#mdlTh'), mC = $('#mdlC'), gal = [], gi = 0, lastFocus = null, curName = '';
  function url(p) { return /^https?:/.test(p) ? p : BASE + p; }
  function small(u) { return u.replace(/-(1600|1920|2560)\.webp$/, '-800.webp').replace(/-1200\.webp$/, '-800.webp').replace(/=w1920$/, '=w600'); }
  function show(i) {
    gi = (i + gal.length) % gal.length;
    var u = url(gal[gi]), pre = new Image();
    mFrame.classList.remove('is-in');
    pre.onload = pre.onerror = function () {
      if (gal[gi] !== pre._n) return;
      setTimeout(function () { mImg.src = u; mImg.alt = curName; requestAnimationFrame(function () { setTimeout(function () { mFrame.classList.add('is-in'); }, 120); }); }, 140);
    };
    pre._n = gal[gi]; pre.src = u;
    mC.textContent = (gi + 1) + ' / ' + gal.length;
    $$('button', mTh).forEach(function (b, n) { b.classList.toggle('is-on', n === gi); });
    if (gal.length > 1) { var nx = new Image(); nx.src = url(gal[(gi + 1) % gal.length]); }
  }
  function openGallery(o) {
    gal = o.imgs.filter(Boolean); if (!gal.length) return;
    curName = o.title || '';
    $('#mdlM').innerHTML = o.meta || ''; $('#mdlN').textContent = curName;
    $('#mdlD').textContent = o.desc || ''; $('#mdlD').hidden = !o.desc;
    $('#mdlWa').href = waUrl(tr('wa.t.similar') + '\n' + curName);
    mTh.innerHTML = ''; mTh.hidden = gal.length < 2;
    $$('.mdl-p, .mdl-nx, .mdl-c', mdl).forEach(function (b) { b.hidden = gal.length < 2; });
    gal.forEach(function (n, i) {
      var b = d.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', (i + 1) + ' / ' + gal.length);
      b.innerHTML = '<img src="' + esc(small(url(n))) + '" alt="" loading="lazy" decoding="async">';
      b.addEventListener('click', function () { show(i); }); mTh.appendChild(b);
    });
    mImg.removeAttribute('src');
    lastFocus = d.activeElement;
    mdl.hidden = false; d.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { mdl.classList.add('is-open'); $('.mdl-x').focus(); });
    show(o.start || 0);
  }
  function closeMdl() {
    if (mdl.hidden) return;
    mdl.classList.remove('is-open');
    setTimeout(function () { mdl.hidden = true; d.body.style.overflow = ''; if (lastFocus) lastFocus.focus({ preventScroll: true }); }, 320);
  }
  function openConcept(c) {
    var n = $('.pcard-n', c), m = $('.meta', c);
    openGallery({ imgs: c.getAttribute('data-cgal').split('|'), title: n ? n.textContent : '', meta: m ? m.innerHTML : '', desc: c.getAttribute('data-desc') || '' });
  }
  d.addEventListener('click', function (e) {
    var g = e.target.closest('.gal [data-gi]');
    if (g) {
      var box = g.closest('.gal');
      openGallery({ imgs: box.getAttribute('data-gal').split('|'), title: tr(box.getAttribute('data-title-key')), start: Number(g.getAttribute('data-gi')) });
      return;
    }
    var c = e.target.closest('[data-cgal]');
    if (c) { openConcept(c); return; }
    if (e.target.closest('[data-close]')) closeMdl();
    else { var s = e.target.closest('[data-step]'); if (s) show(gi + Number(s.getAttribute('data-step'))); }
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMdl(); closeMenu(); }
    if (mdl.hidden) return;
    if (e.key === 'ArrowRight') show(gi + 1);
    if (e.key === 'ArrowLeft') show(gi - 1);
  });
  var tx = null;
  mFrame.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  mFrame.addEventListener('touchend', function (e) { if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 44) show(gi + (dx < 0 ? 1 : -1)); tx = null; }, { passive: true });

  /* ---------- до / после ---------- */
  function baInit(ba) {
    var inp = $('.ba-in', ba), down = false, hinted = false;
    var set = function (p) { p = Math.max(0, Math.min(100, p)); ba.style.setProperty('--p', p + '%'); inp.value = Math.round(p); };
    var fromX = function (x) { var r = ba.getBoundingClientRect(); set((x - r.left) / r.width * 100); };
    ba.addEventListener('pointerdown', function (e) { down = true; ba.classList.add('is-drag'); fromX(e.clientX); if (ba.setPointerCapture) ba.setPointerCapture(e.pointerId); });
    ba.addEventListener('pointermove', function (e) { if (down) fromX(e.clientX); });
    var up = function () { down = false; ba.classList.remove('is-drag'); };
    ba.addEventListener('pointerup', up); ba.addEventListener('pointercancel', up);
    inp.addEventListener('input', function () { set(Number(inp.value)); });
    /* подсказка движением, один раз при появлении */
    if (!RM && HAS && 'IntersectionObserver' in w) {
      var o = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting || hinted || ba.offsetParent === null) return; hinted = true; o.disconnect();
        var st = { p: 50 };
        gsap.timeline({ delay: 0.3 })
          .to(st, { p: 80, duration: 1, ease: 'power2.inOut', onUpdate: function () { set(st.p); } })
          .to(st, { p: 22, duration: 1.3, ease: 'power2.inOut', onUpdate: function () { set(st.p); } })
          .to(st, { p: 50, duration: 0.9, ease: 'power2.out', onUpdate: function () { set(st.p); } });
      }, { threshold: 0.55 });
      o.observe(ba);
    }
  }
  $$('[data-ba]').forEach(baInit);
  $$('[data-ba-tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var j = Number(b.getAttribute('data-ba-tab')), panes = $$('.ba-pane', b.closest('.wrap'));
      $$('[data-ba-tab]').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      panes.forEach(function (p, i) { p.hidden = i !== j; });
      $$('.ph, [data-rv]', panes[j]).forEach(function (x) { x.classList.add('in'); });
    });
  });

  /* ---------- форма ---------- */
  var fm = $('#zayavka');
  if (fm) {
    fm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = fm.elements, ok = true;
      [f.name, f.phone].forEach(function (i) {
        var bad = i === f.phone ? i.value.replace(/\D/g, '').length < 10 : !i.value.trim();
        i.classList.toggle('is-err', bad); if (bad && ok) { i.focus(); ok = false; }
      });
      if (!ok) return;
      var L = [tr('wa.t.form'), tr('fm.name') + ': ' + f.name.value.trim(), tr('fm.phone') + ': ' + f.phone.value.trim(), tr('fm.type') + ': ' + f.type.value];
      if (f.city.value.trim()) L.push(tr('fm.city') + ': ' + f.city.value.trim());
      if (f.area.value.trim()) L.push(tr('wa.f.area') + ': ' + f.area.value.trim() + ' м²');
      w.open(waUrl(L.join('\n')), '_blank', 'noopener');
      $('#fmOk').hidden = false;
    });
  }

  /* =====================================================================
     Контент из Google-таблиц: концепции и статьи. Таблица читается как CSV;
     нет доступа по ссылке - остаётся затравка, вшитая в страницу при сборке.
     ===================================================================== */
  function parseCSV(t) {
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c !== '\r') cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    var h = rows.shift() || [];
    return rows.map(function (r) { var o = {}; h.forEach(function (k, i) { o[k.trim()] = (r[i] || '').trim(); }); return o; })
      .filter(function (o) { return /^да$/i.test(o['Публиковать'] || ''); });
  }
  function sheet(id) {
    var key = 'arhion-sheet-' + id;
    try { var c = JSON.parse(sessionStorage.getItem(key) || 'null'); if (c && Date.now() - c.t < 300000) return Promise.resolve(c.rows); } catch (e) {}
    return fetch('https://docs.google.com/spreadsheets/d/' + id + '/export?format=csv', { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (t) {
        if (/^\s*</.test(t)) throw 0; /* страница входа - доступ по ссылке не открыт */
        var rows = parseCSV(t);
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), rows: rows })); } catch (e) {}
        return rows;
      });
  }
  function pimg(v, big) {
    v = (v || '').trim(); if (!v) return '';
    var m = v.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{20,})/) || v.match(/[?&]id=([\w-]{20,})/);
    if (m) return 'https://lh3.googleusercontent.com/d/' + m[1] + '=w' + (big ? 1920 : 900);
    if (/^https?:/.test(v)) return v;
    return big ? v : v.replace(/-(1600|1920)\.webp$/, '-800.webp');
  }
  function col(r, name) { var suf = lang === 'kk' ? ' KZ' : lang === 'en' ? ' EN' : ''; return (suf && r[name + suf]) || r[name] || ''; }
  var STK = { 'Концепция': 'st.concept', 'Концепция согласована': 'st.agreed', 'Объект построен': 'st.built' };
  function md(t) {
    /* мини-разметка: ## заголовок, - список, > врезка, **жирное**; остальное экранируется */
    var out = [], list = null;
    var inl = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); };
    var flush = function () { if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; } };
    t.split('\n').forEach(function (ln) {
      ln = ln.trim(); if (!ln) { flush(); return; }
      if (/^-\s+/.test(ln)) { (list = list || []).push('<li>' + inl(ln.replace(/^-\s+/, '')) + '</li>'); return; }
      flush();
      if (/^##\s+/.test(ln)) out.push('<h2>' + inl(ln.replace(/^##\s+/, '')) + '</h2>');
      else if (/^>\s*/.test(ln)) out.push('<blockquote>' + inl(ln.replace(/^>\s*/, '')) + '</blockquote>');
      else out.push('<p>' + inl(ln) + '</p>');
    });
    flush();
    return out.join('');
  }
  var ARROW = '<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function arCard(r) {
    var cov = pimg(r['Обложка']); if (cov && !/^https?:/.test(cov)) cov = BASE + cov;
    return '<a class="acard" href="' + BASE + 'stati/statya.html?id=' + encodeURIComponent(r['Адрес']) + '">' +
      '<div class="ph in">' + (cov ? '<img src="' + esc(cov) + '" alt="' + esc(col(r, 'Заголовок')) + '" loading="lazy" decoding="async">' : '') + '<i class="ticks"></i></div>' +
      '<p class="meta"><span>' + esc(r['Дата']) + '</span></p><h3 class="acard-n">' + esc(col(r, 'Заголовок')) + '</h3>' +
      '<p class="acard-d">' + esc(col(r, 'Описание')) + '</p><span class="go"><span>' + esc(tr('ar.read')) + '</span>' + ARROW + '</span></a>';
  }
  function coCard(r) {
    var ph = (r['Фото'] || '').split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var st = STK[r['Статус']] ? tr(STK[r['Статус']]) : r['Статус'];
    var mt = [st, r['Город']].filter(Boolean).map(esc).join('<i>·</i>');
    var big = ph.map(function (p) { return pimg(p, true); });
    var sm = ph[0] ? pimg(ph[0]) : ''; if (sm && !/^https?:/.test(sm)) sm = BASE + sm;
    return '<button type="button" class="pcard pcard--k" data-cid="' + esc(r['Адрес']) + '" data-cgal="' + esc(big.join('|')) + '" data-desc="' + esc(col(r, 'Описание')) + '">' +
      '<div class="ph in">' + (sm ? '<img src="' + esc(sm) + '" alt="' + esc(col(r, 'Название')) + '" loading="lazy" decoding="async">' : '') + '<i class="ticks"></i></div>' +
      '<h3 class="pcard-n">' + esc(col(r, 'Название')) + '</h3><p class="meta">' + mt + '</p></button>';
  }
  var SH = w.SHEETS || {};
  function openHash() {
    var h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    var c = $('[data-cid="' + h.replace(/["\\]/g, '') + '"]'); if (c) openConcept(c);
  }
  var coGrid = $('#coGrid');
  if (coGrid && SH.co) {
    var coRows = null;
    var coDraw = function () {
      if (!coRows) return;
      coRows.sort(function (a, b) { return (parseFloat(a['Порядок']) || 99) - (parseFloat(b['Порядок']) || 99); });
      coGrid.innerHTML = coRows.map(coCard).join('');
      $('#coEmpty').hidden = coRows.length > 0;
    };
    sheet(SH.co).then(function (rows) { coRows = rows; coDraw(); openHash(); }).catch(function () { openHash(); });
    onLang.push(coDraw);
  }
  var arBoxes = $$('[data-sheet-ar]'), artB = $('#artB');
  if ((arBoxes.length || artB) && SH.ar) {
    var arRows = null;
    var arDraw = function () {
      var rows = (arRows || w.SEED_AR || []).slice();
      var p = function (s) { var m = (s || '').match(/(\d+)\.(\d+)\.(\d+)/); return m ? +(m[3] + m[2] + m[1]) : 0; };
      rows.sort(function (a, b) { return p(b['Дата']) - p(a['Дата']); });
      var id = (location.search.match(/[?&]id=([^&]+)/) || [])[1]; id = id ? decodeURIComponent(id) : '';
      arBoxes.forEach(function (box) {
        var mode = box.getAttribute('data-sheet-ar'), list = rows;
        if (mode === 'other') list = rows.filter(function (r) { return r['Адрес'] !== id; }).slice(0, 3);
        else if (mode !== 'all') list = rows.slice(0, Number(mode) || 3);
        if (!arRows && mode !== 'other') return; /* затравка уже вшита в страницу */
        box.innerHTML = list.map(arCard).join('');
        var em = $('#arEmpty'); if (em && mode === 'all') em.hidden = list.length > 0;
        var sec = box.closest('section'); if (sec && mode !== 'all') sec.hidden = list.length === 0;
      });
      if (artB) {
        var r = rows.filter(function (x) { return x['Адрес'] === id; })[0];
        $('#artNo').hidden = !!r;
        if (!r) { artB.innerHTML = ''; $('#artH').textContent = ''; return; }
        d.title = col(r, 'Заголовок') + ' | ARHION';
        $('#artDate').textContent = r['Дата']; $('#artH').textContent = col(r, 'Заголовок'); $('#artL').textContent = col(r, 'Описание');
        var cov = pimg(r['Обложка'], true), cv = $('#artCov'); if (cov && !/^https?:/.test(cov)) cov = BASE + cov;
        cv.hidden = !cov; cv.innerHTML = cov ? '<img src="' + esc(cov) + '" alt="' + esc(col(r, 'Заголовок')) + '" decoding="async">' : ''; cv.classList.add('in');
        artB.innerHTML = md(col(r, 'Текст'));
      }
    };
    arDraw();
    sheet(SH.ar).then(function (rows) { arRows = rows; arDraw(); }).catch(function () {});
    onLang.push(arDraw);
  }

  /* ---------- переходы между разделами: занавес и сборка логотипа ---------- */
  (function () {
    if (RM) return;
    var leave = function (href) {
      try { sessionStorage.setItem('arh-pt', '1'); } catch (e) {}
      root.classList.remove('pt-on', 'pt-out');
      root.classList.add('pt-go');
      setTimeout(function () { location.href = href; }, 480);
    };
    /* страница начинает грузиться заранее: при наведении или касании ссылки */
    var pf = {};
    var prefetch = function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.target === '_blank') return;
      var u; try { u = new URL(a.href, location.href); } catch (er) { return; }
      if (u.origin !== location.origin || u.pathname === location.pathname || pf[u.href]) return;
      pf[u.href] = 1;
      var l = d.createElement('link'); l.rel = 'prefetch'; l.href = u.href; d.head.appendChild(l);
    };
    d.addEventListener('mouseover', prefetch, { passive: true });
    d.addEventListener('touchstart', prefetch, { passive: true });
    d.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var raw = a.getAttribute('href');
      if (!raw || raw.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download') || /^(tel|mailto|https?:\/\/(wa\.me|t\.me))/.test(raw)) return;
      var u; try { u = new URL(a.href, location.href); } catch (er) { return; }
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return; /* та же страница - якорь обработан выше */
      e.preventDefault(); closeMenu(); leave(u.href);
    });
    if (root.classList.contains('pt-on')) {
      var done = function () {
        if (root.classList.contains('pt-out')) return;
        root.classList.add('pt-out');
        setTimeout(function () { root.classList.remove('pt-on', 'pt-out'); }, 850);
      };
      var hi = $('.hero-img img');
      if (hi && !hi.complete) { hi.addEventListener('load', function () { setTimeout(done, 40); }); hi.addEventListener('error', done); setTimeout(done, 500); }
      else setTimeout(done, 60);
    }
    w.addEventListener('pageshow', function (ev) { if (ev.persisted) root.classList.remove('pt-go', 'pt-on', 'pt-out'); });
  })();

  /* ---------- запуск ---------- */
  reveals();
  parallax();
  var want = null;
  try { want = new URLSearchParams(w.location.search).get('lang') || localStorage.getItem('arhion-lang'); } catch (e) {}
  var fontsReady = (d.fonts && d.fonts.ready) ? d.fonts.ready : Promise.resolve();
  fontsReady.then(function () { if (want && want !== 'ru') setLang(want, false); else split(false); if (HAS) ScrollTrigger.refresh(); });
  w.addEventListener('load', function () {
    if (HAS) ScrollTrigger.refresh();
    if (location.hash && !coGrid) { var el = d.getElementById(location.hash.slice(1)); if (el) setTimeout(function () { goTo(el); }, 60); }
  });
})();
