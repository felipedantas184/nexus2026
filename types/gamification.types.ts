// types/gamification.types.ts - NOVO ARQUIVO
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'streak' | 'completion' | 'participation' | 'mastery';
  requirement: {
    type: 'streak_days' | 'completed_activities' | 'completed_programs' | 'points_earned';
    value: number;
  };
  unlockedAt?: Date;
}

export interface StudentGamification {
  studentId: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  unlockedAchievements: string[]; // Achievement IDs
  lastActivityDate?: Date;
}