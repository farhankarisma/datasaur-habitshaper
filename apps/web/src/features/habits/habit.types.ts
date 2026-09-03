export type HabitType = 'BUILD' | 'QUIT';

export interface WeeklyProgress {
  completedDays: number;
  eligibleDays: number;
  missedDays: number;
  percent: number;
}

export interface Habit {
  completedToday: boolean;
  id: string;
  name: string;
  relapsedToday: boolean;
  streak: number;
  type: HabitType;
  weekly: WeeklyProgress | null;
}
