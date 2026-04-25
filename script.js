// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
    links.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        links.classList.remove('active');
    });
});

// Fade-in on scroll using CSS class (content stays visible if JS fails)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .stat-card, .skill-category').forEach((el, i) => {
    el.classList.add('fade-up');
    el.style.transitionDelay = `${i % 3 * 0.1}s`;
    observer.observe(el);
});
