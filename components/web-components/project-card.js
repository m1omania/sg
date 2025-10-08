class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.project = null;
    }

    static get observedAttributes() {
        return ['project-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'project-data') {
            this.project = JSON.parse(newValue);
            this.render();
        }
    }

    setProjectData(project) {
        this.project = project;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this.project) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }

                .project-card {
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    border: 1px solid #e5e7eb;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .project-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                }

                .project-image {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }

                .project-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .project-card:hover .project-image img {
                    transform: scale(1.05);
                }

                .project-overlay {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                }

                .project-status {
                    background: #10b981;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .project-status.inactive {
                    background: #6b7280;
                }

                .project-status.coming-soon {
                    background: #f59e0b;
                }

                .project-content {
                    padding: 24px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }

                .project-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                }

                .project-category {
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .project-body {
                    flex: 1;
                    margin-bottom: 24px;
                }

                .project-description {
                    color: #6b7280;
                    line-height: 1.6;
                    margin-bottom: 20px;
                    font-size: 0.95rem;
                }

                .project-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 16px;
                }

                .stat {
                    text-align: center;
                }

                .stat-label {
                    display: block;
                    font-size: 0.75rem;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                    font-weight: 600;
                }

                .stat-value {
                    display: block;
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1f2937;
                }

                .project-footer {
                    padding: 0 24px 24px;
                    margin-top: auto;
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

                /* Responsive design */
                @media (max-width: 768px) {
                    .project-content {
                        padding: 20px;
                    }

                    .project-footer {
                        padding: 0 20px 20px;
                    }

                    .project-stats {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .stat {
                        text-align: left;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .stat-label {
                        margin-bottom: 0;
                    }
                }

                @media (max-width: 480px) {
                    .project-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .project-title {
                        font-size: 1.25rem;
                    }
                }
            </style>
            <div class="project-card">
                <div class="project-image">
                    <img src="${this.project.image || this.getDefaultImage()}" 
                         alt="${this.project.name}" 
                         onerror="this.src='${this.getDefaultImage()}'" />
                    <div class="project-overlay">
                        <span class="project-status ${this.project.status || 'active'}">${this.getStatusText()}</span>
                    </div>
                </div>
                <div class="project-content">
                    <div class="project-header">
                        <h2 class="project-title">${this.project.name}</h2>
                        <div class="project-category">${this.project.category}</div>
                    </div>
                    <div class="project-body">
                        <p class="project-description">${this.project.description}</p>
                        <div class="project-stats">
                            <div class="stat">
                                <span class="stat-label">Доходность</span>
                                <span class="stat-value">${this.project.yield}% годовых</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Срок</span>
                                <span class="stat-value">${this.project.duration}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Мин. сумма</span>
                                <span class="stat-value">$${this.project.minAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="project-footer">
                    <button class="btn btn--primary" data-project-id="${this.project.id}">
                        Смотреть пакеты
                    </button>
                </div>
            </div>
        `;

        // Add event listener for the button
        const button = this.shadowRoot.querySelector('.btn--primary');
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('project-view-packages', {
                    detail: { project: this.project },
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }

    getDefaultImage() {
        const projectImages = {
            'Дирижабли': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRpcmVjdGlvbmVzPC90ZXh0Pjwvc3ZnPg==',
            'Совэлмаш': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNvdmV0bWFzaDwvdGV4dD48L3N2Zz4='
        };
        return projectImages[this.project.name] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2plY3Q8L3RleHQ+PC9zdmc+';
    }

    getStatusText() {
        const statusMap = {
            'active': 'Активный',
            'inactive': 'Неактивный',
            'coming-soon': 'Скоро',
            'completed': 'Завершен'
        };
        return statusMap[this.project.status] || 'Активный';
    }
}

customElements.define('project-card', ProjectCard);
