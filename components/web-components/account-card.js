class AccountCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['type', 'balance', 'currency', 'badge', 'badge-text'];
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const type = this.getAttribute('type') || 'main';
        const balance = this.getAttribute('balance') || '0.00';
        const currency = this.getAttribute('currency') || 'USD';
        const badge = this.getAttribute('badge') || '';
        const badgeText = this.getAttribute('badge-text') || '';

        const isPartner = type === 'partner';
        const icon = isPartner ? '🤝' : '💼';
        const title = isPartner ? 'Партнёрский счёт' : 'Основной счёт';
        const subtitle = isPartner ? 'Начисления партнёрской программы' : 'Доступные средства';
        const badgeClass = isPartner ? 'account-summary__badge--success' : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }

                .account-card {
                    background-color: var(--color-surface, #ffffff);
                    border-radius: var(--radius-lg, 12px);
                    border: 1px solid var(--color-card-border, #e5e7eb);
                    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
                    padding: var(--space-24, 24px);
                    transition: all 0.2s ease;
                }

                .account-card:hover {
                    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
                }

                .account-summary__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-16, 16px);
                }

                .account-summary__title-wrap {
                    display: flex;
                    align-items: center;
                    gap: var(--space-12, 12px);
                }

                .account-summary__icon {
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-primary-light, #f0f9ff);
                    border-radius: var(--radius-md, 8px);
                }

                .account-summary__title {
                    margin: 0 0 var(--space-4, 4px) 0;
                    font-size: var(--font-size-lg, 18px);
                    font-weight: var(--font-weight-semibold, 600);
                    color: var(--color-text, #1f2937);
                }

                .account-summary__subtitle {
                    font-size: var(--font-size-sm, 14px);
                    color: var(--color-text-secondary, #6b7280);
                    margin: 0;
                }

                .account-summary__badge {
                    padding: var(--space-2, 2px) var(--space-8, 8px);
                    border-radius: var(--radius-sm, 4px);
                    font-size: var(--font-size-xs, 12px);
                    font-weight: var(--font-weight-medium, 500);
                    background: var(--color-primary, #3b82f6);
                    color: var(--color-primary-text, #ffffff);
                }

                .account-summary__badge--success {
                    background: var(--color-success, #10b981);
                }

                .account-summary__amount {
                    font-size: var(--font-size-2xl, 24px);
                    font-weight: var(--font-weight-bold, 700);
                    color: var(--color-text, #1f2937);
                    margin-bottom: var(--space-16, 16px);
                }

                .account-summary__controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .account-summary__actions {
                    display: flex;
                    gap: var(--space-12, 12px);
                }

                .btn {
                    padding: var(--space-3, 12px) var(--space-4, 16px);
                    border-radius: var(--radius-md, 8px);
                    font-size: var(--font-size-sm, 14px);
                    font-weight: var(--font-weight-medium, 500);
                    text-decoration: none;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn--primary {
                    background: var(--color-primary, #3b82f6);
                    color: var(--color-primary-text, #ffffff);
                }

                .btn--primary:hover {
                    background: var(--color-primary-dark, #2563eb);
                }

                .btn--secondary {
                    background: transparent;
                    color: var(--color-text-secondary, #6b7280);
                    border: 1px solid var(--color-border, #d1d5db);
                }

                .btn--secondary:hover {
                    background: var(--color-gray-50, #f9fafb);
                    color: var(--color-text, #1f2937);
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .account-summary__actions {
                        flex-direction: column;
                        gap: var(--space-8, 8px);
                    }

                    .btn {
                        width: 100%;
                    }
                }
            </style>

            <div class="account-card account-summary ${isPartner ? 'account-summary--partner' : ''}">
                <div class="account-summary__header">
                    <div class="account-summary__title-wrap">
                        <div class="account-summary__icon">${icon}</div>
                        <div>
                            <h3 class="account-summary__title">${title}</h3>
                            <div class="account-summary__subtitle">${subtitle}</div>
                        </div>
                    </div>
                    ${badge ? `<span class="account-summary__badge ${badgeClass}">${badgeText}</span>` : ''}
                </div>
                
                <div class="account-summary__amount" id="${type}-balance-amount">${balance} $</div>
                
                <div class="account-summary__controls">
                    <div></div>
                    <div class="account-summary__actions">
                        <a class="btn btn--primary" href="deposit.html" ${isPartner ? 'disabled' : ''}>Пополнить</a>
                        <button class="btn btn--secondary" id="withdraw-${type}-btn" disabled>Вывести</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const withdrawBtn = this.shadowRoot.querySelector(`#withdraw-${this.getAttribute('type')}-btn`);
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('withdraw', {
                    detail: {
                        type: this.getAttribute('type'),
                        balance: this.getAttribute('balance')
                    },
                    bubbles: true
                }));
            });
        }
    }

    updateBalance(newBalance) {
        this.setAttribute('balance', newBalance);
        const amountElement = this.shadowRoot.querySelector(`#${this.getAttribute('type')}-balance-amount`);
        if (amountElement) {
            amountElement.textContent = `${newBalance} $`;
        }
    }
}

customElements.define('account-card', AccountCard);
