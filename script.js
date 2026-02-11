document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            mobileMenu.classList.toggle('hidden');
        });
    }

    const revealTargets = document.querySelectorAll(
        'section, .why-us-card, .faq-item, .bg-white.rounded-lg, .bg-white.rounded-xl'
    );
    revealTargets.forEach((element) => element.classList.add('reveal-on-scroll'));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    revealTargets.forEach((element) => observer.observe(element));
});


