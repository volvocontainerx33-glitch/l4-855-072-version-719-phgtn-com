(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var page = root.closest("main") || document;
            var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card, .ranking-item"));
            var input = root.querySelector("[data-filter-input]");
            var year = root.querySelector("[data-filter-year]");
            var region = root.querySelector("[data-filter-region]");
            var type = root.querySelector("[data-filter-type]");
            var genre = root.querySelector("[data-filter-genre]");
            var empty = page.querySelector("[data-filter-empty]");

            function includes(value, needle) {
                return String(value || "").toLowerCase().indexOf(String(needle || "").toLowerCase()) !== -1;
            }

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var g = genre ? genre.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var ok = true;
                    if (q) {
                        ok = ok && includes(card.getAttribute("data-search-text"), q);
                    }
                    if (y) {
                        ok = ok && card.getAttribute("data-year") === y;
                    }
                    if (r) {
                        ok = ok && card.getAttribute("data-region") === r;
                    }
                    if (t) {
                        ok = ok && card.getAttribute("data-type") === t;
                    }
                    if (g) {
                        ok = ok && includes(card.getAttribute("data-genre"), g);
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            [input, year, region, type, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (!query) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        if (input && !input.value) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector("[data-player-overlay]");
        var button = document.querySelector("[data-play-button]");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.setAttribute("playsinline", "");
            video.setAttribute("controls", "controls");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupQuerySearch();
    });
})();
