'use client';
import { useEffect, useState } from 'react';
import { Trophy, Award, Star, Flame, Users } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import Medal from './Medal';

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await fetch('/api/user/online-count');
        const data = await res.json();
        setOnlineCount(data.online ?? 0);
      } catch { /* ignore */ }
    };
    fetchOnline();
    const interval = setInterval(fetchOnline, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-y-auto pb-24 text-slate-900 animate-in fade-in duration-200">

      {/* ── Profile Card ──────────────────────────────────────────── */}
      <div className="card-cartoon p-6 flex flex-col items-center justify-center relative mb-4">
        <div className="w-20 h-20 rounded-full border-4 border-slate-900 bg-amber-400 flex items-center justify-center text-3xl font-black mb-3">
          {user.name.charAt(0)}
        </div>
        <h2 className="text-xl font-black">{user.name}</h2>
        <span className="text-xs font-bold text-slate-400 mt-1">{user.rank}</span>
      </div>

      {/* ── Online Players Badge ───────────────────────────────────── */}
      <div className="card-cartoon p-4 mb-4 flex items-center justify-between bg-emerald-50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white animate-pulse" />
          </div>
          <span className="text-xs font-black text-emerald-800">بازیکنان آنلاین</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-400 border-2 border-slate-900 rounded-full px-3 py-1 shadow-[0_2px_0_0_#047857]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-black text-slate-900">
            {onlineCount === null
              ? '...'
              : toPersianDigits(onlineCount)}
          </span>
        </div>
      </div>

      {/* ── Rank Details ──────────────────────────────────────────── */}
      <div className="card-cartoon p-5 mb-4">
        <h3 className="font-black text-xs text-slate-400 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          رتبه و لیگ شما
        </h3>
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <Medal tier={user.rank} className="w-12 h-12" />
            <div>
              <p className="text-xs font-black text-slate-400">لیگ فعلی</p>
              <p className="text-[10px] text-slate-400 mt-0.5">امتیازات کل</p>
            </div>
          </div>
          <span className="text-2xl font-black text-amber-500">{toPersianDigits(user.score)}</span>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-cartoon p-4 bg-white text-slate-900">
          <div className="flex items-center gap-2 text-sky-500 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-[10px] font-black text-slate-400">نرخ برد</span>
          </div>
          <p className="text-xl font-black">۶۸٪</p>
        </div>

        <div className="card-cartoon p-4 bg-white text-slate-900">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <Star className="w-4 h-4 fill-rose-500/10" />
            <span className="text-[10px] font-black text-slate-400">زنجیره برد</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-black">۵</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          </div>
        </div>
      </div>

    </div>
  );
}
