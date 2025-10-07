// localStorage API Adapter
// Replaces server API with browser localStorage

if (typeof LocalStorageAPI === 'undefined') {
class LocalStorageAPI {
    constructor() {
        this.storageKey = 'solargroup_prototype_db';
        this.data = this.loadData();
        this.initDefaultData();
    }

    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Error loading data from localStorage:", e);
            return {};
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
        }
    }

    initDefaultData() {
        if (!this.data.users) {
            this.data.users = [
                {
                    id: 1,
                    email: 'demo@solargroup.com',
                    name: 'Demo User',
                    main_balance: 0.00,
                    partner_balance: 0.00,
                    currency: 'USD',
                    created_at: '2025-01-01T00:00:00.000Z',
                    updated_at: '2025-01-07T10:00:00.000Z',
                    status: 'active',
                    role: 'user'
                }
            ];
        }
        
        if (!this.data.coupons) {
            this.data.coupons = [
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
                },
                {
                    id: 2,
                    code: 'INVEST50',
                    name: 'Инвестиционный бонус',
                    description: 'Бонус за первую инвестицию',
                    discount: 50,
                    discount_amount: 50,
                    project_name: 'Дирижабли',
                    expires_at: '2025-06-30T23:59:59.000Z',
                    conditions: 'Только для проекта Дирижабли',
                    used: false,
                    created_at: '2025-01-15T00:00:00.000Z',
                    updated_at: '2025-01-15T00:00:00.000Z'
                },
                {
                    id: 3,
                    code: 'SOVELMASH20',
                    name: 'Совэлмаш бонус',
                    description: 'Эксклюзивное предложение для проекта Совэлмаш',
                    discount: 20,
                    discount_amount: 20,
                    project_name: 'Совэлмаш',
                    expires_at: '2025-01-31T23:59:59.000Z',
                    conditions: 'Только для проекта Совэлмаш',
                    used: false,
                    created_at: '2024-12-01T00:00:00.000Z',
                    updated_at: '2024-12-01T00:00:00.000Z'
                }
            ];
        }
        
        if (!this.data.used_coupons) {
            this.data.used_coupons = [];
        }
        
        if (!this.data.investments) {
            this.data.investments = [];
        }
        
        if (!this.data.projects) {
            this.data.projects = [
                {
                    id: 1,
                    name: 'Дирижабли',
                    description: 'Инновационный проект по созданию дирижаблей нового поколения',
                    status: 'active',
                    min_investment: 250,
                    max_investment: 10000,
                    expected_return: 15,
                    duration_months: 24,
                    created_at: '2025-01-01T00:00:00.000Z',
                    updated_at: '2025-01-01T00:00:00.000Z',
                    image_url: '/images/projects/dirigibles.jpg',
                    category: 'transportation'
                },
                {
                    id: 2,
                    name: 'Совэлмаш',
                    description: 'Производство высокотехнологичного оборудования для промышленности',
                    status: 'active',
                    min_investment: 500,
                    max_investment: 50000,
                    expected_return: 12,
                    duration_months: 36,
                    created_at: '2025-01-01T00:00:00.000Z',
                    updated_at: '2025-01-01T00:00:00.000Z',
                    image_url: '/images/projects/sovelmash.jpg',
                    category: 'manufacturing'
                }
            ];
        }
        
        this.saveData();
    }

    // User endpoints
    async getUserBalance(userId) {
        try {
            const user = this.data.users.find(u => u.id === userId);
            if (!user) {
                return { status: 404, data: { error: 'User not found' } };
            }
            
            return {
                status: 200,
                data: {
                    id: user.id,
                    main_balance: user.main_balance,
                    partner_balance: user.partner_balance,
                    currency: user.currency,
                    lastUpdated: user.updated_at
                }
            };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async updateUserBalance(userId, mainBalance, partnerBalance) {
        try {
            const user = this.data.users.find(u => u.id === userId);
            if (!user) {
                return { status: 404, data: { error: 'User not found' } };
            }
            
            user.main_balance = mainBalance;
            user.partner_balance = partnerBalance;
            user.updated_at = new Date().toISOString();
            this.saveData();
            
            return { status: 200, data: { success: true } };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    // Coupon endpoints
    async getActiveCoupons(userId) {
        try {
            console.log('🔍 localStorage API: getActiveCoupons called for user', userId);
            console.log('🔍 localStorage API: data.coupons', this.data.coupons);
            const coupons = this.data.coupons.filter(c => !c.used);
            console.log('🔍 localStorage API: filtered coupons', coupons);
            return { status: 200, data: coupons };
        } catch (error) {
            console.error('❌ localStorage API: getActiveCoupons error', error);
            return { status: 500, data: { error: error.message } };
        }
    }

    async getUsedCoupons(userId) {
        try {
            const usedCoupons = this.data.used_coupons.filter(c => c.user_id === userId);
            return { status: 200, data: usedCoupons };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async useCoupon(couponId, userId) {
        try {
            const coupon = this.data.coupons.find(c => c.id === couponId);
            
            if (!coupon) {
                return { status: 404, data: { error: 'Coupon not found' } };
            }
            
            if (coupon.used) {
                return { status: 400, data: { error: 'Coupon already used' } };
            }
            
            // Mark coupon as used
            coupon.used = true;
            coupon.updated_at = new Date().toISOString();
            
            // Add to used coupons
            const usedCoupon = {
                id: Date.now(),
                coupon_id: couponId,
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discount_amount: coupon.discount_amount,
                project_name: coupon.project_name,
                used_at: new Date().toISOString(),
                status: 'used',
                type: 'bonus',
                user_id: userId
            };
            
            this.data.used_coupons.push(usedCoupon);
            this.saveData();
            
            return {
                status: 200,
                data: {
                    success: true,
                    message: 'Купон успешно использован'
                }
            };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    // Investment endpoints
    async getInvestments(userId) {
        try {
            const investments = this.data.investments.filter(i => i.user_id === userId);
            return { status: 200, data: investments };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async createInvestment(investmentData) {
        try {
            const investment = {
                id: Date.now(),
                ...investmentData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            this.data.investments.push(investment);
            this.saveData();
            
            return { status: 200, data: investment };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    // Project endpoints
    async getProjects() {
        try {
            return { status: 200, data: this.data.projects };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async getProject(projectId) {
        try {
            const project = this.data.projects.find(p => p.id === projectId);
            if (!project) {
                return { status: 404, data: { error: 'Project not found' } };
            }
            return { status: 200, data: project };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    // Utility methods
    async getStats() {
        try {
            const stats = {};
            Object.keys(this.data).forEach(key => {
                stats[key] = this.data[key].length;
            });
            return { status: 200, data: stats };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async clearAllData() {
        try {
            this.data = {};
            this.initDefaultData();
            return { status: 200, data: { success: true } };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async exportData() {
        try {
            return { status: 200, data: this.data };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async importData(data) {
        try {
            this.data = data;
            this.saveData();
            return { status: 200, data: { success: true } };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    async processDeposit(depositData) {
        try {
            const { userId, amount, paymentMethod } = depositData;
            
            if (!userId || !amount || !paymentMethod) {
                return { status: 400, data: { error: 'Missing required fields' } };
            }

            const user = this.data.users.find(u => u.id === userId);
            if (!user) {
                return { status: 404, data: { error: 'User not found' } };
            }

            // Update user balance
            user.main_balance += parseFloat(amount);
            user.updated_at = new Date().toISOString();

            // Create transaction record
            const transaction = {
                id: Date.now(),
                user_id: userId,
                type: 'deposit',
                amount: parseFloat(amount),
                payment_method: paymentMethod,
                status: 'completed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (!this.data.transactions) {
                this.data.transactions = [];
            }
            this.data.transactions.push(transaction);

            this.saveData();

            return {
                status: 200,
                data: {
                    success: true,
                    message: 'Пополнение успешно выполнено',
                    transaction: transaction,
                    new_balance: user.main_balance
                }
            };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }
}

// Create global instance
window.localStorageAPI = new LocalStorageAPI();
}
