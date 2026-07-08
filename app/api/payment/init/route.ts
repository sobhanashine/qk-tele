import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '00000000-0000-0000-0000-000000000000';
const ZARINPAL_REQUEST_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_STARTPAY_URL = 'https://www.zarinpal.com/pg/StartPay/';

export async function POST(req: NextRequest) {
  try {
    const { telegram_id, amount_toman } = await req.json();

    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: telegram_id,
        amount_toman,
        status: 'pending',
      })
      .select()
      .single();

    if (txError) throw txError;

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?tx_id=${tx.id}`;

    // For testing, just return a mock URL if Zarinpal config is empty
    if (ZARINPAL_MERCHANT_ID === '00000000-0000-0000-0000-000000000000') {
      return NextResponse.json({ url: `https://sandbox.zarinpal.com/pg/StartPay/mock-authority` });
    }

    const res = await fetch(ZARINPAL_REQUEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: amount_toman * 10, // Rials
        callback_url: callbackUrl,
        description: `خرید سکه برای کاربر ${telegram_id}`
      })
    });

    const data = await res.json();
    if (data.data.code === 100) {
      return NextResponse.json({ url: `${ZARINPAL_STARTPAY_URL}${data.data.authority}` });
    } else {
      return NextResponse.json({ error: 'Zarinpal request failed', details: data }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
