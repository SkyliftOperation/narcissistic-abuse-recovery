/* Narcissistic Abuse Recovery — landing page interactions */

(function () {
  'use strict';

  /* Content is only hidden for entrance animations once we know JS is running,
     so a script failure can never leave the page blank. */
  var root = document.documentElement;
  root.classList.add('js');

  /* ── hero entrance failsafe ──
     The headline and lede start hidden and are brought in by CSS animation.
     Animations are paused while a tab is in the background, so if the last
     word has not finished animating shortly after load, reveal it outright. */
  var lastWord = document.querySelector('.display .w6');
  var heroShown = false;

  if (lastWord) {
    lastWord.addEventListener('animationend', function () { heroShown = true; }, { once: true });
    setTimeout(function () {
      if (!heroShown) root.classList.add('anim-fallback');
    }, 3000);
  }

  /* ── footer year ── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── sticky header + reading progress ── */
  var header = document.querySelector('.site-header');
  var bar = document.getElementById('progressBar');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (header) header.classList.toggle('scrolled', y > 12);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ── quick exit: leave the page without a trace in history ── */
  var SAFE_URL = 'https://www.google.com/search?q=weather';

  function quickExit() {
    /* Open a neutral page, then replace this one so Back doesn't return here. */
    try { window.open(SAFE_URL, '_blank', 'noopener'); } catch (e) { /* popup blocked */ }
    window.location.replace(SAFE_URL);
  }

  var exitBtn = document.getElementById('quickExit');
  if (exitBtn) exitBtn.addEventListener('click', quickExit);

  /* Escape pressed twice within a second also leaves. */
  var escAt = 0;
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var now = Date.now();
    if (now - escAt < 1000) quickExit();
    escAt = now;
  });

  /* ── FAQ: one answer open at a time ── */
  var faqs = document.querySelectorAll('.faq-list details');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqs.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ── reveal on scroll ── */
  var items = document.querySelectorAll('.reveal');
  var revealed = 0;

  function revealAll() {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  if (!('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealed++;
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach(function (el, i) {
    /* Stagger siblings so grids cascade instead of popping */
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    observer.observe(el);
  });

  /* Safety net: the observer never fires while a tab is backgrounded or
     occluded. If nothing has appeared shortly after load, show everything
     rather than leave the visitor staring at an empty page. */
  setTimeout(function () {
    if (revealed === 0) revealAll();
  }, 2500);
})();
