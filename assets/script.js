/* Narcissistic Abuse Recovery — landing page interactions */

(function () {
  'use strict';

  /* Content is only hidden for the reveal animation once we know JS is running,
     so a script failure can never leave the page blank. */
  document.documentElement.classList.add('js');

  /* Current year in the footer */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Shadow on the sticky header once the page moves */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Only one FAQ answer open at a time */
  var faqs = document.querySelectorAll('.faq-list details');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqs.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* Reveal sections as they enter the viewport */
  var items = document.querySelectorAll('.reveal');
  var revealed = 0;

  var revealAll = function () {
    items.forEach(function (el) { el.classList.add('in'); });
  };

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
    /* Stagger siblings slightly so grids cascade instead of popping */
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    observer.observe(el);
  });

  /* Safety net: the observer never fires while a tab is backgrounded or
     occluded. If nothing has appeared shortly after load, show everything
     rather than leave the visitor staring at an empty page. */
  setTimeout(function () {
    if (revealed === 0) revealAll();
  }, 2500);
})();
