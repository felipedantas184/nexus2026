// lib/firebase/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from './config';
import { Professional, Student } from '@/types';

interface ProfessionalRegistrationData {
  name: string;
  email: string;
  password: string;
  role: 'psychologist' | 'psychiatrist' | 'monitor' | 'coordinator';
  specialization?: string;
  licenseNumber?: string;
}

interface CreateStudentInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  birthday: string; // formato: "YYYY-MM-DD"
  phone: string;
  school: string;
  grade: string;
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

export async function createStudent(data: CreateStudentInput) {
  const {
    name,
    email,
    password,
    confirmPassword,
    cpf,
    birthday,
    phone,
    school,
    grade,
  } = data;

  if (password !== confirmPassword) {
    throw new Error("As senhas não coincidem.");
  }

  try {
    // 1️⃣ CRIAR USUÁRIO NO AUTH
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userId = userCredential.user.uid;

    // 2️⃣ CRIAR DOCUMENTO COM O MESMO UID (NÃO MAIS addDoc)
    await setDoc(doc(firestore, "students", userId), {
      name,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      personalInfo: {
        cpf: cpf,
        birthday: birthday,
        parentName: '',
        phone: phone,
        school: school,
        grade: grade,
      },
      medicalInfo: {
        diagnosis: [],
        medications: "",
        notes: "",
      },
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
      },
      assignedProfessionals: [],
      assignedPrograms: [],
      streak: 0,
      totalPoints: 0,
      level: 1,
    });

    return { success: true, userId };
  } catch (error: any) {
    console.error("Erro ao criar estudante:", error);
    throw new Error(error.message || "Erro ao criar estudante.");
  }
}