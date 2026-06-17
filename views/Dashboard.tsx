
import React, { useMemo } from 'react';
import { StreakStats } from '../types';
import { getMotivationalMessage } from '../services/logic';
import { Flame, Calendar, Trophy, ChevronRight, CheckCircle2, Zap, Coffee, Target } from 'lucide-react';

interface DashboardProps {
  stats: StreakStats;
  weeklyProgress: number;
  weeklyGoal: number;
  onLogClick: () => void;
  onQuickRest: () => void;
  onNavigate: (view: any) => void;
}

export default function Dashboard({ stats, weeklyProgress, weeklyGoal, onLogClick, onQuickRest, onNavigate }: DashboardProps) {
  const message = useMemo(() => getMotivationalMessage(stats), [stats]);

  // Dynamic Theme based on Streak Length
  const theme = useMemo(() => {
    const s = stats.currentStreak;
    if (s >= 30) return {
        gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600",
        shadow: "shadow-orange-500/50",
        text: "text-yellow-50",
        icon: <Trophy size={100} className="text-yellow-100 animate-pulse" />,
        label: "Legendary"
    };
    if (s >= 7) return {
        gradient: "bg-gradient-to-br from-orange-500 via-red-500 to-rose-600",
        shadow: "shadow-orange-500/50",
        text: "text-orange-50",
        icon: <Flame size={100} className="text-orange-100 animate-pulse" />,
        label: "On Fire"
    };
    if (s >= 3) return {
        gradient: "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700",
        shadow: "shadow-violet-500/50",
        text: "text-violet-50",
        icon: <Zap size={100} className="text-violet-100" />,
        label: "Momentum"
    };
    if (s > 0) return {
        gradient: "bg-gradient-to-br from-blue-500 via-blue-600 to-sky-600",
        shadow: "shadow-blue-500/50",
        text: "text-blue-50",
        icon: <CheckCircle2 size={100} className="text-blue-100" />,
        label: "Active"
    };
    return {
        gradient: "bg-gradient-to-br from-slate-700 via-slate-800 to-zinc-900",
        shadow: "shadow-slate-500/30",
        text: "text-slate-300",
        icon: <Flame size={100} className="text-slate-600" />,
        label: "Inactive"
    };
  }, [stats.currentStreak]);

  // Calculations for Progress Ring
  const progressPercent = Math.min(100, Math.round((weeklyProgress / weeklyGoal) * 100));
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-8 fade-in pb-12">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gym Days</h1>
            <p className="text-slate-500 dark:text-zinc-400">Track progress, build momentum.</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
            <Trophy size={16} className="text-amber-500" /> 
            <span>Best: {stats.bestStreak}</span>
        </div>
      </header>

      {/* PROMINENT STREAK CARD */}
      <div 
        onClick={!stats.isTodayLogged ? onLogClick : undefined}
        className={`relative w-full rounded-[2rem] p-8 md:p-12 overflow-hidden transition-all duration-500 shadow-2xl group cursor-pointer ${theme.gradient} ${theme.shadow}`}
      >
         {/* Background Visuals */}
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl opacity-20 bg-white animate-pulse"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full blur-3xl opacity-20 bg-black"></div>
         
         <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
            {/* Label */}
            <div className={`text-base font-bold tracking-widest uppercase opacity-90 ${theme.text} flex items-center gap-2 border border-white/20 px-4 py-1 rounded-full backdrop-blur-sm`}>
                {theme.label}
            </div>

            {/* Huge Counter */}
            <div className="flex items-center justify-center gap-4">
                 <div className="text-7xl sm:text-8xl md:text-[10rem] font-black text-white tracking-tighter leading-none drop-shadow-lg transition-all">
                    {stats.currentStreak}
                 </div>
            </div>
            
            {/* Icon & Subtext */}
            <div className={`flex flex-col items-center gap-2 ${theme.text}`}>
                <div className="opacity-80 font-medium text-xl md:text-2xl">
                    {stats.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
                </div>
                {!stats.isTodayLogged && (
                    <div className="mt-6 bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-sm animate-bounce-slow shadow-lg hover:scale-105 transition-transform">
                        Tap to Log Today
                    </div>
                )}
                {stats.isTodayLogged && (
                    <div className="mt-4 text-white/60 text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 size={16} /> Logged for today
                    </div>
                )}
            </div>
         </div>
      </div>
      
      {/* Quick Rest Button - Only show if not logged today */}
      {!stats.isTodayLogged && (
         <div className="flex justify-center">
            <button 
                onClick={(e) => { e.stopPropagation(); onQuickRest(); }}
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
                <Coffee size={16} />
                Need a rest day? Quick Log
            </button>
         </div>
      )}

      {/* Daily Motivation - Fixed & Elegant */}
      <div className="text-center px-4 md:px-12 py-4">
            <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-zinc-300 leading-relaxed italic font-serif opacity-90">
                "{message}"
            </p>
            <div className="h-1 w-12 bg-violet-500/30 mx-auto mt-6 rounded-full"></div>
      </div>

      {/* STATS GRID - Now 3 Columns including Weekly Goal */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Weekly Goal Card */}
            <div className="col-span-2 lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between relative overflow-hidden">
                <div>
                     <span className="text-gray-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Target size={14} /> Weekly Goal
                     </span>
                     <div className="mt-2">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {weeklyProgress} <span className="text-gray-400 text-xl font-medium">/ {weeklyGoal}</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-medium">
                            {weeklyProgress >= weeklyGoal ? 'Goal Met! 🎉' : `${weeklyGoal - weeklyProgress} more to go`}
                        </div>
                     </div>
                </div>
                {/* Progress Ring */}
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle
                            className="text-gray-100 dark:text-zinc-800"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="40"
                            cy="40"
                        />
                        <circle
                            className={`${weeklyProgress >= weeklyGoal ? 'text-emerald-500' : 'text-violet-500'} transition-all duration-1000 ease-out`}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="40"
                            cy="40"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-gray-500 dark:text-zinc-400">
                        {progressPercent}%
                    </div>
                </div>
            </div>

            <StatCard 
                label="Total Sessions" 
                value={stats.totalDays} 
                sub="(No Rest Days)"
                icon={<Calendar size={24} className="text-emerald-500" />} 
            />
            <StatCard 
                label="Consistency" 
                value={`${stats.consistencyScore}%`} 
                sub="Last 14 days"
                icon={<div className="text-blue-500 font-bold text-xl ml-2">%</div>} 
            />
      </div>
      
      {/* Quick Links */}
      <div className="pt-2">
        <button onClick={() => onNavigate('history')} className="flex items-center justify-between w-full p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all shadow-sm group">
            <span className="font-bold text-slate-700 dark:text-zinc-200">View Full History</span>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-violet-500 transition-colors group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, sub, icon }: any) => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between h-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            {icon}
        </div>
        <div className="flex justify-between items-start z-10 gap-3">
            <span className="text-gray-500 dark:text-zinc-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate shrink">{label}</span>
            <div className="shrink-0">{icon}</div>
        </div>
        <div className="z-10 mt-auto">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
            {sub && <div className="text-[10px] sm:text-xs text-gray-400 dark:text-zinc-500 mt-0.5 font-medium truncate">{sub}</div>}
        </div>
    </div>
);
