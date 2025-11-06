// app/student/programs/[id]/page.tsx
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
  FaTrophy
} from 'react-icons/fa';
import { programsService } from '@/lib/firebase/services/programsService';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';
import { Program, Module, Activity } from '@/types';
import { Assignment } from '@/types/assignments.types';

interface ProgramWithProgress {
  program: Program;
  assignment: Assignment;
  moduleProgress: {
    [moduleId: string]: {
      completed: number;
      total: number;
      progress: number;
    };
  };
}

export default function StudentProgramPage() {
  const params = useParams();
  const router = useRouter();
  const { student } = useAuth();
  const [programData, setProgramData] = useState<ProgramWithProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const programId = params.id as string;

  useEffect(() => {
    if (student?.id && programId) {
      loadProgramData();
    }
  }, [student?.id, programId]);

  const loadProgramData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Buscar programa e assignment
      const [program, assignments] = await Promise.all([
        programsService.getProgramById(programId),
        assignmentService.getStudentAssignments(student!.id)
      ]);

      if (!program) {
        setError('Programa não encontrado');
        return;
      }

      // Encontrar assignment específico para este programa
      const assignment = assignments.find(a => a.programId === programId);

      if (!assignment) {
        setError('Você não tem acesso a este programa');
        return;
      }

      // Calcular progresso por módulo
      const moduleProgress = calculateModuleProgress(program, assignment);

      setProgramData({
        program,
        assignment,
        moduleProgress
      });

    } catch (error) {
      console.error('Erro ao carregar programa:', error);
      setError('Erro ao carregar o programa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateModuleProgress = (program: Program, assignment: Assignment) => {
    const progress: ProgramWithProgress['moduleProgress'] = {};

    program.modules?.forEach(module => {
      const totalActivities = module.activities?.length || 0;
      const completedActivities = module.activities?.filter(activity =>
        assignment.completedActivities?.includes(activity.id)
      ).length || 0;

      progress[module.id] = {
        completed: completedActivities,
        total: totalActivities,
        progress: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
      };
    });

    return progress;
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
    if (!programData) return 'locked';

    const isCompleted = programData.assignment.completedActivities.includes(activityId);
    return isCompleted ? 'completed' : 'available';
  };

  const handleStartActivity = (moduleId: string, activityId: string) => {
    // Navegar para a página da atividade
    router.push(`/student/programs/${programId}/modules/${moduleId}/activities/${activityId}`);
  };

  const getNextAvailableActivity = () => {
    if (!programData) return null;

    for (const module of programData.program.modules || []) {
      for (const activity of module.activities || []) {
        if (!programData.assignment.completedActivities.includes(activity.id)) {
          return {
            activity,
            moduleId: module.id,
            moduleTitle: module.title
          };
        }
      }
    }
    return null;
  };

  const nextActivity = getNextAvailableActivity();

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando programa...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !programData) {
    return (
      <ErrorContainer>
        <ErrorTitle>
          {error || 'Programa não encontrado'}
        </ErrorTitle>
        <ErrorDescription>
          {error || 'O programa que você está tentando acessar não existe.'}
        </ErrorDescription>
        <ActionButton href="/student/programs">
          <FaArrowLeft size={16} />
          Voltar para Programas
        </ActionButton>
      </ErrorContainer>
    );
  }

  const { program, assignment, moduleProgress } = programData;
  const totalProgress = program.modules?.reduce((total, module) =>
    total + (moduleProgress[module.id]?.progress || 0), 0) / (program.modules?.length || 1);

  return (
    <Container>
      {/* Header do Programa */}
      <ProgramHeader $color={program.color || '#6366f1'}>
        <HeaderContent>
          <BackButton href="/student/programs">
            <FaArrowLeft size={16} />
            Voltar
          </BackButton>

          <ProgramInfo>
            <ProgramIcon>{program.icon || '📚'}</ProgramIcon>
            <ProgramDetails>
              <ProgramTitle>{program.title}</ProgramTitle>
              <ProgramDescription>
                {program.description || 'Sem descrição disponível'}
              </ProgramDescription>
              <ProgramStats>
                <Stat>
                  <FaClock size={14} />
                  {program.estimatedDuration}min
                </Stat>
                <Stat>
                  <FaTrophy size={14} />
                  {program.modules?.reduce((total, module) =>
                    total + (module.activities?.reduce((sum, activity) =>
                      sum + (activity.points || 0), 0) || 0), 0) || 0} pontos
                </Stat>
                <Stat>
                  {program.modules?.length || 0} módulos
                </Stat>
              </ProgramStats>
            </ProgramDetails>
          </ProgramInfo>

          {nextActivity && (
            <ContinueButton
              onClick={() => handleStartActivity(nextActivity.moduleId, nextActivity.activity.id)}
            >
              <FaPlay size={16} />
              {assignment.completedActivities.length === 0 ? 'Começar' : 'Continuar'}
            </ContinueButton>
          )}
        </HeaderContent>

        {/* Progresso Geral */}
        <ProgressSection>
          <ProgressInfo>
            <ProgressLabel>Progresso Geral</ProgressLabel>
            <ProgressValue>{Math.round(totalProgress)}%</ProgressValue>
          </ProgressInfo>
          <ProgressBar>
            <ProgressFill
              $progress={totalProgress}
              $color={program.color}
            />
          </ProgressBar>
          <ActivitiesSummary>
            {assignment.completedActivities.length || 0} atividades concluídas
          </ActivitiesSummary>
        </ProgressSection>
      </ProgramHeader>

      {/* Lista de Módulos */}
      <ModulesContainer>
        <SectionTitle>Módulos do Programa</SectionTitle>

        {program.modules?.map((module, moduleIndex) => (
          <ModuleCard key={module.id} $locked={module.isLocked}>
            <ModuleHeader>
              <ModuleInfo>
                <ModuleNumber>Módulo {moduleIndex + 1}</ModuleNumber>
                <ModuleTitle>{module.title}</ModuleTitle>
                <ModuleDescription>
                  {module.description}
                </ModuleDescription>
                <ModuleStats>
                  {moduleProgress[module.id]?.completed || 0} de {moduleProgress[module.id]?.total || 0} atividades •
                  {module.activities?.reduce((total, activity) => total + (activity.estimatedTime || 0), 0)}min
                </ModuleStats>
              </ModuleInfo>

              <ModuleStatus>
                {module.isLocked ? (
                  <LockedStatus>
                    <FaLock size={14} />
                    Bloqueado
                  </LockedStatus>
                ) : moduleProgress[module.id]?.progress === 100 ? (
                  <CompletedStatus>
                    <FaCheckCircle size={14} />
                    Concluído
                  </CompletedStatus>
                ) : (
                  <ProgressStatus>
                    {moduleProgress[module.id]?.progress || 0}%
                  </ProgressStatus>
                )}
              </ModuleStatus>
            </ModuleHeader>

            {!module.isLocked && (
              <ActivitiesList>
                {module.activities?.map((activity, activityIndex) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const status = getActivityStatus(activity.id);
                  const isCompleted = status === 'completed';

                  return (
                    <ActivityItem
                      key={activity.id}
                      $completed={isCompleted}
                      $clickable={!isCompleted}
                      onClick={() => !isCompleted && handleStartActivity(module.id, activity.id)}
                    >
                      <ActivityIndicator $completed={isCompleted}>
                        {isCompleted ? (
                          <FaCheckCircle size={16} />
                        ) : (
                          <ActivityNumber>{activityIndex + 1}</ActivityNumber>
                        )}
                      </ActivityIndicator>

                      <ActivityContent>
                        <ActivityHeader>
                          <ActivityTitle>
                            <ActivityIcon size={14} />
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
                      </ActivityContent>

                      <ActivityAction>
                        {isCompleted ? (
                          <CompletedLabel>
                            Concluída
                          </CompletedLabel>
                        ) : (
                          <StartButton>
                            <FaPlay size={12} />
                            Iniciar
                          </StartButton>
                        )}
                      </ActivityAction>
                    </ActivityItem>
                  );
                })}
              </ActivitiesList>
            )}

            {module.isLocked && (
              <LockedMessage>
                <FaLock size={16} />
                Este módulo será desbloqueado após a conclusão do módulo anterior
              </LockedMessage>
            )}
          </ModuleCard>
        ))}

        {(!program.modules || program.modules.length === 0) && (
          <EmptyModules>
            <EmptyIcon>📚</EmptyIcon>
            <EmptyTitle>Nenhum módulo disponível</EmptyTitle>
            <EmptyDescription>
              Este programa ainda não possui módulos configurados.
            </EmptyDescription>
          </EmptyModules>
        )}
      </ModulesContainer>
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  background: #f8fafc;
  min-height: 100vh;
`;

const ProgramHeader = styled.div<{ $color: string }>`
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

const ProgramInfo = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProgramIcon = styled.div`
  font-size: 48px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const ProgramDetails = styled.div`
  flex: 1;
`;

const ProgramTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ProgramDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ProgramStats = styled.div`
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

const ModulesContainer = styled.div`
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

const ModuleCard = styled.div<{ $locked: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  opacity: ${props => props.$locked ? 0.6 : 1};
`;

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
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

const ModuleTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const ModuleDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const ModuleStats = styled.div`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
`;

const ModuleStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const LockedStatus = styled.span`
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CompletedStatus = styled.span`
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressStatus = styled.span`
  color: #6366f1;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div<{ $completed: boolean; $clickable: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.$completed ? '#f0fdf4' : '#f8fafc'};
  border: 1px solid ${props => props.$completed ? '#dcfce7' : '#e2e8f0'};
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  &:hover {
    ${props => props.$clickable && `
      border-color: #6366f1;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
    `}
  }
`;

const ActivityIndicator = styled.div<{ $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.$completed ? '#10b981' : '#e2e8f0'};
  color: ${props => props.$completed ? 'white' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ActivityNumber = styled.span`
  font-size: 12px;
  font-weight: 600;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const ActivityTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActivityPoints = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 12px;
  flex-shrink: 0;
`;

const ActivityDetails = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const ActivityType = styled.span`
  text-transform: capitalize;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 12px;
`;

const ActivityTime = styled.span`
  font-weight: 500;
`;

const RequiredBadge = styled.span`
  background: #fef2f2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

const ActivityDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
  line-height: 1.4;
`;

const ActivityAction = styled.div`
  flex-shrink: 0;
`;

const CompletedLabel = styled.span`
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
  background: #dcfce7;
  padding: 6px 12px;
  border-radius: 20px;
`;

const StartButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #4f46e5;
    transform: translateY(-1px);
  }
`;

const LockedMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  justify-content: center;
`;

const EmptyModules = styled.div`
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