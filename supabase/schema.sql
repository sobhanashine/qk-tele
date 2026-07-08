-- Phase 1 - Core Data Model

CREATE TABLE users (
  telegram_id BIGINT PRIMARY KEY,
  display_name TEXT,
  rank_score INTEGER DEFAULT 0,
  wallet_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: rank_tier (Bronze, Silver, Gold, Diamond) is derived:
-- Bronze: 0-499, Silver: 500-999, Gold: 1000-1499, Diamond: 1500+

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings
  correct_index INTEGER NOT NULL,
  category TEXT,
  difficulty TEXT
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a_id BIGINT REFERENCES users(telegram_id),
  player_b_id BIGINT REFERENCES users(telegram_id),
  status TEXT DEFAULT 'waiting', -- waiting, active, complete
  question_set INTEGER[], -- Array of question ids
  winner_id BIGINT REFERENCES users(telegram_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE match_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id),
  user_id BIGINT REFERENCES users(telegram_id),
  question_id INTEGER REFERENCES questions(id),
  selected_index INTEGER NOT NULL,
  correct BOOLEAN NOT NULL,
  answer_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(telegram_id),
  amount_toman INTEGER NOT NULL,
  zarinpal_ref_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, success, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
