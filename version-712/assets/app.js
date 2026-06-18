(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function openMobileMenu() {
    var button = qs("[data-mobile-toggle]");
    var menu = qs("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function bindNavSearch() {
    qsa("[data-nav-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function bindHero() {
    var root = qs("[data-hero]");
    if (!root) {
      return;
    }
    var slides = qsa("[data-hero-slide]", root);
    var dots = qsa("[data-hero-dot]", root);
    var prev = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
        dot.setAttribute("aria-current", current === index ? "true" : "false");
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        restart();
      });
    });

    show(0);
    restart();
  }

  function bindLocalFilter() {
    qsa("[data-filter-root]").forEach(function (root) {
      var input = qs("[data-filter-input]", root);
      var type = qs("[data-filter-type]", root);
      var year = qs("[data-filter-year]", root);
      var cards = qsa("[data-movie-card]", root);
      var empty = qs("[data-empty]", root);

      function apply() {
        var query = normalize(input ? input.value : "");
        var typeValue = normalize(type ? type.value : "");
        var yearValue = normalize(year ? year.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var ok = true;

          if (query && text.indexOf(query) === -1) {
            ok = false;
          }

          if (typeValue && cardType !== typeValue) {
            ok = false;
          }

          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function bindBackTop() {
    var button = qs("[data-backtop]");
    if (!button) {
      return;
    }

    function update() {
      button.classList.toggle("is-visible", window.scrollY > 420);
    }

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    window.addEventListener("scroll", update, {
      passive: true
    });
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    openMobileMenu();
    bindNavSearch();
    bindHero();
    bindLocalFilter();
    bindBackTop();
  });
})();
