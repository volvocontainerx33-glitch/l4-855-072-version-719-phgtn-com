(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var panel = document.querySelector("[data-player]");
    var video = document.querySelector("[data-video-element]");
    var startButton = document.querySelector("[data-player-start]");
    var sourceButtons = Array.prototype.slice.call(document.querySelectorAll("[data-source]"));
    var status = document.querySelector("[data-player-status]");
    var hls = null;
    var currentSource = panel ? panel.getAttribute("data-video-src") : "";

    if (!panel || !video || !currentSource) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function destroyHls() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    }

    function loadSource(source, autoplay) {
      if (!source) {
        setStatus("当前播放源不可用，请切换其他线路。");
        return;
      }

      currentSource = source;
      destroyHls();
      video.pause();
      video.removeAttribute("src");
      video.load();

      var Hls = window.Hls;
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (Hls.Events) {
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已加载，正在准备播放。");
            if (autoplay) {
              video.play().catch(function () {
                setStatus("播放源已就绪，请再次点击播放按钮。");
              });
            }
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放加载遇到问题，请切换线路或刷新页面重试。");
            }
          });
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("浏览器正在使用原生 HLS 播放。");
        if (autoplay) {
          video.play().catch(function () {
            setStatus("播放源已就绪，请再次点击播放按钮。");
          });
        }
      } else {
        setStatus("当前浏览器暂不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或 Firefox。");
      }
    }

    if (startButton) {
      startButton.addEventListener("click", function () {
        startButton.classList.add("hidden");
        loadSource(currentSource, true);
      });
    }

    sourceButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        sourceButtons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        if (startButton) {
          startButton.classList.add("hidden");
        }
        loadSource(button.getAttribute("data-source"), true);
      });
    });
  });
})();
