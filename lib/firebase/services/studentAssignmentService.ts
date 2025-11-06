// lib/firebase/services/studentAssignmentService.ts - VERSÃO SUPER ROBUSTA
import { 
  doc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { firestore } from '../config';

const STUDENTS_COLLECTION = 'students';

export const studentAssignmentService = {
  /**
   * Método ULTRA robusto para atribuir programa a aluno
   */
  async assignProgramToStudent(studentId: string, programId: string): Promise<void> {
    console.log(`\n🔄 [studentAssignmentService] INICIANDO: aluno=${studentId}, programa=${programId}`);
    
    try {
      // 1. VERIFICAR SE O ALUNO EXISTE
      const studentRef = doc(firestore, STUDENTS_COLLECTION, studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        throw new Error(`Aluno com ID ${studentId} não encontrado no Firestore`);
      }

      console.log(`✅ Aluno encontrado:`, studentDoc.data()?.name);

      // 2. VERIFICAR PROGRAMA ATUAL
      const studentData = studentDoc.data();
      const currentAssigned = studentData.assignedPrograms || [];
      
      console.log(`📋 Programas atuais do aluno:`, currentAssigned);
      console.log(`🔍 Verificando se programa ${programId} já está atribuído...`);

      if (currentAssigned.includes(programId)) {
        console.log(`ℹ️ Programa ${programId} JÁ ESTÁ atribuído ao aluno`);
        return;
      }

      // 3. ATUALIZAR USANDO MÚLTIPLAS ESTRATÉGIAS
      console.log(`🔄 Atualizando aluno com novo programa...`);
      
      // Estratégia 1: arrayUnion (primária)
      try {
        await updateDoc(studentRef, {
          assignedPrograms: arrayUnion(programId),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Atualização com arrayUnion bem-sucedida`);
      } catch (arrayUnionError) {
        console.warn(`⚠️ arrayUnion falhou, tentando estratégia alternativa...`, arrayUnionError);
        
        // Estratégia 2: spread operator
        const newAssigned = [...currentAssigned, programId];
        await updateDoc(studentRef, {
          assignedPrograms: newAssigned,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Atualização com spread operator bem-sucedida`);
      }

      // 4. VERIFICAR SE A ATUALIZAÇÃO FOI BEM-SUCEDIDA
      console.log(`🔍 Verificando atualização...`);
      const updatedDoc = await getDoc(studentRef);
      const updatedPrograms = updatedDoc.data()?.assignedPrograms || [];
      
      console.log(`📊 Programas após atualização:`, updatedPrograms);
      
      if (updatedPrograms.includes(programId)) {
        console.log(`🎉 PROGRAMA ${programId} ATRIBUÍDO COM SUCESSO!`);
      } else {
        throw new Error(`Falha crítica: programa não foi adicionado ao array do aluno`);
      }

    } catch (error : any) {
      console.error(`💥 ERRO CRÍTICO em assignProgramToStudent:`, error);
      throw new Error(`Falha ao atribuir programa ${programId} ao aluno ${studentId}: ${error.message}`);
    }
  },

  /**
   * Método alternativo usando Batch para máxima confiabilidade
   */
  async assignProgramToStudentBatch(studentId: string, programId: string): Promise<void> {
    console.log(`\n🔥 [BATCH] Atribuindo programa ${programId} ao aluno ${studentId}`);
    
    const batch = writeBatch(firestore);
    const studentRef = doc(firestore, STUDENTS_COLLECTION, studentId);
    
    // Primeiro buscar o documento atual
    const studentDoc = await getDoc(studentRef);
    if (!studentDoc.exists()) {
      throw new Error('Aluno não encontrado');
    }
    
    const currentAssigned = studentDoc.data().assignedPrograms || [];
    const newAssigned = [...currentAssigned, programId];
    
    // Atualizar usando batch
    batch.update(studentRef, {
      assignedPrograms: newAssigned,
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    console.log(`✅ [BATCH] Atualização commitada com sucesso`);
  }
};
