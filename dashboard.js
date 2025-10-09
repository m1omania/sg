// Dashboard page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded, initializing...');
    
    // --- Таймеры ---
    const streamEndDate = new Date();
    streamEndDate.setHours(streamEndDate.getHours() + 2);
    startCountdown('timer-hunting', streamEndDate.getTime());

    const raceEndDate = new Date();
    raceEndDate.setDate(raceEndDate.getDate() + 33);
    raceEndDate.setHours(raceEndDate.getHours() + 11);
    raceEndDate.setMinutes(raceEndDate.getMinutes() + 34);
    startCountdown('timer-race', raceEndDate.getTime());

    const streamEndDate2 = new Date();
    streamEndDate2.setHours(streamEndDate2.getHours() + 2);
    startCountdown('timer-stream', streamEndDate2.getTime());

    // --- Промо карточки ---
    initPromoCards();

    // --- Переключатель языка ---
    initLanguageSwitcher();

    // --- Балансы из API ---
    const mainAccountCard = document.querySelector('account-card[type="main"]');
    const partnerAccountCard = document.querySelector('account-card[type="partner"]');
    
    console.log('Account card components found:', {
        mainAccountCard: !!mainAccountCard,
        partnerAccountCard: !!partnerAccountCard
    });

    async function loadDashboardBalances() {
        try {
            console.log('Loading dashboard balances...');
            
            // Mock data for local testing
            // Load real wallet data from API
            try {
                const response = await fetch('/api/wallet/1');
                const walletData = await response.json();
                
                console.log('Loaded wallet data:', walletData);
                
                if (mainAccountCard) {
                    mainAccountCard.updateBalance(Number(walletData.main_balance).toFixed(2));
                    console.log('Updated main balance to:', Number(walletData.main_balance).toFixed(2));
                } else {
                    console.log('Main account card not found');
                }
                
                if (partnerAccountCard) {
                    partnerAccountCard.updateBalance(Number(walletData.partner_balance).toFixed(2));
                    console.log('Updated partner balance to:', Number(walletData.partner_balance).toFixed(2));
                } else {
                    console.log('Partner account card not found');
                }
            } catch (error) {
                console.error('Error loading wallet data:', error);
                // Keep loading state if API fails
            }
            
            console.log('Dashboard balances updated');
        } catch (e) { 
            console.error('Error loading dashboard balances:', e); 
        }
    }

    loadDashboardBalances();

    // --- Показ уведомления о купоне за регистрацию ---
    function showRegistrationCouponNotification() {
        // Проверяем, показывали ли уже уведомление
        if (localStorage.getItem('registrationCouponShown') === 'true') {
            return;
        }
        
        const notificationSystem = document.querySelector('notification-system');
        if (notificationSystem) {
            notificationSystem.addNotification({
                title: 'У вас есть новый купон!',
                message: 'Вам доступен купон на $25 за регистрацию',
                action_url: '/coupons.html'
            });
            
            // Помечаем, что уведомление показано
            localStorage.setItem('registrationCouponShown', 'true');
        }
    }
    
    // Показываем уведомление при загрузке
    setTimeout(showRegistrationCouponNotification, 1000);

    // --- Переключение валют ---
    const currencyButtons = document.querySelectorAll('.currency-switcher button');

    const balances = {
        main: { USD: 0, EUR: 0, GBP: 0 },
        partner: { USD: 0, EUR: 0, GBP: 0 }
    };

    currencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currency = button.dataset.currency;
            const symbols = { USD: '$', EUR: '€', GBP: '£' };
            
            // Обновляем активную кнопку
            currencyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Обновляем отображение валют
            document.querySelectorAll('.account-summary__badge').forEach(badge => {
                if (badge.textContent === 'USD' || badge.textContent === 'EUR' || badge.textContent === 'GBP') {
                    badge.textContent = currency;
                }
            });
            
            // Обновляем символы валют
            document.querySelectorAll('.account-summary__amount').forEach(amount => {
                const currentText = amount.textContent;
                const value = currentText.replace(/[$€£]/g, '').trim();
                amount.textContent = `${value} ${symbols[currency]}`;
            });
        });
    });

    // --- Функция обратного отсчета ---
    function startCountdown(elementId, endTime) {
        const element = document.getElementById(elementId);
        if (!element) return;

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                element.textContent = "Завершено";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let timeString = "";
            if (days > 0) timeString += `${days}д `;
            if (hours > 0) timeString += `${hours}ч `;
            if (minutes > 0) timeString += `${minutes}м `;
            timeString += `${seconds}с`;

            element.textContent = timeString;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // --- Функция инициализации промо карточек ---
    function initPromoCards() {
        // Инициализируем таймеры для карточек
        const promoTimers = [
            'promo-timer-0', // Новогодний бонус
            'promo-timer-1', // Чёрная пятница
            'promo-timer-2', // Прямой эфир
            'promo-timer-3'  // Гонка инвестиций
        ];

        // Устанавливаем разные даты окончания для разных таймеров
        const timerDates = [
            new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 часа
            new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 часа
            new Date(Date.now() + 3 * 60 * 60 * 1000), // +3 часа
            new Date(Date.now() + 33 * 24 * 60 * 60 * 1000) // +33 дня
        ];

        promoTimers.forEach((timerId, index) => {
            const timerElement = document.getElementById(timerId);
            if (timerElement && timerDates[index]) {
                startCountdown(timerId, timerDates[index].getTime());
            }
        });

        // Инициализируем горизонтальный скролл с поддержкой свайпов
        initHorizontalScroll();

        console.log('Promo cards initialized with', promoTimers.length, 'timers');
    }

    // --- Функция инициализации горизонтального скролла ---
    function initHorizontalScroll() {
        const scrollContainer = document.querySelector('.promo-cards-grid');
        const scrollLeft = document.getElementById('scroll-left');
        const scrollRight = document.getElementById('scroll-right');
        
        if (!scrollContainer) return;

        // Переменные для drag & drop удалены

        // Функция обновления индикаторов скролла
        function updateScrollIndicators() {
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            const currentScroll = scrollContainer.scrollLeft;
            
            if (scrollLeft) {
                scrollLeft.classList.toggle('show', currentScroll > 0);
            }
            if (scrollRight) {
                scrollRight.classList.toggle('show', currentScroll < maxScroll - 1);
            }
        }

        // Обработчики для кнопок скролла
        if (scrollLeft) {
            scrollLeft.addEventListener('click', () => {
                const cardWidth = scrollContainer.querySelector('.promo-card')?.offsetWidth || 320;
                const scrollAmount = cardWidth + 20; // + gap
                scrollContainer.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });
        }

        if (scrollRight) {
            scrollRight.addEventListener('click', () => {
                const cardWidth = scrollContainer.querySelector('.promo-card')?.offsetWidth || 320;
                const scrollAmount = cardWidth + 20; // + gap
                scrollContainer.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
        }

        // Убираем drag & drop для мыши - оставляем только кнопки навигации

        // Обработчики для тач-событий (свайпы)
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouchScrolling = false;

        scrollContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isTouchScrolling = true;
        });

        scrollContainer.addEventListener('touchmove', (e) => {
            if (!isTouchScrolling) return;
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const diffX = touchStartX - touchX;
            const diffY = touchStartY - touchY;
            
            // Проверяем, что это горизонтальный свайп
            if (Math.abs(diffX) > Math.abs(diffY)) {
                e.preventDefault();
                scrollContainer.scrollLeft += diffX;
                touchStartX = touchX;
            }
        });

        scrollContainer.addEventListener('touchend', () => {
            isTouchScrolling = false;
        });

        // Обновление индикаторов при скролле
        scrollContainer.addEventListener('scroll', updateScrollIndicators);

        // Плавный скролл при клике на карточки убран - карточки теперь ссылки

        // Курсор grab убран - drag & drop отключен
        
        // Показываем индикаторы при наведении
        scrollContainer.addEventListener('mouseenter', () => {
            updateScrollIndicators();
        });

        // Инициализируем индикаторы
        updateScrollIndicators();
    }

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
});
