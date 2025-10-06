class FullCouponCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.coupon = null;
        this.isHistory = false;
    }

    static get observedAttributes() {
        return ['coupon-data', 'is-history'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'coupon-data') {
            this.coupon = JSON.parse(newValue);
            this.render();
        } else if (name === 'is-history') {
            this.isHistory = newValue === 'true';
            this.render();
        }
    }

    setCouponData(coupon) {
        this.coupon = coupon;
        this.render();
    }

    setHistory(isHistory) {
        this.isHistory = isHistory;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this.coupon) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        const statusClass = this.isHistory ? 'used' : 'active';
        const statusText = this.isHistory ? 'Использован' : 'Активен';
        const expiresAt = new Date(this.coupon.expires_at).toLocaleDateString('ru-RU');

        this.shadowRoot.innerHTML = `
            <style>
                /* Base styles for the coupon card */
                .coupon-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 24px;
                    transition: all 0.3s ease;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    margin: 0 auto;
                }

                .coupon-card:hover {
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }

                .coupon-card.expiring {
                    border: 2px solid #ef4444;
                    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 84, 89, 0.05) 100%);
                }

                .coupon-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #333333;
                    margin: 0 0 8px 0;
                    line-height: 1.2;
                }

                .coupon-subtitle {
                    font-size: 1rem;
                    font-weight: 400;
                    color: #666666;
                    margin: 0 0 20px 0;
                    line-height: 1.4;
                }

                .coupon-divider {
                    width: 100%;
                    height: 1px;
                    background: repeating-linear-gradient(
                        to right,
                        #333333 0px,
                        #333333 4px,
                        transparent 4px,
                        transparent 8px
                    );
                    margin: 0 0 20px 0;
                }

                .coupon-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px 16px;
                    font-size: 0.9rem;
                    color: #333333;
                }

                .coupon-detail-label {
                    font-weight: 400;
                    text-align: left;
                }

                .coupon-detail-value {
                    font-weight: 400;
                    text-align: right;
                    color: #333333;
                }

                .coupon-code-block {
                    background: #f0f0f0;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 20px 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .coupon-code-text {
                    font-size: 0.9rem;
                    color: #333333;
                    font-weight: 500;
                }

                .coupon-copy-icon {
                    width: 16px;
                    height: 16px;
                    color: #666666;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }

                .coupon-copy-icon:hover {
                    color: #333333;
                }

                .coupon-use-btn {
                    background: #4ECDC4;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 14px 24px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    margin-top: 8px;
                }

                .coupon-use-btn:hover {
                    background: #45b8b0;
                    transform: translateY(-1px);
                }

                .coupon-use-btn:active {
                    transform: translateY(0);
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .coupon-card {
                        padding: 20px;
                        gap: 16px;
                        margin: 0 16px;
                    }
                    
                    .coupon-title {
                        font-size: 1.25rem;
                    }
                    
                    .coupon-subtitle {
                        font-size: 0.9rem;
                    }
                    
                    .coupon-details {
                        gap: 8px 12px;
                        font-size: 0.85rem;
                    }
                }
            </style>
            <div class="coupon-card ${this.coupon.is_expiring ? 'expiring' : ''}">
                <h3 class="coupon-title">${this.coupon.discount_amount}${this.coupon.discount_type === 'percentage' ? '%' : '$'} ${this.coupon.name}</h3>
                <p class="coupon-subtitle">${this.coupon.description}</p>
                
                <div class="coupon-divider"></div>
                
                <div class="coupon-details">
                    <div class="coupon-detail-label">Бонус:</div>
                    <div class="coupon-detail-value">${this.coupon.discount_amount}${this.coupon.discount_type === 'percentage' ? '%' : '$'}</div>
                    
                    <div class="coupon-detail-label">Проект:</div>
                    <div class="coupon-detail-value">${this.coupon.project_name || 'Все проекты'}</div>
                    
                    <div class="coupon-detail-label">Условие:</div>
                    <div class="coupon-detail-value">${this.coupon.conditions || 'Регистрация'}</div>
                    
                    <div class="coupon-detail-label">Действует до:</div>
                    <div class="coupon-detail-value">${expiresAt}</div>
                </div>
                
                <div class="coupon-code-block">
                    <span class="coupon-code-text">Код: ${this.coupon.code}</span>
                    <svg class="coupon-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </div>
                
                ${!this.isHistory ? `<button class="coupon-use-btn" id="use-btn">
                    Использовать
                </button>` : ''}
            </div>
        `;

        // Add event listeners
        if (!this.isHistory) {
            this.shadowRoot.getElementById('use-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('coupon-use', {
                    detail: { coupon: this.coupon },
                    bubbles: true,
                    composed: true
                }));
            });
        }

        // Copy code functionality
        this.shadowRoot.querySelector('.coupon-copy-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(this.coupon.code).then(() => {
                // Visual feedback
                const icon = e.target;
                const originalColor = icon.style.color;
                icon.style.color = '#4ECDC4';
                setTimeout(() => {
                    icon.style.color = originalColor;
                }, 200);
            });
        });

        // Card click for details
        this.shadowRoot.querySelector('.coupon-card').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('coupon-details', {
                detail: { coupon: this.coupon },
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('full-coupon-card', FullCouponCard);