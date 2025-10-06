// Full Coupon Card Web Component
class FullCouponCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['coupon-data', 'is-history'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'coupon-data' && newValue) {
            this.couponData = JSON.parse(newValue);
            this.render();
        }
        if (name === 'is-history' && newValue !== oldValue) {
            this.isHistory = newValue === 'true';
            this.render();
        }
    }

    render() {
        const coupon = this.couponData || {};
        const isHistory = this.isHistory || false;
        
        const statusClass = isHistory ? 'used' : 'active';
        const statusText = isHistory ? 'Использован' : 'Активен';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1rem;
                }

                .coupon-card {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .coupon-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .coupon-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .coupon-code {
                    font-family: 'Courier New', monospace;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: #3b82f6;
                    background: #f0f9ff;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    border: 1px solid #bae6fd;
                }

                .coupon-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .coupon-status.active {
                    background: #dcfce7;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                }

                .coupon-status.used {
                    background: #f3f4f6;
                    color: #6b7280;
                    border: 1px solid #d1d5db;
                }

                .coupon-body {
                    margin-bottom: 1rem;
                }

                .coupon-name {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .coupon-description {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0 0 1rem 0;
                    line-height: 1.4;
                }

                .coupon-discount {
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .discount-amount {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #3b82f6;
                }

                .discount-text {
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .coupon-details {
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .coupon-details p {
                    margin: 0 0 0.5rem 0;
                    font-size: 0.875rem;
                    color: #374151;
                }

                .coupon-details p:last-child {
                    margin-bottom: 0;
                }

                .coupon-details strong {
                    color: #1f2937;
                    font-weight: 600;
                }

                .coupon-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                }

                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                }

                .btn--small {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.75rem;
                }

                .btn--primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn--primary:hover {
                    background: #2563eb;
                }

                .btn:not(.btn--primary) {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn:not(.btn--primary):hover {
                    background: #e5e7eb;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .coupon-card {
                        padding: 1rem;
                    }

                    .coupon-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .coupon-actions {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                    }
                }
            </style>

            <div class="coupon-card" data-coupon-id="${coupon.id || ''}">
                <div class="coupon-header">
                    <div class="coupon-code">${coupon.code || ''}</div>
                    <div class="coupon-status ${statusClass}">${statusText}</div>
                </div>
                <div class="coupon-body">
                    <h3 class="coupon-name">${coupon.name || ''}</h3>
                    <p class="coupon-description">${coupon.description || ''}</p>
                    <div class="coupon-discount">
                        <span class="discount-amount">${coupon.discount || 0}%</span>
                        <span class="discount-text">скидка</span>
                    </div>
                    <div class="coupon-details">
                        <p><strong>Проект:</strong> ${coupon.project_name || 'Любой'}</p>
                        <p><strong>Условия:</strong> ${coupon.conditions || 'Без ограничений'}</p>
                        <p><strong>Действует до:</strong> ${coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Не указано'}</p>
                    </div>
                </div>
                <div class="coupon-actions">
                    <button class="btn btn--small" data-action="details">
                        Подробнее
                    </button>
                    ${!isHistory ? `<button class="btn btn--small btn--primary" data-action="use">
                        Использовать
                    </button>` : ''}
                </div>
            </div>
        `;

        // Add event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        const detailsBtn = this.shadowRoot.querySelector('[data-action="details"]');
        const useBtn = this.shadowRoot.querySelector('[data-action="use"]');

        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('coupon-details', {
                    detail: { coupon: this.couponData },
                    bubbles: true
                }));
            });
        }

        if (useBtn) {
            useBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('coupon-use', {
                    detail: { coupon: this.couponData },
                    bubbles: true
                }));
            });
        }

        // Card click for general interaction
        const card = this.shadowRoot.querySelector('.coupon-card');
        if (card) {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.dispatchEvent(new CustomEvent('coupon-click', {
                        detail: { coupon: this.couponData },
                        bubbles: true
                    }));
                }
            });
        }
    }

    // Public methods
    setCouponData(couponData) {
        this.couponData = couponData;
        this.setAttribute('coupon-data', JSON.stringify(couponData));
    }

    setHistory(isHistory) {
        this.isHistory = isHistory;
        this.setAttribute('is-history', isHistory.toString());
    }
}

// Register the custom element
customElements.define('full-coupon-card', FullCouponCard);
