export type WorkoutType = 
  | 'Strength' 
  | 'Hypertrophy' 
  | 'Cardio' 
  | 'HIIT' 
  | 'Mobility' 
  | 'Sport' 
  | 'Rest'
  | 'Other';

export type BodyArea = 
  | 'Upper' | 'Lower' | 'Full Body' | 'Core' 
  | 'Pull' | 'Push' | 'Legs' | 'Glutes' 
  | 'Back' | 'Chest' | 'Shoulders' | 'Arms';

export interface GymLog {
  id: string;
  date: string; // YYYY-MM-DD
  workoutType: WorkoutType;
  durationMinutes: number;
  intensity: number; // 1-10
  bodyAreas: BodyArea[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  dailyMessageEnabled: boolean;
  weeklyGoal: number;
}

export interface AppState {
  logs: GymLog[];
  settings: AppSettings;
}

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  isTodayLogged: boolean;
  lastLogDate: string | null;
  consistencyScore: number; // percentage of last 14 days
}