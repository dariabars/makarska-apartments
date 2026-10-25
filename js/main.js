/* Pomalo, Promajna. Shared logic: season, language, header, motion, slider, forms, assistant, footer. */
(function () {
  'use strict';
  var D = window.POMALO;
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduced = false; // анимации в reduced-motion не выключаем (LESSONS 2026-10-24)
  var isMobile = function () { return window.innerWidth <= 1100; };

  /* ---------- state ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var params = new URLSearchParams(location.search);
  function defaultSeason() { var m = new Date().getMonth() + 1; return (m >= 5 && m <= 9) ? 'summer' : 'winter'; }
  var state = {
    season: (function () { var p = params.get('season'); if (p === 'summer' || p === 'winter') return p; var s = store.get('pm-season'); return (s === 'summer' || s === 'winter') ? s : defaultSeason(); })(),
    lang: (function () { var p = params.get('lang'); if (p === 'ua' || p === 'en') return p; var l = store.get('pm-lang'); return (l === 'en') ? 'en' : 'ua'; })()
  };
  function t(key) { var v = D.ui[state.lang][key]; return v === undefined ? (D.ui.ua[key] === undefined ? key : D.ui.ua[key]) : v; }
  function ts(key) { var v = D.season[state.lang][state.season][key]; return v === undefined ? D.season.ua[state.season][key] : v; }
  function img(name, small) { return 'assets/img/' + name + (small ? '-sm' : '') + '.webp'; }
  function setImg(el, name) {
    if (!el) return;
    var sm = el.hasAttribute('data-sm');
    if (sm) { el.src = img(name, true); el.removeAttribute('srcset'); return; }
    el.src = img(name); el.srcset = img(name, true) + ' 800w, ' + img(name) + ' 1672w';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function priceLabel() { return t('price.' + state.season); }
  function typeName(type) { return t('type.' + type); }

  /* ---------- crest ---------- */
  $$('[data-crest]').forEach(function (el) { el.innerHTML = D.crest; });

  /* ---------- words ---------- */
  function splitWords(el) {
    var text = el.getAttribute('data-text') || el.textContent;
    el.setAttribute('data-text', text);
    var words = text.split(' ');
    el.innerHTML = words.map(function (w, i) {
      return '<span class="rv" style="transition-delay:' + (i * 70) + 'ms"><span style="transition-delay:' + (i * 70) + 'ms">' + w + '</span></span>' + (i < words.length - 1 ? ' ' : '');
    }).join('');
  }

  /* ---------- i18n apply ---------- */
  function applyTexts() {
    doc.documentElement.lang = state.lang === 'ua' ? 'uk' : 'en';
    doc.title = t('meta.title');
    var md = $('meta[name="description"]'); if (md) md.content = t('meta.desc');
    $$('[data-ui]').forEach(function (el) { el.textContent = t(el.getAttribute('data-ui')); el.removeAttribute('data-text'); });
    $$('[data-ui-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-ui-ph')); });
    $$('[data-s]').forEach(function (el) {
      var v = ts(el.getAttribute('data-s'));
      if (typeof v === 'string') { el.textContent = v; el.removeAttribute('data-text'); }
    });
    $$('[data-img]').forEach(function (el) { setImg(el, ts(el.getAttribute('data-img'))); });
    $$('[data-words]').forEach(splitWords);
    $$('[data-set-lang]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-set-lang') === state.lang); });
    $$('[data-set-season]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-set-season') === state.season); });
    var hs = $('#hero-sub'); if (hs) hs.textContent = t('hero.' + state.season + '.sub');
    doc.body.classList.toggle('winter', state.season === 'winter');
    doc.body.classList.toggle('summer', state.season === 'summer');
    $$('[data-hero]').forEach(function (im) { im.classList.toggle('on', im.getAttribute('data-hero') === state.season); });
  }

  function setLang(l) {
    if (l === state.lang) return;
    state.lang = l; store.set('pm-lang', l);
    renderAll();
  }
  function setSeason(s, instant) {
    if (s === state.season && !instant) return;
    var veil = $('#veil');
    var run = function () { state.season = s; store.set('pm-season', s); updateUrl(); renderAll(); };
    if (instant || !veil || reduced) { run(); return; }
    veil.classList.toggle('winter', s === 'winter');
    veil.classList.add('on');
    setTimeout(function () { run(); setTimeout(function () { veil.classList.remove('on'); }, 150); }, 320);
  }
  function updateUrl() {
    try { var u = new URL(location.href); u.searchParams.set('season', state.season); history.replaceState(null, '', u.toString()); } catch (e) {}
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set-lang]'); if (b) { setLang(b.getAttribute('data-set-lang')); return; }
    var s = e.target.closest('[data-set-season]'); if (s) { setSeason(s.getAttribute('data-set-season')); return; }
    var tg = e.target.closest('[data-season-toggle]'); if (tg) { setSeason(state.season === 'summer' ? 'winter' : 'summer'); }
  });

  /* ---------- scroll: Lenis ---------- */
  var lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new window.Lenis({ duration: 1.2, smoothWheel: true });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
  }
  function scrollTo(target, offset) {
    var el = typeof target === 'string' ? $(target) : target;
    var y = el ? el.getBoundingClientRect().top + window.scrollY + (offset || 0) : 0;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#' || a.hasAttribute('data-ask-open')) return;
    if (a.hasAttribute('data-scroll-top')) { e.preventDefault(); closeMenu(); scrollTo(doc.body); return; }
    var el = $(href);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollTo(el, 0);
  });

  /* ---------- header ---------- */
  var hdr = $('#hdr'), progress = $('#progress');
  var pageSolid = doc.body.classList.contains('page-solid');
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('scrolled', y > 40 || pageSolid);
    if (progress) { var h = doc.documentElement.scrollHeight - window.innerHeight; progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')'; }
    tickParallax();
    tickDays();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var mmenu = $('#mmenu'), burger = $('#burger');
  function openMenu() { if (!mmenu) return; mmenu.classList.add('open'); doc.body.classList.add('no-scroll'); burger.setAttribute('aria-expanded', 'true'); if (lenis) lenis.stop(); var f = $('a, button', mmenu); if (f) f.focus(); }
  function closeMenu() { if (!mmenu || !mmenu.classList.contains('open')) return; mmenu.classList.remove('open'); doc.body.classList.remove('no-scroll'); burger.setAttribute('aria-expanded', 'false'); if (lenis) lenis.start(); }
  if (burger) burger.addEventListener('click', openMenu);
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeAsk(); closeCal(); } });

  /* ---------- reveal ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' }) : null;
  function observeAll() { $$('[data-reveal]').forEach(function (el) { if (el.classList.contains('in')) return; if (io) io.observe(el); else el.classList.add('in'); }); }

  /* ---------- parallax ---------- */
  var aboutPhs = $$('.about .ph'), ctaPhs = $$('.cta .ph');
  function tickParallax() {
    if (reduced || isMobile()) return;
    var vh = window.innerHeight;
    var about = $('.about');
    if (about && aboutPhs.length) {
      var r = about.getBoundingClientRect();
      var p = (vh - r.top) / (vh + r.height) - .5;
      aboutPhs.forEach(function (ph) { var dir = parseFloat(ph.getAttribute('data-parallax')) || 1; ph.style.setProperty('--py', (p * 120 * dir) + 'px'); });
    }
    var cta = $('.cta');
    if (cta && ctaPhs.length) {
      var rc = cta.getBoundingClientRect();
      var pc = (vh - rc.top) / (vh + rc.height) - .5;
      ctaPhs.forEach(function (ph) { var sp = parseFloat(ph.getAttribute('data-speed')) || .1; var rot = ph.classList.contains('p1') ? -3 : ph.classList.contains('p2') ? 2.5 : ph.classList.contains('p3') ? 2 : -2; ph.style.transform = 'translateY(' + (pc * 600 * sp) + 'px) rotate(' + rot + 'deg)'; });
    }
  }

  /* ---------- S3 slider ---------- */
  var types = ['studio', 'one', 'two', 'terrace'];
  var sl = { i: 0, timer: null, paused: false };
  var sliderEl = $('#apartments');
  function buildSlider() {
    if (!sliderEl) return;
    var slides = $('#apt-slides');
    slides.innerHTML = types.map(function (tp, i) {
      var n = D.typeMeta[tp].img;
      return '<div class="slide' + (i === 0 ? ' on' : '') + '"><img src="' + img(n) + '" srcset="' + img(n, true) + ' 800w, ' + img(n) + ' 1672w" sizes="100vw" alt=""' + (i ? ' loading="lazy"' : '') + '></div>';
    }).join('');
    $('#apt-bars').innerHTML = types.map(function (tp, i) { return '<button type="button" data-go="' + i + '" aria-label="' + (i + 1) + '"' + (i === 0 ? ' class="on"' : '') + '></button>'; }).join('');
    $('#apt-total').textContent = pad(types.length);
    sliderEl.addEventListener('mouseenter', function () { sl.paused = true; });
    sliderEl.addEventListener('mouseleave', function () { sl.paused = false; });
    sliderEl.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]'); if (g) { go(parseInt(g.getAttribute('data-go'), 10)); return; }
      if (e.target.closest('[data-apt-prev]')) { go(sl.i - 1); return; }
      if (e.target.closest('[data-apt-next]')) { go(sl.i + 1); return; }
      var ts = e.target.closest('#apt-tabsel > button'); if (ts) { $('#apt-tabsel').classList.toggle('open'); return; }
      var more = e.target.closest('.card .more'); if (more) { $('#apt-card').classList.toggle('exp'); }
    });
    var sx = 0;
    sliderEl.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    sliderEl.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(sl.i + (dx < 0 ? 1 : -1)); }, { passive: true });
    sl.timer = setInterval(function () { if (!sl.paused && !doc.hidden) go(sl.i + 1); }, 7000);
  }
  function renderSliderText() {
    if (!sliderEl) return;
    $('#apt-tabs').innerHTML = types.map(function (tp, i) { return '<button type="button" class="btn-pill' + (i === sl.i ? ' on' : '') + '" data-go="' + i + '">' + typeName(tp) + '</button>'; }).join('');
    var tsel = $('#apt-tabsel');
    $('span', tsel).textContent = typeName(types[sl.i]);
    $('ul', tsel).innerHTML = types.map(function (tp, i) { return '<li><button type="button" class="' + (i === sl.i ? 'on' : '') + '" data-go="' + i + '">' + typeName(tp) + '</button></li>'; }).join('');
    tsel.classList.remove('open');
    var tp = types[sl.i];
    var sample = D.apartments.filter(function (a) { return a.type === tp; }).sort(function (a, b) { return b.guests - a.guests; })[0];
    var bedrooms = sample.bedrooms === 0 ? t('s3.studio') : sample.bedrooms;
    $('#apt-card').innerHTML =
      '<h3>' + typeName(tp) + '</h3>' +
      '<div class="facts">' + t('s3.guests') + ': ' + t('s3.upto') + ' ' + sample.guests + ' · ' + t('s3.bedrooms') + ': ' + bedrooms + '</div>' +
      '<div class="has">' + t('s3.has') + '</div>' +
      '<div class="chips">' + D.amenities.map(function (a) { return '<span class="chip">' + t('am.' + a) + '</span>'; }).join('') + '</div>' +
      '<div class="price">' + priceLabel() + '</div>' +
      '<button type="button" class="more">' + t('s3.details') + '<i></i></button>';
    $('#apt-cur').textContent = pad(sl.i + 1);
    $$('#apt-bars button').forEach(function (b, i) { b.classList.toggle('on', i === sl.i); });
    $$('#apt-slides .slide').forEach(function (s, i) { s.classList.toggle('on', i === sl.i); });
  }
  function go(i) { sl.i = (i + types.length) % types.length; renderSliderText(); }

  /* ---------- S4 days ---------- */
  var daysPin = $('#days-pin'), daysTrack = $('#days-track'), daysView = $('#days-view');
  function renderDays() {
    if (!daysTrack) return;
    var cards = ts('s4.cards');
    daysTrack.innerHTML = cards.map(function (c, i) {
      var pos = c.pos ? ' style="object-position:' + c.pos + '"' : '';
      return '<article class="dcard" tabindex="0"><img src="' + img(c.img, true) + '" srcset="' + img(c.img, true) + ' 800w, ' + img(c.img) + ' 1122w" sizes="400px" alt=""' + pos + ' loading="lazy">' +
        '<span class="n">' + pad(i + 1) + ' / ' + pad(cards.length) + '</span><span class="big">' + pad(i + 1) + '</span>' +
        '<div class="txt"><h3>' + c.t + '</h3><i></i><p>' + c.p + '</p></div></article>';
    }).join('');
    daysTrack.style.transform = '';
    layoutDays();
  }
  function layoutDays() {
    if (!daysPin) return;
    if (isMobile() || reduced) { daysPin.style.height = ''; daysTrack.style.transform = ''; return; }
    var extra = daysTrack.scrollWidth - window.innerWidth;
    daysPin.style.height = (window.innerHeight + Math.max(0, extra) + 200) + 'px';
    tickDays();
  }
  function tickDays() {
    if (!daysPin || isMobile() || reduced) return;
    var r = daysPin.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    if (total <= 0) return;
    var p = Math.min(1, Math.max(0, -r.top / total));
    var extra = daysTrack.scrollWidth - window.innerWidth;
    daysTrack.style.transform = 'translate3d(' + (-p * Math.max(0, extra)) + 'px,0,0)';
  }
  $$('[data-days-prev],[data-days-next]').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = $('.dcard', daysTrack); if (!card) return;
      var w = card.getBoundingClientRect().width + 16;
      daysTrack.scrollBy({ left: b.hasAttribute('data-days-next') ? w : -w, behavior: 'smooth' });
    });
  });
  if (daysTrack) daysTrack.addEventListener('click', function (e) { var c = e.target.closest('.dcard'); if (c && isMobile()) { $$('.dcard.open', daysTrack).forEach(function (o) { if (o !== c) o.classList.remove('open'); }); c.classList.toggle('open'); } });

  /* ---------- S5 split ---------- */
  var sp = { i: 0, timer: null };
  function renderSplit() {
    var wrap = $('#split-slides'); if (!wrap) return;
    var slides = ts('s5.slides');
    wrap.innerHTML = slides.map(function (s, i) { return '<p class="' + (i === 0 ? 'on' : '') + '">' + s + '</p>'; }).join('');
    $('#split-dots').innerHTML = slides.map(function (s, i) { return '<button type="button" data-sp="' + i + '" aria-label="' + (i + 1) + '" class="' + (i === 0 ? 'on' : '') + '"></button>'; }).join('');
    sp.i = 0;
    fitSplit();
    var calc = $('#calc');
    if (calc) { calc.hidden = state.season !== 'winter'; renderCalc(); }
    var link = $('#split-link');
    if (link) link.setAttribute('href', state.season === 'winter' ? '#calc' : '#booking');
  }
  function fitSplit() {
    var wrap = $('#split-slides'); if (!wrap) return;
    var h = 0; $$('p', wrap).forEach(function (p) { h = Math.max(h, p.scrollHeight); });
    wrap.style.minHeight = (h + 4) + 'px';
  }
  function goSplit(i) {
    var ps = $$('#split-slides p'); if (!ps.length) return;
    sp.i = (i + ps.length) % ps.length;
    ps.forEach(function (p, k) { p.classList.toggle('on', k === sp.i); });
    $$('#split-dots button').forEach(function (b, k) { b.classList.toggle('on', k === sp.i); });
  }
  doc.addEventListener('click', function (e) { var b = e.target.closest('[data-sp]'); if (b) goSplit(parseInt(b.getAttribute('data-sp'), 10)); });
  if ($('#split-slides')) sp.timer = setInterval(function () { if (!doc.hidden) goSplit(sp.i + 1); }, 5000);
  function renderCalc() {
    var r = $('#calc-range'); if (!r) return;
    var n = parseInt(r.value, 10);
    $('#calc-n').textContent = n;
    $('#calc-out').innerHTML = t('s5.calc.for') + ' ' + n + ' ' + (state.lang === 'en' ? t('s5.calc.months') : (n < 5 ? 'місяці' : 'місяців')) + ': <span>' + n + '×450 € = ' + (n * 450).toLocaleString('uk-UA').replace(/ /g, ' ') + ' €</span><br>' + t('s5.calc.checkin') + ': <span>1 350 €</span>';
  }
  var calcRange = $('#calc-range'); if (calcRange) calcRange.addEventListener('input', renderCalc);

  /* ---------- S6 feature + map ---------- */
  var map = null, mapLayer = null, route = 'd1';
  function renderFeature() {
    var fs = $('#feature-summer'), fw = $('#feature-winter'); if (!fs) return;
    var facts = ts('s6.facts');
    fs.hidden = state.season !== 'summer'; fw.hidden = state.season !== 'winter';
    $('#facts-summer').innerHTML = facts.map(function (f) { return '<div>' + f + '</div>'; }).join('');
    $('#facts-winter').innerHTML = facts.map(function (f) { return '<li>' + f + '</li>'; }).join('');
    if (state.season === 'summer') { renderRoute(); setTimeout(initMap, 50); }
  }
  function renderRoute() {
    var list = $('#route-list'); if (!list) return;
    var R = D.routes[route];
    var html = '';
    if (route !== 'd1') html += '<li class="plus">' + t('s6.plus') + '</li>';
    html += R[state.lang].map(function (s, i) { return '<li><span class="num">' + (i + 1) + '</span><span>' + s + '</span></li>'; }).join('');
    list.innerHTML = html;
    $$('#route-tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-route') === route); });
    drawRoute();
  }
  doc.addEventListener('click', function (e) { var b = e.target.closest('[data-route]'); if (b) { route = b.getAttribute('data-route'); renderRoute(); } });
  function initMap() {
    var el = $('#map'); if (!el || map) { if (map) { map.invalidateSize(); drawRoute(); } return; }
    if (!window.L) { $('#map-fallback').textContent = t('cat.sea'); return; }
    map = window.L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([43.3349, 16.9737], 12);
    /* CARTO Positron now answers with an "API key required" watermark, so the base map is standard OSM, muted by CSS to match the cream palette */
    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(map);
    mapLayer = window.L.layerGroup().addTo(map);
    drawRoute();
  }
  function drawRoute() {
    if (!map || !mapLayer) return;
    mapLayer.clearLayers();
    var R = D.routes[route], L = window.L;
    var home = D.points.promajna;
    var pts = [home.ll];
    L.marker(home.ll, { icon: L.divIcon({ className: '', html: '<div class="pin home">●</div>', iconSize: [30, 30], iconAnchor: [15, 15] }) }).bindPopup('<b>' + home[state.lang] + '</b>').addTo(mapLayer);
    R.pts.forEach(function (k, i) {
      var p = D.points[k]; pts.push(p.ll);
      L.marker(p.ll, { icon: L.divIcon({ className: '', html: '<div class="pin">' + (i + 1) + '</div>', iconSize: [30, 30], iconAnchor: [15, 15] }) }).bindPopup('<b>' + p[state.lang] + '</b><br>' + R[state.lang][i]).addTo(mapLayer);
    });
    L.polyline(pts, { color: '#9e7c4f', weight: 1.5, dashArray: '4 6', opacity: .8 }).addTo(mapLayer);
    map.fitBounds(L.latLngBounds(pts).pad(.25), { animate: true });
  }

  /* ---------- calendar ---------- */
  var cal = { open: null };
  function dKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fmtShort(d) { return d.getDate() + ' ' + t('months.g')[d.getMonth()]; }
  function hash(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100003; return h; }
  function busyFor(id, d) {
    if (!id) return false;
    var h = hash(id + ':' + dKey(d));
    var seed = hash(id);
    var day = Math.floor(d.getTime() / 864e5);
    var block = Math.floor((day + seed) / 9) % 4;
    return block === 1 && (h % 7 !== 0);
  }
  function buildCalendar(opts) {
    /* opts: {el, months:2|3, start:Date, range:bool, aptId, onChange, static:bool} */
    var el = opts.el, monthsN = opts.months || 2, offset = 0, a = null, b = null;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    function render() {
      var first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      var head = '<div class="cal-head"><button type="button" data-cal-nav="-1" aria-label="' + t('cal.prev') + '"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg></button><span class="rng">' + rangeText() + '</span><button type="button" data-cal-nav="1" aria-label="' + t('cal.next') + '"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5"/></svg></button></div>';
      var months = '';
      for (var m = 0; m < monthsN; m++) {
        var md = new Date(first.getFullYear(), first.getMonth() + m, 1);
        months += '<div class="cal-m"><h4>' + t('months')[md.getMonth()] + ' ' + md.getFullYear() + '</h4><div class="cal-grid">' + t('days').map(function (d) { return '<span class="dn">' + d + '</span>'; }).join('');
        var startDow = (md.getDay() + 6) % 7;
        for (var e = 0; e < startDow; e++) months += '<span class="d off"></span>';
        var dim = new Date(md.getFullYear(), md.getMonth() + 1, 0).getDate();
        for (var d = 1; d <= dim; d++) {
          var dt = new Date(md.getFullYear(), md.getMonth(), d);
          var cls = 'd';
          if (dt < today) cls += ' off';
          else if (busyFor(opts.aptId, dt)) cls += ' busy';
          if (a && dKey(dt) === dKey(a)) cls += ' a';
          if (b && dKey(dt) === dKey(b)) cls += ' b';
          if (a && b && dt > a && dt < b) cls += ' in';
          months += (opts.range ? '<button type="button" class="' + cls + '" data-cal-d="' + dKey(dt) + '">' : '<span class="' + cls + '">') + d + (opts.range ? '</button>' : '</span>');
        }
        months += '</div></div>';
      }
      var foot = opts.range ? '<div class="cal-foot"><button type="button" data-cal-clear>' + t('cal.clear') + '</button><button type="button" data-cal-done>' + t('cal.done') + '</button></div>' :
        '<div class="cal-legend"><span><i class="busy"></i>' + t('cal.busy') + '</span><span><i class="free"></i>' + t('cal.free') + '</span></div>';
      el.innerHTML = head + '<div class="cal-months' + (monthsN === 3 ? ' three' : '') + '">' + months + '</div>' + foot;
    }
    function rangeText() {
      if (!opts.range) return opts.aptId ? (t('cat.apt') + ' ' + opts.aptId) : '';
      if (a && b) { var n = Math.round((b - a) / 864e5); return fmtShort(a) + ' - ' + fmtShort(b) + ' · ' + n + ' ' + t('cal.nights'); }
      if (a) return t('cal.checkin') + ': ' + fmtShort(a) + ' · ' + t('cal.checkout') + '?';
      return t('cal.checkin') + ' · ' + t('cal.checkout');
    }
    el.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-cal-nav]'); if (nav) { offset = Math.max(0, Math.min(12, offset + parseInt(nav.getAttribute('data-cal-nav'), 10))); render(); return; }
      var dd = e.target.closest('[data-cal-d]');
      if (dd) {
        var parts = dd.getAttribute('data-cal-d').split('-'); var dt = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        if (!a || (a && b)) { a = dt; b = null; } else if (dt <= a) { a = dt; } else { b = dt; }
        render(); if (opts.onChange) opts.onChange(a, b); return;
      }
      if (e.target.closest('[data-cal-clear]')) { a = b = null; render(); if (opts.onChange) opts.onChange(null, null); return; }
      if (e.target.closest('[data-cal-done]')) { if (opts.onDone) opts.onDone(a, b); }
    });
    render();
    return { render: render, get: function () { return { a: a, b: b }; }, setLang: render };
  }
  function closeCal() { if (cal.open) { cal.open.classList.remove('open'); cal.open = null; } }
  doc.addEventListener('click', function (e) {
    if (!cal.open) return;
    var path = e.composedPath ? e.composedPath() : [];
    var inside = path.some(function (n) { return n === cal.open || (n.hasAttribute && n.hasAttribute('data-cal-toggle')); });
    if (!inside) closeCal();
  });

  /* ---------- booking form ---------- */
  var formState = { a: null, b: null, calObj: null };
  function selectHtml(name, label, options, full) {
    return '<div class="f' + (full ? ' full' : '') + '"><label for="f-' + name + '">' + label + '</label><div class="sel"><select id="f-' + name + '" name="' + name + '">' + options.map(function (o) { return '<option value="' + o.v + '">' + o.l + '</option>'; }).join('') + '</select></div></div>';
  }
  function inputHtml(name, label, ph, type, full) {
    return '<div class="f' + (full ? ' full' : '') + '"><label for="f-' + name + '">' + label + '</label><input id="f-' + name + '" name="' + name + '" type="' + (type || 'text') + '" placeholder="' + ph + '" autocomplete="off"></div>';
  }
  function renderForm(form, presetApt) {
    if (!form) return;
    var S = state.season === 'summer';
    var aptOpts = [{ v: '', l: t('f.apt.any') }].concat(D.apartments.map(function (a) { return { v: a.id, l: t('cat.apt') + ' ' + a.id + ' · ' + t('type.' + a.type + '.s') + ' · ' + a.area + ' m²' }; }));
    var html = '';
    if (S) {
      html += '<div class="f full"><span class="lbl">' + t('f.dates') + '</span><button type="button" class="fake empty" id="f-dates" data-cal-toggle><span>' + t('f.dates.ph') + '</span><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11"/><path d="M2 7h12M5 1v3M11 1v3"/></svg></button><div class="cal" id="f-cal"></div></div>';
      html += selectHtml('adults', t('f.adults'), [1, 2, 3, 4, 5].map(function (n) { return { v: n, l: n }; }));
      html += selectHtml('children', t('f.children'), [{ v: 0, l: t('f.children.0') }, { v: 1, l: 1 }, { v: 2, l: 2 }, { v: 3, l: 3 }]);
      html += selectHtml('apt', t('f.apt'), aptOpts, true);
    } else {
      var now = new Date(); var mo = [];
      for (var i = 0; i < 12; i++) { var d = new Date(now.getFullYear(), now.getMonth() + i, 1); mo.push({ v: d.getFullYear() + '-' + pad(d.getMonth() + 1), l: t('months')[d.getMonth()] + ' ' + d.getFullYear() }); }
      html += selectHtml('month', t('f.month'), [{ v: '', l: '' }].concat(mo));
      html += selectHtml('months', t('f.months'), [2, 3, 4, 5, 6, 7, 8].map(function (n) { return { v: n, l: n + ' ' + t('f.months.n') }; }));
      html += selectHtml('guests', t('f.guests'), [1, 2, 3, 4, 5].map(function (n) { return { v: n, l: n }; }));
      html += inputHtml('budget', t('f.budget'), t('f.budget.ph'));
    }
    html += inputHtml('name', t('f.name'), t('f.name.ph'));
    html += inputHtml('contact', t('f.contact'), t('f.contact.ph'));
    html += '<div class="f full"><span class="lbl">' + t('f.how') + '</span><div class="how">' + ['WhatsApp', 'Telegram', 'Viber'].map(function (m, i) { return '<label><input type="radio" name="how" value="' + m + '"' + (i === 0 ? ' checked' : '') + '><span>' + m + '</span></label>'; }).join('') + '</div></div>';
    html += '<div class="f full"><label for="f-wishes">' + t('f.wishes') + '</label><textarea id="f-wishes" name="wishes" rows="1" placeholder="' + t('f.wishes.ph') + '"></textarea></div>';
    html += '<div class="submit"><button type="submit" class="btn-line">' + t('f.send') + '</button></div>';
    form.innerHTML = html;
    if (S) {
      var sel = $('#f-adults', form); if (sel) sel.value = '2';
      if (presetApt) { var ap = $('#f-apt', form); if (ap) ap.value = presetApt; }
      var calEl = $('#f-cal', form), fake = $('#f-dates', form);
      formState.a = formState.b = null;
      formState.calObj = buildCalendar({ el: calEl, months: 2, range: true, aptId: presetApt || null, onChange: function (a, b) {
        formState.a = a; formState.b = b;
        var sp = $('span', fake);
        if (a && b) { sp.textContent = fmtShort(a) + ' - ' + fmtShort(b); fake.classList.remove('empty'); }
        else if (a) { sp.textContent = fmtShort(a) + ' - ?'; fake.classList.remove('empty'); }
        else { sp.textContent = t('f.dates.ph'); fake.classList.add('empty'); }
        if (a && b) setTimeout(closeCal, 250);
      }, onDone: closeCal });
      fake.addEventListener('click', function () { if (cal.open === calEl) { closeCal(); } else { closeCal(); calEl.classList.add('open'); cal.open = calEl; } });
    } else {
      var ms = $('#f-months', form); if (ms) ms.value = '2';
      var gs = $('#f-guests', form); if (gs) gs.value = '2';
    }
  }
  function validate(form) {
    var ok = true;
    $$('.f', form).forEach(function (f) { f.classList.remove('bad'); var e = $('.err', f); if (e) e.remove(); });
    function bad(el, msg) { var f = el.closest('.f'); f.classList.add('bad'); f.insertAdjacentHTML('beforeend', '<span class="err">' + msg + '</span>'); ok = false; }
    if (state.season === 'summer') { if (!(formState.a && formState.b)) bad($('#f-dates', form), t('f.err.dates')); }
    else { var m = $('#f-month', form); if (m && !m.value) bad(m, t('f.err.month')); }
    var n = $('#f-name', form); if (!n.value.trim()) bad(n, t('f.err.name'));
    var c = $('#f-contact', form); if (c.value.trim().length < 3) bad(c, t('f.err.contact'));
    return ok;
  }
  doc.addEventListener('submit', function (e) {
    var form = e.target.closest('.form'); if (!form) return;
    e.preventDefault();
    if (!validate(form)) { var first = $('.f.bad', form); if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    form.innerHTML = '<div class="sent">' + t('f.sent') + '<small>' + t('f.sent.note') + '</small></div>';
  });

  /* ---------- footer ---------- */
  function renderMarquee() {
    var m = $('#marquee'); if (!m) return;
    var items = ts('marquee');
    var one = items.map(function (s) { return '<span' + (s === 'Pomalo' ? ' class="script"' : '') + '>' + s + '</span>'; }).join('');
    m.innerHTML = one + one + one + one;
  }
  function clock() {
    var el = $('#clock'); if (!el) return;
    try { el.textContent = new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Zagreb', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()); }
    catch (e) { var d = new Date(); el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  }
  var weather = { air: null, sea: null, failed: false };
  function renderWeather() {
    var el = $('#weather'); if (!el) return;
    if (weather.air === null && weather.sea === null) { el.textContent = state.lang === 'ua' ? 'Промайна' : 'Promajna'; return; }
    var parts = [];
    if (weather.air !== null) parts.push(t('ft.air') + ' ' + (weather.air >= 0 ? '+' : '') + Math.round(weather.air) + '°');
    if (weather.sea !== null) parts.push(t('ft.seat') + ' ' + (weather.sea >= 0 ? '+' : '') + Math.round(weather.sea) + '°');
    el.textContent = parts.join(' · ');
  }
  function loadWeather() {
    if (!$('#weather') || !window.fetch) return;
    fetch('https://api.open-meteo.com/v1/forecast?latitude=43.3349&longitude=16.9737&current=temperature_2m').then(function (r) { return r.json(); }).then(function (j) { weather.air = j.current.temperature_2m; renderWeather(); }).catch(function () {});
    fetch('https://marine-api.open-meteo.com/v1/marine?latitude=43.33&longitude=16.97&current=sea_surface_temperature').then(function (r) { return r.json(); }).then(function (j) { weather.sea = j.current.sea_surface_temperature; renderWeather(); }).catch(function () {});
  }

  /* ---------- assistant ---------- */
  var askEl = $('#ask'), askBtn = $('#ask-btn');
  function openAsk() { if (!askEl) return; askEl.classList.add('open'); askBtn.setAttribute('aria-expanded', 'true'); var i = $('#ask-input'); if (i && !isMobile()) i.focus(); }
  function closeAsk() { if (!askEl) return; askEl.classList.remove('open'); askBtn.setAttribute('aria-expanded', 'false'); }
  if (askBtn) askBtn.addEventListener('click', function () { askEl.classList.contains('open') ? closeAsk() : openAsk(); });
  $$('[data-ask-close]').forEach(function (b) { b.addEventListener('click', closeAsk); });
  doc.addEventListener('click', function (e) { var a = e.target.closest('[data-ask-open]'); if (a) { e.preventDefault(); openAsk(); } });
  function renderAskQs() {
    var qs = $('#ask-qs'); if (!qs) return;
    qs.innerHTML = D.assistant[state.lang].map(function (q, i) { return '<button type="button" data-q="' + i + '">' + q.q + '</button>'; }).join('');
  }
  function typeMsg(text) {
    var body = $('#ask-body');
    var m = doc.createElement('div'); m.className = 'msg a'; m.innerHTML = '<span class="tx"></span><span class="cur"></span>';
    body.appendChild(m); body.scrollTop = body.scrollHeight;
    var tx = $('.tx', m), i = 0;
    var iv = setInterval(function () { i += 2; tx.textContent = text.slice(0, i); body.scrollTop = body.scrollHeight; if (i >= text.length) { clearInterval(iv); $('.cur', m).remove(); } }, 18);
  }
  function userMsg(text) { var body = $('#ask-body'); var m = doc.createElement('div'); m.className = 'msg u'; m.textContent = text; body.appendChild(m); body.scrollTop = body.scrollHeight; }
  doc.addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'); if (!q) return;
    var item = D.assistant[state.lang][parseInt(q.getAttribute('data-q'), 10)];
    userMsg(item.q); setTimeout(function () { typeMsg(item.a); }, 350);
  });
  var askForm = $('#ask-form');
  if (askForm) askForm.addEventListener('submit', function (e) {
    e.preventDefault(); var i = $('#ask-input'); var v = i.value.trim(); if (!v) return;
    userMsg(v); i.value = '';
    var low = v.toLowerCase(); var found = null;
    var keys = state.lang === 'ua' ? [['зим', 'кошт', 'цін', '450'], ['де ', 'адрес', 'локац', 'промайн'], ['парк', 'wi', 'інтернет', 'мангал'], ['мор', 'вод', 'темп', 'купа'], ['брон', 'заброн', 'запит'], ['докум', 'захист', 'реєстр', 'прописк']]
      : [['winter', 'cost', 'price', '450'], ['where', 'address', 'location', 'promajna'], ['park', 'wi', 'internet', 'grill'], ['sea', 'water', 'temp', 'swim'], ['book', 'reserv', 'request'], ['docum', 'protect', 'regist', 'paper']];
    keys.forEach(function (ks, idx) { if (found === null && ks.some(function (k) { return low.indexOf(k) >= 0; })) found = idx; });
    setTimeout(function () { typeMsg(found === null ? t('as.fallback') : D.assistant[state.lang][found].a); }, 400);
  });

  /* ---------- preloader ---------- */
  function preload() {
    var p = $('#preloader'); if (!p) return;
    var done = function () { p.classList.add('done'); doc.body.classList.remove('no-scroll'); setTimeout(function () { $$('[data-reveal]').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight * .9) el.classList.add('in'); }); }, 200); };
    doc.body.classList.add('no-scroll');
    var started = Date.now();
    var finish = function () { var left = Math.max(0, 1500 - (Date.now() - started)); setTimeout(done, left); };
    if (doc.readyState === 'complete') finish(); else window.addEventListener('load', finish);
    setTimeout(done, 2000);
  }

  /* ---------- render all ---------- */
  function renderAll() {
    applyTexts();
    renderSliderText();
    renderDays();
    renderSplit();
    renderFeature();
    renderForm($('#book-form'), null);
    renderMarquee();
    renderWeather();
    renderAskQs();
    renderCtaImgs();
    if (window.PM_PAGE) window.PM_PAGE.render();
    observeAll();
    tickParallax();
    if (lenis) lenis.resize();
  }
  function renderCtaImgs() {
    var imgs = ts('s8.imgs');
    $$('[data-cta]').forEach(function (im, i) { im.src = img(imgs[i], true); });
  }

  /* ---------- init ---------- */
  buildSlider();
  preload();
  renderAll();
  onScroll();
  clock(); setInterval(clock, 1000);
  loadWeather();
  window.addEventListener('resize', function () { layoutDays(); fitSplit(); if (map) map.invalidateSize(); });
  window.addEventListener('load', function () { layoutDays(); fitSplit(); });
  if (location.hash && $(location.hash)) setTimeout(function () { scrollTo(location.hash); }, 900);

  window.PM = { state: state, t: t, ts: ts, img: img, pad: pad, setSeason: setSeason, buildCalendar: buildCalendar, renderForm: renderForm, typeName: typeName, priceLabel: priceLabel, renderAll: renderAll, scrollTo: scrollTo, observeAll: observeAll, splitWords: splitWords, busyFor: busyFor };
})();


/* glass arrows over the first card on touch widths (PIPELINE wow 4) */
(function () {
  var track = document.getElementById('days-track'), days = document.getElementById('days');
  if (!track || !days) return;
  var prev = days.querySelector('[data-days-prev]'), next = days.querySelector('[data-days-next]');
  function place() {
    if (window.innerWidth > 1100) return;
    var card = track.querySelector('.dcard'); if (!card) return;
    var top = track.getBoundingClientRect().top - days.getBoundingClientRect().top + card.offsetHeight / 2;
    days.style.setProperty('--dnav-top', top + 'px');
    var max = track.scrollWidth - track.clientWidth - 4;
    if (prev) prev.classList.toggle('is-off', track.scrollLeft <= 4);
    if (next) next.classList.toggle('is-off', track.scrollLeft >= max);
  }
  track.addEventListener('scroll', place, { passive: true });
  window.addEventListener('resize', place);
  window.addEventListener('load', place);
  setInterval(place, 1500);
  place();
})();
