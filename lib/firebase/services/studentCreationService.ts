// lib/firebase/services/studentCreationService.ts - NOVO ARQUIVO
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../config';
import { Student } from '@/types';

const STUDENTS_COLLECTION = 'students';

export const studentCreationService = {
  async createStudent(
    studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>, 
    password: string,
    currentUserEmail: string,
    currentUserPassword: string
  ): Promise<{ studentId: string }> {
    try {
      console.log('Criando aluno sem afetar sessão...');

      // 🔥 SALVAR CREDENCIAIS DO USUÁRIO ATUAL
      const originalCredentials = {
        email: currentUserEmail,
        password: currentUserPassword
      };

      let formattedBirthday = studentData.personalInfo.birthday;
      
      if (studentData.personalInfo.birthday && studentData.personalInfo.birthday.includes('/')) {
        const [day, month, year] = studentData.personalInfo.birthday.split('/');
        formattedBirthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const formattedCPF = studentData.personalInfo.cpf.replace(/\D/g, '');

      // 🔥 1. CRIAR USUÁRIO ALUNO (isso vai fazer login automático)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        studentData.email,
        password
      );

      const userId = userCredential.user.uid;
      console.log('Aluno criado no Auth com ID:', userId);

      // 🔥 2. CRIAR DOCUMENTO NO FIRESTORE
      const formattedStudent = {
        ...studentData,
        personalInfo: {
          ...studentData.personalInfo,
          cpf: formattedCPF,
          birthday: formattedBirthday
        },
        streak: 0,
        totalPoints: 0,
        level: 1,
        assignedPrograms: [],
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(firestore, STUDENTS_COLLECTION, userId), formattedStudent);
      console.log('Aluno criado no Firestore');

      // 🔥 3. FAZER LOGOUT DO ALUNO IMEDIATAMENTE
      // Não vamos usar signOut aqui para evitar o loop

      // 🔥 4. RESTAURAR SESSÃO DO PROFISSIONAL FAZENDO LOGIN NOVAMENTE
      console.log('Restaurando sessão do profissional...');
      await signInWithEmailAndPassword(
        auth, 
        originalCredentials.email, 
        originalCredentials.password
      );

      console.log('Sessão do profissional restaurada com sucesso!');

      return {
        studentId: userId
      };

    } catch (error: any) {
      console.error('Erro ao criar aluno:', error);
      
      let errorMessage = 'Não foi possível criar o aluno.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso por outro aluno.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use no mínimo 6 caracteres.';
      }
      
      throw new Error(errorMessage);
    }
  }
};