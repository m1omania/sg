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
                showSuccess(`Счет успешно пополнен на ${amount} через ${paymentMethod === 'card' ? 'банковскую карту' : 'криптовалюту'}!`);
                
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
});
