/**
 * SolarGroup Investment Platform - Optimized JavaScript
 * Modern ES6+ features with performance optimizations
 */

// Global state management
class StateManager {
  constructor() {
    this.state = {
      user: null,
      wallet: null,
      investments: [],
      projects: [],
      notifications: [],
      theme: 'light',
      currency: 'USD'
    };
    this.listeners = new Map();
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners(newState);
  }

  getState() {
    return this.state;
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
  }

  unsubscribe(key, callback) {
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(changedState) {
    Object.keys(changedState).forEach(key => {
      if (this.listeners.has(key)) {
        this.listeners.get(key).forEach(callback => {
          callback(changedState[key]);
        });
      }
    });
  }
}

// API service with error handling and caching
class ApiService {
  constructor() {
    this.baseURL = '/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (options.method === 'GET' && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache GET requests
      if (options.method === 'GET' || !options.method) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      ErrorBoundary.handleApiError(error, `API ${endpoint}`);
      throw error;
    }
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    localStorage.removeItem('authToken');
  }

  // Specific API methods
  async getWallet(userId) {
    return this.request(`/wallet/${userId}`);
  }

  async getInvestments(userId) {
    return this.request(`/investments/${userId}`);
  }

  async getProjects() {
    return this.request('/projects');
  }

  async getCoupons() {
    return this.request('/coupons/active');
  }

  async deposit(userId, amount, method) {
    return this.request(`/wallet/${userId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount, method })
    });
  }

  async invest(projectId, amount) {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify({ projectId, amount })
    });
  }
}

// Utility functions
class Utils {
  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
  }

  static formatPercentage(value) {
    return `${value.toFixed(2)}%`;
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  static formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidAmount(amount) {
    return !isNaN(amount) && amount > 0;
  }

  static copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    }
  }
}

// Animation utilities
class Animations {
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }

  static fadeOut(element, duration = 300) {
    const start = performance.now();
    const startOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = startOpacity * (1 - progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }
    
    requestAnimationFrame(animate);
  }

  static slideDown(element, duration = 300) {
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    const targetHeight = element.scrollHeight;
    const start = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.height = `${targetHeight * progress}px`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = 'auto';
        element.style.overflow = 'visible';
      }
    }
    
    requestAnimationFrame(animate);
  }

  static slideUp(element, duration = 300) {
    const startHeight = element.offsetHeight;
    const start = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.height = `${startHeight * (1 - progress)}px`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        element.style.height = 'auto';
      }
    }
    
    requestAnimationFrame(animate);
  }
}

// Form validation
class FormValidator {
  constructor(form) {
    this.form = form;
    this.rules = new Map();
    this.errors = new Map();
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => {
      if (!this.validate()) {
        e.preventDefault();
      }
    });

    // Real-time validation
    this.form.addEventListener('input', Utils.debounce((e) => {
      this.validateField(e.target);
    }, 300));
  }

  addRule(fieldName, rule) {
    if (!this.rules.has(fieldName)) {
      this.rules.set(fieldName, []);
    }
    this.rules.get(fieldName).push(rule);
  }

  validate() {
    let isValid = true;
    this.errors.clear();

    this.rules.forEach((rules, fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const fieldValid = this.validateField(field);
        if (!fieldValid) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  validateField(field) {
    const fieldName = field.name;
    const rules = this.rules.get(fieldName) || [];
    let isValid = true;

    rules.forEach(rule => {
      const result = rule(field.value, field);
      if (result !== true) {
        this.errors.set(fieldName, result);
        this.showFieldError(field, result);
        isValid = false;
      }
    });

    if (isValid) {
      this.clearFieldError(field);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.form-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
      errorElement.remove();
    }
  }
}

// Notification system
class NotificationManager {
  constructor() {
    this.container = this.createContainer();
    this.notifications = new Map();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
  }

  show(message, type = 'info', duration = 5000) {
    const id = Utils.generateId();
    const notification = this.createNotification(id, message, type);
    
    this.container.appendChild(notification);
    this.notifications.set(id, notification);

    // Auto remove
    setTimeout(() => {
      this.remove(id);
    }, duration);

    return id;
  }

  createNotification(id, message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      margin-bottom: 10px;
      padding: 16px;
      border-left: 4px solid var(--${type}-color);
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="notification-icon">
            ${this.getIcon(type)}
          </div>
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="notificationManager.remove('${id}')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    return notification;
  }

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  remove(id) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.notifications.delete(id);
      }, 300);
    }
  }

  clear() {
    this.notifications.forEach((notification, id) => {
      this.remove(id);
    });
  }
}

// Main application class
class SolarGroupApp {
  constructor() {
    this.stateManager = new StateManager();
    this.apiService = new ApiService();
    this.notificationManager = new NotificationManager();
    this.loadingSpinner = new LoadingSpinner();
    this.errorBoundary = new ErrorBoundary();
    this.formValidators = new Map();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFormValidation();
    this.setupTheme();
    this.setupCurrency();
    this.loadInitialData();
    this.setupPeriodicUpdates();
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Currency switcher
    const currencySelect = document.querySelector('#currency-select');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        this.changeCurrency(e.target.value);
      });
    }

    // Theme toggle
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Window resize handler
    window.addEventListener('resize', Utils.throttle(() => {
      this.handleResize();
    }, 250));

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseUpdates();
      } else {
        this.resumeUpdates();
      }
    });
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const validator = new FormValidator(form);
      this.formValidators.set(form, validator);
    });
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

  setupCurrency() {
    const savedCurrency = localStorage.getItem('currency') || 'USD';
    this.setCurrency(savedCurrency);
  }

  async loadInitialData() {
    try {
      this.loadingSpinner.showOverlay('Loading your data...');
      
      // Load user data
      const user = await this.loadUserData();
      if (user) {
        this.stateManager.setState({ user });
        
        // Load wallet and investments
        const [wallet, investments] = await Promise.all([
          this.apiService.getWallet(user.id),
          this.apiService.getInvestments(user.id)
        ]);
        
        this.stateManager.setState({ wallet, investments });
      }
      
      // Load projects
      const projects = await this.apiService.getProjects();
      this.stateManager.setState({ projects });
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.notificationManager.show('Failed to load data. Please refresh the page.', 'error');
    } finally {
      this.loadingSpinner.hideOverlay();
    }
  }

  setupPeriodicUpdates() {
    // Update wallet balance every 30 seconds
    this.walletUpdateInterval = setInterval(() => {
      this.updateWalletBalance();
    }, 30000);

    // Update notifications every minute
    this.notificationUpdateInterval = setInterval(() => {
      this.updateNotifications();
    }, 60000);
  }

  pauseUpdates() {
    if (this.walletUpdateInterval) {
      clearInterval(this.walletUpdateInterval);
    }
    if (this.notificationUpdateInterval) {
      clearInterval(this.notificationUpdateInterval);
    }
  }

  resumeUpdates() {
    this.setupPeriodicUpdates();
  }

  async loadUserData() {
    // In a real app, this would come from the API
    return {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null
    };
  }

  async updateWalletBalance() {
    try {
      const { user } = this.stateManager.getState();
      if (user) {
        const wallet = await this.apiService.getWallet(user.id);
        this.stateManager.setState({ wallet });
        this.updateWalletDisplay(wallet);
      }
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
    }
  }

  async updateNotifications() {
    try {
      // In a real app, this would fetch from the API
      const notifications = [];
      this.stateManager.setState({ notifications });
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  }

  updateWalletDisplay(wallet) {
    const balanceElements = document.querySelectorAll('.wallet-balance');
    balanceElements.forEach(element => {
      element.textContent = Utils.formatCurrency(wallet.balance, this.stateManager.getState().currency);
    });
  }

  toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.classList.toggle('mobile-open');
    }
  }

  changeCurrency(currency) {
    this.stateManager.setState({ currency });
    localStorage.setItem('currency', currency);
    this.updateCurrencyDisplay();
  }

  setCurrency(currency) {
    this.stateManager.setState({ currency });
    this.updateCurrencyDisplay();
  }

  updateCurrencyDisplay() {
    const { currency } = this.stateManager.getState();
    const currencyElements = document.querySelectorAll('.currency');
    currencyElements.forEach(element => {
      element.textContent = currency;
    });
  }

  toggleTheme() {
    const { theme } = this.stateManager.getState();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.stateManager.setState({ theme });
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }

  handleResize() {
    // Handle responsive behavior
    const nav = document.querySelector('.nav');
    if (nav && window.innerWidth >= 768) {
      nav.classList.remove('mobile-open');
    }
  }

  // Public methods for external use
  showNotification(message, type = 'info', duration = 5000) {
    return this.notificationManager.show(message, type, duration);
  }

  showLoading(container, text = 'Loading...') {
    this.loadingSpinner.show(container, { text });
  }

  hideLoading(container) {
    this.loadingSpinner.hide(container);
  }

  async invest(projectId, amount) {
    try {
      this.loadingSpinner.showOverlay('Processing investment...');
      
      const result = await this.apiService.invest(projectId, amount);
      
      this.notificationManager.show('Investment successful!', 'success');
      this.updateWalletBalance();
      
      return result;
    } catch (error) {
      this.notificationManager.show('Investment failed. Please try again.', 'error');
      throw error;
    } finally {
      this.loadingSpinner.hideOverlay();
    }
  }

  async deposit(amount, method) {
    try {
      const { user } = this.stateManager.getState();
      if (!user) {
        throw new Error('User not logged in');
      }

      this.loadingSpinner.showOverlay('Processing deposit...');
      
      const result = await this.apiService.deposit(user.id, amount, method);
      
      this.notificationManager.show('Deposit successful!', 'success');
      this.updateWalletBalance();
      
      return result;
    } catch (error) {
      this.notificationManager.show('Deposit failed. Please try again.', 'error');
      throw error;
    } finally {
      this.loadingSpinner.hideOverlay();
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.solarGroupApp = new SolarGroupApp();
  window.notificationManager = window.solarGroupApp.notificationManager;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SolarGroupApp,
    StateManager,
    ApiService,
    Utils,
    Animations,
    FormValidator,
    NotificationManager
  };
}