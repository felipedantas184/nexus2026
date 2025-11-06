// types/assignment.types.ts
export type AssignmentStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface Assignment {
  id: string;
  programId: string;
  studentId: string;
  assignedBy: string; // Professional ID
  assignedAt: Date;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: AssignmentStatus;
  progress: number; // 0-100
  completedActivities: string[]; // Activity IDs
  customMessage?: string;
  sendNotification: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentProgress {
  assignmentId: string;
  studentId: string;
  programId: string;
  completedActivities: string[];
  currentModuleId?: string;
  timeSpent: number; // em minutos
  lastActivityAt?: Date;
  streak: number;
  totalPoints: number;
}