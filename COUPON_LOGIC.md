# 🎫 Логика использования купонов

## 📋 Обзор системы

Система купонов позволяет пользователям применять скидки при покупке инвестиционных пакетов. Купоны могут быть привязаны к конкретным проектам или быть универсальными.

## 🔄 Логика использования купонов

### 1. Типы купонов

#### **Универсальные купоны**
- **Проект**: `'Все проекты'`
- **Применение**: ко всем пакетам
- **Навигация**: переход на `/invest.html`
- **Пример**: `WELCOME25` - $25 скидка для новых пользователей

#### **Проектные купоны**
- **Проект**: конкретный проект (например, `'Дирижабли'`, `'Совэлмаш'`)
- **Применение**: только к пакетам этого проекта
- **Навигация**: переход на `/packages.html?project=...`
- **Пример**: `INVEST50` - $50 скидка для проекта "Дирижабли"

### 2. Жизненный цикл купона

#### **Создание**
```javascript
// Купон создается в базе данных с полями:
{
    used: false,
    created_at: '2025-01-01T00:00:00.000Z',
    expires_at: '2025-12-31T23:59:59.000Z'
}
```

#### **Отображение**
```javascript
// Купон отображается в списке активных, если:
// - used: false
// - expires_at > current_date
// - project_name соответствует текущему проекту или 'Все проекты'
```

#### **Использование (навигация)**
```javascript
// При нажатии "Использовать" в кошельке:

// Для купонов конкретных проектов:
// 1. Купон сохраняется в sessionStorage
// 2. Происходит прямой переход на страницу пакетов проекта
// 3. Купон НЕ помечается как использованный

// Для купонов "Все проекты":
// 1. Показывается модальное окно выбора проекта
// 2. Пользователь выбирает проект (Дирижабли или Совэлмаш)
// 3. Купон сохраняется в sessionStorage
// 4. Происходит переход на страницу пакетов выбранного проекта
// 5. Купон НЕ помечается как использованный
```

#### **Использование (применение)**
```javascript
// При оформлении пакета:
// 1. used: true (в оригинальном купоне)
// 2. updated_at: current_timestamp
// 3. Создается КОПИЯ купона в used_coupons с used: true
// 4. Купон исчезает из активных
// 5. В истории отображается копия с оверлеем "ИСПОЛЬЗОВАН"
```

#### **Истечение срока**
```javascript
// Автоматически при проверке:
// 1. expires_at < current_timestamp
// 2. status: 'expired'
// 3. Перемещается в историю
// 4. Отображается с оверлеем "ИСТЁК"
```

#### **Отзыв купона**
```javascript
// Администратором:
// 1. status: 'revoked'
// 2. Перемещается в историю
// 3. Отображается с оверлеем "ОТОЗВАН"
```

#### **Автоматическая инициализация специальных купонов**
```javascript
// При первом запуске системы:
// 1. Проверяется наличие купонов с ID 4 и 5
// 2. Если их нет - добавляются в used_coupons
// 3. Купон 4: status: 'expired' (истекший)
// 4. Купон 5: status: 'revoked' (отозванный)
// 5. Предотвращение дублирования при перезагрузке

// Логика проверки существования:
const hasExpiredCoupon = this.data.used_coupons.some(c => c.id === 4);
const hasRevokedCoupon = this.data.used_coupons.some(c => c.id === 5);

// Добавление только при отсутствии:
if (!hasExpiredCoupon) { /* добавляем истекший */ }
if (!hasRevokedCoupon) { /* добавляем отозванный */ }

// Особенности инициализации:
// - Проверка по ID предотвращает дублирование
// - Купоны добавляются только при первом запуске
// - Данные сохраняются в localStorage
// - При перезагрузке страницы купоны не дублируются
```

#### **Специальные статусы купонов**
```javascript
// Истекший купон:
{
    status: 'expired',
    used: false,
    expires_at: '2024-12-31T23:59:59.000Z' // Прошлая дата
}

// Отозванный купон:
{
    status: 'revoked',
    used: false,
    expires_at: '2025-06-30T23:59:59.000Z' // Будущая дата
}

// Использованный купон:
{
    used: true,
    status: undefined // или 'used'
}
```

## 🎯 Сценарии использования

### **Сценарий 1: Покупка пакета с купонами**

1. **Страница оформления** (`checkout.html`)
   - Загружаются активные купоны для проекта
   - Пользователь может выбрать только ОДИН купон
   - При выборе нового купона предыдущий автоматически отключается
   - Рассчитывается скидка в реальном времени

2. **Оформление пакета**
   - Выбранный купон помечается как `used: true`
   - Создается запись об инвестиции
   - Обновляется интерфейс

3. **Результат**
   - Купон исчезает из активных
   - Появляется в истории использованных

### **Сценарий 2: Использование купона с кошелька**

1. **Страница кошелька** (`wallet.html`)
   - Отображаются активные купоны
   - Пользователь нажимает "Использовать"

2. **Навигация**
   - Купон сохраняется в `sessionStorage`
   - Происходит переход на релевантную страницу
   - Купон НЕ помечается как использованный

3. **Страница пакетов** (`packages.html`)
   - Пользователь выбирает пакет
   - Переходит на страницу оформления

4. **Страница оформления** (`checkout.html`)
   - Проверяется `sessionStorage` на наличие выбранного купона
   - Если купон релевантен - отображается
   - `sessionStorage` очищается

5. **Оформление пакета**
   - Купон применяется и помечается как `used: true`

### **Сценарий 3: Использование купона "Все проекты" с модальным окном**

1. **Страница кошелька/купонов** (`wallet.html` или `coupons.html`)
   - Пользователь видит купон с `project_name: 'Все проекты'`
   - Нажимает кнопку "Использовать"

2. **Модальное окно выбора проекта**
   - Показывается модальное окно с двумя проектами
   - Дирижабли 🚁 - инновационные летательные аппараты
   - Совэлмаш 🏭 - промышленное оборудование
   - Пользователь выбирает нужный проект

3. **Навигация**
   - Купон сохраняется в `sessionStorage`
   - Происходит переход на страницу пакетов выбранного проекта
   - Купон НЕ помечается как использованный

4. **Страница пакетов** (`packages.html`)
   - Пользователь выбирает пакет из выбранного проекта
   - Переходит на страницу оформления

5. **Страница оформления** (`checkout.html`)
   - Проверяется `sessionStorage` на наличие выбранного купона
   - Если купон релевантен - отображается
   - `sessionStorage` очищается

6. **Оформление пакета**
   - Купон применяется и помечается как `used: true`

### **Сценарий 4: Просмотр истории купонов**

1. **Страница купонов** (`coupons.html`)
   - Клик на вкладку "История"
   - Отображаются использованные, истекшие и отозванные купоны
   - Статусы: "ИСПОЛЬЗОВАН", "ИСТЁК", "ОТОЗВАН"
   - Кнопки неактивны для всех купонов в истории

2. **Типы купонов в истории**
   - **Использованные**: `used: true` - купоны, примененные при оформлении
   - **Истекшие**: `status: 'expired'` - купоны с истекшей датой
   - **Отозванные**: `status: 'revoked'` - купоны, отозванные администрацией

3. **Автоматическая инициализация**
   - При первом запуске системы добавляются тестовые купоны
   - Купон 4: "Истекший купон" с `status: 'expired'`
   - Купон 5: "Отозванный купон" с `status: 'revoked'`
   - Предотвращение дублирования при перезагрузке страницы

4. **Отображение статусов**
   - **Использованные**: оверлей "ИСПОЛЬЗОВАН" с диагональным поворотом
   - **Истекшие**: оверлей "ИСТЁК" с диагональным поворотом
   - **Отозванные**: оверлей "ОТОЗВАН" с диагональным поворотом
   - **Адаптивность**: размеры оверлеев уменьшаются на мобильных устройствах

## 🔧 Техническая реализация

### **1. Сохранение выбранного купона (wallet.js)**

```javascript
// Global function for coupon usage (same as other pages)
window.useCoupon = async function(couponId) {
    console.log('Use coupon from wallet:', couponId);
    
    try {
        // First, get the coupon data before using it
        const couponResponse = await fetch('/api/coupons/active/1');
        const couponResult = await couponResponse.json();
        const activeCoupons = Array.isArray(couponResult) ? couponResult : (couponResult.data || []);
        
        const coupon = activeCoupons.find(c => c.id === couponId);
        if (!coupon) {
            alert('Купон не найден');
            return;
        }
        
        console.log('Coupon found:', coupon.name);
        
        // Store coupon in sessionStorage for checkout page
        sessionStorage.setItem('selectedCoupon', JSON.stringify(coupon));
        console.log('Coupon stored in sessionStorage for checkout');
        
        // Navigate based on coupon type using original coupon data
        if (coupon.project_name === 'Любой' || coupon.project_name === 'Все проекты') {
            // General coupon - go to invest page
            window.location.href = '/invest.html';
        } else {
            // Specific project coupon - go to packages page
            const projectUrl = getProjectUrl(coupon.project_name);
            console.log('Redirecting to:', projectUrl);
            window.location.href = projectUrl;
        }
    } catch (error) {
        console.error('Error using coupon:', error);
        alert('Ошибка при использовании купона');
    }
};
```

### **2. Отображение выбранного купона (checkout.js)**

```javascript
// Initialize coupon package component
async function initializeCouponPackage(package) {
    console.log('Initializing coupon package component...');
    
    const couponsListElement = document.getElementById('coupons-list');
    if (!couponsListElement) {
        console.warn('Coupons list element not found');
        return;
    }
    
    try {
        // Check if there's a selected coupon from sessionStorage
        const selectedCoupon = sessionStorage.getItem('selectedCoupon');
        if (selectedCoupon) {
            console.log('Selected coupon found in sessionStorage:', selectedCoupon);
            const coupon = JSON.parse(selectedCoupon);
            
            // Check if the selected coupon is relevant to this project
            if (coupon.project_name === package.project || coupon.project_name === 'Все проекты') {
                console.log('Selected coupon is relevant, rendering it');
                renderCouponsList([coupon]);
                
                // Clear sessionStorage after using
                sessionStorage.removeItem('selectedCoupon');
                return;
            } else {
                console.log('Selected coupon is not relevant to this project');
                // Clear sessionStorage if coupon is not relevant
                sessionStorage.removeItem('selectedCoupon');
            }
        }
        
        // Load available coupons for this project
        const response = await fetch('/api/coupons/active/1');
        const result = await response.json();
        
        // Handle both direct array and object with data property
        const coupons = Array.isArray(result) ? result : (result.data || []);
        
        console.log('Available coupons:', coupons);
        
        // Filter coupons for this project or general coupons and sort by expiry date
        const relevantCoupons = coupons
            .filter(coupon => 
                coupon.project_name === package.project || 
                coupon.project_name === 'Все проекты'
            )
            .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
        
        console.log('Relevant coupons for', package.project, ':', relevantCoupons);
        
        if (relevantCoupons.length > 0) {
            // Render all relevant coupons
            renderCouponsList(relevantCoupons);
            console.log('Coupons rendered:', relevantCoupons.length);
        } else {
            console.log('No relevant coupons found for project:', package.project);
            // Hide coupon section if no coupons available
            const couponSection = document.querySelector('.coupon-section');
            if (couponSection) {
                couponSection.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error loading coupons:', error);
        // Hide coupon section on error
        const couponSection = document.querySelector('.coupon-section');
        if (couponSection) {
            couponSection.style.display = 'none';
        }
    }
}
```

### **3. Применение купонов при оформлении (checkout.js)**

```javascript
// Use active coupons (mark them as used)
async function useActiveCoupons() {
    const activeCoupons = document.querySelectorAll('coupon-package[data-active="true"]');
    
    for (const component of activeCoupons) {
        const couponData = JSON.parse(component.getAttribute('coupon-data'));
        
        try {
            const response = await fetch('/api/coupons/use', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    couponId: couponData.id,
                    userId: 1
                })
            });
            
            if (response.ok) {
                console.log('✅ Coupon used successfully:', couponData.name);
            } else {
                console.error('❌ Failed to use coupon:', couponData.name);
            }
        } catch (error) {
            console.error('❌ Error using coupon:', error);
        }
    }
}

// Ограничение на один активный купон
couponsList.querySelectorAll('coupon-package').forEach(component => {
    component.addEventListener('coupon-toggle', function(e) {
        const couponId = e.detail.coupon.id;
        const isActive = e.detail.active;
        
        // Если этот купон активируется, отключаем все остальные
        if (isActive) {
            couponsList.querySelectorAll('coupon-package').forEach(otherComponent => {
                if (otherComponent !== this) {
                    otherComponent.setActive(false);
                    otherComponent.setAttribute('data-active', 'false');
                }
            });
        }
        
        // Обновляем состояние компонента
        this.setAttribute('data-active', isActive);
        
        // Пересчитываем общую сумму
        updateTotalWithCoupons();
    });
});
```

### **4. Логика использования купона (localStorage-api.js)**

```javascript
async useCoupon(couponId, userId) {
    try {
        const coupon = this.data.coupons.find(c => c.id === couponId);
        
        if (!coupon) {
            return { status: 404, data: { error: 'Coupon not found' } };
        }
        
        if (coupon.used) {
            return { status: 400, data: { error: 'Coupon already used' } };
        }
        
        // Mark original coupon as used
        coupon.used = true;
        coupon.updated_at = new Date().toISOString();
        
        // Add COPY to used coupons with used flag
        const usedCoupon = {
            ...coupon, // Copy all original properties
            used: true,
            used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'used',
            user_id: userId
        };
        
        this.data.used_coupons.push(usedCoupon);
        this.saveData();
        
        return {
            status: 200,
            data: {
                success: true,
                message: 'Купон успешно использован'
            }
        };
    } catch (error) {
        return { status: 500, data: { error: error.message } };
    }
}
```

### **5. Модальное окно выбора проекта (project-selection-modal.js)**

```javascript
class ProjectSelectionModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.coupon = null;
        this.isVisible = false;
    }

    // Показать модальное окно
    setVisible(visible) {
        this.isVisible = visible;
        this.render();
    }

    // Установить данные купона
    setCouponData(coupon) {
        this.coupon = coupon;
        this.render();
    }

    // Выбор проекта
    selectProject(projectName) {
        if (this.coupon) {
            // Store coupon in sessionStorage for checkout page
            sessionStorage.setItem('selectedCoupon', JSON.stringify(this.coupon));
            
            // Navigate to packages page for the selected project
            const projectUrl = this.getProjectUrl(projectName);
            window.location.href = projectUrl;
        }
    }

    // Получить URL проекта
    getProjectUrl(projectName) {
        const projectUrls = {
            'Дирижабли': '/packages.html?project=airship',
            'Совэлмаш': '/packages.html?project=sovelmash'
        };
        return projectUrls[projectName] || '/packages.html';
    }
}

customElements.define('project-selection-modal', ProjectSelectionModal);
```

### **6. Логика показа модального окна (wallet.js, coupons.js)**

```javascript
// Обработка события для купонов "Все проекты"
document.addEventListener('coupon-use-all-projects', function(e) {
    e.stopPropagation();
    const coupon = e.detail.coupon;
    console.log('All-projects coupon clicked:', coupon);
    
    // Show project selection modal
    showProjectSelectionModal(coupon);
});

// Показать модальное окно выбора проекта
function showProjectSelectionModal(coupon) {
    // Create modal element if it doesn't exist
    let modal = document.querySelector('project-selection-modal');
    if (!modal) {
        modal = document.createElement('project-selection-modal');
        document.body.appendChild(modal);
    }
    
    // Set coupon data and show modal
    modal.setCouponData(coupon);
    modal.setVisible(true);
    
    // Listen for modal close
    modal.addEventListener('modal-close', function() {
        modal.setVisible(false);
    });
}
```

### **7. Обновленные Web Components**

#### **mini-coupon.js и full-coupon-card.js**
```javascript
// Обработка клика на кнопку "Использовать"
button.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Check if coupon is for all projects
    if (this.coupon.project_name === 'Все проекты') {
        this.dispatchEvent(new CustomEvent('coupon-use-all-projects', {
            detail: { coupon: this.coupon },
            bubbles: true,
            composed: true
        }));
    } else {
        this.dispatchEvent(new CustomEvent('coupon-use', {
            detail: { coupon: this.coupon },
            bubbles: true,
            composed: true
        }));
    }
});
```

### **8. Отображение статусов купонов (full-coupon-card.js)**

```javascript
// Логика определения статуса купона
getStatusOverlay() {
    if (!this.isHistory) return '';
    
    if (this.coupon.status === 'expired') {
        return '<div class="coupon-used-overlay">ИСТЁК</div>';
    } else if (this.coupon.status === 'revoked') {
        return '<div class="coupon-used-overlay">ОТОЗВАН</div>';
    } else if (this.coupon.used) {
        return '<div class="coupon-used-overlay">ИСПОЛЬЗОВАН</div>';
    }
    
    return '';
}

// CSS стили для оверлеев
const overlayStyles = `
    .coupon-used-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-15deg);
        font-size: 2.5rem;
        font-weight: 700;
        color: #9ca3af;
        border: 3px solid #d1d5db;
        border-radius: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.8);
        pointer-events: none;
        z-index: 10;
    }
    
    @media (max-width: 768px) {
        .coupon-used-overlay {
            font-size: 1.5rem;
            padding: 4px 8px;
            border-width: 2px;
        }
    }
    
    @media (max-width: 480px) {
        .coupon-used-overlay {
            font-size: 1.2rem;
            padding: 3px 6px;
            border-width: 1px;
        }
    }
    
    @media (max-width: 360px) {
        .coupon-used-overlay {
            font-size: 1rem;
            padding: 2px 4px;
            border-width: 1px;
        }
    }
`;
```

## 🗄️ Структура данных

### **Купон в базе данных**

```javascript
const coupon = {
    id: 1,
    code: 'WELCOME25',
    name: 'Добро пожаловать',
    description: 'Скидка для новых пользователей',
    discount: 25,
    discount_amount: 25,
    discount_type: 'fixed', // 'fixed' или 'percentage'
    project_name: 'Все проекты', // или конкретный проект
    expires_at: '2025-12-31T23:59:59.000Z',
    conditions: 'Минимальная сумма $250',
    used: false,
    status: undefined, // 'expired', 'revoked', или undefined
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
};
```

### **Специальные купоны в истории**

#### **Истекший купон**
```javascript
const expiredCoupon = {
    id: 4,
    code: 'EXPIRED30',
    name: 'Истекший купон',
    description: 'Купон с истекшей датой применения',
    discount: 30,
    discount_amount: 30,
    project_name: 'Все проекты',
    expires_at: '2024-12-31T23:59:59.000Z', // Прошлая дата
    conditions: 'Минимальная сумма $100',
    used: false,
    status: 'expired', // Специальный статус
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-31T23:59:59.000Z'
};
```

#### **Отозванный купон**
```javascript
const revokedCoupon = {
    id: 5,
    code: 'REVOKED15',
    name: 'Отозванный купон',
    description: 'Купон, который был отозван администрацией',
    discount: 15,
    discount_amount: 15,
    project_name: 'Все проекты',
    expires_at: '2025-06-30T23:59:59.000Z',
    conditions: 'Минимальная сумма $200',
    used: false,
    status: 'revoked', // Специальный статус
    created_at: '2024-06-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
};
```

### **Использованный купон**

```javascript
// Копия оригинального купона с дополнительными полями
const usedCoupon = {
    ...coupon, // Копируем все свойства оригинального купона
    used: true, // Помечаем как использованный
    used_at: new Date().toISOString(), // Время использования
    updated_at: new Date().toISOString(), // Время обновления
    status: 'used', // Статус для API
    user_id: userId // ID пользователя
};
```

## 🔄 API Endpoints

### **Получение активных купонов**
```
GET /api/coupons/active/:userId
```

### **Использование купона**
```
POST /api/coupons/use
Body: {
    couponId: number,
    userId: number
}
```

### **Получение истории купонов**
```
GET /api/coupons/history/:userId
// Возвращает все купоны из used_coupons:
// - Использованные купоны (used: true)
// - Истекшие купоны (status: 'expired')
// - Отозванные купоны (status: 'revoked')
```

### **Инициализация специальных купонов**
```javascript
// В localStorage-api.js
// Принудительно добавляем купоны в историю, если их там нет
if (!this.data.used_coupons) {
    this.data.used_coupons = [];
}

// Проверяем, есть ли уже наши специальные купоны
const hasExpiredCoupon = this.data.used_coupons.some(c => c.id === 4);
const hasRevokedCoupon = this.data.used_coupons.some(c => c.id === 5);

// Добавляем только если их нет
if (!hasExpiredCoupon) {
    this.data.used_coupons.push({
        id: 4,
        code: 'EXPIRED30',
        name: 'Истекший купон',
        description: 'Купон с истекшей датой применения',
        discount: 30,
        discount_amount: 30,
        project_name: 'Все проекты',
        expires_at: '2024-12-31T23:59:59.000Z',
        conditions: 'Минимальная сумма $100',
        used: false,
        status: 'expired',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-12-31T23:59:59.000Z'
    });
}

if (!hasRevokedCoupon) {
    this.data.used_coupons.push({
        id: 5,
        code: 'REVOKED15',
        name: 'Отозванный купон',
        description: 'Купон, который был отозван администрацией',
        discount: 15,
        discount_amount: 15,
        project_name: 'Все проекты',
        expires_at: '2025-06-30T23:59:59.000Z',
        conditions: 'Минимальная сумма $200',
        used: false,
        status: 'revoked',
        created_at: '2024-06-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
    });
}
```

### **Особенности API для специальных купонов**
- **Автоматическая инициализация**: при первом запуске системы
- **Предотвращение дублирования**: проверка по ID перед добавлением
- **Сохранение в localStorage**: данные персистентны между сессиями
- **Отображение в истории**: все специальные купоны видны во вкладке "История"
- **Статусы**: `expired` и `revoked` для разных типов купонов

## 📱 Web Components

### **mini-coupon**
- **Использование**: кошелек, страница пакетов
- **Функции**: отображение, навигация, отображение статусов
- **Кнопка**: "Использовать"
- **Статусы**: "Использован", "Истёк", "Отозван"
- **Оверлеи**: диагональные штампы с текстом статуса
- **Адаптивность**: размеры оверлеев уменьшаются на мобильных устройствах

### **coupon-package**
- **Использование**: страница оформления пакета
- **Функции**: переключение, расчет скидки
- **Элемент**: переключатель

### **full-coupon-card**
- **Использование**: страница купонов
- **Функции**: детальное отображение, навигация, отображение статусов
- **Кнопка**: "Использовать"
- **Статусы**: "ИСПОЛЬЗОВАН", "ИСТЁК", "ОТОЗВАН"
- **Оверлеи**: диагональные штампы с текстом статуса
- **Адаптивность**: размеры оверлеев уменьшаются на мобильных устройствах
- **Логика статусов**: `getStatusOverlay()` определяет тип оверлея
- **CSS**: встроенные стили с медиа-запросами для адаптивности
- **События**: `coupon-use` для конкретных проектов, `coupon-use-all-projects` для универсальных

### **project-selection-modal**
- **Использование**: модальное окно выбора проекта для купонов "Все проекты"
- **Функции**: отображение проектов, выбор проекта, навигация
- **Проекты**: Дирижабли 🚁, Совэлмаш 🏭
- **Адаптивность**: полная поддержка мобильных устройств
- **Анимация**: плавное появление с эффектом масштабирования
- **События**: `modal-close` при закрытии модального окна

## 🎨 UI/UX особенности

### **Переключатели купонов**
- **Состояние**: включен/выключен
- **Визуальная обратная связь**: изменение цвета и стиля
- **Расчет скидки**: в реальном времени

### **Отображение суммы**
- **Исходная цена**: цена пакета
- **Скидка**: сумма всех активных купонов
- **Итоговая цена**: исходная цена - скидка

### **Валидация**
- **Проверка баланса**: достаточность средств
- **Проверка купонов**: валидность и срок действия
- **Обработка ошибок**: понятные сообщения пользователю

### **Отображение статусов купонов**
- **Активные купоны**: без оверлея, кнопка "Использовать"
- **Использованные купоны**: оверлей "ИСПОЛЬЗОВАН", кнопка неактивна
- **Истекшие купоны**: оверлей "ИСТЁК", кнопка неактивна
- **Отозванные купоны**: оверлей "ОТОЗВАН", кнопка неактивна

### **Дизайн оверлеев статусов**
- **Позиционирование**: по центру карточки с поворотом -15°
- **Стиль**: серый текст с рамкой, полупрозрачный фон
- **Размеры**: 2.5rem на десктопе, 1.5rem на планшете, 1.2rem на мобильном
- **Интерактивность**: `pointer-events: none` - не блокирует клики
- **Адаптивность**: размеры и отступы уменьшаются на меньших экранах
- **Доступность**: `z-index: 10` - всегда поверх контента
- **Поворот**: `transform: rotate(-15deg)` для эффекта штампа
- **Фон**: `rgba(255, 255, 255, 0.8)` для лучшей читаемости

### **Логика определения статуса**
```javascript
// В full-coupon-card.js
getStatusOverlay() {
    if (!this.isHistory) return '';
    
    if (this.coupon.status === 'expired') {
        return '<div class="coupon-used-overlay">ИСТЁК</div>';
    } else if (this.coupon.status === 'revoked') {
        return '<div class="coupon-used-overlay">ОТОЗВАН</div>';
    } else if (this.coupon.used) {
        return '<div class="coupon-used-overlay">ИСПОЛЬЗОВАН</div>';
    }
    
    return '';
}
```

### **Стили оверлеев статусов**
```css
.coupon-used-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
    font-size: 2.5rem;
    font-weight: 700;
    color: #9ca3af;
    border: 3px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.8);
    pointer-events: none;
    z-index: 10;
}

/* Адаптивные стили */
@media (max-width: 768px) {
    .coupon-used-overlay {
        font-size: 1.5rem;
        padding: 4px 8px;
        border-width: 2px;
    }
}

@media (max-width: 480px) {
    .coupon-used-overlay {
        font-size: 1.2rem;
        padding: 3px 6px;
        border-width: 1px;
    }
}

@media (max-width: 360px) {
    .coupon-used-overlay {
        font-size: 1rem;
        padding: 2px 4px;
        border-width: 1px;
    }
}
```

## 🚀 Развертывание

### **Локальная разработка**
```bash
# Запуск локального сервера
python3 -m http.server 8002

# Тестирование
open "http://localhost:8002/wallet.html"
open "http://localhost:8002/checkout.html?package=sov-500"
```

### **Vercel**
```bash
# Деплой на Vercel
vercel --prod

# Проверка работы
https://your-app.vercel.app/wallet.html
https://your-app.vercel.app/checkout.html?package=sov-500
```

## 📝 Примечания

1. **localStorage**: Все данные хранятся в браузере пользователя
2. **sessionStorage**: Используется для передачи выбранного купона между страницами
3. **Синхронизация**: Изменения применяются немедленно через API
4. **Персистентность**: Данные сохраняются между сессиями
5. **Масштабируемость**: Легко добавить новые типы купонов и проектов
6. **⚠️ Важно**: Купоны помечаются как использованные только при оформлении пакета, а не при навигации
7. **🔄 Копирование данных**: При использовании купона создается полная копия в `used_coupons` с флагом `used: true`
8. **🎫 Статусы**: Система поддерживает 3 типа статусов: использованные, истекшие, отозванные
9. **🔄 Инициализация**: Специальные купоны автоматически добавляются в историю при первом запуске
10. **🎨 Оверлеи**: Диагональные штампы с текстом статуса, адаптивные размеры
11. **🔒 Безопасность**: Оверлеи не блокируют клики (`pointer-events: none`)
12. **📱 Адаптивность**: Размеры оверлеев автоматически уменьшаются на мобильных устройствах
13. **🎨 Дизайн**: Диагональные штампы с поворотом -15° для лучшей видимости
14. **🎫 Ограничение**: На странице оформления можно выбрать только ОДИН купон - при выборе нового предыдущий автоматически отключается
15. **🪟 Модальное окно**: Для купонов "Все проекты" показывается модальное окно выбора проекта с двумя опциями
16. **🎯 Выбор проекта**: Пользователь может выбрать между Дирижаблями и Совэлмашем перед переходом на страницу пакетов
17. **📱 Адаптивность модального окна**: Полная поддержка мобильных устройств с адаптивными размерами и отступами

## 🎫 Тестовые купоны

### **Активные купоны**
```javascript
const activeCoupons = [
    {
        id: 1,
        code: 'WELCOME25',
        name: 'Добро пожаловать',
        discount_amount: 25,
        project_name: 'Все проекты'
    },
    {
        id: 2,
        code: 'INVEST50',
        name: 'Инвестиционный бонус',
        discount_amount: 50,
        project_name: 'Дирижабли'
    },
    {
        id: 3,
        code: 'SOVELMASH20',
        name: 'Совэлмаш бонус',
        discount_amount: 20,
        project_name: 'Совэлмаш'
    }
];
```

### **Купоны в истории**
```javascript
const historyCoupons = [
    {
        id: 4,
        code: 'EXPIRED30',
        name: 'Истекший купон',
        discount_amount: 30,
        project_name: 'Все проекты',
        status: 'expired',
        expires_at: '2024-12-31T23:59:59.000Z' // Прошлая дата
    },
    {
        id: 5,
        code: 'REVOKED15',
        name: 'Отозванный купон',
        discount_amount: 15,
        project_name: 'Все проекты',
        status: 'revoked',
        expires_at: '2025-06-30T23:59:59.000Z' // Будущая дата
    }
];
```

### **Логика инициализации специальных купонов**
```javascript
// В localStorage-api.js
// Проверяем, есть ли уже наши специальные купоны
const hasExpiredCoupon = this.data.used_coupons.some(c => c.id === 4);
const hasRevokedCoupon = this.data.used_coupons.some(c => c.id === 5);

// Добавляем только если их нет
if (!hasExpiredCoupon) {
    this.data.used_coupons.push({
        id: 4,
        code: 'EXPIRED30',
        name: 'Истекший купон',
        description: 'Купон с истекшей датой применения',
        discount: 30,
        discount_amount: 30,
        project_name: 'Все проекты',
        expires_at: '2024-12-31T23:59:59.000Z',
        conditions: 'Минимальная сумма $100',
        used: false,
        status: 'expired',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-12-31T23:59:59.000Z'
    });
}

if (!hasRevokedCoupon) {
    this.data.used_coupons.push({
        id: 5,
        code: 'REVOKED15',
        name: 'Отозванный купон',
        description: 'Купон, который был отозван администрацией',
        discount: 15,
        discount_amount: 15,
        project_name: 'Все проекты',
        expires_at: '2025-06-30T23:59:59.000Z',
        conditions: 'Минимальная сумма $200',
        used: false,
        status: 'revoked',
        created_at: '2024-06-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
    });
}
```

### **Особенности специальных купонов**
- **Истекший купон**: `expires_at` в прошлом, `status: 'expired'`
- **Отозванный купон**: `expires_at` в будущем, `status: 'revoked'`
- **Автоматическое добавление**: только при первом запуске системы
- **Предотвращение дублирования**: проверка по ID перед добавлением
- **Отображение**: диагональные штампы с соответствующим текстом
