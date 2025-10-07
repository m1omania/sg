document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('email-form');
    const codeForm = document.getElementById('code-form');
    const userEmailSpan = document.getElementById('user-email');
    const resendCodeLink = document.getElementById('resend-code');
    const successNotification = document.getElementById('success-notification');
    const errorNotification = document.getElementById('error-notification');
    
    let userEmail = '';
    
    // Обработчик отправки email
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        userEmail = document.getElementById('email').value;
        
        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: userEmail })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Показываем второй шаг
                userEmailSpan.textContent = userEmail;
                emailForm.classList.add('hidden');
                codeForm.classList.remove('hidden');
                
                showSuccess('Код подтверждения отправлен на ' + userEmail);
            } else {
                showError(data.error || 'Ошибка отправки кода');
            }
        } catch (error) {
            console.error('Send verification error:', error);
            showError('Ошибка сети. Попробуйте позже.');
        }
    });
    
    // Обработчик подтверждения кода
    codeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = document.getElementById('verification-code').value;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: userEmail, 
                    code: code 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('Регистрация успешна! Перенаправляем...');
                
                // Сохраняем токен и переходим на главную
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
            } else {
                showError(data.error || 'Неверный код подтверждения');
            }
        } catch (error) {
            console.error('Verify code error:', error);
            showError('Ошибка сети. Попробуйте позже.');
        }
    });
    
    // Обработчик повторной отправки кода
    resendCodeLink.addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: userEmail })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('Код подтверждения отправлен повторно');
            } else {
                showError(data.error || 'Ошибка отправки кода');
            }
        } catch (error) {
            console.error('Resend code error:', error);
            showError('Ошибка сети. Попробуйте позже.');
        }
    });
    
    // Функции уведомлений
    function showSuccess(message) {
        const notificationText = document.getElementById('notification-text');
        notificationText.textContent = message;
        successNotification.classList.remove('hidden');
        
        setTimeout(() => {
            successNotification.classList.add('hidden');
        }, 5000);
    }
    
    function showError(message) {
        const errorText = document.getElementById('error-text');
        errorText.textContent = message;
        errorNotification.classList.remove('hidden');
        
        setTimeout(() => {
            errorNotification.classList.add('hidden');
        }, 5000);
    }
    
    // Закрытие уведомлений
    document.querySelectorAll('.notification-close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.notification').classList.add('hidden');
        });
    });
});
