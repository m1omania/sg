// Wallet page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wallet page loaded, initializing...');
    
    const userId = 1; // demo user
    const mainBalanceEl = document.getElementById('main-balance-amount');
    const partnerBalanceEl = document.getElementById('partner-balance-amount');
    
    console.log('Wallet elements found:', {
        mainBalanceEl: !!mainBalanceEl,
        partnerBalanceEl: !!partnerBalanceEl
    });

    // Load balances from API
    async function loadWalletBalances() {
        try {
            console.log('Loading wallet balances...');
            const res = await fetch(`/api/wallet/${userId}`);
            console.log('Wallet API response status:', res.status);
            if (!res.ok) {
                console.log('Wallet API response not ok:', res.status);
                return;
            }
            const wallet = await res.json();
            console.log('Wallet API data:', wallet);
            
            if (mainBalanceEl) {
                mainBalanceEl.textContent = `${Number(wallet.main_balance).toFixed(2)} $`;
            }
            if (partnerBalanceEl) {
                partnerBalanceEl.textContent = `${Number(wallet.partner_balance || 0).toFixed(2)} $`;
            }
            console.log('Wallet balances updated');
        } catch (e) {
            console.error('Error loading wallet balances:', e);
        }
    }

    // Load transactions from API
    async function loadTransactions() {
        try {
            console.log('Loading transactions...');
            const res = await fetch(`/api/transactions/${userId}`);
            console.log('Transactions API response status:', res.status);
            if (!res.ok) {
                console.log('Transactions API response not ok:', res.status);
                return;
            }
            const transactions = await res.json();
            console.log('Transactions data:', transactions);
            
            const tbody = document.querySelector('#transactions-table tbody');
            if (tbody && transactions.length > 0) {
                tbody.innerHTML = transactions.map(tx => `
                    <tr>
                        <td>${tx.type}</td>
                        <td>${new Date(tx.date).toLocaleDateString()}</td>
                        <td>${tx.amount} ${tx.currency}</td>
                        <td>${tx.description || 'Пополнение счета'}</td>
                        <td><span class="status-${tx.status}">${tx.status}</span></td>
                    </tr>
                `).join('');
            } else if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5">Нет операций</td></tr>';
            }
            console.log('Transactions loaded');
        } catch (e) {
            console.error('Error loading transactions:', e);
        }
    }


    // Initialize page
    loadWalletBalances();
    loadTransactions();



});
