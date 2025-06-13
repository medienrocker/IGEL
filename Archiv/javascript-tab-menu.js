/* ### CC-BY bildungssprit GbR | Falk Szyba @medienrocker ### */

/**
 * IGEL Menu System - Tab-Based Menu Version
 * This script manages the functionality for:
 * 1. Link icon addition and styling
 * 2. Tab-based navigation and content display
 * 3. HOME icon addition
 * 4. Element animations
 * 5. Favicon customization 
 */

// Common configuration object for easy maintenance
const CONFIG = {
    // Selectors
    tabSelector: '.igel_tab',
    tabActiveClass: 'igel_tab-active',
    panelSelector: '.igel_tab-panel',
    panelActiveClass: 'igel_active-panel',
    animateClass: '.igel_animate-in-up',
    animateActiveClass: 'igel_animate-active',
    
    // Animation options
    animationDuration: 300,
    animationThreshold: 0.3,
    
    // Trusted domains for external links
    trustedDomains: [
        'mathcloud.li-hamburg.de',
        // Add other trusted domains here
    ]
};

/**
 * Module for logging errors consistently
 */
const ErrorHandler = {
    logError: (context, error) => {
        console.error(`IGEL System - ${context}:`, error);
    }
};

/**
 * Module for managing link styling
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

/**
 * Module for managing tab-based navigation
 */
const TabManager = {
    /**
     * Activate a specific tab and show its content
     * @param {string} featureId - ID of the tab/panel to activate
     */
    activateTab: (featureId) => {
        try {
            const tabs = document.querySelectorAll(CONFIG.tabSelector);
            const panels = document.querySelectorAll(CONFIG.panelSelector);
            
            // Update tab states
            tabs.forEach(tab => {
                if (tab.getAttribute('data-feature-id') === featureId) {
                    tab.classList.add(CONFIG.tabActiveClass);
                } else {
                    tab.classList.remove(CONFIG.tabActiveClass);
                }
            });
            
            // Update panel visibility
            panels.forEach(panel => {
                if (panel.getAttribute('data-feature') === featureId) {
                    panel.classList.add(CONFIG.panelActiveClass);
                } else {
                    panel.classList.remove(CONFIG.panelActiveClass);
                }
            });
        } catch (error) {
            ErrorHandler.logError('Tab Activation', error);
        }
    },
    
    /**
     * Initialize tab functionality
     */
    init: () => {
        try {
            const tabs = document.querySelectorAll(CONFIG.tabSelector);
            
            // Add click event listeners to tabs
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const featureId = this.getAttribute('data-feature-id');
                    TabManager.activateTab(featureId);
                });
                
                // Add hover effect
                tab.addEventListener('mouseenter', () => {
                    tab.style.cursor = 'pointer';
                });
            });
        } catch (error) {
            ErrorHandler.logError('Tab Initialization', error);
        }
    }
};

/**
 * Module for handling animations
 */
const AnimationManager = {
    /**
     * Initialize animations
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

        // Observe all animated elements
        document.querySelectorAll(CONFIG.animateClass).forEach(el => observer.observe(el));
    }
};

/**
 * Module for favicon management
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
 * Module for home icon addition
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
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
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

    } catch (error) {
        ErrorHandler.logError('Initialization', error);
    }
});
