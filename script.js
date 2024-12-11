
document.addEventListener('DOMContentLoaded', () => {
    const config = {
        infoboxSelector: '.igel_info-detail',
        listItemSelector: '.igel_features-list li',
    };

    const addLinkIcons = (container) => {
        const currentHostname = window.location.hostname;

        if (!container) return;

        const links = container.querySelectorAll('a[href]');
        links.forEach(link => {
            const hasMedia = link.querySelector('img, video, svg, canvas, .moodle-icon, .fa');
            if (hasMedia) return;

            try {
                const url = new URL(link.href, window.location.origin);
                const isExternal = url.hostname !== currentHostname;

                const trustedDomains = [
                    'mathcloud.li-hamburg.de',
                ];
                const isTrustedDomain = trustedDomains.some(domain =>
                    url.hostname === domain || url.hostname.endsWith('.' + domain)
                );

                const isMoodleSystem = (url) => {
                    const moodlePatterns = [
                        /\/mod\/((?!data\/view\.php).)*$/,
                      //  /\/course\//,
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
                        link.innerHTML += ' <i class="fa fa-external-link" aria-hidden="true" title="Externer Link"></i>';
                        link.innerHTML += '<span class="sr-only">(Opens in new window)</span>';
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    } else {
                        link.innerHTML += ' <i class="fa fa-link" aria-hidden="true" title="Interner Link"></i>';
                        link.innerHTML += '<span class="sr-only">(Internal link)</span>';
                    }
                }
            } catch (e) {
                console.error('Error processing link:', link.href, e);
            }
        });
    };

    // Initial run for the main content
    addLinkIcons(document.querySelector('#region-main, .course-content'));

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

    // Set the current year
    const currentYear = new Date().getFullYear();
    const yearSpan = document.getElementById('igel_current-year');
    if (yearSpan) {
        yearSpan.textContent = currentYear;
    }
});



// IGEL Feature Info System
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
