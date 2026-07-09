'use client';
import { useState, useEffect } from 'react';
import { ScreenState } from './AppController';
import { HelpCircle, Star, Swords } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

interface BattleProps {
  setScreen: (screen: ScreenState) => void;
  matchId: string;
  questions: any[];
  user: any;
  onComplete: () => void;
}

export default function Battle({ setScreen, matchId, questions, user, onComplete }: BattleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = questions[currentIndex];

  const handleAnswer = async (index: number) => {
    if (isSubmitting || selectedOption !== null) return;
    setIsSubmitting(true);
    setSelectedOption(index);

    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    const answerTime = (15 - timeLeft) * 1000;
    try {
      const res = await fetch(`/api/match/${matchId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user.id,
          question_id: currentQ?.id,
          selected_index: index,
          answer_time_ms: answerTime
        })
      });
      const data = await res.json();
      setIsCorrect(data.correct);

      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred(data.correct ? 'success' : 'error');
      }

    } catch (e) {
      console.error(e);
      setIsCorrect(false);
    }

    // Advance to next question after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(15);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsSubmitting(false);
      } else {
        fetch(`/api/match/${matchId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram_id: user.id })
        }).then(() => {
          onComplete();
        });
      }
    }, 1600);
  };

  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitting && selectedOption === null) {
      setTimeout(() => {
        handleAnswer(-1); // Timeout
      }, 0);
      return;
    }

    if (selectedOption === null) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selectedOption, isSubmitting]);

  if (!currentQ) return null;

  // All options start yellow — correct/wrong colours appear only after selecting
  const toyColors = ["btn-toy-yellow", "btn-toy-yellow", "btn-toy-yellow", "btn-toy-yellow"];

  return (
    <div className="flex flex-col h-full w-full p-5 justify-between relative overflow-hidden">
      
      {/* VS Head HUD */}
      <div className="flex justify-between items-center w-full z-10 bg-white border-3 border-slate-900 p-3 rounded-2xl shadow-[0_4px_0_0_#0f172a] mb-4 text-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full border-2 border-slate-900 bg-amber-400 flex items-center justify-center font-black text-xs">
            {user.name.charAt(0)}
          </div>
          <span className="font-black text-xs">{user.name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="bg-rose-500 border-2 border-slate-900 px-2 py-0.5 rounded-full text-[9px] font-black text-white italic">
            VS
          </div>
        </div>

        <div className="flex items-center gap-2 dir-ltr">
          <div className="w-9 h-9 rounded-full border-2 border-slate-900 bg-slate-200 flex items-center justify-center font-black text-xs text-slate-500">
            ؟
          </div>
          <span className="font-black text-xs text-slate-500">حریف</span>
        </div>
      </div>

      {/* Progress dot bar */}
      <div className="flex justify-center gap-2 mb-4">
        {questions.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-3 rounded-full border-2 border-slate-900 transition-all duration-300 ${
              idx === currentIndex 
                ? 'w-7 bg-amber-400' 
                : idx < currentIndex 
                  ? 'w-3 bg-emerald-400' 
                  : 'w-3 bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Question Card & Timer */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-2">
        
        {/* Timer bubble */}
        <div className="absolute top-[-20px] z-20 bg-amber-400 border-3 border-slate-900 px-4 py-2.5 rounded-2xl shadow-[0_4px_0_0_#0f172a] font-black text-lg flex items-center gap-1.5">
          <span className={`${timeLeft <= 4 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
            {toPersianDigits(timeLeft)}
          </span>
          <span className="text-[10px] text-slate-700">ثانیه</span>
        </div>

        {/* Question Panel */}
        <div key={currentIndex} className="card-cartoon w-full p-5 sm:p-8 pt-8 sm:pt-10 text-center relative overflow-hidden min-h-[120px] sm:min-h-[160px] flex flex-col items-center justify-center animate-bounce-pop">
          <div className="absolute -top-3.5 right-6 bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black tracking-wide border-2 border-slate-900 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            {currentQ.category || 'عمومی'}
          </div>
          
          <h3 className="text-sm sm:text-base font-black leading-relaxed text-slate-800">
            {currentQ.text}
          </h3>
        </div>
      </div>

      {/* Playful 2x2 Options Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto mb-2">
        {(currentQ.options || []).map((opt: string, idx: number) => {
          
          let btnClass = toyColors[idx % toyColors.length];

          if (selectedOption === idx) {
            if (isCorrect === true) {
              btnClass = "btn-toy-green";
            } else if (isCorrect === false) {
              btnClass = "btn-toy-red animate-shake";
            } else {
              btnClass = "btn-toy-yellow"; // Selection waiting
            }
          } else if (selectedOption !== null) {
            if (idx === currentQ.correct_index && isCorrect === false) {
              btnClass = "btn-toy-green animate-pulse"; // Reveal correct
            } else {
              btnClass = "opacity-40 pointer-events-none"; // Faded out
            }
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (selectedOption === null) {
                  handleAnswer(idx);
                }
              }}
              className={`p-3 sm:p-4 min-h-[76px] sm:h-24 flex flex-col items-center justify-center text-center text-xs sm:text-sm font-black tracking-wide cursor-pointer transition-all ${btnClass} ${
                selectedOption !== null ? 'pointer-events-none' : ''
              }`}
            >
              <span>{opt}</span>
              {selectedOption === idx && isCorrect !== null && (
                <span className="text-[8px] bg-slate-900/10 px-2 py-0.5 rounded-full mt-1">
                  {isCorrect ? 'درست' : 'نادرست'}
                </span>
              )}
            </button>
          );
        })}
      </div>



    </div>
  );
}
