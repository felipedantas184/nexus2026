// lib/firebase/services/observationsService.ts
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
import { firestore } from '../config';
import { Observation, ObservationFormData } from '@/types/observation.types';

const OBSERVATIONS_COLLECTION = 'observations';

export const observationsService = {
  // Buscar observações de um aluno
  async getStudentObservations(studentId: string): Promise<Observation[]> {
    try {
      const q = query(
        collection(firestore, OBSERVATIONS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Observation[];
    } catch (error) {
      console.error('Erro ao buscar observações:', error);
      throw new Error('Não foi possível carregar as observações');
    }
  },

  // Criar nova observação
  async createObservation(observationData: Omit<Observation, 'id' | 'createdAt'>): Promise<string> {
    try {
      const observationWithTimestamp = {
        ...observationData,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, OBSERVATIONS_COLLECTION), observationWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar observação:', error);
      throw new Error('Não foi possível criar a observação');
    }
  },

  // Atualizar observação
  async updateObservation(observationId: string, updates: Partial<Observation>): Promise<void> {
    try {
      const observationRef = doc(firestore, OBSERVATIONS_COLLECTION, observationId);
      await updateDoc(observationRef, updates);
    } catch (error) {
      console.error('Erro ao atualizar observação:', error);
      throw new Error('Não foi possível atualizar a observação');
    }
  },

  // Deletar observação
  async deleteObservation(observationId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, OBSERVATIONS_COLLECTION, observationId));
    } catch (error) {
      console.error('Erro ao deletar observação:', error);
      throw new Error('Não foi possível deletar a observação');
    }
  },

  // Buscar observações por profissional
  async getProfessionalObservations(professionalId: string): Promise<Observation[]> {
    try {
      const q = query(
        collection(firestore, OBSERVATIONS_COLLECTION),
        where('authorId', '==', professionalId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Observation[];
    } catch (error) {
      console.error('Erro ao buscar observações do profissional:', error);
      throw new Error('Não foi possível carregar as observações');
    }
  }
};