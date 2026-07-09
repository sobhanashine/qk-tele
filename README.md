# Quiz of Kings - Telegram Mini App (QK-Tele)

A multiplayer trivia game built as a Telegram Mini App. Players can challenge each other, answer randomly shuffled questions from a robust database, and bet/win in-game currency integrated with Zarinpal.

## 🚀 Tech Stack
- **Frontend & Backend**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Payments**: Zarinpal (Toman)
- **Telegram Integration**: Telegram Webhooks & Web App API

## 📋 Features
- **Real-Time Matches**: Asynchronous matching system tracking states between two players.
- **Dynamic Questions**: 120 seed questions automatically shuffled (options randomized dynamically) upon insertion to prevent predictability.
- **Telegram Bot Webhook**: Receives `/start` commands and payloads to automatically create/upsert users and serve the Mini App button.
- **Zarinpal Payment Gateway**: Automatic callback routing for wallet top-ups.
- **Clean UI/UX**: Designed for mobile (Telegram Web App container) with responsive layouts.

## 🛠 Project Setup

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

TELEGRAM_BOT_TOKEN=your-bot-token
ZARINPAL_MERCHANT_ID=your-36-char-merchant-id
NEXT_PUBLIC_APP_URL=https://qk-tele.vercel.app
```

### 2. Database Initialization (Supabase)
Navigate to your Supabase SQL Editor and run the queries found in `supabase_schema_complete.sql` to:
1. Clear old tables (Cascade Drop).
2. Create `users`, `questions`, `matches`, `match_answers`, and `transactions` tables.
3. Seed 120 trivia questions (options are structured securely using `jsonb_build_array`).

### 3. Local Development
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:3000`. 
*Note: To test Telegram Webhooks locally, you must use a tunneling service like [ngrok](https://ngrok.com/) to expose your local port via HTTPS.*

## 🚀 Deployment (Vercel)
This project is fully optimized for Vercel. 
1. Link the project: `npx vercel`
2. Push to production: `npx vercel --prod`
3. **Important**: Add your environment variables in the Vercel Dashboard -> Settings -> Environment Variables. Then click **Redeploy** so they take effect.
4. Update `NEXT_PUBLIC_APP_URL` in Vercel to match your final production domain (e.g., `https://qk-tele.vercel.app`).

## 🤖 Bot Setup (BotFather)
1. Send `/setdomain` to BotFather and enter your Vercel production URL (e.g., `https://qk-tele.vercel.app`).
2. Set your webhook to hit the Next.js API route:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://qk-tele.vercel.app/api/telegram/webhook"
   ```

## 🐛 Troubleshooting
- **Game button opens externally instead of a Mini App**: Ensure `NEXT_PUBLIC_APP_URL` is correct in Vercel and you redeployed. Telegram strictly requires valid HTTPS domains for `web_app` buttons.
- **Supabase Insert Errors**: Use `supabase_schema_complete.sql` which relies on `jsonb_build_array` to avoid copy-paste newline syntax errors.
