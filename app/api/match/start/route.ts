import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegram_id, match_id } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 });
    }

    if (match_id) {
      const { data: match, error: matchError } = await supabaseAdmin
        .from('matches')
        .select('*')
        .eq('id', match_id)
        .single();

      if (matchError || !match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }

      if (match.player_b_id && match.player_b_id !== telegram_id) {
        return NextResponse.json({ error: 'Match is full' }, { status: 400 });
      }

      if (!match.player_b_id && match.player_a_id !== telegram_id) {
        await supabaseAdmin
          .from('matches')
          .update({ player_b_id: telegram_id, status: 'active' })
          .eq('id', match_id);
      }

      const { data: questions } = await supabaseAdmin
        .from('questions')
        .select('id, text, options, category, difficulty')
        .in('id', match.question_set);

      return NextResponse.json({ match_id: match.id, questions });
    }

    const { data: waitingMatch } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('status', 'waiting')
      .is('player_b_id', null)
      .neq('player_a_id', telegram_id)
      .limit(1)
      .single();

    if (waitingMatch) {
      await supabaseAdmin
        .from('matches')
        .update({ player_b_id: telegram_id, status: 'active' })
        .eq('id', waitingMatch.id);

      const { data: questions } = await supabaseAdmin
        .from('questions')
        .select('id, text, options, category, difficulty')
        .in('id', waitingMatch.question_set);

      return NextResponse.json({ match_id: waitingMatch.id, questions });
    }

    const { data: allQuestions } = await supabaseAdmin
      .from('questions')
      .select('id, text, options, category, difficulty')
      .limit(100);

    let selectedQuestions: any[] = [];
    let questionIds: number[] = [];
    if (allQuestions && allQuestions.length > 0) {
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, 6);
      questionIds = selectedQuestions.map((q) => q.id);
    }

    const { data: newMatch, error: createError } = await supabaseAdmin
      .from('matches')
      .insert({
        player_a_id: telegram_id,
        question_set: questionIds,
        status: 'waiting',
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }

    return NextResponse.json({ match_id: newMatch.id, questions: selectedQuestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
