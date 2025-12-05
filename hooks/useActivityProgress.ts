// hooks/useActivityProgress.ts - NOVO ARQUIVO
import { useState, useEffect } from 'react';
import { activitiesService } from '@/lib/firebase/services/activitiesService';
import { StudentActivity, Activity } from '@/types/activity.types';
import { useAuth } from '@/context/AuthContext';

export const useActivityProgress = (activityId: string) => {
  const { user, student } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [studentActivity, setStudentActivity] = useState<StudentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId || !student?.id) return;

    const loadActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar dados da atividade
        const activityData = await activitiesService.getActivityById(activityId);
        if (!activityData) {
          throw new Error('Atividade não encontrada');
        }
        setActivity(activityData);

        // Carregar progresso do aluno
        const progressData = await activitiesService.getStudentActivityProgress(
          student.id,
          activityId
        );
        setStudentActivity(progressData);

      } catch (err: any) {
        console.error('Erro ao carregar atividade:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadActivityData();
  }, [activityId, student?.id]);

  const startActivity = async (programId: string, moduleId: string) => {
    if (!student?.id) throw new Error('Usuário não autenticado');
    
    try {
      await activitiesService.startActivity(student.id, activityId, programId, moduleId);
      
      // Atualizar estado local
      setStudentActivity(prev => prev ? {
        ...prev,
        status: 'in_progress',
        startedAt: new Date()
      } : null);
    } catch (err: any) {
      console.error('Erro ao iniciar atividade:', err);
      throw err;
    }
  };

  const completeActivity = async (answers?: any, notes?: string) => {
    if (!student?.id) throw new Error('Usuário não autenticado');
    
    try {
      const result = await activitiesService.completeActivity(
        student.id,
        activityId,
        answers,
        notes
      );

      // Atualizar estado local
      setStudentActivity(prev => prev ? {
        ...prev,
        status: 'completed',
        completedAt: new Date(),
        answers,
        notes
      } : null);

      return result;
    } catch (err: any) {
      console.error('Erro ao completar atividade:', err);
      throw err;
    }
  };

  const saveDraft = async (answers: any, timeSpent: number = 0) => {
    if (!student?.id) throw new Error('Usuário não autenticado');
    
    try {
      await activitiesService.saveActivityDraft(
        student.id,
        activityId,
        answers,
        timeSpent
      );

      // Atualizar estado local
      setStudentActivity(prev => prev ? {
        ...prev,
        answers,
        timeSpent: (prev.timeSpent || 0) + timeSpent
      } : null);
    } catch (err: any) {
      console.error('Erro ao salvar rascunho:', err);
      throw err;
    }
  };

  return {
    activity,
    studentActivity,
    loading,
    error,
    startActivity,
    completeActivity,
    saveDraft,
    isCompleted: studentActivity?.status === 'completed',
    isInProgress: studentActivity?.status === 'in_progress',
    isLocked: !studentActivity || studentActivity.status === 'locked'
  };
};