# 🗄️ localStorage Database System

## 📋 Обзор

Система заменяет серверную базу данных на `localStorage` для прототипа, работающего в браузере.

## 🏗️ Архитектура

### **Файлы системы:**

1. **`localStorage-api.js`** - Основной API для работы с данными
2. **`api-adapter.js`** - Адаптер для совместимости с существующим кодом
3. **`test-localStorage.html`** - Тестовая страница для проверки функциональности

### **Структура данных:**

```javascript
{
  "users": [
    {
      "id": 1,
      "email": "demo@solargroup.com",
      "name": "Demo User",
      "main_balance": 1000.00,
      "partner_balance": 500.00,
      "currency": "USD"
    }
  ],
  "coupons": [
    {
      "id": 1,
      "code": "WELCOME25",
      "name": "Добро пожаловать",
      "discount_amount": 25,
      "project_name": "Все проекты",
      "used": false
    }
  ],
  "used_coupons": [],
  "investments": [],
  "projects": [
    {
      "id": 1,
      "name": "Дирижабли",
      "status": "active"
    },
    {
      "id": 2,
      "name": "Совэлмаш", 
      "status": "active"
    }
  ]
}
```

## 🚀 Использование

### **1. Подключение к странице:**

```html
<!-- localStorage API -->
<script src="localStorage-api.js"></script>
<script src="api-adapter.js"></script>
```

### **2. Прямое использование API:**

```javascript
// Получить баланс пользователя
const balance = await window.localStorageAPI.getUserBalance(1);

// Получить активные купоны
const coupons = await window.localStorageAPI.getActiveCoupons(1);

// Использовать купон
const result = await window.localStorageAPI.useCoupon(1, 1);
```

### **3. Использование через fetch (совместимость):**

```javascript
// Работает как обычный API
const response = await fetch('/api/coupons/active/1');
const coupons = await response.json();
```

## 🔧 API Методы

### **Пользователи:**
- `getUserBalance(userId)` - Получить баланс
- `updateUserBalance(userId, mainBalance, partnerBalance)` - Обновить баланс

### **Купоны:**
- `getActiveCoupons(userId)` - Активные купоны
- `getUsedCoupons(userId)` - Использованные купоны
- `useCoupon(couponId, userId)` - Использовать купон

### **Проекты:**
- `getProjects()` - Все проекты
- `getProject(projectId)` - Конкретный проект

### **Инвестиции:**
- `getInvestments(userId)` - Инвестиции пользователя
- `createInvestment(data)` - Создать инвестицию

### **Утилиты:**
- `getStats()` - Статистика данных
- `clearAllData()` - Очистить все данные
- `exportData()` - Экспорт данных
- `importData(data)` - Импорт данных

## 🧪 Тестирование

Откройте `test-localStorage.html` в браузере для тестирования всех функций.

## ✅ Преимущества

- ✅ **Работает везде** - в любом браузере
- ✅ **Быстро** - нет сетевых запросов
- ✅ **Просто** - не нужен сервер
- ✅ **Надежно** - данные сохраняются между сессиями
- ✅ **Совместимо** - работает с существующим кодом

## ⚠️ Ограничения

- ❌ **Только браузер** - не работает на сервере
- ❌ **Один пользователь** - данные привязаны к браузеру
- ❌ **Ограниченный размер** - обычно 5-10MB
- ❌ **Нет синхронизации** - данные не синхронизируются между устройствами

## 🔄 Миграция с серверной БД

1. **Замените fetch запросы** на прямые вызовы API
2. **Обновите обработку ошибок** - теперь все синхронно
3. **Добавьте инициализацию** - данные создаются автоматически
4. **Протестируйте функциональность** - используйте test-localStorage.html

## 🎯 Для продакшена

Для реального приложения замените localStorage на:
- **PostgreSQL** + **Prisma**
- **MongoDB** + **Mongoose** 
- **Firebase** + **Firestore**
- **Supabase** + **PostgREST**
