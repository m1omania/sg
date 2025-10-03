-- Migration: Add database indexes for performance optimization
-- Created: 2025-01-03
-- Description: Add indexes to frequently queried columns

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Indexes for coupons table
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_project ON coupons(project);
CREATE INDEX IF NOT EXISTS idx_coupons_expiry_date ON coupons(expiry_date);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at);

-- Indexes for coupon_history table
CREATE INDEX IF NOT EXISTS idx_coupon_history_user_id ON coupon_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_history_coupon_id ON coupon_history(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_history_action ON coupon_history(action);
CREATE INDEX IF NOT EXISTS idx_coupon_history_created_at ON coupon_history(created_at);
CREATE INDEX IF NOT EXISTS idx_coupon_history_user_coupon ON coupon_history(user_id, coupon_id);

-- Indexes for investments table
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON investments(project_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);
CREATE INDEX IF NOT EXISTS idx_investments_user_status ON investments(user_id, status);

-- Indexes for wallets table
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions(transaction_id);

-- Indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_min_investment ON projects(min_investment);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
