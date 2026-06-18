(function () {
  var hlsPromise = null;
  var hlsSources = [
    "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js"
  ];

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsPromise) {
      hlsPromise = hlsSources.reduce(function (chain, url) {
        return chain.catch(function () {
          return loadScript(url).then(function () {
            return window.Hls;
          });
        });
      }, Promise.reject());
    }
    return hlsPromise;
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", opened);
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll(".nav-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var next = root.querySelector("[data-hero-next]");
    var prev = root.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var section = panel.parentElement;
      if (!section) {
        return;
      }
      var list = section.querySelector("[data-filter-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var empty = section.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (document.querySelector("[data-search-page]") && keyword) {
        keyword.value = query;
      }

      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-searchable"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var match = true;
          if (q && text.indexOf(q) === -1) {
            match = false;
          }
          if (y && cardYear !== y) {
            match = false;
          }
          if (t && cardType !== t) {
            match = false;
          }
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupBackTop() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "back-top";
    button.textContent = "↑";
    button.hidden = true;
    button.setAttribute("aria-label", "返回顶部");
    document.body.appendChild(button);
    window.addEventListener("scroll", function () {
      button.hidden = window.scrollY < 420;
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.initVideoPlayer = function (videoId, buttonId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var status = document.querySelector("[data-player-status]");
    var started = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function revealPlayer() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
    }

    function playVideo() {
      revealPlayer();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          setStatus("请再次点击播放");
        });
      }
    }

    function bindNative() {
      video.src = sourceUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
    }

    function bindWithHls(Hls) {
      if (!Hls || !Hls.isSupported()) {
        bindNative();
        return;
      }
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: false });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus("视频加载失败，请稍后重试");
        }
      });
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      setStatus("正在加载视频…");
      revealPlayer();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        bindNative();
      } else {
        getHls().then(bindWithHls).catch(function () {
          bindNative();
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener("playing", function () {
      setStatus("");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();
