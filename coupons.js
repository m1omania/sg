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
            console.log('Loading active coupons from API...');
            console.log('activeCouponsGrid element:', activeCouponsGrid);
            
            // Show loading state
            if (activeCouponsGrid) {
                activeCouponsGrid.innerHTML = '<div class="loading-state"><p>Загрузка купонов...</p></div>';
            }
            
            // Fetch real data from API
            const response = await fetch(`/api/coupons/active/${userId}`);
            const result = await response.json();
            
            console.log('Received response from API:', result);
            
            // Handle different response structures
            let coupons;
            if (Array.isArray(result)) {
                coupons = result;
                console.log('✅ Received direct array from API');
            } else if (result && Array.isArray(result.data)) {
                coupons = result.data;
                console.log('✅ Received object with data array from API');
            } else {
                console.error('❌ Invalid coupons data structure:', result);
                coupons = [];
            }
            
            console.log('Processed coupons array:', coupons);
            
            if (activeCouponsGrid) {
                activeCouponsGrid.innerHTML = '';
                
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
            console.log('Loading history coupons from API...');
            
            // Fetch real data from API
            const response = await fetch(`/api/coupons/history/${userId}`);
            const result = await response.json();
            
            console.log('Received history response from API:', result);
            
            // Handle different response structures
            let coupons;
            if (Array.isArray(result)) {
                coupons = result;
            } else if (result && Array.isArray(result.data)) {
                coupons = result.data;
            } else {
                console.error('Invalid history coupons data structure:', result);
                coupons = [];
            }
            
            console.log('Processed history coupons array:', coupons);
            console.log('History coupons count:', coupons.length);
            
            if (historyCouponsGrid) {
                historyCouponsGrid.innerHTML = '';
                
                if (coupons.length === 0) {
                    historyCouponsGrid.innerHTML = '<div class="empty-state"><p>У вас нет использованных купонов</p></div>';
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
        const card = document.createElement('full-coupon-card');
        card.setCouponData(coupon);
        card.setHistory(isHistory);
        
        // Force responsive styles
        setTimeout(() => {
            card.style.width = '100%';
            card.style.maxWidth = '100%';
            card.style.minWidth = '0';
            card.style.flex = '1 1 auto';
        }, 100);
        
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
                        console.log('Specific project coupon, project_name:', coupon.project_name);
                        const projectUrl = getProjectUrl(coupon.project_name);
                        console.log('Redirecting to:', projectUrl);
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
        console.log('Getting URL for project:', projectName);
        
        const projectUrls = {
            'Дирижабли': '/packages.html?project=airships',
            'Совэлмаш': '/packages.html?project=sovelmash'
        };
        
        const url = projectUrls[projectName] || '/invest.html';
        console.log('Generated URL:', url);
        
        return url;
    }
    
    
    // Setup auto refresh
    function setupAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            console.log('Auto-refreshing coupons...');
            refreshAllCoupons();
        }, 30000);
        
        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('Page became visible, refreshing coupons...');
                refreshAllCoupons();
            }
        });
    }
    
    // Refresh all coupons
    async function refreshAllCoupons() {
        console.log('Refreshing all coupons...');
        
        try {
            await loadActiveCoupons();
            await loadHistoryCoupons();
            console.log('All coupons refreshed');
        } catch (error) {
            console.error('Error refreshing coupons:', error);
        }
    }
    
    // Load initial data
    console.log('Starting to load active coupons...');
    loadActiveCoupons();
    loadHistoryCoupons();
    setupAutoRefresh();
});
