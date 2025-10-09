// New Year Bonus Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('New Year Bonus page loaded');
    
    // Initialize calculator
    initializeCalculator();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for registration coupon notification
    checkRegistrationCoupon();
});

function initializeCalculator() {
    const depositInput = document.getElementById('deposit-amount');
    const bonusResult = document.getElementById('bonus-result');
    
    if (!depositInput) return;
    
    function updateCalculator() {
        const amount = parseFloat(depositInput.value) || 0;
        const bonus = amount; // 100% бонус
        const total = amount + bonus; // Депозит + Бонус
        
        bonusResult.textContent = `$${total.toLocaleString()}`;
    }
    
    // Update on input
    depositInput.addEventListener('input', updateCalculator);
    
    // Set default value
    depositInput.value = '1000';
    updateCalculator();
}

function setupEventListeners() {
    // Example cards click handlers
    const exampleCards = document.querySelectorAll('.example-card');
    exampleCards.forEach(card => {
        card.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            
            // Set calculator value
            const depositInput = document.getElementById('deposit-amount');
            if (depositInput) {
                depositInput.value = amount;
                depositInput.dispatchEvent(new Event('input'));
            }
            
            // Scroll to calculator
            document.querySelector('.bonus-calculator').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Deposit button click handler
    const depositBtn = document.getElementById('deposit-calculator-btn');
    if (depositBtn) {
        depositBtn.addEventListener('click', function() {
            const depositInput = document.getElementById('deposit-amount');
            const amount = depositInput ? depositInput.value : '1000';
            
            // Store amount in sessionStorage for deposit page
            sessionStorage.setItem('presetAmount', amount);
            
            // Navigate to deposit page
            window.location.href = 'deposit.html';
        });
    }
}

// Check for registration coupon notification
async function checkRegistrationCoupon() {
    try {
        const response = await fetch('/api/coupons/active/1');
        if (response.ok) {
            const coupons = await response.json();
            const registrationCoupon = coupons.find(c => c.coupon_type === 'registration');
            
            if (registrationCoupon) {
                const notificationSystem = document.querySelector('notification-system');
                if (notificationSystem) {
                    notificationSystem.addNotification({
                        title: 'У вас есть новый купон!',
                        message: 'Вам доступен купон на $25 за регистрацию',
                        action_url: '/coupons.html'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error checking registration coupon:', error);
    }
}
