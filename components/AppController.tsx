'use client';

import { useState, useEffect, useCallback } from 'react';
import Home from './Home';
import Matchmaking from './Matchmaking';
import FriendInvite from './FriendInvite';
import CategoryPicker from './CategoryPicker';
import Battle from './Battle';
import Result from './Result';
import Wallet from './Wallet';
import Profile from './Profile';
import Settings from './Settings';
import { Trophy, Coins, User, Settings as SettingsIcon } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import Medal from './Medal';

export type ScreenState =
  | 'home'
  | 'wallet'
  | 'profile'
  | 'settings'
  | 'matchmaking'
  | 'friend-invite'
  | 'waiting-friend'   // created invite, waiting for friend to join
  | 'category-pick'    // time to pick or wait for category pick
  | 'battle'
  | 'result';

interface MatchState {
  matchId: string;
  inviteCode?: string;
  currentRound: number;
  totalRounds: number;
  questions: any[];
  isFriendMatch: boolean;
}

export default function AppController() {
  const [screen, setScreen] = useState<ScreenState>('home');
  const [match, setMatch] = useState<MatchState | null>(null);
  const [user, setUser] = useState({ id: 12345, name: 'مهمان', rank: 'برنز', score: 250, coins: 150 });

  // ── Telegram init & deep-link parsing ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let startapp: string | null = null;
    const searchParams = new URLSearchParams(window.location.search);
    startapp = searchParams.get('startapp') || searchParams.get('tgWebAppStartParam');

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.start_param) startapp = tg.initDataUnsafe.start_param;
      if (tg.initDataUnsafe?.user) {
        setUser(prev => ({
          ...prev,
          id: tg.initDataUnsafe.user.id,
          name: tg.initDataUnsafe.user.first_name,
        }));
      }
    }

    // Deep-link: /start match_<uuid>  → join the match directly
    if (startapp?.startsWith('match_')) {
      const matchId = startapp.replace('match_', '');
      if (matchId) {
        setMatch({ matchId, currentRound: 1, totalRounds: 3, questions: [], isFriendMatch: true });
        setScreen('matchmaking'); // Matchmaking will auto-join with matchId
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Poll for friend joining (waiting-friend screen) ─────────────────────
  useEffect(() => {
    if (screen !== 'waiting-friend' || !match) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/match/${match.matchId}/status`);
        const data = await res.json();
        if (data.status === 'category_select') {
          clearInterval(interval);
          setMatch(prev => prev ? {
            ...prev,
            currentRound: data.current_round,
            totalRounds: data.total_rounds,
          } : prev);
          setScreen('category-pick');
        }
      } catch (e) { /* ignore */ }
    }, 2500);

    return () => clearInterval(interval);
  }, [screen, match]);

  // ── Poll for category selection (opponent's turn) ────────────────────────
  useEffect(() => {
    if (screen !== 'category-pick' || !match) return;

    // Determine if it's my turn to pick
    const amPlayerA = match.matchId && true; // will be set properly per-match
    // We poll status every 2s; if status becomes 'active', load the questions
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/match/${match.matchId}/status`);
        const data = await res.json();
        if (data.status === 'active') {
          clearInterval(interval);
          // Fetch questions for current round
          const roundObj = data.rounds?.find((r: any) => r.round === data.current_round);
          if (roundObj?.question_set?.length) {
            const qRes = await fetch(`/api/match/${match.matchId}/round-questions?round=${data.current_round}`);
            const qData = await qRes.json();
            setMatch(prev => prev ? { ...prev, questions: qData.questions || [], currentRound: data.current_round } : prev);
          }
          setScreen('battle');
        }
      } catch (e) { /* ignore */ }
    }, 2000);

    return () => clearInterval(interval);
  }, [screen, match]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleResumeMatch = useCallback(async (matchId: string) => {
    try {
      const res = await fetch(`/api/match/${matchId}/status`);
      const data = await res.json();
      const roundNum = data.current_round || 1;
      const totalRounds = data.total_rounds || 1;

      if (data.status === 'active') {
        // Fetch questions for current round
        const qRes = await fetch(`/api/match/${matchId}/round-questions?round=${roundNum}`);
        const qData = await qRes.json();
        setMatch({
          matchId,
          currentRound: roundNum,
          totalRounds,
          questions: qData.questions || [],
          isFriendMatch: totalRounds > 1,
        });
        setScreen('battle');
      } else if (data.status === 'category_select') {
        setMatch({ matchId, currentRound: roundNum, totalRounds, questions: [], isFriendMatch: true });
        setScreen('category-pick');
      } else if (data.status === 'waiting') {
        setMatch({ matchId, currentRound: roundNum, totalRounds, questions: [], isFriendMatch: true });
        setScreen('waiting-friend');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);


  const handleStartRandomMatch = (matchId: string, questions: any[]) => {
    setMatch({ matchId, currentRound: 1, totalRounds: 1, questions, isFriendMatch: false });
    setScreen('battle');
  };

  const handleFriendMatchCreated = (matchId: string, inviteCode: string) => {
    setMatch({ matchId, inviteCode, currentRound: 1, totalRounds: 3, questions: [], isFriendMatch: true });
    setScreen('waiting-friend');
  };

  const handleFriendJoined = (matchId: string, _inviteCode: string) => {
    // Friend joined — go straight to category pick
    setMatch({ matchId, currentRound: 1, totalRounds: 3, questions: [], isFriendMatch: true });
    setScreen('category-pick');
  };

  const handleCategorySelected = (questions: any[]) => {
    setMatch(prev => prev ? { ...prev, questions } : prev);
    setScreen('battle');
  };

  const handleRoundComplete = useCallback(async (submitResult: { status: string; round?: number }) => {
    if (!match) return;
    if (submitResult.status === 'complete') {
      setScreen('result');
    } else if (submitResult.status === 'next_round' || submitResult.status === 'round_waiting') {
      // Poll until the other player finishes too, then show category pick
      setScreen('result'); // Show inter-round result / waiting screen (Result component handles this)
    }
  }, [match]);

  const handleBattleComplete = () => {
    setScreen('result');
  };

  const isDashboard = ['home', 'wallet', 'profile', 'settings'].includes(screen);

  return (
    <div className="w-full max-w-md h-[100dvh] relative overflow-hidden game-bg text-slate-100 flex flex-col justify-between shadow-2xl border-x border-slate-950/20">
      
      <div className="absolute top-16 left-4 w-16 h-10 bg-white/5 rounded-full blur-md pointer-events-none" />
      <div className="absolute top-32 right-10 w-24 h-14 bg-white/5 rounded-full blur-md pointer-events-none" />

      {/* Screen Area */}
      <div className="flex-1 w-full overflow-hidden relative">
        {screen === 'home' && <Home setScreen={setScreen} user={user} onResumeMatch={handleResumeMatch} />}
        {screen === 'wallet' && <Wallet setScreen={setScreen} user={user} />}
        {screen === 'profile' && <Profile user={user} />}
        {screen === 'settings' && <Settings user={user} />}

        {screen === 'matchmaking' && (
          <Matchmaking
            setScreen={setScreen}
            user={user}
            onStartMatch={handleStartRandomMatch}
            matchId={match?.matchId ?? null}
            clearMatchId={() => setMatch(null)}
          />
        )}

        {screen === 'friend-invite' && (
          <FriendInvite
            setScreen={setScreen}
            user={user}
            onMatchCreated={(mid, code) => {
              // If we created — wait for friend; if we joined — go to category pick
              // Distinguish: FriendInvite calls onMatchCreated. If invite_code is present, we created it.
              // We detect: if the user created, they see their code in the component; 
              // on join, the match status should already be 'category_select'
              fetch(`/api/match/${mid}/status`).then(r => r.json()).then(data => {
                if (data.status === 'waiting') {
                  handleFriendMatchCreated(mid, code);
                } else {
                  handleFriendJoined(mid, code);
                }
              });
            }}
          />
        )}

        {screen === 'waiting-friend' && match && (
          <div className="flex flex-col h-full items-center justify-center p-6 gap-6 animate-in fade-in duration-300">
            <div className="card-cartoon p-8 bg-white flex flex-col items-center gap-4 text-center max-w-xs w-full">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-amber-400 rounded-full animate-bounce border-2 border-slate-900"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base mb-1">منتظر دوستت هستیم</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  وقتی دوستت وارد شد، بازی شروع می‌شه
                </p>
              </div>
              {match.inviteCode && (
                <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl px-6 py-3">
                  <span className="text-[9px] text-slate-400 font-black block mb-0.5">کد دعوت</span>
                  <span className="text-xl font-black text-slate-900 tracking-widest">{match.inviteCode}</span>
                </div>
              )}
            </div>
            <button onClick={() => { setMatch(null); setScreen('home'); }} className="text-xs text-white/40 font-black">
              ← انصراف
            </button>
          </div>
        )}

        {screen === 'category-pick' && match && (
          <CategoryPicker
            matchId={match.matchId}
            currentRound={match.currentRound}
            totalRounds={match.totalRounds}
            user={user}
            isMyTurn={match.currentRound % 2 === 1 ? true : false} // simplified; server enforces
            onCategorySelected={handleCategorySelected}
          />
        )}

        {screen === 'battle' && match && (
          <Battle
            setScreen={setScreen}
            matchId={match.matchId}
            questions={match.questions}
            user={user}
            onComplete={handleBattleComplete}
          />
        )}

        {screen === 'result' && match && (
          <Result
            setScreen={setScreen}
            matchId={match.matchId}
            user={user}
            isFriendMatch={match.isFriendMatch}
            onNextRound={(nextRound, totalRounds) => {
              setMatch(prev => prev ? { ...prev, currentRound: nextRound, totalRounds, questions: [] } : prev);
              setScreen('category-pick');
            }}
          />
        )}
      </div>

      {/* Bottom Nav */}
      {isDashboard && (
        <div className="w-full rounded-t-3xl game-glass-dock flex items-center justify-around pt-3.5 pb-[calc(12px+env(safe-area-inset-bottom))] px-4 z-20">
          
          {[
            { id: 'home', icon: Trophy, label: 'خانه' },
            { id: 'wallet', icon: Coins, label: 'کیف‌پول' },
            { id: 'profile', icon: User, label: 'پروفایل' },
            { id: 'settings', icon: SettingsIcon, label: 'تنظیمات' },
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setScreen(id as ScreenState)}
              className={`transition-all duration-200 cursor-pointer active:scale-75 relative p-2 ${
                screen === id
                  ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'text-white/50 hover:text-white/85'
              }`}
            >
              <Icon className="w-5.5 h-5.5" />
              {screen === id && (
                <span className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
