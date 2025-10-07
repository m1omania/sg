// API Adapter for localStorage
// Provides fetch-like interface for localStorage API

if (typeof APIAdapter === 'undefined') {
class APIAdapter {
    constructor() {
        this.baseURL = '/api';
        this.localStorageAPI = window.localStorageAPI;
        this.localAPIServer = 'http://localhost:3001';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;

        try {
            // Try local API server first
            try {
                const localUrl = `${this.localAPIServer}${endpoint}`;
                const localResponse = await fetch(localUrl, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    body: options.body
                });
                
                if (localResponse.ok) {
                    const data = await localResponse.json();
                    return {
                        ok: true,
                        status: localResponse.status,
                        json: () => Promise.resolve(data),
                        text: () => Promise.resolve(JSON.stringify(data))
                    };
                }
            } catch (localError) {
                console.log('Local API server not available, falling back to localStorage');
            }

            // Fallback to localStorage API
            let result;

            // Route to appropriate localStorage method
            switch (endpoint) {
                case '/wallet/balance/1':
                    result = await this.localStorageAPI.getUserBalance(1);
                    break;
                
                case '/coupons/active/1':
                    result = await this.localStorageAPI.getActiveCoupons(1);
                    break;
                
                case '/coupons/history/1':
                    result = await this.localStorageAPI.getUsedCoupons(1);
                    break;
                
                case '/coupons/use':
                    result = await this.localStorageAPI.useCoupon(body.couponId, body.userId);
                    break;
                
                case '/investments/1':
                    result = await this.localStorageAPI.getInvestments(1);
                    break;
                
                case '/projects':
                    result = await this.localStorageAPI.getProjects();
                    break;
                
                case '/projects/1':
                    result = await this.localStorageAPI.getProject(1);
                    break;
                
                case '/projects/2':
                    result = await this.localStorageAPI.getProject(2);
                    break;
                
                default:
                    return {
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Endpoint not found' })
                    };
            }

            // Convert to fetch-like response
            return {
                ok: result.status >= 200 && result.status < 300,
                status: result.status,
                json: () => Promise.resolve(result.data),
                text: () => Promise.resolve(JSON.stringify(result.data))
            };

        } catch (error) {
            return {
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: error.message })
            };
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Create global instance
window.api = new APIAdapter();

// Override fetch for compatibility
window.fetch = async (url, options) => {
    if (url.startsWith('/api/')) {
        return window.api.request(url, options);
    }
    // Fallback to original fetch for non-API URLs
    return originalFetch(url, options);
};

// Store original fetch
const originalFetch = window.fetch;
}
