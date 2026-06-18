(function () {
    var menuButton = document.querySelector('.mobile-menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuButton.textContent = open ? '×' : '☰';
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle('active', position === current);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle('active', position === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupSearch(input) {
        var targetSelector = input.getAttribute('data-target') || '.movie-card';
        var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
        var empty = document.querySelector(input.getAttribute('data-empty') || '.empty-result');
        var form = input.closest('form');

        if (form && form.getAttribute('data-redirect') === 'categories') {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input.value.trim();
                if (query) {
                    window.location.href = './categories.html?q=' + encodeURIComponent(query);
                }
            });
        }

        function filter() {
            var query = normalize(input.value);
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search') || card.textContent);
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }

        input.addEventListener('input', filter);

        var params = new URLSearchParams(window.location.search);
        if (params.has('q')) {
            input.value = params.get('q');
            filter();
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-input]')).forEach(setupSearch);
})();
