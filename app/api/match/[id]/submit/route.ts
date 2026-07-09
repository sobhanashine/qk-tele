import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RoundObject {
  round: number;
  category: string;
  question_set: number[];
  player_a_done: boolean;
  player_b_done: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const { telegram_id } = await req.json();

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id is required' }, { status: 400 });
    }

    // 1. Fetch match
    const { data: match, error: fetchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const rounds: RoundObject[] = Array.isArray(match.rounds) ? match.rounds : [];
    const currentRound: number = match.current_round;
    const totalRounds: number = match.total_rounds;

    // 2. Find the current round object
    const roundIndex = rounds.findIndex((r) => r.round === currentRound);
    if (roundIndex === -1) {
      return NextResponse.json({ error: 'Current round not initialized — category not selected yet' }, { status: 400 });
    }

    const currentRoundObj = { ...rounds[roundIndex] };

    // 3. Mark current player as done
    if (telegram_id === match.player_a_id) {
      currentRoundObj.player_a_done = true;
    } else if (telegram_id === match.player_b_id) {
      currentRoundObj.player_b_done = true;
    } else {
      return NextResponse.json({ error: 'Player not part of this match' }, { status: 403 });
    }

    // 4. Update rounds array
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex] = currentRoundObj;

    const bothDone = currentRoundObj.player_a_done && currentRoundObj.player_b_done;

    // 5a. Not both done yet → save progress and return waiting
    if (!bothDone) {
      await supabaseAdmin
        .from('matches')
        .update({ rounds: updatedRounds })
        .eq('id', matchId);

      return NextResponse.json({ status: 'round_waiting', round: currentRound });
    }

    // 5b. Both done and more rounds remain → advance round
    if (currentRound < totalRounds) {
      const newRound = currentRound + 1;

      await supabaseAdmin
        .from('matches')
        .update({
          current_round: newRound,
          status: 'category_select',
          rounds: updatedRounds,
        })
        .eq('id', matchId);

      return NextResponse.json({ status: 'next_round', round: newRound });
    }

    // 5c. Both done and this was the final round → calculate winner
    const { data: answers } = await supabaseAdmin
      .from('match_answers')
      .select('user_id, correct')
      .eq('match_id', matchId);

    let scoreA = 0;
    let scoreB = 0;

    answers?.forEach((ans) => {
      if (ans.correct) {
        if (ans.user_id === match.player_a_id) scoreA++;
        else if (ans.user_id === match.player_b_id) scoreB++;
      }
    });

    let winnerId: number | null = null;
    if (scoreA > scoreB) winnerId = match.player_a_id;
    else if (scoreB > scoreA) winnerId = match.player_b_id;
    // null = draw

    await supabaseAdmin
      .from('matches')
      .update({
        status: 'complete',
        winner_id: winnerId,
        rounds: updatedRounds,
      })
      .eq('id', matchId);

    return NextResponse.json({ status: 'complete', winner_id: winnerId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
