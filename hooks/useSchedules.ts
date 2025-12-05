// hooks/useSchedules.ts - NOVO ARQUIVO
'use client';

import { useState, useEffect, useContext } from 'react';
import { useAuth } from '@/context/AuthContext';
import { schedulesService } from '@/lib/firebase/services/schedulesService';
import { WeeklySchedule } from '@/types/schedule.types';

export function useSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar cronogramas do profissional
  const loadSchedules = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const professionalSchedules = await schedulesService.getProfessionalSchedules(user.id);
      setSchedules(professionalSchedules);
    } catch (err: any) {
      console.error('Erro ao carregar cronogramas:', err);
      setError(err.message || 'Erro ao carregar cronogramas');
    } finally {
      setLoading(false);
    }
  };

  // Criar novo cronograma
  const createSchedule = async (scheduleData: Omit<WeeklySchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      const scheduleWithAuthor = {
        ...scheduleData,
        createdBy: user.id
      };
      
      const scheduleId = await schedulesService.createSchedule(scheduleWithAuthor);
      await loadSchedules(); // Recarregar lista
      return scheduleId;
    } catch (err: any) {
      console.error('Erro ao criar cronograma:', err);
      throw new Error(err.message || 'Erro ao criar cronograma');
    }
  };

  // Atualizar cronograma
  const updateSchedule = async (scheduleId: string, updates: Partial<WeeklySchedule>) => {
    try {
      await schedulesService.updateSchedule(scheduleId, updates);
      await loadSchedules(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao atualizar cronograma:', err);
      throw new Error(err.message || 'Erro ao atualizar cronograma');
    }
  };

  // Deletar cronograma
  const deleteSchedule = async (scheduleId: string) => {
    try {
      await schedulesService.deleteSchedule(scheduleId);
      await loadSchedules(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao deletar cronograma:', err);
      throw new Error(err.message || 'Erro ao deletar cronograma');
    }
  };

  // Atribuir cronograma a alunos
  const assignScheduleToStudents = async (scheduleId: string, studentIds: string[]) => {
    try {
      await schedulesService.assignScheduleToStudents(scheduleId, studentIds);
      await loadSchedules(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao atribuir cronograma:', err);
      throw new Error(err.message || 'Erro ao atribuir cronograma');
    }
  };

  // Carregar cronogramas na inicialização
  useEffect(() => {
    if (user?.id) {
      loadSchedules();
    }
  }, [user?.id]);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    assignScheduleToStudents,
    refreshSchedules: loadSchedules
  };
}