import React, { useRef } from 'react';
import { AppSettings, AppState, GymLog, BodyArea } from '../types';
import { Moon, Sun, Monitor, Download, Upload, Trash2, Target, AlertCircle } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (s: Partial<AppSettings>) => void;
  appData: AppState;
  onImport: (data: AppState) => void;
  onReset: () => void;
}

export default function Settings({ settings, onUpdate, appData, onImport, onReset }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // Transform internal state to the requested external JSON format
    const exportLogs = appData.logs.map(log => ({
        id: log.id,
        date: log.date,
        workoutType: log.workoutType,
        durationMinutes: log.durationMinutes,
        intensity1to10: log.intensity, // External format key
        bodyAreas: log.bodyAreas,
        exercises: [], // External format field
        notes: log.notes,
        moodBefore: null, 
        moodAfter: null, 
        createdAt: new Date(log.createdAt).toISOString(), // ISO String
        updatedAt: new Date(log.updatedAt).toISOString()  // ISO String
    }));

    const exportData = {
        logs: exportLogs,
        settings: appData.settings
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gym-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
        // Clear value ensures change event fires even if same file selected
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result;
        if (!result || typeof result !== 'string') {
            alert("Error: File could not be read (empty or invalid type).");
            return;
        }

        const json = JSON.parse(result);
        
        let importedLogs: GymLog[] = [];
        // Handle both simple array and object wrapper formats
        const rawLogs = Array.isArray(json) ? json : (json.logs || []);

        if (Array.isArray(rawLogs)) {
            importedLogs = rawLogs.map((l: any) => ({
                id: l.id || Date.now().toString() + Math.random().toString(),
                date: l.date, // Assume YYYY-MM-DD matches
                workoutType: l.workoutType || 'Strength',
                durationMinutes: l.durationMinutes || 0,
                // Handle intensity1to10 mapping from external formats
                intensity: typeof l.intensity1to10 === 'number' ? l.intensity1to10 : (l.intensity || 5),
                // Normalize Body Areas
                bodyAreas: (l.bodyAreas || []).map((a: string) => 
                    a.toLowerCase() === 'full body' ? 'Full Body' : a
                ) as BodyArea[],
                notes: l.notes || '',
                // Parse ISO strings to timestamps
                createdAt: l.createdAt ? new Date(l.createdAt).getTime() : Date.now(),
                updatedAt: l.updatedAt ? new Date(l.updatedAt).getTime() : Date.now()
            }));
        } else {
             alert("Error: JSON format not recognized. Could not find logs array.");
             return;
        }

        if (importedLogs.length > 0 || json.settings) {
            // MERGE STRATEGY: 
            // 1. Create a map of existing logs by Date (unique constraint)
            const logMap = new Map(appData.logs.map(log => [log.date, log]));
            
            // 2. Overwrite/Add imported logs
            importedLogs.forEach(log => {
                logMap.set(log.date, log);
            });

            // 3. Convert back to array
            const mergedLogs = Array.from(logMap.values());
            
            // 4. Merge Settings (Imported settings take precedence if present)
            const mergedSettings = { ...appData.settings, ...(json.settings || {}) };

            if (window.confirm(`Found ${importedLogs.length} logs.\n\nMerge with existing data?`)) {
                onImport({
                    logs: mergedLogs,
                    settings: mergedSettings
                });
                // Note: The parent component handles navigation after this
            }
        } else {
          alert("No valid logs found in the file.");
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing JSON. Check console for details.");
      }
    };
    
    reader.onerror = () => {
        alert("Error reading file from disk.");
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Weekly Goal */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-500 uppercase flex items-center gap-2">
            <Target size={16} /> Weekly Goal
        </div>
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Target Workouts per Week</span>
                <span className="text-2xl font-bold text-violet-600">{settings.weeklyGoal}</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="7" 
                step="1"
                value={settings.weeklyGoal} 
                onChange={(e) => onUpdate({ weeklyGoal: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
             <div className="flex justify-between text-xs text-gray-400 mt-2">
                 <span>1 Day</span>
                 <span>7 Days</span>
             </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-500 uppercase">Appearance</div>
        <div className="p-4 flex gap-2">
            {[
                { id: 'light', icon: <Sun size={20} />, label: 'Light' },
                { id: 'dark', icon: <Moon size={20} />, label: 'Dark' },
                { id: 'system', icon: <Monitor size={20} />, label: 'System' },
            ].map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => onUpdate({ theme: opt.id as any })}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                        settings.theme === opt.id 
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500' 
                        : 'bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700'
                    }`}
                >
                    {opt.icon}
                    <span className="text-xs font-medium">{opt.label}</span>
                </button>
            ))}
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-500 uppercase">Data Management</div>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            <button 
                onClick={handleExport}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
            >
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Download size={20} />
                </div>
                <div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-xs text-gray-400">Download a JSON backup</div>
                </div>
            </button>

            <button 
                onClick={handleImportClick}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
            >
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Upload size={20} />
                </div>
                <div>
                    <div className="font-medium">Import / Merge Data</div>
                    <div className="text-xs text-gray-400">Restore from backup or add missing logs</div>
                </div>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200 text-xs flex gap-2 items-start">
                 <AlertCircle size={16} className="shrink-0 mt-0.5" />
                 <p>Importing data will <strong>merge</strong> new logs with your existing history. If a log exists for the same date, it will be updated.</p>
            </div>

            <button 
                onClick={onReset}
                className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
            >
                <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200">
                    <Trash2 size={20} />
                </div>
                <div>
                    <div className="font-medium text-red-600">Reset All Data</div>
                    <div className="text-xs text-red-400">Permanently delete everything</div>
                </div>
            </button>
        </div>
      </section>

      <div className="text-center text-xs text-gray-300 dark:text-zinc-700 pt-8 pb-4">
        Gym Days Tracker v1.1.3
      </div>
    </div>
  );
}