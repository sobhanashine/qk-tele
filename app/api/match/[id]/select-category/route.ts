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
    const { telegram_id, category } = await req.json();

    if (!telegram_id || !category) {
      return NextResponse.json({ error: 'telegram_id and category are required' }, { status: 400 });
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

    // 2. Determine picker: odd rounds → player_a, even rounds → player_b
    const pickerId: number =
      match.current_round % 2 === 1 ? match.player_a_id : match.player_b_id;

    // 3. Guard: only the picker can select category (coerce both to number)
    if (Number(telegram_id) !== Number(pickerId)) {
      return NextResponse.json({ error: 'Not your turn to pick category' }, { status: 403 });
    }

    // 4. Fetch up to 50 questions for this category, then pick 3 randomly in JS
    const { data: allQuestions, error: qError } = await supabaseAdmin
      .from('questions')
      .select('id, text, options, correct_index, category, difficulty')
      .eq('category', category)
      .limit(50);

    if (qError || !allQuestions || allQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this category' }, { status: 404 });
    }

    // Shuffle and take 3
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    const questionIds: number[] = selected.map((q) => q.id);

    // 5. Build new round object
    const newRound: RoundObject = {
      round: match.current_round,
      category,
      question_set: questionIds,
      player_a_done: false,
      player_b_done: false,
    };

    // 6. Append to rounds array
    const existingRounds: RoundObject[] = Array.isArray(match.rounds) ? match.rounds : [];
    const updatedRounds = [...existingRounds, newRound];

    // 7. Update match: status='active', rounds, question_set
    const { error: updateError } = await supabaseAdmin
      .from('matches')
      .update({
        status: 'active',
        rounds: updatedRounds,
        question_set: questionIds,
      })
      .eq('id', matchId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 8. Return
    return NextResponse.json({
      match_id: matchId,
      round: match.current_round,
      questions: selected,
      picker_id: pickerId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
