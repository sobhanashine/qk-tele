'use client';
import { Trophy, Award, Star, TrendingUp, Calendar, Flame } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import Medal from './Medal';


interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  return (
    <div className="flex flex-col h-full w-full p-6 overflow-y-auto pb-24 text-slate-900 animate-in fade-in duration-200">
      {/* Profile Card */}
      <div className="card-cartoon p-6 flex flex-col items-center justify-center relative mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-slate-900 bg-amber-400 flex items-center justify-center text-3xl font-black mb-3">
          {user.name.charAt(0)}
        </div>
        <h2 className="text-xl font-black">{user.name}</h2>
        <span className="text-xs font-bold text-slate-500 mt-1">شناسه تلگرام: {toPersianDigits(user.id)}</span>
      </div>

      {/* Rank Details */}
      <div className="card-cartoon p-6 mb-6">
        <h3 className="font-black text-sm text-slate-500 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          رتبه و لیگ شما
        </h3>
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <Medal tier={user.rank} className="w-12 h-12" />
            <div>
              <p className="text-xs font-black text-slate-400">لیگ فعلی</p>
              <p className="text-[10px] text-slate-500 mt-0.5">امتیازات کل</p>
            </div>
          </div>
          <span className="text-2xl font-black text-amber-500">{toPersianDigits(user.score)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-cartoon p-4 bg-white text-slate-900">
          <div className="flex items-center gap-2 text-sky-500 mb-2">
            <Award className="w-4.5 h-4.5" />
            <span className="text-[10px] font-black text-slate-400">نرخ برد</span>
          </div>
          <p className="text-xl font-black">۶۸٪</p>
        </div>
        
        <div className="card-cartoon p-4 bg-white text-slate-900">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <Star className="w-4.5 h-4.5 fill-rose-500/10" />
            <span className="text-[10px] font-black text-slate-400">زنجیره برد</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-black">۵</span>
            <Flame className="w-4.5 h-4.5 text-orange-500 fill-orange-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
