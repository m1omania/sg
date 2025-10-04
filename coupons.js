// Coupons page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Coupons page loaded');
    console.log('Document ready state:', document.readyState);
    console.log('Window location:', window.location.href);
    
    const userId = 1; // Demo user
    const activeCouponsGrid = document.getElementById('activeCouponsGrid');
    const historyCouponsGrid = document.getElementById('historyCouponsGrid');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Elements found:', {
        activeCouponsGrid: !!activeCouponsGrid,
        historyCouponsGrid: !!historyCouponsGrid,
        tabButtons: tabButtons.length,
        tabContents: tabContents.length
    });
    
    // Load active coupons
    async function loadActiveCoupons() {
        try {
            console.log('Loading active coupons...');
            console.log('activeCouponsGrid element:', activeCouponsGrid);
            
            const response = await fetch(`/api/coupons/active/${userId}`);
            console.log('Active coupons response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                console.log('Active coupons response not ok:', response.status);
                if (activeCouponsGrid) {
                    activeCouponsGrid.innerHTML = '<div class="empty-state"><p>Ошибка загрузки: ' + response.status + '</p></div>';
                }
                return;
            }
            
            const responseText = await response.text();
            console.log('Raw response text:', responseText);
            
            let coupons;
            try {
                coupons = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.log('Response was not valid JSON:', responseText);
                if (activeCouponsGrid) {
                    activeCouponsGrid.innerHTML = '<div class="empty-state"><p>Ошибка парсинга JSON</p></div>';
                }
                return;
            }
            
            console.log('Active coupons data:', coupons);
            
            if (activeCouponsGrid) {
                activeCouponsGrid.innerHTML = '';
                
                if (!Array.isArray(coupons)) {
                    console.error('Coupons is not an array:', coupons);
                    activeCouponsGrid.innerHTML = '<div class="empty-state"><p>Неверный формат данных</p></div>';
                    return;
                }
                
                if (coupons.length === 0) {
                    activeCouponsGrid.innerHTML = '<div class="empty-state"><p>У вас нет активных купонов</p></div>';
                    return;
                }
                
                console.log('Creating coupon cards for', coupons.length, 'coupons');
                coupons.forEach((coupon, index) => {
                    console.log('Creating card for coupon', index, coupon);
                    const couponCard = createCouponCard(coupon);
                    activeCouponsGrid.appendChild(couponCard);
                });
                console.log('All coupon cards created');
            } else {
                console.error('activeCouponsGrid element not found!');
            }
        } catch (error) {
            console.error('Error loading active coupons:', error);
            if (activeCouponsGrid) {
                activeCouponsGrid.innerHTML = '<div class="empty-state"><p>Ошибка загрузки купонов: ' + error.message + '</p></div>';
            }
        }
    }
    
    // Load history coupons
    async function loadHistoryCoupons() {
        try {
            console.log('Loading history coupons...');
            const response = await fetch(`/api/coupons/history/${userId}`);
            console.log('History coupons response status:', response.status);
            
            if (!response.ok) {
                console.log('History coupons response not ok:', response.status);
                return;
            }
            
            const coupons = await response.json();
            console.log('History coupons data:', coupons);
            
            if (historyCouponsGrid) {
                historyCouponsGrid.innerHTML = '';
                
                if (coupons.length === 0) {
                    historyCouponsGrid.innerHTML = '<div class="empty-state"><p>История купонов пуста</p></div>';
                    return;
                }
                
                coupons.forEach(coupon => {
                    const couponCard = createCouponCard(coupon, true);
                    historyCouponsGrid.appendChild(couponCard);
                });
            }
        } catch (error) {
            console.error('Error loading history coupons:', error);
            if (historyCouponsGrid) {
                historyCouponsGrid.innerHTML = '<div class="empty-state"><p>Ошибка загрузки истории</p></div>';
            }
        }
    }
    
    // Create coupon card
    function createCouponCard(coupon, isHistory = false) {
        const card = document.createElement('div');
        card.className = 'coupon-card';
        
        const statusClass = isHistory ? 'used' : 'active';
        const statusText = isHistory ? 'Использован' : 'Активен';
        
        card.innerHTML = `
            <div class="coupon-header">
                <div class="coupon-code">${coupon.code}</div>
                <div class="coupon-status ${statusClass}">${statusText}</div>
            </div>
            <div class="coupon-body">
                <h3 class="coupon-name">${coupon.name}</h3>
                <p class="coupon-description">${coupon.description}</p>
                <div class="coupon-discount">
                    <span class="discount-amount">${coupon.discount}%</span>
                    <span class="discount-text">скидка</span>
                </div>
                <div class="coupon-details">
                    <p><strong>Проект:</strong> ${coupon.project_name}</p>
                    <p><strong>Условия:</strong> ${coupon.conditions}</p>
                    <p><strong>Действует до:</strong> ${new Date(coupon.expires_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="coupon-actions">
                <button class="btn btn--small" onclick="showCouponDetails(${coupon.id})">
                    Подробнее
                </button>
                ${!isHistory ? `<button class="btn btn--small btn--primary" onclick="useCoupon(${coupon.id})">
                    Использовать
                </button>` : ''}
            </div>
        `;
        
        return card;
    }
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName + 'Tab') {
                    content.classList.add('active');
                }
            });
            
            // Load data for active tab
            if (tabName === 'active') {
                loadActiveCoupons();
            } else if (tabName === 'history') {
                loadHistoryCoupons();
            }
        });
    });
    
    // Modal functionality
    const addCouponModal = document.getElementById('addCouponModal');
    const addCouponBtn = document.getElementById('addCouponBtn');
    const closeAddCouponModal = document.getElementById('closeAddCouponModal');
    const cancelAddCoupon = document.getElementById('cancelAddCoupon');
    const addCouponForm = document.getElementById('addCouponForm');
    
    if (addCouponBtn) {
        addCouponBtn.addEventListener('click', () => {
            addCouponModal.style.display = 'block';
        });
    }
    
    if (closeAddCouponModal) {
        closeAddCouponModal.addEventListener('click', () => {
            addCouponModal.style.display = 'none';
        });
    }
    
    if (cancelAddCoupon) {
        cancelAddCoupon.addEventListener('click', () => {
            addCouponModal.style.display = 'none';
        });
    }
    
    // Coupon details modal functionality
    const couponDetailsModal = document.getElementById('couponDetailsModal');
    const closeCouponDetailsModal = document.getElementById('closeCouponDetailsModal');
    
    if (closeCouponDetailsModal) {
        closeCouponDetailsModal.addEventListener('click', () => {
            couponDetailsModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    if (couponDetailsModal) {
        couponDetailsModal.addEventListener('click', (e) => {
            if (e.target === couponDetailsModal) {
                couponDetailsModal.style.display = 'none';
            }
        });
    }
    
    if (addCouponForm) {
        addCouponForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addCouponForm);
            const code = formData.get('code');
            
            try {
                const response = await fetch('/api/coupons/activate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        code: code
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Промокод успешно активирован!');
                    addCouponModal.style.display = 'none';
                    addCouponForm.reset();
                    loadActiveCoupons(); // Reload active coupons
                } else {
                    alert('Ошибка: ' + result.error);
                }
            } catch (error) {
                console.error('Error activating coupon:', error);
                alert('Ошибка при активации промокода');
            }
        });
    }
    
    // Global functions for coupon actions
    window.showCouponDetails = function(couponId) {
        console.log('Show details for coupon:', couponId);
        
        // Check if modal exists
        const modal = document.getElementById('couponDetailsModal');
        if (!modal) {
            console.error('Modal not found!');
            alert('Модальное окно не найдено');
            return;
        }
        
        console.log('Modal found:', modal);
        
        // Show modal immediately with loading state
        modal.style.display = 'block';
        
        const title = document.getElementById('couponDetailsTitle');
        const body = document.getElementById('couponDetailsBody');
        
        title.textContent = 'Загрузка...';
        body.innerHTML = '<p>Загружаем детали купона...</p>';
        
        // Find coupon data
        let coupon = null;
        
        // Try to find in active coupons first
        fetch(`/api/coupons/active/1`)
            .then(response => {
                console.log('Active coupons response:', response.status);
                return response.json();
            })
            .then(coupons => {
                console.log('Active coupons data:', coupons);
                coupon = coupons.find(c => c.id == couponId);
                console.log('Found coupon in active:', coupon);
                
                if (!coupon) {
                    // Try to find in history coupons
                    console.log('Not found in active, searching history...');
                    return fetch(`/api/coupons/history/1`);
                }
                return Promise.resolve(coupons);
            })
            .then(response => {
                if (response && response.json) {
                    return response.json();
                }
                return response;
            })
            .then(coupons => {
                console.log('History coupons data:', coupons);
                if (!coupon && coupons) {
                    coupon = coupons.find(c => c.id == couponId);
                    console.log('Found coupon in history:', coupon);
                }
                
                if (coupon) {
                    console.log('Displaying coupon details:', coupon);
                    
                    title.textContent = coupon.name;
                    
                    const statusText = coupon.used ? 'Использован' : 
                                     (coupon.status === 'expired') ? 'Просрочен' : 'Активен';
                    const statusClass = coupon.used ? 'used' : 
                                      (coupon.status === 'expired') ? 'expired' : 'active';
                    
                    body.innerHTML = `
                        <div class="coupon-details-full">
                            <div class="coupon-header-detail">
                                <div class="coupon-code-detail">${coupon.code}</div>
                                <div class="coupon-status-detail ${statusClass}">${statusText}</div>
                            </div>
                            
                            <div class="coupon-info">
                                <h4>Описание</h4>
                                <p>${coupon.description}</p>
                                
                                <h4>Размер скидки</h4>
                                <div class="discount-info">
                                    <span class="discount-amount-large">${coupon.discount}%</span>
                                    <span class="discount-text">скидка</span>
                                </div>
                                
                                <h4>Проект</h4>
                                <p><strong>${coupon.project_name}</strong></p>
                                
                                <h4>Условия использования</h4>
                                <p>${coupon.conditions}</p>
                                
                                <h4>Срок действия</h4>
                                <p>${new Date(coupon.expires_at).toLocaleDateString('ru-RU')}</p>
                                
                                ${coupon.used_at ? `
                                    <h4>Дата использования</h4>
                                    <p>${new Date(coupon.used_at).toLocaleDateString('ru-RU')}</p>
                                ` : ''}
                                
                                ${coupon.investment_amount ? `
                                    <h4>Сумма инвестиции</h4>
                                    <p>$${coupon.investment_amount}</p>
                                ` : ''}
                                
                                ${coupon.discount_amount && coupon.discount_amount !== coupon.discount ? `
                                    <h4>Размер скидки</h4>
                                    <p>$${coupon.discount_amount}</p>
                                ` : ''}
                            </div>
                        </div>
                    `;
                } else {
                    console.log('Coupon not found');
                    title.textContent = 'Ошибка';
                    body.innerHTML = '<p>Купон не найден</p>';
                }
            })
            .catch(error => {
                console.error('Error loading coupon details:', error);
                title.textContent = 'Ошибка';
                body.innerHTML = '<p>Ошибка загрузки деталей купона: ' + error.message + '</p>';
            });
    };
    
    window.useCoupon = function(couponId) {
        console.log('Use coupon:', couponId);
        // Implement coupon usage
    };
    
    // Load initial data
    console.log('Starting to load active coupons...');
    loadActiveCoupons();
});
