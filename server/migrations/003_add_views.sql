-- Migration: Add database views for common queries
-- Created: 2025-01-03
-- Description: Create views to simplify common queries and improve performance

-- View for user wallet summary
CREATE VIEW IF NOT EXISTS user_wallet_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    w.main_balance,
    w.bonus_balance,
    w.partner_balance,
    (w.main_balance + w.bonus_balance + w.partner_balance) as total_balance,
    w.created_at as wallet_created_at,
    w.updated_at as wallet_updated_at
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id;

-- View for active user coupons
CREATE VIEW IF NOT EXISTS active_user_coupons AS
SELECT 
    ch.user_id,
    c.id as coupon_id,
    c.name as coupon_name,
    c.project,
    c.project_color,
    c.bonus,
    c.expiry_date,
    c.days_left,
    c.conditions,
    c.code,
    c.description,
    c.min_amount,
    c.status as coupon_status,
    ch.action,
    ch.created_at as action_date
FROM coupon_history ch
JOIN coupons c ON ch.coupon_id = c.id
WHERE c.status IN ('active', 'expiring')
  AND ch.action IN ('created', 'activated')
ORDER BY c.expiry_date ASC;

-- View for user investment summary
CREATE VIEW IF NOT EXISTS user_investment_summary AS
SELECT 
    i.user_id,
    COUNT(*) as total_investments,
    SUM(i.amount) as total_invested,
    SUM(i.final_amount) as total_final_amount,
    AVG(i.amount) as avg_investment,
    COUNT(CASE WHEN i.status = 'active' THEN 1 END) as active_investments,
    COUNT(CASE WHEN i.status = 'completed' THEN 1 END) as completed_investments,
    COUNT(CASE WHEN i.status = 'cancelled' THEN 1 END) as cancelled_investments,
    SUM(CASE WHEN i.status = 'active' THEN i.amount ELSE 0 END) as active_amount,
    SUM(CASE WHEN i.status = 'completed' THEN i.final_amount ELSE 0 END) as completed_amount
FROM investments i
GROUP BY i.user_id;

-- View for project statistics
CREATE VIEW IF NOT EXISTS project_statistics AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.status,
    p.min_investment,
    p.interest_rate,
    p.duration,
    COUNT(i.id) as total_investments,
    COUNT(CASE WHEN i.status = 'active' THEN 1 END) as active_investments,
    SUM(i.amount) as total_invested,
    AVG(i.amount) as avg_investment,
    MIN(i.created_at) as first_investment_date,
    MAX(i.created_at) as last_investment_date
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id
GROUP BY p.id, p.name, p.status, p.min_investment, p.interest_rate, p.duration;

-- View for transaction summary
CREATE VIEW IF NOT EXISTS transaction_summary AS
SELECT 
    t.user_id,
    t.type,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount,
    MIN(t.created_at) as first_transaction,
    MAX(t.created_at) as last_transaction,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_count
FROM transactions t
GROUP BY t.user_id, t.type;

-- View for user activity summary
CREATE VIEW IF NOT EXISTS user_activity_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.created_at as registration_date,
    ws.total_balance,
    iis.total_investments,
    iis.total_invested,
    iis.active_investments,
    auc.coupon_count,
    ts.deposit_count,
    ts.deposit_total,
    ts.investment_count,
    ts.investment_total
FROM users u
LEFT JOIN user_wallet_summary ws ON u.id = ws.user_id
LEFT JOIN user_investment_summary iis ON u.id = iis.user_id
LEFT JOIN (
    SELECT 
        user_id, 
        COUNT(*) as coupon_count 
    FROM active_user_coupons 
    GROUP BY user_id
) auc ON u.id = auc.user_id
LEFT JOIN (
    SELECT 
        user_id,
        SUM(CASE WHEN type = 'deposit' THEN transaction_count ELSE 0 END) as deposit_count,
        SUM(CASE WHEN type = 'deposit' THEN total_amount ELSE 0 END) as deposit_total,
        SUM(CASE WHEN type = 'investment' THEN transaction_count ELSE 0 END) as investment_count,
        SUM(CASE WHEN type = 'investment' THEN total_amount ELSE 0 END) as investment_total
    FROM transaction_summary
    GROUP BY user_id
) ts ON u.id = ts.user_id;
