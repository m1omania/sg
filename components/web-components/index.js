// Main module for Web Components
// This file automatically loads and registers all components

// Import components
import './header.js';
import './sidebar.js';

// Auto-initialization function
function initializeComponents() {
    console.log('🚀 Web Components initialized');
    
    // Check if components are already loaded
    const existingHeader = document.querySelector('sg-header');
    const existingSidebar = document.querySelector('sg-sidebar');
    
    if (!existingHeader) {
        // Create header if it doesn't exist
        const header = document.createElement('sg-header');
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.replaceWith(header);
        } else {
            // Insert at the beginning of body
            document.body.insertBefore(header, document.body.firstChild);
        }
    }
    
    if (!existingSidebar) {
        // Create sidebar if it doesn't exist
        const sidebar = document.createElement('sg-sidebar');
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        if (sidebarPlaceholder) {
            sidebarPlaceholder.replaceWith(sidebar);
        } else {
            // Insert after header
            const header = document.querySelector('sg-header');
            if (header) {
                header.insertAdjacentElement('afterend', sidebar);
            } else {
                document.body.insertBefore(sidebar, document.body.firstChild);
            }
        }
    }
    
    // Set up global event listeners
    setupGlobalEventListeners();
}

// Set up global event listeners for components
function setupGlobalEventListeners() {
    // Listen for logout events from header
    document.addEventListener('logout', (e) => {
        console.log('Logout event received:', e.detail);
        // Additional logout logic can be added here
    });
    
    // Listen for language change events from header
    document.addEventListener('languageChanged', (e) => {
        console.log('Language changed to:', e.detail.language);
        // Additional language change logic can be added here
    });
    
    // Listen for navigation events
    document.addEventListener('navigate', (e) => {
        console.log('Navigation event:', e.detail);
        // Update sidebar active state
        const sidebar = document.querySelector('sg-sidebar');
        if (sidebar) {
            sidebar.setActivePage();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}

// Export for manual initialization if needed
export { initializeComponents };
