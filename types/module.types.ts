import { Activity } from "./activity.types";

// types/module.types.ts
export interface Module {
  id: string;
  programId: string;
  title: string;
  description: string;
  activities: Activity[];
  order: number;
  isLocked: boolean;
  unlockCondition?: 'previous_completion' | 'date' | 'manual';
  unlockDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentModuleProgress {
  moduleId: string;
  studentId: string;
  programId: string;
  completedActivities: string[];
  totalActivities: number;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
}