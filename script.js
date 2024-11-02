// IGEL Theme Management System
document.addEventListener('DOMContentLoaded', () => {
    // Configuration object
    const config = {
        themePrefix: 'igel_theme-',
        storageKey: 'igel_selected_theme',
        defaultTheme: 'neo-naturals',
        themes: [
            'neo-naturals',
            'digital-garden',
            'soft-tech',
            'warm-minimalist',
            'nordic-calm',
            'sunset-vibes',
            'forest-wisdom',
            'ocean-depth'
        ]
    };

    // Error handling utility
    const ErrorHandler = {
        logError: (context, error) => {
            console.error(`IGEL Theme System - ${context}:`, error);
        },

        throwIfMissing: (element, elementName) => {
            if (!element) {
                const error = new Error(`Required element "${elementName}" not found`);
                ErrorHandler.logError('Missing Element', error);
                throw error;
            }
        }
    };

    // Theme management utility
    const ThemeManager = {
        validateTheme: (themeName) => {
            if (!config.themes.includes(themeName)) {
                ErrorHandler.logError('Invalid Theme', `Theme "${themeName}" is not recognized`);
                return config.defaultTheme;
            }
            return themeName;
        },

        getStoredTheme: () => {
            try {
                return localStorage.getItem(config.storageKey);
            } catch (error) {
                ErrorHandler.logError('localStorage Access', error);
                return null;
            }
        },

        storeTheme: (themeName) => {
            try {
                localStorage.setItem(config.storageKey, themeName);
            } catch (error) {
                ErrorHandler.logError('localStorage Save', error);
            }
        }
    };

    // Initialize theme system
    try {
        // Get required elements
        const wrapper = document.querySelector('.igel_wrapper');
        const themeSelect = document.querySelector('.igel_theme-select');

        // Validate required elements exist
        ErrorHandler.throwIfMissing(wrapper, '.igel_wrapper');
        ErrorHandler.throwIfMissing(themeSelect, '.igel_theme-select');

        // Function to apply theme with transition
        const applyTheme = (themeName) => {
            try {
                // Validate theme name
                const validTheme = ThemeManager.validateTheme(themeName);

                // Add transition
                wrapper.style.transition = 'background-color 0.3s ease, color 0.3s ease';

                // Remove existing theme classes
                config.themes.forEach(theme => {
                    wrapper.classList.remove(`${config.themePrefix}${theme}`);
                });

                // Add new theme class
                wrapper.classList.add(`${config.themePrefix}${validTheme}`);

                // Store preference
                ThemeManager.storeTheme(validTheme);

                // Remove transition after animation
                setTimeout(() => {
                    wrapper.style.transition = '';
                }, 300);
            } catch (error) {
                ErrorHandler.logError('Theme Application', error);
            }
        };

        // Set up theme selection handler
        themeSelect.addEventListener('change', (event) => {
            applyTheme(event.target.value);
        });

        // Initialize animations
        try {
            // Add keyframe animations if not present
            if (!document.querySelector('#igel_animations')) {
                const style = document.createElement('style');
                style.id = 'igel_animations';
                style.textContent = `
                    @keyframes igel_fadeSlideIn {
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
            }

            // Apply animations to elements
            document.querySelectorAll('.igel_animate-in').forEach((el, index) => {
                el.style.animation = `igel_fadeSlideIn 0.6s ${index * 0.1}s forwards ease-out`;
            });
        } catch (error) {
            ErrorHandler.logError('Animation Setup', error);
        }

        // Apply initial theme
        const savedTheme = ThemeManager.getStoredTheme();
        if (savedTheme) {
            themeSelect.value = savedTheme;
            applyTheme(savedTheme);
        } else {
            applyTheme(config.defaultTheme);
        }

    } catch (error) {
        ErrorHandler.logError('Initialization', error);
        console.error('IGEL Theme System failed to initialize. Please check the console for details.');
    }
});