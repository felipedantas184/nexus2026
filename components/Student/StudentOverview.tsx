'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Student, Observation, Program } from '@/types';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';
import { programsService } from '@/lib/firebase/services/programsService';
import { 
  FaRocket, 
  FaChartLine, 
  FaCalendar, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaPlay,
  FaClock,
  FaBook,
  FaUserPlus,
  FaChartBar
} from 'react-icons/fa';

interface StudentOverviewProps {
  student: Student;
  observations: Observation[];
  programs: Program[];
  onObservationCreated: () => void;
}

interface ProgramProgress {
  program: Program;
  progress: number;
  completedActivities: number;
  totalActivities: number;
  nextActivity?: any;
}

export default function StudentOverview({ 
  student, 
  observations, 
  programs,
  onObservationCreated 
}: StudentOverviewProps) {
  const [programsProgress, setProgramsProgress] = useState<ProgramProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentProgress();
  }, [student.id, programs]);

  const loadStudentProgress = async () => {
    try {
      setIsLoading(true);
      
      // Buscar assignments do aluno
      const assignments = await assignmentService.getStudentAssignments(student.id);
      
      // Calcular progresso para cada programa
      const progressData = await Promise.all(
        assignments.map(async (assignment) => {
          const program = programs.find(p => p.id === assignment.programId);
          if (!program) return null;

          const progressInfo = await calculateProgramProgress(assignment, program);
          return {
            program,
            ...progressInfo
          };
        })
      );

      const validProgress = progressData.filter(Boolean) as ProgramProgress[];
      setProgramsProgress(validProgress);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgramProgress = async (
    assignment: any, 
    program: Program
  ): Promise<{ progress: number; completedActivities: number; totalActivities: number; nextActivity?: any }> => {
    // Calcular totais (igual ao seu exemplo)
    const totalActivities = program.modules?.reduce((total, module) => 
      total + (module.activities?.length || 0), 0) || 0;
    
    const completedActivities = assignment.progress?.completedActivities?.length || 0;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    // Encontrar próxima atividade não concluída
    let nextActivity = null;
    if (progress < 100) {
      for (const module of program.modules || []) {
        for (const activity of module.activities || []) {
          if (!assignment.progress?.completedActivities?.includes(activity.id)) {
            nextActivity = {
              ...activity,
              moduleId: module.id,
              moduleTitle: module.title
            };
            break;
          }
        }
        if (nextActivity) break;
      }
    }

    return { 
      progress, 
      completedActivities, 
      totalActivities,
      nextActivity 
    };
  };

  // Calcular métricas gerais
  const totalPoints = student.totalPoints || 0;
  const currentLevel = student.level || 1;
  const currentStreak = student.streak || 0;
  
  const activeProgramsCount = programsProgress.length;
  const completedProgramsCount = programsProgress.filter(p => p.progress === 100).length;
  const totalCompletedActivities = programsProgress.reduce((sum, p) => sum + p.completedActivities, 0);
  const overallProgress = activeProgramsCount > 0 
    ? Math.round(programsProgress.reduce((sum, p) => sum + p.progress, 0) / activeProgramsCount)
    : 0;

  const recentObservations = observations.slice(0, 3);
  const activePrograms = programsProgress.slice(0, 3);

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#10b981';
    if (progress >= 70) return '#f59e0b';
    if (progress >= 30) return '#6366f1';
    return '#ef4444';
  };

  const getProgressIcon = (progress: number) => {
    if (progress === 100) return FaCheckCircle;
    if (progress > 0) return FaPlay;
    return FaClock;
  };

  return (
    <Container>
      {/* Cards de Métricas */}
      <MetricsGrid>
        <MetricCard>
          <MetricIcon $color="#6366f1">
            <FaRocket />
          </MetricIcon>
          <MetricInfo>
            <MetricValue>{currentLevel}</MetricValue>
            <MetricLabel>Nível</MetricLabel>
          </MetricInfo>
        </MetricCard>

        <MetricCard>
          <MetricIcon $color="#10b981">
            <FaChartLine />
          </MetricIcon>
          <MetricInfo>
            <MetricValue>{totalPoints}</MetricValue>
            <MetricLabel>Pontos</MetricLabel>
          </MetricInfo>
        </MetricCard>

        <MetricCard>
          <MetricIcon $color="#f59e0b">
            <FaCalendar />
          </MetricIcon>
          <MetricInfo>
            <MetricValue>{currentStreak}</MetricValue>
            <MetricLabel>Dias Consecutivos</MetricLabel>
          </MetricInfo>
        </MetricCard>

        <MetricCard>
          <MetricIcon $color="#8b5cf6">
            <FaCheckCircle />
          </MetricIcon>
          <MetricInfo>
            <MetricValue>{overallProgress}%</MetricValue>
            <MetricLabel>Progresso Geral</MetricLabel>
          </MetricInfo>
        </MetricCard>
      </MetricsGrid>

      {/* Grid Principal */}
      <ContentGrid>
        {/* Programas Ativos */}
        <Section>
          <SectionHeader>
            <SectionTitle>Programas em Andamento</SectionTitle>
            <SectionCount>{activeProgramsCount}</SectionCount>
          </SectionHeader>
          
          {isLoading ? (
            <LoadingState>Carregando programas...</LoadingState>
          ) : activeProgramsCount === 0 ? (
            <EmptyState>
              <FaExclamationTriangle size={24} />
              <EmptyText>Nenhum programa ativo</EmptyText>
              <EmptyDescription>
                Atribua programas para acompanhar o progresso do aluno.
              </EmptyDescription>
            </EmptyState>
          ) : (
            <ProgramsList>
              {activePrograms.map(({ program, progress, completedActivities, totalActivities }) => {
                const ProgressIcon = getProgressIcon(progress);
                const progressColor = getProgressColor(progress);
                
                return (
                  <ProgramCard key={program.id}>
                    <ProgramHeader>
                      <ProgramIcon $color={program.color || '#6366f1'}>
                        {program.icon || '📚'}
                      </ProgramIcon>
                      <ProgramInfo>
                        <ProgramName>{program.title}</ProgramName>
                        <ProgramStats>
                          {completedActivities}/{totalActivities} atividades
                        </ProgramStats>
                      </ProgramInfo>
                      <ProgramProgress $color={progressColor}>
                        {progress}%
                      </ProgramProgress>
                    </ProgramHeader>
                    <ProgressBar>
                      <ProgressFill 
                        $progress={progress} 
                        $color={progressColor}
                      />
                    </ProgressBar>
                  </ProgramCard>
                );
              })}
            </ProgramsList>
          )}
        </Section>

        {/* Observações Recentes */}
        <Section>
          <SectionHeader>
            <SectionTitle>Observações Recentes</SectionTitle>
            <SectionCount>{observations.length}</SectionCount>
          </SectionHeader>

          {observations.length === 0 ? (
            <EmptyState>
              <FaExclamationTriangle size={24} />
              <EmptyText>Nenhuma observação</EmptyText>
              <EmptyDescription>
                Registre observações para acompanhar o desenvolvimento.
              </EmptyDescription>
            </EmptyState>
          ) : (
            <ObservationsList>
              {recentObservations.map(observation => (
                <ObservationItem key={observation.id}>
                  <ObservationHeader>
                    <Author>{observation.authorName}</Author>
                    <Time>
                      {new Date(observation.createdAt).toLocaleDateString('pt-BR')}
                    </Time>
                  </ObservationHeader>
                  <ObservationText>
                    {observation.text.length > 100 
                      ? `${observation.text.substring(0, 100)}...` 
                      : observation.text
                    }
                  </ObservationText>
                  <ObservationMeta>
                    <ObservationType $type={observation.authorType}>
                      {observation.authorType}
                    </ObservationType>
                    {observation.isPrivate && (
                      <PrivateBadge>Privada</PrivateBadge>
                    )}
                  </ObservationMeta>
                </ObservationItem>
              ))}
            </ObservationsList>
          )}
        </Section>

        {/* Ações Rápidas */}
        <Section>
          <SectionHeader>
            <SectionTitle>Ações Rápidas</SectionTitle>
          </SectionHeader>
          <ActionsGrid>
            <ActionCard onClick={onObservationCreated}>
              <ActionIcon $color="#6366f1">
                <FaUserPlus />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Nova Observação</ActionTitle>
                <ActionDescription>
                  Registrar observação sobre o aluno
                </ActionDescription>
              </ActionContent>
            </ActionCard>

            <ActionCard>
              <ActionIcon $color="#10b981">
                <FaChartBar />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Ver Progresso</ActionTitle>
                <ActionDescription>
                  Analisar progresso detalhado
                </ActionDescription>
              </ActionContent>
            </ActionCard>

            <ActionCard>
              <ActionIcon $color="#f59e0b">
                <FaBook />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Atribuir Programa</ActionTitle>
                <ActionDescription>
                  Adicionar novo programa ao aluno
                </ActionDescription>
              </ActionContent>
            </ActionCard>
          </ActionsGrid>
        </Section>

        {/* Estatísticas Rápidas */}
        <Section>
          <SectionHeader>
            <SectionTitle>Estatísticas</SectionTitle>
          </SectionHeader>
          <StatsGrid>
            <StatItem>
              <StatValue>{activeProgramsCount}</StatValue>
              <StatLabel>Programas Ativos</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{completedProgramsCount}</StatValue>
              <StatLabel>Programas Concluídos</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{totalCompletedActivities}</StatValue>
              <StatLabel>Atividades Concluídas</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{observations.length}</StatValue>
              <StatLabel>Observações</StatLabel>
            </StatItem>
          </StatsGrid>
        </Section>
      </ContentGrid>
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const MetricCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MetricIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const MetricInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const SectionCount = styled.span`
  background: #6366f1;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 20px;
  color: #64748b;
  font-style: italic;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
`;

const EmptyText = styled.div`
  font-weight: 600;
  margin: 12px 0 8px 0;
  color: #374151;
`;

const EmptyDescription = styled.div`
  font-size: 14px;
  line-height: 1.4;
`;

const ProgramsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProgramCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  }
`;

const ProgramHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ProgramIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const ProgramInfo = styled.div`
  flex: 1;
`;

const ProgramName = styled.div`
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const ProgramStats = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ProgramProgress = styled.div<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$color};
`;

const ProgressBar = styled.div`
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number; $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  border-radius: 3px;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const ObservationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ObservationItem = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  }
`;

const ObservationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Author = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
`;

const Time = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ObservationText = styled.p`
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 12px 0;
`;

const ObservationMeta = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ObservationType = styled.span<{ $type: string }>`
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
`;

const PrivateBadge = styled.span`
  background: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActionCard = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
    transform: translateY(-2px);
  }
`;

const ActionIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const ActionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
`;

const ActionDescription = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;