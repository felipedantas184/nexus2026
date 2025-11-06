import { Professional, Student } from "./user.types";

// types/auth.types.ts
export type UserRole = 'student' | 'psychologist' | 'psychiatrist' | 'monitor' | 'coordinator';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AuthContextType {
  user: BaseUser | null;
  student: Student | null;
  loading: boolean;
  professionalLogin: (email: string, password: string) => Promise<void>;
  studentLogin: (email: string, password: string) => Promise<void>; // 🔥 MUDANÇA AQUI
  logout: () => Promise<void>;
  isProfessional: boolean;
  isStudent: boolean;
}

// Adicionar type guards para verificação segura de tipos
export const isProfessional = (user: BaseUser | null): user is Professional => {
  return !!user && user.role !== 'student';
};

export const isStudent = (user: BaseUser | null): user is Student => {
  return !!user && user.role === 'student';
};