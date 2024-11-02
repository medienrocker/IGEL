
// Theme Switcher Logic
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('bs_wrapper');
    const themeSelect = document.getElementById('theme-select');

    // Function to apply theme with transition
    function applyTheme(themeName) {
        // Add transition class
        wrapper.style.transition = 'background-color 0.3s ease, color 0.3s ease';

        // Remove all theme classes
        wrapper.classList.remove(
            'theme-neo-naturals',
            'theme-digital-garden',
            'theme-soft-tech',
            'theme-warm-minimalist',
            'theme-nordic-calm',
            'theme-sunset-vibes',
            'theme-forest-wisdom',
            'theme-ocean-depth'
        );

        // Add selected theme class
        wrapper.classList.add(`theme-${themeName}`);

        // Store preference
        localStorage.setItem('selectedTheme', themeName);

        // Remove transition after it's complete
        setTimeout(() => {
            wrapper.style.transition = '';
        }, 300);
    }

    // Event listener for theme selection
    themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Apply saved theme or default
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
    } else {
        // Apply default theme
        applyTheme('neo-naturals');
    }
});

// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.style.animation = `fadeSlideIn 0.6s ${entry.target.dataset.delay || '0s'} forwards ease-out`;
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation delays to create a cascade effect
    document.querySelectorAll('.animate-in').forEach((el, index) => {
        el.dataset.delay = `${index * 0.1}s`;
        observer.observe(el);
    });
});

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
document.head.appendChild(style);
