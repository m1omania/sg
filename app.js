// SolarGroup Coupons App JavaScript

// Application Data
const appData = {
  "activeCoupons": [
    {
      "id": 1,
      "name": "25$ за регистрацию",
      "project": "Общий",
      "projectColor": "#28a745",
      "bonus": "$25",
      "expiryDate": "2025-10-15",
      "daysLeft": 14,
      "conditions": "Минимальная сумма $250",
      "code": "WELCOME25-ABC123",
      "description": "Приветственный купон для новых пользователей",
      "status": "active",
      "minAmount": 250,
      "source": "manual"
    },
    {
      "id": 2,
      "name": "10% скидка Дирижабли",
      "project": "Дирижабли",
      "projectColor": "#007bff",
      "bonus": "10%",
      "expiryDate": "2025-11-15",
      "daysLeft": 45,
      "conditions": "Только для проекта Дирижабли",
      "code": "AIRSHIP10-XYZ789",
      "description": "Специальная скидка на инвестиции в проект Дирижабли",
      "status": "active",
      "minAmount": 500,
      "source": "email"
    },
    {
      "id": 3,
      "name": "Купон инвестора месяца",
      "project": "Совэлмаш",
      "projectColor": "#fd7e14",
      "bonus": "+50 долей",
      "expiryDate": "2025-10-05",
      "daysLeft": 4,
      "conditions": "от $1000",
      "code": "MONTH50-DEF456",
      "description": "Награда за активные инвестиции",
      "status": "expiring",
      "minAmount": 1000,
      "source": "manual"
    }
  ],
  "couponHistory": [
    {
      "id": 4,
      "name": "20$ за друга",
      "project": "Общий",
      "bonus": "$20",
      "status": "Использован",
      "date": "2025-09-15",
      "transactionId": "TXN-001234"
    },
    {
      "id": 5,
      "name": "5% летняя акция",
      "project": "Дирижабли",
      "bonus": "5%",
      "status": "Истёк",
      "date": "2025-08-31",
      "transactionId": null
    }
  ],
  "projects": [
    {"name": "Все проекты", "value": "all"},
    {"name": "Дирижабли", "value": "airships"},
    {"name": "Совэлмаш", "value": "sovelmash"}
  ],
  "user": {
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
});

function initializeApp() {
  // Initialize based on current page
  const currentPage = getCurrentPage();
  
  switch(currentPage) {
    case 'index.html':
      initializeCouponsPage();
      break;
    case 'wallet.html':
      initializeWalletPage();
      break;
    default:
      initializeCouponsPage();
  }
  
  // Common initialization
  setupEventListeners();
  setupModals();
}

function getCurrentPage() {
  const path = window.location.pathname;
  return path.split('/').pop();
}

function initializeCouponsPage() {
  renderActiveCoupons();
  renderCouponHistory();
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

function renderActiveCoupons() {
  if (!activeCouponsContainer) return;
  
  // Sort coupons by expiry date (closest first)
  const sortedCoupons = [...appData.activeCoupons].sort((a, b) => {
    return new Date(a.expiryDate) - new Date(b.expiryDate);
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
          <span class="coupon-project" style="background-color: ${coupon.projectColor}">${coupon.project}</span>
        </div>
        <div class="coupon-body">
          <div class="coupon-bonus">
            <span class="bonus-amount">${coupon.bonus}</span>
          </div>
          <p class="coupon-description">${coupon.description}</p>
          <div class="coupon-meta">
            <div class="coupon-conditions">${coupon.conditions}</div>
            <div class="coupon-expiry">До ${formatDate(coupon.expiryDate)} (${coupon.daysLeft} дн.)</div>
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

function renderWalletCoupons() {
  const walletCouponsContainer = document.getElementById('wallet-coupons');
  if (!walletCouponsContainer) return;
  
  // Sort coupons by expiry date (closest first)
  const sortedCoupons = [...appData.activeCoupons].sort((a, b) => {
    return new Date(a.expiryDate) - new Date(b.expiryDate);
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
        <div class="wallet-coupon-expiry">До ${formatDate(coupon.expiryDate)} (${coupon.daysLeft} дн.)</div>
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

function useCoupon(couponId) {
  // In a real app, this would redirect to the investment page with the coupon applied
  showNotification('Купон применён! Переход к инвестициям...');
  // For demo purposes, we'll just show a notification
  setTimeout(() => {
    // This would be the real redirect in a full implementation
    // window.location.href = 'invest.html?coupon=' + couponId;
  }, 1500);
}

function showCouponDetails(couponId) {
  const coupon = appData.activeCoupons.find(c => c.id == couponId);
  if (!coupon) return;
  
  if (couponDetailsModal) {
    document.getElementById('detail-coupon-name').textContent = coupon.name;
    document.getElementById('detail-coupon-project').textContent = coupon.project;
    document.getElementById('detail-coupon-project').style.backgroundColor = coupon.projectColor;
    document.getElementById('detail-coupon-bonus').textContent = coupon.bonus;
    document.getElementById('detail-coupon-expiry').textContent = formatDate(coupon.expiryDate);
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

function activatePromoCode(e) {
  e.preventDefault();
  const promoCodeInput = document.getElementById('promo-code');
  const code = promoCodeInput.value.trim();
  
  if (code) {
    // In a real app, this would call an API to validate and activate the promo code
    showNotification(`Промокод ${code} успешно активирован!`);
    closeModal();
    promoCodeInput.value = '';
    
    // For demo purposes, we'll just show a notification
    // In a real implementation, we would add the coupon to appData and re-render
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
