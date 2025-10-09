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
                    discount_type: 'fixed',
                    discount_value: 25,
                    min_amount: 0,
                    max_amount: 25,
                    project_name: 'Все проекты',
                    expires_at: '2025-12-31T23:59:59.000Z',
                    conditions: 'Минимальная сумма $250',
                    used: false,
                    created_at: '2025-01-01T00:00:00.000Z',
                    updated_at: '2025-01-01T00:00:00.000Z',
                    // Новые поля для купона за регистрацию
                    coupon_type: 'registration',
                    auto_enabled: false,
                    created_reason: 'registration',
                    deposit_amount: 0,
                    bonus_amount: 25,
                    total_amount: 25
                }
            ];
        }
        
        // Принудительно добавляем купоны в историю, если их там нет
        if (!this.data.used_coupons) {
            this.data.used_coupons = [];
        }
        
        // Проверяем, есть ли уже наши специальные купоны
        const hasExpiredCoupon = this.data.used_coupons.some(c => c.id === 4);
        const hasRevokedCoupon = this.data.used_coupons.some(c => c.id === 5);
        
        if (!hasExpiredCoupon) {
            this.data.used_coupons.push({
                id: 4,
                code: 'EXPIRED30',
                name: 'Истекший купон',
                description: 'Купон с истекшей датой применения',
                discount: 30,
                discount_amount: 30,
                project_name: 'Все проекты',
                expires_at: '2024-12-31T23:59:59.000Z', // Истекшая дата
                conditions: 'Минимальная сумма $100',
                used: false, // Не использован, но истек
                status: 'expired', // Специальный статус для истекших
                created_at: '2024-01-01T00:00:00.000Z',
                updated_at: '2024-12-31T23:59:59.000Z'
            });
        }
        
        if (!hasRevokedCoupon) {
            this.data.used_coupons.push({
                id: 5,
                code: 'REVOKED15',
                name: 'Отозванный купон',
                description: 'Купон, который был отозван администрацией',
                discount: 15,
                discount_amount: 15,
                project_name: 'Все проекты',
                expires_at: '2025-06-30T23:59:59.000Z',
                conditions: 'Минимальная сумма $200',
                used: false, // Не использован, но отозван
                status: 'revoked', // Специальный статус для отозванных
                created_at: '2024-06-01T00:00:00.000Z',
                updated_at: '2025-01-01T00:00:00.000Z'
            });
        }
        
        // Удалены купоны INVEST50 и SOVELMASH20 по запросу пользователя
        
        
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
            const now = new Date();
            const coupons = this.data.coupons
                .filter(c => !c.used && new Date(c.expires_at) > now) // Добавлена проверка на дату истечения
                .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
            console.log('🔍 localStorage API: filtered and sorted coupons', coupons);
            return { status: 200, data: coupons };
        } catch (error) {
            console.error('❌ localStorage API: getActiveCoupons error', error);
            return { status: 500, data: { error: error.message } };
        }
    }

    async getUsedCoupons(userId) {
        try {
            // Возвращаем все купоны из used_coupons (включая истекшие и отозванные)
            const usedCoupons = this.data.used_coupons;
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
            
            // Add to used coupons - copy the original coupon with used flag
            const usedCoupon = {
                ...coupon, // Copy all original properties
                used: true,
                used_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'used',
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

    async processInvestment(investmentData) {
        try {
            console.log('🔍 localStorage API: processInvestment called with:', investmentData);
            
            // Create investment record
            const investmentId = Date.now();
            const transactionId = Date.now() + 1;
            
            const investment = {
                id: investmentId,
                user_id: investmentData.userId,
                package_name: investmentData.packageId,
                project_name: investmentData.packageId, // For display purposes
                amount: investmentData.amount,
                account: investmentData.account,
                payment_type: investmentData.paymentType || 'single',
                status: 'active',
                transaction_id: transactionId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            this.data.investments.push(investment);
            
            // Update user balance (deduct amount)
            const user = this.data.users.find(u => u.id === investmentData.userId);
            if (user) {
                if (investmentData.account === 'main') {
                    user.main_balance = Math.max(0, user.main_balance - investmentData.amount);
                } else if (investmentData.account === 'partner') {
                    user.partner_balance = Math.max(0, user.partner_balance - investmentData.amount);
                }
            }
            
            // Create transaction record
            const transaction = {
                id: transactionId,
                user_id: investmentData.userId,
                type: 'investment',
                amount: -investmentData.amount, // Negative because it's an expense
                account: investmentData.account,
                description: `Инвестиция в пакет ${investmentData.packageId}`,
                created_at: new Date().toISOString()
            };
            
            this.data.transactions.push(transaction);
            this.saveData();
            
            console.log('✅ localStorage API: Investment processed successfully');
            return { status: 200, data: { investment, transaction } };
        } catch (error) {
            console.error('❌ localStorage API: processInvestment error', error);
            return { status: 500, data: { error: error.message } };
        }
    }

    // Создание купона за пополнение
    async createDepositCoupon(userId, depositAmount) {
        try {
            const couponId = Date.now();
            const bonusAmount = depositAmount; // 100% бонус
            const totalAmount = depositAmount + bonusAmount;
            
            const coupon = {
                id: couponId,
                user_id: userId,
                code: `DEPOSIT${depositAmount}`,
                name: `Бонус за пополнение`,
                description: `Получите бонус 100% от суммы пополнения`,
                discount: bonusAmount,
                discount_amount: bonusAmount,
                discount_type: 'fixed',
                discount_value: bonusAmount,
                min_amount: 0,
                max_amount: totalAmount,
                project_name: 'Все проекты',
                expires_at: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).toISOString(), // 31 декабря текущего года
                used: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                // Новые поля для купонов за пополнение
                coupon_type: 'deposit',
                auto_enabled: true,
                created_reason: 'deposit',
                deposit_amount: depositAmount,
                bonus_amount: bonusAmount,
                total_amount: totalAmount
            };
            
            this.data.coupons.push(coupon);
            this.saveData();
            
            return { status: 200, data: { coupon } };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    // Добавление уведомления
    async addNotification(userId, notification) {
        try {
            const notificationId = Date.now();
            const newNotification = {
                id: notificationId,
                user_id: userId,
                ...notification,
                created_at: new Date().toISOString(),
                read: false
            };
            
            // Инициализируем массив уведомлений если его нет
            if (!this.data.notifications) {
                this.data.notifications = [];
            }
            
            this.data.notifications.push(newNotification);
            this.saveData();
            
            return { status: 200, data: { notification: newNotification } };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    // Получение уведомлений пользователя
    async getNotifications(userId) {
        try {
            if (!this.data.notifications) {
                this.data.notifications = [];
            }
            
            const userNotifications = this.data.notifications
                .filter(n => n.user_id === userId)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            return { status: 200, data: userNotifications };
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

    clearAllData() {
        localStorage.removeItem(this.storageKey);
        this.data = this.loadData(); // Reload initial data
        this.initDefaultData();
        this.saveData();
    }

    async sendVerificationCode(email) {
        try {
            console.log('📧 localStorage API: sendVerificationCode called for', email);
            
            if (!email) {
                return { status: 400, data: { error: 'Email is required' } };
            }

            // For demo purposes, always return success
            return {
                status: 200,
                data: {
                    message: 'Verification code sent successfully',
                    demoCode: '123456' // Demo code for testing
                }
            };
        } catch (error) {
            console.error('❌ localStorage API: sendVerificationCode error', error);
            return { status: 500, data: { error: error.message } };
        }
    }

    async registerUser(email, code) {
        try {
            console.log('👤 localStorage API: registerUser called for', email, 'with code', code);
            
            if (!email || !code) {
                return { status: 400, data: { error: 'Email and code are required' } };
            }

            // For demo purposes, accept code 123456
            if (code === '123456') {
                const newUser = {
                    id: Date.now(),
                    email: email,
                    username: 'user_' + Date.now(),
                    emailVerified: true,
                    main_balance: 0.00,
                    partner_balance: 0.00,
                    created_at: new Date().toISOString()
                };

                // Add user to data (for demo purposes)
                if (!this.data.users) {
                    this.data.users = [];
                }
                this.data.users.push(newUser);
                this.saveData();

                return {
                    status: 200,
                    data: {
                        message: 'User registered successfully',
                        user: newUser,
                        token: 'demo-token-' + Date.now()
                    }
                };
            } else {
                return { status: 400, data: { error: 'Invalid verification code' } };
            }
        } catch (error) {
            console.error('❌ localStorage API: registerUser error', error);
            return { status: 500, data: { error: error.message } };
        }
    }

    async loginUser(email, password) {
        try {
            console.log('🔐 localStorage API: loginUser called for', email);
            
            if (!email) {
                return { status: 400, data: { error: 'Email is required' } };
            }

            // For demo purposes, find user by email
            const user = this.data.users.find(u => u.email === email);
            
            if (user) {
                return {
                    status: 200,
                    data: {
                        message: 'Login successful',
                        user: user,
                        token: 'demo-token-' + Date.now()
                    }
                };
            } else {
                return { status: 401, data: { error: 'User not found' } };
            }
        } catch (error) {
            console.error('❌ localStorage API: loginUser error', error);
            return { status: 500, data: { error: error.message } };
        }
    }
}

// Create global instance
window.localStorageAPI = new LocalStorageAPI();
}
