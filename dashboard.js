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

    // --- Балансы из API ---
    const mainBalanceEl = document.getElementById('main-balance');
    const partnerBalanceEl = document.getElementById('partner-balance');
    
    console.log('Balance elements found:', {
        mainBalanceEl: !!mainBalanceEl,
        partnerBalanceEl: !!partnerBalanceEl,
        mainBalanceElId: mainBalanceEl?.id,
        partnerBalanceElId: partnerBalanceEl?.id
    });

    async function loadDashboardBalances() {
        try {
            console.log('Loading dashboard balances...');
            const res = await fetch('/api/wallet/1');
            console.log('Dashboard wallet response status:', res.status);
            if (!res.ok) {
                console.log('Dashboard wallet response not ok:', res.status);
                return;
            }
            const w = await res.json();
            console.log('Dashboard wallet data:', w);
            
            if (mainBalanceEl) {
                const newText = `${Number(w.main_balance).toFixed(2)} $`;
                mainBalanceEl.textContent = newText;
                console.log('Updated main balance to:', newText);
            } else {
                console.log('mainBalanceEl not found!');
            }
            
            if (partnerBalanceEl) {
                const newText = `${Number(w.partner_balance || 0).toFixed(2)} $`;
                partnerBalanceEl.textContent = newText;
                console.log('Updated partner balance to:', newText);
            } else {
                console.log('partnerBalanceEl not found!');
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
});
