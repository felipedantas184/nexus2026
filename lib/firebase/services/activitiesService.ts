// lib/firebase/services/activitiesService.ts - NOVO ARQUIVO
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { firestore } from '../config';
import { Activity, StudentActivity, ActivityStatus } from '@/types/activity.types';

const ACTIVITIES_COLLECTION = 'activities';
const STUDENT_ACTIVITIES_COLLECTION = 'studentActivities';
const ASSIGNMENTS_COLLECTION = 'assignments';

export const activitiesService = {
  /**
   * Buscar atividade por ID com todas as informações
   */
  async getActivityById(activityId: string): Promise<Activity | null> {
    try {
      const activityDoc = await getDoc(doc(firestore, ACTIVITIES_COLLECTION, activityId));

      if (!activityDoc.exists()) {
        return null;
      }

      return {
        id: activityDoc.id,
        ...activityDoc.data(),
        createdAt: activityDoc.data().createdAt?.toDate(),
        updatedAt: activityDoc.data().updatedAt?.toDate()
      } as Activity;
    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      throw new Error('Não foi possível carregar a atividade');
    }
  },

  /**
   * Buscar progresso do aluno em uma atividade específica
   */
  async getStudentActivityProgress(
    studentId: string,
    activityId: string
  ): Promise<StudentActivity | null> {
    try {
      const q = query(
        collection(firestore, STUDENT_ACTIVITIES_COLLECTION),
        where('studentId', '==', studentId),
        where('activityId', '==', activityId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const studentActivityDoc = snapshot.docs[0];
      const data = studentActivityDoc.data();

      // Buscar dados completos da atividade
      const activity = await this.getActivityById(activityId);

      if (!activity) {
        return null;
      }

      return {
        activity,
        status: data.status || 'locked',
        studentId: data.studentId,
        programId: data.programId,
        moduleId: data.moduleId,
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        timeSpent: data.timeSpent || 0,
        answers: data.answers,
        notes: data.notes
      } as StudentActivity;
    } catch (error) {
      console.error('Erro ao buscar progresso da atividade:', error);
      throw new Error('Não foi possível carregar o progresso');
    }
  },

  /**
   * Iniciar uma atividade (mudar status para 'in_progress')
   */
  async startActivity(
    studentId: string,
    activityId: string,
    programId: string,
    moduleId: string
  ): Promise<void> {
    try {
      const studentActivityRef = doc(collection(firestore, STUDENT_ACTIVITIES_COLLECTION));

      const studentActivity: Omit<StudentActivity, 'activity'> = {
        id: studentActivityRef.id,
        studentId,
        activityId,
        programId,
        moduleId,
        status: 'in_progress',
        startedAt: new Date(),
        timeSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(studentActivityRef, studentActivity);
    } catch (error) {
      console.error('Erro ao iniciar atividade:', error);
      throw new Error('Não foi possível iniciar a atividade');
    }
  },

  /**
   * Completar uma atividade e atualizar progresso
   */
  async completeActivity(
    studentId: string,
    activityId: string,
    answers?: any,
    notes?: string
  ): Promise<{ pointsEarned: number }> {
    try {
      const batch = writeBatch(firestore);

      // 1. Buscar atividade para obter pontos
      const activity = await this.getActivityById(activityId);
      if (!activity) {
        throw new Error('Atividade não encontrada');
      }

      const pointsEarned = activity.points || 10;

      // 2. Buscar registro do aluno na atividade
      const q = query(
        collection(firestore, STUDENT_ACTIVITIES_COLLECTION),
        where('studentId', '==', studentId),
        where('activityId', '==', activityId)
      );

      const snapshot = await getDocs(q);
      let studentActivityRef;

      if (snapshot.empty) {
        // Criar novo registro
        studentActivityRef = doc(collection(firestore, STUDENT_ACTIVITIES_COLLECTION));
        batch.set(studentActivityRef, {
          studentId,
          activityId,
          programId: (await this.getActivityProgram(activityId))?.programId,
          moduleId: (await this.getActivityProgram(activityId))?.moduleId,
          status: 'completed',
          startedAt: serverTimestamp(),
          completedAt: serverTimestamp(),
          timeSpent: 0, // Será calculado posteriormente
          answers,
          notes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Atualizar registro existente
        studentActivityRef = doc(firestore, STUDENT_ACTIVITIES_COLLECTION, snapshot.docs[0].id);
        batch.update(studentActivityRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
          answers,
          notes,
          updatedAt: serverTimestamp()
        });
      }

      // 3. Atualizar progresso no assignment
      await this.updateAssignmentProgress(batch, studentId, activityId, pointsEarned);

      // 4. Executar todas as operações
      await batch.commit();

      return { pointsEarned };
    } catch (error) {
      console.error('Erro ao completar atividade:', error);
      throw new Error('Não foi possível completar a atividade');
    }
  },

  /**
   * Método auxiliar para buscar programa e módulo da atividade
   */
  async getActivityProgram(activityId: string): Promise<{ programId: string; moduleId: string } | null> {
    try {
      // Buscar em qual módulo esta atividade está
      const modulesQuery = query(
        collection(firestore, 'modules'),
        where('activities', 'array-contains', activityId)
      );

      const modulesSnapshot = await getDocs(modulesQuery);

      if (modulesSnapshot.empty) {
        return null;
      }

      const module = modulesSnapshot.docs[0];
      return {
        programId: module.data().programId,
        moduleId: module.id
      };
    } catch (error) {
      console.error('Erro ao buscar programa da atividade:', error);
      return null;
    }
  },

  /**
   * Atualizar progresso geral do assignment
   */
  async updateAssignmentProgress(
    batch: any,
    studentId: string,
    activityId: string,
    pointsEarned: number
  ): Promise<void> {
    try {
      // Buscar assignment ativo para este aluno e atividade
      const activityProgram = await this.getActivityProgram(activityId);
      if (!activityProgram) return;

      const assignmentsQuery = query(
        collection(firestore, ASSIGNMENTS_COLLECTION),
        where('studentId', '==', studentId),
        where('programId', '==', activityProgram.programId),
        where('status', '==', 'active')
      );

      const assignmentsSnapshot = await getDocs(assignmentsQuery);

      if (assignmentsSnapshot.empty) return;

      const assignmentDoc = assignmentsSnapshot.docs[0];
      const assignmentRef = doc(firestore, ASSIGNMENTS_COLLECTION, assignmentDoc.id);
      const assignmentData = assignmentDoc.data();

      // Atualizar progresso
      const completedActivities = [...(assignmentData.completedActivities || []), activityId];
      const progress = Math.min(100, Math.round((completedActivities.length / 20) * 100)); // Assumindo 20 atividades por programa

      batch.update(assignmentRef, {
        completedActivities,
        progress,
        updatedAt: serverTimestamp()
      });

      // Atualizar pontos do aluno
      const studentRef = doc(firestore, 'students', studentId);
      batch.update(studentRef, {
        totalPoints: arrayUnion(pointsEarned),
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Erro ao atualizar progresso do assignment:', error);
    }
  },

  /**
   * Salvar rascunho/respostas parciais
   */
  async saveActivityDraft(
    studentId: string,
    activityId: string,
    answers: any,
    timeSpent: number = 0
  ): Promise<void> {
    try {
      const q = query(
        collection(firestore, STUDENT_ACTIVITIES_COLLECTION),
        where('studentId', '==', studentId),
        where('activityId', '==', activityId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Criar novo registro como rascunho
        const studentActivityRef = doc(collection(firestore, STUDENT_ACTIVITIES_COLLECTION));
        await updateDoc(studentActivityRef, {
          studentId,
          activityId,
          status: 'in_progress',
          answers,
          timeSpent,
          startedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      } else {
        // Atualizar registro existente
        const studentActivityRef = doc(firestore, STUDENT_ACTIVITIES_COLLECTION, snapshot.docs[0].id);
        await updateDoc(studentActivityRef, {
          answers,
          timeSpent,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      throw new Error('Não foi possível salvar o progresso');
    }
  }
};