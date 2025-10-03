/**
 * Error Boundary Component
 * Handles JavaScript errors in the application
 */

class ErrorBoundary {
  constructor(options = {}) {
    this.options = {
      fallbackUI: true,
      logErrors: true,
      onError: null,
      ...options
    };
    
    this.init();
  }

  /**
   * Initialize error boundary
   */
  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, event.filename, event.lineno);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Promise Rejection');
    });

    // Fetch error handler
    this.originalFetch = window.fetch;
    window.fetch = (...args) => {
      return this.originalFetch(...args)
        .catch(error => {
          this.handleError(error, 'Fetch Error');
          throw error;
        });
    };
  }

  /**
   * Handle errors
   */
  handleError(error, source = 'Unknown', line = null) {
    if (this.options.logErrors) {
      console.error('ErrorBoundary caught error:', {
        error: error.message || error,
        stack: error.stack,
        source,
        line,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    // Call custom error handler
    if (this.options.onError) {
      this.options.onError(error, source, line);
    }

    // Show error UI if enabled
    if (this.options.fallbackUI) {
      this.showErrorUI(error, source);
    }
  }

  /**
   * Show error UI
   */
  showErrorUI(error, source) {
    // Remove existing error UI
    this.hideErrorUI();

    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-boundary';
    errorContainer.innerHTML = this.createErrorUI(error, source);
    
    // Insert at the beginning of body
    document.body.insertBefore(errorContainer, document.body.firstChild);
    
    this.errorContainer = errorContainer;
  }

  /**
   * Hide error UI
   */
  hideErrorUI() {
    if (this.errorContainer) {
      this.errorContainer.remove();
      this.errorContainer = null;
    }
  }

  /**
   * Create error UI HTML
   */
  createErrorUI(error, source) {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    return `
      <div class="error-boundary-overlay">
        <div class="error-boundary-content">
          <div class="error-icon">⚠️</div>
          <h2 class="error-title">Something went wrong</h2>
          <p class="error-message">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          
          ${isDevelopment ? `
            <details class="error-details">
              <summary>Error Details (Development)</summary>
              <div class="error-stack">
                <strong>Error:</strong> ${error.message || error}<br>
                <strong>Source:</strong> ${source}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}
                ${error.stack ? `<br><strong>Stack:</strong><br><pre>${error.stack}</pre>` : ''}
              </div>
            </details>
          ` : ''}
          
          <div class="error-actions">
            <button class="btn btn-primary" onclick="window.location.reload()">
              Refresh Page
            </button>
            <button class="btn btn-outline" onclick="this.closest('.error-boundary').remove()">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show toast error message
   */
  static showToast(message, type = 'error', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${this.getToastIcon(type)}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()">×</button>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
    
    return toast;
  }

  /**
   * Get toast icon
   */
  static getToastIcon(type) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Show inline error message
   */
  static showInline(container, message, type = 'error') {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) return;

    // Remove existing error
    this.hideInline(container);
    
    const errorElement = document.createElement('div');
    errorElement.className = `inline-error inline-error-${type}`;
    errorElement.innerHTML = `
      <span class="inline-error-icon">${this.getToastIcon(type)}</span>
      <span class="inline-error-message">${message}</span>
    `;
    
    container.appendChild(errorElement);
    
    return errorElement;
  }

  /**
   * Hide inline error message
   */
  static hideInline(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) return;
    
    const existingError = container.querySelector('.inline-error');
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * Validate form and show errors
   */
  static validateForm(form, rules = {}) {
    const errors = {};
    const formData = new FormData(form);
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!formData.get(field.name)) {
        errors[field.name] = `${field.labels[0]?.textContent || field.name} is required`;
      }
    });
    
    // Check email fields
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
      const value = formData.get(field.name);
      if (value && !this.isValidEmail(value)) {
        errors[field.name] = 'Please enter a valid email address';
      }
    });
    
    // Check password fields
    const passwordFields = form.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
      const value = formData.get(field.name);
      if (value && value.length < 8) {
        errors[field.name] = 'Password must be at least 8 characters long';
      }
    });
    
    // Show errors
    Object.keys(errors).forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.classList.add('error');
        this.showInline(field.closest('.form-group'), errors[fieldName]);
      }
    });
    
    return Object.keys(errors).length === 0;
  }

  /**
   * Validate email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle API errors
   */
  static handleApiError(error, context = '') {
    let message = 'An error occurred';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          message = data.message || 'Invalid request';
          break;
        case 401:
          message = 'Please log in to continue';
          break;
        case 403:
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 429:
          message = 'Too many requests. Please try again later';
          break;
        case 500:
          message = 'Server error. Please try again later';
          break;
        default:
          message = data.message || `Error ${status}`;
      }
    } else if (error.request) {
      // Network error
      message = 'Network error. Please check your connection';
    } else {
      // Other error
      message = error.message || 'An unexpected error occurred';
    }
    
    // Add context if provided
    if (context) {
      message = `${context}: ${message}`;
    }
    
    this.showToast(message, 'error');
    return message;
  }
}

// Add CSS for error boundary
const errorBoundaryStyles = `
  .error-boundary-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
  }

  .error-boundary-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--error-color);
    margin: 0 0 1rem 0;
  }

  .error-message {
    color: var(--text-color);
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
  }

  .error-details {
    text-align: left;
    margin: 1.5rem 0;
    padding: 1rem;
    background: var(--bg-light);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .error-stack {
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--text-color);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .error-actions .btn {
    min-width: 120px;
  }

  /* Toast Messages */
  .toast {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    max-width: 400px;
    animation: toast-slide-in 0.3s ease-out;
  }

  .toast-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 0.75rem;
  }

  .toast-icon {
    font-size: 1.2rem;
  }

  .toast-message {
    flex: 1;
    color: var(--text-color);
  }

  .toast-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-color);
    opacity: 0.7;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-close:hover {
    opacity: 1;
  }

  .toast-error {
    border-left: 4px solid var(--error-color);
  }

  .toast-warning {
    border-left: 4px solid var(--warning-color);
  }

  .toast-success {
    border-left: 4px solid var(--success-color);
  }

  .toast-info {
    border-left: 4px solid var(--primary-color);
  }

  /* Inline Errors */
  .inline-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    border-radius: 4px;
  }

  .inline-error-error {
    background: var(--error-bg);
    color: var(--error-color);
    border: 1px solid var(--error-color);
  }

  .inline-error-warning {
    background: var(--warning-bg);
    color: var(--warning-color);
    border: 1px solid var(--warning-color);
  }

  .inline-error-success {
    background: var(--success-bg);
    color: var(--success-color);
    border: 1px solid var(--success-color);
  }

  .inline-error-info {
    background: var(--primary-bg);
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
  }

  .inline-error-icon {
    font-size: 1rem;
  }

  .inline-error-message {
    flex: 1;
  }

  /* Animations */
  @keyframes toast-slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .error-boundary-content {
      background: var(--bg-light);
      color: var(--text-color);
    }

    .toast {
      background: var(--bg-light);
      color: var(--text-color);
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .error-boundary-content {
      margin: 1rem;
      padding: 1.5rem;
    }

    .error-actions {
      flex-direction: column;
    }

    .error-actions .btn {
      width: 100%;
    }

    .toast {
      right: 0.5rem;
      left: 0.5rem;
      max-width: none;
    }
  }
`;

// Inject styles
if (!document.querySelector('#error-boundary-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'error-boundary-styles';
  styleSheet.textContent = errorBoundaryStyles;
  document.head.appendChild(styleSheet);
}

// Export for use
window.ErrorBoundary = ErrorBoundary;
