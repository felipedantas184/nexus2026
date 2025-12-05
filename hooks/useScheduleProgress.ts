// hooks/useScheduleProgress.ts - NOVO ARQUIVO
'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { progressService, ActivityProgress } from '@/lib/firebase/services/progressService';
import { useAuth } from '@/context/AuthContext';

interface UseScheduleProgressProps {
  scheduleId?: string;
}

export function useScheduleProgress({ scheduleId }: UseScheduleProgressProps = {}) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, ActivityProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar progresso
  const loadProgress = useCallback(async () => {
    if (!user?.id || !scheduleId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const progressData = await progressService.getStudentScheduleProgress(
        user.id,
        scheduleId
      );
      
      setProgress(progressData);
    } catch (err: any) {
      console.error('Erro ao carregar progresso:', err);
      setError(err.message || 'Erro ao carregar progresso');
    } finally {
      setLoading(false);
    }
  }, [user?.id, scheduleId]);

  // Marcar atividade como concluída
  const completeActivity = async (
    activityId: string,
    day: string,
    data: {
      timeSpent?: number;
      answers?: any;
      notes?: string;
    } = {}
  ) => {
    if (!user?.id || !scheduleId) {
      throw new Error('Usuário não autenticado ou cronograma não especificado');
    }

    try {
      await progressService.completeActivity(
        user.id,
        scheduleId,
        activityId,
        day,
        data
      );

      // Atualizar estado local
      setProgress(prev => ({
        ...prev,
        [activityId]: {
          id: `${activityId}-${Date.now()}`,
          studentId: user.id,
          scheduleId,
          activityId,
          day,
          completed: true,
          completedAt: new Date(),
          timeSpent: data.timeSpent || 0,
          answers: data.answers,
          notes: data.notes,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }));

    } catch (err: any) {
      console.error('Erro ao completar atividade:', err);
      throw new Error(err.message || 'Erro ao completar atividade');
    }
  };

  // Marcar atividade como não concluída
  const uncompleteActivity = async (activityId: string) => {
    if (!user?.id || !scheduleId) {
      throw new Error('Usuário não autenticado ou cronograma não especificado');
    }

    try {
      await progressService.uncompleteActivity(
        user.id,
        scheduleId,
        activityId
      );

      // Atualizar estado local
      setProgress(prev => ({
        ...prev,
        [activityId]: {
          ...prev[activityId],
          completed: false,
          completedAt: undefined
        }
      }));

    } catch (err: any) {
      console.error('Erro ao desmarcar atividade:', err);
      throw new Error(err.message || 'Erro ao desmarcar atividade');
    }
  };

  // Alternar estado de conclusão
  const toggleActivityCompletion = async (
    activityId: string,
    day: string,
    isCompleted: boolean,
    data?: {
      timeSpent?: number;
      answers?: any;
      notes?: string;
    }
  ) => {
    if (isCompleted) {
      await completeActivity(activityId, day, data);
    } else {
      await uncompleteActivity(activityId);
    }
  };

  // Atualizar tempo gasto
  const updateActivityTime = async (activityId: string, timeSpent: number) => {
    if (!user?.id || !scheduleId) return;

    try {
      await progressService.updateActivityTime(
        user.id,
        scheduleId,
        activityId,
        timeSpent
      );

      // Atualizar estado local
      setProgress(prev => ({
        ...prev,
        [activityId]: {
          ...prev[activityId],
          timeSpent,
          updatedAt: new Date()
        }
      }));

    } catch (err: any) {
      console.error('Erro ao atualizar tempo:', err);
      throw new Error(err.message || 'Erro ao atualizar tempo');
    }
  };

  // Adicionar notas
  const addActivityNotes = async (activityId: string, notes: string) => {
    if (!user?.id || !scheduleId) return;

    try {
      await progressService.addActivityNotes(
        user.id,
        scheduleId,
        activityId,
        notes
      );

      // Atualizar estado local
      setProgress(prev => ({
        ...prev,
        [activityId]: {
          ...prev[activityId],
          notes,
          updatedAt: new Date()
        }
      }));

    } catch (err: any) {
      console.error('Erro ao adicionar notas:', err);
      throw new Error(err.message || 'Erro ao adicionar notas');
    }
  };

  // Verificar se uma atividade está concluída
  const isActivityCompleted = (activityId: string): boolean => {
    return !!progress[activityId]?.completed;
  };

  // Obter estatísticas de progresso
  const getProgressStats = (totalActivities: number) => {
    const completedActivities = Object.values(progress).filter(p => p.completed).length;
    const completionPercentage = totalActivities > 0 
      ? Math.round((completedActivities / totalActivities) * 100) 
      : 0;
    
    const timeSpent = Object.values(progress).reduce((total, p) => total + (p.timeSpent || 0), 0);

    return {
      completed: completedActivities,
      total: totalActivities,
      percentage: completionPercentage,
      timeSpent
    };
  };

  // Carregar progresso na inicialização
  useEffect(() => {
    if (user?.id && scheduleId) {
      loadProgress();
    }
  }, [user?.id, scheduleId, loadProgress]);

  return {
    progress,
    loading,
    error,
    completeActivity,
    uncompleteActivity,
    toggleActivityCompletion,
    updateActivityTime,
    addActivityNotes,
    isActivityCompleted,
    getProgressStats,
    refreshProgress: loadProgress
  };
}