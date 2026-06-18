(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    initHeroSlider();
    initMovieFilters();
    initLocalFilters();
  });

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initMovieFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var keywordInput = document.querySelector("[data-filter-keyword]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var countNode = document.querySelector("[data-filter-count]");
    var emptyNode = document.querySelector("[data-empty-result]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var category = normalize(categorySelect && categorySelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesCategory = !category || normalize(card.dataset.category) === category;
        var matchesType = !type || normalize(card.dataset.type) === type;
        var matchesYear = !year || normalize(card.dataset.year) === year;
        var show = matchesKeyword && matchesCategory && matchesType && matchesYear;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = "已显示 " + visible + " 部";
      }
      if (emptyNode) {
        emptyNode.classList.toggle("show", visible === 0);
      }
    }

    [keywordInput, categorySelect, typeSelect, yearSelect].forEach(function (node) {
      if (!node) {
        return;
      }
      node.addEventListener("input", applyFilters);
      node.addEventListener("change", applyFilters);
    });

    applyFilters();
  }

  function initLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-local-filter");
      var scope = document.querySelector(targetSelector);
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var keyword = input.value.toLowerCase().trim();
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
        });
      });
    });
  }
})();
