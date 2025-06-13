
/* ### CC-BY bildungssprit GbR | Falk Szyba @medienrocker ### */

/**
 * IGEL Menu System - Unified Version
 * Konsolidierte Version aller benötigten IGEL-Funktionalitäten
 * 
 * Unterstützt:
 * 1. Link icon addition and styling
 * 2. Tab-based navigation and content display (Willkomensseite)
 * 3. Feature Info System (interactive Infobox)
 * 4. Horizontal Accordion System (für "Mathe"-Template)
 * 5. Element animations (Animate-in: z.Z. ausgeschaltet)
 * 6. Favicon customization (Eigenes Favicon im Tab oben)
 * 7. HOME icon addition (Über Willkommensseite)
 * 8. YearManager (managing current year in copyright notices)
 * 9. FAQ open/close mechanik (elegantes öffnen, schließen und scrolling der FAQ Beiträge)
 */

// Common configuration object for easy maintenance
const CONFIG = {
    // Global selectors
    contentAreaSelector: '#region-main, .course-content',
    yearSpanSelector: '#igel_current-year',

    // Tab navigation
    tabSelector: '.igel_tab',
    tabActiveClass: 'igel_tab-active',
    panelSelector: '.igel_tab-panel',
    panelActiveClass: 'igel_active-panel',

    // Feature Info System
    featureActiveClass: 'igel_feature-active',
    featureDetailSelector: '.igel_info-detail',
    featureDefaultInfoSelector: '.igel_info-default',

    // Horizontal Accordion
    horizontalAccordionContainerSelector: '.igel_horizontal-accordion-container',
    horizontalAccordionItemSelector: '.igel_horizontal-accordion-item',
    horizontalAccordionHeaderSelector: '.igel_horizontal-accordion-header',
    horizontalAccordionContentSelector: '.igel_horizontal-accordion-content',
    horizontalAccordionActiveClass: 'active',

    // Animation
    animateClass: '.igel_animate-in',
    animateInDirectionClasses: '.igel_animate-in-left, .igel_animate-in-right, .igel_animate-in-up, .igel_animate-in-down',
    animateActiveClass: 'igel_animate-active',
    animationDuration: 300,
    animationThreshold: 0.3,

    // Trusted domains for external links
    trustedDomains: [
        'mathcloud.li-hamburg.de',
        'li.altrah.net',
        'pikas-kompakt.dzlm.de',
        'pikas.dzlm.de',
        'mahiko.dzlm.de'
        // Weitere vertrauenswürdige Domains hier hinzufügen
    ],

    // Favicon
    faviconUrl: 'https://lms.lernen.hamburg/draftfile.php/1491881/user/draft/367107974/favicon-128x128.png'
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
                        /\/mod\/((?!(data\/view\.php|page\/view\.php|forum\/view\.php)).)*$/, // diese Ausnahmen bekommen auch ein icon
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
    },

    /**
     * Setup link observers for dynamic content
     */
    setupLinkObservers: () => {
        // Set up observer for dynamically added content in tab panels
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

        // Set up observer for dynamically added content in infobox
        const infobox = document.querySelector(CONFIG.featureDetailSelector);
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

            if (tabs.length === 0) {
                return; // No tabs found, skip initialization
            }

            // Add click event listeners to tabs
            tabs.forEach(tab => {
                tab.addEventListener('click', function () {
                    const featureId = this.getAttribute('data-feature-id');
                    TabManager.activateTab(featureId);
                });

                // Add hover effect
                tab.addEventListener('mouseenter', () => {
                    tab.style.cursor = 'pointer';
                });
            });

            console.log("Tab system initialized with", tabs.length, "tabs");
        } catch (error) {
            ErrorHandler.logError('Tab Initialization', error);
        }
    }
};

/**
 * Module for managing feature info system (interactive sidebar)
 */
const FeatureInfoManager = {
    // Store current active feature
    activeFeature: null,

    // Hide all feature details
    hideAllDetails: () => {
        document.querySelectorAll(CONFIG.featureDetailSelector).forEach(detail => {
            detail.style.display = 'none';
            detail.style.opacity = '0';
        });
    },

    // Show default info
    showDefault: () => {
        const defaultInfo = document.querySelector(CONFIG.featureDefaultInfoSelector);
        if (defaultInfo) {
            defaultInfo.style.display = 'block';
            defaultInfo.style.opacity = '1';
        }
    },

    // Hide default info
    hideDefault: () => {
        const defaultInfo = document.querySelector(CONFIG.featureDefaultInfoSelector);
        if (defaultInfo) {
            defaultInfo.style.display = 'none';
            defaultInfo.style.opacity = '0';
        }
    },

    // Show specific feature detail
    showFeatureDetail: (featureId) => {
        const detail = document.querySelector(`${CONFIG.featureDetailSelector}[data-feature="${featureId}"]`);
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
            const previousActive = document.querySelector(`.${CONFIG.featureActiveClass}`);
            if (previousActive) {
                previousActive.classList.remove(CONFIG.featureActiveClass);
            }

            // If clicking the same feature, deselect it
            if (FeatureInfoManager.activeFeature === featureId) {
                FeatureInfoManager.activeFeature = null;
                FeatureInfoManager.hideAllDetails();
                FeatureInfoManager.showDefault();
                return;
            }

            // Add active class to new selection
            clickedElement.classList.add(CONFIG.featureActiveClass);
            FeatureInfoManager.activeFeature = featureId;

            // Update info display
            FeatureInfoManager.hideDefault(); // Hide the default info
            FeatureInfoManager.hideAllDetails();
            setTimeout(() => {
                FeatureInfoManager.showFeatureDetail(featureId);
            }, 50); // Small delay for smooth transition

        } catch (error) {
            ErrorHandler.logError('Feature Selection', error);
        }
    },

    /**
     * Initialize feature info system
     */
    init: () => {
        try {
            // Check if feature info system elements exist
            const featureListItems = document.querySelectorAll('.igel_features-list li[data-feature-id]');

            if (featureListItems.length === 0) {
                return; // No feature list items found, skip initialization
            }

            // Add click handlers to feature list items
            featureListItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    const featureId = item.dataset.featureId;
                    if (featureId) {
                        FeatureInfoManager.selectFeature(featureId, item);
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
            FeatureInfoManager.showDefault();

            console.log("Feature info system initialized with", featureListItems.length, "items");
        } catch (error) {
            ErrorHandler.logError('Feature Info Initialization', error);
        }
    }
};

/**
 * Module for handling horizontal accordion system (for Mathe-Template)
 */
const HorizontalAccordionManager = {
    // Track if accordion has been initialized
    initialized: false,

    /**
     * Initialize horizontal accordion system
     */
    init: () => {
        // Only initialize once
        if (HorizontalAccordionManager.initialized) return;

        try {
            // Check for horizontal accordion
            const horizontalAccordion = document.querySelector(CONFIG.horizontalAccordionContainerSelector);

            if (!horizontalAccordion) {
                return; // No horizontal accordion found, skip initialization
            }

            HorizontalAccordionManager.setupHorizontalAccordion(horizontalAccordion);
            // Set initialized flag to prevent duplicate initialization
            HorizontalAccordionManager.initialized = true;

            console.log("Horizontal accordion system initialized");
        } catch (error) {
            ErrorHandler.logError('Horizontal Accordion Initialization', error);
        }
    },

    /**
     * Set up horizontal accordion
     * @param {HTMLElement} container - Horizontal accordion container
     */
    setupHorizontalAccordion: (container) => {
        try {
            const items = container.querySelectorAll(CONFIG.horizontalAccordionItemSelector);

            items.forEach(item => {
                // Generate random IDs for ARIA attributes
                const header = item.querySelector(CONFIG.horizontalAccordionHeaderSelector);
                const index = item.getAttribute('data-index');
                const contentPanel = container.querySelector(`${CONFIG.horizontalAccordionContentSelector}[data-content="${index}"]`);

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
                header.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default behavior
                    HorizontalAccordionManager.activateHorizontalAccordionItem(item, container);
                });

                // Add keyboard accessibility
                header.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        HorizontalAccordionManager.activateHorizontalAccordionItem(item, container);
                    }
                });
            });

            // Ensure at least one item is active
            if (!container.querySelector(`${CONFIG.horizontalAccordionItemSelector}.active`)) {
                const firstItem = items[0];
                if (firstItem) {
                    HorizontalAccordionManager.activateHorizontalAccordionItem(firstItem, container);
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
            const allItems = container.querySelectorAll(CONFIG.horizontalAccordionItemSelector);
            const allContents = container.querySelectorAll(CONFIG.horizontalAccordionContentSelector);

            allItems.forEach(i => {
                i.classList.remove('active');
                const header = i.querySelector(CONFIG.horizontalAccordionHeaderSelector);
                if (header) header.setAttribute('aria-expanded', 'false');
            });

            allContents.forEach(c => {
                c.classList.remove('active');
            });

            // Activate the selected item
            item.classList.add('active');
            const header = item.querySelector(CONFIG.horizontalAccordionHeaderSelector);
            if (header) header.setAttribute('aria-expanded', 'true');

            // Activate corresponding content
            const index = item.getAttribute('data-index');
            const content = container.querySelector(`${CONFIG.horizontalAccordionContentSelector}[data-content="${index}"]`);

            if (content) {
                content.classList.add('active');
            }
        } catch (error) {
            ErrorHandler.logError('Horizontal Accordion Activation', error);
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
        try {
            // Collect all animation targets
            const animationTargets = [
                ...document.querySelectorAll(CONFIG.animateClass),
                ...document.querySelectorAll(CONFIG.animateInDirectionClasses)
            ];

            if (animationTargets.length === 0) {
                return; // No animation targets found, skip initialization
            }

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

            // Observe all animation targets
            animationTargets.forEach(el => observer.observe(el));

            console.log("Animation system initialized with", animationTargets.length, "targets");
        } catch (error) {
            ErrorHandler.logError('Animation Initialization', error);
        }
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
        try {
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

            console.log("Favicon changed to:", src);
        } catch (error) {
            ErrorHandler.logError('Favicon Change', error);
        }
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
        try {
            // Query all <a> elements inside an <h3> with class "sectionname"
            const anchors = document.querySelectorAll("h3.sectionname a");

            if (anchors.length === 0) {
                return; // No anchors found, skip processing
            }

            let iconsAdded = 0;
            anchors.forEach(function (anchor) {
                // Check if the anchor text begins with "HOME" (after trimming whitespace)
                if (anchor.textContent.trim().startsWith("HOME") && !anchor.querySelector('.fa-home')) {
                    // Insert the icon HTML at the beginning of the anchor element
                    anchor.insertAdjacentHTML('afterbegin',
                        '<i class="fa fa-home" aria-hidden="true" style="margin-right: 4px; font-size: 1rem;"></i>');
                    iconsAdded++;
                }
            });

            if (iconsAdded > 0) {
                console.log("Added home icons to", iconsAdded, "HOME links");
            }
        } catch (error) {
            ErrorHandler.logError('Home Icon Addition', error);
        }
    }
};

/**
 * Module for managing current year in copyright notices
 */
const YearManager = {
    /**
     * Update the current year in year spans
     */
    updateCurrentYear: () => {
        try {
            const yearSpan = document.getElementById(CONFIG.yearSpanSelector.replace('#', ''));
            if (yearSpan) {
                yearSpan.textContent = new Date().getFullYear();
                console.log("Updated current year to:", new Date().getFullYear());
            }
        } catch (error) {
            ErrorHandler.logError('Year Update', error);
        }
    }
};

/**
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("IGEL System initialization started");

        // Process links in the main content
        const contentArea = document.querySelector(CONFIG.contentAreaSelector);
        if (contentArea) {
            LinkStyler.addLinkIcons(contentArea);
        }

        // Setup link observers
        LinkStyler.setupLinkObservers();

        // Update current year in footer if needed
        YearManager.updateCurrentYear();

        // Initialize tab navigation
        TabManager.init();

        // Initialize feature info system
        FeatureInfoManager.init();

        // Initialize horizontal accordion (if present)
        HorizontalAccordionManager.init();

        // Initialize animations
        AnimationManager.init();

        // Add HOME icons
        HomeIconManager.addHomeIcons();

        // Set custom favicon
        FaviconManager.changeFavicon(CONFIG.faviconUrl);

        console.log("IGEL System initialization completed successfully");
    } catch (error) {
        ErrorHandler.logError('Main Initialization', error);
    }
});




// ##### FAQ open&close mechanic #####
document.addEventListener("DOMContentLoaded", () => {
        // Animation timing configuration (all in milliseconds)
        const animationConfig = {
          // Duration of the main animation
          duration: 400,

          // Content fade timing
          contentFadeOutDuration: 400,
          contentFadeInDelay: 100,

          // Height animation timing
          heightCollapseDelay: 500,
          heightExpandDuration: 400,
          heightCollapseDuration: 300, // Added specific duration for collapse animation

          // Synchronization offset between closing and opening
          syncOffset: 0, // Lower values make animations more concurrent, higher values more sequential
        };

        // Select all FAQ items
        const faqItems = document.querySelectorAll(".igel_faq_item details");

        // Helper function to close a specific details element with proper animation
        function closeDetailsElement(element) {
          // Get the content wrapper
          const contentWrapper = element.querySelector(".igel_faq_content_wrapper");
          const content = element.querySelector(".igel_faq_content");

          // 1. Start by measuring the current height and setting it explicitly
          const startHeight = contentWrapper.scrollHeight;
          contentWrapper.style.maxHeight = startHeight + "px";

          // Force a reflow to make sure the explicit height is applied
          contentWrapper.offsetHeight;

          // 2. Set the appropriate transition for smooth collapse
          contentWrapper.style.transition = `max-height ${animationConfig.heightCollapseDuration}ms ease-in-out`;

          // 3. First animate out the content (fade and slide up)
          content.style.transition = `opacity ${animationConfig.contentFadeOutDuration}ms ease, transform ${animationConfig.contentFadeOutDuration}ms ease`;
          content.style.opacity = "0";
          content.style.transform = "translateY(-10px)";

          // 4. After a short delay, start collapsing the height
          setTimeout(() => {
            contentWrapper.style.maxHeight = "0";

            // 5. After the height collapse is complete, close the details and reset styles
            setTimeout(() => {
              element.open = false;

              // Reset all inline styles for next animation
              contentWrapper.style.maxHeight = "";
              contentWrapper.style.transition = "";
              content.style.opacity = "";
              content.style.transform = "";
              content.style.transition = "";
            }, animationConfig.heightCollapseDuration + 50); // Add small buffer
          }, animationConfig.heightCollapseDelay);

          // Return when this animation will be visually "halfway done" - used for synchronization
          return animationConfig.contentFadeOutDuration / 2;
        }

        // Function to open a details element with animation
        function openDetailsElement(element, delay = 0) {
          // Delay the start of opening if needed (for synchronization)
          setTimeout(() => {
            // First set open state
            element.open = true;

            // Get the content wrapper and content
            const contentWrapper = element.querySelector(".igel_faq_content_wrapper");
            const content = element.querySelector(".igel_faq_content");

            // Set initial states for animation
            contentWrapper.style.maxHeight = "0";
            content.style.opacity = "0";
            content.style.transform = "translateY(-10px)";

            // Force a reflow
            contentWrapper.offsetHeight;

            // 1. Set transitions for smooth animation
            contentWrapper.style.transition = `max-height ${animationConfig.heightExpandDuration}ms ease-in-out`;

            // 2. First animate the wrapper open
            contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";

            // 3. Then fade in and slide down the content
            setTimeout(() => {
              content.style.transition = `opacity ${animationConfig.duration}ms ease, transform ${animationConfig.duration}ms ease`;
              content.style.opacity = "1";
              content.style.transform = "translateY(0)";

              // 4. After all animations complete, reset the maxHeight to allow for content changes
              setTimeout(() => {
                contentWrapper.style.maxHeight = "";
                contentWrapper.style.transition = "";
                content.style.transition = "";
              }, animationConfig.duration);
            }, animationConfig.contentFadeInDelay);
          }, delay);
        }

        // Add click event listeners to each summary element
        faqItems.forEach((details) => {
          const summary = details.querySelector("summary");

          summary.addEventListener("click", (event) => {
            // Prevent default toggle behavior
            event.preventDefault();

            // If already open, close it
            if (details.open) {
              closeDetailsElement(details);
            } else {
              let syncDelay = 0;
              let anyOpen = false;

              // Close all other open items first
              faqItems.forEach((otherDetails) => {
                if (otherDetails !== details && otherDetails.open) {
                  anyOpen = true;
                  // Get timing info from closing animation for synchronization
                  const halfwayPoint = closeDetailsElement(otherDetails);
                  // Set delay for opening animation based on the halfway point of closing
                  syncDelay = animationConfig.syncOffset;
                }
              });

              // Open this item with appropriate delay for synchronization
              openDetailsElement(details, syncDelay);
            }
          });

          // Improve keyboard accessibility
          summary.addEventListener("keydown", (e) => {
            // Enter or Space key to toggle details
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              summary.click();
            }
          });
        });

        // For accessibility - disable animations if user prefers reduced motion
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          document.documentElement.classList.add("reduced-motion");
        }
      });


    
// Scroll-Fix für mobiles Edge: verhindert Sprung zum h1 bei Seitenstart
window.addEventListener("load", () => {
  if (window.scrollY < 100) {
    window.scrollTo(0, 1); // minimale Verschiebung bricht Auto-Scroll
  }
});
