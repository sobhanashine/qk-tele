import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params;
    const body = await req.json();
    const { telegram_id, question_id, selected_index, answer_time_ms } = body;

    const { data: question } = await supabaseAdmin
      .from('questions')
      .select('correct_index')
      .eq('id', question_id)
      .single();

    const isCorrect = question?.correct_index === selected_index;

    await supabaseAdmin
      .from('match_answers')
      .insert({
        match_id: matchId,
        user_id: telegram_id,
        question_id,
        selected_index,
        correct: isCorrect,
        answer_time_ms,
      });

    return NextResponse.json({ success: true, correct: isCorrect });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
