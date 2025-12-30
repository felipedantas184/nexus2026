// lib/firebase/services/schedulesService.ts - NOVO ARQUIVO
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { firestore } from '../config';
import { WeeklySchedule, WeekDaySchedule, ScheduleActivity } from '@/types/schedule.types';

const SCHEDULES_COLLECTION = 'schedules';

export const schedulesService = {
  // ===== CRUD DE CRONOGRAMAS =====
  
  /** Buscar todos os cronogramas de um profissional */
  async getProfessionalSchedules(professionalId: string): Promise<WeeklySchedule[]> {
    try {
      const schedulesQuery = query(
        collection(firestore, SCHEDULES_COLLECTION),
        where('createdBy', '==', professionalId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(schedulesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as WeeklySchedule[];
    } catch (error) {
      console.error('Erro ao buscar cronogramas:', error);
      throw new Error('Não foi possível carregar os cronogramas');
    }
  },

  /** Buscar cronograma por ID */
  async getScheduleById(scheduleId: string): Promise<WeeklySchedule | null> {
    try {
      const scheduleDoc = await getDoc(doc(firestore, SCHEDULES_COLLECTION, scheduleId));
      
      if (!scheduleDoc.exists()) {
        return null;
      }

      return {
        id: scheduleDoc.id,
        ...scheduleDoc.data(),
        createdAt: scheduleDoc.data().createdAt?.toDate(),
        updatedAt: scheduleDoc.data().updatedAt?.toDate()
      } as WeeklySchedule;
    } catch (error) {
      console.error('Erro ao buscar cronograma:', error);
      throw new Error('Não foi possível carregar o cronograma');
    }
  },

  /** Criar novo cronograma */
  async createSchedule(scheduleData: Omit<WeeklySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const scheduleWithTimestamps = {
        ...scheduleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, SCHEDULES_COLLECTION), scheduleWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar cronograma:', error);
      throw new Error('Não foi possível criar o cronograma');
    }
  },

  /** Atualizar cronograma */
  async updateSchedule(scheduleId: string, updates: Partial<WeeklySchedule>): Promise<void> {
    try {
      const scheduleRef = doc(firestore, SCHEDULES_COLLECTION, scheduleId);
      await updateDoc(scheduleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar cronograma:', error);
      throw new Error('Não foi possível atualizar o cronograma');
    }
  },

  /** Deletar cronograma */
  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, SCHEDULES_COLLECTION, scheduleId));
    } catch (error) {
      console.error('Erro ao deletar cronograma:', error);
      throw new Error('Não foi possível deletar o cronograma');
    }
  },

  /** Buscar estatísticas de progresso de um aluno em um cronograma */
  async getScheduleProgressStats(
    scheduleId: string,
    studentId: string
  ): Promise<{
    totalActivities: number;
    completedActivities: number;
    completionPercentage: number;
    totalPoints: number;
    earnedPoints: number;
    timeSpent: number;
    byDay: Record<string, {
      completed: number;
      total: number;
      percentage: number;
    }>;
  }> {
    try {
      // Buscar cronograma
      const schedule = await this.getScheduleById(scheduleId);
      if (!schedule) {
        throw new Error('Cronograma não encontrado');
      }

      // Buscar progresso do aluno
      const progressService = await import('./progressService').then(m => m.progressService);
      const progress = await progressService.getStudentScheduleProgress(studentId, scheduleId);

      // Calcular estatísticas
      let totalActivities = 0;
      let completedActivities = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      let timeSpent = 0;
      const byDay: Record<string, { completed: number; total: number; percentage: number }> = {};

      schedule.weekDays.forEach(day => {
        const dayActivities = day.activities || [];
        const dayTotal = dayActivities.length;
        let dayCompleted = 0;
        let dayPoints = 0;
        let dayEarned = 0;

        dayActivities.forEach(activity => {
          totalActivities++;
          totalPoints += activity.points || 0;

          if (progress[activity.id]?.completed) {
            completedActivities++;
            dayCompleted++;
            earnedPoints += activity.points || 0;
            dayEarned += activity.points || 0;
          }

          if (progress[activity.id]?.timeSpent) {
            timeSpent += progress[activity.id].timeSpent;
          }
        });

        const dayPercentage = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
        byDay[day.day] = {
          completed: dayCompleted,
          total: dayTotal,
          percentage: dayPercentage
        };
      });

      const completionPercentage = totalActivities > 0 
        ? Math.round((completedActivities / totalActivities) * 100) 
        : 0;

      return {
        totalActivities,
        completedActivities,
        completionPercentage,
        totalPoints,
        earnedPoints,
        timeSpent,
        byDay
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de progresso:', error);
      throw new Error('Não foi possível carregar as estatísticas');
    }
  },

  /** Buscar histórico de conclusões de um aluno */
  async getStudentCompletionHistory(
    studentId: string,
    days: number = 7
  ): Promise<Array<{
    date: string;
    completed: number;
    scheduleId: string;
    scheduleTitle: string;
  }>> {
    try {
      const progressService = await import('./progressService').then(m => m.progressService);
      const progress = await progressService.getStudentOverallProgress(studentId);

      // Agrupar por data
      const history: Record<string, {
        date: string;
        completed: number;
        scheduleId: string;
        scheduleTitle: string;
      }> = {};

      // Buscar títulos dos cronogramas
      const schedulePromises = Array.from(
        new Set(progress.map(p => p.scheduleId))
      ).map(async scheduleId => {
        const schedule = await this.getScheduleById(scheduleId);
        return { scheduleId, title: schedule?.title || 'Cronograma Desconhecido' };
      });

      const scheduleTitles = await Promise.all(schedulePromises);
      const titleMap = Object.fromEntries(
        scheduleTitles.map(s => [s.scheduleId, s.title])
      );

      progress.forEach(p => {
        if (p.completed && p.completedAt) {
          const date = p.completedAt.toISOString().split('T')[0];
          
          if (!history[date]) {
            history[date] = {
              date,
              completed: 0,
              scheduleId: p.scheduleId,
              scheduleTitle: titleMap[p.scheduleId]
            };
          }
          history[date].completed++;
        }
      });

      // Ordenar por data e limitar
      return Object.values(history)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, days);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw new Error('Não foi possível carregar o histórico');
    }
  },

  // ===== GESTÃO DE ATIVIDADES DOS DIAS =====

  /** Adicionar atividade a um dia específico */
  async addActivityToDay(
    scheduleId: string, 
    day: WeekDaySchedule['day'], 
    activity: Omit<ScheduleActivity, 'id'>
  ): Promise<void> {
    try {
      const scheduleRef = doc(firestore, SCHEDULES_COLLECTION, scheduleId);
      const scheduleDoc = await getDoc(scheduleRef);

      if (!scheduleDoc.exists()) {
        throw new Error('Cronograma não encontrado');
      }

      const schedule = scheduleDoc.data() as WeeklySchedule;
      const weekDays = schedule.weekDays || [];
      
      // Encontrar ou criar o dia
      let dayIndex = weekDays.findIndex(d => d.day === day);
      if (dayIndex === -1) {
        weekDays.push({ day, activities: [] });
        dayIndex = weekDays.length - 1;
      }

      // Adicionar atividade com ID único
      const activityWithId: ScheduleActivity = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      weekDays[dayIndex].activities.push(activityWithId);

      await updateDoc(scheduleRef, {
        weekDays,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      throw new Error('Não foi possível adicionar a atividade');
    }
  },

  /** Remover atividade de um dia */
  async removeActivityFromDay(
    scheduleId: string, 
    day: WeekDaySchedule['day'], 
    activityId: string
  ): Promise<void> {
    try {
      const scheduleRef = doc(firestore, SCHEDULES_COLLECTION, scheduleId);
      const scheduleDoc = await getDoc(scheduleRef);

      if (!scheduleDoc.exists()) {
        throw new Error('Cronograma não encontrado');
      }

      const schedule = scheduleDoc.data() as WeeklySchedule;
      const weekDays = schedule.weekDays || [];
      
      const dayIndex = weekDays.findIndex(d => d.day === day);
      if (dayIndex === -1) return;

      // Filtrar a atividade removida
      weekDays[dayIndex].activities = weekDays[dayIndex].activities.filter(
        activity => activity.id !== activityId
      );

      await updateDoc(scheduleRef, {
        weekDays,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao remover atividade:', error);
      throw new Error('Não foi possível remover a atividade');
    }
  },

  /** Atualizar atividade em um dia */
  async updateActivityInDay(
    scheduleId: string,
    day: WeekDaySchedule['day'],
    activityId: string,
    updates: Partial<ScheduleActivity>
  ): Promise<void> {
    try {
      const scheduleRef = doc(firestore, SCHEDULES_COLLECTION, scheduleId);
      const scheduleDoc = await getDoc(scheduleRef);

      if (!scheduleDoc.exists()) {
        throw new Error('Cronograma não encontrado');
      }

      const schedule = scheduleDoc.data() as WeeklySchedule;
      const weekDays = schedule.weekDays || [];
      
      const dayIndex = weekDays.findIndex(d => d.day === day);
      if (dayIndex === -1) return;

      // Atualizar atividade específica
      weekDays[dayIndex].activities = weekDays[dayIndex].activities.map(activity =>
        activity.id === activityId ? { ...activity, ...updates } : activity
      );

      await updateDoc(scheduleRef, {
        weekDays,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      throw new Error('Não foi possível atualizar a atividade');
    }
  },

  // ===== ATRIBUIÇÃO A ALUNOS =====

  /** Atribuir cronograma a alunos */
  async assignScheduleToStudents(
    scheduleId: string,
    studentIds: string[]
  ): Promise<void> {
    try {
      const scheduleRef = doc(firestore, SCHEDULES_COLLECTION, scheduleId);
      
      await updateDoc(scheduleRef, {
        assignedStudents: arrayUnion(...studentIds),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atribuir cronograma:', error);
      throw new Error('Não foi possível atribuir o cronograma');
    }
  },

  /** Remover atribuição de cronograma */
  async removeScheduleAssignment(
    scheduleId: string,
    studentId: string
  ): Promise<void> {
    try {
      const scheduleRef = doc(firestore, SCHEDULES_COLLECTION, scheduleId);
      
      await updateDoc(scheduleRef, {
        assignedStudents: arrayRemove(studentId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      throw new Error('Não foi possível remover a atribuição');
    }
  },

  // ===== PARA O ALUNO =====

  /** Buscar cronogramas atribuídos a um aluno */
  async getStudentSchedules(studentId: string): Promise<WeeklySchedule[]> {
    try {
      const schedulesQuery = query(
        collection(firestore, SCHEDULES_COLLECTION),
        where('assignedStudents', 'array-contains', studentId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(schedulesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as WeeklySchedule[];
    } catch (error) {
      console.error('Erro ao buscar cronogramas do aluno:', error);
      throw new Error('Não foi possível carregar os cronogramas');
    }
  }
};