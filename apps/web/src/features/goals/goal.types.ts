export interface GoalHabit {
  id: string;
  name: string;
  type: 'BUILD' | 'QUIT';
}

export interface Goal {
  currentStreak: number;
  habit: GoalHabit;
  id: string;
  targetDays: number;
}

export interface Achievement {
  achievedAt: string;
  habit: GoalHabit;
  id: string;
  targetDays: number;
}

export interface GoalsOverview {
  achievements: Achievement[];
  active: Goal[];
}
