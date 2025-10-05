// Checkout Coupons Logic
class CheckoutCoupons {
    constructor() {
        this.userId = 1; // Demo user ID
        this.availableCoupons = [];
        this.appliedCoupon = null;
        this.packageAmount = 0;
        
        this.init();
    }
    
    init() {
        this.loadAvailableCoupons();
        this.bindEvents();
        this.updatePackageAmount();
    }
    
    async loadAvailableCoupons() {
        try {
            const response = await fetch(`/api/coupons/active/${this.userId}`);
            const coupons = await response.json();
            
            this.availableCoupons = coupons;
            this.checkForRelevantCoupons();
        } catch (error) {
            console.error('Error loading coupons:', error);
        }
    }
    
    checkForRelevantCoupons() {
        // Check for general coupons (not tied to specific projects)
        const generalCoupons = this.availableCoupons.filter(coupon => 
            !coupon.project_name || coupon.project_name === 'Любой'
        );
        
        if (generalCoupons.length > 0) {
            this.showCouponBanner(generalCoupons[0]);
        }
    }
    
    showCouponBanner(coupon) {
        const banner = document.getElementById('coupon-banner');
        const codeElement = document.getElementById('coupon-banner-code');
        const discountElement = document.getElementById('coupon-banner-discount');
        const expiryElement = document.getElementById('coupon-banner-expiry');
        const textElement = document.getElementById('coupon-banner-text');
        
        if (banner && coupon) {
            codeElement.textContent = coupon.code;
            discountElement.textContent = `-${coupon.discount_amount}$`;
            
            // Format expiry date
            const expiryDate = new Date(coupon.expires_at);
            expiryElement.textContent = `до ${expiryDate.toLocaleDateString('ru-RU')}`;
            
            textElement.textContent = coupon.description || 'У вас есть доступный купон на скидку';
            
            banner.style.display = 'block';
        }
    }
    
    bindEvents() {
        // Apply coupon from banner
        const applyBtn = document.getElementById('apply-coupon-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const generalCoupons = this.availableCoupons.filter(coupon => 
                    !coupon.project_name || coupon.project_name === 'Любой'
                );
                if (generalCoupons.length > 0) {
                    this.applyCoupon(generalCoupons[0]);
                }
            });
        }
        
        // Validate coupon input
        const validateBtn = document.getElementById('validate-coupon-btn');
        const couponInput = document.getElementById('coupon-input');
        
        if (validateBtn && couponInput) {
            validateBtn.addEventListener('click', () => {
                const code = couponInput.value.trim();
                if (code) {
                    this.validateCoupon(code);
                }
            });
            
            couponInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const code = couponInput.value.trim();
                    if (code) {
                        this.validateCoupon(code);
                    }
                }
            });
        }
    }
    
    async validateCoupon(code) {
        const feedback = document.getElementById('coupon-feedback');
        const input = document.getElementById('coupon-input');
        
        try {
            const response = await fetch('/api/coupons/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    userId: this.userId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showFeedback('success', `Купон "${code}" найден! Скидка: ${result.discount_amount}$`);
                input.classList.remove('error');
                input.classList.add('success');
                
                // Auto-apply the coupon
                setTimeout(() => {
                    this.applyCoupon(result.coupon);
                }, 1000);
            } else {
                this.showFeedback('error', result.message || 'Купон не найден или недействителен');
                input.classList.remove('success');
                input.classList.add('error');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            this.showFeedback('error', 'Ошибка при проверке купона');
            input.classList.remove('success');
            input.classList.add('error');
        }
    }
    
    applyCoupon(coupon) {
        this.appliedCoupon = coupon;
        this.updatePackageSummary();
        this.hideCouponBanner();
        this.showAppliedCoupon();
    }
    
    showAppliedCoupon() {
        // Remove existing applied coupon display
        const existingApplied = document.querySelector('.applied-coupon');
        if (existingApplied) {
            existingApplied.remove();
        }
        
        // Create applied coupon display
        const packageSummary = document.getElementById('package-summary');
        if (packageSummary && this.appliedCoupon) {
            const appliedDiv = document.createElement('div');
            appliedDiv.className = 'applied-coupon';
            appliedDiv.innerHTML = `
                <div class="applied-coupon-info">
                    <span class="applied-coupon-code">${this.appliedCoupon.code}</span>
                    <span class="applied-coupon-discount">Скидка: -${this.appliedCoupon.discount_amount}$</span>
                </div>
                <button class="remove-coupon-btn" onclick="checkoutCoupons.removeCoupon()">Удалить</button>
            `;
            
            packageSummary.appendChild(appliedDiv);
        }
    }
    
    removeCoupon() {
        this.appliedCoupon = null;
        this.updatePackageSummary();
        
        // Remove applied coupon display
        const appliedCoupon = document.querySelector('.applied-coupon');
        if (appliedCoupon) {
            appliedCoupon.remove();
        }
        
        // Show banner again if there are available coupons
        this.checkForRelevantCoupons();
    }
    
    updatePackageAmount() {
        // Get package amount from URL or page content
        const urlParams = new URLSearchParams(window.location.search);
        const amount = urlParams.get('amount') || 500; // Default amount
        this.packageAmount = parseInt(amount);
    }
    
    updatePackageSummary() {
        const summary = document.getElementById('package-summary');
        if (!summary) return;
        
        let discountAmount = 0;
        if (this.appliedCoupon) {
            discountAmount = this.appliedCoupon.discount_amount;
        }
        
        const finalAmount = Math.max(0, this.packageAmount - discountAmount);
        
        summary.innerHTML = `
            <div class="package-summary-item">
                <span>Стоимость пакета:</span>
                <span>$${this.packageAmount}</span>
            </div>
            ${discountAmount > 0 ? `
                <div class="package-summary-item discount">
                    <span>Скидка по купону:</span>
                    <span>-$${discountAmount}</span>
                </div>
            ` : ''}
            <div class="package-summary-item total">
                <span>Итого к оплате:</span>
                <span>$${finalAmount}</span>
            </div>
        `;
    }
    
    showFeedback(type, message) {
        const feedback = document.getElementById('coupon-feedback');
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `coupon-feedback ${type}`;
        }
    }
    
    hideCouponBanner() {
        const banner = document.getElementById('coupon-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutCoupons = new CheckoutCoupons();
});
