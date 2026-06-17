import React, { useState, useEffect } from 'react';
import { GymLog, WorkoutType, BodyArea } from '../types';
import { WORKOUT_TYPES, BODY_AREAS } from '../constants';
import { getTodayString } from '../services/logic';
import { Save, X, Coffee, CalendarOff } from 'lucide-react';

interface LoggerProps {
  initialData: GymLog | null;
  onSave: (log: GymLog) => void;
  onCancel: () => void;
}

export default function Logger({ initialData, onSave, onCancel }: LoggerProps) {
  // Date is strictly initialized to Today and cannot be changed for new logs
  const [date, setDate] = useState(initialData ? initialData.date : getTodayString());
  const [type, setType] = useState<WorkoutType>('Strength');
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState(5);
  const [bodyAreas, setBodyAreas] = useState<BodyArea[]>([]);
  const [notes, setNotes] = useState('');

  const isRest = type === 'Rest';

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setType(initialData.workoutType);
      setDuration(initialData.durationMinutes);
      setIntensity(initialData.intensity);
      setBodyAreas(initialData.bodyAreas);
      setNotes(initialData.notes);
    }
  }, [initialData]);

  const toggleBodyArea = (area: BodyArea) => {
    if (bodyAreas.includes(area)) {
      setBodyAreas(bodyAreas.filter(a => a !== area));
    } else {
      setBodyAreas([...bodyAreas, area]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: GymLog = {
      id: initialData ? initialData.id : Date.now().toString(),
      date, // Uses the locked date
      workoutType: type,
      durationMinutes: isRest ? 0 : duration,
      intensity: isRest ? 0 : intensity,
      bodyAreas: isRest ? [] : bodyAreas,
      notes: isRest && !notes ? "Rest Day" : notes,
      createdAt: initialData ? initialData.createdAt : Date.now(),
      updatedAt: Date.now()
    };
    onSave(log);
  };

  return (
    <div className="animate-fade-in-up pb-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{initialData ? 'Edit Log' : 'Log Session'}</h2>
        <button onClick={onCancel} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Date & Type */}
        <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase text-gray-400">Date</label>
                    <span className="text-[10px] text-orange-500 flex items-center gap-1">
                        <CalendarOff size={10} />
                        Locked to {initialData ? 'Original Date' : 'Today'}
                    </span>
                </div>
                <input 
                    type="date" 
                    required
                    value={date} 
                    disabled={true} // Strictly disabled to prevent cheating
                    className="w-full bg-gray-100 dark:bg-zinc-800/50 text-gray-500 border-none rounded-lg p-3 text-sm cursor-not-allowed opacity-70"
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Log Type</label>
                <div className="flex flex-wrap gap-2">
                    {WORKOUT_TYPES.map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                type === t 
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {!isRest && (
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Duration (min)</label>
                    <input 
                        type="number" 
                        value={duration} 
                        onChange={e => setDuration(Number(e.target.value))}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500"
                    />
                </div>
            )}
        </section>

        {/* Conditional Sections for Non-Rest Days */}
        {!isRest ? (
            <>
                {/* Intensity */}
                <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                     <div className="flex justify-between items-center mb-4">
                         <label className="block text-xs font-bold uppercase text-gray-400">Intensity (RPE)</label>
                         <span className="text-xl font-bold text-violet-600">{intensity}</span>
                     </div>
                     <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={intensity} 
                        onChange={e => setIntensity(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                     />
                     <div className="flex justify-between text-xs text-gray-400 mt-2">
                         <span>Light</span>
                         <span>Moderate</span>
                         <span>All Out</span>
                     </div>
                </section>

                {/* Body Areas */}
                <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                     <div className="flex justify-between items-center mb-4">
                         <label className="block text-xs font-bold uppercase text-gray-400">Focus Areas</label>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {BODY_AREAS.map(area => (
                            <button
                                key={area}
                                type="button"
                                onClick={() => toggleBodyArea(area as BodyArea)}
                                className={`py-2 px-1 text-xs rounded-lg transition-colors border ${
                                    bodyAreas.includes(area as BodyArea)
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                    : 'border-transparent bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                                }`}
                            >
                                {area}
                            </button>
                        ))}
                     </div>
                </section>
            </>
        ) : (
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 text-center">
                <Coffee size={48} className="mx-auto text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Rest & Recovery</h3>
                <p className="text-sm text-gray-500">Good recovery is just as important as the workout. This day will still count towards your habit streak!</p>
            </section>
        )}

        {/* Notes */}
        <section>
             <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Notes</label>
             <textarea 
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                placeholder={isRest ? "What did you do for recovery? (Stretching, sleep, etc.)" : "How did it feel? Any pain points?"}
             />
        </section>

        {/* Submit */}
        <button 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/40 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
        >
            <Save size={20} />
            {isRest ? 'Log Rest Day' : 'Save Workout Log'}
        </button>
      </form>
    </div>
  );
}