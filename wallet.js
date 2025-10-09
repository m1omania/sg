// Wallet page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wallet page loaded, initializing...');
    
    const userId = 1; // demo user
    const mainAccountCard = document.querySelector('account-card[type="main"]');
    const partnerAccountCard = document.querySelector('account-card[type="partner"]');
    
    console.log('Account card components found:', {
        mainAccountCard: !!mainAccountCard,
        partnerAccountCard: !!partnerAccountCard
    });

    // Показ уведомления о купоне за регистрацию
    function showRegistrationCouponNotification() {
        // Проверяем, показывали ли уже уведомление
        if (localStorage.getItem('registrationCouponShown') === 'true') {
            return;
        }
        
        const notificationSystem = document.querySelector('notification-system');
        if (notificationSystem) {
            notificationSystem.addNotification({
                title: 'У вас есть новый купон!',
                message: 'Вам доступен купон на $25 за регистрацию',
                action_url: '/coupons.html'
            });
            
            // Помечаем, что уведомление показано
            localStorage.setItem('registrationCouponShown', 'true');
        }
    }

    // Load balances from API
    async function loadWalletBalances() {
        try {
            console.log('Loading wallet balances...');
            const res = await fetch(`/api/wallet/${userId}`);
            console.log('Wallet API response status:', res.status);
            if (!res.ok) {
                console.log('Wallet API response not ok:', res.status);
                return;
            }
            const wallet = await res.json();
            console.log('Wallet API data:', wallet);
            
            if (mainAccountCard) {
                mainAccountCard.updateBalance(Number(wallet.main_balance).toFixed(2));
            }
            if (partnerAccountCard) {
                partnerAccountCard.updateBalance(Number(wallet.partner_balance || 0).toFixed(2));
            }
            console.log('Wallet balances updated');
        } catch (e) {
            console.error('Error loading wallet balances:', e);
        }
    }

    // Load transactions from API
    async function loadTransactions() {
        try {
            console.log('Loading transactions...');
            const res = await fetch(`/api/transactions/${userId}`);
            console.log('Transactions API response status:', res.status);
            if (!res.ok) {
                console.log('Transactions API response not ok:', res.status);
                return;
            }
            const transactions = await res.json();
            console.log('Transactions data:', transactions);
            
            const tbody = document.querySelector('#transactions-table tbody');
            if (tbody && transactions.length > 0) {
                tbody.innerHTML = transactions.map(tx => `
                    <tr>
                        <td>${tx.type}</td>
                        <td>${new Date(tx.date).toLocaleDateString()}</td>
                        <td>${tx.amount} ${tx.currency}</td>
                        <td>${tx.description || 'Пополнение счета'}</td>
                        <td><span class="status-${tx.status}">${tx.status}</span></td>
                    </tr>
                `).join('');
            } else if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5">Нет операций</td></tr>';
            }
            console.log('Transactions loaded');
        } catch (e) {
            console.error('Error loading transactions:', e);
        }
    }


    // Load coupons
    async function loadMyCoupons() {
        try {
            console.log('Loading my coupons...');
            const response = await fetch('/api/coupons/active/1');
            const result = await response.json();
            const coupons = Array.isArray(result) ? result : (result.data || []);
            console.log('Active coupons from API:', coupons);
            
            const couponsList = document.getElementById('my-coupons-list');
            if (!couponsList) {
                console.error('Coupons list container not found');
                return;
            }
            
            if (coupons.length === 0) {
                couponsList.innerHTML = '';
                return;
            }
            
            // Show only first 3 coupons in wallet
            const displayCoupons = coupons.slice(0, 3);
            
            couponsList.innerHTML = displayCoupons.map(coupon => `
                <mini-coupon coupon-data='${JSON.stringify(coupon)}'></mini-coupon>
            `).join('');
            
            console.log('My coupons loaded:', displayCoupons.length);
        } catch (e) {
            console.error('Error loading my coupons:', e);
        }
    }

    // Setup coupon event listeners
    function setupCouponEventListeners() {
        document.addEventListener('coupon-use', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const coupon = e.detail.coupon;
            console.log('Coupon use clicked from wallet:', coupon);
            
            // Use the same logic as other pages
            useCoupon(coupon.id);
        });

        // Handle all-projects coupon clicks
        document.addEventListener('coupon-use-all-projects', function(e) {
            e.stopPropagation();
            const coupon = e.detail.coupon;
            console.log('All-projects coupon clicked from wallet:', coupon);
            
            // Show project selection modal
            showProjectSelectionModal(coupon);
        });
    }

    // Global function for coupon usage (same as other pages)
    window.useCoupon = async function(couponId) {
        console.log('Use coupon from wallet:', couponId);
        
        try {
            // First, get the coupon data before using it
            const couponResponse = await fetch('/api/coupons/active/1');
            const couponResult = await couponResponse.json();
            const activeCoupons = Array.isArray(couponResult) ? couponResult : (couponResult.data || []);
            
            const coupon = activeCoupons.find(c => c.id === couponId);
            if (!coupon) {
                alert('Купон не найден');
                return;
            }
            
            console.log('Coupon found:', coupon.name);
            
            // Store coupon in sessionStorage for checkout page
            sessionStorage.setItem('selectedCoupon', JSON.stringify(coupon));
            console.log('Coupon stored in sessionStorage for checkout');
            
            // Navigate based on coupon type using original coupon data
            if (coupon.project_name === 'Любой' || coupon.project_name === 'Все проекты') {
                // General coupon - go to invest page
                window.location.href = '/invest.html';
            } else {
                // Specific project coupon - go to packages page
                const projectUrl = getProjectUrl(coupon.project_name);
                console.log('Redirecting to:', projectUrl);
                window.location.href = projectUrl;
            }
        } catch (error) {
            console.error('Error using coupon:', error);
            alert('Ошибка при использовании купона');
        }
    };
    
    // Helper function to get project URL
    function getProjectUrl(projectName) {
        const projectUrls = {
            'Дирижабли': '/packages.html?project=airships',
            'Совэлмаш': '/packages.html?project=sovelmash'
        };
        return projectUrls[projectName] || '/packages.html';
    }

    // Show project selection modal
    function showProjectSelectionModal(coupon) {
        // Create modal element if it doesn't exist
        let modal = document.querySelector('project-selection-modal');
        if (!modal) {
            modal = document.createElement('project-selection-modal');
            document.body.appendChild(modal);
        }
        
        // Set coupon data and show modal
        modal.setCouponData(coupon);
        modal.setVisible(true);
        
        // Listen for modal close
        modal.addEventListener('modal-close', function() {
            modal.setVisible(false);
        });
    }

    // Refresh coupons when page becomes visible (user returns from other pages)
    function setupPageVisibilityListener() {
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                console.log('Page became visible, refreshing coupons...');
                loadMyCoupons();
            }
        });
    }

    // Initialize page
    loadWalletBalances();
    loadTransactions();
    loadMyCoupons();
    setupCouponEventListeners();
    setupPageVisibilityListener();
    setTimeout(showRegistrationCouponNotification, 1000);



});
