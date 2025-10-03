// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded, initializing...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('package') || 'sov-500';
    
    console.log('Package ID from URL:', packageId);
    
    initializeCheckoutPage(packageId);
});

function initializeCheckoutPage(packageId) {
    console.log('Initializing checkout page for package:', packageId);
    
    // Package configurations
    const packages = {
        'sov-500': {
            name: 'Пакет 500 $',
            stage: 20,
            shares: 15000,
            project: 'Совэлмаш',
            total: 50.00,
            description: '20 этап'
        },
        'sov-1000': {
            name: 'Пакет 1000 $',
            stage: 40,
            shares: 30000,
            project: 'Совэлмаш',
            total: 100.00,
            description: '40 этап'
        },
        'airship-250': {
            name: 'Пакет 250 $',
            stage: 10,
            shares: 7500,
            project: 'Дирижабли',
            total: 25.00,
            description: '10 этап'
        }
    };
    
    const package = packages[packageId] || packages['sov-500'];
    
    // Update page content
    document.title = package.name + ' - SolarGroup';
    
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = package.name;
    
    const packageStage = document.getElementById('package-stage');
    if (packageStage) packageStage.textContent = package.description;
    
    const summaryShares = document.getElementById('summary-shares');
    if (summaryShares) summaryShares.textContent = package.shares.toLocaleString();
    
    const summaryProject = document.getElementById('summary-project');
    if (summaryProject) summaryProject.textContent = package.project;
    
    const summaryTotal = document.getElementById('summary-total');
    if (summaryTotal) summaryTotal.textContent = package.total.toFixed(2) + ' $';
    
    // Load wallet balances
    loadCheckoutBalances();
    
    // Setup form handlers
    setupCheckoutForm(package);
    
    // Setup checkout button
    setupCheckoutButton(package);
}

async function loadCheckoutBalances() {
    try {
        console.log('Loading checkout balances...');
        const res = await fetch('/api/wallet/1');
        console.log('Checkout wallet response status:', res.status);
        if (!res.ok) {
            console.log('Checkout wallet response not ok:', res.status);
            return;
        }
        const wallet = await res.json();
        console.log('Checkout wallet data:', wallet);
        
        // Update balance displays
        const mainBalanceEl = document.querySelector('.main-balance-amount');
        const partnerBalanceEl = document.querySelector('.partner-balance-amount');
        
        if (mainBalanceEl) {
            mainBalanceEl.textContent = `${Number(wallet.main_balance).toFixed(2)} $`;
            console.log('Updated main balance in checkout');
        }
        
        if (partnerBalanceEl) {
            partnerBalanceEl.textContent = `${Number(wallet.partner_balance || 0).toFixed(2)} $`;
            console.log('Updated partner balance in checkout');
        }
        
        console.log('Checkout balances updated');
        
        // Update checkout button based on new balance
        const urlParams = new URLSearchParams(window.location.search);
        const packageId = urlParams.get('package') || 'sov-500';
        const packages = {
            'sov-500': { total: 50.00 },
            'sov-1000': { total: 100.00 },
            'airship-250': { total: 25.00 }
        };
        const package = packages[packageId] || packages['sov-500'];
        updateCheckoutButton(package);
    } catch (e) {
        console.error('Error loading checkout balances:', e);
    }
}

function setupCheckoutButton(package) {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;
    
    // Update button text and behavior based on balance
    updateCheckoutButton(package);
    
    checkoutBtn.addEventListener('click', async function() {
        // Check if button is in "insufficient funds" mode
        if (checkoutBtn.getAttribute('data-insufficient-funds') === 'true') {
            window.location.href = 'deposit.html';
            return;
        }
        
        const selectedAccount = document.querySelector('input[name="account"]:checked');
        const paymentType = document.querySelector('input[name="payment-type"]:checked')?.value;
        
        if (!selectedAccount) {
            showError('Выберите счет для оплаты');
            return;
        }
        
        console.log('Checkout button clicked:', {
            account: selectedAccount.value,
            paymentType: paymentType,
            package: package
        });
        
        // Check if user has sufficient funds
        const userBalance = parseFloat(document.querySelector('.main-balance-amount').textContent.replace('Баланс ', '').replace(' $', '').replace(',', '.'));
        const requiredAmount = package.total;
        
        if (userBalance < requiredAmount) {
            showError('Недостаточно средств для оплаты пакета');
            return;
        }
        
        // Show loading state
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = 'Обработка...';
        checkoutBtn.disabled = true;
        
        try {
            // Simulate investment processing
            const response = await fetch('/api/transactions/invest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 1,
                    packageId: package.name,
                    amount: package.total,
                    account: selectedAccount.value,
                    paymentType: paymentType || 'single'
                })
            });
            
            const result = await response.json();
            console.log('Investment result:', result);
            
            if (response.ok) {
                showSuccess('Пакет успешно оформлен! Переходим к инвестициям...');
                
                // Wait a bit for user to see success message
                setTimeout(() => {
                    window.location.href = 'my-investments.html';
                }, 2000);
            } else {
                showError(result.error || 'Ошибка оформления пакета');
            }
        } catch (error) {
            console.error('Investment error:', error);
            showError('Ошибка сети. Попробуйте позже.');
        } finally {
            // Restore button state
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    });
}

function updateCheckoutButton(package) {
    const checkoutBtn = document.getElementById('checkout-btn');
    const insufficientFundsWarning = document.getElementById('insufficient-funds');
    
    if (!checkoutBtn) return;
    
    // Check user balance
    const mainBalanceEl = document.querySelector('.main-balance-amount');
    const partnerBalanceEl = document.querySelector('.partner-balance-amount');
    
    // For demo purposes, always show "Оформить пакет" button
    // In real app, this would check actual balance
    checkoutBtn.textContent = 'Оформить пакет';
    checkoutBtn.classList.remove('btn--secondary');
    checkoutBtn.classList.add('btn--primary');
    checkoutBtn.removeAttribute('data-insufficient-funds');
    if (insufficientFundsWarning) {
        insufficientFundsWarning.style.display = 'none';
    }
}

function setupCheckoutForm(package) {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const selectedAccount = document.querySelector('input[name="account"]:checked');
        const couponCode = document.getElementById('coupon-code').value.trim();
        
        if (!selectedAccount) {
            alert('Выберите счет для оплаты');
            return;
        }
        
        console.log('Checkout form submitted:', {
            account: selectedAccount.value,
            couponCode: couponCode,
            package: package
        });
        
        // Simulate payment processing
        try {
            const response = await fetch('/api/transactions/invest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 1,
                    packageId: package.name,
                    amount: package.total,
                    account: selectedAccount.value,
                    couponCode: couponCode || null
                })
            });
            
            const result = await response.json();
            console.log('Investment result:', result);
            
            if (response.ok) {
                showSuccess('Инвестиция успешно оформлена!');
                // Reload balances
                await loadCheckoutBalances();
            } else {
                showError(result.error || 'Ошибка оформления инвестиции');
            }
        } catch (error) {
            console.error('Investment error:', error);
            showError('Ошибка сети. Попробуйте позже.');
        }
    });
}

function showSuccess(message) {
    const notification = document.getElementById('success-notification');
    if (notification) {
        const notificationText = notification.querySelector('#notification-text');
        if (notificationText) {
            notificationText.textContent = message;
        }
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
}

function showError(message) {
    // Create error notification if it doesn't exist
    let notification = document.getElementById('error-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'error-notification';
        notification.className = 'notification hidden';
        notification.innerHTML = `
            <div class="notification-content">
                <span id="error-notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        document.querySelector('.main-content').appendChild(notification);
        
        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.add('hidden');
        });
    }
    
    const notificationText = notification.querySelector('#error-notification-text');
    if (notificationText) {
        notificationText.textContent = message;
    }
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}
