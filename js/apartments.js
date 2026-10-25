/* Pomalo, Promajna. Catalog with the house plan and the apartment page. Needs data.js and main.js. */
(function () {
  'use strict';
  var D = window.POMALO, PM = window.PM;
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var t = PM.t, img = PM.img, state = PM.state;

  function byId(id) { for (var i = 0; i < D.apartments.length; i++) if (D.apartments[i].id === id) return D.apartments[i]; return null; }
  function neighbours(a) {
    var above = [], below = [];
    D.apartments.forEach(function (b) {
      var overlap = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      if (overlap <= 5) return;
      if (b.floor === a.floor + 1) above.push(b.id);
      if (b.floor === a.floor - 1) below.push(b.id);
    });
    return { above: above, below: below };
  }
  function aptTitle(a) { return t('cat.apt') + ' ' + a.id; }
  function aptMeta(a) { return a.floor + ' ' + t('cat.floor.n') + ' · ' + t('s3.upto') + ' ' + a.guests + ' ' + t('cat.guests') + ' · ' + a.area + ' m²'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ---------- facade SVG ---------- */
  function facadeSVG(opts) {
    opts = opts || {};
    var W = 1040, H = 600, hx = 150, hw = 740, fh = 108, top = 150;
    var s = '<svg class="facade' + (opts.mini ? ' mini' : '') + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + t('cat.plan.h') + '">';
    /* sky hints: Biokovo ridge */
    s += '<path class="ln thin" d="M0 120 C120 70 220 90 330 60 S520 40 640 70 S850 50 1040 90" stroke-dasharray="2 5"/>';
    /* floor bands */
    for (var f = 1; f <= 3; f++) {
      var y = top + (3 - f) * fh;
      s += '<rect class="floorband" data-floor="' + f + '" x="' + (hx - 6) + '" y="' + y + '" width="' + (hw + 12) + '" height="' + fh + '"/>';
    }
    /* roof */
    s += '<path class="roof" d="M' + (hx - 28) + ' ' + top + ' L' + (hx + 40) + ' ' + (top - 34) + ' L' + (hx + hw - 40) + ' ' + (top - 34) + ' L' + (hx + hw + 28) + ' ' + top + ' Z"/>';
    s += '<path class="ln thin" d="M' + (hx + 40) + ' ' + (top - 34) + ' L' + (hx + hw - 40) + ' ' + (top - 34) + '" />';
    for (var r = hx + 60; r < hx + hw - 40; r += 24) s += '<path class="ln thin" d="M' + r + ' ' + (top - 34) + ' L' + (r - 12) + ' ' + top + '"/>';
    /* walls */
    s += '<rect class="wall" x="' + hx + '" y="' + top + '" width="' + hw + '" height="' + (fh * 3) + '"/>';
    for (f = 1; f <= 2; f++) { var ly = top + f * fh; s += '<path class="ln" d="M' + hx + ' ' + ly + ' H' + (hx + hw) + '"/>'; }
    /* floor captions on the left */
    for (f = 1; f <= 3; f++) {
      var cy = top + (3 - f) * fh + fh / 2;
      s += '<text class="cap" x="' + (hx - 24) + '" y="' + (cy + 3) + '" text-anchor="end">' + f + ' ' + t('cat.floor.n') + '</text>';
    }
    /* units */
    D.apartments.forEach(function (a) {
      var ux = hx + hw * a.x0 / 100, uw = hw * (a.x1 - a.x0) / 100, uy = top + (3 - a.floor) * fh;
      var pad = 18, bw = uw - pad * 2, bx = ux + pad;
      var terr = a.type === 'terrace';
      s += '<g class="unit" data-id="' + a.id + '" data-floor="' + a.floor + '" tabindex="0" role="button" aria-label="' + aptTitle(a) + '">';
      s += '<rect class="win" x="' + ux + '" y="' + uy + '" width="' + uw + '" height="' + fh + '" opacity="0"/>';
      /* window / glass door */
      var gy = uy + 20, gh = fh - 48, gw = Math.min(bw - 20, 120), gx = bx + (bw - gw) / 2;
      s += '<rect class="win" x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" rx="1"/>';
      s += '<rect class="glass" x="' + (gx + 3) + '" y="' + (gy + 3) + '" width="' + (gw - 6) + '" height="' + (gh - 6) + '"/>';
      s += '<path class="ln thin" d="M' + (gx + gw / 2) + ' ' + gy + ' V' + (gy + gh) + ' M' + gx + ' ' + (gy + gh * .45) + ' H' + (gx + gw) + '"/>';
      /* balcony or terrace */
      var by = uy + fh - 28, bh = 22;
      if (terr) { bx = ux + 8; bw = uw - 16; }
      s += '<rect class="win" x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#f3ece2"/>';
      for (var k = bx + 8; k < bx + bw - 4; k += 9) s += '<path class="rail" d="M' + k + ' ' + (by + 2) + ' V' + (by + bh - 2) + '"/>';
      s += '<path class="ln" d="M' + bx + ' ' + (by + bh) + ' H' + (bx + bw) + '"/>';
      if (terr) { s += '<path class="pine" d="M' + (bx + 14) + ' ' + (by - 2) + ' l6 -16 l6 16 M' + (bx + 16) + ' ' + (by - 10) + ' l4 -10 l4 10"/>'; s += '<path class="ln thin" d="M' + (bx + bw - 28) + ' ' + (by - 2) + ' h18 M' + (bx + bw - 24) + ' ' + (by - 2) + ' v-8 h10 v8"/>'; }
      /* small side window */
      s += '<rect class="win" x="' + (ux + 10) + '" y="' + (uy + 28) + '" width="12" height="18"/>';
      s += '<text x="' + (ux + uw / 2) + '" y="' + (uy + 14) + '" text-anchor="middle">' + a.id + '</text>';
      s += '</g>';
    });
    /* entrance and ground */
    var gy0 = top + fh * 3;
    s += '<rect class="wall" x="' + (hx + hw / 2 - 22) + '" y="' + (gy0 - 46) + '" width="44" height="46" fill="#efe5d4"/>';
    s += '<path class="ln thin" d="M' + (hx + hw / 2) + ' ' + (gy0 - 46) + ' V' + gy0 + '"/>';
    s += '<path class="ln" d="M40 ' + gy0 + ' H1000"/>';
    s += '<path class="ln thin" d="M' + (hx + hw + 40) + ' ' + gy0 + ' l0 -16 h70 l0 16 M' + (hx + hw + 52) + ' ' + (gy0 - 16) + ' l6 -10 h46 l6 10"/>';
    s += '<circle class="ln thin" cx="' + (hx + hw + 56) + '" cy="' + gy0 + '" r="5"/><circle class="ln thin" cx="' + (hx + hw + 96) + '" cy="' + gy0 + '" r="5"/>';
    s += '<text class="cap" x="' + (hx + hw + 76) + '" y="' + (gy0 + 18) + '" text-anchor="middle">P</text>';
    /* pines */
    [[70, gy0], [112, gy0], [hx + hw + 150, gy0], [hx + hw + 190, gy0]].forEach(function (p, i) {
      var px = p[0], py = p[1], h = 110 + (i % 2) * 30;
      s += '<path class="pine" d="M' + px + ' ' + py + ' V' + (py - h + 40) + ' M' + (px - 26) + ' ' + (py - 40) + ' L' + px + ' ' + (py - h) + ' L' + (px + 26) + ' ' + (py - 40) + ' M' + (px - 20) + ' ' + (py - 64) + ' L' + px + ' ' + (py - h) + ' L' + (px + 20) + ' ' + (py - 64) + ' M' + (px - 13) + ' ' + (py - 88) + ' L' + px + ' ' + (py - h) + ' L' + (px + 13) + ' ' + (py - 88) + '"/>';
    });
    /* sea */
    s += '<path class="sea" d="M0 ' + (gy0 + 42) + ' c20 -8 40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0"/>';
    s += '<path class="sea" d="M0 ' + (gy0 + 58) + ' c20 -8 40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0 s40 -8 60 0 s40 8 60 0" opacity=".5"/>';
    s += '<text class="cap" x="' + (W / 2) + '" y="' + (gy0 + 84) + '" text-anchor="middle">' + t('cat.sea') + ' · 300 m</text>';
    s += '</svg>';
    return s;
  }

  /* ---------- 2D plan SVG ---------- */
  function room(x, y, w, h, label, cls) {
    return '<rect class="room' + (cls ? ' ' + cls : '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>' + (label ? '<text class="lab" x="' + (x + 7) + '" y="' + (y + 13) + '">' + label + '</text>' : '');
  }
  function bed(x, y, w, h) { return '<rect class="furn f" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2"/><rect class="furn" x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (w / 2 - 4) + '" height="' + 9 + '" rx="1"/><rect class="furn" x="' + (x + w / 2 + 1) + '" y="' + (y + 3) + '" width="' + (w / 2 - 4) + '" height="' + 9 + '" rx="1"/>'; }
  function sofa(x, y, w, h) { return '<rect class="furn f" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/><path class="furn" d="M' + (x + 4) + ' ' + (y + h / 2) + ' H' + (x + w - 4) + '"/>'; }
  function table(x, y, r) { return '<circle class="furn f" cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; }
  function kitchen(x, y, w) { y += 14; return '<rect class="furn f" x="' + x + '" y="' + y + '" width="' + w + '" height="10"/><circle class="furn" cx="' + (x + 12) + '" cy="' + (y + 5) + '" r="3"/><circle class="furn" cx="' + (x + 22) + '" cy="' + (y + 5) + '" r="3"/><rect class="furn" x="' + (x + w - 20) + '" y="' + (y + 2) + '" width="14" height="6" rx="2"/>'; }
  function bath(x, y) { return '<rect class="furn" x="' + x + '" y="' + y + '" width="16" height="28" rx="3"/><circle class="furn" cx="' + (x + 30) + '" cy="' + (y + 8) + '" r="5"/><rect class="furn" x="' + (x + 24) + '" y="' + (y + 18) + '" width="12" height="10" rx="2"/>'; }
  function door(x, y, r, flip) { return '<path class="door" d="M' + x + ' ' + y + ' a' + r + ' ' + r + ' 0 0 ' + (flip ? 0 : 1) + ' ' + (flip ? -r : r) + ' ' + (-r) + '"/>'; }
  function desk(x, y) { return '<rect class="furn f" x="' + x + '" y="' + y + '" width="26" height="12"/><circle class="furn" cx="' + (x + 13) + '" cy="' + (y + 20) + '" r="4"/>'; }

  function planSVG(a) {
    var s = '<svg class="p2" viewBox="0 0 320 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + t('ap.plan') + ' ' + a.id + '">';
    s += '<text class="seaside" x="160" y="12" text-anchor="middle">' + t('room.sea') + ' ↑</text>';
    s += '<path class="wave" d="M100 18 c8 -4 16 -4 24 0 s16 4 24 0 s16 -4 24 0 s16 4 24 0 s16 -4 24 0"/>';
    var type = a.type;
    if (type === 'studio') {
      s += room(70, 24, 180, 28, t('room.balcony'), 'out');
      s += room(70, 52, 180, 130, t('room.living'));
      s += bed(80, 110, 56, 66) + sofa(170, 70, 70, 22) + table(205, 125, 12);
      s += kitchen(80, 62, 70);
      s += room(70, 182, 64, 44, t('room.bath'), 'wet') + bath(76, 194);
      s += room(134, 182, 116, 44, t('room.hall')) + door(190, 226, 16, false);
    } else if (type === 'one') {
      s += room(40, 24, 240, 28, t('room.balcony'), 'out');
      s += room(40, 52, 120, 110, t('room.bed')) + bed(60, 88, 70, 60);
      s += room(160, 52, 120, 110, t('room.living')) + sofa(176, 128, 74, 22) + table(240, 100, 12) + desk(248, 64);
      s += room(40, 162, 90, 64, t('room.kitchen')) + kitchen(46, 174, 78) + table(84, 210, 10);
      s += room(130, 162, 70, 64, t('room.bath'), 'wet') + bath(138, 190);
      s += room(200, 162, 80, 64, t('room.hall')) + door(240, 226, 16, false);
    } else if (type === 'two') {
      s += room(20, 24, 280, 28, t('room.balcony'), 'out');
      s += room(20, 52, 100, 104, t('room.bed')) + bed(32, 84, 70, 62);
      s += room(120, 52, 100, 104, t('room.bed2')) + bed(132, 84, 70, 62);
      s += room(220, 52, 80, 104, t('room.bath'), 'wet') + bath(240, 90);
      s += room(20, 156, 180, 70, t('room.living')) + sofa(30, 196, 80, 22) + table(150, 192, 14) + desk(118, 166);
      s += room(200, 156, 100, 70, t('room.kitchen')) + kitchen(206, 170, 88) + door(250, 226, 16, false);
    } else {
      s += room(30, 24, 260, 52, t('room.terrace'), 'out') + table(80, 50, 12) + '<rect class="furn" x="200" y="38" width="60" height="22" rx="3"/>' + '<rect class="furn" x="110" y="34" width="22" height="30" rx="4"/>';
      s += room(30, 76, 120, 96, t('room.bed')) + bed(44, 104, 70, 60);
      s += room(150, 76, 140, 96, t('room.living')) + sofa(166, 140, 74, 22) + table(258, 120, 12) + desk(250, 86);
      s += room(30, 172, 110, 54, t('room.kitchen')) + kitchen(36, 184, 98);
      s += room(140, 172, 70, 54, t('room.bath'), 'wet') + bath(150, 194);
      s += room(210, 172, 80, 54, t('room.hall')) + door(250, 226, 16, false);
    }
    s += '<text class="lab" x="312" y="244" text-anchor="end">' + a.area + ' m² · ' + t('cat.apt') + ' ' + a.id + '</text>';
    s += '</svg>';
    return s;
  }

  /* ---------- catalog page ---------- */
  var catalog = $('#catalog');
  var filt = { floor: 'all', bedrooms: 'all', sort: 'floor' };
  var selected = null, hlFloor = 0;

  function ddHtml(key, label, opts, cur) {
    return '<div class="dd" data-dd="' + key + '"><button type="button" aria-haspopup="listbox"><span>' + label + ' <b>' + opts.filter(function (o) { return String(o.v) === String(cur); })[0].l + '</b></span><i></i></button><ul role="listbox">' + opts.map(function (o) { return '<li><button type="button" role="option" data-v="' + o.v + '" class="' + (String(o.v) === String(cur) ? 'on' : '') + '">' + o.l + '</button></li>'; }).join('') + '</ul></div>';
  }
  function renderFilters() {
    var el = $('#cat-filters'); if (!el) return;
    el.innerHTML =
      ddHtml('floor', t('cat.floor'), [{ v: 'all', l: t('cat.all') }, { v: 1, l: '1' }, { v: 2, l: '2' }, { v: 3, l: '3' }], filt.floor) +
      ddHtml('bedrooms', t('cat.bedrooms'), [{ v: 'all', l: t('cat.all') }, { v: 0, l: t('s3.studio') }, { v: 1, l: '1' }, { v: 2, l: '2' }], filt.bedrooms) +
      ddHtml('season', t('cat.season'), [{ v: 'summer', l: t('season.summer') }, { v: 'winter', l: t('season.winter') }], state.season) +
      ddHtml('sort', t('cat.sort'), [{ v: 'floor', l: t('cat.sort.floor') }, { v: 'area', l: t('cat.sort.area') }], filt.sort);
  }
  doc.addEventListener('click', function (e) {
    var dd = e.target.closest('.dd');
    if (!dd) { $$('.dd.open').forEach(function (d) { d.classList.remove('open'); }); return; }
    var opt = e.target.closest('[data-v]');
    if (opt) {
      var key = dd.getAttribute('data-dd'), v = opt.getAttribute('data-v');
      if (key === 'season') { dd.classList.remove('open'); if (v === 'summer' || v === 'winter') PM.setSeason(v); return; }
      filt[key] = v; dd.classList.remove('open'); renderFilters(); renderGrid(); return;
    }
    if (e.target.closest('.dd > button')) { var open = dd.classList.contains('open'); $$('.dd.open').forEach(function (d) { d.classList.remove('open'); }); dd.classList.toggle('open', !open); }
  });

  function filtered() {
    var list = D.apartments.filter(function (a) {
      if (filt.floor !== 'all' && String(a.floor) !== String(filt.floor)) return false;
      if (filt.bedrooms !== 'all' && String(a.bedrooms) !== String(filt.bedrooms)) return false;
      return true;
    });
    if (filt.sort === 'area') list = list.slice().sort(function (a, b) { return a.area - b.area; });
    return list;
  }
  function cardHtml(a) {
    return '<article class="acard" data-card="' + a.id + '">' +
      '<div class="top">' + a.floor + ' ' + t('cat.floor.n') + ' · ' + t('s3.upto') + ' ' + a.guests + ' ' + t('cat.guests') + '</div>' +
      '<div class="vis">' + planSVG(a) + '<img src="' + img(a.img, true) + '" alt="" loading="lazy"></div>' +
      '<div class="body"><h3>' + aptTitle(a) + '</h3><div class="meta">' + PM.typeName(a.type) + ' · ' + a.area + ' m²<br>' + t('cat.view') + '</div>' +
      '<div class="price">' + PM.priceLabel() + '</div><a class="link-u" href="apartment.html?id=' + a.id + '">' + t('cat.more') + '</a></div></article>';
  }
  function renderGrid() {
    var g = $('#cat-grid'); if (!g) return;
    var list = filtered();
    $('#cat-count').textContent = list.length + ' ' + t('cat.count');
    g.innerHTML = list.length ? list.map(cardHtml).join('') : '<div class="cat-empty">' + t('cat.empty') + '</div>';
    $$('.facade .unit', $('#facade-wrap')).forEach(function (u) { u.classList.toggle('dim', !list.some(function (a) { return a.id === u.getAttribute('data-id'); })); });
  }
  function renderPlan() {
    var w = $('#facade-wrap'); if (!w) return;
    w.innerHTML = facadeSVG() + '<div class="ptip" id="ptip"></div>';
    $('#floors').innerHTML = [1, 2, 3].map(function (f) { return '<button type="button" data-floor-btn="' + f + '" class="' + (hlFloor === f ? 'on' : '') + '" aria-label="' + f + ' ' + t('cat.floor.n') + '">' + f + '</button>'; }).join('');
    applyFloor();
  }
  function applyFloor() {
    $$('.facade .floorband').forEach(function (b) { b.classList.toggle('on', String(hlFloor) === b.getAttribute('data-floor')); });
    $$('.facade .unit').forEach(function (u) { u.classList.toggle('hl', hlFloor && String(hlFloor) === u.getAttribute('data-floor')); });
    $$('[data-floor-btn]').forEach(function (b) { b.classList.toggle('on', String(hlFloor) === b.getAttribute('data-floor-btn')); });
  }
  doc.addEventListener('click', function (e) {
    var fb = e.target.closest('[data-floor-btn]'); if (fb) { var f = parseInt(fb.getAttribute('data-floor-btn'), 10); hlFloor = hlFloor === f ? 0 : f; filt.floor = hlFloor ? String(hlFloor) : 'all'; applyFloor(); renderFilters(); renderGrid(); return; }
    var u = e.target.closest('.facade .unit'); if (u && catalog) { openPanel(u.getAttribute('data-id')); }
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var u = e.target.closest && e.target.closest('.facade .unit'); if (u && catalog) { e.preventDefault(); openPanel(u.getAttribute('data-id')); } } });
  function tipFor(u, evt) {
    var tip = $('#ptip'); if (!tip) return;
    var a = byId(u.getAttribute('data-id'));
    tip.innerHTML = '<b>' + aptTitle(a) + '</b>' + PM.typeName(a.type) + ' · ' + t('s3.upto') + ' ' + a.guests + ' ' + t('cat.guests') + '<br>' + t('cat.view');
    var wr = $('#facade-wrap').getBoundingClientRect(), r = u.getBoundingClientRect();
    tip.style.left = (r.left - wr.left + r.width / 2) + 'px'; tip.style.top = (r.top - wr.top + 8) + 'px';
    tip.classList.add('on');
  }
  doc.addEventListener('mouseover', function (e) { var u = e.target.closest('.facade .unit'); if (u && $('#ptip')) tipFor(u, e); });
  doc.addEventListener('mouseout', function (e) { var u = e.target.closest('.facade .unit'); if (u && $('#ptip') && !u.contains(e.relatedTarget)) $('#ptip').classList.remove('on'); });
  doc.addEventListener('focusin', function (e) { var u = e.target.closest('.facade .unit'); if (u && $('#ptip')) tipFor(u); });
  doc.addEventListener('focusout', function (e) { if ($('#ptip')) $('#ptip').classList.remove('on'); });

  function nbText(ids, empty) { return ids.length ? ids.map(function (id) { return '<a href="apartment.html?id=' + id + '">' + t('cat.apt') + ' ' + id + '</a>'; }).join(', ') : empty; }
  function openPanel(id) {
    var a = byId(id); if (!a) return;
    selected = id;
    $$('.facade .unit').forEach(function (u) { u.classList.toggle('sel', u.getAttribute('data-id') === id); });
    var nb = neighbours(a);
    var p = $('#panel');
    p.innerHTML = '<button type="button" class="x" data-panel-close>' + t('nav.close') + '</button>' +
      '<div class="k">' + PM.typeName(a.type) + '</div><h3>' + aptTitle(a) + '</h3><div class="meta">' + aptMeta(a) + ' · ' + t('cat.view') + '</div>' +
      '<div class="plan2d">' + planSVG(a) + '</div>' +
      '<div class="photo"><img src="' + img(a.img, true) + '" alt=""></div>' +
      '<div class="nb"><div><div class="k">' + t('cat.above') + '</div>' + nbText(nb.above, t('cat.roof')) + '</div><div><div class="k">' + t('cat.below') + '</div>' + nbText(nb.below, t('cat.ground')) + '</div></div>' +
      '<div class="price">' + PM.priceLabel() + '</div>' +
      '<div class="acts"><a class="btn-line" href="apartment.html?id=' + a.id + '">' + t('cat.more') + '</a><a class="btn-line" href="apartment.html?id=' + a.id + '#book">' + t('cat.book') + '</a></div>';
    p.classList.add('open'); $('#panel-bg').classList.add('open');
    doc.body.classList.add('no-scroll');
  }
  function closePanel() { var p = $('#panel'); if (!p) return; p.classList.remove('open'); $('#panel-bg').classList.remove('open'); doc.body.classList.remove('no-scroll'); $$('.facade .unit.sel').forEach(function (u) { u.classList.remove('sel'); }); }
  doc.addEventListener('click', function (e) { if (e.target.closest('[data-panel-close]') || e.target.id === 'panel-bg') closePanel(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

  function renderCatalog() {
    if (!catalog) return;
    renderFilters(); renderPlan(); renderGrid();
    if (selected && $('#panel').classList.contains('open')) openPanel(selected);
  }

  /* ---------- apartment page ---------- */
  var apPage = $('#apartment');
  var ap = null, gal = { i: 0, timer: null };
  function renderApartment() {
    if (!apPage) return;
    var p = new URLSearchParams(location.search);
    ap = byId(p.get('id') || '');
    if (!ap) { location.replace('apartments.html#plan'); return; }
    doc.title = t('cat.apt') + ' ' + ap.id + ' · Pomalo';
    var nb = neighbours(ap);
    $('#ap-title').textContent = aptTitle(ap);
    $('#ap-type').textContent = PM.typeName(ap.type);
    $('#ap-facts').innerHTML = '<b>' + ap.floor + ' ' + t('cat.floor.n') + '</b> · ' + t('s3.upto') + ' ' + ap.guests + ' ' + t('cat.guests') + ' · ' + (ap.bedrooms ? ap.bedrooms + ' ' + t('s3.bedrooms').toLowerCase() : t('s3.studio')) + ' · ' + ap.area + ' m²<br>' + t('ap.view');
    $('#ap-price').textContent = PM.priceLabel();
    var g = $('#gallery');
    g.innerHTML = ap.gallery.map(function (n, i) { return '<img src="' + img(n) + '" srcset="' + img(n, true) + ' 800w, ' + img(n) + ' 1672w" sizes="100vw" alt="" class="' + (i === gal.i ? 'on' : '') + '">'; }).join('') +
      '<button type="button" class="arr l" data-gal="-1" aria-label="' + t('s3.prev') + '"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg></button><button type="button" class="arr r" data-gal="1" aria-label="' + t('s3.next') + '"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5"/></svg></button>' +
      '<div class="dots">' + ap.gallery.map(function (n, i) { return '<button type="button" data-gal-go="' + i + '" class="' + (i === gal.i ? 'on' : '') + '" aria-label="' + (i + 1) + '"></button>'; }).join('') + '</div>';
    $('#ap-plan').innerHTML = planSVG(ap);
    $('#ap-chips').innerHTML = D.amenities.map(function (a) { return '<span class="chip">' + t('am.' + a) + '</span>'; }).join('');
    $('#ap-nb').innerHTML = '<div><div class="kk">' + t('cat.above') + '</div>' + nbText(nb.above, t('cat.roof')) + '</div><div><div class="kk">' + t('cat.below') + '</div>' + nbText(nb.below, t('cat.ground')) + '</div>';
    var mini = $('#ap-facade'); mini.innerHTML = facadeSVG({ mini: true });
    $$('.unit', mini).forEach(function (u) { u.classList.toggle('sel', u.getAttribute('data-id') === ap.id); u.removeAttribute('tabindex'); u.style.cursor = 'default'; });
    PM.buildCalendar({ el: $('#ap-cal'), months: 3, range: false, aptId: ap.id });
    PM.renderForm($('#ap-form'), ap.id);
    $$('.h-sec .l2', apPage).forEach(function (el) { if (el.getAttribute('data-ui')) el.textContent = t(el.getAttribute('data-ui')); });
  }
  function galGo(i) {
    var imgs = $$('#gallery img'); if (!imgs.length) return;
    gal.i = (i + imgs.length) % imgs.length;
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === gal.i); });
    $$('#gallery .dots button').forEach(function (b, k) { b.classList.toggle('on', k === gal.i); });
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-gal]'); if (a) { galGo(gal.i + parseInt(a.getAttribute('data-gal'), 10)); return; }
    var g = e.target.closest('[data-gal-go]'); if (g) galGo(parseInt(g.getAttribute('data-gal-go'), 10));
  });
  if (apPage) gal.timer = setInterval(function () { if (!doc.hidden) galGo(gal.i + 1); }, 6000);

  window.PM_PAGE = { render: function () { renderCatalog(); renderApartment(); } };
  window.PM_PAGE.render();
  PM.observeAll();
  if (apPage && location.hash === '#book') setTimeout(function () { PM.scrollTo('#book'); }, 900);
})();
