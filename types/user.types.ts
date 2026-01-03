// types/user.types.ts
import { BaseUser } from "./auth.types";

export interface Student extends BaseUser {
  role: 'student';
  personalInfo: {
    cpf: string;
    birthday: string;
    parentName: string;
    phone?: string;
    school: string;
    grade: string;
    origin: 'particular' | 'fracta';
  };
  medicalInfo?: {
    diagnoses: string[];
    medications: string[];
    observations: string;
  };
  address?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  assignedProfessionals: string[];
  assignedPrograms: string[];
  streak: number;
  totalPoints: number;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Professional extends BaseUser {
  role: 'psychologist' | 'psychiatrist' | 'monitor' | 'coordinator';
  specialization?: string;
  licenseNumber?: string;
  assignedStudents: string[];
  canCreatePrograms: boolean;
  canManageStudents: boolean;
}