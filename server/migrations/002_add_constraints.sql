-- Migration: Add database constraints and foreign keys
-- Created: 2025-01-03
-- Description: Add foreign key constraints and check constraints for data integrity

-- Add foreign key constraints
-- Note: SQLite doesn't enforce foreign keys by default, but we add them for documentation
-- and to enable them with PRAGMA foreign_keys = ON

-- Foreign key constraints for coupon_history
-- ALTER TABLE coupon_history ADD CONSTRAINT fk_coupon_history_coupon_id 
--   FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE;
-- ALTER TABLE coupon_history ADD CONSTRAINT fk_coupon_history_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign key constraints for investments
-- ALTER TABLE investments ADD CONSTRAINT fk_investments_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE investments ADD CONSTRAINT fk_investments_coupon_id 
--   FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- Foreign key constraints for wallets
-- ALTER TABLE wallets ADD CONSTRAINT fk_wallets_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign key constraints for transactions
-- ALTER TABLE transactions ADD CONSTRAINT fk_transactions_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign key constraints for notifications
-- ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add check constraints for data validation
-- Note: SQLite doesn't support CHECK constraints in ALTER TABLE, 
-- but we document them for future reference

-- Check constraints for users table
-- ALTER TABLE users ADD CONSTRAINT chk_users_email_verified 
--   CHECK (email_verified IN (0, 1));
-- ALTER TABLE users ADD CONSTRAINT chk_users_phone_verified 
--   CHECK (phone_verified IN (0, 1));

-- Check constraints for coupons table
-- ALTER TABLE coupons ADD CONSTRAINT chk_coupons_status 
--   CHECK (status IN ('active', 'expired', 'used', 'expiring'));
-- ALTER TABLE coupons ADD CONSTRAINT chk_coupons_min_amount 
--   CHECK (min_amount >= 0);
-- ALTER TABLE coupons ADD CONSTRAINT chk_coupons_days_left 
--   CHECK (days_left >= 0);

-- Check constraints for investments table
-- ALTER TABLE investments ADD CONSTRAINT chk_investments_amount 
--   CHECK (amount > 0);
-- ALTER TABLE investments ADD CONSTRAINT chk_investments_final_amount 
--   CHECK (final_amount > 0);
-- ALTER TABLE investments ADD CONSTRAINT chk_investments_status 
--   CHECK (status IN ('active', 'completed', 'cancelled'));

-- Check constraints for wallets table
-- ALTER TABLE wallets ADD CONSTRAINT chk_wallets_main_balance 
--   CHECK (main_balance >= 0);
-- ALTER TABLE wallets ADD CONSTRAINT chk_wallets_bonus_balance 
--   CHECK (bonus_balance >= 0);
-- ALTER TABLE wallets ADD CONSTRAINT chk_wallets_partner_balance 
--   CHECK (partner_balance >= 0);

-- Check constraints for transactions table
-- ALTER TABLE transactions ADD CONSTRAINT chk_transactions_amount 
--   CHECK (amount > 0);
-- ALTER TABLE transactions ADD CONSTRAINT chk_transactions_type 
--   CHECK (type IN ('deposit', 'withdrawal', 'investment', 'coupon', 'refund'));
-- ALTER TABLE transactions ADD CONSTRAINT chk_transactions_status 
--   CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));
-- ALTER TABLE transactions ADD CONSTRAINT chk_transactions_currency 
--   CHECK (currency IN ('USD', 'EUR', 'GBP', 'RUB'));

-- Check constraints for projects table
-- ALTER TABLE projects ADD CONSTRAINT chk_projects_min_investment 
--   CHECK (min_investment >= 0);
-- ALTER TABLE projects ADD CONSTRAINT chk_projects_interest_rate 
--   CHECK (interest_rate >= 0 AND interest_rate <= 100);
-- ALTER TABLE projects ADD CONSTRAINT chk_projects_duration 
--   CHECK (duration > 0);
-- ALTER TABLE projects ADD CONSTRAINT chk_projects_status 
--   CHECK (status IN ('active', 'completed', 'upcoming', 'paused'));

-- Check constraints for notifications table
-- ALTER TABLE notifications ADD CONSTRAINT chk_notifications_is_read 
--   CHECK (is_read IN (0, 1));
-- ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type 
--   CHECK (type IN ('info', 'success', 'warning', 'error'));
