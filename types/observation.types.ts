// types/observation.types.ts
export type ObservationType = 'monitor' | 'psychologist' | 'psychiatrist' | 'general';

export interface ObservationFormData {
  energyLevel?: 'very_high' | 'high' | 'regular' | 'low' | 'very_low';
  attentionLevel?: 'excellent' | 'good' | 'regular' | 'low' | 'very_low';
  participation?: 'very_active' | 'active' | 'moderate' | 'little_active' | 'inactive';
  mood?: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad' | 'anxious' | 'irritable';
  behavior?: 'exemplary' | 'good' | 'regular' | 'problematic' | 'very_problematic';
  academicPerformance?: 'excellent' | 'good' | 'regular' | 'below_expectations' | 'concerning';
  customFields?: { [key: string]: any };
}

export interface Observation {
  id: string;
  studentId: string;
  authorId: string; // Professional ID
  authorName: string;
  authorType: ObservationType;
  text: string;
  formData?: ObservationFormData;
  timeStamp: string; // "DD/MM/YYYY"
  createdAt: Date;
  isPrivate: boolean;
  tags: string[];
}