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

    getStatusOverlay() {
        if (!this.isHistory) return '';
        
        // Определяем статус купона
        if (this.coupon.status === 'expired') {
            return '<div class="coupon-used-overlay">ИСТЁК</div>';
        } else if (this.coupon.status === 'revoked') {
            return '<div class="coupon-used-overlay">ОТОЗВАН</div>';
        } else if (this.coupon.used) {
            return '<div class="coupon-used-overlay">ИСПОЛЬЗОВАН</div>';
        }
        
        return '';
    }

    connectedCallback() {
        this.render();
        // Force re-render to ensure responsive styles apply
        setTimeout(() => this.render(), 100);
        // Additional re-render after a longer delay
        setTimeout(() => this.render(), 500);
    }

    render() {
        if (!this.coupon) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                /* Host element styles */
                :host {
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 0 !important;
                    flex: 1 1 auto !important;
                    box-sizing: border-box !important;
                }
                
                /* Base styles for the coupon card - v4.0 with parts */
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
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                    flex: 1 1 auto;
                    flex-shrink: 1;
                    margin: 0;
                    box-sizing: border-box;
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
                    margin-top: 20px;
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
                    :host {
                        width: 100%;
                        max-width: 100%;
                        min-width: 0;
                        flex: 1 1 auto;
                    }
                    
                    .coupon-card {
                        padding: 20px;
                        gap: 2px;
                        margin: 0;
                        width: 100%;
                        max-width: 100%;
                        min-width: 0;
                        flex: 1 1 auto;
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
                    :host {
                        width: 100%;
                        max-width: 100%;
                        min-width: 0;
                        flex: 1 1 auto;
                    }
                    
                    .coupon-card {
                        padding: 16px;
                        margin: 0;
                        width: 100%;
                        max-width: 100%;
                        min-width: 0;
                        flex: 1 1 auto;
                    }
                    
                    .coupon-used-overlay {
                        font-size: 1.2rem;
                        padding: 3px 6px;
                        border-width: 1px;
                    }
                }

                @media (max-width: 360px) {
                    :host {
                        width: 100%;
                        max-width: 100%;
                        min-width: 0;
                        flex: 1 1 auto;
                    }
                    
                    .coupon-card {
                        padding: 12px;
                        margin: 0;
                        width: 100%;
                        max-width: 100%;
                        min-width: 0;
                        flex: 1 1 auto;
                    }
                    
                    .coupon-used-overlay {
                        font-size: 1rem;
                        padding: 2px 4px;
                        border-width: 1px;
                    }
                }
            </style>
            <div class="coupon-card ${this.coupon.is_expiring ? 'expiring' : ''} ${this.isHistory ? 'used' : ''}" part="coupon-card">
                ${this.getStatusOverlay()}
                
                <div class="coupon-project-badge" style="background: ${this.getBadgeColor()}">${this.coupon.project_name}</div>
                
                <div class="coupon-header">
                    <h3 class="coupon-title">${this.coupon.discount_amount}${this.coupon.discount_type === 'percentage' ? '%' : '$'} ${this.coupon.name}</h3>
                    <p class="coupon-subtitle">${this.coupon.description}</p>
                </div>
                
                <div class="coupon-progress-section">
                    <div class="coupon-progress-text">${this.formatExpiryDate(this.coupon.expires_at)}</div>
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

        // Copy code functionality (only for active coupons)
        if (!this.isHistory) {
            this.shadowRoot.querySelector('.coupon-copy-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(this.coupon.code).then(() => {
                    // Change text to "Скопировано"
                    const codeText = this.shadowRoot.querySelector('.coupon-code-text');
                    const originalText = codeText.textContent;
                    
                    codeText.textContent = 'Скопировано';
                    codeText.style.color = '#10b981';
                    
                    // Change back to original text after 2 seconds
                    setTimeout(() => {
                        codeText.textContent = originalText;
                        codeText.style.color = '#333333';
                    }, 2000);
                });
            });
        }

    }
}

customElements.define('full-coupon-card', FullCouponCard);