/**
 * IGEL Combined JavaScript - Integrates Tab and Accordion functionality
 * Combines and optimizes the previous separate scripts
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Configuration object for all modules
    const CONFIG = {
        // Tab system config
        tabSelector: '.igel_tab',
        tabActiveClass: 'igel_tab-active',
        panelSelector: '.igel_tab-panel',
        panelActiveClass: 'igel_active-panel',

        // Standard accordion system config
        accordionContainerSelector: '.igel_accordion-container',
        accordionItemSelector: '.igel_accordion-item',
        accordionHeaderSelector: '.igel_accordion-header',
        accordionContentSelector: '.igel_accordion-content',
        accordionActiveClass: 'active',
        accordionToggleSelector: '.igel_accordion-toggle',
        accordionExpandAllByDefault: false,
        accordionAllowMultipleOpen: false,

        // Horizontal accordion config
        horizontalAccordionContainerSelector: '.igel_horizontal-accordion-container',
        horizontalAccordionItemSelector: '.igel_horizontal-accordion-item',
        horizontalAccordionHeaderSelector: '.igel_horizontal-accordion-header',
        horizontalAccordionContentSelector: '.igel_horizontal-accordion-content',
        horizontalAccordionActiveClass: 'active',

        // Animation config
        animateClass: '.igel_animate-in',
        animateActiveClass: 'igel_animate-active',
        animationThreshold: 0.3,

        // Link config
        trustedDomains: [
            'mathcloud.li-hamburg.de',
            // Add other trusted domains here
        ]
    };

    /**
     * Error handler module for consistent error logging
     */
    const ErrorHandler = {
        logError: (context, error) => {
            console.error(`IGEL System - ${context}:`, error);
        }
    };

    /**
     * Tab Manager Module - Handles tab switching functionality
     */
    const TabManager = {
        /**
         * Initialize tab system
         */
        init: () => {
            try {
                const tabs = document.querySelectorAll(CONFIG.tabSelector);

                if (!tabs.length) {
                    console.log('No tabs found on page');
                    return;
                }

                // Add click event listeners to all tabs
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const featureId = tab.getAttribute('data-feature-id');
                        TabManager.activateTab(featureId);
                    });

                    // Add keyboard accessibility
                    tab.setAttribute('role', 'tab');
                    tab.setAttribute('tabindex', '0');
                    tab.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            const featureId = tab.getAttribute('data-feature-id');
                            TabManager.activateTab(featureId);
                        }
                    });
                });

                // Initialize ARIA attributes for accessibility
                const tabPanels = document.querySelectorAll(CONFIG.panelSelector);
                tabPanels.forEach(panel => {
                    panel.setAttribute('role', 'tabpanel');
                    panel.setAttribute('aria-hidden', panel.classList.contains(CONFIG.panelActiveClass) ? 'false' : 'true');
                });

            } catch (error) {
                ErrorHandler.logError('Tab Initialization', error);
            }
        },

        /**
         * Activate a specific tab and its content panel
         * @param {string} featureId - ID of the tab to activate
         */
        activateTab: (featureId) => {
            try {
                const tabs = document.querySelectorAll(CONFIG.tabSelector);
                const panels = document.querySelectorAll(CONFIG.panelSelector);

                // Update tab states
                tabs.forEach(tab => {
                    const isActive = tab.getAttribute('data-feature-id') === featureId;
                    tab.classList.toggle(CONFIG.tabActiveClass, isActive);
                    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                // Update panel visibility
                panels.forEach(panel => {
                    const isActive = panel.getAttribute('data-feature') === featureId;
                    panel.classList.toggle(CONFIG.panelActiveClass, isActive);
                    panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');

                    // Initialize accordion if this is the grundsätze panel being activated
                    if (isActive && featureId === 'mathcloud-grundsaetze') {
                        // Small delay to ensure panel is visible first
                        setTimeout(() => {
                            AccordionManager.init();
                        }, 50);
                    }
                });
            } catch (error) {
                ErrorHandler.logError('Tab Activation', error);
            }
        }
    };
    /**
     * Horizontal Accordion Manager Module - Handles horizontal accordion functionality
     */
    const AccordionManager = {
        // Track if accordion has been initialized
        initialized: false,

        /**
         * Initialize horizontal accordion system
         */
        init: () => {
            // Only initialize once
            if (AccordionManager.initialized) return;

            try {
                // First check for horizontal accordion
                const horizontalAccordion = document.querySelector('.igel_horizontal-accordion-container');

                if (horizontalAccordion) {
                    AccordionManager.setupHorizontalAccordion(horizontalAccordion);
                } else {
                    // For backwards compatibility, check for standard accordion
                    const accordionContainers = document.querySelectorAll(CONFIG.accordionContainerSelector);

                    if (!accordionContainers.length) {
                        console.log('No accordion containers found');
                        return;
                    }

                    accordionContainers.forEach(container => {
                        AccordionManager.setupAccordionItems(container);
                    });
                }

                // Set initialized flag to prevent duplicate initialization
                AccordionManager.initialized = true;

            } catch (error) {
                ErrorHandler.logError('Accordion Initialization', error);
            }
        },

        /**
         * Set up horizontal accordion
         * @param {HTMLElement} container - Horizontal accordion container
         */
        setupHorizontalAccordion: (container) => {
            try {
                const items = container.querySelectorAll('.igel_horizontal-accordion-item');

                items.forEach(item => {
                    // Generate random IDs for ARIA attributes
                    const header = item.querySelector('.igel_horizontal-accordion-header');
                    const index = item.getAttribute('data-index');
                    const contentPanel = container.querySelector(`.igel_horizontal-accordion-content[data-content="${index}"]`);

                    const headingId = `h-accordion-${Math.random().toString(36).substr(2, 9)}`;
                    const contentId = `h-content-${Math.random().toString(36).substr(2, 9)}`;

                    // Add ARIA attributes for accessibility
                    header.setAttribute('id', headingId);
                    header.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
                    header.setAttribute('aria-controls', contentId);
                    header.setAttribute('role', 'button');
                    header.setAttribute('tabindex', '0');

                    contentPanel.setAttribute('id', contentId);
                    contentPanel.setAttribute('aria-labelledby', headingId);
                    contentPanel.setAttribute('role', 'region');

                    // Add event listeners for interaction
                    header.addEventListener('click', () => {
                        AccordionManager.activateHorizontalAccordionItem(item, container);
                    });

                    // Add keyboard accessibility
                    header.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            AccordionManager.activateHorizontalAccordionItem(item, container);
                        }
                    });
                });

                // Ensure at least one item is active
                if (!container.querySelector('.igel_horizontal-accordion-item.active')) {
                    const firstItem = items[0];
                    if (firstItem) {
                        AccordionManager.activateHorizontalAccordionItem(firstItem, container);
                    }
                }
            } catch (error) {
                ErrorHandler.logError('Horizontal Accordion Setup', error);
            }
        },

        /**
         * Activate a specific item in the horizontal accordion
         * @param {HTMLElement} item - The accordion item to activate
         * @param {HTMLElement} container - The accordion container
         */
        activateHorizontalAccordionItem: (item, container) => {
            try {
                // Deactivate all items
                const allItems = container.querySelectorAll('.igel_horizontal-accordion-item');
                const allContents = container.querySelectorAll('.igel_horizontal-accordion-content');

                allItems.forEach(i => {
                    i.classList.remove('active');
                    const header = i.querySelector('.igel_horizontal-accordion-header');
                    if (header) header.setAttribute('aria-expanded', 'false');
                });

                allContents.forEach(c => {
                    c.classList.remove('active');
                });

                // Activate the selected item
                item.classList.add('active');
                const header = item.querySelector('.igel_horizontal-accordion-header');
                if (header) header.setAttribute('aria-expanded', 'true');

                // Activate corresponding content
                const index = item.getAttribute('data-index');
                const content = container.querySelector(`.igel_horizontal-accordion-content[data-content="${index}"]`);

                if (content) {
                    content.classList.add('active');
                }
            } catch (error) {
                ErrorHandler.logError('Horizontal Accordion Activation', error);
            }
        },
        /**
         * Set up standard vertical accordion items within a container
         * @param {HTMLElement} container - Accordion container element
         */
        setupAccordionItems: (container) => {
            const headers = container.querySelectorAll(CONFIG.accordionHeaderSelector);

            headers.forEach(header => {
                // Generate random IDs for ARIA attributes
                const accordionItem = header.closest(CONFIG.accordionItemSelector);
                const content = accordionItem.querySelector(CONFIG.accordionContentSelector);
                const headingId = `accordion-${Math.random().toString(36).substr(2, 9)}`;
                const contentId = `content-${Math.random().toString(36).substr(2, 9)}`;

                // Add ARIA attributes for accessibility
                header.setAttribute('id', headingId);
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('aria-controls', contentId);
                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');

                content.setAttribute('id', contentId);
                content.setAttribute('aria-labelledby', headingId);
                content.setAttribute('role', 'region');

                // Add event listeners for interaction
                header.addEventListener('click', () => {
                    AccordionManager.toggleAccordionItem(accordionItem);
                });

                // Add keyboard accessibility
                header.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        AccordionManager.toggleAccordionItem(accordionItem);
                    }
                });
            });
        },

        /**
         * Toggle standard accordion item between open and closed states
         * @param {HTMLElement} item - Accordion item element
         */
        toggleAccordionItem: (item) => {
            const isOpen = item.classList.contains(CONFIG.accordionActiveClass);

            // If not allowing multiple items open, close all others
            if (!CONFIG.accordionAllowMultipleOpen && !isOpen) {
                const container = item.closest(CONFIG.accordionContainerSelector);
                const siblings = container.querySelectorAll(CONFIG.accordionItemSelector);

                siblings.forEach(sibling => {
                    if (sibling !== item) {
                        AccordionManager.closeAccordionItem(sibling);
                    }
                });
            }

            // Toggle the clicked item
            if (isOpen) {
                AccordionManager.closeAccordionItem(item);
            } else {
                AccordionManager.openAccordionItem(item);
            }
        },

        /**
         * Open a standard accordion item
         * @param {HTMLElement} item - Accordion item element
         */
        openAccordionItem: (item) => {
            const header = item.querySelector(CONFIG.accordionHeaderSelector);
            const content = item.querySelector(CONFIG.accordionContentSelector);

            item.classList.add(CONFIG.accordionActiveClass);
            header.setAttribute('aria-expanded', 'true');

            // Calculate and set the appropriate height
            const contentHeight = content.scrollHeight;
            content.style.maxHeight = `${contentHeight}px`;
        },

        /**
         * Close a standard accordion item
         * @param {HTMLElement} item - Accordion item element
         */
        closeAccordionItem: (item) => {
            const header = item.querySelector(CONFIG.accordionHeaderSelector);
            const content = item.querySelector(CONFIG.accordionContentSelector);

            item.classList.remove(CONFIG.accordionActiveClass);
            header.setAttribute('aria-expanded', 'false');
            content.style.maxHeight = '0';
        }
    };

    /**
     * Animation Manager Module - Handles element animations
     */
    const AnimationManager = {
        /**
         * Initialize animations using Intersection Observer
         */
        init: () => {
            // Set up IntersectionObserver for animations
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Only animate once
                        if (!entry.target.classList.contains(CONFIG.animateActiveClass)) {
                            entry.target.classList.add(CONFIG.animateActiveClass);
                            console.log('Animation triggered for:', entry.target);
                            observer.unobserve(entry.target);
                        }
                    }
                });
            }, { threshold: CONFIG.animationThreshold });

            // Observe all animated elements - support both config-based and direct class targeting
            const animateElements = document.querySelectorAll(CONFIG.animateClass);
            if (animateElements.length) {
                animateElements.forEach(el => observer.observe(el));
            }

            // Also observe direction-specific animation elements
            document.querySelectorAll('.igel_animate-in-left, .igel_animate-in-right, .igel_animate-in-up, .igel_animate-in-down')
                .forEach(el => observer.observe(el));
        }
    };

    /**
     * Favicon Manager Module - Handles favicon customization
     */
    const FaviconManager = {
        /**
         * Change the favicon
         * @param {string} src - Source path for the favicon
         */
        changeFavicon: (src) => {
            // Search for existing favicon link
            let link = document.querySelector("link[rel='icon']") ||
                document.querySelector("link[rel='shortcut icon']");

            // Create new link if none found
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }

            // Set the new favicon path
            link.href = src;
        }
    };
    /**
     * Home Icon Manager Module - Adds home icons to navigation
     */
    const HomeIconManager = {
        /**
         * Add home icons to navigation items
         */
        addHomeIcons: () => {
            // Query all <a> elements inside an <h3> with class "sectionname"
            const anchors = document.querySelectorAll("h3.sectionname a");

            anchors.forEach(function (anchor) {
                // Check if the anchor text begins with "HOME" (after trimming whitespace)
                if (anchor.textContent.trim().startsWith("HOME") && !anchor.querySelector('.fa-home')) {
                    // Insert the icon HTML at the beginning of the anchor element
                    anchor.insertAdjacentHTML('afterbegin',
                        '<i class="fa fa-home" aria-hidden="true" style="margin-right: 4px; font-size: 1rem;"></i>');
                    console.log("Inserted home icon into anchor:", anchor);
                }
            });
        }
    };

    /**
     * Link Styler Module - Handles link icon addition
     */
    const LinkStyler = {
        /**
         * Add icons to links based on whether they're internal or external
         * @param {HTMLElement} container - The container element to find links in
         */
        addLinkIcons: (container) => {
            // Get current hostname for comparison
            const currentHostname = window.location.hostname;

            if (!container) return;

            // Find ALL links in the container
            const links = container.querySelectorAll('a[href]');

            links.forEach(link => {
                // Skip if already has any icon or contains media
                const hasMedia = link.querySelector('img, video, svg, canvas, .moodle-icon, .fa');
                if (hasMedia) return;

                try {
                    // Create URL object (this will handle both absolute and relative URLs)
                    const url = new URL(link.href, window.location.origin);

                    const isExternal = url.hostname !== currentHostname;

                    // Check if domain is in trusted list
                    const isTrustedDomain = CONFIG.trustedDomains.some(domain =>
                        url.hostname === domain || url.hostname.endsWith('.' + domain)
                    );

                    // Skip Moodle system links
                    const isMoodleSystem = (url) => {
                        const moodlePatterns = [
                            /\/mod\/((?!(data\/view\.php|page\/view\.php)).)*$/, // Matches mod/ paths except data/view.php and page/view.php
                            /\/user\//,
                            /\/grade\//,
                            /\/group\//,
                            /\/message\//,
                            /\/calendar\//
                        ];
                        return moodlePatterns.some(pattern => pattern.test(url.pathname));
                    };

                    if (!isMoodleSystem(url)) {
                        if (isExternal || isTrustedDomain) {
                            // External link
                            link.innerHTML += ' <i class="fa fa-external-link" aria-hidden="true" title="Externer Link"></i>';
                            link.innerHTML += '<span class="sr-only">(Opens in new window)</span>';
                            link.setAttribute('target', '_blank');
                            link.setAttribute('rel', 'noopener noreferrer');
                        } else {
                            // Internal link
                            link.innerHTML += ' <i class="fa fa-link" aria-hidden="true" title="Interner Link"></i>';
                            link.innerHTML += '<span class="sr-only">(Internal link)</span>';
                        }
                    }
                } catch (e) {
                    ErrorHandler.logError('Processing link', e);
                    // Handle relative URLs or invalid URLs
                    if (link.href && !hasMedia && !link.querySelector('.fa')) {
                        link.innerHTML += ' <i class="fa fa-external-link" aria-hidden="true" title="Externer Link"></i>';
                        link.innerHTML += '<span class="sr-only">(Internal link)</span>';
                    }
                }
            });
        }
    };

    // Initialize all modules when DOM is loaded
    try {
        // Process links in the main content
        const contentArea = document.querySelector('#region-main, .course-content');
        if (contentArea) {
            LinkStyler.addLinkIcons(contentArea);
        }

        // Set up observer for dynamically added content
        const tabContent = document.querySelector('.igel_tab-content');
        if (tabContent) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                LinkStyler.addLinkIcons(node);
                            }
                        });
                    }
                });
            });
            observer.observe(tabContent, { childList: true, subtree: true });
        }

        // Update current year in footer if needed
        const yearSpan = document.getElementById('igel_current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Initialize tab navigation
        TabManager.init();

        // Initialize animations
        AnimationManager.init();

        // Add HOME icons
        HomeIconManager.addHomeIcons();

        // Set custom favicon
        FaviconManager.changeFavicon('./favicon-128x128.png');

        // Check for active panels to initialize appropriate components
        const activePanel = document.querySelector(`${CONFIG.panelSelector}.${CONFIG.panelActiveClass}`);
        if (activePanel && activePanel.getAttribute('data-feature') === 'mathcloud-grundsaetze') {
            // Initialize accordion if grundsätze panel is active on load
            AccordionManager.init();
        }

    } catch (error) {
        ErrorHandler.logError('Main Initialization', error);
    }
});