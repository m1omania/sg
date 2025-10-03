// Автоматическое тестирование layout на разных размерах экрана
(function() {
    'use strict';
    
    const LayoutTester = {
        // Размеры экрана для тестирования
        breakpoints: [
            { name: 'Mobile S', width: 320, height: 568 },
            { name: 'Mobile M', width: 375, height: 667 },
            { name: 'Mobile L', width: 425, height: 812 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Laptop', width: 1024, height: 768 },
            { name: 'Desktop', width: 1440, height: 900 },
            { name: 'Large Desktop', width: 1920, height: 1080 }
        ],
        
        // Текущий тест
        currentTest: 0,
        
        // Результаты тестов
        results: [],
        
        // Инициализация тестирования
        init() {
            console.log('🧪 Layout Tester initialized');
            this.createTestUI();
            this.runTests();
        },
        
        // Создание UI для тестирования
        createTestUI() {
            const testPanel = document.createElement('div');
            testPanel.id = 'layout-test-panel';
            testPanel.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                max-width: 300px;
                display: none;
            `;
            
            testPanel.innerHTML = `
                <h3 style="margin: 0 0 10px 0; color: #4ade80;">Layout Tester</h3>
                <div id="test-info"></div>
                <div id="test-controls" style="margin-top: 10px;">
                    <button id="start-test" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Start Test</button>
                    <button id="next-test" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;">Next</button>
                    <button id="close-test" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;">Close</button>
                </div>
                <div id="test-results" style="margin-top: 10px; max-height: 200px; overflow-y: auto;"></div>
            `;
            
            document.body.appendChild(testPanel);
            
            // Обработчики событий
            document.getElementById('start-test').onclick = () => this.startTest();
            document.getElementById('next-test').onclick = () => this.nextTest();
            document.getElementById('close-test').onclick = () => this.closeTest();
        },
        
        // Показать панель тестирования
        show() {
            document.getElementById('layout-test-panel').style.display = 'block';
        },
        
        // Скрыть панель тестирования
        hide() {
            document.getElementById('layout-test-panel').style.display = 'none';
        },
        
        // Запуск тестов
        runTests() {
            this.show();
            this.updateTestInfo();
        },
        
        // Начать тестирование
        startTest() {
            this.currentTest = 0;
            this.results = [];
            this.runCurrentTest();
        },
        
        // Следующий тест
        nextTest() {
            this.currentTest++;
            if (this.currentTest >= this.breakpoints.length) {
                this.showResults();
                return;
            }
            this.runCurrentTest();
        },
        
        // Запуск текущего теста
        runCurrentTest() {
            const breakpoint = this.breakpoints[this.currentTest];
            this.setViewportSize(breakpoint.width, breakpoint.height);
            this.updateTestInfo();
            
            // Ждем рендеринга
            setTimeout(() => {
                const result = this.testLayout(breakpoint);
                this.results.push(result);
                this.updateTestResults();
            }, 500);
        },
        
        // Установка размера viewport
        setViewportSize(width, height) {
            // В реальном браузере это не сработает, но для демонстрации
            console.log(`Setting viewport to ${width}x${height}`);
        },
        
        // Тестирование layout
        testLayout(breakpoint) {
            const header = document.querySelector('sg-header');
            const sidebar = document.querySelector('sg-sidebar');
            const main = document.querySelector('.main-content');
            
            const result = {
                breakpoint: breakpoint.name,
                width: breakpoint.width,
                issues: []
            };
            
            // Проверка header
            if (header) {
                const headerStyle = getComputedStyle(header);
                if (headerStyle.position !== 'sticky') {
                    result.issues.push('Header should be sticky');
                }
                if (parseInt(headerStyle.zIndex) < 50) {
                    result.issues.push('Header z-index too low');
                }
            } else {
                result.issues.push('Header not found');
            }
            
            // Проверка sidebar
            if (sidebar) {
                const sidebarStyle = getComputedStyle(sidebar);
                if (breakpoint.width <= 768) {
                    if (sidebarStyle.position !== 'static') {
                        result.issues.push('Sidebar should be static on mobile');
                    }
                } else {
                    if (sidebarStyle.position !== 'sticky') {
                        result.issues.push('Sidebar should be sticky on desktop');
                    }
                }
            } else {
                result.issues.push('Sidebar not found');
            }
            
            // Проверка main content
            if (main) {
                const mainStyle = getComputedStyle(main);
                if (mainStyle.flex !== '1 1 0%' && mainStyle.flex !== '1') {
                    result.issues.push('Main content should have flex: 1');
                }
            } else {
                result.issues.push('Main content not found');
            }
            
            // Проверка перекрытий
            if (this.checkOverlaps()) {
                result.issues.push('Elements are overlapping');
            }
            
            result.status = result.issues.length === 0 ? 'PASS' : 'FAIL';
            return result;
        },
        
        // Проверка перекрытий элементов
        checkOverlaps() {
            const header = document.querySelector('sg-header');
            const sidebar = document.querySelector('sg-sidebar');
            const main = document.querySelector('.main-content');
            
            if (!header || !sidebar || !main) return true;
            
            const headerRect = header.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            
            // Проверка перекрытия header и sidebar
            if (headerRect.bottom > sidebarRect.top && headerRect.top < sidebarRect.bottom) {
                return true;
            }
            
            // Проверка перекрытия sidebar и main
            if (sidebarRect.right > mainRect.left && sidebarRect.left < mainRect.right) {
                return true;
            }
            
            return false;
        },
        
        // Обновление информации о тесте
        updateTestInfo() {
            const breakpoint = this.breakpoints[this.currentTest];
            const info = document.getElementById('test-info');
            info.innerHTML = `
                <div><strong>Test ${this.currentTest + 1}/${this.breakpoints.length}</strong></div>
                <div>Size: ${breakpoint.width}x${breakpoint.height}</div>
                <div>Device: ${breakpoint.name}</div>
            `;
        },
        
        // Обновление результатов тестов
        updateTestResults() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = this.results.map(result => `
                <div style="margin-bottom: 5px; padding: 5px; background: ${result.status === 'PASS' ? '#10b981' : '#ef4444'}; border-radius: 3px;">
                    <strong>${result.breakpoint}</strong> - ${result.status}
                    ${result.issues.length > 0 ? `<br><small>Issues: ${result.issues.join(', ')}</small>` : ''}
                </div>
            `).join('');
        },
        
        // Показать итоговые результаты
        showResults() {
            const passed = this.results.filter(r => r.status === 'PASS').length;
            const total = this.results.length;
            
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = `
                <div style="background: #1f2937; padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <h4 style="margin: 0 0 10px 0;">Test Summary</h4>
                    <div>Passed: ${passed}/${total}</div>
                    <div>Success Rate: ${Math.round((passed/total) * 100)}%</div>
                </div>
            `;
        },
        
        // Закрыть тестирование
        closeTest() {
            this.hide();
        }
    };
    
    // Автозапуск при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LayoutTester.init());
    } else {
        LayoutTester.init();
    }
    
    // Экспорт для ручного использования
    window.LayoutTester = LayoutTester;
})();
