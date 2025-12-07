// hooks/useMultipleScheduleProgress.ts - NOVO HOOK
'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { progressService, ActivityProgress } from '@/lib/firebase/services/progressService';
import { useAuth } from '@/context/AuthContext';

export function useMultipleScheduleProgress() {
  const { user } = useAuth();
  const [allProgress, setAllProgress] = useState<Record<string, Record<string, ActivityProgress>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar progresso de todos os cronogramas
  const loadAllProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar TODAS as atividades completadas do aluno
      const overallProgress = await progressService.getStudentOverallProgress(user.id);

      // Organizar por scheduleId
      const organizedProgress: Record<string, Record<string, ActivityProgress>> = {};

      overallProgress.forEach(progressItem => {
        if (!organizedProgress[progressItem.scheduleId]) {
          organizedProgress[progressItem.scheduleId] = {};
        }
        organizedProgress[progressItem.scheduleId][progressItem.activityId] = progressItem;
      });

      setAllProgress(organizedProgress);

    } catch (err: any) {
      console.error('Erro ao carregar progresso geral:', err);
      setError(err.message || 'Erro ao carregar progresso');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Alternar conclusão de atividade específica
  const toggleActivityCompletion = async (
    scheduleId: string,
    activityId: string,
    day: string,
    isCompleted: boolean,
    data?: {
      timeSpent?: number;
    }
  ) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      if (isCompleted) {
        await progressService.completeActivity(
          user.id,
          scheduleId,
          activityId,
          day,
          { timeSpent: data?.timeSpent || 0 }
        );
      } else {
        await progressService.uncompleteActivity(
          user.id,
          scheduleId,
          activityId
        );
      }

      // Atualizar estado local
      setAllProgress(prev => {
        const newProgress = { ...prev };

        if (isCompleted) {
          if (!newProgress[scheduleId]) {
            newProgress[scheduleId] = {};
          }
          newProgress[scheduleId][activityId] = {
            id: `${activityId}-${Date.now()}`,
            studentId: user.id,
            scheduleId,
            activityId,
            day,
            completed: true,
            completedAt: new Date(),
            timeSpent: data?.timeSpent || 0,
            createdAt: new Date(),
            updatedAt: new Date()
          } as ActivityProgress;
        } else {
          if (newProgress[scheduleId]) {
            delete newProgress[scheduleId][activityId];
          }
        }

        return newProgress;
      });

    } catch (err: any) {
      console.error('Erro ao alternar atividade:', err);
      throw new Error(err.message || 'Erro ao alternar atividade');
    }
  };

  // Verificar se atividade está concluída
  const isActivityCompleted = (scheduleId: string, activityId: string): boolean => {
    return !!allProgress[scheduleId]?.[activityId]?.completed;
  };

  // Carregar progresso na inicialização
  useEffect(() => {
    if (user?.id) {
      loadAllProgress();
    }
  }, [user?.id, loadAllProgress]);

  return {
    allProgress,
    loading,
    error,
    toggleActivityCompletion,
    isActivityCompleted,
    refreshProgress: loadAllProgress
  };
}