// lib/services/gad7Service.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  writeBatch,
  Timestamp,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../config';
import { GAD7Assessment, GAD7StudentConfig } from '@/types/gad7.types';

class GAD7Service {
  private assessmentsCollection = collection(firestore, 'gad7Assessments');
  private studentConfigCollection = collection(firestore, 'gad7StudentConfig');
  
  // ===== VERIFICAR SE ALUNO PRECISA FAZER AVALIAÇÃO =====
  
  async checkIfAssessmentRequired(studentId: string): Promise<{
    required: boolean;
    reason: 'first_time' | 'periodic' | 'overdue';
    nextAssessmentDate?: Date;
    daysUntilNext?: number;
  }> {
    try {
      // Verificar se é o primeiro acesso
      const studentConfig = await this.getStudentConfig(studentId);
      
      if (!studentConfig) {
        // Primeiro acesso - precisa fazer avaliação
        return {
          required: true,
          reason: 'first_time'
        };
      }
      
      // Verificar se tem avaliação pendente
      const now = new Date();
      const nextDate = studentConfig.nextAssessmentDate;
      
      if (!nextDate) {
        return {
          required: true,
          reason: 'overdue'
        };
      }
      
      if (now >= new Date(nextDate)) {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(nextDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          required: true,
          reason: daysOverdue > 7 ? 'overdue' : 'periodic',
          nextAssessmentDate: new Date(nextDate),
          daysUntilNext: 0
        };
      }
      
      // Calcular dias até próxima avaliação
      const daysUntil = Math.ceil(
        (new Date(nextDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        required: false,
        reason: 'periodic',
        nextAssessmentDate: new Date(nextDate),
        daysUntilNext: daysUntil
      };
      
    } catch (error) {
      console.error('Erro ao verificar avaliação:', error);
      return {
        required: false,
        reason: 'periodic'
      };
    }
  }
  
  // ===== OBTER CONFIGURAÇÃO DO ALUNO =====
  
  async getStudentConfig(studentId: string): Promise<GAD7StudentConfig | null> {
    try {
      const configRef = doc(this.studentConfigCollection, studentId);
      const configSnap = await getDoc(configRef);
      
      if (!configSnap.exists()) return null;
      
      const data = configSnap.data();
      return {
        studentId,
        requiresInitialAssessment: data.requiresInitialAssessment ?? true,
        lastAssessmentDate: data.lastAssessmentDate?.toDate() ?? null,
        nextAssessmentDate: data.nextAssessmentDate?.toDate() ?? null,
        assessmentFrequency: data.assessmentFrequency ?? 7,
        totalAssessments: data.totalAssessments ?? 0,
        averageScore: data.averageScore ?? 0,
        trend: data.trend ?? 'stable',
        notificationEnabled: data.notificationEnabled ?? true,
        notifications: data.notifications ?? {
          email: false,
          push: true,
          inApp: true
        }
      };
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }
  
  // ===== SALVAR AVALIAÇÃO =====
  
  async saveAssessment(
    studentId: string,
    answers: { q1: number; q2: number; q3: number; q4: number; q5: number; q6: number; q7: number },
    notes?: string
  ): Promise<{ success: boolean; assessmentId: string; score: number; severity: string }> {
    try {
      // Calcular pontuação
      const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
      const severity = this.calculateSeverity(score);
      
      // Verificar se é a primeira avaliação
      const studentConfig = await this.getStudentConfig(studentId);
      const isFirstAssessment = !studentConfig || studentConfig.totalAssessments === 0;
      
      // Calcular data da próxima avaliação (+7 dias)
      const completedAt = new Date();
      const nextAssessmentDate = new Date(completedAt);
      nextAssessmentDate.setDate(nextAssessmentDate.getDate() + 7);
      
      // Criar objeto de avaliação
      const assessment: Omit<GAD7Assessment, 'id'> = {
        studentId,
        answers,
        score,
        severity,
        completedAt,
        nextAssessmentDate,
        isFirstAssessment,
        status: 'completed',
        notes,
        context: {
          device: typeof window !== 'undefined' ? navigator.userAgent : 'server',
          browser: typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'unknown'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Salvar no Firestore
      const batch = writeBatch(firestore);
      
      // 1. Salvar avaliação
      const assessmentRef = doc(this.assessmentsCollection);
      batch.set(assessmentRef, {
        ...assessment,
        completedAt: Timestamp.fromDate(completedAt),
        nextAssessmentDate: Timestamp.fromDate(nextAssessmentDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // 2. Atualizar configuração do aluno
      const configRef = doc(this.studentConfigCollection, studentId);
      
      // Calcular nova média
      const totalAssessments = (studentConfig?.totalAssessments || 0) + 1;
      const currentAverage = studentConfig?.averageScore || 0;
      const newAverage = currentAverage === 0 
        ? score 
        : (currentAverage * (totalAssessments - 1) + score) / totalAssessments;
      
      // Determinar tendência
      const trend = this.calculateTrend(studentConfig?.averageScore || 0, score);
      
      batch.set(configRef, {
        studentId,
        requiresInitialAssessment: false,
        lastAssessmentDate: Timestamp.fromDate(completedAt),
        nextAssessmentDate: Timestamp.fromDate(nextAssessmentDate),
        assessmentFrequency: 7,
        totalAssessments: increment(1),
        averageScore: newAverage,
        trend,
        notificationEnabled: true,
        notifications: {
          email: false,
          push: true,
          inApp: true
        },
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      await batch.commit();
      
      // 3. Disparar evento de conclusão (para notificações, etc.)
      this.triggerAssessmentCompletion(studentId, score, severity, isFirstAssessment);
      
      return {
        success: true,
        assessmentId: assessmentRef.id,
        score,
        severity
      };
      
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      throw error;
    }
  }
  
  // ===== OBTER HISTÓRICO DE AVALIAÇÕES =====
  
  async getAssessmentHistory(studentId: string, limitCount: number = 10): Promise<GAD7Assessment[]> {
    try {
      const q = query(
        this.assessmentsCollection,
        where('studentId', '==', studentId),
        orderBy('completedAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          completedAt: data.completedAt.toDate(),
          nextAssessmentDate: data.nextAssessmentDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as GAD7Assessment;
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }
  
  // ===== FUNÇÕES AUXILIARES =====
  
  private calculateSeverity(score: number): 'minimal' | 'mild' | 'moderate' | 'severe' {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }
  
  private calculateTrend(previousAverage: number, currentScore: number): 'improving' | 'stable' | 'worsening' {
    if (previousAverage === 0) return 'stable';
    
    const difference = currentScore - previousAverage;
    
    if (difference < -2) return 'improving';
    if (difference > 2) return 'worsening';
    return 'stable';
  }
  
  private async triggerAssessmentCompletion(
    studentId: string,
    score: number,
    severity: string,
    isFirstAssessment: boolean
  ): Promise<void> {
    // Aqui você pode:
    // 1. Enviar notificação push
    // 2. Enviar email para o profissional
    // 3. Disparar webhook para integrações
    // 4. Atualizar dashboard do profissional
    
    console.log(`Avaliação GAD-7 concluída: ${studentId}, Score: ${score}, Severidade: ${severity}`);
    
    if (isFirstAssessment) {
      // Notificar profissionais sobre primeira avaliação
      await this.notifyProfessionals(studentId, score, severity);
    }
    
    if (severity === 'severe' || severity === 'moderate') {
      // Alertar profissionais sobre pontuação alta
      await this.alertHighScore(studentId, score, severity);
    }
  }
  
  private async notifyProfessionals(studentId: string, score: number, severity: string): Promise<void> {
    // Implementar notificação para profissionais responsáveis
    // Ex: Enviar para Firestore notifications collection
  }
  
  private async alertHighScore(studentId: string, score: number, severity: string): Promise<void> {
    // Alertar sobre pontuação preocupante
  }
  
  // ===== VERIFICAR NOTIFICAÇÕES =====
  
  async getPendingNotifications(studentId: string): Promise<{
    assessmentDue: boolean;
    overdueDays?: number;
    message?: string;
  }> {
    const check = await this.checkIfAssessmentRequired(studentId);
    
    if (!check.required) {
      return { assessmentDue: false };
    }
    
    let message = '';
    if (check.reason === 'first_time') {
      message = 'Complete sua primeira avaliação de ansiedade para personalizarmos sua experiência.';
    } else if (check.reason === 'overdue') {
      message = `Sua avaliação semanal está atrasada há ${check.daysUntilNext} dias.`;
    } else {
      message = 'Está na hora de fazer sua avaliação semanal de acompanhamento.';
    }
    
    return {
      assessmentDue: true,
      overdueDays: check.daysUntilNext === 0 ? 0 : undefined,
      message
    };
  }
  
  // ===== OBTER ESTATÍSTICAS =====
  
  async getStudentStats(studentId: string): Promise<{
    totalAssessments: number;
    averageScore: number;
    lastScore: number;
    lastSeverity: string;
    trend: string;
    nextAssessmentDate?: Date;
    improvementPercentage?: number;
  }> {
    const config = await this.getStudentConfig(studentId);
    const history = await this.getAssessmentHistory(studentId, 2);
    
    if (!config || history.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        lastScore: 0,
        lastSeverity: 'minimal',
        trend: 'stable',
        nextAssessmentDate: config?.nextAssessmentDate || undefined
      };
    }
    
    const lastAssessment = history[0];
    const previousAssessment = history[1];
    
    let improvementPercentage = 0;
    if (previousAssessment) {
      improvementPercentage = Math.round(
        ((previousAssessment.score - lastAssessment.score) / previousAssessment.score) * 100
      );
    }
    
    return {
      totalAssessments: config.totalAssessments,
      averageScore: config.averageScore,
      lastScore: lastAssessment.score,
      lastSeverity: lastAssessment.severity,
      trend: config.trend,
      nextAssessmentDate: config.nextAssessmentDate || undefined,
      improvementPercentage: previousAssessment ? improvementPercentage : undefined
    };
  }
}

export const gad7Service = new GAD7Service();