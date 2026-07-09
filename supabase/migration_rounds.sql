-- Migration: Add round-by-round gameplay columns to matches table
-- Safe: uses ADD COLUMN IF NOT EXISTS — will not fail if columns already exist

ALTER TABLE matches ADD COLUMN IF NOT EXISTS total_rounds   INTEGER DEFAULT 3;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_round  INTEGER DEFAULT 1;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS rounds         JSONB   DEFAULT '[]';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS invite_code    TEXT    UNIQUE;

-- Index for fast invite_code lookups
CREATE INDEX IF NOT EXISTS idx_matches_invite_code ON matches (invite_code);
