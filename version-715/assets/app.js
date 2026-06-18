(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dots button"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;
    var timer = null;
    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("active", n === index);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("active", n === index);
      });
    }
    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () {
        show(n);
        start();
      });
    });
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
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) return;
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-title]"));
    var input = document.querySelector("[data-filter-search]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) input.value = initial;
    function apply() {
      var q = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" "));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (type && normalize(card.getAttribute("data-type")) !== type) ok = false;
        if (region && normalize(card.getAttribute("data-region")) !== region) ok = false;
        if (year && normalize(card.getAttribute("data-year")) !== year) ok = false;
        card.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle("show", visible === 0);
    }
    [input, typeSelect, regionSelect, yearSelect].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });
    var form = document.querySelector("[data-filter-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }
    apply();
  }

  function initPlayerWithSource(src) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    if (!video || !src) return;
    var loaded = false;
    function attach() {
      if (loaded) return;
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function play() {
      attach();
      if (overlay) overlay.classList.add("hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) overlay.classList.remove("hidden");
        });
      }
    }
    if (overlay) overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) play();
    });
    video.addEventListener("play", function () {
      if (overlay) overlay.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) overlay.classList.remove("hidden");
    });
  }

  window.SitePlayer = { init: initPlayerWithSource };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
