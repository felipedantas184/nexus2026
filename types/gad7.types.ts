// types/gad7.types.ts
export interface GAD7Assessment {
  id: string; // auto-generated
  studentId: string;
  
  // Respostas (0-3 para cada pergunta)
  answers: {
    q1: number; // Feeling nervous, anxious or on edge
    q2: number; // Not being able to stop or control worrying
    q3: number; // Worrying too much about different things
    q4: number; // Trouble relaxing
    q5: number; // Being so restless that it is hard to sit still
    q6: number; // Becoming easily annoyed or irritable
    q7: number; // Feeling afraid as if something awful might happen
  };
  
  // Pontuação calculada
  score: number; // Soma de todas as respostas (0-21)
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  
  // Metadados
  completedAt: Date;
  nextAssessmentDate: Date; // Data para próxima avaliação (+7 dias)
  
  // Status
  isFirstAssessment: boolean; // Primeiro preenchimento?
  status: 'completed' | 'pending' | 'overdue';
  
  // Informações adicionais (opcional)
  notes?: string;
  context?: {
    device: string;
    browser: string;
    location?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface GAD7StudentConfig {
  studentId: string;
  requiresInitialAssessment: boolean; // Se precisa fazer primeiro
  lastAssessmentDate: Date | null;
  nextAssessmentDate: Date | null;
  assessmentFrequency: number; // dias (padrão: 7)
  totalAssessments: number;
  averageScore: number;
  trend: 'improving' | 'stable' | 'worsening';
  notificationEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}