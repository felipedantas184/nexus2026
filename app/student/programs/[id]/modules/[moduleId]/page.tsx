// app/student/programs/[id]/modules/[moduleId]/page.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaPlay,
  FaCheckCircle,
  FaLock,
  FaClock,
  FaBook,
  FaList,
  FaVideo,
  FaQuestionCircle,
  FaFile,
  FaSync,
  FaStar,
  FaTrophy,
  FaArrowRight
} from 'react-icons/fa';
import { programsService } from '@/lib/firebase/services/programsService';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';
import { Program, Module, Activity } from '@/types';
import { Assignment } from '@/types/assignments.types';

interface ModuleWithProgress {
  module: Module;
  program: Program;
  assignment: Assignment;
  progress: number;
  completedActivities: number;
  totalActivities: number;
}

export default function StudentModulePage() {
  const params = useParams();
  const router = useRouter();
  const { student } = useAuth();
  const [moduleData, setModuleData] = useState<ModuleWithProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const programId = params.id as string;
  const moduleId = params.moduleId as string;

  useEffect(() => {
    if (student?.id && programId && moduleId) {
      loadModuleData();
    }
  }, [student?.id, programId, moduleId]);

  const loadModuleData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Buscar programa completo
      const program = await programsService.getProgramById(programId);
      if (!program) {
        setError('Programa não encontrado');
        return;
      }

      // Buscar assignment do aluno
      const assignments = await assignmentService.getStudentAssignments(student!.id);
      const assignment = assignments.find(a => a.programId === programId);
      
      if (!assignment) {
        setError('Você não tem acesso a este programa');
        return;
      }

      // Encontrar módulo específico
      const module = program.modules?.find(m => m.id === moduleId);
      if (!module) {
        setError('Módulo não encontrado');
        return;
      }

      // Calcular progresso do módulo
      const totalActivities = module.activities?.length || 0;
      const completedActivities = module.activities?.filter(activity =>
        assignment.completedActivities?.includes(activity.id)
      ).length || 0;
      const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

      setModuleData({
        module,
        program,
        assignment,
        progress,
        completedActivities,
        totalActivities
      });

    } catch (error) {
      console.error('Erro ao carregar módulo:', error);
      setError('Erro ao carregar o módulo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'text': return FaFile;
      case 'checklist': return FaList;
      case 'video': return FaVideo;
      case 'quiz': return FaQuestionCircle;
      case 'file': return FaBook;
      case 'habit': return FaSync;
      default: return FaStar;
    }
  };

  const getActivityStatus = (activityId: string) => {
    if (!moduleData) return 'locked';
    return moduleData.assignment.completedActivities.includes(activityId) ? 'completed' : 'available';
  };

  const handleStartActivity = (activityId: string) => {
    router.push(`/student/programs/${programId}/modules/${moduleId}/activities/${activityId}`);
  };

  const getNextActivity = () => {
    if (!moduleData) return null;

    for (const activity of moduleData.module.activities || []) {
      if (!moduleData.assignment.completedActivities.includes(activity.id)) {
        return activity;
      }
    }
    return null;
  };

  const nextActivity = getNextActivity();

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando módulo...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !moduleData) {
    return (
      <ErrorContainer>
        <ErrorTitle>
          {error || 'Módulo não encontrado'}
        </ErrorTitle>
        <ErrorDescription>
          {error || 'O módulo que você está tentando acessar não existe.'}
        </ErrorDescription>
        <ActionButton href={`/student/programs/${programId}`}>
          <FaArrowLeft size={16} />
          Voltar para o Programa
        </ActionButton>
      </ErrorContainer>
    );
  }

  const { module, program, progress, completedActivities, totalActivities } = moduleData;

  return (
    <Container>
      {/* Header do Módulo */}
      <ModuleHeader $color={program.color || '#6366f1'}>
        <HeaderContent>
          <BackButton href={`/student/programs/${programId}`}>
            <FaArrowLeft size={16} />
            Voltar para o Programa
          </BackButton>

          <ModuleInfo>
            <ModuleNumber>Módulo {program.modules?.findIndex(m => m.id === moduleId) + 1}</ModuleNumber>
            <ModuleTitle>{module.title}</ModuleTitle>
            <ModuleDescription>
              {module.description || 'Sem descrição disponível'}
            </ModuleDescription>
            <ModuleStats>
              <Stat>
                <FaClock size={14} />
                {module.activities?.reduce((total, activity) => total + (activity.estimatedTime || 0), 0)}min
              </Stat>
              <Stat>
                <FaTrophy size={14} />
                {module.activities?.reduce((total, activity) => total + (activity.points || 0), 0) || 0} pontos
              </Stat>
              <Stat>
                {completedActivities} de {totalActivities} atividades
              </Stat>
            </ModuleStats>
          </ModuleInfo>

          {nextActivity && (
            <ContinueButton onClick={() => handleStartActivity(nextActivity.id)}>
              <FaPlay size={16} />
              {completedActivities === 0 ? 'Começar Módulo' : 'Continuar'}
            </ContinueButton>
          )}
        </HeaderContent>

        {/* Progresso do Módulo */}
        <ProgressSection>
          <ProgressInfo>
            <ProgressLabel>Progresso do Módulo</ProgressLabel>
            <ProgressValue>{progress}%</ProgressValue>
          </ProgressInfo>
          <ProgressBar>
            <ProgressFill
              $progress={progress}
              $color={program.color}
            />
          </ProgressBar>
          <ActivitiesSummary>
            {completedActivities} de {totalActivities} atividades concluídas
          </ActivitiesSummary>
        </ProgressSection>
      </ModuleHeader>

      {/* Lista de Atividades */}
      <ActivitiesContainer>
        <SectionTitle>Atividades do Módulo</SectionTitle>

        {module.activities?.map((activity, index) => {
          const ActivityIcon = getActivityIcon(activity.type);
          const status = getActivityStatus(activity.id);
          const isCompleted = status === 'completed';

          return (
            <ActivityCard
              key={activity.id}
              $completed={isCompleted}
              $clickable={!isCompleted}
              onClick={() => !isCompleted && handleStartActivity(activity.id)}
            >
              <ActivityIndicator $completed={isCompleted}>
                {isCompleted ? (
                  <FaCheckCircle size={20} />
                ) : (
                  <ActivityNumber>{index + 1}</ActivityNumber>
                )}
              </ActivityIndicator>

              <ActivityContent>
                <ActivityHeader>
                  <ActivityTitle>
                    <ActivityIcon size={16} />
                    {activity.title}
                  </ActivityTitle>
                  <ActivityPoints>
                    {activity.points} pts
                  </ActivityPoints>
                </ActivityHeader>

                <ActivityDetails>
                  <ActivityType>{activity.type}</ActivityType>
                  <ActivityTime>{activity.estimatedTime}min</ActivityTime>
                  {activity.isRequired && <RequiredBadge>Obrigatória</RequiredBadge>}
                </ActivityDetails>

                {activity.description && (
                  <ActivityDescription>
                    {activity.description}
                  </ActivityDescription>
                )}

                {activity.instructions && (
                  <ActivityInstructions>
                    {activity.instructions}
                  </ActivityInstructions>
                )}
              </ActivityContent>

              <ActivityAction>
                {isCompleted ? (
                  <CompletedLabel>
                    <FaCheckCircle size={14} />
                    Concluída
                  </CompletedLabel>
                ) : (
                  <StartButton>
                    <FaArrowRight size={14} />
                    Iniciar
                  </StartButton>
                )}
              </ActivityAction>
            </ActivityCard>
          );
        })}

        {(!module.activities || module.activities.length === 0) && (
          <EmptyActivities>
            <EmptyIcon>📝</EmptyIcon>
            <EmptyTitle>Nenhuma atividade disponível</EmptyTitle>
            <EmptyDescription>
              Este módulo ainda não possui atividades configuradas.
            </EmptyDescription>
          </EmptyActivities>
        )}
      </ActivitiesContainer>
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  background: #f8fafc;
  min-height: 100vh;
`;

const ModuleHeader = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${props => props.$color}15, ${props => props.$color}08);
  padding: 32px 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
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

const ModuleInfo = styled.div`
  flex: 1;
`;

const ModuleNumber = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 8px;
`;

const ModuleTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ModuleDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ModuleStats = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  align-self: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ProgressSection = styled.div`
  max-width: 1200px;
  margin: 32px auto 0 auto;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const ProgressValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number; $color: string }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, ${props => props.$color}, ${props => props.$color}aa);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ActivitiesSummary = styled.div`
  font-size: 14px;
  color: #64748b;
  text-align: center;
`;

const ActivitiesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 24px 0;
`;

const ActivityCard = styled.div<{ $completed: boolean; $clickable: boolean }>`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: ${props => props.$completed ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => props.$completed ? '#dcfce7' : '#f1f5f9'};
  border-radius: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  &:hover {
    ${props => props.$clickable && `
      border-color: #6366f1;
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
    `}
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

const ActivityIndicator = styled.div<{ $completed: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$completed ? '#10b981' : '#e2e8f0'};
  color: ${props => props.$completed ? 'white' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ActivityNumber = styled.span`
  font-size: 16px;
  font-weight: 700;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ActivityTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActivityPoints = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #f59e0b;
  background: #fef3c7;
  padding: 6px 12px;
  border-radius: 20px;
  flex-shrink: 0;
`;

const ActivityDetails = styled.div`
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const ActivityType = styled.span`
  text-transform: capitalize;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
`;

const ActivityTime = styled.span`
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RequiredBadge = styled.span`
  background: #fef2f2;
  color: #dc2626;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
`;

const ActivityDescription = styled.p`
  font-size: 15px;
  color: #64748b;
  margin: 8px 0;
  line-height: 1.5;
`;

const ActivityInstructions = styled.p`
  font-size: 14px;
  color: #94a3b8;
  font-style: italic;
  margin: 4px 0 0 0;
  line-height: 1.4;
`;

const ActivityAction = styled.div`
  flex-shrink: 0;
`;

const CompletedLabel = styled.span`
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
  background: #dcfce7;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const EmptyActivities = styled.div`
  text-align: center;
  padding: 60px 20px;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  background: white;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
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