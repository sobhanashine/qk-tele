'use client';
import { useEffect, useState } from 'react';
import { ScreenState } from './AppController';
import { Trophy, Coins, Users, Swords, AlertCircle, CheckCircle2, Clock, Gamepad2, Smile, Frown, Link, Zap } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import Medal from './Medal';


interface HomeProps {
  setScreen: (screen: ScreenState) => void;
  user: any;
}

export default function Home({ setScreen, user }: HomeProps) {
  // Playful mock list of active games
  const [activeGames, setActiveGames] = useState({
    yourTurn: [
      { id: '1', opponentName: 'علی', progress: 'سوال ۳ از ۶', category: 'ورزشی' },
      { id: '2', opponentName: 'مهسا', progress: 'سوال ۱ از ۶', category: 'تاریخ' }
    ],
    waiting: [
      { id: '3', opponentName: 'سهراب', progress: 'سوال ۵ از ۶', category: 'سینما' }
    ],
    completed: [
      { id: '4', opponentName: 'نرگس', result: 'برد', score: '۵ - ۳', delta: '+۱۰ امتیاز' },
      { id: '5', opponentName: 'آرش', result: 'باخت', score: '۲ - ۴', delta: '-۵ امتیاز' }
    ]
  });

  return (
    <div className="flex flex-col h-full w-full p-5 overflow-y-auto pb-24 text-slate-900 animate-in fade-in duration-200">
      

      {/* Horizontal Carousel for New Matches */}
      <div className="w-full mb-8 z-10">
        <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
          <Swords className="w-4 h-4 text-amber-400" />
          شروع مسابقه جدید
        </h3>
        
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 px-1 scrollbar-none dir-rtl">
          {/* Card 1: Random Match */}
          <div className="card-cartoon snap-center shrink-0 w-[88%] bg-gradient-to-br from-amber-300 to-yellow-450 p-6 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="w-12 h-12 rounded-full border-3 border-slate-900 bg-white flex items-center justify-center mb-3 shadow-[0_2px_0_0_#0f172a]">
                <Swords className="w-6 h-6 text-slate-950" />
              </div>
              <h4 className="text-lg font-black text-slate-900">مبارزه سریع</h4>
              <p className="text-[11px] font-bold text-amber-900/80 mt-1 leading-relaxed">
                با یک رقیب تصادفی هم‌سطح خودت مبارزه کن و اطلاعات عمومیت رو به چالش بکش!
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

          {/* Card 2: Friend Challenge */}
          <div className="card-cartoon snap-center shrink-0 w-[88%] bg-gradient-to-br from-sky-300 to-blue-450 p-6 flex flex-col justify-between min-h-[220px]">
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

      {/* Active matches list sections */}
      <div className="flex flex-col gap-6">
        
        {/* Your Turn (نوبت شما) */}
        <div>
          <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            نوبت شما ({toPersianDigits(activeGames.yourTurn.length)})
          </h3>
          <div className="flex flex-col gap-3">
            {activeGames.yourTurn.map((game) => (
              <div key={game.id} className="card-cartoon p-4 flex justify-between items-center bg-emerald-50/50">
                <div>
                  <h4 className="font-black text-sm text-slate-800">مبارزه با {game.opponentName}</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">موضوع: {game.category} • {game.progress}</p>
                </div>
                <button 
                  onClick={() => setScreen('matchmaking')} 
                  className="btn-toy-green px-4 py-2 text-xs font-black cursor-pointer flex items-center gap-1"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  بازی کن
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Waiting for Opponent (منتظر حریف) */}
        <div>
          <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            منتظر حریف ({toPersianDigits(activeGames.waiting.length)})
          </h3>
          <div className="flex flex-col gap-3">
            {activeGames.waiting.map((game) => (
              <div key={game.id} className="card-cartoon p-4 flex justify-between items-center bg-sky-50/50">
                <div>
                  <h4 className="font-black text-sm text-slate-800">مبارزه با {game.opponentName}</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">موضوع: {game.category} • {game.progress}</p>
                </div>
                <div className="flex items-center gap-1 bg-sky-100 border-2 border-sky-400 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-sky-600">
                  <Clock className="w-3.5 h-3.5" />
                  صبر کنید
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Matches (بازی‌های پایان‌یافته) */}
        <div>
          <h3 className="font-black text-xs text-white mb-3 flex items-center gap-1.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            پایان‌یافته ({toPersianDigits(activeGames.completed.length)})
          </h3>
          <div className="flex flex-col gap-3">
            {activeGames.completed.map((game) => (
              <div key={game.id} className="card-cartoon p-4 flex justify-between items-center bg-slate-50">
                <div>
                  <h4 className="font-black text-sm text-slate-800">مبارزه با {game.opponentName}</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">نتیجه: {game.score} ({game.delta})</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 flex items-center gap-1.5 ${
                  game.result === 'برد' 
                    ? 'bg-green-100 border-green-400 text-green-600' 
                    : 'bg-red-100 border-red-400 text-red-600'
                }`}>
                  {game.result === 'برد' ? (
                    <>
                      <Smile className="w-3.5 h-3.5" />
                      <span>برد</span>
                    </>
                  ) : (
                    <>
                      <Frown className="w-3.5 h-3.5" />
                      <span>باخت</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
