class PackageCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.package = null;
    }

    static get observedAttributes() {
        return ['package-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'package-data') {
            this.package = JSON.parse(newValue);
            this.render();
        }
    }

    setPackageData(packageData) {
        this.package = packageData;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this.package) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }

                .package-card {
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    border: 1px solid #e5e7eb;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .package-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                }

                .package-card.featured {
                    border: 2px solid #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }

                .package-card.featured::before {
                    content: 'Популярный';
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #3b82f6;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    z-index: 10;
                }

                .package-header {
                    padding: 24px 24px 16px;
                    text-align: center;
                    border-bottom: 1px solid #f1f5f9;
                }

                .package-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 8px 0;
                }

                .package-stage {
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-block;
                }

                .package-body {
                    padding: 20px 24px;
                    flex: 1;
                }

                .package-price {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .price-amount {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                }

                .price-currency {
                    font-size: 1.125rem;
                    color: #6b7280;
                    margin-left: 4px;
                }

                .package-details {
                    margin-bottom: 24px;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .detail-item:last-child {
                    border-bottom: none;
                }

                .detail-label {
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .detail-value {
                    color: #1f2937;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .bonus-info {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .bonus-text {
                    color: #166534;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin: 0;
                }

                .installment-info {
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .installment-text {
                    color: #92400e;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin: 0;
                }

                .package-footer {
                    padding: 0 24px 24px;
                }

                .btn {
                    width: 100%;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                }

                .btn--primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn--primary:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
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

                .btn--outline {
                    background: transparent;
                    color: #3b82f6;
                    border: 2px solid #3b82f6;
                }

                .btn--outline:hover {
                    background: #3b82f6;
                    color: white;
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .package-header {
                        padding: 20px 20px 16px;
                    }

                    .package-body {
                        padding: 16px 20px;
                    }

                    .package-footer {
                        padding: 0 20px 20px;
                    }

                    .price-amount {
                        font-size: 2rem;
                    }
                }

                @media (max-width: 480px) {
                    .package-name {
                        font-size: 1.25rem;
                    }

                    .price-amount {
                        font-size: 1.75rem;
                    }
                }
            </style>
            <div class="package-card ${this.package.featured ? 'featured' : ''}">
                <div class="package-header">
                    <h3 class="package-name">${this.package.name}</h3>
                    <div class="package-stage">${this.package.description}</div>
                </div>
                
                <div class="package-body">
                    <div class="package-price">
                        <span class="price-amount">$${this.package.price}</span>
                        <span class="price-currency">USD</span>
                    </div>
                    
                    <div class="package-details">
                        <div class="detail-item">
                            <span class="detail-label">Количество долей</span>
                            <span class="detail-value">${this.package.shares.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Стоимость доли</span>
                            <span class="detail-value">$${(this.package.price / this.package.shares).toFixed(3)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Этап финансирования</span>
                            <span class="detail-value">${this.package.stage}</span>
                        </div>
                    </div>
                    
                    ${this.package.bonus > 0 ? `
                        <div class="bonus-info">
                            <p class="bonus-text">🎁 Бонус: +${this.package.bonus} долей</p>
                        </div>
                    ` : ''}
                    
                    ${this.package.installment ? `
                        <div class="installment-info">
                            <p class="installment-text">💳 Доступна рассрочка: $${this.package.installmentPrice} × 2</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="package-footer">
                    <button class="btn btn--primary" data-package-id="${this.package.id}">
                        Выбрать пакет
                    </button>
                </div>
            </div>
        `;

        // Add event listener for the button
        const button = this.shadowRoot.querySelector('.btn--primary');
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('package-select', {
                    detail: { package: this.package },
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }
}

customElements.define('package-card', PackageCard);
