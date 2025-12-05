// app/student/programs/[id]/modules/[moduleId]/activities/[activityId]/page.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaSave,
  FaTrophy
} from 'react-icons/fa';
import { activitiesService } from '@/lib/firebase/services/activitiesService';
import { programsService } from '@/lib/firebase/services/programsService';
import { useActivityProgress } from '@/hooks/useActivityProgress';
import { Activity, StudentActivity } from '@/types/activity.types';

// Importar componentes de atividade específicos (serão criados a seguir)
import { QuizActivity } from '@/components/activities/QuizActivity';
import { VideoActivity } from '@/components/activities/VideoActivity';
import { HabitActivity } from '@/components/activities/HabitActivity';
import { TextActivity } from '@/components/activities/TextActivity';
import { ChecklistActivity } from '@/components/activities/ChecklistActivity';

export default function StudentActivityPage() {
  const params = useParams();
  const router = useRouter();
  const { student } = useAuth();
  
  const programId = params.id as string;
  const moduleId = params.moduleId as string;
  const activityId = params.activityId as string;

  const {
    activity,
    studentActivity,
    loading,
    error,
    startActivity,
    completeActivity,
    saveDraft,
    isCompleted,
    isInProgress
  } = useActivityProgress(activityId);

  const [localAnswers, setLocalAnswers] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Iniciar atividade quando carregada pela primeira vez
  useEffect(() => {
    if (activity && student?.id && !studentActivity && !isCompleted) {
      startActivity(programId, moduleId);
    }
  }, [activity, student?.id, studentActivity, isCompleted]);

  // Timer para tempo gasto
  useEffect(() => {
    if (isInProgress && !isCompleted) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 60000); // Atualiza a cada minuto

      return () => clearInterval(timer);
    }
  }, [isInProgress, isCompleted]);

  const handleSaveDraft = async (answers: any) => {
    try {
      setLocalAnswers(answers);
      await saveDraft(answers, timeSpent);
      // Feedback visual pode ser adicionado aqui
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    }
  };

  const handleCompleteActivity = async (answers: any, notes?: string) => {
    try {
      setIsSubmitting(true);
      const result = await completeActivity(answers, notes);
      
      // Feedback de sucesso
      console.log('Atividade concluída! Pontos:', result.pointsEarned);
      
      // Navegar para próxima atividade ou módulo
      setTimeout(() => {
        navigateToNext();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao completar atividade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToNext = () => {
    // Lógica para navegar para próxima atividade
    // Por enquanto, voltar para o módulo
    router.push(`/student/programs/${programId}/modules/${moduleId}`);
  };

  const renderActivityComponent = () => {
    if (!activity) return null;

    const commonProps = {
      activity: activity as any,
      studentActivity,
      onSaveDraft: handleSaveDraft,
      onComplete: handleCompleteActivity,
      isSubmitting
    };

    switch (activity.type) {
      case 'text':
        return <TextActivity {...commonProps} />;
      case 'quiz':
        return <QuizActivity {...commonProps} />;
      case 'checklist':
        return <ChecklistActivity {...commonProps} />;
      case 'video':
        return <VideoActivity {...commonProps} />;
      case 'habit':
        return <HabitActivity {...commonProps} />;
      default:
        return <div>Tipo de atividade não suportado: {activity.type}</div>;
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando atividade...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !activity) {
    return (
      <ErrorContainer>
        <ErrorTitle>
          {error || 'Atividade não encontrada'}
        </ErrorTitle>
        <ErrorDescription>
          {error || 'A atividade que você está tentando acessar não existe.'}
        </ErrorDescription>
        <ActionButton href={`/student/programs/${programId}/modules/${moduleId}`}>
          <FaArrowLeft size={16} />
          Voltar para o Módulo
        </ActionButton>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      {/* Header da Atividade */}
      <ActivityHeader $color={getActivityColor(activity.type)}>
        <HeaderContent>
          <BackButton href={`/student/programs/${programId}/modules/${moduleId}`}>
            <FaArrowLeft size={16} />
            Voltar para o Módulo
          </BackButton>

          <ActivityInfo>
            <ActivityTypeBadge $type={activity.type}>
              {getActivityTypeLabel(activity.type)}
            </ActivityTypeBadge>
            <ActivityTitle>{activity.title}</ActivityTitle>
            {activity.description && (
              <ActivityDescription>
                {activity.description}
              </ActivityDescription>
            )}
          </ActivityInfo>

          <ActivityStats>
            <Stat>
              <FaClock size={14} />
              {activity.estimatedTime}min
            </Stat>
            <Stat>
              <FaTrophy size={14} />
              {activity.points} pontos
            </Stat>
            {isCompleted && (
              <Stat $completed>
                <FaCheckCircle size={14} />
                Concluída
              </Stat>
            )}
          </ActivityStats>
        </HeaderContent>
      </ActivityHeader>

      {/* Conteúdo da Atividade */}
      <ActivityContent>
        {renderActivityComponent()}
      </ActivityContent>

      {/* Progresso e Navegação */}
      <ActivityFooter>
        <ProgressInfo>
          <TimeSpent>
            <FaClock size={14} />
            Tempo gasto: {Math.floor(timeSpent / 60)}h {timeSpent % 60}m
          </TimeSpent>
          
          {studentActivity?.startedAt && (
            <StartedAt>
              Iniciada em: {studentActivity.startedAt.toLocaleDateString('pt-BR')}
            </StartedAt>
          )}
        </ProgressInfo>

        <Navigation>
          <SaveDraftButton onClick={() => handleSaveDraft(localAnswers)}>
            <FaSave size={14} />
            Salvar Rascunho
          </SaveDraftButton>

          {isCompleted ? (
            <NextButton onClick={navigateToNext}>
              <FaArrowRight size={14} />
              Próxima Atividade
            </NextButton>
          ) : (
            <CompleteButton 
              onClick={() => handleCompleteActivity(localAnswers)}
              disabled={isSubmitting}
            >
              <FaCheckCircle size={14} />
              {isSubmitting ? 'Concluindo...' : 'Concluir Atividade'}
            </CompleteButton>
          )}
        </Navigation>
      </ActivityFooter>
    </Container>
  );
}

// Funções auxiliares
const getActivityColor = (type: string): string => {
  const colors = {
    text: '#6366f1',
    quiz: '#10b981',
    checklist: '#f59e0b',
    video: '#ef4444',
    habit: '#8b5cf6',
    file: '#64748b'
  };
  return colors[type as keyof typeof colors] || '#6366f1';
};

const getActivityTypeLabel = (type: string): string => {
  const labels = {
    text: 'Texto',
    quiz: 'Quiz',
    checklist: 'Checklist',
    video: 'Vídeo',
    habit: 'Hábito',
    file: 'Arquivo'
  };
  return labels[type as keyof typeof labels] || 'Atividade';
};

// ========== ESTILOS ==========
const Container = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ActivityHeader = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${props => props.$color}15, ${props => props.$color}08);
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
    color: #374151;
  }
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityTypeBadge = styled.span<{ $type: string }>`
  background: ${props => getActivityColor(props.$type)}20;
  color: ${props => getActivityColor(props.$type)};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActivityTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 12px 0 8px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const ActivityDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const ActivityStats = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-self: flex-start;

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const Stat = styled.div<{ $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${props => props.$completed ? '#10b981' : '#64748b'};
  font-weight: 500;
  background: ${props => props.$completed ? '#10b98115' : 'transparent'};
  padding: 6px 12px;
  border-radius: 8px;
`;

const ActivityContent = styled.div`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
`;

const ActivityFooter = styled.div`
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 20px 24px;
`;

const ProgressInfo = styled.div`
  max-width: 1200px;
  margin: 0 auto 16px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #64748b;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
`;

const TimeSpent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StartedAt = styled.div`
  font-weight: 500;
`;

const Navigation = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const SaveDraftButton = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
`;

const CompleteButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

const NextButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

// Estados de Loading e Error
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  min-height: 100vh;
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #64748b;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #f8fafc;
  min-height: 100vh;
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
`;

const ErrorDescription = styled.p`
  color: #64748b;
  margin-bottom: 20px;
`;

const ActionButton = styled(Link)`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;