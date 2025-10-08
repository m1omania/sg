# Компоненты

Эта папка содержит переиспользуемые HTML компоненты для всех страниц приложения.

## Структура

- `header.html` - Верхнее меню (логотип, переключатель языков, уведомления, меню пользователя)
- `sidebar.html` - Боковая навигация
- `load-component.js` - JavaScript для загрузки компонентов

## Использование

### Автоматическое обновление всех страниц

```bash
node update-pages.js
```

### Ручное добавление компонента на страницу

1. Добавьте placeholder в HTML:
```html
<div id="header-placeholder"></div>
<div id="sidebar-placeholder"></div>
```

2. Подключите скрипт загрузки:
```html
<script src="components/load-component.js"></script>
```

## Изменение компонентов

### Изменение верхнего меню
Отредактируйте `components/header.html` - изменения автоматически применятся ко всем страницам.

### Изменение боковой навигации  
Отредактируйте `components/sidebar.html` - изменения автоматически применятся ко всем страницам.

### Добавление новых компонентов

1. Создайте новый HTML файл в папке `components/`
2. Добавьте функцию загрузки в `load-component.js`:
```javascript
loadComponent('components/new-component.html', '#new-component-placeholder');
```

## Преимущества

- ✅ **Единообразие** - все страницы используют одинаковые компоненты
- ✅ **Легкость обновления** - изменили один файл, обновились все страницы
- ✅ **Меньше дублирования** - код не повторяется
- ✅ **Простота поддержки** - один источник истины для каждого компонента

## Файлы, использующие компоненты

- ✅ `index.html`
- ✅ `wallet.html`
- ✅ `invest.html`
- ✅ `my-investments.html`
- ✅ `deposit.html`
- ✅ `checkout.html`
- ✅ `packages.html`
- ✅ `landing.html`
- ✅ `register.html`
- ✅ `coupons.html`
