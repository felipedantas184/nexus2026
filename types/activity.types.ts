// types/activity.types.ts
export type ActivityType = 'text' | 'checklist' | 'video' | 'quiz' | 'file' | 'habit';
export type ActivityStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'reviewed';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  instructions?: string;
  order: number;
  estimatedTime: number; // em minutos
  points: number; // pontos por conclusão
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextActivity extends BaseActivity {
  type: 'text';
  content: string;
  richText?: boolean;
}

export interface ChecklistActivity extends BaseActivity {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  order: number;
}

export interface VideoActivity extends BaseActivity {
  type: 'video';
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface QuizActivity extends BaseActivity {
  type: 'quiz';
  questions: QuizQuestion[];
  passingScore: number; // 0-100
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface FileActivity extends BaseActivity {
  type: 'file';
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface HabitActivity extends BaseActivity {
  type: 'habit';
  frequency: 'daily' | 'weekly' | 'monthly';
  schedule: HabitSchedule;
  streak: number;
  maxStreak: number;
  completionHistory: Date[];
}

export interface HabitSchedule {
  specificTimes?: string[]; // ["08:00", "18:00"]
  daysOfWeek?: number[]; // 0-6 (domingo-sábado)
  reminder: boolean;
  reminderTime?: string;
}

export type Activity = TextActivity | ChecklistActivity | VideoActivity | QuizActivity | FileActivity | HabitActivity;

// Atividade com status do aluno
export interface StudentActivity {
  activity: Activity;
  status: ActivityStatus;
  studentId: string;
  programId: string;
  moduleId: string;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // em minutos
  answers?: any; // Respostas do quiz/submissões
  notes?: string; // Anotações do aluno
}