-- Performance optimization indexes for ContractClarity
-- Run this migration to improve query performance

-- Index for contract queries by user and creation date (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_user_id_created_at 
ON contracts(user_id, created_at DESC);

-- Index for usage tracking queries (monthly/daily usage calculations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_logs_user_operation_date 
ON usage_logs(user_id, operation, created_at);

-- Index for Stripe customer lookups (webhook processing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_stripe_customer_id 
ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Case-insensitive email lookup index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
ON users(LOWER(email));

-- Index for contract analysis status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_analysis_complete 
ON contracts(analysis_complete, created_at DESC);

-- Index for user account status queries (plan-based filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_account_status 
ON users(account_status) WHERE account_status IS NOT NULL;

-- JSONB indexes for contract analysis data queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_risk_assessment_gin 
ON contracts USING GIN (risk_assessment) WHERE risk_assessment IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_key_terms_gin 
ON contracts USING GIN (key_terms) WHERE key_terms IS NOT NULL;

-- Index for pending registrations cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pending_registrations_expires_at 
ON pending_registrations(expires_at);

-- Index for session cleanup (if using database sessions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expire 
ON sessions(expire);

-- Add foreign key constraints for data integrity
ALTER TABLE contracts 
ADD CONSTRAINT IF NOT EXISTS fk_contracts_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE usage_logs 
ADD CONSTRAINT IF NOT EXISTS fk_usage_logs_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE usage_logs 
ADD CONSTRAINT IF NOT EXISTS fk_usage_logs_contract_id 
FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL;

-- Add check constraints for data validation
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS chk_users_account_status 
CHECK (account_status IN ('free', 'plus', 'pro', 'premium'));

ALTER TABLE contracts 
ADD CONSTRAINT IF NOT EXISTS chk_contracts_language 
CHECK (detected_language ~ '^[a-z]{2}$' AND analysis_language ~ '^[a-z]{2}$');

-- Add partial indexes for common filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_verified 
ON users(email_verified) WHERE email_verified = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_payment_failed 
ON users(payment_failed) WHERE payment_failed = true;

-- Analyze tables to update statistics after index creation
ANALYZE contracts;
ANALYZE users;
ANALYZE usage_logs;
ANALYZE pending_registrations;