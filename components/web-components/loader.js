// Universal Web Components Loader with Fallback
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // Try ES6 modules first, fallback to IIFE
        useModules: true,
        // Fallback timeout in milliseconds
        fallbackTimeout: 2000,
        // Debug mode
        debug: false
    };
    
    // Logging utility
    function log(message, ...args) {
        if (CONFIG.debug) {
            console.log(`[WebComponents Loader] ${message}`, ...args);
        }
    }
    
    // Check if ES6 modules are supported
    function supportsES6Modules() {
        try {
            // Check if we can create a script with type="module"
            const script = document.createElement('script');
            script.type = 'module';
            return 'noModule' in script;
        } catch (e) {
            return false;
        }
    }
    
    // Load ES6 module version
    function loadModuleVersion() {
        return new Promise((resolve, reject) => {
            log('Loading ES6 module version...');
            
            // Create script elements for modules
            const headerScript = document.createElement('script');
            headerScript.type = 'module';
            headerScript.src = '/components/web-components/header-module.js';
            
            const sidebarScript = document.createElement('script');
            sidebarScript.type = 'module';
            sidebarScript.src = '/components/web-components/sidebar-module.js';
            
            // Track loading
            let loadedCount = 0;
            const totalModules = 2;
            
            function onLoad() {
                loadedCount++;
                if (loadedCount === totalModules) {
                    log('ES6 modules loaded successfully');
                    resolve();
                }
            }
            
            function onError(error) {
                log('ES6 module loading failed:', error);
                reject(error);
            }
            
            headerScript.onload = onLoad;
            headerScript.onerror = onError;
            sidebarScript.onload = onLoad;
            sidebarScript.onerror = onError;
            
            // Append to head
            document.head.appendChild(headerScript);
            document.head.appendChild(sidebarScript);
        });
    }
    
    // Load IIFE fallback version
    function loadIIFEVersion() {
        return new Promise((resolve, reject) => {
            log('Loading IIFE fallback version...');
            
            const headerScript = document.createElement('script');
            headerScript.src = '/components/web-components/header-iife.js';
            
            const sidebarScript = document.createElement('script');
            sidebarScript.src = '/components/web-components/sidebar-standalone.js';
            
            let loadedCount = 0;
            const totalScripts = 2;
            
            function onLoad() {
                loadedCount++;
                if (loadedCount === totalScripts) {
                    log('IIFE fallback loaded successfully');
                    resolve();
                }
            }
            
            function onError(error) {
                log('IIFE fallback loading failed:', error);
                reject(error);
            }
            
            headerScript.onload = onLoad;
            headerScript.onerror = onError;
            sidebarScript.onload = onLoad;
            sidebarScript.onerror = onError;
            
            document.head.appendChild(headerScript);
            document.head.appendChild(sidebarScript);
        });
    }
    
    // Initialize components
    function initializeComponents() {
        log('Initializing Web Components...');
        
        // Check if components are already loaded
        const existingHeader = document.querySelector('sg-header');
        const existingSidebar = document.querySelector('sg-sidebar');
        
        if (!existingHeader) {
            const header = document.createElement('sg-header');
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.replaceWith(header);
            } else {
                document.body.insertBefore(header, document.body.firstChild);
            }
            log('Header component initialized');
        }
        
        if (!existingSidebar) {
            const sidebar = document.createElement('sg-sidebar');
            const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
            if (sidebarPlaceholder) {
                sidebarPlaceholder.replaceWith(sidebar);
            } else {
                const header = document.querySelector('sg-header');
                if (header) {
                    header.insertAdjacentElement('afterend', sidebar);
                } else {
                    document.body.insertBefore(sidebar, document.body.firstChild);
                }
            }
            log('Sidebar component initialized');
        }
    }
    
    // Main loading function
    async function loadWebComponents() {
        try {
            // Try ES6 modules first if supported and enabled
            if (CONFIG.useModules && supportsES6Modules()) {
                log('ES6 modules supported, trying module version...');
                
                // Set timeout for fallback
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Module loading timeout')), CONFIG.fallbackTimeout);
                });
                
                try {
                    await Promise.race([loadModuleVersion(), timeoutPromise]);
                    log('ES6 modules loaded successfully');
                } catch (error) {
                    log('ES6 modules failed, falling back to IIFE:', error);
                    await loadIIFEVersion();
                }
            } else {
                log('ES6 modules not supported or disabled, using IIFE version');
                await loadIIFEVersion();
            }
            
            // Initialize components after loading
            initializeComponents();
            
        } catch (error) {
            console.error('Failed to load Web Components:', error);
            
            // Last resort: try to load standalone versions
            try {
                log('Trying standalone fallback...');
                await loadIIFEVersion();
                initializeComponents();
            } catch (fallbackError) {
                console.error('All Web Components loading methods failed:', fallbackError);
            }
        }
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadWebComponents);
    } else {
        loadWebComponents();
    }
    
    // Export for manual initialization
    window.WebComponentsLoader = {
        load: loadWebComponents,
        config: CONFIG
    };
    
})();
