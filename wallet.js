// Wallet page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wallet page loaded, initializing...');
    
    const userId = 1; // demo user
    const mainBalanceEl = document.getElementById('main-balance-amount');
    const partnerBalanceEl = document.getElementById('partner-balance-amount');
    
    console.log('Wallet elements found:', {
        mainBalanceEl: !!mainBalanceEl,
        partnerBalanceEl: !!partnerBalanceEl
    });

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
            
            if (mainBalanceEl) {
                mainBalanceEl.textContent = `${Number(wallet.main_balance).toFixed(2)} $`;
            }
            if (partnerBalanceEl) {
                partnerBalanceEl.textContent = `${Number(wallet.partner_balance || 0).toFixed(2)} $`;
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

    // Load coupons from API
    async function loadCoupons() {
        try {
            console.log('Loading coupons...');
            const res = await fetch(`/api/coupons/active/${userId}`);
            console.log('Coupons API response status:', res.status);
            if (!res.ok) {
                console.log('Coupons API response not ok:', res.status);
                return;
            }
            const coupons = await res.json();
            console.log('Coupons data:', coupons);
            
            const couponsContainer = document.querySelector('.coupons-list');
            if (couponsContainer) {
                if (coupons.length > 0) {
                    couponsContainer.innerHTML = coupons.map(coupon => `
                        <div class="coupon-card">
                            <h4>${coupon.name}</h4>
                            <p>Проект: ${coupon.project_name || 'Любой'}</p>
                            <p>${coupon.discount_amount} бонус</p>
                            <p>Истекает: ${new Date(coupon.expires_at).toLocaleDateString()}</p>
                            <p>Условия: ${coupon.conditions}</p>
                            <p>Код: ${coupon.code}</p>
                            <button onclick="useCoupon(${coupon.id})">Использовать</button>
                            <button onclick="copyCode('${coupon.code}')">Копировать код</button>
                        </div>
                    `).join('');
                } else {
                    couponsContainer.innerHTML = '<p>Нет активных купонов</p>';
                }
            }
            console.log('Coupons loaded');
        } catch (e) {
            console.error('Error loading coupons:', e);
        }
    }

    // Initialize page
    loadWalletBalances();
    loadTransactions();
    loadCoupons();

    // Coupon activation
    const activateForm = document.getElementById('activate-coupon-form');
    if (activateForm) {
        activateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const code = document.getElementById('coupon-code').value.trim();
            
            if (!code) {
                alert('Введите код купона');
                return;
            }
            
            try {
                console.log('Activating coupon:', code);
                const res = await fetch('/api/coupons/activate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId,
                        code: code
                    })
                });
                
                const result = await res.json();
                console.log('Coupon activation result:', result);
                
                if (res.ok) {
                    alert('Купон успешно активирован!');
                    loadCoupons(); // Reload coupons
                    activateForm.reset();
                } else {
                    alert(result.error || 'Ошибка активации купона');
                }
            } catch (error) {
                console.error('Coupon activation error:', error);
                alert('Ошибка сети. Попробуйте позже.');
            }
        });
    }

    // Global functions for coupon actions
    window.useCoupon = function(couponId) {
        console.log('Using coupon:', couponId);
        // Implementation for using coupon
        alert('Функция использования купона будет реализована');
    };

    window.copyCode = function(code) {
        navigator.clipboard.writeText(code).then(() => {
            alert('Код скопирован в буфер обмена!');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Не удалось скопировать код');
        });
    };
});
