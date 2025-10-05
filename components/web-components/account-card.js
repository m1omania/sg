class AccountCard extends HTMLElement {
    constructor() {
        super();
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

        this.innerHTML = `
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
        const withdrawBtn = this.querySelector(`#withdraw-${this.getAttribute('type')}-btn`);
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
        const amountElement = this.querySelector(`#${this.getAttribute('type')}-balance-amount`);
        if (amountElement) {
            amountElement.textContent = `${newBalance} $`;
        }
    }
}

customElements.define('account-card', AccountCard);
