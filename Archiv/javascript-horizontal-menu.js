/* ### CC-BY bildungssprit GbR | Falk Szyba @medienrocker ### */

/**
 * IGEL Menu System - Horizontal Menu Version
 * This script manages the functionality for:
 * 1. Link icon addition and styling
 * 2. Feature info display and selection
 * 3. HOME icon addition
 * 4. Element animations
 * 5. Favicon customization 
 */

// Common configuration object for easy maintenance
const CONFIG = {
    // Selectors
    featureItemSelector: '.igel_features-list-horizontal li',
    featureActiveClass: 'igel_feature-active',
    detailSelector: '.igel_info-detail',
    defaultInfoSelector: '.igel_info-default',
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
 * Module for managing feature info display and selection
 */
const FeatureManager = {
    // Store current active feature
    activeFeature: null,

    /**
     * Hide all feature details
     */
    hideAllDetails: () => {
        document.querySelectorAll(CONFIG.detailSelector).forEach(detail => {
            detail.style.display = 'none';
            detail.style.opacity = '0';
        });
    },

    /**
     * Show default info when no feature is selected
     */
    showDefault: () => {
        const defaultInfo = document.querySelector(CONFIG.defaultInfoSelector);
        if (defaultInfo) {
            defaultInfo.style.display = 'block';
            defaultInfo.style.opacity = '1';
        }
    },

    /**
     * Hide default info
     */
    hideDefault: () => {
        const defaultInfo = document.querySelector(CONFIG.defaultInfoSelector);
        if (defaultInfo) {
            defaultInfo.style.display = 'none';
            defaultInfo.style.opacity = '0';
        }
    },

    /**
     * Show specific feature detail
     * @param {string} featureId - The ID of the feature to display
     */
    showFeatureDetail: (featureId) => {
        const detail = document.querySelector(`${CONFIG.detailSelector}[data-feature="${featureId}"]`);
        if (detail) {
            detail.style.display = 'block';
            // Trigger reflow for animation
            detail.offsetHeight;
            detail.style.opacity = '1';
        }
    },

    /**
     * Handle feature selection
     * @param {string} featureId - The ID of the selected feature 
     * @param {HTMLElement} clickedElement - The element that was clicked
     */
    selectFeature: (featureId, clickedElement) => {
        try {
            // Remove active class from previous selection
            const previousActive = document.querySelector(`.${CONFIG.featureActiveClass}`);
            if (previousActive) {
                previousActive.classList.remove(CONFIG.featureActiveClass);
            }

            // If clicking the same feature, deselect it
            if (FeatureManager.activeFeature === featureId) {
                FeatureManager.activeFeature = null;
                FeatureManager.hideAllDetails();
                FeatureManager.showDefault();
                return;
            }

            // Add active class to new selection
            clickedElement.classList.add(CONFIG.featureActiveClass);
            FeatureManager.activeFeature = featureId;

            // Update info display
            FeatureManager.hideDefault(); 
            FeatureManager.hideAllDetails();
            setTimeout(() => {
                FeatureManager.showFeatureDetail(featureId);
            }, 50); // Small delay for smooth transition

        } catch (error) {
            ErrorHandler.logError('Feature Selection', error);
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
        const infobox = document.querySelector(CONFIG.detailSelector);
        if (infobox) {
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
            observer.observe(infobox, { childList: true, subtree: true });
        }

        // Update current year in footer if needed
        const yearSpan = document.getElementById('igel_current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Initialize feature info system
        document.querySelectorAll(CONFIG.featureItemSelector).forEach(item => {
            item.addEventListener('click', (event) => {
                const featureId = item.dataset.featureId;
                if (featureId) {
                    FeatureManager.selectFeature(featureId, item);
                }
            });

            // Add hover effect handler
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains(CONFIG.featureActiveClass)) {
                    item.style.cursor = 'pointer';
                }
            });
        });

        // Show default info initially
        FeatureManager.showDefault();

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
