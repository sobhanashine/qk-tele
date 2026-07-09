'use client';
import { useEffect, useState } from 'react';
import { ScreenState } from './AppController';
import { Trophy, Clock, ArrowRight, Share2, Zap, Smile, Frown, Handshake, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Loading from './Loading';
import { toPersianDigits } from '@/lib/utils';

interface ResultProps {
  setScreen: (screen: ScreenState) => void;
  matchId: string;
  user: any;
  isFriendMatch?: boolean;
  onNextRound?: (nextRound: number, totalRounds: number) => void;
}

export default function Result({ setScreen, matchId, user, isFriendMatch, onNextRound }: ResultProps) {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/match/${matchId}/status`);
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();

    const interval = setInterval(() => {
      if (status?.status === 'waiting' || status?.status === 'active') {
        fetchStatus();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [matchId, status?.status]);

  useEffect(() => {
    if (status?.status === 'complete' && status?.winner_id === user.id) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }, [status, user.id]);

  if (!status) return <Loading message="در حال دریافت نتایج..." />;

  const isComplete = status.status === 'complete';
  const isCategorySelect = status.status === 'category_select';
  const isWinner = status.winner_id === user.id;
  const isTie = isComplete && status.winner_id === null;

  // ── Inter-round: waiting for other player to finish, then go to next category pick ──
  if (!isComplete) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 gap-6 animate-in fade-in duration-300">
        <div className="card-cartoon p-8 bg-white flex flex-col items-center gap-4 text-center max-w-xs w-full">
          <div className="w-16 h-16 rounded-full border-3 border-slate-900 bg-sky-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-sky-500 animate-bounce" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base mb-1">
              {isCategorySelect ? 'راند بعدی آماده است!' : 'منتظر حریف...'}
            </h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              راند {toPersianDigits(status.current_round)} از {toPersianDigits(status.total_rounds)}
            </p>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: status.total_rounds || 3 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 border-slate-900 ${
                  i + 1 < status.current_round
                    ? 'bg-emerald-400'
                    : i + 1 === status.current_round
                    ? 'bg-amber-400'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          {isCategorySelect && onNextRound && (
            <button
              onClick={() => onNextRound(status.current_round, status.total_rounds)}
              className="btn-toy-yellow w-full py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ChevronRight className="w-4 h-4" />
              انتخاب موضوع راند {toPersianDigits(status.current_round)}
            </button>
          )}
          {!isCategorySelect && (
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce border-2 border-slate-900"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Final result screen ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full items-center p-6 animate-in zoom-in duration-300 relative overflow-hidden justify-between text-slate-900">

      <div className="flex-1 flex flex-col items-center justify-center text-center w-full z-10">
        <div className="card-cartoon p-8 max-w-sm w-full bg-white flex flex-col items-center relative">

          <div className={`w-24 h-24 rounded-full border-3 border-slate-900 flex items-center justify-center mb-6 ${
            isWinner ? 'bg-amber-400' : isTie ? 'bg-amber-200' : 'bg-slate-200'
          }`}>
            <Trophy className="w-12 h-12 text-slate-850" />
          </div>

          <h1 className="text-2xl font-black mb-1 flex items-center gap-1.5 justify-center">
            {isWinner ? (
              <><span>برنده شدی!</span><Smile className="w-6 h-6 text-green-500 fill-green-500/20" /></>
            ) : isTie ? (
              <><span>بازی مساوی!</span><Handshake className="w-6 h-6 text-amber-500" /></>
            ) : (
              <><span>شکست خوردی...</span><Frown className="w-6 h-6 text-rose-500 fill-rose-500/20" /></>
            )}
          </h1>
          <p className="text-xs font-bold text-slate-500 mb-4">مسابقه به پایان رسید</p>

          {/* Rounds breakdown */}
          {isFriendMatch && status.rounds?.length > 0 && (
            <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 mb-4 flex flex-col gap-2">
              {(status.rounds as any[]).map((r: any) => (
                <div key={r.round} className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-500">راند {toPersianDigits(r.round)}</span>
                  <span className="bg-slate-200 border border-slate-300 rounded-full px-2 py-0.5 text-slate-600">{r.category}</span>
                </div>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-slate-900 font-black text-xs shadow-md ${
            isWinner ? 'bg-emerald-400' : isTie ? 'bg-amber-400' : 'bg-rose-400'
          }`}>
            <Zap className="w-4 h-4 fill-slate-900/10" />
            <span>{isWinner ? `+${toPersianDigits(10)} امتیاز` : isTie ? 'بدون تغییر' : `-${toPersianDigits(5)} امتیاز`}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setScreen('home')}
        className="w-full mt-auto mb-4 btn-toy-yellow p-4 text-base flex justify-center items-center gap-2 cursor-pointer shadow-lg"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به منوی اصلی
      </button>
    </div>
  );
}
