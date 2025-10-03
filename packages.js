// Packages page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Packages page loaded, initializing...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const projectFilter = urlParams.get('project') || 'all';
    
    console.log('Project filter from URL:', projectFilter);
    
    // Project configurations
    const projects = {
        'airships': {
            name: 'Дирижабли',
            stage: 20,
            description: 'Инновационные проекты воздушных дирижаблей. Современные технологии и экологичный транспорт будущего.',
            packages: [
                {
                    id: 'airship-250',
                    name: 'Пакет 250 $',
                    stage: 10,
                    shares: 7500,
                    price: 25.00,
                    installment: true,
                    installmentPrice: 25.00,
                    bonus: 0,
                    description: '10 этап'
                },
                {
                    id: 'airship-500',
                    name: 'Пакет 500 $',
                    stage: 20,
                    shares: 15000,
                    price: 50.00,
                    installment: true,
                    installmentPrice: 50.00,
                    bonus: 0,
                    description: '20 этап'
                },
                {
                    id: 'airship-1000',
                    name: 'Пакет 1000 $',
                    stage: 40,
                    shares: 30000,
                    price: 100.00,
                    installment: true,
                    installmentPrice: 100.00,
                    bonus: 0,
                    description: '40 этап'
                }
            ]
        },
        'sovelmash': {
            name: 'Совэлмаш',
            stage: 20,
            description: 'Развитие современного машиностроительного завода. Перспективный проект с высокой отдачей.',
            packages: [
                {
                    id: 'sov-500',
                    name: 'Пакет 500 $',
                    stage: 20,
                    shares: 15000,
                    price: 50.00,
                    installment: true,
                    installmentPrice: 50.00,
                    bonus: 0,
                    description: '20 этап'
                },
                {
                    id: 'sov-1000',
                    name: 'Пакет 1000 $',
                    stage: 40,
                    shares: 30000,
                    price: 100.00,
                    installment: true,
                    installmentPrice: 100.00,
                    bonus: 0,
                    description: '40 этап'
                },
                {
                    id: 'sov-2000',
                    name: 'Пакет 2000 $',
                    stage: 80,
                    shares: 60000,
                    price: 200.00,
                    installment: true,
                    installmentPrice: 200.00,
                    bonus: 0,
                    description: '80 этап'
                }
            ]
        }
    };
    
    // Get project data
    const project = projects[projectFilter] || projects['sovelmash'];
    
    console.log('Selected project:', project);
    
    // Update page content
    updatePageContent(project);
    
    // Load packages
    loadPackages(project);
    
    // Setup tab functionality
    setupTabs();
    
    // Setup buy buttons
    setupBuyButtons();
});

function updatePageContent(project) {
    // Update title
    const titleEl = document.getElementById('project-title');
    if (titleEl) {
        titleEl.textContent = project.name;
    }
    
    // Update stage
    const stageEl = document.getElementById('project-stage');
    if (stageEl) {
        stageEl.textContent = `${project.stage} этап`;
    }
    
    // Update description
    const descEl = document.getElementById('project-description');
    if (descEl) {
        descEl.textContent = project.description;
    }
    
    // Update page title
    document.title = `${project.name} - Пакеты - SolarGroup`;
}

function loadPackages(project) {
    const container = document.getElementById('packages-container');
    if (!container) return;
    
    console.log('Loading packages for project:', project.name);
    console.log('Packages data:', project.packages);
    
    if (project.packages.length === 0) {
        container.innerHTML = '<div class="no-packages">Пакеты для этого проекта пока не доступны</div>';
        return;
    }
    
    container.innerHTML = project.packages.map(pkg => `
        <div class="package-card">
            <div class="package-header">
                <h3 class="package-name">${pkg.name}</h3>
                <div class="package-stage">${pkg.description}</div>
            </div>
            <div class="package-body">
                <div class="package-details">
                    <div class="detail-row">
                        <span class="detail-label">Количество долей:</span>
                        <span class="detail-value">${pkg.shares.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Цена доли:</span>
                        <span class="detail-value">$${(pkg.price / pkg.shares * 10000).toFixed(4)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Рассрочка:</span>
                        <span class="detail-value">${pkg.installment ? 'Доступна' : 'Нет'}</span>
                    </div>
                </div>
                <div class="package-pricing">
                    <div class="price-main">
                        <span class="price-label">Полная стоимость:</span>
                        <span class="price-value">$${pkg.price.toFixed(2)}</span>
                    </div>
                    ${pkg.installment ? `
                        <div class="price-installment">
                            <span class="price-label">В рассрочку:</span>
                            <span class="price-value">$${pkg.installmentPrice.toFixed(2)}/мес</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="package-footer">
                <button class="btn btn--primary package-buy-btn" data-package-id="${pkg.id}">
                    Оформить
                </button>
            </div>
        </div>
    `).join('');
    
    console.log('Packages rendered successfully');
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function setupBuyButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('package-buy-btn')) {
            const packageId = e.target.dataset.packageId;
            console.log('Buy button clicked for package:', packageId);
            window.location.href = `checkout.html?package=${packageId}`;
        }
    });
}
