/**
 * Accessibility Component
 * Provides accessibility features and utilities
 */

class Accessibility {
  constructor() {
    this.init();
  }

  /**
   * Initialize accessibility features
   */
  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupHighContrastMode();
    this.setupReducedMotion();
    this.setupColorBlindSupport();
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Skip links
    this.createSkipLinks();
    
    // Tab navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Arrow key navigation for custom components
    this.setupArrowKeyNavigation();
  }

  /**
   * Create skip links
   */
  createSkipLinks() {
    const skipLinks = [
      { href: '#main', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#footer', text: 'Skip to footer' }
    ];

    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-links';
    
    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipContainer, document.body.firstChild);
  }

  /**
   * Setup arrow key navigation
   */
  setupArrowKeyNavigation() {
    document.addEventListener('keydown', (e) => {
      const { key, target } = e;
      
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        return;
      }

      // Handle custom dropdown navigation
      if (target.classList.contains('dropdown-trigger')) {
        this.handleDropdownNavigation(e, target);
        return;
      }

      // Handle custom list navigation
      if (target.classList.contains('list-item')) {
        this.handleListNavigation(e, target);
        return;
      }

      // Handle custom grid navigation
      if (target.classList.contains('grid-item')) {
        this.handleGridNavigation(e, target);
        return;
      }
    });
  }

  /**
   * Handle dropdown navigation
   */
  handleDropdownNavigation(e, target) {
    const dropdown = target.closest('.dropdown');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const currentIndex = Array.from(items).indexOf(document.activeElement);
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Escape':
        target.focus();
        dropdown.classList.remove('open');
        return;
    }
    
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      items[nextIndex].focus();
    }
  }

  /**
   * Handle list navigation
   */
  handleListNavigation(e, target) {
    const list = target.closest('.list');
    const items = list.querySelectorAll('.list-item');
    const currentIndex = Array.from(items).indexOf(target);
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
    }
    
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      items[nextIndex].focus();
    }
  }

  /**
   * Handle grid navigation
   */
  handleGridNavigation(e, target) {
    const grid = target.closest('.grid');
    const items = Array.from(grid.querySelectorAll('.grid-item'));
    const currentIndex = items.indexOf(target);
    const columns = parseInt(grid.dataset.columns) || 3;
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + columns, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - columns, 0);
        break;
    }
    
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      items[nextIndex].focus();
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Focus trap for modals
    this.setupFocusTrap();
    
    // Focus restoration
    this.setupFocusRestoration();
    
    // Focus indicators
    this.setupFocusIndicators();
  }

  /**
   * Setup focus trap
   */
  setupFocusTrap() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const modal = document.querySelector('.modal.open');
      if (!modal) return;
      
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  /**
   * Setup focus restoration
   */
  setupFocusRestoration() {
    let lastFocusedElement = null;
    
    // Store last focused element
    document.addEventListener('focusin', (e) => {
      if (!e.target.closest('.modal')) {
        lastFocusedElement = e.target;
      }
    });
    
    // Restore focus when modal closes
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-close') || 
          e.target.classList.contains('modal-backdrop')) {
        if (lastFocusedElement) {
          lastFocusedElement.focus();
        }
      }
    });
  }

  /**
   * Setup focus indicators
   */
  setupFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      
      .keyboard-navigation .btn:focus,
      .keyboard-navigation .form-input:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Live regions for dynamic content
    this.createLiveRegion('status', 'polite');
    this.createLiveRegion('alert', 'assertive');
    
    // ARIA labels for interactive elements
    this.setupAriaLabels();
    
    // Screen reader announcements
    this.setupScreenReaderAnnouncements();
  }

  /**
   * Create live region
   */
  createLiveRegion(id, politeness = 'polite') {
    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }

  /**
   * Setup ARIA labels
   */
  setupAriaLabels() {
    // Add ARIA labels to buttons without text
    document.querySelectorAll('button:not([aria-label]):empty').forEach(button => {
      const icon = button.querySelector('i, svg');
      if (icon) {
        button.setAttribute('aria-label', this.getIconLabel(icon));
      }
    });
    
    // Add ARIA labels to form inputs
    document.querySelectorAll('input:not([aria-label])').forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        input.setAttribute('aria-label', label.textContent);
      }
    });
  }

  /**
   * Get icon label
   */
  getIconLabel(icon) {
    const iconLabels = {
      'fa-search': 'Search',
      'fa-user': 'User',
      'fa-settings': 'Settings',
      'fa-menu': 'Menu',
      'fa-close': 'Close',
      'fa-arrow-left': 'Go back',
      'fa-arrow-right': 'Go forward',
      'fa-edit': 'Edit',
      'fa-delete': 'Delete',
      'fa-save': 'Save',
      'fa-cancel': 'Cancel'
    };
    
    const classes = Array.from(icon.classList);
    const iconClass = classes.find(cls => cls.startsWith('fa-'));
    
    return iconLabels[iconClass] || 'Icon';
  }

  /**
   * Setup screen reader announcements
   */
  setupScreenReaderAnnouncements() {
    // Announce page changes
    this.announcePageChange = (message) => {
      const region = document.getElementById('status');
      if (region) {
        region.textContent = message;
      }
    };
    
    // Announce alerts
    this.announceAlert = (message) => {
      const region = document.getElementById('alert');
      if (region) {
        region.textContent = message;
      }
    };
  }

  /**
   * Setup high contrast mode
   */
  setupHighContrastMode() {
    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }
    
    // Listen for changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    });
  }

  /**
   * Setup reduced motion
   */
  setupReducedMotion() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }
    
    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    });
  }

  /**
   * Setup color blind support
   */
  setupColorBlindSupport() {
    // Add color blind friendly indicators
    this.addColorBlindIndicators();
    
    // Provide alternative text for color-coded information
    this.addColorAlternatives();
  }

  /**
   * Add color blind indicators
   */
  addColorBlindIndicators() {
    // Add patterns or icons to color-coded elements
    document.querySelectorAll('.status-success').forEach(el => {
      if (!el.querySelector('.status-icon')) {
        const icon = document.createElement('span');
        icon.className = 'status-icon';
        icon.textContent = '✓';
        icon.setAttribute('aria-label', 'Success');
        el.insertBefore(icon, el.firstChild);
      }
    });
    
    document.querySelectorAll('.status-error').forEach(el => {
      if (!el.querySelector('.status-icon')) {
        const icon = document.createElement('span');
        icon.className = 'status-icon';
        icon.textContent = '✗';
        icon.setAttribute('aria-label', 'Error');
        el.insertBefore(icon, el.firstChild);
      }
    });
    
    document.querySelectorAll('.status-warning').forEach(el => {
      if (!el.querySelector('.status-icon')) {
        const icon = document.createElement('span');
        icon.className = 'status-icon';
        icon.textContent = '⚠';
        icon.setAttribute('aria-label', 'Warning');
        el.insertBefore(icon, el.firstChild);
      }
    });
  }

  /**
   * Add color alternatives
   */
  addColorAlternatives() {
    // Add text labels to color-coded buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
      if (!btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Primary action');
      }
    });
    
    document.querySelectorAll('.btn-secondary').forEach(btn => {
      if (!btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Secondary action');
      }
    });
  }

  /**
   * Make element focusable
   */
  static makeFocusable(element) {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
  }

  /**
   * Make element not focusable
   */
  static makeNotFocusable(element) {
    element.setAttribute('tabindex', '-1');
  }

  /**
   * Set ARIA expanded state
   */
  static setExpanded(element, expanded) {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  /**
   * Set ARIA selected state
   */
  static setSelected(element, selected) {
    element.setAttribute('aria-selected', selected.toString());
  }

  /**
   * Set ARIA checked state
   */
  static setChecked(element, checked) {
    element.setAttribute('aria-checked', checked.toString());
  }

  /**
   * Set ARIA hidden state
   */
  static setHidden(element, hidden) {
    element.setAttribute('aria-hidden', hidden.toString());
  }

  /**
   * Get accessible name
   */
  static getAccessibleName(element) {
    // Try aria-label first
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }
    
    // Try aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) {
        return labelElement.textContent;
      }
    }
    
    // Try associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent;
      }
    }
    
    // Try title attribute
    if (element.title) {
      return element.title;
    }
    
    // Fall back to text content
    return element.textContent.trim();
  }
}

// Add CSS for accessibility
const accessibilityStyles = `
  /* Skip Links */
  .skip-links {
    position: absolute;
    top: -40px;
    left: 6px;
    z-index: 10000;
  }

  .skip-link {
    display: block;
    background: var(--primary-color);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 4px;
    margin-bottom: 4px;
    transition: top 0.3s ease;
  }

  .skip-link:focus {
    top: 6px;
    position: absolute;
  }

  /* Screen Reader Only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Focus Indicators */
  .keyboard-navigation *:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .keyboard-navigation .btn:focus,
  .keyboard-navigation .form-input:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  /* High Contrast Mode */
  .high-contrast {
    --primary-color: #0000ff;
    --secondary-color: #000000;
    --text-color: #000000;
    --bg-color: #ffffff;
    --border-color: #000000;
  }

  .high-contrast .card {
    border: 2px solid var(--border-color);
  }

  .high-contrast .btn {
    border: 2px solid currentColor;
  }

  /* Reduced Motion */
  .reduced-motion *,
  .reduced-motion *::before,
  .reduced-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Status Icons */
  .status-icon {
    margin-right: 0.5rem;
    font-weight: bold;
  }

  .status-success .status-icon {
    color: var(--success-color);
  }

  .status-error .status-icon {
    color: var(--error-color);
  }

  .status-warning .status-icon {
    color: var(--warning-color);
  }

  /* Focus Trap */
  .modal[aria-hidden="true"] * {
    visibility: hidden;
  }

  .modal[aria-hidden="false"] * {
    visibility: visible;
  }

  /* ARIA Live Regions */
  #status,
  #alert {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;

// Inject styles
if (!document.querySelector('#accessibility-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'accessibility-styles';
  styleSheet.textContent = accessibilityStyles;
  document.head.appendChild(styleSheet);
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', () => {
  new Accessibility();
});

// Export for use
window.Accessibility = Accessibility;
