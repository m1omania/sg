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
    } catch (e) {
        console.error('Error loading checkout balances:', e);
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
        notification.querySelector('.notification-message').textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
}

function showError(message) {
    const notification = document.getElementById('error-notification');
    if (notification) {
        notification.querySelector('.notification-message').textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
}
