import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const MINI_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qk-tele.vercel.app';

async function sendMessage(chatId: number, text: string, extra?: object) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // ── Handle regular messages ─────────────────────────────────────────────
    if (update.message?.text) {
      const text: string = update.message.text;
      const chatId: number = update.message.chat.id;
      const from = update.message.from;

      // Register / update user on every interaction
      await supabaseAdmin.from('users').upsert(
        {
          telegram_id: from.id,
          display_name: from.first_name || from.username || 'User',
        },
        { onConflict: 'telegram_id' }
      );

      if (text.startsWith('/start')) {
        // Parse optional deep-link payload: /start match_<uuid>
        const parts = text.split(' ');
        const payload = parts.length > 1 ? parts[1] : null;

        let replyText: string;
        // Build the web_app URL. Telegram passes the startapp value via its own
        // mechanism – we append it as a query param so the Mini App can also
        // read it via URLSearchParams as a fallback when opened outside Telegram.
        let webAppUrl = MINI_APP_URL;

        if (payload?.startsWith('match_')) {
          replyText =
            '⚔️ شما به یک مبارزه دعوت شدید!\n\nروی دکمه زیر کلیک کنید تا وارد میدان شوید.';
          // The startapp param is appended so AppController can detect the match id
          webAppUrl = `${MINI_APP_URL}?startapp=${payload}`;
        } else {
          replyText =
            `🎮 <b>به کوییز آو کینگز خوش آمدید!</b>\n\n` +
            `با دوستانت رقابت کن، به سوالات اطلاعات عمومی پاسخ بده و به صدر جدول برس!\n\n` +
            `برای شروع روی دکمه زیر کلیک کنید 👇`;
        }

        await sendMessage(chatId, replyText, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🎮 ورود به بازی',
                  web_app: { url: webAppUrl },
                },
              ],
            ],
          },
        });
      } else if (text.startsWith('/help')) {
        await sendMessage(
          chatId,
          '📖 <b>راهنما</b>\n\n' +
          '/start – شروع و ورود به بازی\n' +
          '/help – نمایش این راهنما\n\n' +
          'همچنین می‌توانید از دکمه <b>«🎮 بازی کن»</b> پایین صفحه مستقیماً وارد بازی شوید.'
        );
      } else {
        // Unknown command – prompt the launch button
        await sendMessage(
          chatId,
          '👋 از دکمه زیر وارد بازی شو!',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🎮 ورود به بازی', web_app: { url: MINI_APP_URL } }],
              ],
            },
          }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
