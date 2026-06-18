(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            const expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    const backTop = document.querySelector(".back-top");

    if (backTop) {
        const toggleBackTop = function () {
            if (window.scrollY > 360) {
                backTop.classList.add("is-visible");
            } else {
                backTop.classList.remove("is-visible");
            }
        };

        window.addEventListener("scroll", toggleBackTop, { passive: true });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        toggleBackTop();
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let activeIndex = 0;
    let heroTimer = null;

    const showSlide = function (index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === activeIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === activeIndex);
        });
    };

    const startHero = function () {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5600);
    };

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(activeIndex - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(activeIndex + 1);
            startHero();
        });
    }

    startHero();

    const localFilter = document.querySelector(".local-filter");
    const localCards = Array.from(document.querySelectorAll("[data-search-text]"));

    if (localFilter && localCards.length) {
        localFilter.addEventListener("input", function () {
            const keyword = localFilter.value.trim().toLowerCase();
            localCards.forEach(function (card) {
                const text = (card.getAttribute("data-search-text") || "").toLowerCase();
                card.classList.toggle("is-hidden", keyword.length > 0 && !text.includes(keyword));
            });
        });
    }

    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const searchStatus = document.getElementById("search-status");

    const renderSearch = function () {
        if (!searchInput || !searchResults || !searchStatus || typeof SITE_MOVIES === "undefined") {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = (params.get("q") || searchInput.value || "").trim();
        searchInput.value = query;
        searchResults.innerHTML = "";

        if (!query) {
            searchStatus.textContent = "请输入关键词开始搜索。";
            return;
        }

        const q = query.toLowerCase();
        const results = SITE_MOVIES.filter(function (movie) {
            return movie.search.toLowerCase().includes(q);
        }).slice(0, 120);

        searchStatus.textContent = results.length ? "找到相关影片" : "未找到相关影片";

        results.forEach(function (movie) {
            const article = document.createElement("article");
            article.className = "movie-card";
            article.innerHTML = [
                '<a class="poster-link" href="' + movie.url + '">',
                '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
                '<span class="poster-play">▶</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '</div>'
            ].join("");
            searchResults.appendChild(article);
        });
    };

    const escapeHtml = function (value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char];
        });
    };

    if (searchInput) {
        renderSearch();
        searchInput.addEventListener("input", renderSearch);
    }
})();
