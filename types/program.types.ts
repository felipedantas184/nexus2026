import { Module } from "./module.types";

// types/program.types.ts
export type ProgramStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type ProgramVisibility = 'private' | 'shared' | 'template';

export interface Program {
  id: string;
  title: string;
  description: string;
  createdBy: string; // Professional ID
  status: ProgramStatus;
  visibility: ProgramVisibility;
  modules: Module[];
  assignedStudents: ProgramAssignment[];
  tags: string[];
  estimatedDuration: number; // em minutos
  color: string; // cor do programa
  icon: string; // ícone representativo
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramAssignment {
  studentId: string;
  assignedBy: string; // Professional ID
  assignedAt: Date;
  startDate?: Date;
  endDate?: Date;
  progress: ProgramProgress;
}

export interface ProgramProgress {
  completedActivities: string[]; // Activity IDs
  completedModules: string[]; // Module IDs
  totalProgress: number; // 0-100
  timeSpent: number; // em minutos
  lastActivityAt?: Date;
}