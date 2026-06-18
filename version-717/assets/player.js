(function () {
    window.startMoviePlayer = function (source) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var errorBox = document.querySelector('[data-player-error]');
        var initialized = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function showError() {
            if (errorBox) {
                errorBox.textContent = '播放暂时不可用，请稍后再试';
                errorBox.classList.add('show');
            }
        }

        function loadSource() {
            if (initialized) {
                return;
            }
            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
            } else {
                showError();
            }
        }

        function playVideo() {
            loadSource();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
            overlay.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    playVideo();
                }
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });

        video.addEventListener('error', showError);

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
