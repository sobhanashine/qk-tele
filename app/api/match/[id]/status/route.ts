import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    const { data: match, error } = await supabaseAdmin
      .from('matches')
      .select('status, current_round, total_rounds, rounds, player_a_id, player_b_id, winner_id')
      .eq('id', matchId)
      .single();

    if (error || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: match.status,
      current_round: match.current_round,
      total_rounds: match.total_rounds,
      rounds: match.rounds,
      player_a_id: match.player_a_id,
      player_b_id: match.player_b_id,
      winner_id: match.winner_id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
