import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart2, 
  Settings as SettingsIcon
} from 'lucide-react';
import { GymLog, AppSettings, AppState } from './types';
import { calculateStats, getTodayString, getWeeklyProgress } from './services/logic';
import Dashboard from './views/Dashboard';
import Logger from './views/Logger';
import HistoryView from './views/History';
import Insights from './views/Insights';
import SettingsView from './views/Settings';
import Celebration from './views/Celebration';

// Hooks
const useGymData = () => {
  const [data, setData] = useState<AppState>(() => {
    const saved = localStorage.getItem('gymTrackerData_v1');
    const parsed = saved ? JSON.parse(saved) : {
      logs: [],
      settings: { theme: 'system', dailyMessageEnabled: true, weeklyGoal: 4 }
    };
    
    // Migration for existing users who might be missing weeklyGoal
    if (parsed.settings.weeklyGoal === undefined) {
      parsed.settings.weeklyGoal = 4;
    }
    
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem('gymTrackerData_v1', JSON.stringify(data));
    
    // Theme application
    const root = window.document.documentElement;
    const isDark = data.settings.theme === 'dark' || 
      (data.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data]);

  const addLog = (log: GymLog) => {
    setData(prev => {
      // Remove existing log for this date if exists (overwrite logic)
      const filtered = prev.logs.filter(l => l.date !== log.date);
      return { ...prev, logs: [...filtered, log] };
    });
  };

  const deleteLog = (id: string) => {
    setData(prev => ({
      ...prev,
      logs: prev.logs.filter(l => l.id !== id)
    }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const importData = (newData: AppState) => {
    setData(newData);
  };

  const resetData = () => {
    if(confirm("Are you sure? This will delete all history.")){
      setData({
        logs: [],
        settings: { theme: 'system', dailyMessageEnabled: true, weeklyGoal: 4 }
      });
    }
  };

  return { data, addLog, deleteLog, updateSettings, importData, resetData };
};

type View = 'dashboard' | 'log' | 'history' | 'insights' | 'settings';

export default function App() {
  const { data, addLog, deleteLog, updateSettings, importData, resetData } = useGymData();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [returnView, setReturnView] = useState<View>('dashboard');
  const [editLogData, setEditLogData] = useState<GymLog | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const stats = useMemo(() => calculateStats(data.logs), [data.logs]);
  const weeklyProgress = useMemo(() => getWeeklyProgress(data.logs), [data.logs]);

  // Routing Handler
  const navigateTo = (view: View) => {
    setEditLogData(null);
    setCurrentView(view);
    window.scrollTo(0,0);
  };

  // Called when editing from History
  const handleHistoryEdit = (log: GymLog) => {
    setEditLogData(log);
    setReturnView('history');
    setCurrentView('log');
  };

  // If user wants to log today but it's already logged, pre-fill
  const handleLogTodayRequest = () => {
    const today = getTodayString();
    const existing = data.logs.find(l => l.date === today);
    if (existing) {
      setEditLogData(existing);
    } else {
      setEditLogData(null);
    }
    setReturnView('dashboard');
    setCurrentView('log');
  };

  const handleQuickRest = () => {
    const today = getTodayString();
    if (data.logs.find(l => l.date === today)) {
        // If already logged, just navigate to edit it
        handleLogTodayRequest();
        return;
    }
    
    const log: GymLog = {
        id: Date.now().toString(),
        date: today,
        workoutType: 'Rest',
        durationMinutes: 0,
        intensity: 0,
        bodyAreas: [],
        notes: "Rest Day",
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    addLog(log);
    setShowCelebration(true);
  };

  const handleSaveLog = (log: GymLog) => {
    const isEdit = !!editLogData;
    addLog(log);
    
    if (isEdit) {
      // Don't show celebration on edit, return to previous view
      setShowCelebration(false);
      navigateTo(returnView);
    } else {
      setShowCelebration(true);
      navigateTo('dashboard');
    }
  };

  const handleImportWrapper = (newData: AppState) => {
      importData(newData);
      alert("Data imported successfully!");
      navigateTo('history');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-20 bg-gray-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-all">
      
      {showCelebration && (
        <Celebration 
          onClose={() => setShowCelebration(false)} 
          streak={stats.currentStreak}
        />
      )}

      {/* Desktop Sidebar / Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 w-full md:w-20 md:h-full md:top-0 bg-white dark:bg-zinc-900 border-t md:border-t-0 md:border-r border-gray-200 dark:border-zinc-800 z-50 flex md:flex-col justify-around md:justify-center items-center p-2 md:space-y-8 safe-area-pb">
        <NavBtn 
          icon={<LayoutDashboard size={24} />} 
          label="Home" 
          active={currentView === 'dashboard'} 
          onClick={() => navigateTo('dashboard')} 
        />
        <NavBtn 
          icon={<History size={24} />} 
          label="History" 
          active={currentView === 'history'} 
          onClick={() => navigateTo('history')} 
        />
        <div className="md:hidden -mt-8">
            <button 
                onClick={handleLogTodayRequest}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-4 shadow-lg shadow-violet-500/30 transform transition active:scale-95"
            >
                <PlusCircle size={28} strokeWidth={2.5} />
            </button>
        </div>
        <div className="hidden md:block">
            <NavBtn 
            icon={<PlusCircle size={24} />} 
            label="Log" 
            active={currentView === 'log'} 
            onClick={handleLogTodayRequest} 
            />
        </div>
        <NavBtn 
          icon={<BarChart2 size={24} />} 
          label="Insights" 
          active={currentView === 'insights'} 
          onClick={() => navigateTo('insights')} 
        />
        <NavBtn 
          icon={<SettingsIcon size={24} />} 
          label="Settings" 
          active={currentView === 'settings'} 
          onClick={() => navigateTo('settings')} 
        />
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 lg:p-10">
        {currentView === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            weeklyProgress={weeklyProgress}
            weeklyGoal={data.settings.weeklyGoal}
            onLogClick={handleLogTodayRequest}
            onQuickRest={handleQuickRest}
            onNavigate={navigateTo}
          />
        )}
        {currentView === 'log' && (
          <Logger 
            onSave={handleSaveLog}
            onCancel={() => navigateTo(returnView)}
            initialData={editLogData}
          />
        )}
        {currentView === 'history' && (
          <HistoryView 
            logs={data.logs} 
            onEdit={handleHistoryEdit}
            onDelete={deleteLog}
          />
        )}
        {currentView === 'insights' && (
          <Insights stats={stats} logs={data.logs} />
        )}
        {currentView === 'settings' && (
          <SettingsView 
            settings={data.settings} 
            onUpdate={updateSettings}
            appData={data}
            onImport={handleImportWrapper}
            onReset={resetData}
          />
        )}
      </main>
    </div>
  );
}

const NavBtn = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 w-16 h-14 md:w-full md:h-16 rounded-xl transition-colors ${
      active 
        ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' 
        : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);