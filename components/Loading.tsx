'use client';
import { Star } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "درحال بارگذاری..." }: LoadingProps) {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6 text-slate-900 animate-in fade-in duration-300">
      <div className="card-cartoon p-8 max-w-xs w-full bg-white flex flex-col items-center justify-center shadow-[0_8px_0_0_#0f172a]">
        
        {/* Playful Bouncing Stars Loader */}
        <div className="flex items-center gap-3 mb-6 relative">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }} />
          <Star className="w-10 h-10 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.8s' }} />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.8s' }} />
        </div>

        <h3 className="text-sm font-black text-slate-800 tracking-wide animate-pulse">{message}</h3>
        
        {/* Bouncy progress bar mockup */}
        <div className="w-full bg-slate-100 border-2 border-slate-900 h-4 rounded-full mt-5 overflow-hidden p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
          <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 border-r-2 border-slate-900 rounded-full w-[80%] transition-all"></div>
        </div>
      </div>
    </div>
  );
}
