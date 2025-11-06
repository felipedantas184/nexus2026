// lib/firebase/services/programsService.ts
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
  serverTimestamp
} from 'firebase/firestore';
import { Program, Module, Activity, ProgramAssignment } from '@/types';
import { firestore } from '../config';

const PROGRAMS_COLLECTION = 'programs';
const MODULES_COLLECTION = 'modules';
const ACTIVITIES_COLLECTION = 'activities';
const ASSIGNMENTS_COLLECTION = 'assignments';

// ===== SERVIÇOS DE PROGRAMAS =====
export const programsService = {
  // Buscar todos os programas de um profissional
  async getProfessionalPrograms(professionalId: string): Promise<Program[]> {
    try {
      const programsQuery = query(
        collection(firestore, PROGRAMS_COLLECTION),
        where('createdBy', '==', professionalId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(programsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Program[];
    } catch (error) {
      console.error('Erro ao buscar programas:', error);
      throw new Error('Não foi possível carregar os programas');
    }
  },

  // Buscar programa por ID
  async getProgramById(programId: string): Promise<Program | null> {
    try {
      console.log('Buscando programa:', programId);

      if (!programId) {
        console.error('ID do programa é inválido');
        return null;
      }

      const programDoc = await getDoc(doc(firestore, PROGRAMS_COLLECTION, programId));

      if (!programDoc.exists()) {
        console.log('Programa não encontrado:', programId);
        return null;
      }

      console.log('Programa encontrado, buscando módulos...');

      // Buscar módulos do programa
      const modulesQuery = query(
        collection(firestore, MODULES_COLLECTION),
        where('programId', '==', programId),
        orderBy('order', 'asc')
      );
      const modulesSnapshot = await getDocs(modulesQuery);

      const modules = await Promise.all(
        modulesSnapshot.docs.map(async (moduleDoc) => {
          // Buscar atividades do módulo
          const activitiesQuery = query(
            collection(firestore, ACTIVITIES_COLLECTION),
            where('moduleId', '==', moduleDoc.id),
            orderBy('order', 'asc')
          );
          const activitiesSnapshot = await getDocs(activitiesQuery);

          const activities = activitiesSnapshot.docs.map(activityDoc => ({
            id: activityDoc.id,
            ...activityDoc.data(),
            createdAt: activityDoc.data().createdAt?.toDate(),
            updatedAt: activityDoc.data().updatedAt?.toDate()
          })) as Activity[];

          return {
            id: moduleDoc.id,
            ...moduleDoc.data(),
            activities,
            createdAt: moduleDoc.data().createdAt?.toDate(),
            updatedAt: moduleDoc.data().updatedAt?.toDate()
          } as Module;
        })
      );

      // Buscar atribuições do programa
      const assignmentsQuery = query(
        collection(firestore, ASSIGNMENTS_COLLECTION),
        where('programId', '==', programId)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignedStudents = assignmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          studentId: data.studentId || '',
          assignedBy: data.assignedBy || '',
          assignedAt: data.assignedAt?.toDate() || new Date(),
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          progress: data.progress || {
            completedActivities: [],
            completedModules: [],
            totalProgress: 0,
            timeSpent: 0
          }
        } as ProgramAssignment;
      });

      return {
        id: programDoc.id,
        ...programDoc.data(),
        modules,
        assignedStudents,
        createdAt: programDoc.data().createdAt?.toDate(),
        updatedAt: programDoc.data().updatedAt?.toDate()
      } as Program;
    } catch (error) {
      console.error('Erro ao buscar programa:', error);
      return null;
    }
  },

  // Criar novo programa
  async createProgram(programData: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const programWithTimestamps = {
        ...programData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, PROGRAMS_COLLECTION), programWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar programa:', error);
      throw new Error('Não foi possível criar o programa');
    }
  },

  // Atualizar programa
  async updateProgram(programId: string, updates: Partial<Program>): Promise<void> {
    try {
      const programRef = doc(firestore, PROGRAMS_COLLECTION, programId);
      await updateDoc(programRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
      throw new Error('Não foi possível atualizar o programa');
    }
  },

  // Deletar programa
  async deleteProgram(programId: string): Promise<void> {
    try {
      // Primeiro deletar todos os módulos e atividades
      const modulesQuery = query(
        collection(firestore, MODULES_COLLECTION),
        where('programId', '==', programId)
      );
      const modulesSnapshot = await getDocs(modulesQuery);

      const deletePromises = modulesSnapshot.docs.map(async (moduleDoc) => {
        // Deletar atividades do módulo
        const activitiesQuery = query(
          collection(firestore, ACTIVITIES_COLLECTION),
          where('moduleId', '==', moduleDoc.id)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);

        const activityDeletes = activitiesSnapshot.docs.map(activityDoc =>
          deleteDoc(doc(firestore, ACTIVITIES_COLLECTION, activityDoc.id))
        );

        await Promise.all(activityDeletes);
        await deleteDoc(doc(firestore, MODULES_COLLECTION, moduleDoc.id));
      });

      await Promise.all(deletePromises);

      // Deletar atribuições do programa
      const assignmentsQuery = query(
        collection(firestore, ASSIGNMENTS_COLLECTION),
        where('programId', '==', programId)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentDeletes = assignmentsSnapshot.docs.map(assignmentDoc => // ← MUDAR 'doc' para 'assignmentDoc'
        deleteDoc(doc(firestore, ASSIGNMENTS_COLLECTION, assignmentDoc.id)) // ← Usar assignmentDoc.id
      );

      await Promise.all(assignmentDeletes);

      // Finalmente deletar o programa
      await deleteDoc(doc(firestore, PROGRAMS_COLLECTION, programId));
    } catch (error) {
      console.error('Erro ao deletar programa:', error);
      throw new Error('Não foi possível deletar o programa');
    }
  }
};

// ===== SERVIÇOS DE MÓDULOS =====
export const modulesService = {
  // Criar módulo
  async createModule(moduleData: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const moduleWithTimestamps = {
        ...moduleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, MODULES_COLLECTION), moduleWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      throw new Error('Não foi possível criar o módulo');
    }
  },

  // Atualizar módulo
  async updateModule(moduleId: string, updates: Partial<Module>): Promise<void> {
    try {
      const moduleRef = doc(firestore, MODULES_COLLECTION, moduleId);
      await updateDoc(moduleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      throw new Error('Não foi possível atualizar o módulo');
    }
  },

  // Deletar módulo
  async deleteModule(moduleId: string): Promise<void> {
    try {
      // Deletar todas as atividades do módulo
      const activitiesQuery = query(
        collection(firestore, ACTIVITIES_COLLECTION),
        where('moduleId', '==', moduleId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);

      const deletePromises = activitiesSnapshot.docs.map(activityDoc =>
        deleteDoc(doc(firestore, ACTIVITIES_COLLECTION, activityDoc.id))
      );

      await Promise.all(deletePromises);
      await deleteDoc(doc(firestore, MODULES_COLLECTION, moduleId));
    } catch (error) {
      console.error('Erro ao deletar módulo:', error);
      throw new Error('Não foi possível deletar o módulo');
    }
  }
};

// ===== SERVIÇOS DE ATIVIDADES =====
export const activitiesService = {
  // Criar atividade
  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const activityWithTimestamps = {
        ...activityData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, ACTIVITIES_COLLECTION), activityWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      throw new Error('Não foi possível criar a atividade');
    }
  },

  // Atualizar atividade
  async updateActivity(activityId: string, updates: Partial<Activity>): Promise<void> {
    try {
      const activityRef = doc(firestore, ACTIVITIES_COLLECTION, activityId);
      await updateDoc(activityRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      throw new Error('Não foi possível atualizar a atividade');
    }
  },

  // Deletar atividade
  async deleteActivity(activityId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, ACTIVITIES_COLLECTION, activityId));
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      throw new Error('Não foi possível deletar a atividade');
    }
  }
};

// ===== SERVIÇOS DE ATRIBUIÇÃO =====
export const assignmentsService = {
  // Atribuir programa a alunos
  async assignProgramToStudents(assignmentData: {
    programId: string;
    studentIds: string[];
    assignedBy: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<void> {
    try {
      const assignmentPromises = assignmentData.studentIds.map(async (studentId) => {
        const assignment = {
          programId: assignmentData.programId,
          studentId,
          assignedBy: assignmentData.assignedBy,
          assignedAt: serverTimestamp(),
          startDate: assignmentData.startDate,
          endDate: assignmentData.endDate,
          progress: {
            completedActivities: [],
            completedModules: [],
            totalProgress: 0,
            timeSpent: 0
          }
        };

        await addDoc(collection(firestore, ASSIGNMENTS_COLLECTION), assignment);
      });

      await Promise.all(assignmentPromises);
    } catch (error) {
      console.error('Erro ao atribuir programa:', error);
      throw new Error('Não foi possível atribuir o programa aos alunos');
    }
  },

  // Buscar programas atribuídos a um aluno
  async getStudentAssignments(studentId: string): Promise<ProgramAssignment[]> {
    try {
      const assignmentsQuery = query(
        collection(firestore, ASSIGNMENTS_COLLECTION),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(assignmentsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          studentId: data.studentId || '',
          assignedBy: data.assignedBy || '',
          assignedAt: data.assignedAt?.toDate() || new Date(),
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          progress: data.progress || {
            completedActivities: [],
            completedModules: [],
            totalProgress: 0,
            timeSpent: 0
          }
        } as ProgramAssignment;
      });
    } catch (error) {
      console.error('Erro ao buscar atribuições do aluno:', error);
      throw new Error('Não foi possível carregar as atribuições');
    }
  },

  // Remover atribuição
  async removeAssignment(assignmentId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, ASSIGNMENTS_COLLECTION, assignmentId));
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      throw new Error('Não foi possível remover a atribuição');
    }
  }
};