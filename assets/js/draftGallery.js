/* ═══════════════════════════════════════════════
   DRAFTGALLERY.JS — the drafts panel of Work (#/work → Drafts)

   The drafts pack into an independent masonry grid (many columns: this stage runs
   the full page width, not the project page's narrow one — see media.js for that
   one) and fly into place from off screen, each from its own direction, distance
   and tilt, in a staggered cascade with the same spring the home carousel's own
   intro uses (carousel.js). It plays each time the panel is opened; under
   prefers-reduced-motion the pieces simply appear in place.

   Previewing: hovering a piece brings its sound up (after a short beat, so a fast
   mouse sweep does not start every video) and softly blurs the others. Touch: a tap
   previews, a second tap on the same piece stops it. Keyboard: focus previews too.
   Nothing opens; the grid is the whole experience.

   assets/js/draftsData.js supplies the list (window.DRAFTS); with none, the panel
   is empty.
   ═══════════════════════════════════════════════ */

(function () {
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var PREVIEW_DELAY = 180;   /* ms before a hovered video's sound starts */

  /* the entrance: each piece flies in from its own direction and tilt, so the
     cascade reads as scattered pieces landing, not one uniform sweep */
  var ENTER_DIR = [
    { x: -1, y: -0.3 }, { x: 1, y: -0.4 }, { x: -0.3, y: -1 }, { x: 0.4, y: 1 },
    { x: 1, y: 0.3 }, { x: -1, y: 0.4 }, { x: 0.3, y: -1 }, { x: -0.4, y: 1 },
    { x: 0.9, y: -0.6 }, { x: -0.9, y: 0.6 }, { x: -0.6, y: -0.9 }, { x: 0.6, y: 0.9 },
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }
  ];
  var ENTER_ROT = [10, -14, 8, -10, 13, -8, 11, -13, 9, -11, 14, -9, 12, -12, 7, -7];

  var current = null;   /* the drafts panel: { root, stage, items, active, timer, ro, shown } */

  function esc(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function parseRatio(v) {
    if (typeof v === 'number' && v > 0) return v;
    if (typeof v === 'string') {
      var m = v.split(':');
      if (m.length === 2 && +m[0] > 0 && +m[1] > 0) return +m[0] / +m[1];
      if (parseFloat(v) > 0) return parseFloat(v);
    }
    return null;
  }
  var CORNERS = '<i class="d-br d-br-tl" aria-hidden="true"></i><i class="d-br d-br-tr" aria-hidden="true"></i>' +
                '<i class="d-br d-br-bl" aria-hidden="true"></i><i class="d-br d-br-br" aria-hidden="true"></i>';

  /* ---- building the pieces ---- */

  /* a real entry from window.DRAFTS; without a given ratio the real file is measured once laid out */
  function draftFigure(d, n) {
    var label = d.alt || ('Draft ' + pad2(n + 1));
    var attrs = (d.ratio ? ' data-ratio="' + esc(d.ratio) + '"' : '') + (d.span ? ' data-span="' + esc(d.span) + '"' : '');
    var head = ' tabindex="0" aria-label="' + esc(label) + '"';

    if (d.type === 'image') {
      var img = '<img src="' + d.src + '"' + (d.srcset ? ' srcset="' + esc(d.srcset) + '" sizes="33vw"' : '') +
                ' alt="" decoding="async" loading="lazy">';
      if (d.avif) img = '<picture><source type="image/avif" srcset="' + esc(d.avif) + '">' + img + '</picture>';
      return { ratio: parseRatio(d.ratio),
        html: '<figure class="media-item is-ready" data-kind="image" data-role="draft"' + head + attrs + '>' + img + CORNERS + '</figure>' };
    }

    /* a video is not loaded until it is hovered: only its poster (or metadata) is fetched */
    var sources = d.webm ? '<source src="' + d.webm + '" type="video/webm"><source src="' + d.src + '" type="video/mp4">' : '';
    return { ratio: parseRatio(d.ratio),
      html: '<figure class="media-item is-ready" data-kind="video" data-role="draft"' + head + attrs + '>' +
              '<video' + (d.webm ? '' : ' src="' + d.src + '"') + ' playsinline muted preload="none" aria-hidden="true"' +
              (d.poster ? ' poster="' + d.poster + '"' : '') + '>' + sources + '</video>' + CORNERS + '</figure>' };
  }

  /* a real item with no given ratio: measure the actual file once, then re-layout */
  function measure(it, onReady) {
    if (it.ratio) return;
    var img = it.el.querySelector('img'), vid = it.el.querySelector('video');
    if (img) {
      if (img.complete && img.naturalWidth) { it.ratio = img.naturalWidth / img.naturalHeight; onReady(); return; }
      img.addEventListener('load', function () { if (img.naturalWidth && !it.ratio) { it.ratio = img.naturalWidth / img.naturalHeight; onReady(); } }, { once: true });
    } else if (vid) {
      vid.preload = 'metadata';
      if (vid.readyState >= 1 && vid.videoWidth) { it.ratio = vid.videoWidth / vid.videoHeight; onReady(); return; }
      vid.addEventListener('loadedmetadata', function () { if (vid.videoWidth && !it.ratio) { it.ratio = vid.videoWidth / vid.videoHeight; onReady(); } }, { once: true });
    }
  }

  /* ---- grid layout: an independent column packer (the full page width needs many
     columns, not the project page's two wide ones — see media.js for that one) ---- */
  function layoutGrid(s) {
    var W = s.stage.clientWidth;
    if (!W) return;
    var gap = 12, target = 150;
    var cols = Math.max(3, Math.min(8, Math.round(W / target)));
    var cw = (W - gap * (cols - 1)) / cols;
    var colY = [];
    for (var c = 0; c < cols; c++) colY.push(0);

    s.items.forEach(function (it) {
      var ratio = it.ratio || 1;
      var forced = it.el.getAttribute('data-span');
      var span = forced === 'single' ? 1
               : forced === 'wide' ? Math.min(2, cols)
               : Math.min(ratio >= 1.6 && cols >= 4 ? 2 : 1, cols);
      var w = cw * span + gap * (span - 1);
      var h = w / ratio;
      var bestC = 0, bestY = Infinity;
      for (var start = 0; start <= cols - span; start++) {
        var y = Math.max.apply(null, colY.slice(start, start + span));
        if (y < bestY) { bestY = y; bestC = start; }
      }
      var x = bestC * (cw + gap);
      for (var k = bestC; k < bestC + span; k++) colY[k] = bestY + h + gap;
      it.el.style.left = x + 'px';
      it.el.style.top = bestY + 'px';
      it.el.style.width = w + 'px';
      it.el.style.height = h + 'px';
    });
    s.stage.style.height = Math.max(0, Math.max.apply(null, colY) - gap) + 'px';
  }

  /* ---- the entrance: each piece flies in from off stage, staggered, with the
     home carousel's own spring (carousel.js) — plays when the panel opens ---- */
  function playEntrance(s) {
    if (reduce) return;
    var W = s.stage.clientWidth, H = s.stage.clientHeight;
    var dist = Math.max(180, Math.min(420, Math.min(W, H || W) * 0.65));
    s.items.forEach(function (it, i) {
      if (!it.el.animate) return;
      var dir = ENTER_DIR[i % ENTER_DIR.length], rot = ENTER_ROT[i % ENTER_ROT.length];
      it.el.animate(
        [{ transform: 'translate(' + (dir.x * dist) + 'px,' + (dir.y * dist) + 'px) rotate(' + rot + 'deg) scale(0.82)', opacity: 0 },
         { transform: 'none', opacity: 1 }],
        { duration: 820, delay: Math.min(480, i * 32), easing: 'cubic-bezier(0.34, 1.45, 0.64, 1)', fill: 'backwards' }
      );
    });
  }

  /* ---- preview: the hovered piece's sound, the others blurred ---- */
  function previewOn(s, it) {
    if (s.active === it) return;
    previewOff(s);
    s.active = it;
    s.stage.classList.add('is-previewing');
    it.el.classList.add('is-preview');
    var v = it.el.querySelector('video');
    if (!v) return;
    v.preload = 'auto';
    s.timer = setTimeout(function () {
      if (s.active !== it) return;
      v.muted = false;
      v.loop = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      if (window.Sfx) window.Sfx.duck(true);
    }, PREVIEW_DELAY);
  }

  function previewOff(s) {
    clearTimeout(s.timer);
    s.timer = null;
    var it = s.active;
    s.active = null;
    s.stage.classList.remove('is-previewing');
    s.items.forEach(function (x) { x.el.classList.remove('is-preview'); });
    if (it) {
      var v = it.el.querySelector('video');
      if (v) { v.pause(); v.muted = true; v.loop = false; }
    }
    if (window.Sfx) window.Sfx.duck(false);
  }

  function wirePreview(s) {
    s.items.forEach(function (it) {
      it.el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') previewOn(s, it); });
      it.el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') previewOff(s); });
      it.el.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch') return;
        if (s.active === it) previewOff(s); else previewOn(s, it);
      });
      it.el.addEventListener('focus', function () { previewOn(s, it); });
      it.el.addEventListener('blur', function () { previewOff(s); });
    });
  }

  /* ---- public ---- */
  function init(root) {
    destroy();
    var stage = root.querySelector('.drafts-stage');
    if (!stage) return;

    var list = window.DRAFTS || [];
    var figs = [];
    for (var i = 0; i < list.length; i++) figs.push(draftFigure(list[i], i));
    stage.innerHTML = figs.map(function (f) { return f.html; }).join('');

    var s = {
      root: root, stage: stage, shown: false, active: null, timer: null,
      items: [].slice.call(stage.children).map(function (el, i) { return { el: el, ratio: figs[i].ratio }; })
    };
    current = s;

    wirePreview(s);
    if (window.ResizeObserver) {
      s.ro = new ResizeObserver(function () { if (s.shown) layoutGrid(s); });
      s.ro.observe(stage);
    }
  }

  /* the panel is shown: lay the grid out for its real width, then fly the pieces in
     (it replays each time the panel is opened) */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
  }

  function show() {
    var s = current;
    if (!s) return;
    s.shown = true;
    shuffle(s.items);
    layoutGrid(s);
    s.items.forEach(function (it) {
      measure(it, function () { layoutGrid(s); });
      if (it.el.getAnimations) it.el.getAnimations().forEach(function (a) { a.cancel(); });
    });
    playEntrance(s);
  }

  function hide() {
    var s = current;
    if (!s) return;
    s.shown = false;
    previewOff(s);
  }

  function destroy() {
    var s = current;
    if (!s) return;
    current = null;
    if (s.ro) s.ro.disconnect();
    previewOff(s);
  }

  window.DraftGallery = { init: init, show: show, hide: hide, destroy: destroy };
})();
