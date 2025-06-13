/* ### CC-BY bildungssprit GbR | Falk Szyba @medienrocker ### */

// ##### Link styling Script #####
document.addEventListener('DOMContentLoaded', () => {
    const config = {
        infoboxSelector: '.igel_info-detail',
    };

    const addLinkIcons = (container) => {
        // Get current hostname for comparison
        const currentHostname = window.location.hostname;

        if (!container) return;

        // Find ALL links in the container (removed the http restriction)
        const links = container.querySelectorAll('a[href]');

        links.forEach(link => {
            // Skip if already has any icon or contains media
            const hasMedia = link.querySelector('img, video, svg, canvas, .moodle-icon, .fa');
            if (hasMedia) return;

            try {
                // Create URL object (this will handle both absolute and relative URLs)
                const url = new URL(link.href, window.location.origin);

                const isExternal = url.hostname !== currentHostname;

                // Optional: Add specific domain exceptions
                const trustedDomains = [
                    'mathcloud.li-hamburg.de',
                    // Add other trusted domains here
                ];

                const isTrustedDomain = trustedDomains.some(domain =>
                    url.hostname === domain || url.hostname.endsWith('.' + domain)
                );

                // Skip Moodle system links
                const isMoodleSystem = (url) => {
                    const moodlePatterns = [
                        /\/mod\/((?!(data\/view\.php|page\/view\.php)).)*$/, // Matches mod/ paths except data/view.php and page/view.php
                        //     /\/course\//,
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
                console.log('Error processing link:', link.href, e);
                // Handle relative URLs or invalid URLs
                if (link.href && !hasMedia && !link.querySelector('.fa')) {
                    link.innerHTML += ' <i class="fa fa-external-link" aria-hidden="true" title="Externer Link"></i>';
                    link.innerHTML += '<span class="sr-only">(Internal link)</span>';
                }
            }
        });
    };

    // Initial run for the main content
    const contentArea = document.querySelector('#region-main, .course-content, igel_sidebar-container');
    if (contentArea) {
        addLinkIcons(contentArea);
    }

    // Add observer for dynamic content in the infobox
    const infobox = document.querySelector(config.infoboxSelector);

    if (infobox) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            addLinkIcons(node);
                        }
                    });
                }
            });
        });

        observer.observe(infobox, { childList: true, subtree: true });
    }

    // Get the current year
    const currentYear = new Date().getFullYear();
    const yearSpan = document.getElementById('igel_current-year');
    if (yearSpan) {
        yearSpan.textContent = currentYear;
    }
});



// ##### IGEL Feature Info System #####
document.addEventListener('DOMContentLoaded', () => {
    const config = {
        activeClass: 'igel_feature-active',
        detailSelector: '.igel_info-detail',
        defaultInfoSelector: '.igel_info-default',
        animationDuration: 300
    };

    // Error handling utility
    const ErrorHandler = {
        logError: (context, error) => {
            console.error(`IGEL Feature Info - ${context}:`, error);
        }
    };

    // Feature info management
    const FeatureManager = {
        // Store current active feature
        activeFeature: null,

        // Hide all feature details
        hideAllDetails: () => {
            document.querySelectorAll(config.detailSelector).forEach(detail => {
                detail.style.display = 'none';
                detail.style.opacity = '0';
            });
        },

        // Show default info
        showDefault: () => {
            const defaultInfo = document.querySelector(config.defaultInfoSelector);
            if (defaultInfo) {
                defaultInfo.style.display = 'block';
                defaultInfo.style.opacity = '1';
            }
        },

        // Hide default info
        hideDefault: () => {
            const defaultInfo = document.querySelector(config.defaultInfoSelector);
            if (defaultInfo) {
                defaultInfo.style.display = 'none';
                defaultInfo.style.opacity = '0';
            }
        },

        // Show specific feature detail
        showFeatureDetail: (featureId) => {
            const detail = document.querySelector(`${config.detailSelector}[data-feature="${featureId}"]`);
            if (detail) {
                detail.style.display = 'block';
                // Trigger reflow for animation
                detail.offsetHeight;
                detail.style.opacity = '1';
            }
        },

        // Handle feature selection
        selectFeature: (featureId, clickedElement) => {
            try {
                // Remove active class from previous selection
                const previousActive = document.querySelector(`.${config.activeClass}`);
                if (previousActive) {
                    previousActive.classList.remove(config.activeClass);
                }

                // If clicking the same feature, deselect it
                if (FeatureManager.activeFeature === featureId) {
                    FeatureManager.activeFeature = null;
                    FeatureManager.hideAllDetails();
                    FeatureManager.showDefault();
                    return;
                }

                // Add active class to new selection
                clickedElement.classList.add(config.activeClass);
                FeatureManager.activeFeature = featureId;

                // Update info display
                FeatureManager.hideDefault(); // Hide the default info
                FeatureManager.hideAllDetails();
                setTimeout(() => {
                    FeatureManager.showFeatureDetail(featureId);
                }, 50); // Small delay for smooth transition

            } catch (error) {
                ErrorHandler.logError('Feature Selection', error);
            }
        }
    };

    // Initialize feature info system
    try {
        // Add click handlers to feature list items
        document.querySelectorAll('.igel_features-list li').forEach(item => {
            item.addEventListener('click', (event) => {
                const featureId = item.dataset.featureId;
                if (featureId) {
                    FeatureManager.selectFeature(featureId, item);
                }
            });

            // Add hover effect handler
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains(config.activeClass)) {
                    item.style.cursor = 'pointer';
                }
            });
        });

        // Show default info initially
        FeatureManager.showDefault();

    } catch (error) {
        ErrorHandler.logError('Initialization', error);
    }
});



// ### Animate elements in ### - DELETE?
document.addEventListener('DOMContentLoaded', function () {
    // IntersectionObserver-Optionen: ab 10% Sichtbarkeit
    const options = { threshold: 0.3 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Nur wenn noch nicht animiert, die aktive Klasse hinzufügen
                if (!entry.target.classList.contains('igel_animate-active')) {
                    entry.target.classList.add('igel_animate-active');
                    console.log('Animation triggered for:', entry.target);
                    // Element nicht weiter beobachten, da nur einmal animiert werden soll
                    observer.unobserve(entry.target);
                }
            }
        });
    }, options);

    // Beobachte alle Elemente mit den Animate-In-Klassen
    document.querySelectorAll('.igel_animate-in-left, .igel_animate-in-right, .igel_animate-in-up, .igel_animate-in-down')
        .forEach(el => observer.observe(el));
});



// ### HOME Icon hinzufügen zum HOME Link ###
document.addEventListener("DOMContentLoaded", function () {
    // Query all <a> elements inside an <h3> with class "sectionname"
    var anchors = document.querySelectorAll("h3.sectionname a");

    anchors.forEach(function (anchor) {
        // Check if the anchor text begins with "HOME" (after trimming whitespace)
        if (anchor.textContent.trim().startsWith("HOME") && !anchor.querySelector('.fa-home')) {
            // Define the icon HTML to insert
            var iconHtml = '<i class="fa fa-home" aria-hidden="true" style="margin-right: 4px; font-size: 1rem;"></i>';

            // Insert the icon HTML at the beginning of the anchor element
            anchor.insertAdjacentHTML('afterbegin', iconHtml);

            // Debugging: Log the action to the console
            console.log("Inserted home icon into anchor:", anchor);
        }
    });
});



// ##### Eigenes Favicon!! #####
document.addEventListener('DOMContentLoaded', function () {

    // Funktion zum Ändern des Favicons
    function changeFavicon(src) {
        // Suche nach einem existierenden Favicon-Link
        let link = document.querySelector("link[rel='icon']") ||
            document.querySelector("link[rel='shortcut icon']");

        // Wenn kein Link gefunden wurde, erstelle einen neuen
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        // Setze den neuen Pfad zum Favicon
        link.href = src;
    }

    // Nutzung der Funktion
    changeFavicon('https://lms.lernen.hamburg/draftfile.php/1491881/user/draft/254819998/favicon-128x128.png');
});



/**
 * IGEL Tab Navigation System
 * Handles tab switching and content display for the IGEL menu system
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Tab configuration
    const tabConfig = {
        tabSelector: '.igel_tab',
        tabActiveClass: 'igel_tab-active',
        panelSelector: '.igel_tab-panel',
        panelActiveClass: 'igel_active-panel'
    };

    /**
     * Activates a specific tab and shows its content
     * @param {string} featureId - ID of the tab/panel to activate
     */
    function activateTab(featureId) {
        try {
            const tabs = document.querySelectorAll(tabConfig.tabSelector);
            const panels = document.querySelectorAll(tabConfig.panelSelector);

            // Update tab states
            tabs.forEach(tab => {
                if (tab.getAttribute('data-feature-id') === featureId) {
                    tab.classList.add(tabConfig.tabActiveClass);
                } else {
                    tab.classList.remove(tabConfig.tabActiveClass);
                }
            });

            // Update panel visibility
            panels.forEach(panel => {
                if (panel.getAttribute('data-feature') === featureId) {
                    panel.classList.add(tabConfig.panelActiveClass);
                } else {
                    panel.classList.remove(tabConfig.panelActiveClass);
                }
            });
        } catch (error) {
            console.error('IGEL Tab System - Tab Activation Error:', error);
        }
    }

    // Initialize tab functionality
    try {
        const tabs = document.querySelectorAll(tabConfig.tabSelector);

        // Add click event listeners to tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const featureId = this.getAttribute('data-feature-id');
                activateTab(featureId);
            });

            // Add hover effect for better UX
            tab.addEventListener('mouseenter', () => {
                tab.style.cursor = 'pointer';
            });
        });

        // Optional: Make sure link icons are applied to tab content
        // This can be integrated with your existing link styling code
        function processLinksInTabs() {
            const tabContent = document.querySelector('.igel_tab-content');
            if (tabContent && typeof addLinkIcons === 'function') {
                addLinkIcons(tabContent);
            }
        }

        // Call this if you have an existing addLinkIcons function
        // processLinksInTabs();

    } catch (error) {
        console.error('IGEL Tab System - Initialization Error:', error);
    }
});