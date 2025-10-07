// Simple API server for local development
// Serves localStorage API through HTTP endpoints

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
};

// Load localStorage API (simplified version for Node.js)
class LocalStorageAPI {
    constructor() {
        this.data = this.loadData();
        this.initDefaultData();
    }

    loadData() {
        try {
            const dataPath = path.join(__dirname, 'localStorage-data.json');
            if (fs.existsSync(dataPath)) {
                const data = fs.readFileSync(dataPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (e) {
            console.error("Error loading data:", e);
        }
        return {};
    }

    saveData() {
        try {
            const dataPath = path.join(__dirname, 'localStorage-data.json');
            fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2));
        } catch (e) {
            console.error("Error saving data:", e);
        }
    }

    initDefaultData() {
        if (!this.data.users) {
            this.data.users = [
                {
                    id: 1,
                    email: 'demo@solargroup.com',
                    name: 'Demo User',
                    main_balance: 1000.00,
                    partner_balance: 500.00,
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

    async getActiveCoupons(userId) {
        try {
            const coupons = this.data.coupons.filter(c => !c.used);
            return { status: 200, data: coupons };
        } catch (error) {
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

    async getProjects() {
        try {
            return { status: 200, data: this.data.projects };
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

    async clearAllData() {
        try {
            // Reset to default data
            this.data = {};
            this.initDefaultData();
            
            return {
                status: 200,
                data: {
                    success: true,
                    message: 'Все данные сброшены к исходному состоянию'
                }
            };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }
}

// Create API instance
const api = new LocalStorageAPI();

// Create HTTP server
const server = http.createServer((req, res) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // Add CORS headers to all responses
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    res.setHeader('Content-Type', 'application/json');


    // Route handling
    if (path === '/api/coupons/active/1') {
        api.getActiveCoupons(1).then(result => {
            res.writeHead(result.status);
            res.end(JSON.stringify(result.data));
        });
    } else if (path === '/api/coupons/history/1') {
        api.getUsedCoupons(1).then(result => {
            res.writeHead(result.status);
            res.end(JSON.stringify(result.data));
        });
    } else if (path === '/api/coupons/use' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                api.useCoupon(data.couponId, data.userId).then(result => {
                    res.writeHead(result.status);
                    res.end(JSON.stringify(result.data));
                });
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else if (path === '/api/wallet/balance/1' || path === '/api/wallet/1') {
        api.getUserBalance(1).then(result => {
            res.writeHead(result.status);
            res.end(JSON.stringify(result.data));
        });
    } else if (path === '/api/transactions/deposit' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                api.processDeposit(data).then(result => {
                    res.writeHead(result.status);
                    res.end(JSON.stringify(result.data));
                });
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else if (path === '/api/projects') {
        api.getProjects().then(result => {
            res.writeHead(result.status);
            res.end(JSON.stringify(result.data));
        });
    } else if (path === '/api/reset' && method === 'POST') {
        api.clearAllData().then(result => {
            res.writeHead(result.status);
            res.end(JSON.stringify(result.data));
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Local API server running on http://localhost:${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET  /api/coupons/active/1`);
    console.log(`   GET  /api/coupons/history/1`);
    console.log(`   POST /api/coupons/use`);
    console.log(`   GET  /api/wallet/balance/1`);
    console.log(`   GET  /api/projects`);
});
