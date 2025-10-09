class ProjectSelectionModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.coupon = null;
        this.isVisible = false;
    }

    static get observedAttributes() {
        return ['coupon-data', 'visible'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'coupon-data') {
            this.coupon = JSON.parse(newValue);
            this.render();
        } else if (name === 'visible') {
            this.isVisible = newValue === 'true';
            this.render();
        }
    }

    setCouponData(coupon) {
        this.coupon = coupon;
        this.render();
    }

    setVisible(visible) {
        this.isVisible = visible;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: ${this.isVisible ? 'block' : 'none'};
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                }

                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 500px;
                    width: 100%;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    animation: modalSlideIn 0.3s ease-out;
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .modal-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .modal-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 8px 0;
                }

                .modal-subtitle {
                    font-size: 1rem;
                    color: #6b7280;
                    margin: 0;
                }

                .projects-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .project-card {
                    background: #f8fafc;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .project-card:hover {
                    border-color: #3b82f6;
                    background: #eff6ff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                }

                .project-card:active {
                    transform: translateY(0);
                }

                .project-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 12px;
                    background: #3b82f6;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                }

                .project-name {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 4px 0;
                }

                .project-description {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin: 0;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                }

                .btn--secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn--secondary:hover {
                    background: #e5e7eb;
                    border-color: #9ca3af;
                }

                /* Responsive design */
                @media (max-width: 640px) {
                    .modal-content {
                        padding: 24px;
                        margin: 10px;
                    }

                    .projects-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .project-card {
                        padding: 16px;
                    }

                    .project-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 1.25rem;
                    }

                    .modal-title {
                        font-size: 1.25rem;
                    }
                }
            </style>
            <div class="modal-overlay" id="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Выберите проект</h2>
                        <p class="modal-subtitle">Купон "${this.coupon?.name || ''}" можно использовать для любого проекта</p>
                    </div>
                    
                    <div class="projects-grid">
                        <div class="project-card" data-project="Дирижабли">
                            <div class="project-icon">🚁</div>
                            <h3 class="project-name">Дирижабли</h3>
                            <p class="project-description">Инновационные летательные аппараты</p>
                        </div>
                        
                        <div class="project-card" data-project="Совэлмаш">
                            <div class="project-icon">🏭</div>
                            <h3 class="project-name">Совэлмаш</h3>
                            <p class="project-description">Промышленное оборудование</p>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn--secondary" id="cancel-btn">Отмена</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        this.shadowRoot.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        this.shadowRoot.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        this.shadowRoot.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectName = card.dataset.project;
                this.selectProject(projectName);
            });
        });
    }

    selectProject(projectName) {
        if (this.coupon) {
            // Store coupon in sessionStorage for checkout page
            sessionStorage.setItem('selectedCoupon', JSON.stringify(this.coupon));
            
            // Navigate to packages page for the selected project
            const projectUrl = this.getProjectUrl(projectName);
            window.location.href = projectUrl;
        }
    }

    getProjectUrl(projectName) {
        const projectUrls = {
            'Дирижабли': '/packages.html?project=airship',
            'Совэлмаш': '/packages.html?project=sovelmash'
        };
        return projectUrls[projectName] || '/packages.html';
    }

    closeModal() {
        this.setVisible(false);
        this.dispatchEvent(new CustomEvent('modal-close', {
            detail: { coupon: this.coupon },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('project-selection-modal', ProjectSelectionModal);
