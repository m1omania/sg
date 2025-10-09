// Updated mini-coupon v2.0 - matches coupon-package design
class MiniCoupon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.coupon = null;
    }

    static get observedAttributes() {
        return ['coupon-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'coupon-data') {
            this.coupon = JSON.parse(newValue);
            this.render();
        }
    }

    setCouponData(coupon) {
        this.coupon = coupon;
        this.render();
    }

    formatExpiryDate(expiresAt) {
        if (!expiresAt) return '';
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Истёк';

        const day = expiry.getDate();
        const month = expiry.toLocaleDateString('ru-RU', { month: 'long' });
        
        // Правильное склонение месяцев
        const monthGenitive = {
            'январь': 'января',
            'февраль': 'февраля',
            'март': 'марта',
            'апрель': 'апреля',
            'май': 'мая',
            'июнь': 'июня',
            'июль': 'июля',
            'август': 'августа',
            'сентябрь': 'сентября',
            'октябрь': 'октября',
            'ноябрь': 'ноября',
            'декабрь': 'декабря'
        };
        
        const monthCorrect = monthGenitive[month] || month;
        return `до ${day} ${monthCorrect}`;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        console.log('🔄 Mini-coupon rendering with coupon:', this.coupon);
        if (!this.coupon) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }

                .mini-coupon {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .mini-coupon:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
                }

                .mini-coupon.used {
                    opacity: 0.6;
                    background: #f1f5f9;
                    border-color: #d1d5db;
                }

                .mini-coupon.expired {
                    opacity: 0.5;
                    background: #fef2f2;
                    border-color: #fecaca;
                }

                .coupon-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .coupon-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin: 0 0 4px 0;
                }
                
                .coupon-expiry {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                }

                .coupon-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                    white-space: nowrap;
                }

                .btn--primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn--primary:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                .btn--primary:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn--secondary {
                    background: #f8fafc;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                }

                .btn--secondary:hover {
                    background: #f1f5f9;
                    border-color: #d1d5db;
                }

                .btn--secondary:disabled {
                    background: #f9fafb;
                    color: #9ca3af;
                    cursor: not-allowed;
                }

                .used-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-15deg);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    pointer-events: none;
                    z-index: 10;
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .mini-coupon {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .coupon-actions {
                        justify-content: center;
                    }

                    .btn {
                        flex: 1;
                        max-width: 120px;
                    }
                }

                @media (max-width: 480px) {
                    .mini-coupon {
                        padding: 12px;
                    }

                    .coupon-text {
                        font-size: 13px;
                    }
                }
            </style>
            <div class="mini-coupon ${this.getStatusClass()}">
                ${this.coupon.used ? '<div class="used-overlay">ИСПОЛЬЗОВАН</div>' : ''}
                
                <div class="coupon-info">
                    <p class="coupon-text">${this.coupon.discount_amount}${this.coupon.discount_type === 'percentage' ? '%' : '$'} ${this.coupon.name}</p>
                    <p class="coupon-expiry">${this.formatExpiryDate(this.coupon.expires_at)}</p>
                </div>
                
                <div class="coupon-actions">
                    ${this.getActionButton()}
                </div>
            </div>
        `;

        // Add event listener for the button
        const button = this.shadowRoot.querySelector('.btn');
        if (button && !this.coupon.used) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Check if coupon is for all projects
                if (this.coupon.project_name === 'Все проекты') {
                    this.dispatchEvent(new CustomEvent('coupon-use-all-projects', {
                        detail: { coupon: this.coupon },
                        bubbles: true,
                        composed: true
                    }));
                } else {
                    this.dispatchEvent(new CustomEvent('coupon-use', {
                        detail: { coupon: this.coupon },
                        bubbles: true,
                        composed: true
                    }));
                }
            });
        }
    }

    getStatusClass() {
        if (this.coupon.used) return 'used';
        if (this.isExpired()) return 'expired';
        return '';
    }

    isExpired() {
        if (!this.coupon.expires_at) return false;
        return new Date(this.coupon.expires_at) < new Date();
    }

    getActionButton() {
        if (this.coupon.used) {
            return '<button class="btn btn--secondary" disabled>Использован</button>';
        }
        
        if (this.isExpired()) {
            return '<button class="btn btn--secondary" disabled>Истёк</button>';
        }
        
        return '<button class="btn btn--primary">Использовать</button>';
    }
}

customElements.define('mini-coupon', MiniCoupon);
// Cache buster: 1759911431
