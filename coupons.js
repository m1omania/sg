// Coupons page functionality
document.addEventListener('DOMContentLoaded', function() {
    const userId = 1; // Demo user ID
    
    // Load coupons from API
    async function loadCoupons() {
        try {
            console.log('Loading coupons from API...');
            const res = await fetch(`/api/coupons/active/${userId}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            console.log('Coupons API response status:', res.status);
            if (!res.ok) {
                console.log('Coupons API response not ok:', res.status);
                return;
            }
            const coupons = await res.json();
            console.log('Coupons data received:', coupons);
            console.log('Number of coupons:', coupons.length);
            
            // Update coupons count
            const couponsCount = document.getElementById('coupons-count');
            if (couponsCount) {
                couponsCount.textContent = coupons.length;
                console.log('Updated coupons count to:', coupons.length);
            }
            
            // Render coupons
            renderCoupons(coupons);
            
            console.log('Coupons loaded successfully');
        } catch (e) {
            console.error('Error loading coupons:', e);
        }
    }
    
    // Render coupons on the page
    function renderCoupons(coupons) {
        const couponsContainer = document.getElementById('coupons-container');
        if (!couponsContainer) return;
        
        if (coupons.length === 0) {
            couponsContainer.innerHTML = `
                <div class="no-coupons">
                    <div class="no-coupons__icon">🎫</div>
                    <h3>Нет активных купонов</h3>
                    <p>У вас пока нет доступных купонов или промокодов</p>
                    <button class="btn btn--primary" id="activate-promo-btn">Активировать промокод</button>
                </div>
            `;
            return;
        }
        
        couponsContainer.innerHTML = coupons.map(coupon => `
            <div class="coupon-card ${coupon.used ? 'coupon-card--used' : ''}" data-coupon-id="${coupon.id}">
                <div class="coupon-card__header">
                    <div class="coupon-card__info">
                        <h3 class="coupon-card__title">${coupon.name || coupon.code}</h3>
                        <div class="coupon-card__code">${coupon.code}</div>
                    </div>
                    <div class="coupon-card__discount">
                        ${coupon.discount}%
                    </div>
                </div>
                <div class="coupon-card__body">
                    <div class="coupon-card__description">
                        ${coupon.description || 'Скидка на инвестиции'}
                    </div>
                    <div class="coupon-card__details">
                        <div class="coupon-detail">
                            <span class="coupon-detail__label">Проект:</span>
                            <span class="coupon-detail__value">${coupon.project_name || 'Любой'}</span>
                        </div>
                        <div class="coupon-detail">
                            <span class="coupon-detail__label">Сумма:</span>
                            <span class="coupon-detail__value">$${coupon.discount_amount || '0'}</span>
                        </div>
                        <div class="coupon-detail">
                            <span class="coupon-detail__label">Истекает:</span>
                            <span class="coupon-detail__value">${new Date(coupon.expires_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="coupon-card__footer">
                    ${coupon.used ? 
                        '<span class="coupon-status coupon-status--used">Использован</span>' :
                        `<button class="btn btn--primary btn--small" onclick="useCoupon(${coupon.id})">Использовать</button>`
                    }
                    <button class="btn btn--secondary btn--small" onclick="copyCode('${coupon.code}')">Копировать код</button>
                </div>
            </div>
        `).join('');
    }
    
    // Use coupon function
    window.useCoupon = async function(couponId) {
        try {
            const res = await fetch('/api/coupons/use', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    couponId: couponId,
                    userId: userId
                })
            });
            
            const result = await res.json();
            
            if (res.ok) {
                // Update coupon status in UI
                const couponCard = document.querySelector(`[data-coupon-id="${couponId}"]`);
                if (couponCard) {
                    couponCard.classList.add('coupon-card--used');
                    const footer = couponCard.querySelector('.coupon-card__footer');
                    footer.innerHTML = `
                        <span class="coupon-status coupon-status--used">Использован</span>
                        <button class="btn btn--secondary btn--small" onclick="copyCode('${couponCard.querySelector('.coupon-card__code').textContent}')">Копировать код</button>
                    `;
                }
                
                // Show success message
                showNotification('Купон успешно использован!', 'success');
                
                // Reload coupons to sync with wallet
                loadCoupons();
            } else {
                showNotification(result.error || 'Ошибка использования купона', 'error');
            }
        } catch (error) {
            console.error('Error using coupon:', error);
            showNotification('Ошибка сети. Попробуйте позже.', 'error');
        }
    };
    
    // Copy code function
    window.copyCode = function(code) {
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Код скопирован в буфер обмена!', 'success');
        }).catch(() => {
            showNotification('Не удалось скопировать код', 'error');
        });
    };
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Coupon activation form
    const activateForm = document.getElementById('activate-coupon-form');
    if (activateForm) {
        activateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const code = document.getElementById('coupon-code').value.trim();
            
            if (!code) {
                showNotification('Введите код купона', 'error');
                return;
            }
            
            try {
                const res = await fetch('/api/coupons/activate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: code,
                        userId: userId
                    })
                });
                
                const result = await res.json();
                
                if (res.ok) {
                    showNotification('Купон успешно активирован!', 'success');
                    activateForm.reset();
                    loadCoupons(); // Reload coupons
                } else {
                    showNotification(result.error || 'Ошибка активации купона', 'error');
                }
            } catch (error) {
                console.error('Coupon activation error:', error);
                showNotification('Ошибка сети. Попробуйте позже.', 'error');
            }
        });
    }
    
    // Initialize page
    console.log('Initializing coupons page...');
    loadCoupons();
    
    // Force reload coupons every 2 seconds for demo purposes
    setInterval(() => {
        console.log('Refreshing coupons data...');
        loadCoupons();
    }, 2000);
});
