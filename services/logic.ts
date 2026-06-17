import { GymLog, StreakStats } from '../types';
import { MOTIVATIONAL_MESSAGES } from '../constants';

// Helper to get YYYY-MM-DD in local time
export const getTodayString = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Robust date parser to avoid UTC-offset bugs.
 * Standard "new Date(string)" often parses YYYY-MM-DD as UTC,
 * which causes errors in local timezones.
 */
const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Date constructor with numbers uses local time
  return new Date(y, m - 1, d);
};

// Internal helper for safe date iteration
const toDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper to get Day of Year (1-366) for rotating content
const getDayOfYear = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - (now.getTimezoneOffset() * 60000)) - (start.getTime() - (start.getTimezoneOffset() * 60000));
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const calculateStats = (logs: GymLog[]): StreakStats => {
  const today = getTodayString();
  const allLogsSorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  
  if (allLogsSorted.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalDays: 0,
      isTodayLogged: false,
      lastLogDate: null,
      consistencyScore: 0
    };
  }

  // Map for easy lookup
  const logMap = new Map<string, GymLog>();
  allLogsSorted.forEach(l => logMap.set(l.date, l));

  const uniqueDates = Array.from(logMap.keys()).sort();
  const lastDateStr = uniqueDates[uniqueDates.length - 1];
  const totalActiveSessions = logs.filter(l => l.workoutType !== 'Rest').length;

  // --- Best Streak Calculation ---
  let bestStreak = 0;
  let currentChainActiveCount = 0;
  
  if (uniqueDates.length > 0) {
    let prevDate = parseLocalDate(uniqueDates[0]);
    
    // Process first day
    if (logMap.get(uniqueDates[0])?.workoutType !== 'Rest') {
      currentChainActiveCount = 1;
    }
    bestStreak = currentChainActiveCount;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currDateStr = uniqueDates[i];
      const currDate = parseLocalDate(currDateStr);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Continuous chain
        if (logMap.get(currDateStr)?.workoutType !== 'Rest') {
          currentChainActiveCount++;
        }
        // If it's a Rest day, currentChainActiveCount stays the same (preserving the bridge)
      } else {
        // Gap found - reset counter to current day's value
        currentChainActiveCount = (logMap.get(currDateStr)?.workoutType !== 'Rest') ? 1 : 0;
      }
      
      if (currentChainActiveCount > bestStreak) {
        bestStreak = currentChainActiveCount;
      }
      prevDate = currDate;
    }
  }

  // --- Current Streak Calculation ---
  let currentStreak = 0;
  // Use either Today or the Future/Imported Last Log Date as the starting reference
  const startRef = lastDateStr > today ? lastDateStr : today;
  let checkDate = parseLocalDate(startRef);
  
  // If the reference start date is missing in the log, check if yesterday was part of a streak
  if (!logMap.has(startRef)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Iterate backwards to count the current streak
  for (let i = 0; i < 3650; i++) {
    const dStr = toDateStr(checkDate);
    const dayLog = logMap.get(dStr);
    
    if (dayLog) {
      if (dayLog.workoutType !== 'Rest') {
        currentStreak++;
      }
      // Continue checking the previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Missing day found, streak ends here
      break;
    }
  }

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const twoWeeksAgoStr = toDateStr(twoWeeksAgo);
  const activeRecent = logs.filter(l => l.workoutType !== 'Rest' && l.date >= twoWeeksAgoStr && l.date <= today).length;

  return {
    currentStreak,
    bestStreak,
    totalDays: totalActiveSessions,
    isTodayLogged: logMap.has(today),
    lastLogDate: lastDateStr,
    consistencyScore: Math.min(100, Math.round((activeRecent / 14) * 100))
  };
};

export const getWeeklyProgress = (logs: GymLog[]): number => {
  const activeLogs = logs.filter(l => l.workoutType !== 'Rest');
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0,0,0,0);
  const mondayStr = toDateStr(monday);
  const weekLogs = activeLogs.filter(l => l.date >= mondayStr);
  return new Set(weekLogs.map(l => l.date)).size;
};

export const getMotivationalMessage = (stats: StreakStats): string => {
  const { currentStreak } = stats;
  let pool = [...MOTIVATIONAL_MESSAGES.general];
  if (currentStreak > 5) {
    pool = [...pool, ...MOTIVATIONAL_MESSAGES.highStreak];
  }
  if (currentStreak === 0 && stats.totalDays > 5) {
    pool = [...pool, ...MOTIVATIONAL_MESSAGES.recovery];
  }
  const dayIndex = getDayOfYear() + stats.totalDays; 
  return pool[dayIndex % pool.length];
};