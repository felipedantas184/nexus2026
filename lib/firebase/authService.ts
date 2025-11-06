// lib/firebase/authService.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from './config';
import { Professional } from '@/types';

interface ProfessionalRegistrationData {
  name: string;
  email: string;
  password: string;
  role: 'psychologist' | 'psychiatrist' | 'monitor' | 'coordinator';
  specialization?: string;
  licenseNumber?: string;
}

export const createProfessional = async (data: ProfessionalRegistrationData) => {
  try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      data.email, 
      data.password
    );
    
    const user = userCredential.user;

    // 2. Atualizar o perfil do usuário
    await updateProfile(user, {
      displayName: data.name
    });

    // 3. Criar documento no Firestore
    const professionalData: Omit<Professional, 'id'> = {
      email: data.email,
      name: data.name,
      role: data.role,
      specialization: data.specialization || '',
      licenseNumber: data.licenseNumber || '',
      assignedStudents: [],
      canCreatePrograms: true,
      canManageStudents: data.role === 'coordinator',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(firestore, 'professionals', user.uid), professionalData);

    return { success: true, user };
  } catch (error: any) {
    console.error('Erro ao criar profissional:', error);
    
    // Tratamento de erros específicos do Firebase
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail já está em uso.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('E-mail inválido.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('A senha é muito fraca.');
    } else {
      throw new Error('Erro ao criar conta. Tente novamente.');
    }
  }
};

export const loginProfessional = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erro no login:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('Profissional não encontrado.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Senha incorreta.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('E-mail inválido.');
    } else {
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  }
};

{/**
export const loginStudent = async (cpf: string, birthday: string) => {
  try {
    // Limpar CPF (remover pontos e traço)
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Converter data para formato YYYY-MM-DD
    const [day, month, year] = birthday.split('/');
    const formattedBirthday = `${year}-${month}-${day}`;

    console.log('Buscando aluno:', { cleanCPF, formattedBirthday });

    // Buscar aluno no Firestore pelo CPF e data de nascimento
    const studentsQuery = query(
      collection(firestore, 'students'),
      where('personalInfo.cpf', '==', cleanCPF),
      where('personalInfo.birthday', '==', formattedBirthday),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(studentsQuery);
    
    if (snapshot.empty) {
      throw new Error('Aluno não encontrado ou credenciais inválidas.');
    }

    // Pegar o primeiro aluno encontrado (deveria ser único)
    const studentDoc = snapshot.docs[0];
    const studentData = studentDoc.data();
    
    console.log('Aluno encontrado:', studentData);

    // Retornar dados do aluno (sem senha, pois não usamos auth do Firebase para alunos)
    return {
      id: studentDoc.id,
      ...studentData,
      createdAt: studentData.createdAt?.toDate(),
      updatedAt: studentData.updatedAt?.toDate()
    };
  } catch (error: any) {
    console.error('Erro no login do aluno:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Erro de permissão. Contate o administrador.');
    } else if (error.message.includes('não encontrado')) {
      throw new Error('Aluno não encontrado. Verifique o CPF e data de nascimento.');
    } else {
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  }
};
 */}
 
// Método auxiliar para buscar aluno por ID
export const getStudentById = async (studentId: string) => {
  try {
    const studentDoc = await getDoc(doc(firestore, 'students', studentId));
    
    if (!studentDoc.exists()) {
      return null;
    }

    return {
      id: studentDoc.id,
      ...studentDoc.data(),
      createdAt: studentDoc.data().createdAt?.toDate(),
      updatedAt: studentDoc.data().updatedAt?.toDate()
    };
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error);
    throw new Error('Erro ao sair da conta.');
  }
};