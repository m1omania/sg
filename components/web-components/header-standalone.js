// Standalone Web Component for Header (no modules)
class SGHeader extends HTMLElement {
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

                .header__logo {
                    display: flex;
                    align-items: center;
                }

                .logo-link {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    color: inherit;
                }

                .logo-image {
                    height: 40px;
                    width: auto;
                }

                .logo-mobile {
                    display: none;
                }

                .logo-fallback {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #3b82f6;
                }

                .header__controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .language-switcher {
                    position: relative;
                }

                .language-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }

                .language-toggle:hover {
                    background: #e2e8f0;
                    border-color: #cbd5e1;
                    color: #1e293b;
                }

                .language-toggle.active {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                }

                .language-toggle.active .dropdown-arrow {
                    color: white;
                    transform: rotate(180deg);
                }

                .dropdown-arrow {
                    transition: transform 0.2s, color 0.2s;
                }

                .language-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    min-width: 150px;
                    z-index: 1001;
                    display: none;
                    margin-top: 0.25rem;
                }

                .language-dropdown.show {
                    display: block;
                }

                .language-option {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-size: 0.875rem;
                }

                .language-option:hover {
                    background: #f1f5f9;
                }

                .notification-btn, .reset-btn {
                    position: relative;
                    padding: 0.5rem;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-left: 0.5rem;
                }

                .notification-btn:hover, .reset-btn:hover {
                    background: #e2e8f0;
                    border-color: #cbd5e1;
                }

                .reset-btn {
                    background: #fef2f2;
                    border-color: #fecaca;
                    color: #dc2626;
                }

                .reset-btn:hover {
                    background: #fee2e2;
                    border-color: #fca5a5;
                    color: #b91c1c;
                }

                .notification-count {
                    position: absolute;
                    top: -0.25rem;
                    right: -0.25rem;
                    background: #ef4444;
                    color: white;
                    border-radius: 50%;
                    width: 1.25rem;
                    height: 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .user-dropdown {
                    position: relative;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .user-profile:hover {
                    background: #e2e8f0;
                    border-color: #cbd5e1;
                }

                .user-avatar {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    background: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .user-name {
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    min-width: 200px;
                    z-index: 1001;
                    display: none;
                    margin-top: 0.25rem;
                }

                .dropdown-menu.show {
                    display: block;
                }

                .dropdown-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    text-decoration: none;
                    color: #374151;
                    transition: background-color 0.2s;
                    font-size: 0.875rem;
                }

                .dropdown-menu-item:hover {
                    background: #f1f5f9;
                }

                .dropdown-menu-divider {
                    height: 1px;
                    background: #e5e7eb;
                    margin: 0.5rem 0;
                }

                .dropdown-menu-item-icon {
                    font-size: 1rem;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .header {
                        padding: 1rem;
                    }

                    .logo-desktop {
                        display: none;
                    }

                    .logo-mobile {
                        display: block;
                    }

                    .header__controls {
                        gap: 0.5rem;
                    }

                    .language-toggle {
                        padding: 0.75rem 0.5rem;
                    }

                    .user-name {
                        display: none;
                    }
                }
            </style>

            <header class="header">
                <div class="header__logo">
                    <a href="index.html" class="logo-link">
                        <img src="SGLogo.svg" alt="SolarGroup" class="logo-image logo-desktop" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <img src="SGLogosmall.svg" alt="SolarGroup" class="logo-image logo-mobile" onerror="this.style.display='none'; this.previousElementSibling.style.display='block';">
                        <span class="logo logo-fallback" style="display: none;">SolarGroup</span>
                    </a>
                </div>
                <div class="header__controls">
                    <div class="language-switcher">
                        <button class="language-toggle" id="languageToggle">
                            <span class="flag-icon">🇷🇺</span>
                            <span class="lang-text">RU</span>
                            <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div class="language-dropdown" id="languageDropdown">
                            <div class="language-option" data-lang="ru">
                                <span class="flag-icon">🇷🇺</span>
                                <span class="lang-text">Русский</span>
                            </div>
                            <div class="language-option" data-lang="en">
                                <span class="flag-icon">🇺🇸</span>
                                <span class="lang-text">English</span>
                            </div>
                        </div>
                    </div>
                    <button class="notification-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span class="notification-count">2</span>
                    </button>
                    <button class="reset-btn" id="resetDataBtn" title="Сбросить все данные (для разработки)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M3 21v-5h5"></path>
                        </svg>
                    </button>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="user-profile">
                            <div class="user-avatar">К</div>
                            <span class="user-name">Константин</span>
                            <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <div class="dropdown-menu">
                            <a href="#" class="dropdown-menu-item">
                                <span class="dropdown-menu-item-icon">👤</span>
                                Профиль
                            </a>
                            <a href="#" class="dropdown-menu-item">
                                <span class="dropdown-menu-item-icon">⚙️</span>
                                Настройки
                            </a>
                            <a href="#" class="dropdown-menu-item">
                                <span class="dropdown-menu-item-icon">📄</span>
                                Документы
                            </a>
                            <div class="dropdown-menu-divider"></div>
                            <a href="#" class="dropdown-menu-item" id="logoutBtn">
                                <span class="dropdown-menu-item-icon">🚪</span>
                                Выйти
                            </a>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    attachEventListeners() {
        // Language switcher
        const languageToggle = this.shadowRoot.getElementById('languageToggle');
        const languageDropdown = this.shadowRoot.getElementById('languageDropdown');
        const languageOptions = this.shadowRoot.querySelectorAll('.language-option');

        languageToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown?.classList.toggle('show');
            languageToggle?.classList.toggle('active');
        });

        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;
                this.switchLanguage(lang);
                languageDropdown?.classList.remove('show');
                languageToggle?.classList.remove('active');
            });
        });

        // User dropdown
        const userDropdown = this.shadowRoot.getElementById('userDropdown');
        const userProfile = userDropdown?.querySelector('.user-profile');
        const dropdownMenu = userDropdown?.querySelector('.dropdown-menu');
        const logoutBtn = this.shadowRoot.getElementById('logoutBtn');

        userProfile?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu?.classList.toggle('show');
        });

        logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleLogout();
        });

        // Reset data button
        const resetDataBtn = this.shadowRoot.getElementById('resetDataBtn');
        resetDataBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.resetAllData();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            languageDropdown?.classList.remove('show');
            languageToggle?.classList.remove('active');
            dropdownMenu?.classList.remove('show');
        });
    }

    switchLanguage(lang) {
        // Load saved language or default to Russian
        const savedLang = localStorage.getItem('language') || 'ru';
        const currentLang = lang || savedLang;
        
        // Update UI
        const flagIcon = this.shadowRoot.querySelector('.flag-icon');
        const langText = this.shadowRoot.querySelector('.lang-text');
        
        if (currentLang === 'en') {
            flagIcon.textContent = '🇺🇸';
            langText.textContent = 'EN';
        } else {
            flagIcon.textContent = '🇷🇺';
            langText.textContent = 'RU';
        }
        
        // Save to localStorage
        localStorage.setItem('language', currentLang);
        
        // Dispatch custom event for other components
        this.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: currentLang },
            bubbles: true
        }));
    }

    handleLogout() {
        // Dispatch custom event for logout
        this.dispatchEvent(new CustomEvent('logout', {
            detail: { action: 'logout' },
            bubbles: true
        }));
        
        // Redirect to landing page
        window.location.href = 'landing.html';
    }

    async resetAllData() {
        if (confirm('⚠️ Сбросить все данные?\n\nЭто действие удалит:\n• Все купоны\n• Баланс пользователя\n• Историю транзакций\n• Настройки\n\nДанные будут восстановлены к исходному состоянию.')) {
            try {
                // Clear localStorage
                localStorage.clear();
                
                // Clear sessionStorage
                sessionStorage.clear();
                
                // Reset API data if available
                if (window.localStorageAPI) {
                    window.localStorageAPI.clearAllData();
                }
                
                // Reset API server data
                try {
                    const response = await fetch('http://localhost:3001/api/reset', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        console.log('✅ API server data reset successfully');
                    } else {
                        console.warn('⚠️ API server reset failed, but continuing...');
                    }
                } catch (apiError) {
                    console.warn('⚠️ Could not reset API server:', apiError.message);
                }
                
                // Show success message
                alert('✅ Все данные сброшены!\n\nСтраница будет перезагружена.');
                
                // Reload page to reset everything
                window.location.reload();
                
            } catch (error) {
                console.error('Error resetting data:', error);
                alert('❌ Ошибка при сбросе данных:\n' + error.message);
            }
        }
    }

    connectedCallback() {
        // Initialize language on component mount
        this.switchLanguage();
    }
}

// Register the custom element
customElements.define('sg-header', SGHeader);
