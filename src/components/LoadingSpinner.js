/**
 * Loading Spinner Component
 * Provides various loading states for the application
 */

class LoadingSpinner {
  constructor(options = {}) {
    this.options = {
      size: 'medium',
      color: 'primary',
      text: '',
      overlay: false,
      ...options
    };
  }

  /**
   * Create loading spinner HTML
   */
  create() {
    const sizeClass = this.getSizeClass();
    const colorClass = this.getColorClass();
    const overlayClass = this.options.overlay ? 'loading-overlay' : '';
    
    return `
      <div class="loading-spinner ${sizeClass} ${colorClass} ${overlayClass}">
        <div class="spinner"></div>
        ${this.options.text ? `<div class="spinner-text">${this.options.text}</div>` : ''}
      </div>
    `;
  }

  /**
   * Show loading spinner
   */
  show(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      console.error('LoadingSpinner: Container not found');
      return;
    }

    // Remove existing spinner
    this.hide(container);
    
    // Create and append spinner
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner-container';
    spinner.innerHTML = this.create();
    container.appendChild(spinner);
    
    // Store reference for later removal
    this.container = container;
    this.spinnerElement = spinner;
  }

  /**
   * Hide loading spinner
   */
  hide(container) {
    if (container) {
      const existingSpinner = container.querySelector('.loading-spinner-container');
      if (existingSpinner) {
        existingSpinner.remove();
      }
    } else if (this.spinnerElement) {
      this.spinnerElement.remove();
      this.spinnerElement = null;
    }
  }

  /**
   * Show full page loading overlay
   */
  showOverlay(text = 'Loading...') {
    this.options.overlay = true;
    this.options.text = text;
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = this.create();
    document.body.appendChild(overlay);
    
    this.overlayElement = overlay;
  }

  /**
   * Hide full page loading overlay
   */
  hideOverlay() {
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }

  /**
   * Get size class
   */
  getSizeClass() {
    const sizes = {
      small: 'spinner-sm',
      medium: 'spinner-md',
      large: 'spinner-lg',
      xlarge: 'spinner-xl'
    };
    return sizes[this.options.size] || 'spinner-md';
  }

  /**
   * Get color class
   */
  getColorClass() {
    const colors = {
      primary: 'spinner-primary',
      secondary: 'spinner-secondary',
      white: 'spinner-white',
      dark: 'spinner-dark'
    };
    return colors[this.options.color] || 'spinner-primary';
  }

  /**
   * Create button loading state
   */
  static buttonLoading(button, text = 'Loading...') {
    if (!button) return;
    
    // Store original content
    button.dataset.originalText = button.textContent;
    button.dataset.originalHTML = button.innerHTML;
    
    // Disable button
    button.disabled = true;
    
    // Add loading spinner
    button.innerHTML = `
      <span class="loading spinner-sm"></span>
      <span>${text}</span>
    `;
    
    return button;
  }

  /**
   * Remove button loading state
   */
  static buttonReset(button) {
    if (!button) return;
    
    // Restore original content
    if (button.dataset.originalHTML) {
      button.innerHTML = button.dataset.originalHTML;
    } else if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
    
    // Enable button
    button.disabled = false;
    
    return button;
  }

  /**
   * Create skeleton loading
   */
  static skeleton(type = 'card') {
    const skeletons = {
      card: `
        <div class="skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-button"></div>
        </div>
      `,
      table: `
        <div class="skeleton-table">
          <div class="skeleton-line skeleton-header"></div>
          <div class="skeleton-line skeleton-row"></div>
          <div class="skeleton-line skeleton-row"></div>
          <div class="skeleton-line skeleton-row"></div>
        </div>
      `,
      list: `
        <div class="skeleton-list">
          <div class="skeleton-line skeleton-item"></div>
          <div class="skeleton-line skeleton-item"></div>
          <div class="skeleton-line skeleton-item"></div>
        </div>
      `
    };
    
    return skeletons[type] || skeletons.card;
  }
}

// Add CSS for loading spinners
const loadingStyles = `
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .loading-spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
  }

  .spinner {
    border: 3px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s linear infinite;
  }

  .spinner-sm { width: 20px; height: 20px; border-width: 2px; }
  .spinner-md { width: 30px; height: 30px; border-width: 3px; }
  .spinner-lg { width: 40px; height: 40px; border-width: 4px; }
  .spinner-xl { width: 50px; height: 50px; border-width: 5px; }

  .spinner-primary { border-top-color: var(--primary-color); }
  .spinner-secondary { border-top-color: var(--secondary-color); }
  .spinner-white { border-top-color: white; }
  .spinner-dark { border-top-color: var(--text-color); }

  .spinner-text {
    font-size: 0.9rem;
    color: var(--text-color);
    text-align: center;
  }

  .loading-overlay .spinner-text {
    font-size: 1.1rem;
    font-weight: 500;
  }

  /* Skeleton Loading */
  .skeleton-card,
  .skeleton-table,
  .skeleton-list {
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .skeleton-line {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .skeleton-title { height: 20px; width: 60%; }
  .skeleton-text { height: 16px; width: 100%; }
  .skeleton-button { height: 36px; width: 120px; }
  .skeleton-header { height: 18px; width: 100%; }
  .skeleton-row { height: 16px; width: 100%; }
  .skeleton-item { height: 16px; width: 100%; }

  @keyframes skeleton-loading {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Dark mode skeleton */
  @media (prefers-color-scheme: dark) {
    .skeleton-line {
      background: linear-gradient(90deg, #2a2a2a 25%, #404040 50%, #2a2a2a 75%);
      background-size: 200% 100%;
    }
  }
`;

// Inject styles
if (!document.querySelector('#loading-spinner-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'loading-spinner-styles';
  styleSheet.textContent = loadingStyles;
  document.head.appendChild(styleSheet);
}

// Export for use
window.LoadingSpinner = LoadingSpinner;
