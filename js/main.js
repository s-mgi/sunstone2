/* ==========================================================================
   SUNSTONE TOWNS — interaction layer
   1. Header scroll state
   2. Mobile menu
   3. Scroll reveals (incl. staggered children)
   4. Hero parallax
   5. Animated figures
   6. Form handling
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. HEADER SCROLL STATE ------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var lastKnown = 0, ticking = false;

  function onScroll() {
    lastKnown = window.scrollY || window.pageYOffset;
    if (!ticking) {
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-stuck', lastKnown > 50);
        parallax(lastKnown);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 2. MOBILE MENU --------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* 3. SCROLL REVEALS ------------------------------------------------------ */
  var revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-child]');

  // stagger children of grid containers
  document.querySelectorAll('[data-reveal-child]').forEach(function (group) {
    var step = parseFloat(group.getAttribute('data-stagger')) || 0.1;
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.transitionDelay = (i * step) + 's';
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 4. HERO PARALLAX — gentle drift on the render column ------------------- */
  var heroImg = document.querySelector('.hero__media img');

  function parallax(y) {
    if (!heroImg || reduceMotion || window.innerWidth < 1080) return;
    var vh = window.innerHeight;
    if (y > vh) return;
    heroImg.style.transform = 'scale(1.06) translate3d(0,' + (y * 0.07) + 'px,0)';
  }

  /* 5. ANIMATED FIGURES ---------------------------------------------------- */
  var figures = document.querySelectorAll('[data-count]');

  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (el.getAttribute('data-decimals') | 0);
    var duration = 1500;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutExpo
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      var val = target * eased;
      el.textContent = decimals
        ? val.toFixed(decimals)
        : Math.round(val).toLocaleString('en-US');
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    figures.forEach(function (f) { countIO.observe(f); });
  } else {
    figures.forEach(function (f) {
      var d = (f.getAttribute('data-decimals') | 0);
      var t = parseFloat(f.getAttribute('data-count'));
      f.textContent = d ? t.toFixed(d) : t.toLocaleString('en-US');
    });
  }

  /* 6. FORM ---------------------------------------------------------------- */
  var form = document.querySelector('.rform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // No backend wired up yet — swap this for your CRM / form endpoint.
      form.classList.add('is-sent');
    });
  }

  /* init */
  onScroll();
})();
