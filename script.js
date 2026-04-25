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

// Fade-in on scroll — elements start visible, animate in as enhancement
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.project-card, .stat-card, .skill-category').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${i % 3 * 0.1}s, transform 0.5s ease ${i % 3 * 0.1}s`;
        observer.observe(el);
    });
}

function makeVisible(el) {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
}

// Fallback: make everything visible after 1 second no matter what
setTimeout(() => {
    document.querySelectorAll('.project-card, .stat-card, .skill-category').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}, 1000);
