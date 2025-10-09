class NotificationSystem extends HTMLElement {
    constructor() {
        super();
        this.notifications = [];
        this.isVisible = false;
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['visible'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'visible') {
            this.isVisible = newValue === 'true';
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.integrateWithHeader();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    integrateWithHeader() {
        // Находим кнопку уведомлений в header
        const header = document.querySelector('sg-header');
        if (header) {
            const notificationBtn = header.shadowRoot.querySelector('.notification-btn');
            if (notificationBtn) {
                // Добавляем обработчик клика на кнопку в header
                notificationBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleNotificationsList();
                });
            }
        }
    }

    setupEventListeners() {
        // Обработчики для списка уведомлений
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-item')) {
                this.handleNotificationClick(e.target.dataset.notificationId);
            } else if (e.target.classList.contains('close-notification')) {
                this.closeNotification(e.target.dataset.notificationId);
            } else if (e.target.classList.contains('close-list')) {
                this.hideNotificationsList();
            }
        });

        // Обработчик клика вне области уведомлений
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                this.hideNotificationsList();
            }
        });
    }

    removeEventListeners() {
        document.removeEventListener('click', this.hideNotificationsList);
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now() + Math.random(),
            ...notification,
            created_at: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(newNotification);
        this.render();
        this.updateHeaderCounter();
        this.showToastNotification(newNotification);

        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            this.hideToastNotification(newNotification.id);
        }, 5000);
    }

    showToastNotification(notification) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.dataset.notificationId = notification.id;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">🔔</div>
                <div class="toast-text">
                    <div class="toast-title">${notification.title}</div>
                    <div class="toast-message">${notification.message}</div>
                </div>
                <button class="toast-close">&times;</button>
            </div>
        `;

        this.shadowRoot.querySelector('.toast-container').appendChild(toast);

        // Анимация появления
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Обработчик закрытия тоста
        toast.querySelector('.toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideToastNotification(notification.id);
        });

        // Обработчик клика на тост
        toast.addEventListener('click', () => {
            this.handleNotificationClick(notification.id);
        });
    }

    hideToastNotification(notificationId) {
        const toast = this.shadowRoot.querySelector(`[data-notification-id="${notificationId}"]`);
        if (toast) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    toggleNotificationsList() {
        this.isVisible = !this.isVisible;
        this.setAttribute('visible', this.isVisible);
        if (this.isVisible) {
            this.render(); // Перерисовываем список при открытии
        }
    }

    hideNotificationsList() {
        this.isVisible = false;
        this.setAttribute('visible', 'false');
    }

    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id == notificationId);
        if (notification && notification.action_url) {
            // Помечаем уведомление как прочитанное
            notification.read = true;
            this.render();
            this.updateHeaderCounter();
            
            // Переходим на страницу
            window.location.href = notification.action_url;
        }
    }

    closeNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id != notificationId);
        this.render();
        this.updateHeaderCounter();
    }

    updateHeaderCounter() {
        // Обновляем счетчик в header
        const header = document.querySelector('sg-header');
        if (header) {
            const counter = header.shadowRoot.querySelector('.notification-count');
            if (counter) {
                const unreadCount = this.getUnreadCount();
                counter.textContent = unreadCount;
                counter.style.display = unreadCount > 0 ? 'flex' : 'none';
            }
        }
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 1000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .toast-container {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 350px;
                    max-height: 400px;
                    overflow-y: auto;
                    z-index: 1001;
                }

                .toast-notification {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    margin-bottom: 10px;
                    cursor: pointer;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    border-left: 4px solid #007bff;
                }

                .toast-notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }

                .toast-notification.hide {
                    transform: translateX(100%);
                    opacity: 0;
                }

                .toast-content {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    gap: 12px;
                }

                .toast-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .toast-text {
                    flex: 1;
                    min-width: 0;
                }

                .toast-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 4px;
                    font-size: 14px;
                }

                .toast-message {
                    color: #666;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .toast-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .toast-close:hover {
                    color: #333;
                }

                .notifications-list {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 350px;
                    max-height: 400px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    transform: translateY(-10px);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                .notifications-list.visible {
                    transform: translateY(0);
                    opacity: 1;
                    visibility: visible;
                }

                .notifications-header {
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f8f9fa;
                }

                .notifications-title {
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                }

                .close-list {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .notifications-content {
                    max-height: 300px;
                    overflow-y: auto;
                }

                .notification-item {
                    padding: 15px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .notification-item:hover {
                    background: #f8f9fa;
                }

                .notification-item:last-child {
                    border-bottom: none;
                }

                .notification-item.unread {
                    background: #f0f8ff;
                    border-left: 3px solid #007bff;
                }

                .notification-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-item-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 4px;
                    font-size: 14px;
                }

                .notification-item-message {
                    color: #666;
                    font-size: 13px;
                    line-height: 1.4;
                    margin-bottom: 4px;
                }

                .notification-time {
                    color: #999;
                    font-size: 12px;
                }

                .close-notification {
                    background: none;
                    border: none;
                    font-size: 16px;
                    color: #ccc;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .close-notification:hover {
                    color: #999;
                }

                .empty-state {
                    padding: 30px 15px;
                    text-align: center;
                    color: #999;
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    :host {
                        top: 10px;
                        right: 10px;
                    }

                    .toast-container,
                    .notifications-list {
                        width: calc(100vw - 20px);
                        right: -10px;
                    }
                }
            </style>

            <div class="toast-container"></div>

            <div class="notifications-list ${this.isVisible ? 'visible' : ''}">
                <div class="notifications-header">
                    <h3 class="notifications-title">Уведомления</h3>
                    <button class="close-list">&times;</button>
                </div>
                <div class="notifications-content">
                    ${this.notifications.length === 0 ? 
                        '<div class="empty-state">Нет уведомлений</div>' :
                        this.notifications.map(notification => `
                            <div class="notification-item ${!notification.read ? 'unread' : ''}" 
                                 data-notification-id="${notification.id}">
                                <div class="notification-icon">🔔</div>
                                <div class="notification-content">
                                    <div class="notification-item-title">${notification.title}</div>
                                    <div class="notification-item-message">${notification.message}</div>
                                    <div class="notification-time">${this.formatTime(notification.created_at)}</div>
                                </div>
                                <button class="close-notification" data-notification-id="${notification.id}">&times;</button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // меньше минуты
            return 'только что';
        } else if (diff < 3600000) { // меньше часа
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин. назад`;
        } else if (diff < 86400000) { // меньше дня
            const hours = Math.floor(diff / 3600000);
            return `${hours} ч. назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}

customElements.define('notification-system', NotificationSystem);
