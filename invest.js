// Investment page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Investment page loaded, initializing...');
    
    initializeInvestmentPage();
    setupModalHandlers();
});

function initializeInvestmentPage() {
    console.log('Initializing investment page...');
    
    // Load projects data
    loadProjects();
}

async function loadProjects() {
    try {
        console.log('Loading projects...');
        
        // Mock projects data
        const projects = [
            {
                id: 1,
                name: 'Дирижабли',
                category: 'Транспорт',
                description: 'Инвестируйте в инновационные проекты воздушных дирижаблей. Современные технологии и экологичный транспорт будущего.',
                yield: 12,
                duration: '3 года',
                minAmount: 500,
                status: 'active',
                image: 'https://picsum.photos/400/200?random=1'
            },
            {
                id: 2,
                name: 'Совэлмаш',
                category: 'Машиностроение',
                description: 'Инвестируйте в развитие современного машиностроительного завода. Перспективный проект с высокой отдачей.',
                yield: 15,
                duration: '5 лет',
                minAmount: 1000,
                status: 'active',
                image: 'https://picsum.photos/400/200?random=2'
            }
        ];
        
        console.log('Projects loaded:', projects);
        renderProjects(projects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Ошибка загрузки проектов');
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = projects.map(project => `
        <project-card project-data='${JSON.stringify(project)}'></project-card>
    `).join('');
    
    // Add event listeners for project cards
    container.addEventListener('project-view-packages', (e) => {
        console.log('Project view packages clicked:', e.detail.project);
        // Redirect to packages page with project filter
        const projectId = e.detail.project.id;
        window.location.href = `packages.html?project=${projectId}`;
    });
}

function setupModalHandlers() {
    const modal = document.getElementById('investmentModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelInvestment');
    const confirmBtn = document.getElementById('confirmInvestment');
    const form = document.getElementById('investmentForm');
    
    // Close modal handlers
    if (modalClose) {
        modalClose.addEventListener('click', () => closeModal());
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal());
    }
    
    // Confirm investment
    if (confirmBtn) {
        confirmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleInvestment();
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function openModal(project) {
    const modal = document.getElementById('investmentModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Update form with project data
        const amountInput = document.getElementById('investmentAmount');
        if (amountInput && project) {
            amountInput.min = project.minAmount;
            amountInput.value = project.minAmount;
        }
    }
}

function closeModal() {
    const modal = document.getElementById('investmentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('investmentForm');
        if (form) {
            form.reset();
        }
    }
}

async function handleInvestment() {
    const form = document.getElementById('investmentForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const investmentData = {
        amount: parseFloat(formData.get('amount')),
        period: parseInt(formData.get('period')),
        paymentMethod: formData.get('paymentMethod')
    };
    
    console.log('Investment data:', investmentData);
    
    // Validate investment
    if (investmentData.amount < 500) {
        showError('Минимальная сумма инвестиции: $500');
        return;
    }
    
    try {
        // Simulate investment processing
        console.log('Processing investment...');
        
        // Show success message
        showSuccess('Инвестиция успешно оформлена!');
        
        // Close modal
        closeModal();
        
        // Redirect to my investments page
        setTimeout(() => {
            window.location.href = 'my-investments.html';
        }, 2000);
        
    } catch (error) {
        console.error('Investment error:', error);
        showError('Ошибка при оформлении инвестиции');
    }
}

function showError(message) {
    // Create or update error notification
    let notification = document.getElementById('error-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'error-notification';
        notification.className = 'notification notification--error';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">❌</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Add close handler
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.add('hidden');
        });
    }
    
    const notificationText = notification.querySelector('.notification-text');
    if (notificationText) {
        notificationText.textContent = message;
    }
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function showSuccess(message) {
    // Create or update success notification
    let notification = document.getElementById('success-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'success-notification';
        notification.className = 'notification notification--success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Add close handler
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.add('hidden');
        });
    }
    
    const notificationText = notification.querySelector('.notification-text');
    if (notificationText) {
        notificationText.textContent = message;
    }
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}