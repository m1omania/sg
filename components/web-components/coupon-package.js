class CouponPackage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.coupon = null;
        this.isActive = false;
    }

    static get observedAttributes() {
        return ['coupon-data', 'active'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'coupon-data') {
            this.coupon = JSON.parse(newValue);
            this.render();
        } else if (name === 'active') {
            this.isActive = newValue === 'true';
            this.render();
        }
    }

    setCouponData(coupon) {
        this.coupon = coupon;
        this.render();
    }

    setActive(isActive) {
        this.isActive = isActive;
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

        this.shadowRoot.innerHTML = `
            <style>
                .coupon-package {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .coupon-package:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
                }

                .coupon-package.active {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }

                .coupon-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin: 0;
                }

                .coupon-switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    flex-shrink: 0;
                }

                .coupon-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .coupon-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #d1d5db;
                    transition: 0.3s;
                    border-radius: 24px;
                }

                .coupon-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .coupon-switch input:checked + .coupon-slider {
                    background-color: #3b82f6;
                }

                .coupon-switch input:checked + .coupon-slider:before {
                    transform: translateX(20px);
                }

                .coupon-switch input:disabled + .coupon-slider {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
            <div class="coupon-package ${this.isActive ? 'active' : ''}">
                <p class="coupon-text">${this.coupon.discount_amount}${this.coupon.discount_type === 'percentage' ? '%' : '$'} ${this.coupon.name}</p>
                <label class="coupon-switch">
                    <input type="checkbox" ${this.isActive ? 'checked' : ''}>
                    <span class="coupon-slider"></span>
                </label>
            </div>
        `;

        // Add event listeners
        const checkbox = this.shadowRoot.querySelector('input[type="checkbox"]');
        const container = this.shadowRoot.querySelector('.coupon-package');
        
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            this.isActive = e.target.checked;
            this.render();
            
            // Dispatch custom event
            this.dispatchEvent(new CustomEvent('coupon-toggle', {
                detail: { 
                    coupon: this.coupon, 
                    active: this.isActive 
                },
                bubbles: true,
                composed: true
            }));
        });

        container.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }
}

customElements.define('coupon-package', CouponPackage);
