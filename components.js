// Components Documentation Page
class ComponentsPage {
    constructor() {
        this.components = [
            {
                name: 'sg-header',
                file: 'components/web-components/header-standalone.js',
                class: 'SGHeader',
                description: 'Основной заголовок сайта с логотипом, навигацией и кнопкой сброса данных',
                usage: [
                    { page: 'index.html', purpose: 'Главная страница - навигация и сброс данных' },
                    { page: 'wallet.html', purpose: 'Страница кошелька - навигация и сброс данных' },
                    { page: 'invest.html', purpose: 'Страница инвестиций - навигация и сброс данных' },
                    { page: 'my-investments.html', purpose: 'Мои инвестиции - навигация и сброс данных' },
                    { page: 'coupons.html', purpose: 'Купоны - навигация и сброс данных' },
                    { page: 'checkout.html', purpose: 'Оформление пакета - навигация и сброс данных' },
                    { page: 'packages.html', purpose: 'Пакеты - навигация и сброс данных' },
                    { page: 'deposit.html', purpose: 'Пополнение - навигация и сброс данных' }
                ],
                features: ['Логотип', 'Навигация', 'Кнопка сброса localStorage', 'Адаптивный дизайн'],
                status: 'active'
            },
            {
                name: 'sg-sidebar',
                file: 'components/web-components/sidebar-standalone.js',
                class: 'SGSidebar',
                description: 'Боковое меню навигации (десктоп) и мобильное меню (мобильные устройства)',
                usage: [
                    { page: 'index.html', purpose: 'Главная страница - навигация по разделам' },
                    { page: 'wallet.html', purpose: 'Страница кошелька - навигация по разделам' },
                    { page: 'invest.html', purpose: 'Страница инвестиций - навигация по разделам' },
                    { page: 'my-investments.html', purpose: 'Мои инвестиции - навигация по разделам' },
                    { page: 'coupons.html', purpose: 'Купоны - навигация по разделам' },
                    { page: 'checkout.html', purpose: 'Оформление пакета - навигация по разделам' },
                    { page: 'packages.html', purpose: 'Пакеты - навигация по разделам' },
                    { page: 'deposit.html', purpose: 'Пополнение - навигация по разделам' }
                ],
                features: ['Адаптивное меню', 'Иконки навигации', 'Активное состояние', 'Мобильная версия'],
                status: 'active'
            },
            {
                name: 'account-card',
                file: 'components/web-components/account-card.js',
                class: 'AccountCard',
                description: 'Карточка счета пользователя (основной или партнерский) с балансом и кнопками действий',
                usage: [
                    { page: 'index.html', purpose: 'Главная страница - отображение балансов счетов' },
                    { page: 'wallet.html', purpose: 'Страница кошелька - детальная информация о счетах' }
                ],
                features: ['Тип счета', 'Баланс', 'Кнопки действий', 'Адаптивный дизайн', 'Обновление баланса'],
                status: 'active'
            },
            {
                name: 'coupon-package',
                file: 'components/web-components/coupon-package.js',
                class: 'CouponPackage',
                description: 'Компактная карточка купона для страницы оформления пакета с переключателем',
                usage: [
                    { page: 'checkout.html', purpose: 'Оформление пакета - применение скидок и бонусов' }
                ],
                features: ['Переключатель', 'Сумма скидки', 'Информация о купоне', 'Применение скидки'],
                status: 'active'
            },
            {
                name: 'full-coupon-card',
                file: 'components/web-components/full-coupon-card.js',
                class: 'FullCouponCard',
                description: 'Полная карточка купона для страницы купонов с детальной информацией и кнопкой использования',
                usage: [
                    { page: 'coupons.html', purpose: 'Страница купонов - отображение активных и использованных купонов' }
                ],
                features: ['Детальная информация', 'Прогресс-бар', 'Копирование кода', 'Кнопка использования', 'Статус купона'],
                status: 'active'
            },
            {
                name: 'sg-header-landing',
                file: 'components/web-components/header-landing.js',
                class: 'SGHeaderLanding',
                description: 'Специальный заголовок для лендинговых страниц с упрощенной навигацией',
                usage: [
                    { page: 'landing.html', purpose: 'Главная лендинговая страница - упрощенная навигация' },
                    { page: 'register.html', purpose: 'Страница регистрации - упрощенная навигация' }
                ],
                features: ['Упрощенная навигация', 'Логотип', 'Адаптивный дизайн', 'Лендинговая версия'],
                status: 'active'
            },
            {
                name: 'project-card',
                file: 'components/web-components/project-card.js',
                class: 'ProjectCard',
                description: 'Карточка инвестиционного проекта с изображением, описанием, статистикой и кнопкой действий',
                usage: [
                    { page: 'invest.html', purpose: 'Страница инвестиций - отображение доступных проектов' }
                ],
                features: ['Изображение проекта', 'Статистика доходности', 'Статус проекта', 'Кнопка действий', 'Адаптивный дизайн', 'Hover эффекты'],
                status: 'active'
            },
            {
                name: 'package-card',
                file: 'components/web-components/package-card.js',
                class: 'PackageCard',
                description: 'Карточка инвестиционного пакета с ценой, деталями, бонусами и кнопкой выбора',
                usage: [
                    { page: 'packages.html', purpose: 'Страница пакетов - отображение доступных пакетов для проекта' }
                ],
                features: ['Цена пакета', 'Детали долей', 'Информация о рассрочке', 'Бонусы', 'Кнопка выбора', 'Адаптивный дизайн', 'Hover эффекты'],
                status: 'active'
            },
            {
                name: 'mini-coupon',
                file: 'components/web-components/mini-coupon.js',
                class: 'MiniCoupon',
                description: 'Сокращенная версия купона с кнопкой использования и датой действия',
                usage: [
                    { page: 'checkout.html', purpose: 'Страница оформления - компактное отображение купонов' },
                    { page: 'coupons.html', purpose: 'Страница купонов - быстрый просмотр и использование' }
                ],
                features: ['Компактный дизайн', 'Кнопка использования', 'Дата действия', 'Статус купона', 'Адаптивный дизайн', 'Hover эффекты'],
                status: 'active'
            }
        ];
        
        this.init();
    }

    init() {
        this.renderComponents();
        this.updateStats();
        
        // Render visual components after a short delay to ensure Web Components are loaded
        setTimeout(() => {
            this.renderVisualComponents();
        }, 100);
    }

    renderComponents() {
        const grid = document.getElementById('components-grid');
        if (!grid) return;

        grid.innerHTML = this.components.map(component => this.renderComponent(component)).join('');
    }

    renderComponent(component) {
        const statusClass = component.status === 'active' ? 'active' : 'inactive';
        const statusText = component.status === 'active' ? 'Активен' : 'Неактивен';
        
        // Skip header and sidebar components for visual demo
        const skipVisualDemo = ['sg-header', 'sg-sidebar', 'sg-header-landing'];
        const showVisualDemo = !skipVisualDemo.includes(component.name);
        
        return `
            <div class="component-card">
                <div class="component-header">
                    <h3 class="component-title">${component.name}</h3>
                    <span class="component-tag ${statusClass}">${statusText}</span>
                </div>
                
                <p class="component-description">${component.description}</p>
                
                ${showVisualDemo ? this.renderVisualDemo(component) : ''}
                
                <div class="component-usage">
                    <div class="usage-title">Используется на страницах:</div>
                    <ul class="usage-list">
                        ${component.usage.map(usage => `
                            <li class="usage-item">
                                <svg class="usage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 12l2 2 4-4"></path>
                                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                    <path d="M13 12h3a2 2 0 0 1 2 2v1"></path>
                                    <path d="M9 21H5a2 2 0 0 1-2-2v-1"></path>
                                </svg>
                                <span class="usage-page">${usage.page}</span>
                                <span class="usage-purpose">- ${usage.purpose}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="component-code">
                    <div class="code-title">Файл компонента</div>
                    <code>${component.file}</code>
                </div>
                
                <div class="component-code">
                    <div class="code-title">Класс JavaScript</div>
                    <code>class ${component.class} extends HTMLElement</code>
                </div>
            </div>
        `;
    }

    renderVisualDemo(component) {
        const demoId = `demo-${component.name.replace('-', '')}`;
        
        return `
            <div class="component-demo">
                <div class="demo-title">Визуальный пример:</div>
                <div class="demo-container" id="${demoId}">
                    <!-- Component will be rendered here -->
                </div>
            </div>
        `;
    }

    renderVisualComponents() {
        // Account Card Demo
        const accountDemo = document.getElementById('demo-accountcard');
        if (accountDemo) {
            accountDemo.innerHTML = `
                <account-card type="main" balance="1,250.00" currency="USD" badge="USD"></account-card>
                <account-card type="partner" balance="500.00" currency="USD" badge="+5%"></account-card>
            `;
        }

        // Coupon Package Demo
        const couponPackageDemo = document.getElementById('demo-couponpackage');
        if (couponPackageDemo) {
            const demoCoupon = {
                id: 1,
                name: 'Добро пожаловать',
                discount_amount: 25,
                discount_type: 'dollar',
                expires_at: '2025-12-31T23:59:59.000Z'
            };
            couponPackageDemo.innerHTML = `
                <coupon-package coupon-data='${JSON.stringify(demoCoupon)}'></coupon-package>
            `;
        }

        // Full Coupon Card Demo
        const fullCouponDemo = document.getElementById('demo-fullcouponcard');
        if (fullCouponDemo) {
            const demoCoupon = {
                id: 1,
                code: 'WELCOME25',
                name: 'Добро пожаловать',
                description: 'Скидка для новых пользователей',
                discount: 25,
                discount_amount: 25,
                project_name: 'Все проекты',
                expires_at: '2025-12-31T23:59:59.000Z',
                conditions: 'Минимальная сумма $250',
                used: false,
                created_at: '2025-01-01T00:00:00.000Z'
            };
            fullCouponDemo.innerHTML = `
                <full-coupon-card coupon-data='${JSON.stringify(demoCoupon)}'></full-coupon-card>
            `;
        }

        // Mini Coupon Demo
        const miniCouponDemo = document.getElementById('demo-minicoupon');
        if (miniCouponDemo) {
            const demoCoupon = {
                id: 1,
                name: 'Добро пожаловать',
                discount_amount: 25,
                expires_at: '2025-12-31T23:59:59.000Z'
            };
            miniCouponDemo.innerHTML = `
                <mini-coupon coupon-data='${JSON.stringify(demoCoupon)}'></mini-coupon>
            `;
        }

        // Project Card Demo
        const projectDemo = document.getElementById('demo-projectcard');
        if (projectDemo) {
            const demoProject = {
                id: 1,
                name: 'Дирижабли',
                description: 'Инновационный проект по созданию современных дирижаблей для грузоперевозок',
                category: 'Транспорт',
                status: 'active',
                yield: 15,
                duration: '24 месяца',
                minAmount: 1000,
                image: 'https://picsum.photos/400/200?random=1'
            };
            projectDemo.innerHTML = `
                <project-card project-data='${JSON.stringify(demoProject)}'></project-card>
            `;
        }

        // Package Card Demo
        const packageDemo = document.getElementById('demo-packagecard');
        if (packageDemo) {
            const demoPackage = {
                id: 1,
                name: 'Стартовый пакет',
                description: 'Базовый пакет',
                shares: 15000,
                price: 500,
                stage: '20 этап',
                featured: false,
                bonus: 5,
                installment: true,
                installmentPrice: 250
            };
            packageDemo.innerHTML = `
                <package-card package-data='${JSON.stringify(demoPackage)}'></package-card>
            `;
        }
    }

    updateStats() {
        const totalComponents = this.components.length;
        const activeComponents = this.components.filter(c => c.status === 'active').length;
        
        // Get unique pages using components
        const allPages = new Set();
        this.components.forEach(component => {
            component.usage.forEach(usage => {
                allPages.add(usage.page);
            });
        });
        const pagesUsing = allPages.size;

        // Update stats
        const totalEl = document.getElementById('total-components');
        const activeEl = document.getElementById('active-components');
        const pagesEl = document.getElementById('pages-using');

        if (totalEl) totalEl.textContent = totalComponents;
        if (activeEl) activeEl.textContent = activeComponents;
        if (pagesEl) pagesEl.textContent = pagesUsing;
    }

    // Method to add new component (for development)
    addComponent(component) {
        this.components.push(component);
        this.renderComponents();
        this.updateStats();
    }

    // Method to update component usage
    updateComponentUsage(componentName, newUsage) {
        const component = this.components.find(c => c.name === componentName);
        if (component) {
            component.usage = newUsage;
            this.renderComponents();
            this.updateStats();
        }
    }
}

// Initialize components page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ComponentsPage();
});
