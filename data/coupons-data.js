// Единый источник данных для всех компонентов купонов
// Этот файл содержит данные, идентичные localStorage-api.js

window.CouponsData = {
    // Активные купоны (те же, что в localStorage-api.js)
    active: [
        {
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
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z'
        }
    ],

    // Использованные купоны (пустой массив по умолчанию)
    used: [],

    // Получить все активные купоны (отсортированные по дате истечения)
    getActiveCoupons: function() {
        const now = new Date();
        return this.active
            .filter(coupon => !coupon.used && new Date(coupon.expires_at) > now) // Добавлена проверка на дату истечения
            .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
    },

    // Получить все использованные купоны
    getUsedCoupons: function() {
        return this.used;
    },

    // Получить купон по ID
    getCouponById: function(id) {
        const active = this.active.find(c => c.id == id);
        if (active) return active;
        return this.used.find(c => c.id == id);
    },

    // Использовать купон
    useCoupon: function(id) {
        const coupon = this.active.find(c => c.id == id);
        if (coupon && !coupon.used) {
            coupon.used = true;
            coupon.used_at = new Date().toISOString();
            this.used.push(coupon);
            return true;
        }
        return false;
    },

    // Получить URL для проекта
    getProjectUrl: function(projectName) {
        const projectUrls = {
            'Дирижабли': '/packages.html?project=airships',
            'Совэлмаш': '/packages.html?project=sovelmash'
        };
        return projectUrls[projectName] || '/invest.html';
    }
};
