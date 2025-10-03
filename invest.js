// Invest page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Invest page loaded, initializing...');
    
    const viewPackagesBtns = document.querySelectorAll('.btn--primary');
    const investmentModal = document.getElementById('investment-modal');
    const confirmInvestmentBtn = document.getElementById('confirm-investment-btn');
    const successNotification = document.getElementById('success-notification');
    
    // Add click handlers for "Смотреть пакеты" buttons
    viewPackagesBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const projectCard = this.closest('.project-card');
            const projectName = projectCard.querySelector('h2').textContent; // Changed from h3 to h2
            
            console.log('View packages clicked for:', projectName);
            
            // Redirect to packages page with project filter
            const projectMap = {
                'Дирижабли': 'airships',
                'Совэлмаш': 'sovelmash'
            };
            
            const projectFilter = projectMap[projectName] || 'all';
            window.location.href = `packages.html?project=${projectFilter}`;
        });
    });
    
    // Investment modal functionality
    if (investmentModal) {
        // Close modal handlers
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', function() {
                investmentModal.classList.add('hidden');
            });
        });
        
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                investmentModal.classList.add('hidden');
            }
        });
    }
    
    // Confirm investment button
    if (confirmInvestmentBtn) {
        confirmInvestmentBtn.addEventListener('click', async function() {
            const projectSelect = document.getElementById('project-select');
            const amountInput = document.getElementById('amount-input');
            const couponInput = document.getElementById('coupon-input');
            
            if (!projectSelect || !amountInput) {
                console.error('Required form elements not found');
                return;
            }
            
            const project = projectSelect.value;
            const amount = parseFloat(amountInput.value);
            const coupon = couponInput ? couponInput.value.trim() : '';
            
            if (!project || !amount || amount <= 0) {
                alert('Пожалуйста, заполните все поля корректно');
                return;
            }
            
            console.log('Confirming investment:', { project, amount, coupon });
            
            try {
                // Show loading state
                const originalText = confirmInvestmentBtn.textContent;
                confirmInvestmentBtn.textContent = 'Обработка...';
                confirmInvestmentBtn.disabled = true;
                
                // Simulate investment processing
                const response = await fetch('/api/transactions/invest', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: 1,
                        packageId: project,
                        amount: amount,
                        account: 'main', // Default to main account
                        paymentType: 'single'
                    })
                });
                
                const result = await response.json();
                console.log('Investment result:', result);
                
                if (response.ok) {
                    showSuccess('Инвестиция успешно оформлена!');
                    investmentModal.classList.add('hidden');
                    
                    // Redirect to my investments page
                    setTimeout(() => {
                        window.location.href = 'my-investments.html';
                    }, 2000);
                } else {
                    alert(result.error || 'Ошибка оформления инвестиции');
                }
            } catch (error) {
                console.error('Investment error:', error);
                alert('Ошибка сети. Попробуйте позже.');
            } finally {
                // Restore button state
                confirmInvestmentBtn.textContent = originalText;
                confirmInvestmentBtn.disabled = false;
            }
        });
    }
    
    // Notification close handlers
    document.querySelectorAll('.notification-close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.notification').classList.add('hidden');
        });
    });
    
    function showSuccess(message) {
        if (successNotification) {
            const notificationText = successNotification.querySelector('#notification-text');
            if (notificationText) notificationText.textContent = message;
            successNotification.classList.remove('hidden');
            
            setTimeout(() => {
                successNotification.classList.add('hidden');
            }, 5000);
        }
    }
});
