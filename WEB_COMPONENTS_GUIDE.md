# 🧩 Руководство по Web Components

## 📋 Общие принципы

### ✅ ВСЕГДА используйте Web Components вместо встроенного HTML

**Правило:** При создании любых интерактивных элементов интерфейса используйте Web Components, а не генерируйте HTML через JavaScript.

---

## 🎯 Когда использовать Web Components

### ✅ Используйте Web Components для:
- **Повторяющихся элементов** (купоны, карточки, кнопки)
- **Интерактивных компонентов** (переключатели, формы, модальные окна)
- **Сложной логики** (калькуляторы, фильтры, сортировка)
- **Консистентного дизайна** (одинаковый вид везде)

### ❌ НЕ используйте Web Components для:
- **Простого текста** (заголовки, параграфы)
- **Статичных элементов** (иконки, разделители)
- **Одноразовых блоков** (уникальный контент)

---

## 🏗️ Структура Web Components

### 📁 Расположение файлов:
```
components/web-components/
├── header-standalone.js          # Заголовок
├── sidebar-standalone.js         # Боковое меню
├── account-card.js              # Карточка счета
├── coupon-package.js            # Купон с переключателем
├── full-coupon-card.js          # Полная карточка купона
├── mini-coupon.js               # Мини-купон
├── project-card.js              # Карточка проекта
├── package-card.js              # Карточка пакета
└── header-landing.js            # Заголовок для лендинга
```

### 🔧 Подключение в HTML:
```html
<!-- Подключение Web Component -->
<script src="components/web-components/coupon-package.js"></script>

<!-- Использование -->
<coupon-package 
    coupon-data='${JSON.stringify(coupon)}'
    data-coupon-id="${coupon.id}">
</coupon-package>
```

---

## 📝 Шаблон Web Component

### 🎨 Базовая структура:
```javascript
class MyComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = null;
    }

    static get observedAttributes() {
        return ['data-attribute'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-attribute') {
            this.data = JSON.parse(newValue);
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* Стили компонента */
            </style>
            <div class="component">
                <!-- HTML структура -->
            </div>
        `;
    }

    setupEventListeners() {
        // Обработчики событий
    }
}

customElements.define('my-component', MyComponent);
```

---

## 🔄 События Web Components

### 📤 Отправка событий:
```javascript
this.dispatchEvent(new CustomEvent('component-action', {
    detail: { 
        data: this.data,
        action: 'specific-action'
    },
    bubbles: true,
    composed: true
}));
```

### 📥 Обработка событий:
```javascript
document.addEventListener('component-action', function(e) {
    const data = e.detail.data;
    const action = e.detail.action;
    // Обработка события
});
```

---

## 🎨 Стилизация Web Components

### 🎯 Shadow DOM стили:
```javascript
this.shadowRoot.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
        }
        
        .component {
            /* Стили компонента */
        }
        
        /* Медиа-запросы */
        @media (max-width: 768px) {
            .component {
                /* Мобильные стили */
            }
        }
    </style>
    <!-- HTML -->
`;
```

### 🌐 Глобальные стили:
```css
/* В style.css */
my-component {
    /* Стили для :host */
}

my-component::part(inner-element) {
    /* Стили для ::part() */
}
```

---

## 📊 Примеры использования

### 🎫 Купоны:
```javascript
// ❌ НЕПРАВИЛЬНО - встроенный HTML
couponsList.innerHTML = coupons.map(coupon => `
    <div class="coupon-item">
        <div class="coupon-name">${coupon.name}</div>
        <!-- ... -->
    </div>
`).join('');

// ✅ ПРАВИЛЬНО - Web Component
couponsList.innerHTML = coupons.map(coupon => `
    <coupon-package 
        coupon-data='${JSON.stringify(coupon)}'>
    </coupon-package>
`).join('');
```

### 💳 Карточки счетов:
```javascript
// ❌ НЕПРАВИЛЬНО - встроенный HTML
accountCard.innerHTML = `
    <div class="account-info">
        <h3>${account.name}</h3>
        <span>${account.balance}</span>
    </div>
`;

// ✅ ПРАВИЛЬНО - Web Component
<account-card 
    type="main" 
    balance="${account.balance}"
    currency="USD">
</account-card>
```

---

## 🔧 Интеграция с данными

### 📡 Единый источник данных:
```javascript
// data/coupons-data.js
window.CouponsData = {
    getActiveCoupons: function() {
        return this.active
            .filter(coupon => !coupon.used)
            .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
    }
};

// Использование в компоненте
const coupons = window.CouponsData.getActiveCoupons();
```

### 🔄 Обновление данных:
```javascript
// Обновление через атрибуты
component.setAttribute('coupon-data', JSON.stringify(newCouponData));

// Обновление через методы
component.setCouponData(newCouponData);
component.setActive(true);
```

---

## 🚀 Лучшие практики

### ✅ DO:
- **Используйте Shadow DOM** для изоляции стилей
- **Создавайте переиспользуемые** компоненты
- **Документируйте события** и атрибуты
- **Тестируйте на разных** страницах
- **Следуйте единому** стилю кода

### ❌ DON'T:
- **Не генерируйте HTML** через innerHTML
- **Не дублируйте логику** между компонентами
- **Не забывайте про события** и их обработку
- **Не создавайте слишком** специфичные компоненты
- **Не игнорируйте мобильную** версию

---

## 📋 Чек-лист для новых компонентов

### 🎯 Перед созданием:
- [ ] Компонент будет переиспользоваться?
- [ ] Есть интерактивность?
- [ ] Нужна изоляция стилей?
- [ ] Требуется сложная логика?

### 🔧 При создании:
- [ ] Создан файл в `components/web-components/`
- [ ] Добавлены `observedAttributes`
- [ ] Реализован `render()` метод
- [ ] Настроены обработчики событий
- [ ] Добавлены мобильные стили
- [ ] Зарегистрирован через `customElements.define()`

### 🧪 После создания:
- [ ] Протестирован на разных страницах
- [ ] Проверена работа событий
- [ ] Убедились в консистентности дизайна
- [ ] Обновлена документация

---

## 🎉 Заключение

**Помните:** Web Components - это основа современного веб-разработки. Они обеспечивают:
- 🎯 **Консистентность** дизайна
- 🔄 **Переиспользование** кода
- 🛡️ **Изоляцию** стилей
- 🚀 **Производительность** разработки

**Всегда выбирайте Web Components вместо встроенного HTML!** 🧩
