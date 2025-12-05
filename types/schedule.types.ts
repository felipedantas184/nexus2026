// types/schedule.types.ts - NOVO ARQUIVO
import { ActivityType } from './activity.types';

export interface WeeklySchedule {
  id: string;
  title: string;
  description: string;
  createdBy: string; // professionalId
  weekDays: WeekDaySchedule[];
  assignedStudents: string[]; // studentIds
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeekDaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  activities: ScheduleActivity[];
  notes?: string;
}

export interface ScheduleActivity {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  instructions?: string;
  estimatedTime: number;
  points: number;
  isRequired: boolean;
  order: number;
  
  // Dados específicos por tipo
  content?: string; // para texto
  videoUrl?: string; // para vídeo
  thumbnailUrl?: string;
  items?: ChecklistItem[]; // para checklist
  passingScore?: number; // para quiz
  questions?: QuizQuestion[]; // para quiz
  fileUrl?: string; // para arquivo
  fileName?: string;
  fileType?: string;
  frequency?: 'daily' | 'weekly' | 'monthly'; // para hábito
  schedule?: HabitSchedule; // para hábito
}

// Reutilizando interfaces existentes
export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface HabitSchedule {
  specificTimes?: string[];
  daysOfWeek?: number[];
  reminder: boolean;
  reminderTime?: string;
}

// Para o aluno visualizar o cronograma
export interface StudentSchedule {
  schedule: WeeklySchedule;
  progress: {
    [day: string]: {
      completed: number;
      total: number;
      progress: number;
    };
  };
}