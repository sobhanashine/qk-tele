import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/user/heartbeat  { telegram_id }
// Updates last_seen to NOW() so this user appears online.
export async function POST(req: NextRequest) {
  try {
    const { telegram_id } = await req.json();
    if (!telegram_id) {
      return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 });
    }

    await supabaseAdmin
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('telegram_id', telegram_id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
