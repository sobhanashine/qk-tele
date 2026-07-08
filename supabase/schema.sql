-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  telegram_id BIGINT PRIMARY KEY,
  display_name TEXT NOT NULL,
  rank_score INTEGER DEFAULT 0,
  wallet_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: rank_tier (Bronze, Silver, Gold, Diamond) is derived on front-end:
-- Bronze: 0-499, Silver: 500-999, Gold: 1000-1499, Diamond: 1500+

-- 2. Create Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings e.g. ["روسیه", "کانادا", "چین", "آمریکا"]
  correct_index INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a_id BIGINT REFERENCES users(telegram_id) ON DELETE SET NULL,
  player_b_id BIGINT REFERENCES users(telegram_id) ON DELETE SET NULL,
  status TEXT DEFAULT 'waiting', -- waiting, active, complete
  question_set INTEGER[], -- Array of question ids
  winner_id BIGINT REFERENCES users(telegram_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Match Answers Table
CREATE TABLE IF NOT EXISTS match_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_index INTEGER NOT NULL,
  correct BOOLEAN NOT NULL,
  answer_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Transactions Table (For Coin Packages Zarinpal integration)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  amount_toman INTEGER NOT NULL,
  zarinpal_ref_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, success, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Insert Seed Questions (General Knowledge Categories)
-- For all questions, the correct option is placed at index 0 (الف)
INSERT INTO questions (text, options, correct_index, category, difficulty) VALUES
-- Geography (جغرافیا)
('بزرگ‌ترین کشور جهان از نظر وسعت کدام است؟', '["روسیه", "کانادا", "چین", "آمریکا"]'::jsonb, 0, 'جغرافیا', 'easy'),
('طولانی‌ترین رودخانه جهان کدام است؟', '["نیل", "آمازون", "میسیسیپی", "یانگ‌تسه"]'::jsonb, 0, 'جغرافیا', 'easy'),
('بلندترین قله جهان کدام است؟', '["اورست", "کی۲", "کانگچنجونگا", "ماکالو"]'::jsonb, 0, 'جغرافیا', 'easy'),
('کوچک‌ترین کشور جهان از نظر مساحت کدام است؟', '["واتیکان", "موناکو", "نائورو", "سان مارینو"]'::jsonb, 0, 'جغرافیا', 'medium'),

-- History (تاریخ)
('جنگ جهانی دوم در چه سالی پایان یافت؟', '["۱۹۴۵", "۱۹۴۴", "۱۹۴۶", "۱۹۴۰"]'::jsonb, 0, 'تاریخ', 'easy'),
('کوروش بزرگ بنیان‌گذار کدام امپراتوری بود؟', '["هخامنشی", "ساسانی", "اشکانی", "ماد"]'::jsonb, 0, 'تاریخ', 'easy'),
('دیوار برلین در چه سالی فروریخت؟', '["۱۹۸۹", "۱۹۹۱", "۱۹۸۷", "۱۹۹۰"]'::jsonb, 0, 'تاریخ', 'medium'),
('انقلاب اسلامی ایران در چه سال میلادی رخ داد؟', '["۱۹۷۹", "۱۹۸۰", "۱۹۷۷", "۱۹۸۱"]'::jsonb, 0, 'تاریخ', 'easy'),

-- Science (علوم)
('سریع‌ترین چیز در جهان چیست؟', '["نور", "صوت", "الکتریسیته", "باد"]'::jsonb, 0, 'علوم', 'easy'),
('نماد شیمیایی طلا کدام است؟', '["Au", "Ag", "Fe", "Pb"]'::jsonb, 0, 'علوم', 'easy'),
('کوچک‌ترین واحد سازنده ماده چیست؟', '["اتم", "مولکول", "سلول", "یون"]'::jsonb, 0, 'علوم', 'easy'),
('نزدیک‌ترین سیاره به خورشید کدام است؟', '["عطارد", "زهره", "زمین", "مریخ"]'::jsonb, 0, 'علوم', 'easy'),

-- Sports (ورزش)
('بازی‌های المپیک هر چند سال یک‌بار برگزار می‌شود؟', '["۴ سال", "۲ سال", "۳ سال", "۵ سال"]'::jsonb, 0, 'ورزش', 'easy'),
('هر تیم فوتبال در زمین چند بازیکن دارد؟', '["۱۱", "۱۰", "۱۲", "۹"]'::jsonb, 0, 'ورزش', 'easy'),
('جام جهانی فوتبال ۲۰۲۲ در کدام کشور برگزار شد؟', '["قطر", "روسیه", "برزیل", "ژاپن"]'::jsonb, 0, 'ورزش', 'easy'),
('کدام کشور بیشترین قهرمانی جام جهانی فوتبال را دارد؟', '["برزیل", "آلمان", "ایتالیا", "آرژانتین"]'::jsonb, 0, 'ورزش', 'easy'),

-- Art & Cinema (سینما و هنر)
('جایزه اسکار هر سال توسط کدام نهاد اهدا می‌شود؟', '["آکادمی علوم و هنرهای سینمایی آمریکا", "آکادمی هنر بریتانیا", "جشنواره کن", "گلدن گلوب"]'::jsonb, 0, 'سینما و هنر', 'medium'),
('تابلوی «مونالیزا» اثر کیست؟', '["لئوناردو داوینچی", "میکل‌آنژ", "رافائل", "ونسان ونگوگ"]'::jsonb, 0, 'سینما و هنر', 'easy'),
('کارگردان فیلم «تایتانیک» (۱۹۹۷) چه کسی است؟', '["جیمز کامرون", "استیون اسپیلبرگ", "کریستوفر نولان", "مارتین اسکورسیزی"]'::jsonb, 0, 'سینما و هنر', 'easy'),
('جشنواره فیلم کن در کدام کشور برگزار می‌شود؟', '["فرانسه", "ایتالیا", "آمریکا", "آلمان"]'::jsonb, 0, 'سینما و هنر', 'easy'),

-- Literature (ادبیات)
('شاهنامه اثر کدام شاعر ایرانی است؟', '["فردوسی", "سعدی", "حافظ", "مولوی"]'::jsonb, 0, 'ادبیات', 'easy'),
('«بوستان» و «گلستان» اثر کدام شاعر ایرانی است? ', '["سعدی", "حافظ", "فردوسی", "نظامی"]'::jsonb, 0, 'ادبیات', 'easy'),
('نویسنده رمان «جنگ و صلح» چه کسی است؟', '["لئو تولستوی", "داستایوفسکی", "آنتون چخوف", "الکساندر پوشکین"]'::jsonb, 0, 'ادبیات', 'medium'),
('کدام شاعر فارسی که به «لسان‌الغیب» معروف است، مقبره‌اش در شیراز قرار دارد؟', '["حافظ", "سعدی", "مولوی", "خیام"]'::jsonb, 0, 'ادبیات', 'easy')
ON CONFLICT DO NOTHING;
