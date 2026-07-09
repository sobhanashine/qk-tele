import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { telegram_id } = await req.json();

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id is required' }, { status: 400 });
    }

    // 1. Upsert user
    await supabaseAdmin
      .from('users')
      .upsert({ telegram_id, display_name: 'User' }, { onConflict: 'telegram_id', ignoreDuplicates: true });

    // 2. Generate a unique invite code
    const invite_code = generateInviteCode();

    // 3. Insert new match
    const { data: match, error } = await supabaseAdmin
      .from('matches')
      .insert({
        player_a_id: telegram_id,
        status: 'waiting',
        total_rounds: 3,
        current_round: 1,
        rounds: [],
        invite_code,
        question_set: [],
      })
      .select('id, invite_code')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Return match_id and invite_code
    return NextResponse.json({ match_id: match.id, invite_code: match.invite_code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
