import React, { useState, useEffect } from 'react';
import { GymLog } from '../types';
import { Edit2, Trash2, Calendar as CalendarIcon, Clock, Dumbbell, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getTodayString } from '../services/logic';

interface HistoryProps {
  logs: GymLog[];
  onEdit: (log: GymLog) => void;
  onDelete: (id: string) => void;
}

export default function History({ logs, onEdit, onDelete }: HistoryProps) {
  // Find the date of the most recent log to initialize the calendar view
  // If no logs, fallback to Today.
  // This ensures if a user imports future data (e.g. 2026), the calendar jumps there.
  const latestLogDate = logs.length > 0 
    ? [...logs].sort((a, b) => b.date.localeCompare(a.date))[0].date 
    : getTodayString();

  // Initialize selectedDate to NULL to show the full list by default
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Initialize View Date to the month of the latest log (or today)
  const [viewDate, setViewDate] = useState(() => new Date(latestLogDate));

  // --- Calendar Logic ---
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getLogForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return logs.find(l => l.date === dateStr);
  };
  
  const isSelected = (day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return selectedDate === dateStr;
  };

  const handleDateClick = (day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // Toggle selection or select
      if (selectedDate === dateStr) {
          setSelectedDate(null); // Deselect to show all
      } else {
          setSelectedDate(dateStr);
      }
  };

  const filteredLogs = logs
    .filter(log => selectedDate ? log.date === selectedDate : true)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-2">
         <h1 className="text-2xl font-bold">History</h1>
         <div className="text-sm text-gray-500">{logs.length} sessions total</div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        
        {/* Left Panel: Calendar (Sticky on Desktop) */}
        <div className="w-full md:w-5/12 lg:w-4/12 shrink-0 md:sticky md:top-8 space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-lg shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                        {monthNames[month]} {year}
                    </h3>
                    <div className="flex items-center gap-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    
                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const log = getLogForDay(day);
                        const selected = isSelected(day);
                        
                        return (
                            <div key={day} className="aspect-square relative">
                                <button 
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                    w-full h-full rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative overflow-hidden
                                    ${selected 
                                        ? 'bg-slate-800 text-white shadow-md scale-95 ring-2 ring-offset-2 ring-slate-800 dark:ring-offset-zinc-900' 
                                        : (log 
                                            ? (log.workoutType === 'Rest' 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                                                : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300')
                                            : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-600')
                                    }
                                `}>
                                    {day}
                                    {log && (
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${selected ? 'bg-white' : (log.workoutType === 'Rest' ? 'bg-emerald-500' : 'bg-violet-500')}`}></div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Right Panel: List */}
        <div className="w-full grow space-y-4">
            {/* Selected Date Header */}
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-bold text-gray-500 uppercase">
                    {selectedDate 
                        ? `Log for ${new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}` 
                        : 'All Logs'}
                </span>
                {selectedDate && (
                    <button 
                        onClick={() => setSelectedDate(null)}
                        className="text-xs text-violet-600 font-medium hover:underline flex items-center gap-1"
                    >
                        <X size={12} /> Show All
                    </button>
                )}
            </div>

            {/* Filtered List */}
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                    <div className="inline-block p-4 rounded-full bg-gray-50 dark:bg-zinc-800 mb-4">
                    <CalendarIcon className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No logs</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {selectedDate ? "Nothing logged for this specific day." : "Your history is empty."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredLogs.map(log => (
                        <div 
                            key={log.id} 
                            onClick={() => onEdit(log)}
                            className={`
                                group bg-white dark:bg-zinc-900 rounded-2xl border p-5 shadow-sm transition-all cursor-pointer relative overflow-hidden hover:shadow-md
                                ${log.workoutType === 'Rest' 
                                    ? 'border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700' 
                                    : 'border-gray-100 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700'
                                }
                            `}
                        >
                            {/* Decorative accent */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${log.workoutType === 'Rest' ? 'bg-emerald-500' : 'bg-violet-500'}`}></div>

                            <div className="flex justify-between items-start mb-3 pl-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${
                                        log.workoutType === 'Rest' 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                                        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                                    }`}>
                                        <Dumbbell size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{log.workoutType}</h3>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Actions Group - Prevents collision */}
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit2 size={16} />
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if(window.confirm("Delete this log?")) onDelete(log.id);
                                        }} 
                                        className="p-2 bg-gray-50 dark:bg-zinc-800 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {log.workoutType !== 'Rest' && (
                                <div className="flex gap-4 mb-4 text-sm text-gray-500 dark:text-zinc-400 pl-3">
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                                        <Clock size={14} />
                                        <span className="font-semibold">{log.durationMinutes}</span> min
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                                        <span className="font-bold text-violet-600">{log.intensity}</span>/10 RPE
                                    </div>
                                </div>
                            )}

                            {log.bodyAreas.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3 pl-3">
                                    {log.bodyAreas.map(area => (
                                        <span key={area} className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-xs font-medium rounded-md border border-gray-200 dark:border-zinc-700">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {log.notes && (
                                <p className="text-sm text-gray-500 italic mt-3 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg ml-3 border-l-2 border-gray-200 dark:border-zinc-700">
                                    "{log.notes}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}