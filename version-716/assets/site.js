(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }
}());

(function() {
  var hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var prev = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', function() {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      show(index + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}());

(function() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function(scope) {
    var input = scope.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-result]');
    var activeValue = 'all';

    function applyFilter() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;

      cards.forEach(function(card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchChip = activeValue === 'all' || text.indexOf(activeValue.toLowerCase()) !== -1;
        var visible = matchTerm && matchChip;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        activeValue = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function(item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });
  });
}());
