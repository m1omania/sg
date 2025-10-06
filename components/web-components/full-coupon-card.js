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

    calculateProgress() {
        if (!this.coupon || !this.coupon.expires_at) return 0;
        
        const now = new Date();
        const expiresAt = new Date(this.coupon.expires_at);
        const created = new Date(this.coupon.created_at || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago if no created_at
        
        const totalDuration = expiresAt.getTime() - created.getTime();
        const elapsed = now.getTime() - created.getTime();
        
        const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
        return Math.round(progress);
    }

    getBadgeColor() {
        if (!this.coupon || !this.coupon.project_name) return '#8DA9E0';
        
        const projectColors = {
            'Дирижабли': '#8DA9E0',
            'Совэлмаш': '#66C2A4',
            'Все проекты': '#F59E0B',
            'default': '#8DA9E0'
        };
        
        return projectColors[this.coupon.project_name] || projectColors.default;
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
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    margin: 0 auto;
                    height: 100%;
                    min-height: 320px;
                }

                .coupon-card:hover {
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }

                .coupon-card.expiring {
                    border: 2px solid #ef4444;
                    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 84, 89, 0.05) 100%);
                }

                .coupon-project-badge {
                    color: white;
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    display: inline-block;
                    margin-bottom: 12px;
                    width: fit-content;
                }

                .coupon-header {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .coupon-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #333333;
                    margin: 0;
                    line-height: 1.2;
                }

                .coupon-subtitle {
                    font-size: 1rem;
                    font-weight: 400;
                    color: #666666;
                    margin: 0;
                    line-height: 1.4;
                }

                .coupon-progress-section {
                    margin: 16px 0;
                }

                .coupon-progress-text {
                    font-size: 0.9rem;
                    color: #333333;
                    margin-bottom: 8px;
                }

                .coupon-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .coupon-progress-fill {
                    height: 100%;
                    background: #333333;
                    border-radius: 2px;
                    width: 45%;
                    transition: width 0.3s ease;
                }



                .coupon-actions-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: auto;
                    padding-top: 20px;
                }

                .coupon-code-block {
                    background: white;
                    border: 1px solid #C0D0F0;
                    border-radius: 8px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
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
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }

                .coupon-use-btn:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                .coupon-use-btn:active {
                    transform: translateY(0);
                }

                .coupon-used-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-15deg);
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #9ca3af;
                    border: 3px solid #d1d5db;
                    border-radius: 8px;
                    padding: 8px 16px;
                    pointer-events: none;
                    z-index: 10;
                    user-select: none;
                    opacity: 0.9;
                }

                .coupon-card.used {
                    opacity: 0.6;
                    filter: grayscale(0.3);
                }

                .coupon-card.used .coupon-use-btn {
                    background: #9ca3af;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .coupon-card.used .coupon-use-btn:hover {
                    background: #9ca3af;
                    transform: none;
                }

                .coupon-card.used .coupon-code-block {
                    background: #f9fafb;
                    border-color: #e5e7eb;
                    opacity: 0.7;
                }

                .coupon-card.used .coupon-code-text {
                    color: #9ca3af;
                }

                .coupon-card.used .coupon-copy-icon {
                    color: #9ca3af;
                    cursor: not-allowed;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .coupon-card {
                        padding: 20px;
                        gap: 2px;
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
                    
                    .coupon-used-overlay {
                        font-size: 1.5rem;
                        padding: 4px 8px;
                        border-width: 2px;
                    }
                }

                @media (max-width: 480px) {
                    .coupon-used-overlay {
                        font-size: 1.2rem;
                        padding: 3px 6px;
                        border-width: 1px;
                    }
                }

                @media (max-width: 360px) {
                    .coupon-used-overlay {
                        font-size: 1rem;
                        padding: 2px 4px;
                        border-width: 1px;
                    }
                }
            </style>
            <div class="coupon-card ${this.coupon.is_expiring ? 'expiring' : ''} ${this.isHistory ? 'used' : ''}">
                ${this.isHistory ? '<div class="coupon-used-overlay">ИСПОЛЬЗОВАН</div>' : ''}
                
                <div class="coupon-project-badge" style="background: ${this.getBadgeColor()}">${this.coupon.project_name}</div>
                
                <div class="coupon-header">
                    <h3 class="coupon-title">${this.coupon.discount_amount}${this.coupon.discount_type === 'percentage' ? '%' : '$'} ${this.coupon.name}</h3>
                    <p class="coupon-subtitle">${this.coupon.description}</p>
                </div>
                
                <div class="coupon-progress-section">
                    <div class="coupon-progress-text">До ${new Date(this.coupon.expires_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                    <div class="coupon-progress-bar">
                        <div class="coupon-progress-fill" style="width: ${this.calculateProgress()}%"></div>
                    </div>
                </div>
                
                <div class="coupon-actions-container">
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

        // Copy code functionality (only for active coupons)
        if (!this.isHistory) {
            this.shadowRoot.querySelector('.coupon-copy-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText('Bonus 25$').then(() => {
                    // Change icon to checkmark
                    const icon = e.target;
                    const originalHTML = icon.innerHTML;
                    const originalColor = icon.style.color;
                    
                    icon.innerHTML = `
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    `;
                    icon.style.color = '#10b981';
                    
                    // Change back to copy icon after 2 seconds
                    setTimeout(() => {
                        icon.innerHTML = originalHTML;
                        icon.style.color = originalColor;
                    }, 2000);
                });
            });
        }

    }
}

customElements.define('full-coupon-card', FullCouponCard);