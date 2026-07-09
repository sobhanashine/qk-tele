import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { telegram_id, invite_code } = await req.json();

    if (!telegram_id || !invite_code) {
      return NextResponse.json({ error: 'telegram_id and invite_code are required' }, { status: 400 });
    }

    // 1. Find match by invite_code where status='waiting'
    const { data: match, error: fetchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('invite_code', invite_code)
      .eq('status', 'waiting')
      .single();

    // 2. Not found
    if (fetchError || !match) {
      return NextResponse.json({ error: 'Match not found or not available' }, { status: 404 });
    }

    // 3. Already has player_b
    if (match.player_b_id) {
      return NextResponse.json({ error: 'Match is full' }, { status: 400 });
    }

    // 4. Cannot join own match
    if (match.player_a_id === telegram_id) {
      return NextResponse.json({ error: 'Cannot join your own match' }, { status: 400 });
    }

    // 5. Update match: set player_b and move to category_select
    const { error: updateError } = await supabaseAdmin
      .from('matches')
      .update({ player_b_id: telegram_id, status: 'category_select' })
      .eq('id', match.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 6. Return match info
    return NextResponse.json({
      match_id: match.id,
      total_rounds: match.total_rounds,
      current_round: match.current_round,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
