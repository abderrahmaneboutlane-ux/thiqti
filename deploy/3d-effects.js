/* ============================================================
   THIQTI — MOTEUR D'EFFETS 3D (v1.0)
   Tilt au survol (cartes, boîte de recherche, stats) + parallax
   du hero. Ne modifie aucune logique métier existante : ce script
   ne fait qu'ajouter des transformations CSS via delegation
   d'événements, donc il fonctionne aussi sur le contenu généré
   dynamiquement (cartes de résultats, cartes assistant, etc.).
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (reduceMotion || isCoarsePointer) return;

  /* ===== 1) TILT 3D SUR CARTES / BOÎTE DE RECHERCHE / STATS ===== */
  var TILT_SELECTOR = '.card, .ast-card, .hero-search-box, .stat';
  var current = null;
  var rafId = null;
  var lastEvent = null;

  function ensureGlare(el) {
    if (el.classList.contains('stat')) return null;
    var glare = el.querySelector(':scope > .tilt-glare');
    if (!glare) {
      glare = document.createElement('span');
      glare.className = 'tilt-glare';
      el.appendChild(glare);
    }
    return glare;
  }

  function applyTilt(el, clientX, clientY) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var px = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    var py = Math.min(1, Math.max(0, (clientY - r.top) / r.height));

    var isStat = el.classList.contains('stat');
    var isSearchBox = el.classList.contains('hero-search-box');
    var maxTilt = isSearchBox ? 4 : (isStat ? 6 : 9);
    var z = isSearchBox ? 8 : (isStat ? 4 : 16);
    var lift = isStat ? '' : ' translateY(-6px)';

    var rx = (0.5 - py) * maxTilt * 2;
    var ry = (px - 0.5) * maxTilt * 2;

    el.style.transform =
      'perspective(var(--tilt-persp)) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' +
      ry.toFixed(2) + 'deg)' + lift + ' translateZ(' + z + 'px)';

    var glare = el.querySelector(':scope > .tilt-glare');
    if (glare) {
      glare.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      glare.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    }
  }

  function resetTilt(el) {
    el.style.transform = '';
    el.classList.remove('tilt-active');
  }

  function onMove(e) {
    lastEvent = e;
    if (rafId) return;
    rafId = requestAnimationFrame(process);
  }

  function process() {
    rafId = null;
    var e = lastEvent;
    if (!e) return;
    var el = e.target && e.target.closest ? e.target.closest(TILT_SELECTOR) : null;

    if (!el) {
      if (current) { resetTilt(current); current = null; }
      return;
    }
    if (current !== el) {
      if (current) resetTilt(current);
      current = el;
      el.classList.add('tilt-active');
      ensureGlare(el);
    }
    applyTilt(el, e.clientX, e.clientY);
  }

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', function () {
    if (current) { resetTilt(current); current = null; }
  });
  window.addEventListener('blur', function () {
    if (current) { resetTilt(current); current = null; }
  });

  /* ===== 2) PARALLAX DU HERO (fond + orbes + carte titre) ===== */
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var mesh = hero.querySelector('.hero-mesh');

    if (mesh && !hero.querySelector('.hero-orb')) {
      ['hero-orb hero-orb--1', 'hero-orb hero-orb--2', 'hero-orb hero-orb--3'].forEach(function (cls) {
        var o = document.createElement('div');
        o.className = cls;
        hero.insertBefore(o, mesh.nextSibling);
      });
    }

    var orbs = hero.querySelectorAll('.hero-orb');
    var inner = hero.querySelector('.hero-inner');
    var heroRaf = null;
    var heroEvent = null;

    function heroProcess() {
      heroRaf = null;
      if (!heroEvent) return;
      var r = hero.getBoundingClientRect();
      var px = (heroEvent.clientX - r.left) / r.width - 0.5;
      var py = (heroEvent.clientY - r.top) / r.height - 0.5;

      if (mesh) {
        mesh.style.transform = 'translate3d(' + (px * -14).toFixed(1) + 'px,' + (py * -14).toFixed(1) + 'px,0)';
      }
      orbs.forEach(function (o, i) {
        var depth = (i + 1) * 10;
        o.style.transform = 'translate3d(' + (px * -depth).toFixed(1) + 'px,' + (py * -depth).toFixed(1) + 'px,0)';
      });
      if (inner) {
        inner.style.transform =
          'perspective(1400px) rotateX(' + (py * -2).toFixed(2) + 'deg) rotateY(' + (px * 2).toFixed(2) + 'deg)';
      }
    }

    function heroMove(e) {
      heroEvent = e;
      if (heroRaf) return;
      heroRaf = requestAnimationFrame(heroProcess);
    }

    hero.addEventListener('mousemove', heroMove, { passive: true });
    hero.addEventListener('mouseleave', function () {
      if (mesh) mesh.style.transform = '';
      orbs.forEach(function (o) { o.style.transform = ''; });
      if (inner) inner.style.transform = '';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroParallax);
  } else {
    initHeroParallax();
  }
})();
