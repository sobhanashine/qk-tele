'use client';
import { useEffect, useState } from 'react';
import { ScreenState } from './AppController';
import { Loader2, X, Swords } from 'lucide-react';

interface MatchmakingProps {
  setScreen: (screen: ScreenState) => void;
  user: any;
  onStartMatch: (id: string, qs: any[]) => void;
}

export default function Matchmaking({ setScreen, user, onStartMatch }: MatchmakingProps) {
  const [matchmakingText, setMatchmakingText] = useState("در حال ارتباط با سرور...");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const texts = [
      "درحال بررسی بازیکنان آنلاین...",
      "تطبیق رنک و سطح کاربری...",
      "یافتن بهترین رقیب برای شما...",
      "آماده‌سازی سوالات مسابقه...",
      "ورود به زمین مبارزه..."
    ];

    let textIdx = 0;
    const textInterval = setInterval(() => {
      if (textIdx < texts.length) {
        setMatchmakingText(texts[textIdx]);
        textIdx++;
      }
    }, 1200);

    const findMatch = async () => {
      try {
        const res = await fetch('/api/match/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram_id: user.id })
        });
        const data = await res.json();
        
        if (data.match_id && data.questions) {
          timeout = setTimeout(() => {
            onStartMatch(data.match_id, data.questions);
          }, 4500);
        } else {
          setScreen('home');
        }
      } catch (err) {
        console.error(err);
        setScreen('home');
      }
    };

    findMatch();

    return () => {
      clearTimeout(timeout);
      clearInterval(textInterval);
    };
  }, [user.id, onStartMatch, setScreen]);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6 animate-in fade-in duration-300 relative">
      
      {/* Bubbly Radar Card */}
      <div className="card-cartoon p-8 max-w-sm w-full flex flex-col items-center justify-center text-center relative bg-white">
        
        {/* Playful concentric rings */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-sky-400 animate-spin-slow"></div>
          <div className="absolute w-24 h-24 rounded-full border-4 border-dashed border-amber-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
          <div className="w-16 h-16 rounded-full border-3 border-slate-900 bg-amber-400 flex items-center justify-center shadow-lg relative z-10">
            <Swords className="w-8 h-8 text-slate-800 animate-bounce" />
          </div>
        </div>

        <h2 className="text-xl font-black mb-3">درحال جستجوی رقیب...</h2>
        <div className="h-6 flex items-center justify-center">
          <p className="text-slate-500 text-xs font-bold animate-pulse">{matchmakingText}</p>
        </div>
      </div>

      {/* Cancel Button */}
      <button 
        onClick={() => setScreen('home')}
        className="mt-8 btn-toy-red px-8 py-3.5 text-xs flex items-center gap-2 cursor-pointer shadow-lg"
      >
        <X className="w-4 h-4" />
        انصراف و لغو
      </button>

    </div>
  );
}
