// IGEL Theme Management System
document.addEventListener('DOMContentLoaded', () => {
    // Configuration object - no changes needed here
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

    // Error handling utility - no changes needed here
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

    // Theme management utility - no changes needed here
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
        // Get required elements - UPDATED: now get all theme-affected elements
        const themeElements = document.querySelectorAll('.igel_wrapper, .igel_sidebar-box');
        const themeSelect = document.querySelector('.igel_theme-select');

        // Validate theme select exists
        ErrorHandler.throwIfMissing(themeSelect, '.igel_theme-select');

        // Function to apply theme with transition - UPDATED
        const applyTheme = (themeName) => {
            try {
                // Validate theme name
                const validTheme = ThemeManager.validateTheme(themeName);

                // Apply theme to all elements
                themeElements.forEach(element => {
                    // Add transition
                    element.style.transition = 'background-color 0.3s ease, color 0.3s ease';

                    // Remove existing theme classes
                    config.themes.forEach(theme => {
                        element.classList.remove(`${config.themePrefix}${theme}`);
                    });

                    // Add new theme class
                    element.classList.add(`${config.themePrefix}${validTheme}`);

                    // Remove transition after animation
                    setTimeout(() => {
                        element.style.transition = '';
                    }, 300);
                });

                // Store preference
                ThemeManager.storeTheme(validTheme);
            } catch (error) {
                ErrorHandler.logError('Theme Application', error);
            }
        };

        // Rest of the code remains the same
        themeSelect.addEventListener('change', (event) => {
            applyTheme(event.target.value);
        });

        // Initialize animations
        try {
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