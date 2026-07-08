'use client';
import { Award } from 'lucide-react';

interface MedalProps {
  tier: string;
  className?: string;
}

export default function Medal({ tier, className = "w-6 h-6" }: MedalProps) {
  const normalized = tier === 'برنز' || tier === 'Bronze' ? 'bronze' :
                     tier === 'نقره' || tier === 'Silver' ? 'silver' :
                     tier === 'طلا' || tier === 'Gold' ? 'gold' : 'diamond';

  if (normalized === 'bronze') {
    return (
      <span className={`inline-flex items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-[#c87533] to-[#a05220] p-0.5 shadow-[0_2px_0_0_#0f172a] ${className}`}>
        <Award className="w-full h-full text-amber-100 fill-amber-100/10" />
      </span>
    );
  }
  
  if (normalized === 'silver') {
    return (
      <span className={`inline-flex items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-slate-200 to-slate-400 p-0.5 shadow-[0_2px_0_0_#0f172a] ${className}`}>
        <Award className="w-full h-full text-slate-100 fill-slate-100/10" />
      </span>
    );
  }
  
  if (normalized === 'gold') {
    return (
      <span className={`inline-flex items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-yellow-300 to-amber-500 p-0.5 shadow-[0_2px_0_0_#0f172a] ${className}`}>
        <Award className="w-full h-full text-yellow-950 fill-yellow-950/10" />
      </span>
    );
  }
  
  // Diamond
  return (
    <span className={`inline-flex items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-sky-200 to-indigo-400 p-0.5 shadow-[0_2px_0_0_#0f172a] ${className}`}>
      <Award className="w-full h-full text-white fill-white/10" />
    </span>
  );
}
