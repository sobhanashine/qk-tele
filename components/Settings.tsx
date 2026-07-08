'use client';
import { Volume2, VolumeX, Moon, Sun, Globe, LogOut, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toPersianDigits } from '@/lib/utils';

interface SettingsProps {
  user: any;
}

export default function Settings({ user }: SettingsProps) {
  const [sfx, setSfx] = useState(true);
  const [music, setMusic] = useState(true);

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-y-auto pb-24 text-slate-900 animate-in fade-in duration-200">
      
      <div className="card-cartoon p-6 mb-6">
        <h3 className="font-black text-base mb-4">تنظیمات بازی</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">صداهای بازی (SFX)</span>
            <button 
              onClick={() => setSfx(!sfx)}
              className={`px-4 py-2 rounded-2xl font-black text-xs border-2 border-slate-900 transition-all cursor-pointer active:scale-95 active:translate-y-0.5 ${
                sfx ? 'bg-amber-400' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {sfx ? 'روشن' : 'خاموش'}
            </button>
          </div>
 
          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <span className="font-bold text-sm">موزیک متن</span>
            <button 
              onClick={() => setMusic(!music)}
              className={`px-4 py-2 rounded-2xl font-black text-xs border-2 border-slate-900 transition-all cursor-pointer active:scale-95 active:translate-y-0.5 ${
                music ? 'bg-amber-400' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {music ? 'روشن' : 'خاموش'}
            </button>
          </div>
        </div>
      </div>
 
      <div className="card-cartoon p-6 mb-6">
        <h3 className="font-black text-base mb-4">اطلاعات برنامه</h3>
        <div className="flex flex-col gap-3 text-xs font-bold text-slate-500">
          <div className="flex justify-between">
            <span>نسخه اپلیکیشن</span>
            <span>{toPersianDigits('v1.0.0')} (بتا)</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <span>زبان</span>
            <span>فارسی (RTL)</span>
          </div>
        </div>
      </div>
 
      <button className="w-full bg-slate-200 text-slate-700 border-2 border-slate-900 border-b-6 rounded-2xl p-4 font-black text-sm active:translate-y-0.5 active:border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer">
        <LogOut className="w-4 h-4" />
        خروج از بازی
      </button>

    </div>
  );
}
