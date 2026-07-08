'use client';
import { ScreenState } from './AppController';
import { ArrowRight, Coins, CreditCard, History, Wallet as WalletIcon } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

interface WalletProps {
  setScreen: (screen: ScreenState) => void;
  user: any;
}

export default function Wallet({ setScreen, user }: WalletProps) {
  
  const handleBuy = (amount: number) => {
    alert(`انتقال به درگاه زرین‌پال برای خرید ${amount} سکه`);
  };

  return (
    <div className="flex flex-col h-full w-full p-5 overflow-y-auto pb-24 text-slate-900 animate-in fade-in duration-200">
      

      {/* Shop items */}
      <h3 className="font-black text-sm text-white drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)] mb-4 flex items-center gap-2">
        <CreditCard className="w-4.5 h-4.5 text-yellow-300" />
        خرید سکه
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { coins: 100, price: '۱۰,۰۰۰', popular: false, badge: 'پک برنزی' },
          { coins: 500, price: '۴۵,۰۰۰', popular: true, badge: 'پیشنهاد ویژه' },
          { coins: 1200, price: '۱۰۰,۰۰۰', popular: false, badge: 'پک طلایی' },
          { coins: 3000, price: '۲۰۰,۰۰۰', popular: false, badge: 'پک قهرمان' },
        ].map((pkg, idx) => (
          <button 
            key={idx}
            onClick={() => handleBuy(pkg.coins)}
            className={`relative p-5 rounded-2xl border-3 border-slate-900 bg-white flex flex-col items-center justify-center gap-2 cursor-pointer shadow-[0_6px_0_0_#0f172a] active:translate-y-1 active:shadow-[0_2px_0_0_#0f172a] transition-all`}
          >
            {pkg.badge && (
              <span className={`absolute -top-3 text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 ${
                pkg.popular 
                  ? 'bg-amber-400 text-slate-900' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {pkg.badge}
              </span>
            )}
            
            <div className="flex items-center gap-1 font-black text-xl mt-2 text-slate-800">
              {toPersianDigits(pkg.coins)}
              <Coins className="w-4.5 h-4.5 text-yellow-500" />
            </div>
            
            <div className="text-[10px] text-slate-500 font-bold">{pkg.price} تومان</div>
          </button>
        ))}
      </div>

      {/* History */}
      <h3 className="font-black text-sm text-white drop-shadow-[0_1.5px_0_rgba(0,0,0,0.5)] mb-4 flex items-center gap-2">
        <History className="w-4.5 h-4.5 text-yellow-300" />
        تراکنش‌های اخیر
      </h3>
      <div className="card-cartoon p-4 text-center text-slate-400 text-xs font-bold bg-white/70">
        تراکنشی یافت نشد.
      </div>
      
    </div>
  );
}
