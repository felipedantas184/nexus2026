import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  setDoc // 🔥 ADICIONAR
} from 'firebase/firestore';
import { Student, Professional } from '@/types';
import { firestore } from '../config';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config';
import { studentCreationService } from './studentCreationService';

const STUDENTS_COLLECTION = 'students';
const PROFESSIONALS_COLLECTION = 'professionals';

export const studentsService = {
  // Buscar todos os alunos de um profissional
  async getProfessionalStudents(professionalId: string): Promise<Student[]> {
    try {
      // Primeiro buscar o profissional para verificar se é coordenador
      const professionalDoc = await getDoc(doc(firestore, PROFESSIONALS_COLLECTION, professionalId));
      const professional = professionalDoc.data() as Professional;

      let studentsQuery;

      if (professional?.canManageStudents) {
        // Coordenador vê todos os alunos
        studentsQuery = query(
          collection(firestore, STUDENTS_COLLECTION),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Outros profissionais veem apenas seus alunos atribuídos
        studentsQuery = query(
          collection(firestore, STUDENTS_COLLECTION),
          where('assignedProfessionals', 'array-contains', professionalId),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(studentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Student[];
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      throw new Error('Não foi possível carregar os alunos');
    }
  },

  // Buscar aluno por ID
  async getStudentById(studentId: string): Promise<Student | null> {
    try {
      const studentDoc = await getDoc(doc(firestore, STUDENTS_COLLECTION, studentId));
      if (!studentDoc.exists()) return null;

      return {
        id: studentDoc.id,
        ...studentDoc.data(),
        createdAt: studentDoc.data().createdAt?.toDate(),
        updatedAt: studentDoc.data().updatedAt?.toDate()
      } as Student;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw new Error('Não foi possível carregar o aluno');
    }
  },

  // Criar novo aluno
  async createStudent(
    studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>,
    password: string,
    currentUserEmail: string,
    currentUserPassword: string
  ): Promise<{ studentId: string }> {
    return studentCreationService.createStudent(
      studentData,
      password,
      currentUserEmail,
      currentUserPassword
    );
  },

  // Atualizar aluno
  async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    try {
      const studentRef = doc(firestore, STUDENTS_COLLECTION, studentId);
      await updateDoc(studentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw new Error('Não foi possível atualizar o aluno');
    }
  },

  // Adicionar profissional ao aluno
  async assignProfessionalToStudent(studentId: string, professionalId: string): Promise<void> {
    try {
      const studentRef = doc(firestore, STUDENTS_COLLECTION, studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        throw new Error('Aluno não encontrado');
      }

      const currentAssigned = studentDoc.data().assignedProfessionals || [];

      if (!currentAssigned.includes(professionalId)) {
        await updateDoc(studentRef, {
          assignedProfessionals: [...currentAssigned, professionalId],
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erro ao atribuir profissional:', error);
      throw new Error('Não foi possível atribuir o profissional ao aluno');
    }
  },
  
  async getActiveStudents(professionalId: string): Promise<Student[]> {
    try {
      const studentsQuery = query(
        collection(firestore, STUDENTS_COLLECTION),
        where('assignedProfessionals', 'array-contains', professionalId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(studentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Student[];
    } catch (error) {
      console.error('Erro ao buscar alunos ativos:', error);
      throw new Error('Não foi possível carregar os alunos');
    }
  },

  // 🔥 ADICIONAR MÉTODO PARA ATUALIZAR SENHA
  async updateStudentPassword(studentId: string, newPassword: string): Promise<void> {
    try {
      // Aqui precisaríamos usar Firebase Admin SDK ou função cloud
      // Para simplificar, podemos pedir para o aluno trocar a senha no primeiro login
      // Ou criar uma função cloud para isso
      console.log('Atualização de senha requer função cloud');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw new Error('Não foi possível atualizar a senha');
    }
  },
};