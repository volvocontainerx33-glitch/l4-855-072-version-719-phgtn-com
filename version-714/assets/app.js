(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function bindNavigation() {
    var nav = $('.site-nav');
    var toggle = $('.menu-toggle');

    if (nav && toggle) {
      toggle.addEventListener('click', function () {
        var opened = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
    }
  }

  function bindFilters() {
    $all('[data-filter-input]').forEach(function (input) {
      var targetSelector = input.getAttribute('data-filter-input');
      var cards = $all(targetSelector || '.movie-card');
      var empty = $('[data-empty-state]');

      function applyFilter() {
        var query = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type')
          ].join(' '));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  function bindSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var searchInput = $('[data-search-page-input]');

    if (searchInput && q) {
      searchInput.value = q;
      searchInput.dispatchEvent(new Event('input'));
    }
  }

  function bindHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var track = $('.hero-track', hero);
    var slides = $all('.hero-slide', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function go(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        go(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        go(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    go(0);
    start();
  }

  function bindToTop() {
    var button = document.createElement('button');
    button.className = 'to-top';
    button.type = 'button';
    button.textContent = '↑';
    button.setAttribute('aria-label', '返回顶部');
    document.body.appendChild(button);

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 360);
    });

    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.initPlayer = function (streamUrl) {
    var video = document.getElementById('player');
    var startButton = document.getElementById('playerStart');
    var overlay = document.getElementById('playerOverlay');
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      if (!video.src && !hls) {
        attach();
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    attach();

    if (startButton) {
      startButton.addEventListener('click', play);
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindNavigation();
    bindFilters();
    bindSearchQuery();
    bindHero();
    bindToTop();
  });
})();
