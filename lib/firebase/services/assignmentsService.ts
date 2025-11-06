import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { firestore } from '../config';
import { Assignment, AssignmentStatus } from '@/types/assignments.types';
import { Student } from '@/types/user.types';

const ASSIGNMENTS_COLLECTION = 'assignments';
const STUDENTS_COLLECTION = 'students';
const PROGRAMS_COLLECTION = 'programs';

export const assignmentService = {
  /**
   * Atribuir programa a múltiplos alunos de forma atômica
   */
  /**
  async assignProgramToStudents(
    programId: string,
    studentIds: string[],
    assignmentConfig: {
      assignedBy: string;
      startDate?: Date;
      endDate?: Date;
      customMessage?: string;
      sendNotification?: boolean;
    }
  ): Promise<{ success: string[]; failures: { studentId: string; error: string }[] }> {
    console.log(`🎯 INICIANDO ATRIBUIÇÃO: Programa ${programId} para ${studentIds.length} alunos`);

    const batch = writeBatch(firestore);
    const results = {
      success: [] as string[],
      failures: [] as { studentId: string; error: string }[]
    };

    try {
      for (const studentId of studentIds) {
        try {
          // 1. Criar assignment
          const assignmentRef = doc(collection(firestore, ASSIGNMENTS_COLLECTION));
          const assignmentData = {
            programId,
            studentId,
            assignedBy: assignmentConfig.assignedBy,
            assignedAt: serverTimestamp(),
            startDate: assignmentConfig.startDate,
            endDate: assignmentConfig.endDate || null,
            status: 'active' as AssignmentStatus,
            progress: 0,
            completedActivities: [],
            customMessage: assignmentConfig.customMessage || '',
            sendNotification: assignmentConfig.sendNotification || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          batch.set(assignmentRef, assignmentData);

          // 2. Atualizar aluno
          const studentRef = doc(firestore, STUDENTS_COLLECTION, studentId);
          batch.update(studentRef, {
            assignedPrograms: arrayUnion(programId),
            updatedAt: serverTimestamp()
          });

          // 3. Atualizar programa
          const programRef = doc(firestore, PROGRAMS_COLLECTION, programId);
          batch.update(programRef, {
            assignedStudents: arrayUnion(studentId),
            updatedAt: serverTimestamp()
          });

          results.success.push(studentId);
          console.log(`✅ Operações batch preparadas para aluno ${studentId}`);

        } catch (studentError: any) {
          console.error(`❌ Erro no aluno ${studentId}:`, studentError);
          results.failures.push({
            studentId,
            error: studentError.message
          });
        }
      }

      // Executar todas as operações atomicamente
      await batch.commit();
      console.log(`🎉 BATCH COMMITADO: ${results.success.length} sucessos, ${results.failures.length} falhas`);

      return results;

    } catch (error: any) {
      console.error('💥 ERRO CRÍTICO no batch:', error);
      throw new Error(`Falha na atribuição em lote: ${error.message}`);
    }
  },
   */

  /**
   * Verificar se aluno já tem programa atribuído
   */
  async checkStudentProgramAssignment(
    studentId: string,
    programId: string
  ): Promise<boolean> {
    const q = query(
      collection(firestore, ASSIGNMENTS_COLLECTION),
      where('studentId', '==', studentId),
      where('programId', '==', programId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  /**
   * Buscar assignments do aluno
   */
  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    const q = query(
      collection(firestore, ASSIGNMENTS_COLLECTION),
      where('studentId', '==', studentId),
      where('status', '==', 'active'),
      orderBy('assignedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        assignedAt: data.assignedAt?.toDate?.(),
        startDate: data.startDate?.toDate?.(),
        endDate: data.endDate?.toDate?.(),
        createdAt: data.createdAt?.toDate?.(),
        updatedAt: data.updatedAt?.toDate?.()
      } as Assignment;
    });
  },

  /**
   * Buscar assignments de um programa
   */
  async getProgramAssignments(programId: string): Promise<Assignment[]> {
    const q = query(
      collection(firestore, ASSIGNMENTS_COLLECTION),
      where('programId', '==', programId),
      where('status', '==', 'active'),
      orderBy('assignedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        assignedAt: data.assignedAt?.toDate?.(),
        startDate: data.startDate?.toDate?.(),
        endDate: data.endDate?.toDate?.(),
        createdAt: data.createdAt?.toDate?.(),
        updatedAt: data.updatedAt?.toDate?.()
      } as Assignment;
    });
  },

  /**
   * Atualizar progresso de assignment
   */
  async updateAssignmentProgress(
    assignmentId: string,
    updates: {
      progress?: number;
      completedActivities?: string[];
    }
  ): Promise<void> {
    const assignmentRef = doc(firestore, ASSIGNMENTS_COLLECTION, assignmentId);
    await updateDoc(assignmentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Remover atribuição
   */
  async removeAssignment(assignmentId: string): Promise<void> {
    const assignmentRef = doc(firestore, ASSIGNMENTS_COLLECTION, assignmentId);
    await updateDoc(assignmentRef, {
      status: 'inactive',
      updatedAt: serverTimestamp()
    });
  }
};