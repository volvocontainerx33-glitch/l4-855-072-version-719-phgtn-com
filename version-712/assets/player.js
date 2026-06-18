(function () {
  function playVideo(button) {
    var videoId = button.getAttribute("data-video-id");
    var url = button.getAttribute("data-video-url");
    var video = document.getElementById(videoId);

    if (!video || !url) {
      return;
    }

    button.classList.add("is-hidden");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    function resume() {
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    if (video.getAttribute("data-ready") === "true") {
      resume();
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.setAttribute("data-ready", "true");
      resume();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.setAttribute("data-ready", "true");
        resume();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          button.classList.remove("is-hidden");
        }
      });
      return;
    }

    video.src = url;
    video.setAttribute("data-ready", "true");
    resume();
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-video-url]")).forEach(function (button) {
      button.addEventListener("click", function () {
        playVideo(button);
      });

      var video = document.getElementById(button.getAttribute("data-video-id"));
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused && video.getAttribute("data-ready") !== "true") {
            playVideo(button);
          }
        });
      }
    });
  });
})();
