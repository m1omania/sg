# Web Components Architecture

Современная архитектура на основе Web Components для переиспользуемых UI компонентов.

## 🚀 Особенности

- **Shadow DOM** - изоляция стилей, никаких конфликтов
- **Custom Elements** - семантические HTML теги
- **Автоматическое обновление** - изменили компонент, обновились все страницы
- **Мобильная адаптивность** - встроенная поддержка мобильных устройств
- **Темная тема** - автоматическая поддержка темной темы
- **CSS Custom Properties** - легкая кастомизация через CSS переменные
- **События** - встроенная система событий между компонентами

## 📁 Структура

```
components/web-components/
├── header.js          # Компонент верхнего меню
├── sidebar.js         # Компонент боковой навигации
├── index.js           # Главный модуль загрузки
└── README.md          # Документация
```

## 🎯 Использование

### Автоматическое подключение

```html
<!-- Просто добавьте теги компонентов -->
<sg-header></sg-header>
<sg-sidebar></sg-sidebar>

<!-- Подключите главный модуль -->
<script type="module" src="components/web-components/index.js"></script>
```

### Ручное подключение

```html
<!-- Подключите нужные компоненты -->
<script type="module" src="components/web-components/header.js"></script>
<script type="module" src="components/web-components/sidebar.js"></script>

<!-- Используйте компоненты -->
<sg-header></sg-header>
<sg-sidebar></sg-sidebar>
```

## 🎨 Кастомизация

### CSS Custom Properties

```css
:root {
    /* Цвета темы */
    --primary-color: #3b82f6;
    --accent-color: #ef4444;
    
    /* Цвета фона */
    --header-bg: #ffffff;
    --sidebar-bg: #ffffff;
    
    /* Цвета текста */
    --text-color: #374151;
    
    /* Цвета границ */
    --border-color: #e5e7eb;
    
    /* Темная тема */
    --header-bg-dark: #1f2937;
    --sidebar-bg-dark: #1f2937;
    --text-color-dark: #f9fafb;
    --border-color-dark: #374151;
}
```

### События компонентов

```javascript
// Слушаем события смены языка
document.addEventListener('languageChanged', (e) => {
    console.log('Language changed to:', e.detail.language);
});

// Слушаем события выхода
document.addEventListener('logout', (e) => {
    console.log('User logged out');
});

// Слушаем события навигации
document.addEventListener('navigate', (e) => {
    console.log('Navigation:', e.detail);
});
```

## 🔧 API компонентов

### SGHeader

```javascript
// Получить элемент
const header = document.querySelector('sg-header');

// Сменить язык программно
header.switchLanguage('en');

// Обработать выход
header.handleLogout();
```

### SGSidebar

```javascript
// Получить элемент
const sidebar = document.querySelector('sg-sidebar');

// Переключить на мобильных
sidebar.toggle();

// Закрыть на мобильных
sidebar.close();

// Обновить активную страницу
sidebar.setActivePage();
```

## 📱 Мобильная поддержка

- Автоматическое скрытие sidebar на мобильных
- Адаптивные размеры и отступы
- Сенсорные жесты для навигации

## 🌙 Темная тема

- Автоматическое определение системных настроек
- CSS Custom Properties для кастомизации
- Плавные переходы между темами

## ⚡ Производительность

- Ленивая загрузка компонентов
- Shadow DOM для изоляции стилей
- Минимальный JavaScript footprint
- Современные браузерные API

## 🔄 Обновление компонентов

1. **Измените файл компонента** (например, `header.js`)
2. **Изменения автоматически применятся** ко всем страницам
3. **Никаких дополнительных действий** не требуется

## 📋 Поддерживаемые браузеры

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## 🚀 Миграция с старых компонентов

```bash
# Автоматическая миграция
node update-to-web-components.js
```

## 📝 Примеры

### Базовая страница

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <sg-header></sg-header>
    
    <div class="app-layout">
        <sg-sidebar></sg-sidebar>
        
        <main class="main-content">
            <h1>My Content</h1>
        </main>
    </div>
    
    <script type="module" src="components/web-components/index.js"></script>
</body>
</html>
```

### Кастомизированная тема

```html
<style>
:root {
    --primary-color: #10b981;
    --accent-color: #f59e0b;
    --header-bg: #f0fdf4;
    --sidebar-bg: #f0fdf4;
}
</style>
```

## 🎯 Преимущества

- ✅ **Изоляция стилей** - Shadow DOM предотвращает конфликты
- ✅ **Переиспользование** - один компонент, много страниц
- ✅ **Автоматические обновления** - изменили один файл, обновились все
- ✅ **Современные стандарты** - использует Web Components API
- ✅ **Легкая кастомизация** - CSS Custom Properties
- ✅ **Мобильная поддержка** - встроенная адаптивность
- ✅ **Темная тема** - автоматическая поддержка
- ✅ **События** - встроенная система коммуникации
