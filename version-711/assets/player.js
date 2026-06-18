(function () {
    const frame = document.querySelector(".video-frame");
    const video = document.querySelector(".movie-video");
    const start = document.querySelector(".player-start");

    if (!frame || !video) {
        return;
    }

    const sourceNode = video.querySelector("source");
    const source = sourceNode ? sourceNode.getAttribute("src") : "";
    let ready = false;

    const prepare = function () {
        if (ready || !source) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            ready = true;
            return;
        }

        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            ready = true;
            return;
        }

        video.src = source;
        ready = true;
    };

    const play = function () {
        prepare();
        frame.classList.add("is-playing");
        const promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                frame.classList.remove("is-playing");
            });
        }
    };

    if (start) {
        start.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        frame.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
        frame.classList.remove("is-playing");
    });
})();
