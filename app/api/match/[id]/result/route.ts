import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params;

    const { data: match } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    return NextResponse.json({
      status: match.status,
      winner_id: match.winner_id,
      player_a_id: match.player_a_id,
      player_b_id: match.player_b_id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
