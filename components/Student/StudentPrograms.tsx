'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Student, Program } from '@/types';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';
import { 
  FaPlay, 
  FaCheckCircle, 
  FaClock, 
  FaBook, 
  FaChartLine,
  FaExclamationTriangle,
  FaArrowRight,
  FaPause,
  FaPlayCircle
} from 'react-icons/fa';

interface StudentProgramsProps {
  student: Student;
  programs: Program[];
}

interface ProgramWithProgress {
  program: Program;
  assignment: any;
  progress: number;
  completedActivities: number;
  totalActivities: number;
  nextActivity?: any;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export default function StudentPrograms({ student, programs }: StudentProgramsProps) {
  const [programsProgress, setProgramsProgress] = useState<ProgramWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  useEffect(() => {
    loadStudentPrograms();
  }, [student.id, programs]);

  const loadStudentPrograms = async () => {
    try {
      setIsLoading(true);
      
      // Buscar assignments do aluno
      const assignments = await assignmentService.getStudentAssignments(student.id);
      
      // Para cada assignment, buscar dados do programa e calcular progresso
      const programsWithProgress = await Promise.all(
        assignments.map(async (assignment) => {
          const program = programs.find(p => p.id === assignment.programId);
          if (!program) return null;

          const progressData = await calculateProgramProgress(assignment, program);
          
          return {
            program,
            assignment,
            ...progressData,
            status: assignment.status || 'active'
          };
        })
      );

      const validPrograms = programsWithProgress.filter(Boolean) as ProgramWithProgress[];
      setProgramsProgress(validPrograms);
    } catch (error) {
      console.error('Erro ao carregar programas do aluno:', error);
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

  // Filtrar programas
  const filteredPrograms = programsProgress.filter(program => {
    if (filter === 'all') return true;
    if (filter === 'completed') return program.progress === 100;
    if (filter === 'active') return program.progress < 100 && program.status === 'active';
    if (filter === 'paused') return program.status === 'paused';
    return true;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return FaPlayCircle;
      case 'paused': return FaPause;
      case 'completed': return FaCheckCircle;
      default: return FaClock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'completed': return '#6366f1';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'completed': return 'Concluído';
      default: return 'Pendente';
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Carregando programas do aluno...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Header com Filtros */}
      <Header>
        <TitleSection>
          <Title>Programas do Aluno</Title>
          <Subtitle>
            Acompanhe o progresso de {student.name} nos programas atribuídos
          </Subtitle>
        </TitleSection>

        <StatsOverview>
          <Stat>
            <StatNumber>{programsProgress.length}</StatNumber>
            <StatLabel>Total</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>
              {programsProgress.filter(p => p.progress === 100).length}
            </StatNumber>
            <StatLabel>Concluídos</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>
              {programsProgress.filter(p => p.progress < 100 && p.status === 'active').length}
            </StatNumber>
            <StatLabel>Em Andamento</StatLabel>
          </Stat>
        </StatsOverview>
      </Header>

      {/* Filtros */}
      <FilterSection>
        <FilterLabel>Filtrar por:</FilterLabel>
        <FilterButtons>
          <FilterButton 
            $active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Todos
          </FilterButton>
          <FilterButton 
            $active={filter === 'active'}
            onClick={() => setFilter('active')}
          >
            Em Andamento
          </FilterButton>
          <FilterButton 
            $active={filter === 'completed'}
            onClick={() => setFilter('completed')}
          >
            Concluídos
          </FilterButton>
          <FilterButton 
            $active={filter === 'paused'}
            onClick={() => setFilter('paused')}
          >
            Pausados
          </FilterButton>
        </FilterButtons>
      </FilterSection>

      {/* Lista de Programas */}
      {filteredPrograms.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaBook size={48} />
          </EmptyIcon>
          <EmptyTitle>
            {filter === 'all' ? 'Nenhum programa atribuído' : `Nenhum programa ${filter}`}
          </EmptyTitle>
          <EmptyDescription>
            {filter === 'all' 
              ? 'Atribua programas para acompanhar o progresso do aluno.'
              : `Não há programas ${filter} no momento.`
            }
          </EmptyDescription>
        </EmptyState>
      ) : (
        <ProgramsGrid>
          {filteredPrograms.map(({ program, assignment, progress, completedActivities, totalActivities, nextActivity, status }) => {
            const ProgressIcon = getProgressIcon(progress);
            const StatusIcon = getStatusIcon(status);
            const progressColor = getProgressColor(progress);
            const statusColor = getStatusColor(status);
            
            return (
              <ProgramCard key={program.id}>
                <ProgramHeader>
                  <ProgramInfo>
                    <ProgramIcon $color={program.color || '#6366f1'}>
                      {program.icon || '📚'}
                    </ProgramIcon>
                    <ProgramDetails>
                      <ProgramTitle>{program.title}</ProgramTitle>
                      <ProgramDescription>
                        {program.description || 'Sem descrição disponível'}
                      </ProgramDescription>
                      <ProgramMeta>
                        <MetaItem>
                          <FaBook size={12} />
                          {program.modules?.length || 0} módulos
                        </MetaItem>
                        <MetaItem>
                          <FaChartLine size={12} />
                          {totalActivities} atividades
                        </MetaItem>
                      </ProgramMeta>
                    </ProgramDetails>
                  </ProgramInfo>
                  
                  <ProgramStatus $color={statusColor}>
                    <StatusIcon size={14} />
                    {getStatusLabel(status)}
                  </ProgramStatus>
                </ProgramHeader>

                {/* Progresso */}
                <ProgressSection>
                  <ProgressHeader>
                    <ProgressLabel>Progresso do Aluno</ProgressLabel>
                    <ProgressValue $color={progressColor}>
                      {progress}%
                    </ProgressValue>
                  </ProgressHeader>
                  <ProgressBar>
                    <ProgressFill 
                      $progress={progress} 
                      $color={progressColor}
                    />
                  </ProgressBar>
                  <ProgressStats>
                    <ProgressStat>
                      <ProgressIcon size={12} />
                      {completedActivities} de {totalActivities} concluídas
                    </ProgressStat>
                    {assignment.assignedAt && (
                      <ProgressStat>
                        Atribuído em {assignment.assignedAt.toLocaleDateString('pt-BR')}
                      </ProgressStat>
                    )}
                  </ProgressStats>
                </ProgressSection>

                {/* Próxima Atividade */}
                {nextActivity && status === 'active' && (
                  <NextActivitySection>
                    <NextActivityLabel>Próxima Atividade:</NextActivityLabel>
                    <NextActivityInfo>
                      <NextActivityTitle>
                        {nextActivity.title}
                      </NextActivityTitle>
                      <NextActivityModule>
                        Módulo: {nextActivity.moduleTitle}
                      </NextActivityModule>
                    </NextActivityInfo>
                  </NextActivitySection>
                )}

                {/* Tags do Programa */}
                {program.tags && program.tags.length > 0 && (
                  <ProgramTags>
                    {program.tags.slice(0, 3).map((tag, index) => (
                      <Tag key={index}>#{tag}</Tag>
                    ))}
                    {program.tags.length > 3 && (
                      <TagMore>+{program.tags.length - 3}</TagMore>
                    )}
                  </ProgramTags>
                )}

                {/* Ações */}
                <ProgramActions>
                  <ViewDetailsButton>
                    <FaArrowRight size={12} />
                    Ver Detalhes
                  </ViewDetailsButton>
                  
                  <ProgressButton $color={progressColor}>
                    <FaChartLine size={12} />
                    Progresso Detalhado
                  </ProgressButton>
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
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 14px;
`;

const StatsOverview = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 640px) {
    gap: 16px;
  }
`;

const Stat = styled.div`
  text-align: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  min-width: 80px;
`;

const StatNumber = styled.div`
  font-size: 20px;
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

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLabel = styled.span`
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$active ? '#6366f1' : '#d1d5db'};
  background: ${props => props.$active ? '#6366f1' : 'white'};
  color: ${props => props.$active ? 'white' : '#374151'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
    background: ${props => props.$active ? '#4f46e5' : '#f8fafc'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const LoadingText = styled.div`
  color: #64748b;
  font-size: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

const ProgramsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
`;

const ProgramCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProgramHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
`;

const ProgramInfo = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
`;

const ProgramIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const ProgramDetails = styled.div`
  flex: 1;
`;

const ProgramTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const ProgramDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.4;
  margin: 0 0 12px 0;
`;

const ProgramMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #64748b;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProgramStatus = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}30;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const ProgressSection = styled.div`
  margin-bottom: 20px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 14px;
  color: #374151;
  font-weight: 500;
`;

const ProgressValue = styled.span<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$color};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number; $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  border-radius: 4px;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
`;

const ProgressStat = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NextActivitySection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const NextActivityLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NextActivityInfo = styled.div``;

const NextActivityTitle = styled.div`
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const NextActivityModule = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ProgramTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

const TagMore = styled.span`
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

const ProgramActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ViewDetailsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const ProgressButton = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}30;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$color}25;
  }
`;