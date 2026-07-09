'use client';
import { useState } from 'react';
import { ScreenState } from './AppController';
import { Users, Copy, CheckCircle2, Link2, Loader2 } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

interface FriendInviteProps {
  setScreen: (screen: ScreenState) => void;
  user: any;
  onMatchCreated: (matchId: string, inviteCode: string) => void;
}

export default function FriendInvite({ setScreen, user, onMatchCreated }: FriendInviteProps) {
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || 'javabgamebot';

  const handleCreateInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/match/create-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: user.id }),
      });
      const data = await res.json();
      if (data.invite_code) {
        setInviteCode(data.invite_code);
        setMatchId(data.match_id);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    const link = `https://t.me/${BOT_USERNAME}?start=match_${matchId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    const link = `https://t.me/${BOT_USERNAME}?start=match_${matchId}`;
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('بیا با من مبارزه کن! 🎮')}`
      );
    }
  };

  const handleWaitForFriend = () => {
    if (matchId) onMatchCreated(matchId, inviteCode!);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/match/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: user.id, invite_code: joinCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok && data.match_id) {
        onMatchCreated(data.match_id, joinCode.trim().toUpperCase());
      } else {
        setJoinError(data.error || 'کد نامعتبر است');
      }
    } catch (e) {
      setJoinError('خطا در اتصال به سرور');
    }
    setJoining(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-5 overflow-y-auto pb-8 animate-in fade-in duration-200 gap-5">
      <h2 className="font-black text-white text-lg flex items-center gap-2 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)]">
        <Users className="w-5 h-5 text-amber-400" />
        چالش با دوست
      </h2>

      {/* CREATE INVITE */}
      <div className="card-cartoon p-5 bg-white">
        <h3 className="font-black text-sm text-slate-800 mb-1">ایجاد دعوت‌نامه</h3>
        <p className="text-xs text-slate-500 font-bold mb-4 leading-relaxed">
          یک کد اختصاصی بساز و برای دوستت بفرست.
        </p>

        {!inviteCode ? (
          <button
            onClick={handleCreateInvite}
            disabled={loading}
            className="btn-toy-yellow w-full py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {loading ? 'در حال ساخت...' : 'ساخت لینک دعوت'}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Invite Code Badge */}
            <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-400 font-black tracking-widest">کد دعوت</span>
              <span className="text-3xl font-black text-amber-400 tracking-widest">{inviteCode}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 btn-toy-blue py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'کپی شد!' : 'کپی لینک'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 btn-toy-green py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                اشتراک‌گذاری
              </button>
            </div>

            <button
              onClick={handleWaitForFriend}
              className="btn-toy-yellow w-full py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              منتظر دوستم هستم ←
            </button>
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40 font-black">یا</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* JOIN WITH CODE */}
      <div className="card-cartoon p-5 bg-white">
        <h3 className="font-black text-sm text-slate-800 mb-1">ورود با کد دعوت</h3>
        <p className="text-xs text-slate-500 font-bold mb-4 leading-relaxed">
          کد دوستت را وارد کن تا به بازی‌اش بپیوندی.
        </p>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="کد ۸ حرفی"
            maxLength={8}
            className="flex-1 border-3 border-slate-900 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-900 text-center tracking-widest outline-none focus:border-amber-400 transition-colors"
            style={{ fontFamily: 'monospace' }}
          />
          <button
            onClick={handleJoin}
            disabled={joining || joinCode.length < 6}
            className="btn-toy-yellow px-5 py-2.5 text-sm font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ورود'}
          </button>
        </div>
        {joinError && (
          <p className="text-xs text-red-500 font-black mt-2 text-center">{joinError}</p>
        )}
      </div>

      <button onClick={() => setScreen('home')} className="text-xs text-white/40 font-black text-center py-2">
        ← بازگشت
      </button>
    </div>
  );
}
