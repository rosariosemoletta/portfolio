/* ═══════════════════════════════════════════════
   ROUTER.JS — the whole site lives in index.html
   Sections are shown by changing the URL hash, without reloading the page:
     #/                  home (the carousel)
     #/work              all projects
     #/project/<id>      one project
     #/about   #/contact
     #/drafts            the circle → grid draft gallery (not linked in the nav yet)
     anything else       the "signal lost" page

   Why: a page reload destroys the audio engine and browsers only allow audio
   again after a new click. With a single page the ambient pad and the sounds
   never stop when you move between sections.

   Section changes crossfade (View Transitions API). Opening a project from a
   card morphs that card into the project's hero image, and going back from a
   project to Work morphs it back ("shared element", named "hero").

   Every change of section also has a sound (see navSound and sound.js).
   ═══════════════════════════════════════════════ */

(function () {
  var root        = document.documentElement;
  var view        = document.getElementById('view');
  var footerRight = document.getElementById('page-footer-right');
  var routeLinks  = document.querySelectorAll('[data-route]');   /* top nav + bottom bar */
  var tabbar      = document.getElementById('tabbar');
  var reduce      = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SECTIONS    = ['work', 'about', 'contact'];                /* order of the bottom bar */
  var DEFAULT_FOOTER = 'Motion &amp; Visual Designer';

  var current = null;   /* the route being shown: { name, id } */

  /* "#/project/lumen" → { name: 'project', id: 'lumen' } */
  function parse() {
    var raw   = (location.hash || '').replace(/^#\/?/, '');
    var parts = raw.split('/');
    var name  = parts[0] || 'home';
    if (name === 'home' && !parts[1]) return { name: 'home' };
    if (name === 'project' && parts[1]) return { name: 'project', id: decodeURIComponent(parts[1]) };
    if (name === 'work')    return { name: 'work', panel: 'work' };
    if (name === 'drafts')  return { name: 'work', panel: 'drafts' };   /* the drafts are a panel of Work */
    if (name === 'about' || name === 'contact') return { name: name };
    return { name: 'notfound', what: 'page', path: '#/' + raw };
  }
  function same(a, b) { return !!a && a.name === b.name && a.id === b.id && a.path === b.path && a.panel === b.panel; }

  function setActiveNav(r) {
    var section = r.name === 'project' ? 'work' : r.name;   /* a project belongs to Work */
    routeLinks.forEach(function (a) {
      var on = a.getAttribute('data-route') === section;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (tabbar) {   /* the sliding line of the bottom bar */
      var i = SECTIONS.indexOf(section);
      tabbar.style.setProperty('--tab-i', Math.max(i, 0));
      tabbar.style.setProperty('--tab-on', i >= 0 ? 1 : 0);
    }
  }

  function enterHome() {
    /* the carousel plays its intro once the entry gate is open */
    if (window.__gateDone && window.HomeCarousel) window.HomeCarousel.enter();
  }

  /* change what is on screen (synchronous) */
  function render(r) {
    var first   = !current;
    var wasHome = !!current && current.name === 'home';
    var isHome  = r.name === 'home';
    current = r;

    root.setAttribute('data-view', isHome ? 'home' : 'page');
    setActiveNav(r);

    if (window.Media) window.Media.destroy();   /* stops the videos and the layout of the page we leave */
    if (window.Ascii) window.Ascii.destroy();   /* stops the About ASCII portrait, if it was running */
    if (window.DraftGallery) window.DraftGallery.destroy();   /* stops the Drafts page, if it was running */

    if (isHome) {
      view.innerHTML = '';   /* also stops a project video that was still playing */
      document.title = 'Rosario Semoletta';
      enterHome();
      return;
    }

    if (wasHome && window.HomeCarousel) window.HomeCarousel.leave();
    var v = window.Views[r.name](r);
    view.innerHTML = v.html;
    if (window.Media) window.Media.init(view);   /* lays out the project's media (no-op on other pages) */
    if (window.Ascii) window.Ascii.init(view);   /* the About ASCII portrait (no-op elsewhere) */
    if (window.DraftGallery) window.DraftGallery.init(view);   /* the drafts panel of Work (no-op elsewhere) */
    if (r.name === 'work' && r.panel === 'drafts' && window.DraftGallery) window.DraftGallery.show();
    footerRight.innerHTML = v.footer || DEFAULT_FOOTER;
    document.title = v.title;
    window.scrollTo(0, 0);
    if (window.initFadeIns) window.initFadeIns(view);
    revealCards(view);

    if (window.Sfx) {
      window.Sfx.mood(v.mood);                 /* the pad follows the project's mood */
      if (v.glitch) window.Sfx.glitch();
    }
    if (!first) {   /* keyboard / screen-reader users land at the top of the new section */
      view.setAttribute('tabindex', '-1');
      try { view.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  function projectIndex(id) {
    for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return i;
    return -1;
  }

  /* the sound of moving from one route to another (silent until the browser allows audio) */
  function navSound(from, to) {
    var S = window.Sfx;
    if (!S || !from || to.name === 'notfound') return;   /* the 404 page has its own sound */
    if (to.name === 'project') {
      if (from.name !== 'project') { S.zoom(1); return; }          /* card → project: zoom in */
      var a = projectIndex(from.id), b = projectIndex(to.id);
      S.tick(Math.max(b, 0), b >= a ? 1 : -1);                      /* previous / next project: a scan zap */
    } else if (from.name === 'project' && to.name === 'work') {
      S.zoom(-1);                                                   /* project → Work: zoom out */
    } else {
      S.section(to.name);                                           /* Work / About / Contact / Home */
    }
  }

  /* which element should morph into the project hero? (must be named before the transition) */
  function sharedSource(from, to) {
    if (!from || to.name !== 'project') return null;
    if (from.name === 'home' && window.HomeCarousel) return window.HomeCarousel.cardFor(to.id);
    if (from.name === 'work') return view.querySelector('.project-card[href="#/project/' + to.id + '"]');
    return null;
  }

  function markHero(el)   { if (el) el.style.setProperty('view-transition-name', 'hero'); }
  function unmarkHero(el) { if (el) el.style.removeProperty('view-transition-name'); }

  function go() {
    var r = parse();
    if (same(current, r)) return;
    var from = current;
    navSound(from, r);

    if (!from || !document.startViewTransition || reduce) { render(r); return; }

    var source = sharedSource(from, r);
    var target = null;
    markHero(source);

    var vt = document.startViewTransition(function () {
      render(r);
      /* project → Work: the card we came from becomes the morph target */
      if (from.name === 'project' && r.name === 'work') {
        target = view.querySelector('.project-card[href="#/project/' + from.id + '"]');
        markHero(target);
      }
    });
    var cleanup = function () { unmarkHero(source); unmarkHero(target); };
    vt.ready.catch(function () {});   /* a newer navigation can skip this transition: that is not an error */
    vt.finished.then(cleanup, cleanup);
  }

  /* Work cards unveil when they come into view (CSS in style.css: .project-card.is-in) */
  function revealCards(scope) {
    var cards = scope.querySelectorAll('.projects-grid .project-card');
    if (!cards.length) return;
    if (!('IntersectionObserver' in window)) { [].forEach.call(cards, function (c) { c.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    [].forEach.call(cards, function (c) { io.observe(c); });
  }

  /* the Work header's switch: Selected work / Drafts, in place (the address follows without a new page) */
  function switchPanel(panel) {
    var group = view.querySelector('.work-switch');
    if (group) group.setAttribute('data-on', panel);
    view.querySelectorAll('.work-switch-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-panel') === panel));
    });
    view.querySelectorAll('.work-panel').forEach(function (p) {
      p.hidden = p.getAttribute('data-panel') !== panel;
    });
    if (current && current.name === 'work') current.panel = panel;
    history.replaceState(null, '', '#/' + (panel === 'drafts' ? 'drafts' : 'work'));
    if (window.DraftGallery) { if (panel === 'drafts') window.DraftGallery.show(); else window.DraftGallery.hide(); }
    if (window.Sfx) window.Sfx.section(panel === 'drafts' ? 'drafts' : 'work');
  }
  view.addEventListener('click', function (e) {
    var sw = e.target.closest ? e.target.closest('.work-switch-btn') : null;
    if (sw) switchPanel(sw.getAttribute('data-panel'));
  });

  window.addEventListener('hashchange', go);

  /* the gate opened: if we are on the home page, play the carousel intro */
  window.addEventListener('gate:done', function () {
    if (current && current.name === 'home') enterHome();
  });

  go();
})();
