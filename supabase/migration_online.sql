-- Migration: Add last_seen for online presence tracking
-- Safe: uses ADD COLUMN IF NOT EXISTS
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Index for fast "recently active" queries
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users (last_seen);
