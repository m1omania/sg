// My Investments page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('My Investments page loaded, initializing...');
    
    const investmentsTbody = document.getElementById('investments-tbody');
    const statusFilter = document.getElementById('status-filter');
    const projectFilter = document.getElementById('project-filter');
    const newInvestmentBtn = document.getElementById('new-investment-btn');
    const investmentDetailModal = document.getElementById('investment-detail-modal');
    const successNotification = document.getElementById('success-notification');
    
    // Load investments
    loadInvestments();
    
    // Event handlers
    if (statusFilter) statusFilter.addEventListener('change', loadInvestments);
    if (projectFilter) projectFilter.addEventListener('change', loadInvestments);
    if (newInvestmentBtn) {
        newInvestmentBtn.addEventListener('click', function() {
            window.location.href = 'invest.html';
        });
    }
    
    // Close modal handlers
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.add('hidden');
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
    
    async function loadInvestments() {
        const status = statusFilter ? statusFilter.value : 'all';
        const project = projectFilter ? projectFilter.value : 'all';
        
        try {
            console.log('Loading investments from API...');
            const res = await fetch('/api/investments/1');
            console.log('Investments API response status:', res.status);
            
            if (!res.ok) {
                console.log('Investments API response not ok:', res.status);
                if (investmentsTbody) {
                    investmentsTbody.innerHTML = '<tr><td colspan="6" class="text-center">Ошибка загрузки инвестиций</td></tr>';
                }
                return;
            }
            
            const investments = await res.json();
            console.log('Investments data from API:', investments);
            
            // Filter investments
            let filteredInvestments = investments;
            
            if (status !== 'all') {
                filteredInvestments = filteredInvestments.filter(inv => {
                    if (status === 'active') return inv.status === 'active';
                    if (status === 'completed') return inv.status === 'completed';
                    return true;
                });
            }
            
            if (project !== 'all') {
                filteredInvestments = filteredInvestments.filter(inv => {
                    const projectMap = {
                        'airships': 'Дирижабли',
                        'sovelmash': 'Совэлмаш',
                        'solar': 'Солнечные панели'
                    };
                    return inv.project_name === projectMap[project];
                });
            }
            
            console.log('Filtered investments:', filteredInvestments);
            renderInvestments(filteredInvestments);
            
            // Update stats
            updateStats(investments);
            
        } catch (error) {
            console.error('Error loading investments:', error);
            if (investmentsTbody) {
                investmentsTbody.innerHTML = '<tr><td colspan="6" class="text-center">Ошибка загрузки инвестиций</td></tr>';
            }
        }
    }
    
    function renderInvestments(investments) {
        if (!investmentsTbody) return;
        
        if (investments.length === 0) {
            investmentsTbody.innerHTML = '<tr><td colspan="6" class="text-center">Инвестиции не найдены</td></tr>';
            return;
        }
        
        investmentsTbody.innerHTML = investments.map(investment => `
            <tr>
                <td>
                    <div class="project-info">
                        <div class="project-name">${investment.project_name}</div>
                    </div>
                </td>
                <td>$${investment.final_amount.toFixed(2)}</td>
                <td>${formatDate(investment.created_at)}</td>
                <td>${getInterestRate(investment.project_name)}</td>
                <td>
                    <span class="status-badge status-${investment.status}">
                        ${investment.status === 'active' ? 'Активна' : 'Завершена'}
                    </span>
                </td>
                <td>
                    <button class="btn btn--secondary btn--small details-btn" data-investment-id="${investment.id}">Подробнее</button>
                </td>
            </tr>
        `).join('');
        
        // Add event handlers for detail buttons
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const investmentId = this.dataset.investmentId;
                showInvestmentDetails(investmentId, investments);
            });
        });
    }
    
    function showInvestmentDetails(investmentId, investments) {
        const investment = investments.find(inv => inv.id == investmentId);
        if (!investment) return;
        
        if (investmentDetailModal) {
            document.getElementById('detail-project-name').textContent = investment.project_name;
            document.getElementById('detail-amount').textContent = `$${investment.final_amount.toFixed(2)}`;
            document.getElementById('detail-date').textContent = formatDate(investment.created_at);
            document.getElementById('detail-interest').textContent = getInterestRate(investment.project_name);
            document.getElementById('detail-status').textContent = investment.status === 'active' ? 'Активна' : 'Завершена';
            document.getElementById('detail-transaction').textContent = investment.transaction_id;
            
            investmentDetailModal.classList.remove('hidden');
        }
    }
    
    function updateStats(investments) {
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const activeInvestments = investments.filter(inv => inv.status === 'active');
        const activeAmount = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        
        // Update stat cards
        const totalInvestedEl = document.querySelector('.stat-card-value');
        const activeInvestedEl = document.querySelectorAll('.stat-card-value')[1];
        const incomeEl = document.querySelectorAll('.stat-card-value')[2];
        
        if (totalInvestedEl) totalInvestedEl.textContent = `$${totalInvested.toFixed(2)}`;
        if (activeInvestedEl) activeInvestedEl.textContent = `$${activeAmount.toFixed(2)}`;
        if (incomeEl) incomeEl.textContent = `$0.00`; // No income calculation for now
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }
    
    function getInterestRate(projectName) {
        const rates = {
            'Дирижабли': '12% годовых',
            'Совэлмаш': '15% годовых',
            'Солнечные панели': '10% годовых'
        };
        return rates[projectName] || 'N/A';
    }
    
    function showSuccess(message) {
        if (successNotification) {
            const notificationText = successNotification.querySelector('#notification-text');
            if (notificationText) notificationText.textContent = message;
            successNotification.classList.remove('hidden');
            
            setTimeout(() => {
                successNotification.classList.add('hidden');
            }, 3000);
        }
    }
});
