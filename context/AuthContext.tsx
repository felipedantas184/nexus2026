// context/AuthContext.tsx - VERSÃO CORRIGIDA
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config';
import { AuthContextType, BaseUser, Student, Professional } from '@/types';
import { usePathname, useRouter } from 'next/navigation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<BaseUser | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const professionalLogin = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Tentando login profissional com:', email);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Erro no login profissional:', error);
      throw error;
    }
  };

  const studentLogin = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🎯 STUDENT LOGIN: Iniciando login do aluno...', email);

      await signInWithEmailAndPassword(auth, email, password);

      console.log('✅ STUDENT LOGIN: Login realizado com sucesso no Firebase Auth');
      console.log('🎯 STUDENT LOGIN: Aguardando onAuthStateChanged...');

    } catch (error: any) {
      console.error('❌ STUDENT LOGIN: Erro no login:', error);

      if (error.code === 'auth/user-not-found') {
        throw new Error('Aluno não encontrado. Verifique o email.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido.');
      } else {
        throw new Error('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('onAuthStateChanged chamado:', firebaseUser?.uid);

      if (firebaseUser) {
        try {
          console.log('Buscando dados do usuário no Firestore...');

          // Tentar buscar como Professional primeiro
          const professionalDoc = await getDoc(doc(firestore, 'professionals', firebaseUser.uid));
          console.log('Professional document exists:', professionalDoc.exists());

          if (professionalDoc.exists()) {
            const professionalData = {
              id: professionalDoc.id,
              ...professionalDoc.data(),
              createdAt: professionalDoc.data().createdAt?.toDate(),
              updatedAt: professionalDoc.data().updatedAt?.toDate()
            } as Professional;
            console.log('Professional data:', professionalData);
            setUser(professionalData);
            setStudent(null);
          } else {
            // Se não for professional, buscar como Student
            const studentDoc = await getDoc(doc(firestore, 'students', firebaseUser.uid));
            console.log('Student document exists:', studentDoc.exists());

            if (studentDoc.exists()) {
              const studentData = {
                id: studentDoc.id,
                ...studentDoc.data(),
                createdAt: studentDoc.data().createdAt?.toDate(),
                updatedAt: studentDoc.data().updatedAt?.toDate()
              } as Student;
              console.log('Student data:', studentData);
              setStudent(studentData);
              setUser(studentData);
            } else {
              console.log('No user data found in Firestore for UID:', firebaseUser.uid);
              setUser(null);
              setStudent(null);
              await signOut(auth);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setStudent(null);
        }
      } else {
        console.log('Usuário não autenticado');
        setUser(null);
        setStudent(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (student && pathname === '/student-login') {
      console.log('🎯 REDIRECT: Aluno autenticado, redirecionando para dashboard...');
      router.push('/student/dashboard');
    }
    
    if (user && user.role !== 'student' && pathname === '/login') {
      console.log('🎯 REDIRECT: Professional autenticado, redirecionando...');
      router.push('/professional/dashboard');
    }
  }, [student, user, pathname, router]);

  const value: AuthContextType = {
    user,
    student,
    loading,
    professionalLogin,
    studentLogin,
    logout,
    isProfessional: !!user && user.role !== 'student',
    isStudent: !!student,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};