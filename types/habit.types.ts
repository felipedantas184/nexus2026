import { HabitActivity } from "./activity.types";

// types/habit.types.ts
export interface HabitCompletion {
  id: string;
  habitId: string;
  studentId: string;
  completedAt: Date;
  mood?: 'very_good' | 'good' | 'neutral' | 'bad' | 'very_bad';
  notes?: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0-100
  totalCompletions: number;
  monthlyCompletions: { [date: string]: boolean }; // "2024-01-15": true
}

export interface DailyHabits {
  date: string; // "2024-01-15"
  habits: {
    habitId: string;
    habit: HabitActivity;
    isCompleted: boolean;
    completedAt?: Date;
  }[];
}