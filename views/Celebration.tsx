import React, { useEffect, useState } from 'react';
import { MOTIVATIONAL_MESSAGES } from '../constants';
import { CheckCircle2, X } from 'lucide-react';

interface CelebrationProps {
  onClose: () => void;
  streak: number;
}

export default function Celebration({ onClose, streak }: CelebrationProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Combine all general messages plus high streak ones if applicable
    let pool = [...MOTIVATIONAL_MESSAGES.general];
    if (streak > 3) {
      pool = [...pool, ...MOTIVATIONAL_MESSAGES.highStreak];
    }
    
    // Pick a random message
    const randomMsg = pool[Math.floor(Math.random() * pool.length)];
    setMessage(randomMsg);

    // Auto close after 4 seconds if user doesn't click
    const timer = setTimeout(() => {
    //   onClose(); // Optional: auto-close or let user close
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [streak]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-violet-600/95 dark:bg-violet-900/95 backdrop-blur-sm animate-fade-in p-6 text-center">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
      >
        <X size={32} />
      </button>

      <div className="space-y-8 animate-scale-in max-w-md">
        <div className="flex justify-center">
             <div className="bg-white/20 p-6 rounded-full text-white backdrop-blur-md shadow-2xl">
                <CheckCircle2 size={64} strokeWidth={3} />
             </div>
        </div>
        
        <div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-4">Workout Logged!</h2>
            <div className="h-1 w-20 bg-white/30 mx-auto rounded-full mb-6"></div>
            <p className="text-2xl md:text-3xl font-medium text-violet-100 leading-tight">
                "{message}"
            </p>
        </div>

        {streak > 1 && (
             <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-bounce">
                🔥 {streak} Day Streak!
             </div>
        )}

        <div className="pt-8">
            <button 
                onClick={onClose}
                className="bg-white text-violet-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
                Continue
            </button>
        </div>
      </div>
      
      {/* Simple CSS Confetti effects could be added here */}
    </div>
  );
}