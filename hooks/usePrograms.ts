// hooks/usePrograms.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { programsService, modulesService, activitiesService } from '@/lib/firebase/services/programsService';
import { Program, Module, Activity } from '@/types';

export const usePrograms = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar programas do profissional
  const loadPrograms = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const professionalPrograms = await programsService.getProfessionalPrograms(user.id);
      setPrograms(professionalPrograms);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Criar novo programa
  const createProgram = async (programData: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const programId = await programsService.createProgram({
        ...programData,
        createdBy: user.id
      });
      
      // Recarregar a lista de programas
      await loadPrograms();
      return programId;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // Atualizar programa
  const updateProgram = async (programId: string, updates: Partial<Program>) => {
    try {
      await programsService.updateProgram(programId, updates);
      
      // Atualizar localmente
      setPrograms(prev => prev.map(program =>
        program.id === programId ? { ...program, ...updates, updatedAt: new Date() } : program
      ));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // Carregar programa específico
  const loadProgram = async (programId: string): Promise<Program | null> => {
    try {
      return await programsService.getProgramById(programId);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // Criar módulo
  const createModule = async (moduleData: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const moduleId = await modulesService.createModule(moduleData);
      return moduleId;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // Criar atividade
  const createActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const activityId = await activitiesService.createActivity(activityData);
      return activityId;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // Carregar programas na inicialização
  useEffect(() => {
    if (user) {
      loadPrograms();
    }
  }, [user]);

  return {
    programs,
    loading,
    error,
    createProgram,
    updateProgram,
    loadProgram,
    createModule,
    createActivity,
    refreshPrograms: loadPrograms
  };
};