import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params;
    const { telegram_id } = await req.json();

    const { data: match } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    const { count: countA } = await supabaseAdmin
      .from('match_answers')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId)
      .eq('user_id', match.player_a_id);

    let countB = 0;
    if (match.player_b_id) {
      const { count } = await supabaseAdmin
        .from('match_answers')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', matchId)
        .eq('user_id', match.player_b_id);
      countB = count || 0;
    }

    const totalQuestions = match.question_set ? match.question_set.length : 0;

    if (totalQuestions > 0 && countA === totalQuestions && countB === totalQuestions) {
      const { data: answers } = await supabaseAdmin
        .from('match_answers')
        .select('*')
        .eq('match_id', matchId);

      let scoreA = 0;
      let scoreB = 0;

      answers?.forEach((ans) => {
        if (ans.correct) {
          if (ans.user_id === match.player_a_id) scoreA++;
          else if (ans.user_id === match.player_b_id) scoreB++;
        }
      });

      let winnerId = null;
      if (scoreA > scoreB) winnerId = match.player_a_id;
      else if (scoreB > scoreA) winnerId = match.player_b_id;

      await supabaseAdmin
        .from('matches')
        .update({ status: 'complete', winner_id: winnerId })
        .eq('id', matchId);

      return NextResponse.json({ status: 'complete', winner_id: winnerId });
    }

    return NextResponse.json({ status: 'waiting' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
