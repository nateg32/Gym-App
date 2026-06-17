import React, { useState } from 'react';
import { GymLog, StreakStats } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface InsightsProps {
  stats: StreakStats;
  logs: GymLog[];
}

export default function Insights({ stats, logs }: InsightsProps) {
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- Data Prep for Type Distribution ---
  const activeLogs = logs.filter(l => l.workoutType !== 'Rest');
  
  const typeCounts = activeLogs.reduce((acc, log) => {
    acc[log.workoutType] = (acc[log.workoutType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.keys(typeCounts).map(type => ({
    name: type,
    value: typeCounts[type],
    percent: 0 
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const maxTypeValue = Math.max(...typeData.map(t => t.value), 1);
  typeData.forEach(t => t.percent = (t.value / maxTypeValue) * 100);

  const COLORS = ['bg-violet-500', 'bg-indigo-400', 'bg-blue-400', 'bg-sky-400', 'bg-teal-400'];

  // --- Averages ---
  const totalDuration = activeLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const avgDuration = activeLogs.length ? Math.round(totalDuration / activeLogs.length) : 0;
  
  const totalIntensity = activeLogs.reduce((sum, l) => sum + l.intensity, 0);
  const avgIntensity = activeLogs.length ? (totalIntensity / activeLogs.length).toFixed(1) : 0;

  // --- Calendar Logic ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getLogForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return logs.find(l => l.date === dateStr);
  };
  
  const isToday = (day: number) => {
      const today = new Date();
      return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <h1 className="text-2xl font-bold mb-4">Insights</h1>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Avg Duration</div>
            <div className="text-2xl font-bold">{avgDuration} <span className="text-sm font-normal text-gray-400">min</span></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Avg Intensity</div>
            <div className="text-2xl font-bold">{avgIntensity} <span className="text-sm font-normal text-gray-400">/ 10</span></div>
        </div>
      </div>

      {/* Activity Calendar (Replaces Bar Chart) */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm uppercase text-gray-500 flex items-center gap-2">
                <CalendarIcon size={16} /> 
                Activity Calendar
            </h3>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-lg p-1">
                <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md shadow-sm transition-all text-gray-600 dark:text-gray-300">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold w-24 text-center select-none text-slate-700 dark:text-zinc-200">
                    {monthNames[month]} {year}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md shadow-sm transition-all text-gray-600 dark:text-gray-300">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">
                    {d}
                </div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for padding */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const log = getLogForDay(day);
                const today = isToday(day);
                
                return (
                    <div key={day} className="aspect-square flex flex-col items-center justify-center relative">
                        <div className={`
                            w-full h-full rounded-lg flex items-center justify-center text-xs font-bold transition-all
                            ${log 
                                ? (log.workoutType === 'Rest' 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-violet-600 text-white shadow-md shadow-violet-500/20')
                                : 'bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }
                            ${today ? 'ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-zinc-900 z-10' : ''}
                        `}>
                            {day}
                        </div>
                    </div>
                );
            })}
        </div>
        
        <div className="mt-6 flex gap-6 justify-center text-[10px] text-gray-400 font-medium">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-600 shadow-sm"></div>
                <span>Workout</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800"></div>
                <span>Rest Day</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-violet-500"></div>
                <span>Today</span>
            </div>
        </div>
      </div>

      {/* Workout Types (Existing) */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h3 className="font-bold mb-4 text-sm uppercase text-gray-500">Top Workout Types</h3>
        <div className="space-y-4">
            {typeData.length === 0 ? (
                <p className="text-sm text-gray-400">No active workouts logged yet.</p>
            ) : (
                typeData.map((item, idx) => (
                    <div key={item.name} className="space-y-1">
                         <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                            <span className="font-bold text-gray-500">{item.value}</span>
                         </div>
                         <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${COLORS[idx % COLORS.length]} transition-all duration-1000 ease-out`}
                                style={{ width: `${item.percent}%` }}
                             ></div>
                         </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}