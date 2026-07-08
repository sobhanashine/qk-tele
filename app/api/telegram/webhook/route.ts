import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Check if it's a new message
    if (update.message && update.message.text) {
      const text = update.message.text;
      const chatId = update.message.chat.id;
      const from = update.message.from;

      if (text.startsWith('/start')) {
        // Parse deep link if present (e.g. /start match_12345)
        const parts = text.split(' ');
        const payload = parts.length > 1 ? parts[1] : null;

        // Upsert user
        await supabaseAdmin.from('users').upsert({
          telegram_id: from.id,
          display_name: from.first_name || from.username || 'User',
        }, { onConflict: 'telegram_id' });

        const miniAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://t.me/placeholder_bot/app';

        // Send welcome message with Mini App button
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        if (BOT_TOKEN) {
          const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
          
          let replyText = 'به کوییز آو کینگز تلگرام خوش آمدید! برای شروع بازی روی دکمه زیر کلیک کنید.';
          let startappParam = '';

          if (payload && payload.startsWith('match_')) {
            replyText = 'شما به یک بازی دعوت شدید! وارد شوید تا مبارزه کنید.';
            startappParam = `?startapp=${payload}`;
          }

          await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: replyText,
              reply_markup: {
                inline_keyboard: [
                  [{ text: 'شروع بازی', web_app: { url: `${miniAppUrl}${startappParam}` } }]
                ]
              }
            })
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
