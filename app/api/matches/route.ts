import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const telegram_id = req.nextUrl.searchParams.get('telegram_id');
    if (!telegram_id) {
      return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 });
    }

    const userId = parseInt(telegram_id);

    // Fetch all matches where the user is player_a or player_b
    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select('id, status, player_a_id, player_b_id, winner_id, question_set, current_round, total_rounds, rounds, created_at')
      .or(`player_a_id.eq.${userId},player_b_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return NextResponse.json({ yourTurn: [], waiting: [], completed: [] });
    }

    // Collect all opponent IDs
    const opponentIds = Array.from(new Set(
      matches.map(m => m.player_a_id === userId ? m.player_b_id : m.player_a_id)
        .filter(Boolean)
    ));

    // Fetch opponent display names
    const opponentMap: Record<number, string> = {};
    if (opponentIds.length > 0) {
      const { data: opponents } = await supabaseAdmin
        .from('users')
        .select('telegram_id, display_name')
        .in('telegram_id', opponentIds);
      opponents?.forEach(u => { opponentMap[u.telegram_id] = u.display_name; });
    }

    // Fetch per-user correct answer counts for completed matches
    const completedIds = matches.filter(m => m.status === 'complete').map(m => m.id);
    const scoreMap: Record<string, { a: number; b: number }> = {};
    if (completedIds.length > 0) {
      const { data: answers } = await supabaseAdmin
        .from('match_answers')
        .select('match_id, user_id, correct')
        .in('match_id', completedIds)
        .eq('correct', true);
      answers?.forEach(ans => {
        if (!scoreMap[ans.match_id]) scoreMap[ans.match_id] = { a: 0, b: 0 };
        const match = matches.find(m => m.id === ans.match_id);
        if (!match) return;
        if (ans.user_id === match.player_a_id) scoreMap[ans.match_id].a++;
        else scoreMap[ans.match_id].b++;
      });
    }

    const yourTurn: any[] = [];
    const waiting: any[] = [];
    const completed: any[] = [];

    for (const m of matches) {
      const isPlayerA = m.player_a_id === userId;
      const opponentId = isPlayerA ? m.player_b_id : m.player_a_id;
      const opponentName = opponentId ? (opponentMap[opponentId] || 'حریف') : 'منتظر حریف...';

      // Determine category from rounds or question count
      const currentRoundObj = m.rounds?.find((r: any) => r.round === m.current_round);
      const category = currentRoundObj?.category || 'عمومی';
      const roundInfo = m.total_rounds > 1
        ? `راند ${m.current_round} از ${m.total_rounds}`
        : `${m.question_set?.length || 0} سوال`;

      if (m.status === 'complete') {
        const scores = scoreMap[m.id] || { a: 0, b: 0 };
        const myScore = isPlayerA ? scores.a : scores.b;
        const opScore = isPlayerA ? scores.b : scores.a;
        const won = m.winner_id === userId;
        const tie = m.winner_id === null;
        completed.push({
          id: m.id,
          opponentName,
          result: tie ? 'مساوی' : won ? 'برد' : 'باخت',
          score: `${myScore} - ${opScore}`,
          delta: tie ? '±۰' : won ? `+۱۰` : `-۵`,
        });
      } else if (m.status === 'waiting' || m.status === 'category_select') {
        // Match is waiting for opponent or waiting to pick category
        waiting.push({ id: m.id, opponentName, progress: roundInfo, category });
      } else if (m.status === 'active') {
        // It's always "your turn" when active — both players answer independently
        yourTurn.push({ id: m.id, opponentName, progress: roundInfo, category });
      }
    }

    return NextResponse.json({ yourTurn, waiting, completed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
