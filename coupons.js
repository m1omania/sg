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
            
            // Mock data for local testing
            const mockCoupons = [
                {
                    id: 1,
                    code: 'Welcome 25$',
                    name: 'приветственный бонус',
                    description: 'Специальное предложение для новых клиентов',
                    discount_amount: 25,
                    discount_type: 'dollar',
                    project_name: 'Все проекты',
                    conditions: 'Регистрация',
                    expires_at: '2025-11-15T23:59:59Z'
                },
                {
                    id: 2,
                    code: 'Dirigible 15%',
                    name: 'скидка на дирижабли',
                    description: 'Специальное предложение для проекта Дирижабли',
                    discount_amount: 15,
                    discount_type: 'percentage',
                    project_name: 'Дирижабли',
                    conditions: 'Минимальная сумма 1000$',
                    expires_at: '2024-12-31T23:59:59Z'
                },
                {
                    id: 3,
                    code: 'Sovelmash 20%',
                    name: 'скидка совэлмаш',
                    description: 'Эксклюзивное предложение для проекта Совэлмаш',
                    discount_amount: 20,
                    discount_type: 'percentage',
                    project_name: 'Совэлмаш',
                    conditions: 'Только для новых инвесторов',
                    expires_at: '2025-01-31T23:59:59Z'
                }
            ];
            
            console.log('Using mock coupons data:', mockCoupons);
            
            if (activeCouponsGrid) {
                activeCouponsGrid.innerHTML = '';
                
                if (mockCoupons.length === 0) {
                    activeCouponsGrid.innerHTML = '<div class="empty-state"><p>У вас нет активных купонов</p></div>';
                    return;
                }
                
                console.log('Creating coupon cards for', mockCoupons.length, 'coupons');
                mockCoupons.forEach((coupon, index) => {
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
            
            // Mock data for local testing
            const mockHistoryCoupons = [
                {
                    id: 4,
                    code: 'Early 30$',
                    name: 'раннее предложение',
                    description: 'Скидка для первых инвесторов',
                    discount_amount: 30,
                    discount_type: 'dollar',
                    project_name: 'Дирижабли',
                    conditions: 'Использован 15.01.2024',
                    expires_at: '2024-01-31T23:59:59Z'
                },
                {
                    id: 5,
                    code: 'Launch 25%',
                    name: 'запуск проекта',
                    description: 'Специальное предложение при запуске',
                    discount_amount: 25,
                    discount_type: 'percentage',
                    project_name: 'Совэлмаш',
                    conditions: 'Использован 05.02.2024',
                    expires_at: '2024-02-29T23:59:59Z'
                }
            ];
            
            console.log('Using mock history coupons data:', mockHistoryCoupons);
            
            if (historyCouponsGrid) {
                historyCouponsGrid.innerHTML = '';
                
                if (mockHistoryCoupons.length === 0) {
                    historyCouponsGrid.innerHTML = '<div class="empty-state"><p>У вас нет использованных купонов</p></div>';
                    return;
                }
                
                mockHistoryCoupons.forEach(coupon => {
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
        const card = document.createElement('full-coupon-card');
        card.setCouponData(coupon);
        card.setHistory(isHistory);
        
        // Add event listeners for the Web Component
        card.addEventListener('coupon-use', (e) => {
            useCoupon(e.detail.coupon.id);
        });
        
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
            .then(response => response.json())
            .then(coupons => {
                coupon = coupons.find(c => c.id == couponId);
                if (!coupon) {
                    // Try to find in history coupons
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
                if (!coupon && coupons) {
                    coupon = coupons.find(c => c.id == couponId);
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
        
        // Find coupon data
        let coupon = null;
        
        // Try to find in active coupons first
        fetch(`/api/coupons/active/1`)
            .then(response => response.json())
            .then(coupons => {
                coupon = coupons.find(c => c.id == couponId);
                if (!coupon) {
                    // Try to find in history coupons
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
                if (!coupon && coupons) {
                    coupon = coupons.find(c => c.id == couponId);
                }
                
                if (coupon) {
                    console.log('Using coupon:', coupon);
                    
                    // Navigate based on coupon type
                    if (coupon.project_name === 'Любой' || coupon.project_name === 'Все проекты') {
                        // General coupon - go to invest page
                        window.location.href = '/invest.html';
                    } else {
                        // Specific project coupon - go to packages page
                        const projectUrl = getProjectUrl(coupon.project_name);
                        window.location.href = projectUrl;
                    }
                } else {
                    alert('Купон не найден');
                }
            })
            .catch(error => {
                console.error('Error using coupon:', error);
                alert('Ошибка при использовании купона');
            });
    };
    
    // Helper function to get project URL
    function getProjectUrl(projectName) {
        const projectUrls = {
            'Дирижабли': '/packages.html?project=airships',
            'Совэлмаш': '/packages.html?project=sovelmash'
        };
        
        return projectUrls[projectName] || '/invest.html';
    }
    
    // Load initial data
    console.log('Starting to load active coupons...');
    loadActiveCoupons();
});
