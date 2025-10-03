// Language Switcher functionality
document.addEventListener('DOMContentLoaded', function() {
    function initLanguageSwitcher() {
        const languageToggle = document.getElementById('languageToggle');
        const languageDropdown = document.getElementById('languageDropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (!languageToggle || !languageDropdown) {
            console.log('Language switcher elements not found');
            return;
        }

        // Текущий язык (по умолчанию русский)
        let currentLang = 'ru';

        // Обработчик клика по кнопке переключателя
        languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
            languageToggle.classList.toggle('active');
        });

        // Обработчики клика по опциям языка
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = option.dataset.lang;
                
                if (selectedLang !== currentLang) {
                    // Обновляем текущий язык
                    currentLang = selectedLang;
                    
                    // Обновляем кнопку переключателя
                    const flagIcon = languageToggle.querySelector('.flag-icon');
                    const langText = languageToggle.querySelector('.lang-text');
                    
                    if (selectedLang === 'ru') {
                        flagIcon.textContent = '🇷🇺';
                        langText.textContent = 'RU';
                    } else if (selectedLang === 'en') {
                        flagIcon.textContent = '🇺🇸';
                        langText.textContent = 'EN';
                    }
                    
                    // Обновляем выделение в выпадающем меню
                    languageOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    
                    // Закрываем выпадающее меню
                    languageDropdown.classList.remove('show');
                    languageToggle.classList.remove('active');
                    
                    // Здесь можно добавить логику смены языка
                    console.log('Language changed to:', selectedLang);
                    
                    // Сохраняем выбор в localStorage
                    localStorage.setItem('selectedLanguage', selectedLang);
                } else {
                    // Если выбран тот же язык, просто закрываем меню
                    languageDropdown.classList.remove('show');
                    languageToggle.classList.remove('active');
                }
            });
        });

        // Закрытие выпадающего меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!languageToggle.contains(e.target) && !languageDropdown.contains(e.target)) {
                languageDropdown.classList.remove('show');
                languageToggle.classList.remove('active');
            }
        });

        // Загрузка сохраненного языка
        const savedLang = localStorage.getItem('selectedLanguage');
        if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
            currentLang = savedLang;
            
            // Обновляем интерфейс
            const flagIcon = languageToggle.querySelector('.flag-icon');
            const langText = languageToggle.querySelector('.lang-text');
            
            if (currentLang === 'ru') {
                flagIcon.textContent = '🇷🇺';
                langText.textContent = 'RU';
            } else if (currentLang === 'en') {
                flagIcon.textContent = '🇺🇸';
                langText.textContent = 'EN';
            }
            
            // Выделяем текущий язык в выпадающем меню
            languageOptions.forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.lang === currentLang) {
                    opt.classList.add('selected');
                }
            });
        }

        console.log('Language switcher initialized');
    }

    // Инициализируем переключатель языков
    initLanguageSwitcher();
});
