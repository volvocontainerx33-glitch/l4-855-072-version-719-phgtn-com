(function () {
  function init(config) {
    var video = document.getElementById(config.videoId);
    var trigger = document.getElementById(config.triggerId);
    var loaded = false;
    var hls = null;

    if (!video || !trigger || !config.source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }

    function play() {
      load();
      trigger.classList.add('is-hidden');
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('ended', function () {
      trigger.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.AsiaPlayer = {
    init: init
  };
})();
