import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '00000000-0000-0000-0000-000000000000';
const ZARINPAL_VERIFY_URL = 'https://api.zarinpal.com/pg/v4/payment/verify.json';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tx_id = searchParams.get('tx_id');
  const authority = searchParams.get('Authority');
  const status = searchParams.get('Status');

  if (!tx_id || !authority) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    if (status !== 'OK') {
      await supabaseAdmin.from('transactions').update({ status: 'failed' }).eq('id', tx_id);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?payment=failed`);
    }

    const { data: tx } = await supabaseAdmin.from('transactions').select('*').eq('id', tx_id).single();
    if (!tx || tx.status !== 'pending') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?payment=invalid`);
    }

    let isVerified = false;

    if (ZARINPAL_MERCHANT_ID === '00000000-0000-0000-0000-000000000000') {
      // Mock verification
      isVerified = true;
    } else {
      const res = await fetch(ZARINPAL_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          merchant_id: ZARINPAL_MERCHANT_ID,
          amount: tx.amount_toman * 10, // Rials
          authority: authority
        })
      });
      const data = await res.json();
      if (data.data.code === 100 || data.data.code === 101) {
        isVerified = true;
      }
    }

    if (isVerified) {
      // Calculate coins to add (mock conversion)
      const coinsToAdd = tx.amount_toman / 100; 

      await supabaseAdmin.from('transactions').update({ status: 'success', zarinpal_ref_id: authority }).eq('id', tx_id);
      
      // Credit user
      const { data: user } = await supabaseAdmin.from('users').select('wallet_balance').eq('telegram_id', tx.user_id).single();
      if (user) {
        await supabaseAdmin.from('users').update({ wallet_balance: user.wallet_balance + coinsToAdd }).eq('telegram_id', tx.user_id);
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?payment=success`);
    } else {
      await supabaseAdmin.from('transactions').update({ status: 'failed' }).eq('id', tx_id);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?payment=failed`);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
