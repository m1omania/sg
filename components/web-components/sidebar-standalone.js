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
                    width: 100%;
                }

                .sidebar {
                    background: #ffffff;
                    border-right: 1px solid #e5e7eb;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    width: 250px;
                    z-index: 50;
                    overflow-y: auto;
                    transition: transform 0.3s ease;
                }

                .nav-menu {
                    list-style: none;
                    margin: 0;
                    padding: 2rem 0;
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
                    .sidebar {
                        position: static;
                        height: auto;
                        width: 100%;
                        transform: none;
                    }

                    .nav-link {
                        padding: 1.25rem 2rem;
                        font-size: 1rem;
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
                            <span>Главная</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="wallet.html" class="nav-link" data-page="wallet">
                            <span>Кошелёк</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="invest.html" class="nav-link" data-page="invest">
                            <span>Инвестировать</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="my-investments.html" class="nav-link" data-page="my-investments">
                            <span>Мои инвестиции</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="coupons.html" class="nav-link" data-page="coupons">
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
