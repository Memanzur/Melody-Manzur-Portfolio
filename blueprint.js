// Blueprint - Interactive card expansion and scroll animations

(function () {
    // Card toggle logic
    const cards = document.querySelectorAll('.bp-card');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't close if user is selecting text
            if (window.getSelection().toString()) return;

            const isActive = card.classList.contains('active');

            // Close all cards first
            cards.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-expanded', 'false');
            });

            // If this card wasn't already open, open it
            if (!isActive) {
                card.classList.add('active');
                card.setAttribute('aria-expanded', 'true');

                // Scroll into view on mobile if needed
                if (window.innerWidth <= 900) {
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 150);
                }
            }
        });
    });

    // Close card when clicking outside (desktop only to avoid mobile scroll issues)
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 900 && !e.target.closest('.bp-card')) {
            cards.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // Update hint text based on device
    const hints = document.querySelectorAll('.bp-card-hint');
    const isMobile = window.innerWidth <= 900 || 'ontouchstart' in window;
    hints.forEach(hint => {
        hint.textContent = isMobile ? 'tap to learn more' : 'click to learn more';
    });

    // Scroll-based fade-in animation
    // Add animate-in class first so cards start visible if JS/observer fails
    const animTargets = document.querySelectorAll('.bp-card, .bp-track-header');

    if ('IntersectionObserver' in window) {
        animTargets.forEach(el => el.classList.add('animate-in'));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || '0s';
                    entry.target.style.transition = 'opacity 0.5s ease ' + delay + ', transform 0.5s ease ' + delay;
                    entry.target.classList.add('visible');

                    // Restore hover transitions after fade-in completes
                    const totalDelay = (parseFloat(delay) + 0.5) * 1000;
                    setTimeout(() => {
                        entry.target.style.transition = '';
                    }, totalDelay + 50);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        // Animate track headers
        document.querySelectorAll('.bp-track-header').forEach((el, i) => {
            el.dataset.delay = (i * 0.1) + 's';
            observer.observe(el);
        });

        // Animate cards with staggered delay
        document.querySelectorAll('.bp-card').forEach((el, i) => {
            el.dataset.delay = ((i % 4) * 0.08) + 's';
            observer.observe(el);
        });

        // Fallback: make everything visible after 2 seconds
        setTimeout(() => {
            animTargets.forEach(el => {
                el.classList.add('visible');
                el.style.transition = '';
            });
        }, 2000);
    }
    // If no IntersectionObserver, cards stay visible (no animate-in class added)
})();
