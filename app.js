// SolarGroup Coupons App JavaScript

// API Base URL - в production будет указывать на сервер
const API_BASE_URL = '/api';

// Application Data
let appData = {
  "activeCoupons": [],
  "couponHistory": [],
  "projects": [
    {"name": "Все проекты", "value": "all"},
    {"name": "Дирижабли", "value": "airships"},
    {"name": "Совэлмаш", "value": "sovelmash"}
  ],
  "user": {
    "id": 1, // В демо режиме используем ID 1
    "name": "Константин",
    "walletBalance": {
      "main": "0,00",
      "partner": "0,00"
    }
  }
};

// Global state
let currentFilter = 'all';
let currentSearch = '';
let selectedCoupon = null;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const searchInput = document.querySelector('.search-input');
const projectFilter = document.querySelector('.project-filter');
const activeCouponsContainer = document.getElementById('active-coupons');
const historyTbody = document.getElementById('history-tbody');
const activatePromoBtn = document.querySelector('.activate-promo-btn');

// Modals
const couponDetailsModal = document.getElementById('coupon-details-modal');
const activatePromoModal = document.getElementById('activate-promo-modal');
const purchaseModal = document.getElementById('purchase-modal');
const successNotification = document.getElementById('success-notification');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  
  // Check if user is on login or registration page
  const currentPage = getCurrentPage();
  if (currentPage === 'login.html' || currentPage === 'register.html') {
    // Check for successful login/registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
      redirectToDashboard();
    }
  }
});

/**
 * Redirects user to dashboard with smooth transition
 */
function redirectToDashboard() {
  // Add loading state
  document.body.classList.add('loading');
  
  // Show a brief loading indicator before redirect
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 1500);
}

function initializeApp() {
  // Initialize based on current page
  const currentPage = getCurrentPage();
  
  switch(currentPage) {
    case 'coupons.html':
      initializeCouponsPage();
      break;
    case 'wallet.html':
      initializeWalletPage();
      break;
    default:
      // For other pages, don't initialize coupons
      break;
  }
  
  // Common initialization
  setupEventListeners();
  setupModals();
  setupUserMenu();
}

function getCurrentPage() {
  const path = window.location.pathname;
  return path.split('/').pop();
}

function initializeCouponsPage() {
  loadActiveCoupons();
  loadCouponHistory();
}

function initializeWalletPage() {
  renderWalletCoupons();
}

function setupEventListeners() {
  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
    });
  });

  // Search and filter
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  if (projectFilter) {
    projectFilter.addEventListener('change', handleFilter);
  }

  // Activate promo button
  if (activatePromoBtn) {
    activatePromoBtn.addEventListener('click', openActivatePromoModal);
  }
}

function setupModals() {
  // Close modals
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });

  // Close when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e);
    }
  });

  // Promo activation form
  const promoForm = document.querySelector('.promo-activation-form');
  if (promoForm) {
    promoForm.addEventListener('submit', activatePromoCode);
  }
}

function setupUserMenu() {
    const userDropdown = document.getElementById('userDropdown');
    if (!userDropdown) return; // Exit if menu not on page

    const logoutBtn = document.getElementById('logoutBtn');

    userDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function() {
        if (userDropdown.classList.contains('active')) {
            userDropdown.classList.remove('active');
        }
    });

    const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout button clicked. Redirecting to landing.html ...');
            // Future logic like clearing tokens can go here
            // Clear any session data if needed
            sessionStorage.clear();
            localStorage.removeItem('authToken');
            window.location.href = '/landing.html';
        });
    }
}

// Загрузка активных купонов с сервера
async function loadActiveCoupons() {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/active`);
    if (response.ok) {
      appData.activeCoupons = await response.json();
      renderActiveCoupons();
    } else {
      console.error('Failed to load active coupons');
    }
  } catch (error) {
    console.error('Error loading active coupons:', error);
    // В случае ошибки используем тестовые данные
    renderActiveCoupons();
  }
}

// Загрузка истории купонов с сервера
async function loadCouponHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/history`);
    if (response.ok) {
      appData.couponHistory = await response.json();
      renderCouponHistory();
    } else {
      console.error('Failed to load coupon history');
    }
  } catch (error) {
    console.error('Error loading coupon history:', error);
    // В случае ошибки используем тестовые данные
    renderCouponHistory();
  }
}

function renderActiveCoupons() {
  if (!activeCouponsContainer) return;
  
  // Sort coupons by expiry date (closest first)
  const sortedCoupons = [...appData.activeCoupons].sort((a, b) => {
    return new Date(a.expiry_date) - new Date(b.expiry_date);
  });
  
  // Filter coupons
  const filteredCoupons = sortedCoupons.filter(coupon => {
    const matchesSearch = coupon.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                          coupon.code.toLowerCase().includes(currentSearch.toLowerCase());
    const matchesFilter = currentFilter === 'all' || 
                          coupon.project.toLowerCase().includes(currentFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });
  
  if (filteredCoupons.length === 0) {
    activeCouponsContainer.innerHTML = `
      <div class="no-coupons-message">
        <p>Активные купоны не найдены</p>
        <button class="btn btn--primary activate-promo-btn">Активировать промокод</button>
      </div>
    `;
    return;
  }
  
  activeCouponsContainer.innerHTML = filteredCoupons.map(coupon => {
    const isExpiring = coupon.status === 'expiring';
    return `
      <div class="coupon-card ${isExpiring ? 'expiring' : ''}" data-coupon-id="${coupon.id}">
        ${isExpiring ? '<div class="expiring-banner">Истекает скоро!</div>' : ''}
        <div class="coupon-header">
          <h3 class="coupon-name">${coupon.name}</h3>
          <span class="coupon-project" style="background-color: ${coupon.project_color}">${coupon.project}</span>
        </div>
        <div class="coupon-body">
          <div class="coupon-bonus">
            <span class="bonus-amount">${coupon.bonus}</span>
          </div>
          <p class="coupon-description">${coupon.description}</p>
          <div class="coupon-meta">
            <div class="coupon-conditions">${coupon.conditions}</div>
            <div class="coupon-expiry">До ${formatDate(coupon.expiry_date)} (${coupon.days_left} дн.)</div>
          </div>
        </div>
        <div class="coupon-footer">
          <div class="coupon-source">
            ${getSourceBadge(coupon.source)}
          </div>
          <div class="coupon-actions">
            <button class="btn btn--secondary btn--small copy-code-btn" data-code="${coupon.code}">Копировать код</button>
            <button class="btn btn--primary btn--small use-coupon-btn" data-coupon-id="${coupon.id}">Использовать</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners to new elements
  attachCouponEventListeners();
}

function renderCouponHistory() {
  if (!historyTbody) return;
  
  historyTbody.innerHTML = appData.couponHistory.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.project}</td>
      <td>${item.bonus}</td>
      <td>${item.coupon_status === 'used' ? 'Использован' : 'Истёк'}</td>
      <td>${formatDate(item.created_at)}</td>
      <td>${item.transaction_id || '-'}</td>
    </tr>
  `).join('');
}

function renderWalletCoupons() {
  const walletCouponsContainer = document.getElementById('wallet-coupons');
  if (!walletCouponsContainer) return;
  
  // Sort coupons by expiry date (closest first)
  const sortedCoupons = [...appData.activeCoupons].sort((a, b) => {
    return new Date(a.expiry_date) - new Date(b.expiry_date);
  });
  
  // Show only the first 3 coupons in the wallet widget
  const widgetCoupons = sortedCoupons.slice(0, 3);
  
  if (widgetCoupons.length === 0) {
    // Already has the "no coupons" message in HTML
    return;
  }
  
  // Remove the "no coupons" message
  walletCouponsContainer.innerHTML = '';
  
  widgetCoupons.forEach(coupon => {
    const couponElement = document.createElement('div');
    couponElement.className = 'wallet-coupon-card';
    couponElement.innerHTML = `
      <div class="wallet-coupon-header">
        <h4 class="wallet-coupon-name">${coupon.name}</h4>
        <span class="wallet-coupon-bonus">${coupon.bonus}</span>
      </div>
      <div class="wallet-coupon-meta">
        <div class="wallet-coupon-expiry">До ${formatDate(coupon.expiry_date)} (${coupon.days_left} дн.)</div>
        <div class="wallet-coupon-conditions">${coupon.conditions}</div>
      </div>
      <div class="wallet-coupon-footer">
        <button class="btn btn--primary btn--small use-coupon-btn" data-coupon-id="${coupon.id}">Использовать</button>
        <button class="btn btn--secondary btn--small details-btn" data-coupon-id="${coupon.id}">Подробнее</button>
      </div>
    `;
    walletCouponsContainer.appendChild(couponElement);
  });
  
  // Add event listeners
  walletCouponsContainer.querySelectorAll('.use-coupon-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const couponId = e.target.dataset.couponId;
      useCoupon(couponId);
    });
  });
  
  walletCouponsContainer.querySelectorAll('.details-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const couponId = e.target.dataset.couponId;
      showCouponDetails(couponId);
    });
  });
}

function getSourceBadge(source) {
  const sourceMap = {
    'manual': 'Введён вручную',
    'email': 'Получен по email'
  };
  
  return `<span class="source-badge source-${source}">${sourceMap[source] || source}</span>`;
}

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', options);
}

function attachCouponEventListeners() {
  // Copy code buttons
  document.querySelectorAll('.copy-code-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const code = e.target.dataset.code;
      copyToClipboard(code);
      showNotification('Код скопирован в буфер обмена!');
    });
  });
  
  // Use coupon buttons
  document.querySelectorAll('.use-coupon-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const couponId = e.target.dataset.couponId;
      useCoupon(couponId);
    });
  });
}

async function useCoupon(couponId) {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        couponId: couponId,
        userId: appData.user.id
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      showNotification(`Купон применён! ID операции: ${result.transactionId}`);
      
      // Перезагружаем купоны
      loadActiveCoupons();
      
      // Для демонстрации, имитируем переход к инвестициям
      setTimeout(() => {
        window.location.href = 'invest.html';
      }, 1500);
    } else {
      showNotification('Ошибка при использовании купона');
    }
  } catch (error) {
    console.error('Error using coupon:', error);
    showNotification('Ошибка при использовании купона');
  }
}

function showCouponDetails(couponId) {
  const coupon = appData.activeCoupons.find(c => c.id == couponId);
  if (!coupon) return;
  
  if (couponDetailsModal) {
    document.getElementById('detail-coupon-name').textContent = coupon.name;
    document.getElementById('detail-coupon-project').textContent = coupon.project;
    document.getElementById('detail-coupon-project').style.backgroundColor = coupon.project_color;
    document.getElementById('detail-coupon-bonus').textContent = coupon.bonus;
    document.getElementById('detail-coupon-expiry').textContent = formatDate(coupon.expiry_date);
    document.getElementById('detail-coupon-conditions').textContent = coupon.conditions;
    document.getElementById('detail-coupon-code').textContent = coupon.code;
    
    couponDetailsModal.style.display = 'block';
    
    // Add event listeners for actions in modal
    const useButton = couponDetailsModal.querySelector('.use-coupon-btn');
    const copyButton = couponDetailsModal.querySelector('.copy-code-btn');
    
    if (useButton) {
      useButton.onclick = () => useCoupon(couponId);
    }
    
    if (copyButton) {
      copyButton.onclick = () => {
        copyToClipboard(coupon.code);
        showNotification('Код скопирован в буфер обмена!');
      };
    }
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

function showNotification(message) {
  if (successNotification) {
    const messageElement = successNotification.querySelector('.notification-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    successNotification.style.display = 'block';
    
    setTimeout(() => {
      successNotification.style.display = 'none';
    }, 3000);
  }
}

function openActivatePromoModal() {
  if (activatePromoModal) {
    activatePromoModal.style.display = 'block';
  }
}

function closeModal(e) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

async function activatePromoCode(e) {
  e.preventDefault();
  const promoCodeInput = document.getElementById('promo-code-input');
  const code = promoCodeInput.value.trim();
  
  if (code) {
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          userId: appData.user.id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        showNotification(`Промокод ${code} успешно активирован!`);
        closeModal();
        promoCodeInput.value = '';
        
        // Перезагружаем купоны
        loadActiveCoupons();
      } else {
        showNotification('Неверный промокод');
      }
    } catch (error) {
      console.error('Error activating promo code:', error);
      showNotification('Ошибка при активации промокода');
    }
  }
}

// Tab switching
function switchTab(tabId) {
  // Update active tab button
  tabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });
  
  // Show active tab content
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabId}-tab`);
  });
}

// Search and filter handlers
function handleSearch(e) {
  currentSearch = e.target.value;
  renderActiveCoupons();
}

function handleFilter(e) {
  currentFilter = e.target.value;
  renderActiveCoupons();
}