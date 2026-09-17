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

  /* ── sticky header, reading progress, mobile action bar ── */
  var header = document.querySelector('.site-header');
  var bar = document.getElementById('progressBar');
  var mobileBar = document.getElementById('mobileBar');
  var heroActions = document.querySelector('.hero-actions');
  var ticking = false;

  function update() {
    var y = window.scrollY;

    if (header) header.classList.toggle('scrolled', y > 12);

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    /* Reveal the action bar once the hero's own CTA has scrolled past, so the
       two never compete. Driven by scroll position rather than an observer so
       it still works if the page loads part-way down. */
    if (mobileBar) {
      var trigger = heroActions
        ? heroActions.getBoundingClientRect().bottom + y
        : window.innerHeight * 0.8;
      mobileBar.classList.toggle('show', y > trigger);
    }

    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* requestAnimationFrame is paused while a tab is hidden, which leaves the
     throttle latched and the bar stuck in whatever state it had. Resync
     directly when the tab comes back. */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') update();
  });

  update();

  /* ── video wall ──
     Players are injected only when the section comes into view, so four
     embeds never load on top of the initial page. They start muted (browsers
     block autoplay with sound anyway); each clip has its own sound toggle,
     and unmuting one mutes the rest. */
  var videoGrid = document.getElementById('videoGrid');

  if (videoGrid) {
    var quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cards = [].slice.call(videoGrid.querySelectorAll('.vid'));

    var command = function (frame, func) {
      if (!frame || !frame.contentWindow) return;
      frame.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: func, args: [] }), '*'
      );
    };

    var build = function (card) {
      if (card.querySelector('iframe')) return;
      var id = card.getAttribute('data-yt');
      if (!id) return;

      var params = [
        'mute=1',
        'loop=1',
        'playlist=' + id,       /* loop needs the id repeated */
        'controls=0',
        'modestbranding=1',
        'playsinline=1',
        'rel=0',
        'enablejsapi=1',
        'autoplay=' + (quiet ? '0' : '1')
      ];

      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + params.join('&');
      frame.title = card.querySelector('figcaption strong').textContent;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('loading', 'lazy');

      card.querySelector('.vid-holder').appendChild(frame);
    };

    cards.forEach(function (card) {
      var btn = card.querySelector('.vid-sound');
      if (!btn) return;

      btn.setAttribute('aria-label', 'Turn sound on');

      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') === 'true';

        if (on) {
          command(card.querySelector('iframe'), 'mute');
          btn.setAttribute('aria-pressed', 'false');
          btn.setAttribute('aria-label', 'Turn sound on');
          return;
        }

        /* only one clip may be audible */
        cards.forEach(function (other) {
          if (other === card) return;
          var ob = other.querySelector('.vid-sound');
          command(other.querySelector('iframe'), 'mute');
          ob.setAttribute('aria-pressed', 'false');
          ob.setAttribute('aria-label', 'Turn sound on');
        });

        var frame = card.querySelector('iframe');
        command(frame, 'unMute');
        command(frame, 'playVideo');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Turn sound off');
      });
    });

    if ('IntersectionObserver' in window) {
      var vidObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          cards.forEach(build);
          vidObserver.disconnect();
        });
      }, { rootMargin: '200px 0px' });
      vidObserver.observe(videoGrid);

      /* the observer never fires in a backgrounded tab; build anyway so the
         section is never left as four empty panels */
      setTimeout(function () {
        if (!videoGrid.querySelector('iframe')) cards.forEach(build);
      }, 4000);
    } else {
      cards.forEach(build);
    }
  }

  /* ── meet intro video: branded play button ──
     Native <video controls> works with no JS. When JS runs we hide the default
     controls, lay a rose play button over the poster, then reveal the controls
     once it starts and drop the overlay. */
  var meetVideo = document.querySelector('.meet-video video');

  if (meetVideo) {
    meetVideo.controls = false;

    var meetPlay = document.createElement('button');
    meetPlay.type = 'button';
    meetPlay.className = 'meet-play';
    meetPlay.setAttribute('aria-label', 'Play the introduction video');
    meetPlay.innerHTML =
      '<span class="meet-play-glyph" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></svg>' +
      '</span>';

    meetPlay.addEventListener('click', function () {
      meetVideo.controls = true;
      var played = meetVideo.play();
      if (played && played.catch) played.catch(function () {});
      meetPlay.remove();
    });

    meetVideo.parentNode.appendChild(meetPlay);
  }

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

  /* ── free-excerpt form ──
     Point ENDPOINT at a form service (Formspree, Basin, a Vercel route) to
     capture submissions properly. Until then the form composes an email in
     the visitor's own mail client, so a request is never silently lost. */
  var ENDPOINT = '';                      /* e.g. 'https://formspree.io/f/xxxxxxx' */
  var INBOX = 'operations@skyliftmarketing.com';

  var resourceForm = document.getElementById('resourceForm');

  if (resourceForm) {
    var status = document.getElementById('formStatus');

    var say = function (message, kind) {
      status.textContent = message;
      status.className = 'form-status' + (kind ? ' ' + kind : '');
    };

    resourceForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(resourceForm);
      var name = (data.get('name') || '').trim();
      var email = (data.get('email') || '').trim();
      var phone = (data.get('phone') || '').trim();
      var message = (data.get('message') || '').trim();

      if (!name) { say('Please add your name.', 'err'); resourceForm.name.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        say('Please check your email address.', 'err');
        resourceForm.email.focus();
        return;
      }

      var button = resourceForm.querySelector('button[type="submit"]');

      if (!ENDPOINT) {
        var body = [
          'Name: ' + name,
          'Email: ' + email,
          phone ? 'Phone: ' + phone : '',
          message ? '\nMessage:\n' + message : ''
        ].filter(Boolean).join('\n');

        window.location.href = 'mailto:' + INBOX +
          '?subject=' + encodeURIComponent('Free excerpt request') +
          '&body=' + encodeURIComponent(body);

        say('Opening your email app so you can send the request.', 'ok');
        return;
      }

      button.disabled = true;
      say('Sending…');

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, phone: phone, message: message })
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          resourceForm.reset();
          say('Thank you. The excerpt is on its way to ' + email + '.', 'ok');
        })
        .catch(function () {
          say('That did not go through. Please email ' + INBOX + ' and I will send it over.', 'err');
        })
        .then(function () { button.disabled = false; });
    });
  }

  /* ── lazy-load the Calendly widget ──
     The inline widget pulls a heavy third-party iframe, so hold it back until the
     visitor nears the booking section or taps a booking button. Keeps the initial
     page load light without hurting how fast the form is there when wanted. */
  var calWidget = document.querySelector('.calendly-inline-widget');
  if (calWidget) {
    var calDone = false;
    var loadCalendly = function () {
      if (calDone) return;
      calDone = true;
      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      document.body.appendChild(s);
    };

    /* every booking CTA scrolls here — start loading the moment one is tapped */
    [].forEach.call(document.querySelectorAll('a[href="#book"]'), function (a) {
      a.addEventListener('click', loadCalendly, { once: true });
    });

    if ('IntersectionObserver' in window) {
      var calObs = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          loadCalendly();
          calObs.disconnect();
        }
      }, { rootMargin: '700px 0px' });
      calObs.observe(calWidget);
    } else {
      loadCalendly();
    }
  }

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
