import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const round = req.nextUrl.searchParams.get('round');

    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('rounds')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const rounds: any[] = match.rounds || [];
    const targetRound = round ? parseInt(round) : rounds.length;
    const roundObj = rounds.find((r: any) => r.round === targetRound);

    if (!roundObj || !roundObj.question_set?.length) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('id, text, options, category, difficulty')
      .in('id', roundObj.question_set);

    return NextResponse.json({ questions: questions || [], round: targetRound, category: roundObj.category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
