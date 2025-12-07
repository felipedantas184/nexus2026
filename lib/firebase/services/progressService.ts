// lib/firebase/services/progressService.ts - NOVO ARQUIVO
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
  runTransaction
} from 'firebase/firestore';
import { firestore } from '../config';

const PROGRESS_COLLECTION = 'scheduleProgress';

export interface ActivityProgress {
  id: string;
  studentId: string;
  scheduleId: string;
  activityId: string;
  day: string; // 'monday', 'tuesday', etc.
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // em minutos
  answers?: any; // respostas específicas da atividade
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const progressService = {
  // ===== CRUD DE PROGRESSO =====

  /**
   * Registrar conclusão de atividade
   */
  async completeActivity(
    studentId: string,
    scheduleId: string,
    activityId: string,
    day: string,
    data: {
      timeSpent?: number;
      answers?: any;
      notes?: string;
    } = {}
  ): Promise<void> {
    try {
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('studentId', '==', studentId),
        where('scheduleId', '==', scheduleId),
        where('activityId', '==', activityId)
      );

      const snapshot = await getDocs(progressQuery);
      
      await runTransaction(firestore, async (transaction) => {
        // Preparar dados para evitar valores undefined
        const updateData: any = {
          completed: true,
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Adicionar apenas valores definidos
        if (data.timeSpent !== undefined) {
          updateData.timeSpent = data.timeSpent;
        }

        // CORREÇÃO CRÍTICA: Verificar se answers existe e não é undefined
        if (data.answers !== undefined && data.answers !== null) {
          updateData.answers = data.answers;
        }

        // CORREÇÃO: Verificar se notes existe e não é undefined
        if (data.notes !== undefined && data.notes !== null) {
          updateData.notes = data.notes;
        }

        if (!snapshot.empty) {
          // Atualizar progresso existente
          const progressDoc = snapshot.docs[0];
          transaction.update(progressDoc.ref, updateData);
        } else {
          // Criar novo registro de progresso
          const progressRef = collection(firestore, PROGRESS_COLLECTION);
          
          const newData = {
            studentId,
            scheduleId,
            activityId,
            day,
            completed: true,
            completedAt: serverTimestamp(),
            timeSpent: data.timeSpent || 0,
            // Garantir que answers e notes sejam definidos corretamente
            answers: data.answers !== undefined ? data.answers : null,
            notes: data.notes !== undefined ? data.notes : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          transaction.set(doc(progressRef), newData);
        }
      });
    } catch (error) {
      console.error('Erro ao registrar conclusão:', error);
      console.error('Detalhes do erro:', {
        studentId,
        scheduleId,
        activityId,
        day,
        data
      });
      throw new Error('Não foi possível registrar a conclusão');
    }
  },

  /**
   * Marcar atividade como não concluída
   */
  async uncompleteActivity(
    studentId: string,
    scheduleId: string,
    activityId: string
  ): Promise<void> {
    try {
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('studentId', '==', studentId),
        where('scheduleId', '==', scheduleId),
        where('activityId', '==', activityId)
      );

      const snapshot = await getDocs(progressQuery);
      
      if (!snapshot.empty) {
        const progressDoc = snapshot.docs[0];
        await updateDoc(progressDoc.ref, {
          completed: false,
          completedAt: null,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erro ao desmarcar conclusão:', error);
      throw new Error('Não foi possível desmarcar a conclusão');
    }
  },

  /**
   * Buscar progresso de um aluno em um cronograma específico
   */
  async getStudentScheduleProgress(
    studentId: string,
    scheduleId: string
  ): Promise<Record<string, ActivityProgress>> {
    try {
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('studentId', '==', studentId),
        where('scheduleId', '==', scheduleId)
      );

      const snapshot = await getDocs(progressQuery);
      const progress: Record<string, ActivityProgress> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        progress[data.activityId] = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          completedAt: data.completedAt?.toDate()
        } as ActivityProgress;
      });

      return progress;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      throw new Error('Não foi possível carregar o progresso');
    }
  },

  /**
   * Buscar progresso geral de um aluno
   */
  async getStudentOverallProgress(studentId: string): Promise<ActivityProgress[]> {
    try {
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('completedAt', 'desc')
      );

      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      })) as ActivityProgress[];
    } catch (error) {
      console.error('Erro ao buscar progresso geral:', error);
      throw new Error('Não foi possível carregar o progresso');
    }
  },

  /**
   * Buscar estatísticas de progresso
   */
  async getProgressStats(
    studentId: string,
    scheduleId: string
  ): Promise<{
    totalActivities: number;
    completedActivities: number;
    completionPercentage: number;
    totalPoints: number;
    earnedPoints: number;
    timeSpent: number;
  }> {
    try {
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('studentId', '==', studentId),
        where('scheduleId', '==', scheduleId)
      );

      const snapshot = await getDocs(progressQuery);
      const completedActivities = snapshot.docs.filter(doc => doc.data().completed).length;
      
      // Aqui precisaríamos buscar as atividades do cronograma para calcular totais
      // Por enquanto, retornamos valores básicos
      return {
        totalActivities: 0, // Será preenchido pela aplicação
        completedActivities,
        completionPercentage: 0,
        totalPoints: 0,
        earnedPoints: 0,
        timeSpent: snapshot.docs.reduce((total, doc) => total + (doc.data().timeSpent || 0), 0)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Não foi possível carregar as estatísticas');
    }
  },

  /**
   * Atualizar tempo gasto em uma atividade
   */
  async updateActivityTime(
    studentId: string,
    scheduleId: string,
    activityId: string,
    timeSpent: number
  ): Promise<void> {
    try {
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('studentId', '==', studentId),
        where('scheduleId', '==', scheduleId),
        where('activityId', '==', activityId)
      );

      const snapshot = await getDocs(progressQuery);
      
      if (!snapshot.empty) {
        const progressDoc = snapshot.docs[0];
        await updateDoc(progressDoc.ref, {
          timeSpent,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar tempo:', error);
      throw new Error('Não foi possível atualizar o tempo');
    }
  },

  /**
   * Adicionar notas à atividade
   */
  async addActivityNotes(
    studentId: string,
    scheduleId: string,
    activityId: string,
    notes: string
  ): Promise<void> {
    try {
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('studentId', '==', studentId),
        where('scheduleId', '==', scheduleId),
        where('activityId', '==', activityId)
      );

      const snapshot = await getDocs(progressQuery);
      
      if (!snapshot.empty) {
        const progressDoc = snapshot.docs[0];
        await updateDoc(progressDoc.ref, {
          notes,
          updatedAt: serverTimestamp()
        });
      } else {
        // Criar registro se não existir
        const progressRef = collection(firestore, PROGRESS_COLLECTION);
        await addDoc(progressRef, {
          studentId,
          scheduleId,
          activityId,
          day: '', // Será preenchido pela aplicação
          completed: false,
          timeSpent: 0,
          notes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar notas:', error);
      throw new Error('Não foi possível adicionar as notas');
    }
  }
};