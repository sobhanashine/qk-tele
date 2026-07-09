'use client';
import { useState } from 'react';
import { BookOpen, Zap, Globe, Cpu, Trophy, Film, Music, FlaskConical } from 'lucide-react';

interface CategoryPickerProps {
  matchId: string;
  currentRound: number;
  totalRounds: number;
  user: any;
  isMyTurn: boolean;
  opponentName?: string;
  onCategorySelected: (questions: any[]) => void;
}

const CATEGORIES = [
  { key: 'جغرافیا', label: 'جغرافیا', icon: Globe, color: 'btn-toy-blue' },
  { key: 'تاریخ', label: 'تاریخ', icon: Trophy, color: 'btn-toy-purple' },
  { key: 'علوم', label: 'علوم', icon: FlaskConical, color: 'btn-toy-green' },
  { key: 'ورزشی', label: 'ورزشی', icon: Zap, color: 'btn-toy-yellow' },
  { key: 'ادبیات', label: 'ادبیات', icon: BookOpen, color: 'btn-toy-red' },
  { key: 'سینما', label: 'سینما', icon: Film, color: 'btn-toy-blue' },
  { key: 'موسیقی', label: 'موسیقی', icon: Music, color: 'btn-toy-purple' },
  { key: 'عمومی', label: 'دانش عمومی', icon: Cpu, color: 'btn-toy-yellow' },
];

export default function CategoryPicker({
  matchId,
  currentRound,
  totalRounds,
  user,
  isMyTurn,
  opponentName,
  onCategorySelected,
}: CategoryPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (category: string) => {
    if (!isMyTurn || loading) return;
    setSelected(category);
    setLoading(true);
    try {
      const res = await fetch(`/api/match/${matchId}/select-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: user.id, category }),
      });
      const data = await res.json();
      if (data.questions) {
        onCategorySelected(data.questions);
      }
    } catch (e) {
      console.error(e);
      setSelected(null);
    }
    setLoading(false);
  };

  const roundDots = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full w-full p-5 animate-in fade-in duration-200">
      {/* Round indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-white/50 text-[10px] font-black tracking-widest">راند</span>
          <span className="text-white font-black text-2xl leading-tight">{currentRound} / {totalRounds}</span>
        </div>
        <div className="flex gap-2">
          {roundDots.map(r => (
            <div
              key={r}
              className={`w-3 h-3 rounded-full border-2 border-slate-900 transition-all ${
                r < currentRound
                  ? 'bg-emerald-400'
                  : r === currentRound
                  ? 'bg-amber-400 scale-125'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isMyTurn ? (
        <>
          <div className="card-cartoon p-4 bg-amber-50 mb-5 text-center">
            <p className="text-xs font-black text-amber-900">
              🎯 نوبت توست! موضوع راند {currentRound} را انتخاب کن
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 content-start">
            {CATEGORIES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={loading}
                className={`${color} py-5 flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-40 transition-all ${
                  selected === key ? 'scale-95 opacity-70' : ''
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-black">{label}</span>
                {selected === key && loading && (
                  <span className="text-[9px] animate-pulse">در حال بارگذاری...</span>
                )}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="card-cartoon p-8 bg-white flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full border-3 border-slate-900 bg-sky-100 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-sky-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base mb-1">
                {opponentName || 'حریف'} دارد موضوع انتخاب می‌کند
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                راند {currentRound} از {totalRounds} • منتظر بمان...
              </p>
            </div>
            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce border-2 border-slate-900"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
