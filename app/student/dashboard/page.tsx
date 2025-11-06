// app/student/dashboard/page.tsx
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
  FaTrophy,
  FaFire,
  FaStar,
  FaChartLine,
  FaBook,
  FaRocket,
  FaCalendar,
  FaAward
} from 'react-icons/fa';
import { programsService } from '@/lib/firebase/services/programsService';
import { assignmentsService } from '@/lib/firebase/services/programsService';
import { Student, Program } from '@/types';
import { Assignment } from '@/types/assignments.types';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';

interface ProgramWithProgress {
  program: Program;
  assignment: Assignment;
  progress: number;
  completedActivities: number;
  totalActivities: number;
}

export default function StudentDashboard() {
  const { user, student } = useAuth();
  const [programs, setPrograms] = useState<ProgramWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysActivities, setTodaysActivities] = useState<any[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (student?.id) {
      loadStudentData();
    }
  }, [student?.id]);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);

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

      // Mock data para atividades do dia e conquistas (será substituído por dados reais)
      setTodaysActivities([
        { id: '1', title: 'Matemática Básica', type: 'quiz', progress: 100, completed: true, program: 'Matemática' },
        { id: '2', title: 'Leitura Diária', type: 'habit', progress: 100, completed: true, program: 'Hábitos' },
        { id: '3', title: 'História do Brasil', type: 'text', progress: 75, completed: false, program: 'História' },
        { id: '4', title: 'Exercícios Físicos', type: 'habit', progress: 0, completed: false, program: 'Saúde' },
      ]);

      setRecentAchievements([
        { id: '1', name: 'Primeira Atividade', icon: FaStar, points: 50, unlockedAt: new Date() },
        { id: '2', name: '3 Dias Consecutivos', icon: FaFire, points: 100, unlockedAt: new Date() },
        { id: '3', name: 'Programa Completo', icon: FaTrophy, points: 200, unlockedAt: new Date() },
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgramProgress = async (assignment: Assignment, program: Program | null): Promise<{ progress: number; completedActivities: number; totalActivities: number }> => {
    if (!program) {
      return { progress: 0, completedActivities: 0, totalActivities: 0 };
    }

    const totalActivities = program.modules?.reduce((total, module) =>
      total + (module.activities?.length || 0), 0) || 0;

    const completedActivities = assignment.completedActivities?.length || 0;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    return { progress, completedActivities, totalActivities };
  };

  const studentStats = {
    totalPoints: student?.totalPoints || 0,
    currentLevel: student?.level || 1,
    currentStreak: student?.streak || 0,
    completedPrograms: programs.filter(p => p.progress === 100).length,
    completedActivities: programs.reduce((total, p) => total + p.completedActivities, 0),
    totalActivities: programs.reduce((total, p) => total + p.totalActivities, 0)
  };

  const todayProgress = studentStats.totalActivities > 0
    ? Math.round((todaysActivities.filter(a => a.completed).length / todaysActivities.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando seu dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Header com Boas-vindas e Estatísticas */}
      <Header>
        <WelcomeSection>
          <WelcomeTitle>
            Olá, {student?.name || 'Estudante'}! 👋
          </WelcomeTitle>
          <WelcomeSubtitle>
            Continue sua jornada de aprendizado
          </WelcomeSubtitle>
        </WelcomeSection>

        <StatsOverview>
          <StatCard $color="#10b981">
            <StatIcon>
              <FaTrophy />
            </StatIcon>
            <StatInfo>
              <StatValue>{studentStats.totalPoints}</StatValue>
              <StatLabel>Pontos</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard $color="#6366f1">
            <StatIcon>
              <FaChartLine />
            </StatIcon>
            <StatInfo>
              <StatValue>Nível {studentStats.currentLevel}</StatValue>
              <StatLabel>Progresso</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard $color="#f59e0b">
            <StatIcon>
              <FaFire />
            </StatIcon>
            <StatInfo>
              <StatValue>{studentStats.currentStreak}</StatValue>
              <StatLabel>Dias Consecutivos</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard $color="#8b5cf6">
            <StatIcon>
              <FaCheckCircle />
            </StatIcon>
            <StatInfo>
              <StatValue>{studentStats.completedActivities}/{studentStats.totalActivities}</StatValue>
              <StatLabel>Atividades</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsOverview>
      </Header>

      <ContentGrid>
        {/* Seção de Progresso de Hoje */}
        <TodayProgress>
          <SectionHeader>
            <SectionTitle>Progresso de Hoje</SectionTitle>
            <ProgressPercentage>{todayProgress}%</ProgressPercentage>
          </SectionHeader>

          <ProgressBar>
            <ProgressFill $progress={todayProgress} />
          </ProgressBar>

          <ActivitiesList>
            {todaysActivities.map((activity) => (
              <ActivityItem key={activity.id} $completed={activity.completed}>
                <ActivityIcon $completed={activity.completed}>
                  {activity.completed ? <FaCheckCircle /> : <FaClock />}
                </ActivityIcon>
                <ActivityInfo>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDetails>
                    <ActivityType>{activity.type}</ActivityType>
                    <ActivityProgram>{activity.program}</ActivityProgram>
                  </ActivityDetails>
                </ActivityInfo>
                <ActivityProgress $completed={activity.completed}>
                  {activity.completed ? 'Concluído' : `${activity.progress}%`}
                </ActivityProgress>
              </ActivityItem>
            ))}
          </ActivitiesList>

          <QuickActions>
            <ActionButton href="/student/programs">
              <FaBook size={16} />
              Ver Todos os Programas
            </ActionButton>
            <ActionButton href="/student/habits">
              <FaRocket size={16} />
              Hábitos Diários
            </ActionButton>
          </QuickActions>
        </TodayProgress>

        {/* Seção de Programas Ativos */}
        <ActivePrograms>
          <SectionHeader>
            <SectionTitle>Meus Programas</SectionTitle>
            <ViewAllLink href="/student/programs">Ver todos</ViewAllLink>
          </SectionHeader>

          {programs.length === 0 ? (
            <EmptyPrograms>
              <EmptyIcon>📚</EmptyIcon>
              <EmptyTitle>Nenhum programa atribuído</EmptyTitle>
              <EmptyDescription>
                Aguarde seu profissional atribuir um programa para você começar.
              </EmptyDescription>
            </EmptyPrograms>
          ) : (
            <ProgramsList>
              {programs.slice(0, 3).map(({ program, assignment, progress, completedActivities, totalActivities }) => (
                <ProgramCard key={program.id} href={`/student/programs/${program.id}`}>
                  <ProgramHeader $color={program.color || '#6366f1'}>
                    <ProgramIcon>{program.icon || '📚'}</ProgramIcon>
                    <ProgramInfo>
                      <ProgramTitle>{program.title}</ProgramTitle>
                      <ProgramDescription>
                        {program.description}
                      </ProgramDescription>
                    </ProgramInfo>
                  </ProgramHeader>

                  <ProgressSection>
                    <ProgressInfo>
                      <ProgressLabel>Progresso</ProgressLabel>
                      <ProgressValue>{progress}%</ProgressValue>
                    </ProgressInfo>
                    <ProgressBar>
                      <ProgressFill $progress={progress} $color={program.color} />
                    </ProgressBar>
                    <ActivitiesCount>
                      {completedActivities} de {totalActivities} atividades
                    </ActivitiesCount>
                  </ProgressSection>

                  <ActionButtonNoLink $color={program.color} $small>
                    <FaPlay size={12} />
                    {progress === 0 ? 'Começar' : progress === 100 ? 'Revisar' : 'Continuar'}
                  </ActionButtonNoLink>
                </ProgramCard>
              ))}
            </ProgramsList>
          )}
        </ActivePrograms>

        {/* Seção de Conquistas Recentes */}
        <RecentAchievementsSection>
          <SectionHeader>
            <SectionTitle>Conquistas Recentes</SectionTitle>
            <ViewAllLink href="/student/achievements">Ver todas</ViewAllLink>
          </SectionHeader>

          <AchievementsList>
            {recentAchievements.map((achievement) => (
              <AchievementItem key={achievement.id}>
                <AchievementIcon>
                  <achievement.icon size={20} />
                </AchievementIcon>
                <AchievementInfo>
                  <AchievementName>{achievement.name}</AchievementName>
                  <AchievementPoints>+{achievement.points} pontos</AchievementPoints>
                  <AchievementDate>
                    Conquistado em {achievement.unlockedAt.toLocaleDateString('pt-BR')}
                  </AchievementDate>
                </AchievementInfo>
              </AchievementItem>
            ))}
          </AchievementsList>

          {recentAchievements.length === 0 && (
            <EmptyAchievements>
              <FaAward size={32} />
              <EmptyTitle>Nenhuma conquista ainda</EmptyTitle>
              <EmptyDescription>
                Complete atividades para desbloquear conquistas!
              </EmptyDescription>
            </EmptyAchievements>
          )}
        </RecentAchievementsSection>

        {/* Seção de Streak e Motivação */}
        <StreakSection>
          <SectionHeader>
            <SectionTitle>Sequência de Atividades</SectionTitle>
          </SectionHeader>

          <StreakCard>
            <StreakIcon>
              <FaFire size={24} />
            </StreakIcon>
            <StreakInfo>
              <StreakNumber>{studentStats.currentStreak}</StreakNumber>
              <StreakLabel>dias consecutivos</StreakLabel>
              <StreakMessage>
                {studentStats.currentStreak === 0
                  ? 'Comece hoje sua sequência!'
                  : studentStats.currentStreak < 3
                    ? 'Continue assim!'
                    : studentStats.currentStreak < 7
                      ? 'Ótimo trabalho!'
                      : 'Você é incrível! 🎉'
                }
              </StreakMessage>
            </StreakInfo>
          </StreakCard>

          <NextLevel>
            <LevelInfo>
              <LevelLabel>Próximo Nível</LevelLabel>
              <LevelProgress>Nível {studentStats.currentLevel + 1}</LevelProgress>
            </LevelInfo>
            <LevelBar>
              <LevelFill
                $progress={((studentStats.totalPoints % 1000) / 1000) * 100}
              />
            </LevelBar>
            <LevelPoints>
              {studentStats.totalPoints % 1000}/1000 pontos
            </LevelPoints>
          </NextLevel>
        </StreakSection>
      </ContentGrid>
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
  color: white;
`;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ $color: string }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
  grid-template-areas: 
    "today programs"
    "today achievements"
    "streak achievements";

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "today"
      "programs"
      "achievements"
      "streak";
  }
`;

const TodayProgress = styled.div`
  grid-area: today;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ActivePrograms = styled.div`
  grid-area: programs;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const RecentAchievementsSection = styled.div`
  grid-area: achievements;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StreakSection = styled.div`
  grid-area: streak;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const ProgressPercentage = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
`;

const ViewAllLink = styled(Link)`
  font-size: 14px;
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const ProgressFill = styled.div<{ $progress: number; $color?: string }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: ${props => props.$color ? props.$color : 'linear-gradient(90deg, #8b5cf6, #7c3aed)'};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const ActivityItem = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: ${props => props.$completed ? '#f0fdf4' : '#f8fafc'};
  border: 1px solid ${props => props.$completed ? '#dcfce7' : '#e2e8f0'};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ActivityIcon = styled.div<{ $completed: boolean }>`
  color: ${props => props.$completed ? '#10b981' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const ActivityDetails = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
`;

const ActivityType = styled.span`
  text-transform: capitalize;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 12px;
`;

const ActivityProgram = styled.span`
  font-weight: 500;
`;

const ActivityProgress = styled.div<{ $completed: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$completed ? '#10b981' : '#6366f1'};
  flex-shrink: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(Link) <{ $color?: string; $small?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$color || 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: white;
  text-decoration: none;
  padding: ${props => props.$small ? '8px 16px' : '12px 20px'};
  border-radius: 12px;
  font-weight: 600;
  font-size: ${props => props.$small ? '12px' : '14px'};
  transition: all 0.2s ease;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.$color ? `${props.$color}40` : 'rgba(99, 102, 241, 0.3)'};
  }
`;

const ActionButtonNoLink = styled.button <{ $color?: string; $small?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$color || 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: white;
  text-decoration: none;
  padding: ${props => props.$small ? '8px 16px' : '12px 20px'};
  border-radius: 12px;
  font-weight: 600;
  font-size: ${props => props.$small ? '12px' : '14px'};
  transition: all 0.2s ease;
  justify-content: center;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.$color ? `${props.$color}40` : 'rgba(99, 102, 241, 0.3)'};
  }
`;

const ProgramsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProgramCard = styled(Link)`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ProgramHeader = styled.div<{ $color: string }>`
  background: ${props => props.$color}15;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const ProgramIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
`;

const ProgramInfo = styled.div``;

const ProgramTitle = styled.h3`
  font-size: 18px;
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

const ActivitiesCount = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
  text-align: center;
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AchievementIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AchievementInfo = styled.div`
  flex: 1;
`;

const AchievementName = styled.div`
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const AchievementPoints = styled.div`
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
  margin-bottom: 2px;
`;

const AchievementDate = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const StreakCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px;
  margin-bottom: 20px;
`;

const StreakIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #f59e0b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StreakInfo = styled.div`
  flex: 1;
`;

const StreakNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #92400e;
  line-height: 1;
  margin-bottom: 4px;
`;

const StreakLabel = styled.div`
  font-size: 14px;
  color: #92400e;
  font-weight: 500;
  margin-bottom: 4px;
`;

const StreakMessage = styled.div`
  font-size: 12px;
  color: #b45309;
  font-weight: 500;
`;

const NextLevel = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
`;

const LevelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const LevelLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const LevelProgress = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
`;

const LevelBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const LevelFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const LevelPoints = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: center;
`;

// Estados vazios
const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
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
  margin: 0 0 20px 0;
`;

const EmptyPrograms = styled(EmptyState)`
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
`;

const EmptyAchievements = styled(EmptyState)`
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
`;

// Loading
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: white;
  font-size: 16px;
`;