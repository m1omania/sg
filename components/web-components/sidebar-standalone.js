// Standalone Web Component for Sidebar (no modules)
class SGSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 220px;
                    flex-shrink: 0;
                }

                .sidebar {
                    background: #ffffff;
                    border-right: 1px solid #e5e7eb;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    width: 220px;
                    z-index: 50;
                    overflow-y: auto;
                    transition: transform 0.3s ease;
                    margin: 0;
                    flex-shrink: 0;
                }

                .nav-menu {
                    list-style: none;
                    margin: 0;
                    padding: 2rem 0;
                    display: flex;
                    flex-direction: column;
                }

                .nav-item {
                    margin: 0;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    padding: 1rem 2rem;
                    color: #374151;
                    text-decoration: none;
                    transition: all 0.2s;
                    font-weight: 500;
                    font-size: 0.875rem;
                    position: relative;
                    gap: 0.75rem;
                }

                .nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .nav-icon svg {
                    width: 20px;
                    height: 20px;
                    transition: all 0.2s ease;
                }

                .nav-link:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }

                .nav-link.active {
                    background: #dbeafe;
                    color: #1d4ed8;
                    border-right: 3px solid #3b82f6;
                }

                .nav-link.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: #3b82f6;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    :host {
                        width: 100%;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        z-index: 1000;
                    }

                    .sidebar {
                        position: static;
                        height: auto;
                        width: 100%;
                        transform: none;
                        margin: 0;
                        background: #ffffff;
                        border-top: 1px solid #e5e7eb;
                        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
                    }

                    .nav-menu {
                        flex-direction: row;
                        justify-content: space-around;
                        padding: 0.5rem 0;
                    }

                    .nav-item {
                        flex: 1;
                    }

                    .nav-link {
                        padding: 0.75rem 0.5rem;
                        font-size: 0.875rem;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        border-right: none !important;
                        border-left: none !important;
                        gap: 0.25rem;
                    }

                    .nav-icon svg {
                        width: 18px;
                        height: 18px;
                    }

                    .nav-link.active {
                        background: transparent !important;
                        color: #3b82f6 !important;
                        border-right: none !important;
                        border-left: none !important;
                    }

                    .nav-link.active::before {
                        display: none !important;
                    }
                }

                /* Smaller mobile screens */
                @media (max-width: 480px) {
                    .nav-link {
                        font-size: 0.75rem;
                        padding: 0.5rem 0.25rem;
                    }

                    .nav-icon svg {
                        width: 16px;
                        height: 16px;
                    }
                }

                /* Very small screens */
                @media (max-width: 360px) {
                    .nav-link {
                        font-size: 0.6875rem;
                        padding: 0.375rem 0.125rem;
                    }

                    .nav-icon svg {
                        width: 14px;
                        height: 14px;
                    }
                }

                /* Scrollbar styling */
                .sidebar::-webkit-scrollbar {
                    width: 4px;
                }

                .sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .sidebar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 2px;
                }

                .sidebar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            </style>

            <nav class="sidebar">
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="index.html" class="nav-link" data-page="index">
                            <span class="nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9,22 9,12 15,12 15,22"/>
                                </svg>
                            </span>
                            <span>Главная</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="wallet.html" class="nav-link" data-page="wallet">
                            <span class="nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                                    <line x1="10" y1="12" x2="14" y2="12"/>
                                </svg>
                            </span>
                            <span>Кошелёк</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="invest.html" class="nav-link" data-page="invest">
                            <span class="nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10"/>
                                    <line x1="12" y1="20" x2="12" y2="4"/>
                                    <line x1="6" y1="20" x2="6" y2="14"/>
                                </svg>
                            </span>
                            <span>Инвестировать</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="my-investments.html" class="nav-link" data-page="my-investments">
                            <span class="nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 3v18h18"/>
                                    <path d="m19 9-5 5-4-4-3 3"/>
                                </svg>
                            </span>
                            <span>Мои инвестиции</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="coupons.html" class="nav-link" data-page="coupons">
                            <span class="nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6"/>
                                    <path d="M4 18h16"/>
                                    <path d="M8 14h8"/>
                                </svg>
                            </span>
                            <span>Купоны и промокоды</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    }

    attachEventListeners() {
        // Set active page based on current URL
        this.setActivePage();
        
        // Listen for navigation changes
        window.addEventListener('popstate', () => {
            this.setActivePage();
        });

        // Listen for custom navigation events
        document.addEventListener('navigate', (e) => {
            this.setActivePage();
        });
    }

    setActivePage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop().replace('.html', '') || 'index';
        
        // Remove active class from all links
        const navLinks = this.shadowRoot.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page
        const activeLink = this.shadowRoot.querySelector(`[data-page="${currentPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Method to toggle sidebar on mobile
    toggle() {
        this.shadowRoot.querySelector('.sidebar').classList.toggle('open');
    }

    // Method to close sidebar on mobile
    close() {
        this.shadowRoot.querySelector('.sidebar').classList.remove('open');
    }

    connectedCallback() {
        // Set initial active page
        this.setActivePage();
    }
}

// Register the custom element
customElements.define('sg-sidebar', SGSidebar);
