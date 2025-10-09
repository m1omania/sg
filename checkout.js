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
    
    // Initialize coupon package component
    initializeCouponPackage(package);
    
    // Setup form handlers
    setupCheckoutForm(package);
    
    // Setup checkout button
    setupCheckoutButton(package);
    
    // Update package summary if CheckoutCoupons is available
    if (window.checkoutCoupons) {
        window.checkoutCoupons.updatePackageSummary();
    }
}

async function loadCheckoutBalances() {
    try {
        console.log('Loading checkout balances...');
        
        // Load real wallet data from API
        const response = await fetch('/api/wallet/1');
        const walletData = await response.json();
        
        console.log('Loaded wallet data for checkout:', walletData);
        
        // Update balance displays
        const mainBalanceEl = document.querySelector('.main-balance-amount');
        const partnerBalanceEl = document.querySelector('.partner-balance-amount');
        
        if (mainBalanceEl) {
            mainBalanceEl.textContent = `${Number(walletData.main_balance).toFixed(2)} $`;
            console.log('Updated main balance in checkout');
        }
        
        if (partnerBalanceEl) {
            partnerBalanceEl.textContent = `${Number(walletData.partner_balance).toFixed(2)} $`;
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
        
        // Calculate total with coupons applied
        const totalElement = document.getElementById('total-amount');
        const requiredAmount = parseFloat(totalElement.textContent.replace('$', '').replace(',', '.'));
        
        if (userBalance < requiredAmount) {
            showError('Недостаточно средств для оплаты пакета');
            return;
        }
        
        // Show loading state
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = 'Обработка...';
        checkoutBtn.disabled = true;
        
        try {
            // Use active coupons before processing investment
            await useActiveCoupons();
            
            // Simulate investment processing
            const response = await fetch('/api/transactions/invest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 1,
                    packageId: package.name,
                    amount: requiredAmount, // Use calculated amount with coupons
                    account: selectedAccount.value,
                    paymentType: paymentType || 'single'
                })
            });
            
            const result = await response.json();
            console.log('Investment result:', result);
            
            if (response.ok) {
                showSuccess('Пакет успешно оформлен! Переходим к инвестициям...');
                
                // Update coupons list to reflect used status
                await updateCouponsList();
                
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
    
    // Get current balances
    const mainBalanceEl = document.querySelector('.main-balance-amount');
    const partnerBalanceEl = document.querySelector('.partner-balance-amount');
    
    if (!mainBalanceEl) {
        console.warn('Main balance element not found');
        return;
    }
    
    // Calculate total with coupons applied
    const totalElement = document.getElementById('total-amount');
    const requiredAmount = parseFloat(totalElement.textContent.replace('$', '').replace(',', '.'));
    
    // Get main balance
    const mainBalance = parseFloat(mainBalanceEl.textContent.replace('Баланс ', '').replace(' $', '').replace(',', '.'));
    
    console.log('Balance check:', {
        mainBalance,
        requiredAmount,
        hasEnoughFunds: mainBalance >= requiredAmount
    });
    
    if (mainBalance < requiredAmount) {
        // Insufficient funds - show "Пополнить баланс" button
        checkoutBtn.textContent = 'Пополнить баланс';
        checkoutBtn.classList.remove('btn--primary');
        checkoutBtn.classList.add('btn--secondary');
        checkoutBtn.setAttribute('data-insufficient-funds', 'true');
        
        if (insufficientFundsWarning) {
            const shortage = requiredAmount - mainBalance;
            insufficientFundsWarning.style.display = 'block';
            insufficientFundsWarning.textContent = `Недостаточно средств. Не хватает: $${shortage.toFixed(2)}`;
        }
    } else {
        // Sufficient funds - show "Оформить пакет" button
        checkoutBtn.textContent = 'Оформить пакет';
        checkoutBtn.classList.remove('btn--secondary');
        checkoutBtn.classList.add('btn--primary');
        checkoutBtn.removeAttribute('data-insufficient-funds');
        
        if (insufficientFundsWarning) {
            insufficientFundsWarning.style.display = 'none';
        }
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

// Initialize coupon package component
async function initializeCouponPackage(package) {
    console.log('Initializing coupon package component...');
    
    const couponsListElement = document.getElementById('coupons-list');
    if (!couponsListElement) {
        console.warn('Coupons list element not found');
        return;
    }
    
    try {
        // Check if there's a selected coupon from sessionStorage
        const selectedCoupon = sessionStorage.getItem('selectedCoupon');
        if (selectedCoupon) {
            console.log('Selected coupon found in sessionStorage:', selectedCoupon);
            const coupon = JSON.parse(selectedCoupon);
            
            // Check if the selected coupon is relevant to this project
            if (coupon.project_name === package.project || coupon.project_name === 'Все проекты') {
                console.log('Selected coupon is relevant, rendering it');
                renderCouponsList([coupon]);
                
                // Clear sessionStorage after using
                sessionStorage.removeItem('selectedCoupon');
                return;
            } else {
                console.log('Selected coupon is not relevant to this project');
                // Clear sessionStorage if coupon is not relevant
                sessionStorage.removeItem('selectedCoupon');
            }
        }
        
        // Load available coupons for this project
        const response = await fetch('/api/coupons/active/1');
        const result = await response.json();
        
        // Handle both direct array and object with data property
        const coupons = Array.isArray(result) ? result : (result.data || []);
        
        console.log('Available coupons:', coupons);
        console.log('Current package project:', package.project);
        
        // Filter coupons for this project or general coupons and sort by expiry date
        const relevantCoupons = coupons
            .filter(coupon => {
                const isRelevant = coupon.project_name === package.project || 
                                 coupon.project_name === 'Все проекты';
                console.log(`Coupon ${coupon.name} (${coupon.project_name}) is relevant:`, isRelevant);
                return isRelevant;
            })
            .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
        
        console.log('Relevant coupons for', package.project, ':', relevantCoupons);
        
        if (relevantCoupons.length > 0) {
            // Render all relevant coupons
            renderCouponsList(relevantCoupons);
            console.log('Coupons rendered:', relevantCoupons.length);
        } else {
            console.log('No relevant coupons found for project:', package.project);
            // Hide coupon section if no coupons available
            const couponSection = document.querySelector('.coupon-section');
            if (couponSection) {
                couponSection.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error loading coupons:', error);
        // Hide coupon section on error
        const couponSection = document.querySelector('.coupon-section');
        if (couponSection) {
            couponSection.style.display = 'none';
        }
    }
}

// Render coupons list using coupon-package Web Components
function renderCouponsList(coupons) {
    const couponsList = document.getElementById('coupons-list');
    if (!couponsList) return;
    
    couponsList.innerHTML = coupons.map(coupon => `
        <coupon-package 
            coupon-data='${JSON.stringify(coupon)}'
            data-coupon-id="${coupon.id}">
        </coupon-package>
    `).join('');
    
    // Auto-enable coupons with auto_enabled: true
    couponsList.querySelectorAll('coupon-package').forEach((component, index) => {
        const coupon = coupons[index];
        if (coupon.auto_enabled) {
            console.log('Auto-enabling coupon:', coupon.name);
            component.setActive(true);
            component.setAttribute('data-active', 'true');
        }
    });
    
    // Update total after auto-enabling coupons
    updateTotalWithCoupons();
    
    // Add event listeners for coupon package components
    couponsList.querySelectorAll('coupon-package').forEach(component => {
        component.addEventListener('coupon-toggle', function(e) {
            const couponId = e.detail.coupon.id;
            const isActive = e.detail.active;
            console.log('Coupon toggle changed:', couponId, isActive);
            
            // If this coupon is being activated, deactivate all others
            if (isActive) {
                couponsList.querySelectorAll('coupon-package').forEach(otherComponent => {
                    if (otherComponent !== this) {
                        otherComponent.setActive(false);
                        otherComponent.setAttribute('data-active', 'false');
                    }
                });
            }
            
            // Update component's active state
            this.setAttribute('data-active', isActive);
            
            // Update total calculation
            updateTotalWithCoupons();
        });
    });
}

// Update coupons list after usage
async function updateCouponsList() {
    try {
        // Reload active coupons to reflect used status
        const response = await fetch('/api/coupons/active/1');
        const result = await response.json();
        const coupons = Array.isArray(result) ? result : (result.data || []);
        
        // Re-render coupons list
        const couponsList = document.getElementById('coupons-list');
        if (couponsList) {
            const currentPackage = window.currentPackage;
            if (currentPackage) {
                const relevantCoupons = coupons
                    .filter(coupon => 
                        coupon.project_name === currentPackage.project || 
                        coupon.project_name === 'Все проекты'
                    )
                    .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
                
                renderCouponsList(relevantCoupons);
                
                // Ensure only one coupon can be active at a time
                const couponsList = document.getElementById('coupons-list');
                if (couponsList) {
                    couponsList.querySelectorAll('coupon-package').forEach(component => {
                        component.addEventListener('coupon-toggle', function(e) {
                            const couponId = e.detail.coupon.id;
                            const isActive = e.detail.active;
                            console.log('Coupon toggle changed:', couponId, isActive);
                            
                            // If this coupon is being activated, deactivate all others
                            if (isActive) {
                                couponsList.querySelectorAll('coupon-package').forEach(otherComponent => {
                                    if (otherComponent !== this) {
                                        otherComponent.setActive(false);
                                        otherComponent.setAttribute('data-active', 'false');
                                    }
                                });
                            }
                            
                            // Update component's active state
                            this.setAttribute('data-active', isActive);
                            
                            // Update total calculation
                            updateTotalWithCoupons();
                        });
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error updating coupons list:', error);
    }
}

// Use active coupons (mark them as used)
async function useActiveCoupons() {
    const activeCoupons = document.querySelectorAll('coupon-package[data-active="true"]');
    
    for (const component of activeCoupons) {
        const couponData = JSON.parse(component.getAttribute('coupon-data'));
        
        try {
            const response = await fetch('/api/coupons/use', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    couponId: couponData.id,
                    userId: 1
                })
            });
            
            if (response.ok) {
                console.log('✅ Coupon used successfully:', couponData.name);
            } else {
                console.error('❌ Failed to use coupon:', couponData.name);
            }
        } catch (error) {
            console.error('❌ Error using coupon:', error);
        }
    }
}

// Update total with applied coupons
function updateTotalWithCoupons() {
    const activeCoupons = document.querySelectorAll('coupon-package[data-active="true"]');
    let totalDiscount = 0;
    
    activeCoupons.forEach(component => {
        const couponData = JSON.parse(component.getAttribute('coupon-data'));
        const discountValue = couponData.discount_amount || 0;
        totalDiscount += discountValue;
    });
    
    console.log('Total discount from coupons:', totalDiscount);
    
    // Update UI with discount
    const packagePrice = 500; // Base package price
    const finalTotal = packagePrice - totalDiscount;
    
    const discountLine = document.getElementById('discount-line');
    const discountAmount = document.getElementById('discount-amount');
    const totalAmount = document.getElementById('total-amount');
    
    if (totalDiscount > 0) {
        if (discountLine) discountLine.style.display = 'flex';
        if (discountAmount) discountAmount.textContent = `-$${totalDiscount.toFixed(2)}`;
        if (totalAmount) totalAmount.textContent = `$${finalTotal.toFixed(2)}`;
    } else {
        if (discountLine) discountLine.style.display = 'none';
        if (totalAmount) totalAmount.textContent = `$${packagePrice.toFixed(2)}`;
    }
    
    // Update checkout button based on new total
    const currentPackage = window.currentPackage;
    if (currentPackage) {
        updateCheckoutButton(currentPackage);
    }
}

// Add page visibility listener to refresh coupons when user returns to the page
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Page became visible, refreshing coupons...');
        // Small delay to ensure any pending operations complete
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const packageId = urlParams.get('package') || 'sov-500';
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
            initializeCouponPackage(package);
        }, 100);
    }
});

// Also listen for window focus to catch cases where visibilitychange might not fire
window.addEventListener('focus', function() {
    console.log('Window focused, refreshing coupons...');
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const packageId = urlParams.get('package') || 'sov-500';
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
        initializeCouponPackage(package);
    }, 100);
});
