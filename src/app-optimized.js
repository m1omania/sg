/**
 * SolarGroup Investment Platform - Optimized JavaScript
 * Modern ES6+ with performance optimizations and PWA features
 */

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  });
}

// Performance Monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
  }

  startTiming(name) {
    this.metrics.set(name, performance.now());
  }

  endTiming(name) {
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  }

  observeElement(element, callback) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(callback, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      });
      observer.observe(element);
      this.observers.set(element, observer);
    }
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

const perfMonitor = new PerformanceMonitor();

// Utility Functions
const utils = {
  // Debounce function for performance
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Format currency with proper localization
  formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // Format date with proper localization
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
  },

  // Safe JSON parse with fallback
  safeJsonParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.warn('JSON parse error:', e);
      return fallback;
    }
  },

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Smooth scroll to element
  smoothScrollTo(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// API Client with caching and error handling
class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  clearCache() {
    this.cache.clear();
  }
}

const api = new ApiClient();

// State Management
class StateManager {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
  }

  set(key, value) {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    this.notify(key, value, oldValue);
  }

  get(key) {
    return this.state.get(key);
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
  }

  unsubscribe(key, callback) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).delete(callback);
    }
  }

  notify(key, newValue, oldValue) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        callback(newValue, oldValue);
      });
    }
  }
}

const state = new StateManager();

// Timer Management
class TimerManager {
  constructor() {
    this.timers = new Map();
  }

  createTimer(element, endTime, options = {}) {
    const timerId = utils.generateId();
    const timer = {
      element,
      endTime: new Date(endTime).getTime(),
      options: {
        updateInterval: 1000,
        onComplete: () => {},
        ...options
      },
      intervalId: null
    };

    this.timers.set(timerId, timer);
    this.startTimer(timerId);
    return timerId;
  }

  startTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (!timer) return;

    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = timer.endTime - now;

      if (timeLeft <= 0) {
        this.stopTimer(timerId);
        timer.options.onComplete();
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      if (timer.element) {
        timer.element.innerHTML = `
          <div class="timer-display">
            ${days > 0 ? `<span class="timer-unit">${days}d</span>` : ''}
            <span class="timer-unit">${hours.toString().padStart(2, '0')}h</span>
            <span class="timer-unit">${minutes.toString().padStart(2, '0')}m</span>
            <span class="timer-unit">${seconds.toString().padStart(2, '0')}s</span>
          </div>
        `;
      }
    };

    updateTimer();
    timer.intervalId = setInterval(updateTimer, timer.options.updateInterval);
  }

  stopTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (timer && timer.intervalId) {
      clearInterval(timer.intervalId);
      timer.intervalId = null;
    }
  }

  destroyTimer(timerId) {
    this.stopTimer(timerId);
    this.timers.delete(timerId);
  }

  destroyAll() {
    this.timers.forEach((_, timerId) => this.destroyTimer(timerId));
  }
}

const timerManager = new TimerManager();

// Wallet Management
class WalletManager {
  constructor() {
    this.balances = {
      main: 0,
      bonus: 0,
      partner: 0
    };
    this.currencies = ['USD', 'EUR', 'GBP', 'RUB'];
    this.currentCurrency = 'USD';
    this.exchangeRates = {};
  }

  async loadBalances(userId) {
    try {
      perfMonitor.startTiming('loadBalances');
      const data = await api.get(`/wallet/${userId}`);
      
      this.balances = {
        main: data.main_balance || 0,
        bonus: data.bonus_balance || 0,
        partner: data.partner_balance || 0
      };
      
      this.updateBalanceDisplay();
      perfMonitor.endTiming('loadBalances');
    } catch (error) {
      console.error('Failed to load wallet balances:', error);
      this.showError('Failed to load wallet data');
    }
  }

  async loadExchangeRates() {
    try {
      // In a real app, this would fetch from an exchange rate API
      this.exchangeRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        RUB: 75.5
      };
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
    }
  }

  convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = this.exchangeRates[fromCurrency] || 1;
    const toRate = this.exchangeRates[toCurrency] || 1;
    
    return (amount / fromRate) * toRate;
  }

  switchCurrency(currency) {
    if (this.currencies.includes(currency)) {
      this.currentCurrency = currency;
      this.updateBalanceDisplay();
      this.updateCurrencySelector();
    }
  }

  updateBalanceDisplay() {
    const mainElement = document.getElementById('mainBalance');
    const bonusElement = document.getElementById('bonusBalance');
    const partnerElement = document.getElementById('partnerBalance');
    const totalElement = document.getElementById('totalBalance');

    if (mainElement) {
      const convertedMain = this.convertCurrency(this.balances.main, 'USD', this.currentCurrency);
      mainElement.textContent = utils.formatCurrency(convertedMain, this.currentCurrency);
    }

    if (bonusElement) {
      const convertedBonus = this.convertCurrency(this.balances.bonus, 'USD', this.currentCurrency);
      bonusElement.textContent = utils.formatCurrency(convertedBonus, this.currentCurrency);
    }

    if (partnerElement) {
      const convertedPartner = this.convertCurrency(this.balances.partner, 'USD', this.currentCurrency);
      partnerElement.textContent = utils.formatCurrency(convertedPartner, this.currentCurrency);
    }

    if (totalElement) {
      const total = this.balances.main + this.balances.bonus + this.balances.partner;
      const convertedTotal = this.convertCurrency(total, 'USD', this.currentCurrency);
      totalElement.textContent = utils.formatCurrency(convertedTotal, this.currentCurrency);
    }
  }

  updateCurrencySelector() {
    const selector = document.getElementById('currencySelector');
    if (selector) {
      selector.value = this.currentCurrency;
    }
  }

  showError(message) {
    // Create or update error notification
    let errorElement = document.getElementById('walletError');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'walletError';
      errorElement.className = 'error-notification';
      document.body.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

const walletManager = new WalletManager();

// Lazy Loading for Images
class LazyLoader {
  constructor() {
    this.imageObserver = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            this.imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
    }
  }

  observe(img) {
    if (this.imageObserver) {
      this.imageObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    }
  }

  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
  }
}

const lazyLoader = new LazyLoader();

// Initialize Application
class App {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    perfMonitor.startTiming('appInit');
    
    try {
      await this.setupEventListeners();
      await this.initializeComponents();
      await this.loadInitialData();
      
      this.isInitialized = true;
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    } finally {
      perfMonitor.endTiming('appInit');
    }
  }

  async setupEventListeners() {
    // Currency selector
    const currencySelector = document.getElementById('currencySelector');
    if (currencySelector) {
      currencySelector.addEventListener('change', (e) => {
        walletManager.switchCurrency(e.target.value);
      });
    }

    // Lazy load images
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => lazyLoader.observe(img));

    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          utils.smoothScrollTo(targetElement, 80);
        }
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      this.showNotification('Connection restored', 'success');
      api.clearCache(); // Clear cache when back online
    });

    window.addEventListener('offline', () => {
      this.showNotification('You are offline', 'warning');
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, pause timers
        timerManager.timers.forEach(timer => {
          if (timer.intervalId) {
            clearInterval(timer.intervalId);
            timer.intervalId = null;
          }
        });
      } else {
        // Page is visible, resume timers
        timerManager.timers.forEach((timer, timerId) => {
          if (!timer.intervalId) {
            timerManager.startTimer(timerId);
          }
        });
      }
    });
  }

  async initializeComponents() {
    // Initialize timers
    const timerElements = document.querySelectorAll('[data-timer-end]');
    timerElements.forEach(element => {
      const endTime = element.dataset.timerEnd;
      timerManager.createTimer(element, endTime, {
        onComplete: () => {
          element.innerHTML = '<span class="timer-expired">Expired</span>';
        }
      });
    });

    // Initialize wallet if user is logged in
    const userId = this.getCurrentUserId();
    if (userId) {
      await walletManager.loadBalances(userId);
      await walletManager.loadExchangeRates();
    }
  }

  async loadInitialData() {
    // Load any initial data needed for the page
    const userId = this.getCurrentUserId();
    if (userId) {
      // Load user-specific data
      state.set('userId', userId);
    }
  }

  getCurrentUserId() {
    // Get user ID from localStorage or session
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Cleanup method
  destroy() {
    timerManager.destroyAll();
    lazyLoader.destroy();
    perfMonitor.disconnect();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    App,
    ApiClient,
    StateManager,
    TimerManager,
    WalletManager,
    LazyLoader,
    PerformanceMonitor,
    utils
  };
}
