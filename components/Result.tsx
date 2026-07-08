'use client';
import { useEffect, useState } from 'react';
import { ScreenState } from './AppController';
import { Trophy, Clock, ArrowRight, Share2, Award, Zap, Smile, Frown, Handshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import Loading from './Loading';
import { toPersianDigits } from '@/lib/utils';


interface ResultProps {
  setScreen: (screen: ScreenState) => void;
  matchId: string;
  user: any;
}

export default function Result({ setScreen, matchId, user }: ResultProps) {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/match/${matchId}/result`);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchResult();
    
    const interval = setInterval(() => {
      if (result?.status === 'waiting') {
        fetchResult();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [matchId, result?.status]);

  useEffect(() => {
    if (result && result.status === 'complete' && result.winner_id === user.id) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result, user.id]);

  if (!result) {
    return <Loading message="در حال دریافت نتایج بازی..." />;
  }

  const isWaiting = result.status === 'waiting';
  const isWinner = result.winner_id === user.id;
  const isTie = result.status === 'complete' && result.winner_id === null;

  return (
    <div className="flex flex-col h-full w-full items-center p-6 animate-in zoom-in duration-300 relative overflow-hidden justify-between text-slate-900">
      
      {isWaiting ? (
        // Waiting for Opponent Screen
        <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
          <div className="card-cartoon p-8 max-w-sm w-full bg-white flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-3 border-slate-900 bg-sky-100 flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-sky-500 animate-bounce" />
            </div>
            
            <h2 className="text-xl font-black mb-3 text-slate-800">منتظر بازی حریف...</h2>
            <p className="text-slate-500 text-xs font-bold leading-relaxed">
              شما نوبت خود را بازی کردید. به محض اینکه رقیبتان بازی را تمام کند، نتیجه نهایی مشخص خواهد شد.
            </p>

            <button 
              className="mt-6 btn-toy-blue px-6 py-3 text-xs flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                  (window as any).Telegram.WebApp.switchInlineQuery("challenge", ["users"]);
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              خبر کردن دوست
            </button>
          </div>
        </div>
      ) : (
        // Finished Screen (Win/Loss/Tie)
        <div className="flex-1 flex flex-col items-center justify-center text-center w-full z-10">
          
          <div className="card-cartoon p-8 max-w-sm w-full bg-white flex flex-col items-center relative">
            
            {/* Trophy Icon */}
            <div className={`w-24 h-24 rounded-full border-3 border-slate-900 flex items-center justify-center mb-6 ${
              isWinner ? 'bg-amber-400' : isTie ? 'bg-amber-200' : 'bg-slate-200'
            }`}>
              <Trophy className="w-12 h-12 text-slate-850" />
            </div>

            <h1 className="text-2xl font-black mb-1 flex items-center gap-1.5 justify-center">
              {isWinner ? (
                <>
                  <span>برنده شدی!</span>
                  <Smile className="w-6 h-6 text-green-500 fill-green-500/20" />
                </>
              ) : isTie ? (
                <>
                  <span>بازی مساوی شد!</span>
                  <Handshake className="w-6 h-6 text-amber-500" />
                </>
              ) : (
                <>
                  <span>شکست خوردی...</span>
                  <Frown className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                </>
              )}
            </h1>
            <p className="text-xs font-bold text-slate-500 mb-6">مبارزه به پایان رسید</p>
            
            {/* Score box */}
            <div className="bg-slate-100 border-2 border-slate-900 rounded-2xl p-4 w-full flex justify-between items-center mb-6">
              <div className="text-center w-5/12">
                <span className="text-[10px] text-slate-400 font-black block mb-1">شما</span>
                <span className="text-2xl font-black text-slate-800">{toPersianDigits(isWinner ? 5 : isTie ? 3 : 2)}</span>
              </div>
              <span className="text-xs font-black italic text-slate-400">VS</span>
              <div className="text-center w-5/12">
                <span className="text-[10px] text-slate-400 font-black block mb-1">رقیب</span>
                <span className="text-2xl font-black text-slate-800">{toPersianDigits(isWinner ? 2 : isTie ? 3 : 5)}</span>
              </div>
            </div>

            {/* Delta score badge */}
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-slate-900 font-black text-xs shadow-md ${
              isWinner ? 'bg-emerald-400' : isTie ? 'bg-amber-400' : 'bg-rose-400'
            }`}>
              <Zap className="w-4 h-4 fill-slate-900/10" />
              <span>{isWinner ? `${toPersianDigits(10)}+ امتیاز لیگ` : isTie ? 'بدون تغییر امتیاز' : `${toPersianDigits(5)}- امتیاز لیگ`}</span>
            </div>

          </div>
        </div>
      )}

      {/* Back to Home Button */}
      <button 
        onClick={() => setScreen('home')}
        className="w-full mt-auto mb-4 btn-toy-yellow p-4.5 text-base flex justify-center items-center gap-2 cursor-pointer shadow-lg"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به منوی مسابقات
      </button>

    </div>
  );
}
