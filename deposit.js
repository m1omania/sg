// Deposit page functionality
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Deposit page loaded, initializing...');
    
    const depositForm = document.getElementById('deposit-form');
    const successNotification = document.getElementById('success-notification');
    const errorNotification = document.getElementById('error-notification');
    
    console.log('Elements found:', {
        depositForm: !!depositForm,
        successNotification: !!successNotification,
        errorNotification: !!errorNotification
    });
    
    const balanceAmountEl = document.querySelector('.balance-amount');
    const balanceBonusEl = document.querySelector('.balance-bonus');

    async function loadBalances() {
        try {
            console.log('Loading balances...');
            const res = await fetch('/api/wallet/1');
            console.log('Wallet response status:', res.status);
            if (!res.ok) {
                console.log('Wallet response not ok:', res.status);
                return;
            }
            const w = await res.json();
            console.log('Wallet data:', w);
            if (balanceAmountEl) balanceAmountEl.textContent = `${Number(w.main_balance).toFixed(2)} $`;
            if (balanceBonusEl) balanceBonusEl.textContent = `Бонусный баланс: ${Number(w.partner_balance || 0).toFixed(2)} $`;
            console.log('Balances updated');
        } catch (e) { 
            console.error('Error loading balances:', e); 
        }
    }

    await loadBalances();
    
    // Initialize deposit banner timer
    initDepositBannerTimer();
    
    // Check for preset amount from calculator
    const presetAmount = sessionStorage.getItem('presetAmount');
    if (presetAmount) {
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.value = presetAmount;
            // Clear the preset amount after setting it
            sessionStorage.removeItem('presetAmount');
        }
    }
    
    depositForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const amountInput = document.getElementById('amount');
        let amountStr = amountInput.value.trim();
        amountStr = amountStr.replace(',', '.');
        const amount = parseFloat(amountStr);
        const paymentMethodElement = document.querySelector('input[name="payment-method"]:checked');
        
        // Валидация суммы
        if (isNaN(amount) || amount <= 0) {
            showError('Введите корректную сумму');
            return;
        }
        
        // Валидация способа оплаты
        if (!paymentMethodElement) {
            showError('Выберите способ оплаты');
            return;
        }
        
        const paymentMethod = paymentMethodElement.value;
        
        try {
            const requestData = {
                userId: 1,
                amount: amount,
                paymentMethod: paymentMethod
            };
            
            console.log('Sending deposit request:', requestData);
            
            const response = await fetch('/api/transactions/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            console.log('Deposit response status:', response.status);
            const data = await response.json();
            console.log('Deposit response data:', data);
            
            if (response.ok) {
                console.log('Deposit successful, updating balances...');
                
                // Показываем уведомление об успешном пополнении
                showSuccess(`Счет успешно пополнен на ${amount}$ через ${paymentMethod === 'card' ? 'банковскую карту' : 'криптовалюту'}!`);
                
                // Показываем уведомление через систему уведомлений
                const notificationSystem = document.querySelector('notification-system');
                if (notificationSystem) {
                    notificationSystem.addNotification({
                        title: 'Пополнение успешно!',
                        message: `Ваш счет пополнен на ${amount}$`,
                        action_url: '/wallet.html'
                    });
                }
                
                // Создаем купон за пополнение
                await createDepositCoupon(amount);
                
                // Обновляем отображение баланса из API
                await loadBalances();
                
                // Очищаем форму
                depositForm.reset();
                console.log('Form reset completed');
            } else {
                console.log('Deposit failed:', data.error);
                showError(data.error || 'Ошибка пополнения счета');
            }
        } catch (error) {
            console.error('Deposit error:', error);
            showError('Ошибка сети. Попробуйте позже.');
        }
    });
    
    // Закрытие уведомлений
    document.querySelectorAll('.notification-close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.notification').classList.add('hidden');
        });
    });
    
    function showSuccess(message) {
        document.getElementById('notification-text').textContent = message;
        successNotification.classList.remove('hidden');
        
        setTimeout(() => {
            successNotification.classList.add('hidden');
        }, 5000);
    }
    
    function showError(message) {
        document.getElementById('error-text').textContent = message;
        errorNotification.classList.remove('hidden');
        
        setTimeout(() => {
            errorNotification.classList.add('hidden');
        }, 5000);
    }

    // Создание купона за пополнение
    async function createDepositCoupon(amount) {
        try {
            console.log('Creating deposit coupon for amount:', amount);
            
            // Создаем купон
            const couponResponse = await fetch('/api/coupons/create-deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 1,
                    depositAmount: amount
                })
            });
            
            if (couponResponse.ok) {
                const couponData = await couponResponse.json();
                console.log('Coupon created:', couponData);
                
                // Добавляем уведомление
                const notificationResponse = await fetch('/api/notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: 1,
                        notification: {
                            title: 'Получен купон!',
                            message: `Вам начислен купон на $${amount} за пополнение`,
                            action_url: '/coupons.html'
                        }
                    })
                });
                
                if (notificationResponse.ok) {
                    console.log('Notification added successfully');
                    
                    // Показываем уведомление в UI
                    const notificationSystem = document.querySelector('notification-system');
                    if (notificationSystem) {
                        notificationSystem.addNotification({
                            title: 'Получен купон!',
                            message: `Вам начислен купон на $${amount} за пополнение`,
                            action_url: '/coupons.html'
                        });
                    }
                } else {
                    console.error('Failed to add notification');
                }
            } else {
                console.error('Failed to create coupon');
            }
        } catch (error) {
        console.error('Error creating deposit coupon:', error);
    }
}

// Initialize deposit banner timer
function initDepositBannerTimer() {
    const timerElement = document.getElementById('deposit-banner-timer');
    if (!timerElement) return;
    
    // Set timer to 2 hours from now
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    
    function updateTimer() {
        const now = new Date();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            timerElement.textContent = '00:00:00';
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update immediately and then every second
    updateTimer();
    setInterval(updateTimer, 1000);
}
});
