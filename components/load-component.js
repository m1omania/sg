// Component loader utility
async function loadComponent(componentPath, targetSelector) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.status}`);
        }
        const html = await response.text();
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.innerHTML = html;
            console.log(`Component loaded: ${componentPath} into ${targetSelector}`);
        } else {
            console.error(`Target element not found: ${targetSelector}`);
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Load components
document.addEventListener('DOMContentLoaded', function() {
    loadComponent('components/header.html', '#header-placeholder');
    loadComponent('components/sidebar.html', '#sidebar-placeholder');
});
