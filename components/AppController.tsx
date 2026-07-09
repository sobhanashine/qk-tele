'use client';

import { useState, useEffect } from 'react';
import Home from './Home';
import Matchmaking from './Matchmaking';
import Battle from './Battle';
import Result from './Result';
import Wallet from './Wallet';
import Profile from './Profile';
import Settings from './Settings';
import { Trophy, Coins, User, Settings as SettingsIcon } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import Medal from './Medal';

export type ScreenState = 'home' | 'wallet' | 'profile' | 'settings' | 'matchmaking' | 'battle' | 'result';

export default function AppController() {
  const [screen, setScreen] = useState<ScreenState>('home');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  // Mock user
  const [user, setUser] = useState({ id: 12345, name: 'مهمان', rank: 'برنز', score: 250, coins: 150 }); 

  useEffect(() => {
    let startapp: string | null = null;
    let initialUser = { ...user };

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      startapp = searchParams.get('startapp') || searchParams.get('tgWebAppStartParam');

      if ((window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.start_param) {
          startapp = tg.initDataUnsafe.start_param;
        }
        if (tg.initDataUnsafe?.user) {
          initialUser = {
            ...user,
            id: tg.initDataUnsafe.user.id,
            name: tg.initDataUnsafe.user.first_name,
          };
          setUser(initialUser);
        }
      }

      if (startapp) {
        const cleanMatchId = startapp.startsWith('match_') ? startapp.replace('match_', '') : startapp;
        if (cleanMatchId) {
          setMatchId(cleanMatchId);
          setScreen('matchmaking');
        }
      }
    }
  }, []);

  const handleStartMatch = (id: string, qs: any[]) => {
    setMatchId(id);
    setQuestions(qs);
    setScreen('battle');
  };

  const handleBattleComplete = () => {
    setScreen('result');
  };

  const isDashboardScreen = ['home', 'wallet', 'profile', 'settings'].includes(screen);

  return (
    <div className="w-full max-w-md h-[100dvh] relative overflow-hidden game-bg text-slate-100 flex flex-col justify-between shadow-2xl border-x border-slate-950/20">
      
      {/* Background clouds or bubbled decor */}
      <div className="absolute top-16 left-4 w-16 h-10 bg-white/5 rounded-full blur-md pointer-events-none"></div>
      <div className="absolute top-32 right-10 w-24 h-14 bg-white/5 rounded-full blur-md pointer-events-none"></div>

      {/* Screen Area */}
      <div className="flex-1 w-full overflow-hidden relative">
        {screen === 'home' && <Home setScreen={setScreen} user={user} />}
        {screen === 'wallet' && <Wallet setScreen={setScreen} user={user} />}
        {screen === 'profile' && <Profile user={user} />}
        {screen === 'settings' && <Settings user={user} />}
        
        {screen === 'matchmaking' && (
          <Matchmaking 
            setScreen={setScreen} 
            user={user} 
            onStartMatch={handleStartMatch} 
            matchId={matchId}
            clearMatchId={() => setMatchId(null)}
          />
        )}
        {screen === 'battle' && <Battle setScreen={setScreen} matchId={matchId!} questions={questions} user={user} onComplete={handleBattleComplete} />}
        {screen === 'result' && <Result setScreen={setScreen} matchId={matchId!} user={user} />}
      </div>

      {/* Apple-style Game-themed Glassy Bottom Tab Menu */}
      {isDashboardScreen && (
        <div className="w-full rounded-t-3xl game-glass-dock flex items-center justify-around pt-3.5 pb-[calc(12px+env(safe-area-inset-bottom))] px-4 z-20">
          
          <button 
            onClick={() => setScreen('home')}
            className={`transition-all duration-200 cursor-pointer active:scale-75 relative p-2 ${
              screen === 'home' 
                ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                : 'text-white/50 hover:text-white/85'
            }`}
          >
            <Trophy className="w-5.5 h-5.5" />
            {screen === 'home' && <span className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>}
          </button>

          <button 
            onClick={() => setScreen('wallet')}
            className={`transition-all duration-200 cursor-pointer active:scale-75 relative p-2 ${
              screen === 'wallet' 
                ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                : 'text-white/50 hover:text-white/85'
            }`}
          >
            <Coins className="w-5.5 h-5.5" />
            {screen === 'wallet' && <span className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>}
          </button>

          <button 
            onClick={() => setScreen('profile')}
            className={`transition-all duration-200 cursor-pointer active:scale-75 relative p-2 ${
              screen === 'profile' 
                ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                : 'text-white/50 hover:text-white/85'
            }`}
          >
            <User className="w-5.5 h-5.5" />
            {screen === 'profile' && <span className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>}
          </button>

          <button 
            onClick={() => setScreen('settings')}
            className={`transition-all duration-200 cursor-pointer active:scale-75 relative p-2 ${
              screen === 'settings' 
                ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                : 'text-white/50 hover:text-white/85'
            }`}
          >
            <SettingsIcon className="w-5.5 h-5.5" />
            {screen === 'settings' && <span className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>}
          </button>

        </div>
      )}
    </div>
  );
}


