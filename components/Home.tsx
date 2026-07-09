'use client';
import { useEffect, useState, useCallback } from 'react';
import { ScreenState } from './AppController';
import { Users, Swords, Clock, Gamepad2, Smile, Frown, Link, Zap, Minus, RefreshCw } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

interface HomeProps {
  setScreen: (screen: ScreenState) => void;
  user: any;
  onResumeMatch?: (matchId: string) => void;
}

interface GameItem {
  id: string;
  opponentName: string;
  progress?: string;
  category?: string;
  result?: string;
  score?: string;
  delta?: string;
}

interface MatchList {
  yourTurn: GameItem[];
  waiting: GameItem[];
  completed: GameItem[];
}

function SkeletonCard() {
  return (
    <div className="card-cartoon p-4 flex justify-between items-center bg-white/60 animate-pulse">
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-28 bg-slate-200 rounded-full" />
        <div className="h-2 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="h-8 w-16 bg-slate-200 rounded-2xl" />
    </div>
  );
}

export default function Home({ setScreen, user, onResumeMatch }: HomeProps) {
  const [matches, setMatches] = useState<MatchList | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!user?.id || user.id === 12345) { // skip for guest
      setMatches({ yourTurn: [], waiting: [], completed: [] });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/matches?telegram_id=${user.id}`);
      const data = await res.json();
      setMatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchMatches();
    // Refresh every 15s to catch new matches
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const hasAny = matches && (
    matches.yourTurn.length + matches.waiting.length + matches.completed.length > 0
  );

  return (
    <div className="flex flex-col h-full w-full p-5 overflow-y-auto pb-24 text-slate-900 animate-in fade-in duration-200">

      {/* ── New Match Carousel ─────────────────────────────────────────── */}
      <div className="w-full mb-8 z-10">
        <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
          <Swords className="w-4 h-4 text-amber-400" />
          شروع مسابقه جدید
        </h3>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 px-1 scrollbar-none dir-rtl">
          {/* Random Match */}
          <div className="card-cartoon snap-center shrink-0 w-[88%] bg-gradient-to-br from-amber-300 to-yellow-450 p-6 flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="w-12 h-12 rounded-full border-3 border-slate-900 bg-white flex items-center justify-center mb-3 shadow-[0_2px_0_0_#0f172a]">
                <Swords className="w-6 h-6 text-slate-950" />
              </div>
              <h4 className="text-lg font-black text-slate-900">مبارزه سریع</h4>
              <p className="text-[11px] font-bold text-amber-900/80 mt-1 leading-relaxed">
                با یک رقیب تصادفی هم‌سطح خودت مبارزه کن!
              </p>
            </div>
            <button
              onClick={() => setScreen('matchmaking')}
              className="btn-toy-yellow w-full py-3 mt-4 text-xs font-black cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>شروع بازی سریع</span>
            </button>
          </div>

          {/* Friend Challenge */}
          <div className="card-cartoon snap-center shrink-0 w-[88%] bg-gradient-to-br from-sky-300 to-blue-450 p-6 flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="w-12 h-12 rounded-full border-3 border-slate-900 bg-white flex items-center justify-center mb-3 shadow-[0_2px_0_0_#0f172a]">
                <Users className="w-6 h-6 text-slate-950" />
              </div>
              <h4 className="text-lg font-black text-slate-900">چالش دوستان</h4>
              <p className="text-[11px] font-bold text-blue-900/80 mt-1 leading-relaxed">
                دوستت رو دعوت کن، موضوع رو انتخاب کنید، ۳ راند مبارزه کنید!
              </p>
            </div>
            <button
              onClick={() => setScreen('friend-invite')}
              className="btn-toy-blue w-full py-3 mt-4 text-xs font-black cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <Link className="w-3.5 h-3.5" />
              <span>دعوت دوست</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── My Matches ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">

        {/* Section header with refresh button */}
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs text-white flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
            <Swords className="w-4 h-4 text-amber-400" />
            بازی‌های من
          </h3>
          <button
            onClick={() => { setLoading(true); fetchMatches(); }}
            className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Empty state */}
        {!loading && !hasAny && (
          <div className="card-cartoon p-6 bg-white/60 flex flex-col items-center gap-2 text-center">
            <Swords className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-black text-slate-400">هنوز بازی‌ای نداری!</p>
            <p className="text-[10px] text-slate-300 font-bold">یک مسابقه جدید شروع کن 👆</p>
          </div>
        )}

        {/* Your Turn */}
        {!loading && matches && matches.yourTurn.length > 0 && (
          <div>
            <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              نوبت شما ({toPersianDigits(matches.yourTurn.length)})
            </h3>
            <div className="flex flex-col gap-3">
              {matches.yourTurn.map((game) => (
                <div key={game.id} className="card-cartoon p-4 flex justify-between items-center bg-emerald-50/50">
                  <div>
                    <h4 className="font-black text-sm text-slate-800">مبارزه با {game.opponentName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                      {game.category && `موضوع: ${game.category} • `}{game.progress}
                    </p>
                  </div>
                  <button
                    onClick={() => onResumeMatch?.(game.id)}
                    className="btn-toy-green px-4 py-2 text-xs font-black cursor-pointer flex items-center gap-1"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    بازی کن
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting */}
        {!loading && matches && matches.waiting.length > 0 && (
          <div>
            <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              منتظر حریف ({toPersianDigits(matches.waiting.length)})
            </h3>
            <div className="flex flex-col gap-3">
              {matches.waiting.map((game) => (
                <div key={game.id} className="card-cartoon p-4 flex justify-between items-center bg-sky-50/50">
                  <div>
                    <h4 className="font-black text-sm text-slate-800">مبارزه با {game.opponentName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                      {game.category && `موضوع: ${game.category} • `}{game.progress}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-sky-100 border-2 border-sky-400 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-sky-600">
                    <Clock className="w-3.5 h-3.5" />
                    صبر کنید
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {!loading && matches && matches.completed.length > 0 && (
          <div>
            <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              پایان‌یافته ({toPersianDigits(matches.completed.length)})
            </h3>
            <div className="flex flex-col gap-3">
              {matches.completed.map((game) => (
                <div key={game.id} className="card-cartoon p-4 flex justify-between items-center bg-slate-50">
                  <div>
                    <h4 className="font-black text-sm text-slate-800">مبارزه با {game.opponentName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                      نتیجه: {game.score} ({game.delta} امتیاز)
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 flex items-center gap-1.5 ${
                    game.result === 'برد'
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : game.result === 'مساوی'
                      ? 'bg-amber-100 border-amber-400 text-amber-700'
                      : 'bg-red-100 border-red-400 text-red-700'
                  }`}>
                    {game.result === 'برد' ? (
                      <><Smile className="w-3.5 h-3.5" /><span>برد</span></>
                    ) : game.result === 'مساوی' ? (
                      <><Minus className="w-3.5 h-3.5" /><span>مساوی</span></>
                    ) : (
                      <><Zap className="w-3.5 h-3.5 rotate-180" /><span>باخت</span></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
