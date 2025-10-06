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

    // --- Слайдер баннеров ---
    initBannerSlider();

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
            const mockWalletData = {
                main_balance: 1250.75,
                partner_balance: 850.25
            };
            
            console.log('Using mock wallet data:', mockWalletData);
            
            if (mainAccountCard) {
                mainAccountCard.updateBalance(Number(mockWalletData.main_balance).toFixed(2));
                console.log('Updated main balance to:', Number(mockWalletData.main_balance).toFixed(2));
            } else {
                console.log('Main account card not found');
            }
            
            if (partnerAccountCard) {
                partnerAccountCard.updateBalance(Number(mockWalletData.partner_balance).toFixed(2));
                console.log('Updated partner balance to:', Number(mockWalletData.partner_balance).toFixed(2));
            } else {
                console.log('Partner account card not found');
            }
            
            console.log('Dashboard balances updated');
        } catch (e) { 
            console.error('Error loading dashboard balances:', e); 
        }
    }

    loadDashboardBalances();

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

    // --- Функция инициализации слайдера баннеров ---
    function initBannerSlider() {
        const sliderTrack = document.getElementById('slider-track');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const dots = document.querySelectorAll('.dot');
        
        if (!sliderTrack || !prevBtn || !nextBtn) {
            console.log('Slider elements not found, skipping slider initialization');
            return;
        }

        let currentSlide = 0;
        const totalSlides = document.querySelectorAll('.banner-slide').length;

        function updateSlider() {
            const translateX = -currentSlide * 100;
            sliderTrack.style.transform = `translateX(${translateX}%)`;
            
            // Обновляем активные точки
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
            
            // Обновляем состояние кнопок
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;
        }

        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlider();
            }
        }

        function prevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider();
            }
        }

        function goToSlide(slideIndex) {
            if (slideIndex >= 0 && slideIndex < totalSlides) {
                currentSlide = slideIndex;
                updateSlider();
            }
        }

        // Обработчики событий
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Автоматическое переключение каждые 5 секунд
        setInterval(() => {
            nextSlide();
            if (currentSlide === 0) {
                // Если дошли до конца, возвращаемся к началу
                currentSlide = totalSlides - 1;
                updateSlider();
            }
        }, 5000);

        // Инициализация
        updateSlider();
        
        console.log('Banner slider initialized with', totalSlides, 'slides');
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
