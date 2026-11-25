(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var VER = (function () { var s = d.currentScript && d.currentScript.src || ''; var m = s.match(/[?&]v=([^&]+)/); return m ? m[1] : ''; })();
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var RM = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOB = w.matchMedia('(max-width: 767px)');
  var HAS = !!(w.gsap && w.ScrollTrigger);
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var PHONE = '77778823020';
  var lenis = null, splits = [], lang = 'ru';

  if (!HAS) { root.classList.remove('js'); }
  else {
    gsap.registerPlugin(ScrollTrigger);
    if (w.SplitText) gsap.registerPlugin(SplitText);
    if (w.CustomEase) { /* не используется */ }
    gsap.defaults({ ease: 'power3.out', duration: 0.9 });
  }

  /* ---------- плавная прокрутка ---------- */
  if (HAS && w.Lenis && !RM) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function hdrH() { var h = $('.hdr-in'); return h ? h.getBoundingClientRect().bottom + 16 : 80; }
  function goTo(target) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (el.id === 'top') { lenis ? lenis.scrollTo(0) : w.scrollTo(0, 0); return; }
    var y = el.getBoundingClientRect().top + w.pageYOffset - hdrH();
    if (lenis) lenis.scrollTo(y, { duration: 1.3 }); else w.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-open') || a.classList.contains('pc')) return;
    var h = a.getAttribute('href');
    if (h.length < 2) { e.preventDefault(); return; }
    if (!$(h)) return;
    e.preventDefault();
    closeMenu();
    goTo(h);
  });

  /* ---------- языки ---------- */
  var RU = {};
  $$('[data-i18n]').forEach(function (el) { RU[el.getAttribute('data-i18n')] = el.textContent; });
  $$('[data-i18n-alt]').forEach(function (el) { RU[el.getAttribute('data-i18n-alt')] = el.getAttribute('alt'); });
  $$('[data-i18n-aria]').forEach(function (el) { RU[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label'); });
  var RUWA = w.SITE_RU_WA || {};
  for (var k in RUWA) RU[k] = RUWA[k];
  function dict() { return lang === 'ru' ? RU : (w['SITE_' + lang.toUpperCase()] || RU); }
  function tr(key) { var v = dict()[key]; return v == null ? (RU[key] || '') : v; }
  function waUrl(text) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text); }
  function applyLang() {
    unsplit();
    $$('[data-i18n]').forEach(function (el) { el.textContent = tr(el.getAttribute('data-i18n')); });
    $$('[data-i18n-alt]').forEach(function (el) { el.setAttribute('alt', tr(el.getAttribute('data-i18n-alt'))); });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', tr(el.getAttribute('data-i18n-aria'))); });
    $$('[data-wa]').forEach(function (el) { el.href = waUrl(tr(el.getAttribute('data-wa'))); });
    root.lang = lang;
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    split(true);
    if (HAS) ScrollTrigger.refresh();
  }
  function setLang(l, save) {
    if (['ru', 'kk', 'en'].indexOf(l) < 0) l = 'ru';
    if (save) { try { localStorage.setItem('arhion-lang', l); } catch (e) {} }
    if (l === 'ru' || w['SITE_' + l.toUpperCase()]) { lang = l; applyLang(); return; }
    var s = d.createElement('script');
    s.src = 'assets/lang/' + l + '.js' + (VER ? '?v=' + VER : '');
    s.onload = function () { lang = l; applyLang(); };
    d.head.appendChild(s);
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); }); });

  /* ---------- заголовки: строки из-под маски ---------- */
  function unsplit() { splits.forEach(function (s) { try { s.revert(); } catch (e) {} }); splits = []; }
  function split(again) {
    if (!HAS || !w.SplitText || RM) { $$('.about-t .w').forEach(function (x) { x.style.opacity = 1; }); return; }
    $$('[data-split]').forEach(function (el) {
      var s = new SplitText(el, { type: 'lines', linesClass: 'split-line-in', aria: 'none' });
      s.lines.forEach(function (l) { var m = d.createElement('div'); m.className = 'split-line'; l.parentNode.insertBefore(m, l); m.appendChild(l); });
      var rv = s.revert.bind(s), tw = null;
      s.revert = function () { if (tw) { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); } $$('.split-line', el).forEach(function (m) { while (m.firstChild) m.parentNode.insertBefore(m.firstChild, m); m.remove(); }); rv(); };
      splits.push(s);
      if (again && el.getBoundingClientRect().top < w.innerHeight * 0.9) return;
      tw = gsap.from(s.lines, { yPercent: 115, duration: 1, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-words]').forEach(function (el) {
      var s = new SplitText(el, { type: 'words', wordsClass: 'w', aria: 'none' });
      var tw = gsap.to(s.words, { opacity: 1, ease: 'none', stagger: 0.5, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 } });
      var rv = s.revert.bind(s);
      s.revert = function () { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); rv(); };
      splits.push(s);
    });
  }

  /* ---------- проявления ---------- */
  function reveals() {
    var items = $$('[data-rv], .ph, [data-map], .st');
    if (!('IntersectionObserver' in w) || RM) { items.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      var i = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', (Math.min(i, 6) * 0.07) + 's'); i++;
        e.target.classList.add('in'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- герой: посадка здания на участок ---------- */
  function hero() {
    var heroEl = $('.hero'), stage = $('#stage'), built = $('#built'), plan = $('#plan'), level = $('#level'),
        arches = $('#arches'), veil = $('#veil'), bar = $('#hcBar'), caps = $$('.hc');
    if (!heroEl) return;
    stage.insertBefore(veil, plan);
    function fitPlan() { plan.setAttribute('viewBox', MOB.matches ? '461 0 576 960' : '0 0 1280 960'); }
    fitPlan();
    var txt = $$('.hero-top, .h1 span, .hero-lead, .hero-btns, .hero-ig');

    if (!HAS || RM) {
      veil.style.opacity = 0; built.style.clipPath = 'none';
      if (!MOB.matches) loadArches(function () { arches.style.visibility = 'visible'; arches.style.opacity = 1; });
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === 2); });
      return;
    }

    /* вступление: линии участка и осей на графите, затем проступает снимок */
    gsap.set(txt, { y: 22 }); /* текст виден с первого кадра (LCP), движется только сдвиг */
    var first = $('.stage > picture img');
    var ready = new Promise(function (res) {
      var done = false, ok = function () { if (!done) { done = true; res(); } };
      if (first.complete) ok(); else { first.addEventListener('load', ok); first.addEventListener('error', ok); }
      setTimeout(ok, 1800);
    });
    var intro = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    intro.to('.pl-site', { strokeDashoffset: 0, duration: 1.2 }, 0.1)
         .to('.pl-base', { strokeDashoffset: 0, duration: 0.9 }, 0.3)
         .to('.pl-ax path', { strokeDashoffset: 0, duration: 0.8, stagger: 0.07 }, 0.4)
         .to('.pl-ax circle', { opacity: 0.55, duration: 0.5, stagger: 0.07 }, 0.75)
         .to(txt, { y: 0, duration: 1.1, stagger: 0.07, ease: 'power3.out' }, 0.1);
    ready.then(function () {
      gsap.to(veil, { opacity: 0, duration: 1.5, ease: 'power2.out', delay: Math.max(0, 0.9 - intro.time()) });
      gsap.fromTo(stage, { '--sc': 1.05 }, { '--sc': 1, duration: 2.2, ease: 'power2.out', delay: Math.max(0, 0.9 - intro.time()) });
    });

    /* прокрутка: благоустройство расходится от линии земли, затем здание встаёт по отметке уровня */
    /* st - состояние от прокрутки, au - автозапуск после загрузки; показываем то, что построено больше */
    var st = { t: 66.6, b: 33.4 }, au = { t: 66.6, b: 33.4 }, H = stage.offsetHeight, autoCap = 0;
    function capOn(i) { caps.forEach(function (c, n) { c.classList.toggle('is-on', n === i); }); }
    level.style.transition = 'opacity .35s ' + EASE;
    function draw() {
      var t = Math.min(st.t, au.t), b = Math.min(st.b, au.b);
      built.style.clipPath = 'inset(' + t.toFixed(3) + '% 0 ' + b.toFixed(3) + '% 0)';
      level.style.transform = 'translate3d(0,' + (H * t / 100).toFixed(1) + 'px,0)';
      level.style.opacity = (b < 1 && t > 38 && t < 66) ? 1 : 0;
    }
    draw();
    /* автозапуск: кто не листает, всё равно видит, как здание встаёт на участке */
    ready.then(function () {
      var wait = Math.max(0, 0.9 - intro.time()) + 1.5;
      gsap.timeline({ delay: wait, onStart: function () { if (w.pageYOffset > 40) { this.kill(); return; } autoCap = 1; capOn(1); }, onComplete: function () { autoCap = 2; if (w.pageYOffset < 40) capOn(2); } })
        .to(au, { b: 0, duration: 0.7, ease: 'power2.inOut', onUpdate: draw }, 0)
        .to(plan, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.5)
        .to(au, { t: 37, duration: 2.2, ease: 'power2.inOut', onUpdate: draw }, 0.6)
        .to(au, { t: 0, duration: 0.01, onUpdate: draw }, 2.85);
    });
    var mob = MOB.matches;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: heroEl, start: 'top top', end: 'bottom bottom', scrub: 0.7,
        onUpdate: function (self) {
          var p = self.progress, i = Math.max(autoCap, p < 0.03 ? 0 : (p < (mob ? 0.8 : 0.7) ? 1 : 2));
          capOn(i);
          bar.style.transform = 'scaleX(' + Math.min(1, p / (mob ? 0.84 : 0.74)).toFixed(3) + ')';
        }
      }
    });
    var k = mob ? 1.14 : 1;
    tl.to(st, { b: 0, duration: 0.2 * k, onUpdate: draw }, 0.03)
      .to('.pl-site', { opacity: 0, duration: 0.14 }, 0.05)
      .to(st, { t: 37, duration: 0.46 * k, onUpdate: draw }, 0.23 * k)
      .to('.pl-ax, .pl-base', { opacity: 0, duration: 0.12 }, 0.58 * k)
      .to(st, { t: 0, duration: 0.01, onUpdate: draw }, 0.74 * k)
      .to({}, { duration: 0.01 }, 0.99);
    if (!mob) {
      loadArches();
      var aim = $('img', arches);
      tl.to(stage, { '--sc': 1.12, duration: 0.14, ease: 'power1.in' }, 0.75)
        .fromTo(arches, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.09 }, 0.78)
        .fromTo(aim, { opacity: 0, scale: 1.09 }, { opacity: 1, scale: 1, duration: 0.14, ease: 'power1.out' }, 0.86);
    }
    var wid = w.innerWidth;
    w.addEventListener('resize', function () {
      H = stage.offsetHeight; draw(); fitPlan();
      if (w.innerWidth !== wid && (MOB.matches !== mob)) { w.location.reload(); }
      wid = w.innerWidth;
    });
    function loadArches(cb) {
      var im = $('img', arches);
      if (im.getAttribute('src')) { cb && cb(); return; }
      var go = function () { im.srcset = im.getAttribute('data-srcset'); im.src = im.getAttribute('data-src'); if (cb) im.addEventListener('load', cb); };
      if (d.readyState === 'complete') go(); else w.addEventListener('load', go);
    }
  }

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
  function onScroll() { hdr.classList.toggle('is-solid', w.pageYOffset > w.innerHeight * 0.6); }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() {
    if (menu.hidden) return;
    menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); d.body.classList.remove('menu-open');
    setTimeout(function () { menu.hidden = true; }, 300);
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', function () {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false; d.body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    if (lenis) lenis.stop();
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });

  /* ---------- направления ---------- */
  var svs = $$('.sv');
  function svOn(el) { svs.forEach(function (s) { s.classList.toggle('is-on', s === el); }); }
  svs.forEach(function (s) {
    s.addEventListener('mouseenter', function () { svOn(s); });
    s.addEventListener('focus', function () { svOn(s); });
    s.addEventListener('click', function () { svOn(s); });
  });

  /* ---------- сетка проектов и фильтр ---------- */
  var pg = $('#pg'), cards = $$('.pc', pg), filter = 'all';
  function layout() {
    var vis = cards.filter(function (c) { return !c.classList.contains('is-hide'); });
    var W = w.innerWidth, rows, i = 0, r = 0;
    if (W >= 1100) rows = [[7, 5], [4, 4, 4], [5, 7], [4, 4, 4]];
    else if (W >= 700) rows = [[12], [6, 6], [6, 6]];
    else rows = [[2], [1, 1], [1, 1]];
    var full = rows[0].reduce(function (a, b) { return a + b; }, 0);
    while (i < vis.length) {
      var row = rows[r % rows.length], left = vis.length - i;
      if (left < row.length) row = left === 1 ? [full] : (left === 2 ? [full / 2, full / 2] : row);
      var large = row.length < 3 && W >= 1100 || row.length === 1;
      for (var j = 0; j < row.length && i < vis.length; j++, i++) {
        vis[i].style.gridColumn = 'span ' + row[j];
        vis[i].classList.toggle('is-l', large);
      }
      r++;
    }
  }
  if (pg) {
    layout();
    var lw = w.innerWidth;
    w.addEventListener('resize', function () { if (w.innerWidth !== lw) { lw = w.innerWidth; layout(); } });
    $$('.chip').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-f') === filter) return;
        filter = b.getAttribute('data-f');
        $$('.chip').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
        cards.forEach(function (c) { c.classList.add('is-swap'); });
        setTimeout(function () {
          cards.forEach(function (c) {
            c.classList.toggle('is-hide', filter !== 'all' && c.getAttribute('data-cat') !== filter);
            $$('.ph', c).forEach(function (p) { p.classList.add('in'); });
          });
          layout();
          requestAnimationFrame(function () { cards.forEach(function (c, n) { c.style.transitionDelay = (Math.min(n, 8) * 0.03) + 's'; c.classList.remove('is-swap'); }); });
          setTimeout(function () { cards.forEach(function (c) { c.style.transitionDelay = ''; }); if (HAS) ScrollTrigger.refresh(); }, 700);
        }, RM ? 0 : 260);
      });
    });
  }

  /* ---------- лента концепций ---------- */
  var rib = $('#rib');
  if (rib) {
    var rbs = $$('.rib-nav .rb');
    var stepW = function () { var c = $('.pc', rib); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rib).columnGap || 16) : 320; };
    var upd = function () {
      var max = rib.scrollWidth - rib.clientWidth - 2;
      rbs[0].disabled = rib.scrollLeft <= 2; rbs[1].disabled = rib.scrollLeft >= max;
      $('.rib-nav').hidden = max <= 4;
    };
    rbs.forEach(function (b) { b.addEventListener('click', function () { rib.scrollBy({ left: stepW() * Number(b.getAttribute('data-dir')), behavior: RM ? 'auto' : 'smooth' }); }); });
    rib.addEventListener('scroll', upd, { passive: true }); w.addEventListener('resize', upd); upd();
  }

  /* ---------- вкладка объекта ---------- */
  var mdl = $('#mdl'), mImg = $('#mdlImg'), mFrame = $('#mdlFrame'), mTh = $('#mdlTh'), mC = $('#mdlC'), gal = [], gi = 0, lastFocus = null, curName = '';
  function src(n, big) {
    var s = n.indexOf('palazzo-v') === 0 ? (big ? 1200 : 800) : (n.indexOf('palazzo-') === 0 ? (big ? 1920 : 800) : (big ? 1600 : 800));
    return 'assets/photos/' + n + '-' + s + '.webp';
  }
  function show(i) {
    gi = (i + gal.length) % gal.length;
    var big = !(w.innerWidth < 700 && (w.devicePixelRatio || 1) < 2);
    var url = src(gal[gi], big), pre = new Image();
    mFrame.classList.remove('is-in');
    pre.onload = function () {
      if (gal[gi] !== pre._n) return;
      setTimeout(function () { mImg.src = url; mImg.alt = curName; requestAnimationFrame(function () { setTimeout(function () { mFrame.classList.add('is-in'); }, 140); }); }, 160);
    };
    pre._n = gal[gi]; pre.src = url;
    mC.textContent = (gi + 1) + ' / ' + gal.length;
    $$('button', mTh).forEach(function (b, n) { b.classList.toggle('is-on', n === gi); });
    if (gal.length > 1) { var nx = new Image(); nx.src = src(gal[(gi + 1) % gal.length], big); }
  }
  function openCard(card) {
    if (!card) return;
    gal = card.getAttribute('data-gal').split('|'); curName = $('.pc-n', card).textContent;
    $('#mdlM').innerHTML = $('.meta', card).innerHTML;
    $('#mdlN').textContent = curName;
    var ds = $('.pc-desc', card); $('#mdlD').textContent = ds ? ds.textContent : ''; $('#mdlD').hidden = !ds || card.classList.contains('pc--k');
    $('#mdlWa').href = waUrl(tr('wa.t.similar') + '\n' + curName);
    mTh.innerHTML = ''; mTh.hidden = gal.length < 2;
    $$('.mdl-p, .mdl-nx, .mdl-c', mdl).forEach(function (b) { b.hidden = gal.length < 2; });
    gal.forEach(function (n, i) {
      var b = d.createElement('button'); b.type = 'button';
      b.innerHTML = '<img src="' + src(n, false) + '" alt="" loading="lazy" decoding="async">';
      b.addEventListener('click', function () { show(i); }); mTh.appendChild(b);
    });
    mImg.removeAttribute('src');
    lastFocus = d.activeElement;
    mdl.hidden = false; d.body.style.overflow = 'hidden'; if (lenis) lenis.stop();
    requestAnimationFrame(function () { mdl.classList.add('is-open'); $('.mdl-x').focus(); });
    show(0);
  }
  function closeMdl() {
    if (mdl.hidden) return;
    mdl.classList.remove('is-open');
    setTimeout(function () { mdl.hidden = true; d.body.style.overflow = ''; if (lenis) lenis.start(); if (lastFocus) lastFocus.focus({ preventScroll: true }); }, 320);
  }
  d.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'), c = e.target.closest('.pc');
    if (o) { e.preventDefault(); openCard($('#proj-' + o.getAttribute('data-open'))); }
    else if (c) { e.preventDefault(); openCard(c); }
    else if (e.target.closest('[data-close]')) closeMdl();
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

  /* ---------- запуск ---------- */
  hero();
  reveals();
  parallax();
  var want = null;
  try { want = new URLSearchParams(w.location.search).get('lang') || localStorage.getItem('arhion-lang'); } catch (e) {}
  var fontsReady = (d.fonts && d.fonts.ready) ? d.fonts.ready : Promise.resolve();
  fontsReady.then(function () { if (want && want !== 'ru') setLang(want, false); else split(false); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { if (HAS) ScrollTrigger.refresh(); });
  w.addEventListener('load', function () { if (HAS) ScrollTrigger.refresh(); });
})();
