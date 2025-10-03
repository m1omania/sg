class SgHeaderLanding extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* Global styles for consistency */
                :host {
                    display: block;
                    width: 100%;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    background: #ffffff;
                    border-bottom: 1px solid #e5e7eb;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    color: #1e293b;
                    font-weight: 700;
                    font-size: 1.5rem;
                }

                .logo-image {
                    height: 40px;
                    width: auto;
                    margin-right: 0.75rem;
                }

                .logo-fallback {
                    display: none;
                }

                .logo-image[src=""] + .logo-fallback,
                .logo-image:not([src]) + .logo-fallback {
                    display: inline;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                /* Language Switcher */
                .language-switcher {
                    position: relative;
                    display: inline-block;
                }

                .language-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    color: #374151;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .language-toggle:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                    color: #1f2937;
                }

                .language-toggle.active {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: #ffffff;
                }

                .language-flag {
                    width: 20px;
                    height: 15px;
                    border-radius: 2px;
                    object-fit: cover;
                }

                .dropdown-arrow {
                    width: 16px;
                    height: 16px;
                    transition: transform 0.2s;
                }

                .language-toggle.active .dropdown-arrow {
                    transform: rotate(180deg);
                    color: #ffffff;
                }

                .language-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    min-width: 120px;
                    z-index: 200;
                    display: none;
                }

                .language-dropdown.show {
                    display: block;
                }

                .language-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: #374151;
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: background-color 0.2s;
                }

                .language-option:hover {
                    background: #f9fafb;
                }

                .language-option.active {
                    background: #eff6ff;
                    color: #1d4ed8;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .header {
                        padding: 1rem;
                    }

                    .logo {
                        font-size: 1.25rem;
                    }

                    .logo-image {
                        height: 32px;
                    }

                    .language-toggle {
                        padding: 0.75rem 0.5rem;
                        font-size: 0.8rem;
                    }

                    .language-flag {
                        width: 16px;
                        height: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .header {
                        padding: 0.75rem;
                    }

                    .logo {
                        font-size: 1.125rem;
                    }

                    .logo-image {
                        height: 28px;
                        margin-right: 0.5rem;
                    }
                }
            </style>

            <header class="header">
                <div class="header-left">
                    <a href="index.html" class="logo">
                        <img src="SGLogo.svg" alt="SolarGroup" class="logo-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                        <span class="logo-fallback">SolarGroup</span>
                    </a>
                </div>

                <div class="header-right">
                    <!-- Language Switcher -->
                    <div class="language-switcher">
                        <button class="language-toggle" id="languageToggle">
                            <img src="https://flagcdn.com/w20/ru.png" alt="RU" class="language-flag" id="currentFlag">
                            <span id="currentLang">RU</span>
                            <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div class="language-dropdown" id="languageDropdown">
                            <a href="#" class="language-option active" data-lang="ru" data-flag="https://flagcdn.com/w20/ru.png">
                                <img src="https://flagcdn.com/w20/ru.png" alt="RU" class="language-flag">
                                <span>Русский</span>
                            </a>
                            <a href="#" class="language-option" data-lang="en" data-flag="https://flagcdn.com/w20/us.png">
                                <img src="https://flagcdn.com/w20/us.png" alt="EN" class="language-flag">
                                <span>English</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    connectedCallback() {
        this.initLanguageSwitcher();
    }

    initLanguageSwitcher() {
        const toggle = this.shadowRoot.getElementById('languageToggle');
        const dropdown = this.shadowRoot.getElementById('languageDropdown');
        const currentFlag = this.shadowRoot.getElementById('currentFlag');
        const currentLang = this.shadowRoot.getElementById('currentLang');
        const options = this.shadowRoot.querySelectorAll('.language-option');

        // Load saved language
        const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
        this.setLanguage(savedLang);

        // Toggle dropdown
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.shadowRoot.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Handle language selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.dataset.lang;
                const flag = option.dataset.flag;
                
                this.setLanguage(lang, flag);
                dropdown.classList.remove('show');
            });
        });
    }

    setLanguage(lang, flag) {
        const currentFlag = this.shadowRoot.getElementById('currentFlag');
        const currentLang = this.shadowRoot.getElementById('currentLang');
        const options = this.shadowRoot.querySelectorAll('.language-option');
        
        // Update current display
        if (flag) currentFlag.src = flag;
        currentLang.textContent = lang.toUpperCase();
        
        // Update active option
        options.forEach(option => {
            option.classList.toggle('active', option.dataset.lang === lang);
        });
        
        // Save to localStorage
        localStorage.setItem('selectedLanguage', lang);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
}

customElements.define('sg-header-landing', SgHeaderLanding);
