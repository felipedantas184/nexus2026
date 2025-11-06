// app/student/programs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaBook,
  FaArrowRight,
  FaTrophy,
  FaFire
} from 'react-icons/fa';
import { programsService } from '@/lib/firebase/services/programsService';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';
import { Program } from '@/types';
import { Assignment } from '@/types/assignments.types';

interface ProgramWithProgress {
  program: Program;
  assignment: Assignment;
  progress: number;
  completedActivities: number;
  totalActivities: number;
  nextActivity?: any;
}

export default function StudentProgramsPage() {
  const { student } = useAuth();
  const [programs, setPrograms] = useState<ProgramWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student?.id) {
      loadStudentPrograms();
    }
  }, [student?.id]);

  const loadStudentPrograms = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Buscar assignments do aluno
      const assignments = await assignmentService.getStudentAssignments(student!.id);
      
      // Para cada assignment, buscar dados do programa e calcular progresso
      const programsWithProgress = await Promise.all(
        assignments.map(async (assignment) => {
          const program = await programsService.getProgramById(assignment.programId);
          const progressData = await calculateProgramProgress(assignment, program);
          
          return {
            program,
            assignment,
            ...progressData
          };
        })
      );

      // Filtrar programas não nulos e ordenar por progresso
      const validPrograms = programsWithProgress
        .filter(p => p.program !== null)
        .sort((a, b) => b.progress - a.progress) as ProgramWithProgress[];

      setPrograms(validPrograms);
    } catch (error) {
      console.error('Erro ao carregar programas:', error);
      setError('Erro ao carregar seus programas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgramProgress = async (
    assignment: Assignment, 
    program: Program | null
  ): Promise<{ progress: number; completedActivities: number; totalActivities: number; nextActivity?: any }> => {
    if (!program) {
      return { progress: 0, completedActivities: 0, totalActivities: 0 };
    }

    // Calcular totais
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

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando seus programas...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorTitle>Erro ao carregar programas</ErrorTitle>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={loadStudentPrograms}>
          Tentar Novamente
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Meus Programas</Title>
          <Subtitle>
            Continue de onde parou ou comece um novo programa
          </Subtitle>
        </TitleSection>

        <StatsOverview>
          <Stat>
            <StatNumber>{programs.length}</StatNumber>
            <StatLabel>Programas</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>
              {programs.filter(p => p.progress === 100).length}
            </StatNumber>
            <StatLabel>Concluídos</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>
              {programs.reduce((total, p) => total + p.completedActivities, 0)}
            </StatNumber>
            <StatLabel>Atividades</StatLabel>
          </Stat>
        </StatsOverview>
      </Header>

      {programs.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaBook size={48} />
          </EmptyIcon>
          <EmptyTitle>Nenhum programa atribuído</EmptyTitle>
          <EmptyDescription>
            Aguarde seu professor atribuir um programa para você começar.
          </EmptyDescription>
        </EmptyState>
      ) : (
        <ProgramsGrid>
          {programs.map(({ program, assignment, progress, completedActivities, totalActivities, nextActivity }) => {
            const ProgressIcon = getProgressIcon(progress);
            const progressColor = getProgressColor(progress);
            
            return (
              <ProgramCard key={program.id}>
                <ProgramHeader $color={program.color || '#6366f1'}>
                  <ProgramIcon>{program.icon || '📚'}</ProgramIcon>
                  <ProgramInfo>
                    <ProgramTitle>{program.title}</ProgramTitle>
                    <ProgramDescription>
                      {program.description || 'Sem descrição disponível'}
                    </ProgramDescription>
                  </ProgramInfo>
                  <ProgramStatus $progress={progress}>
                    {progress === 100 ? (
                      <StatusComplete>
                        <FaCheckCircle size={14} />
                        Concluído
                      </StatusComplete>
                    ) : (
                      <StatusProgress>
                        <ProgressIcon size={14} />
                        {progress}%
                      </StatusProgress>
                    )}
                  </ProgramStatus>
                </ProgramHeader>

                <ProgressSection>
                  <ProgressInfo>
                    <ProgressLabel>Seu Progresso</ProgressLabel>
                    <ProgressValue>{progress}%</ProgressValue>
                  </ProgressInfo>
                  <ProgressBar>
                    <ProgressFill 
                      $progress={progress} 
                      $color={progressColor}
                    />
                  </ProgressBar>
                  <ActivitiesCount>
                    {completedActivities} de {totalActivities} atividades
                  </ActivitiesCount>
                </ProgressSection>

                {nextActivity && (
                  <NextActivity>
                    <NextActivityLabel>Próxima Atividade:</NextActivityLabel>
                    <NextActivityTitle>
                      {nextActivity.title}
                    </NextActivityTitle>
                    <NextActivityModule>
                      Módulo: {nextActivity.moduleTitle}
                    </NextActivityModule>
                  </NextActivity>
                )}

                {program.tags && program.tags.length > 0 && (
                  <ProgramTags>
                    {program.tags.slice(0, 3).map((tag, index) => (
                      <Tag key={index}>#{tag}</Tag>
                    ))}
                  </ProgramTags>
                )}

                <ProgramActions>
                  <ActionButton 
                    href={`/student/programs/${program.id}`}
                    $color={program.color}
                    $primary
                  >
                    {progress === 0 ? (
                      <>
                        <FaPlay size={14} />
                        Começar
                      </>
                    ) : progress === 100 ? (
                      <>
                        <FaCheckCircle size={14} />
                        Revisar
                      </>
                    ) : (
                      <>
                        <FaArrowRight size={14} />
                        Continuar
                      </>
                    )}
                  </ActionButton>
                  
                  <ActionButton 
                    href={`/student/programs/${program.id}/progress`}
                    $secondary
                  >
                    <FaTrophy size={14} />
                    Progresso
                  </ActionButton>
                </ProgramActions>
              </ProgramCard>
            );
          })}
        </ProgramsGrid>
      )}
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const TitleSection = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const Stat = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const ProgramsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProgramCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ProgramHeader = styled.div<{ $color: string }>`
  background: ${props => props.$color}15;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
`;

const ProgramIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
`;

const ProgramInfo = styled.div``;

const ProgramTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const ProgramDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
`;

const ProgramStatus = styled.div<{ $progress: number }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$progress === 100 ? '#10b981' : '#6366f1'};
  margin-top: 12px;
`;

const StatusComplete = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusProgress = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressSection = styled.div`
  padding: 20px;
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
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number; $color: string }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: ${props => props.$color};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ActivitiesCount = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: center;
`;

const NextActivity = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin: 0 20px 20px 20px;
`;

const NextActivityLabel = styled.div`
  font-size: 12px;
  color: #0369a1;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NextActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
`;

const NextActivityModule = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ProgramTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 20px 20px;
`;

const Tag = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const ProgramActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 20px 20px 20px;
`;

const ActionButton = styled(Link)<{ $primary?: boolean; $secondary?: boolean; $color?: string }>`
  flex: 1;
  background: ${props => {
    if (props.$primary) return props.$color || 'linear-gradient(135deg, #6366f1, #4f46e5)';
    if (props.$secondary) return '#f8fafc';
    return '#f8fafc';
  }};
  color: ${props => props.$primary ? 'white' : '#374151'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$primary 
      ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)'
    };
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
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
`;

const ErrorMessage = styled.p`
  color: #64748b;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;