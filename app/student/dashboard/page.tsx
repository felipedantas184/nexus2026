// app/student/dashboard/page.tsx - VERSÃO ATUALIZADA
'use client';

import { useState, useEffect, useContext } from 'react';
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
  FaAward,
  FaCalendarDay,
  FaList,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaSync,
  FaArrowRight,
  FaBell,
  FaLightbulb,
  FaCrown
} from 'react-icons/fa';
import { programsService } from '@/lib/firebase/services/programsService';
import { schedulesService } from '@/lib/firebase/services/schedulesService';
import { progressService } from '@/lib/firebase/services/progressService';
import { Program } from '@/types';
import { Assignment } from '@/types/assignments.types';
import { WeeklySchedule, ScheduleActivity } from '@/types/schedule.types';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';
import { useAuth } from '@/context/AuthContext';
import { FaCheck } from 'react-icons/fa6';
import { useScheduleProgress } from '@/hooks/useScheduleProgress';

interface ProgramWithProgress {
  program: Program;
  assignment: Assignment;
  progress: number;
  completedActivities: number;
  totalActivities: number;
}

interface TodayActivity {
  id: string;
  scheduleId: string;
  scheduleTitle: string;
  scheduleColor: string;
  day: string;
  activity: ScheduleActivity;
  completed: boolean;
  estimatedTime: number;
  points: number;
  type: string;
}

interface DashboardStats {
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  completedPrograms: number;
  completedActivities: number;
  totalActivities: number;
  todayCompletion: number;
  scheduleCompletion: Record<string, number>;
}

export default function StudentDashboard() {
  const { user, student } = useAuth();
  const [programs, setPrograms] = useState<ProgramWithProgress[]>([]);
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [todaysActivities, setTodaysActivities] = useState<TodayActivity[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPoints: 0,
    currentLevel: 1,
    currentStreak: 0,
    completedPrograms: 0,
    completedActivities: 0,
    totalActivities: 0,
    todayCompletion: 0,
    scheduleCompletion: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [todaysDate] = useState(new Date());

  useEffect(() => {
    if (student?.id) {
      loadStudentData();
    }
  }, [student?.id]);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);

      // Buscar dados em paralelo para melhor performance
      const [
        assignments,
        studentSchedules,
        overallProgress
      ] = await Promise.all([
        assignmentService.getStudentAssignments(student!.id),
        schedulesService.getStudentSchedules(student!.id),
        progressService.getStudentOverallProgress(student!.id)
      ]);

      // Processar programas
      const programsWithProgress = await processPrograms(assignments);
      setPrograms(programsWithProgress);

      // Processar cronogramas e atividades do dia
      const todayActivitiesData = await processTodaysActivities(studentSchedules);
      setTodaysActivities(todayActivitiesData);
      setSchedules(studentSchedules);

      // Calcular estatísticas
      const stats = await calculateDashboardStats(
        programsWithProgress,
        studentSchedules,
        overallProgress,
        todayActivitiesData
      );
      setDashboardStats(stats);

      // Carregar conquistas (mock por enquanto)
      loadAchievements();

    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processPrograms = async (assignments: Assignment[]): Promise<ProgramWithProgress[]> => {
    const programsWithProgress = await Promise.all(
      assignments.map(async (assignment) => {
        try {
          const program = await programsService.getProgramById(assignment.programId);
          if (!program) return null;

          const progressData = await calculateProgramProgress(assignment, program);

          return {
            program,
            assignment,
            ...progressData
          };
        } catch (error) {
          console.error(`Erro ao processar programa ${assignment.programId}:`, error);
          return null;
        }
      })
    );

    return programsWithProgress
      .filter((p): p is ProgramWithProgress => p !== null)
      .sort((a, b) => b.progress - a.progress);
  };

  const processTodaysActivities = async (schedules: WeeklySchedule[]): Promise<TodayActivity[]> => {
    const today = new Date().getDay();
    const dayMap: { [key: number]: string } = {
      1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday', 0: 'sunday'
    };
    const todayKey = dayMap[today];

    const activities: TodayActivity[] = [];

    // Buscar progresso do aluno uma vez para todos os cronogramas
    const allProgress = await Promise.all(
      schedules.map(async (schedule) => {
        try {
          const progress = await progressService.getStudentScheduleProgress(student!.id, schedule.id);
          return { scheduleId: schedule.id, progress };
        } catch (error) {
          console.error(`Erro ao buscar progresso do cronograma ${schedule.id}:`, error);
          return { scheduleId: schedule.id, progress: {} };
        }
      })
    );

    const progressMap = Object.fromEntries(
      allProgress.map(p => [p.scheduleId, p.progress])
    );

    schedules.forEach(schedule => {
      if (!schedule.isActive) return;

      const todaySchedule = schedule.weekDays.find(day => day.day === todayKey);
      if (!todaySchedule || todaySchedule.activities.length === 0) return;

      const scheduleProgress = progressMap[schedule.id] || {};

      todaySchedule.activities.forEach(activity => {
        activities.push({
          id: activity.id,
          scheduleId: schedule.id,
          scheduleTitle: schedule.title,
          scheduleColor: schedule.color,
          day: todayKey,
          activity,
          completed: !!scheduleProgress[activity.id]?.completed,
          estimatedTime: activity.estimatedTime || 15,
          points: activity.points || 10,
          type: activity.type
        });
      });
    });

    // Ordenar por: não completadas primeiro, depois por hora estimada
    return activities.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.estimatedTime - b.estimatedTime;
    });
  };

  const calculateProgramProgress = async (
    assignment: Assignment,
    program: Program
  ): Promise<{ progress: number; completedActivities: number; totalActivities: number }> => {
    const totalActivities = program.modules?.reduce((total, module) =>
      total + (module.activities?.length || 0), 0) || 0;

    const completedActivities = assignment.completedActivities?.length || 0;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    return { progress, completedActivities, totalActivities };
  };

  const calculateDashboardStats = async (
    programs: ProgramWithProgress[],
    schedules: WeeklySchedule[],
    overallProgress: any[],
    todayActivities: TodayActivity[]
  ): Promise<DashboardStats> => {
    // Estatísticas dos programas
    const completedPrograms = programs.filter(p => p.progress === 100).length;
    const completedActivities = programs.reduce((total, p) => total + p.completedActivities, 0);
    const totalActivities = programs.reduce((total, p) => total + p.totalActivities, 0);

    // Estatísticas dos cronogramas
    const scheduleCompletion: Record<string, number> = {};

    for (const schedule of schedules) {
      try {
        const stats = await schedulesService.getScheduleProgressStats(schedule.id, student!.id);
        scheduleCompletion[schedule.id] = stats.completionPercentage;
      } catch (error) {
        scheduleCompletion[schedule.id] = 0;
      }
    }

    // Estatísticas do dia
    const completedToday = todayActivities.filter(a => a.completed).length;
    const todayCompletion = todayActivities.length > 0
      ? Math.round((completedToday / todayActivities.length) * 100)
      : 0;

    return {
      totalPoints: student?.totalPoints || 0,
      currentLevel: student?.level || 1,
      currentStreak: student?.streak || 0,
      completedPrograms,
      completedActivities,
      totalActivities,
      todayCompletion,
      scheduleCompletion
    };
  };

  const loadAchievements = async () => {
    // Mock data - será substituído por serviço real de conquistas
    const mockAchievements = [
      { id: '1', name: 'Primeira Atividade', icon: FaStar, points: 50, unlockedAt: new Date(), description: 'Complete sua primeira atividade' },
      { id: '2', name: '3 Dias Consecutivos', icon: FaFire, points: 100, unlockedAt: new Date(), description: 'Mantenha uma sequência de 3 dias' },
      { id: '3', name: 'Mestre dos Cronogramas', icon: FaCalendar, points: 200, unlockedAt: new Date(), description: 'Complete um cronograma inteiro' },
      { id: '4', name: 'Aprendiz Dedicado', icon: FaBook, points: 150, unlockedAt: new Date(), description: 'Complete 10 atividades' },
    ];
    setRecentAchievements(mockAchievements);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'text': return <FaFileAlt size={14} />;
      case 'quiz': return <FaQuestionCircle size={14} />;
      case 'video': return <FaVideo size={14} />;
      case 'checklist': return <FaList size={14} />;
      case 'file': return <FaFileAlt size={14} />;
      case 'habit': return <FaSync size={14} />;
      default: return <FaStar size={14} />;
    }
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Cada pequeno passo conta! 💪",
      "Você está mais próximo do que imagina! ✨",
      "A consistência é a chave do sucesso! 🔑",
      "Hoje é um ótimo dia para aprender! 📚",
      "Seu progresso é inspirador! 🌟"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleActivityToggleInDashboard = async (activity: TodayActivity) => {
    try {
      // Atualizar estado local IMEDIATAMENTE para feedback visual
      setTodaysActivities(prevActivities =>
        prevActivities.map(a =>
          a.id === activity.id
            ? { ...a, completed: !a.completed }
            : a
        )
      );

      // Atualizar estatísticas do dashboard
      setDashboardStats(prevStats => {
        const newCompletedToday = !activity.completed
          ? prevStats.completedActivities + 1
          : prevStats.completedActivities - 1;

        const newTodayCompletion = Math.round(
          (newCompletedToday / todaysActivities.length) * 100
        );

        return {
          ...prevStats,
          completedActivities: newCompletedToday,
          todayCompletion: newTodayCompletion
        };
      });

    } catch (error) {
      console.error('Erro ao atualizar estado local:', error);

      // Reverter em caso de erro
      setTodaysActivities(prevActivities =>
        prevActivities.map(a =>
          a.id === activity.id
            ? { ...a, completed: activity.completed } // Voltar ao estado original
            : a
        )
      );
    }
  };

  function DashboardActivityToggle({
    activity,
    onToggle
  }: {
    activity: TodayActivity;
    onToggle: () => void;
  }) {
    const { toggleActivityCompletion, isActivityCompleted } = useScheduleProgress({
      scheduleId: activity.scheduleId
    });

    const handleToggle = async () => {
      try {
        await toggleActivityCompletion(
          activity.id,
          activity.day,
          !activity.completed,
          { timeSpent: activity.estimatedTime || 5 }
        );

        // Chamar callback para atualizar estado no pai
        onToggle();
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    // USAR O HOOK PARA VERIFICAR ESTADO REAL, não o activity.completed
    const isCompleted = isActivityCompleted(activity.id);

    return (
      <QuickToggle
        onClick={handleToggle}
        $completed={isCompleted} // Usar estado do hook
        title={isCompleted ? "Marcar como não concluída" : "Marcar como concluída"}
      >
        <ToggleCircle $completed={isCompleted}>
          {isCompleted ? <FaCheck size={10} /> : null}
        </ToggleCircle>
      </QuickToggle>
    );
  }

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Preparando seu dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Header com Boas-vindas Personalizada */}
      <WelcomeBanner>
        <WelcomeContent>
          <WelcomeHeader>
            <WelcomeTitle>
              {getTimeOfDayGreeting()}, {student?.name?.split(' ')[0] || 'Estudante'}!
              <CrownIcon>
                <FaCrown />
              </CrownIcon>
            </WelcomeTitle>
            <WelcomeSubtitle>{getMotivationalMessage()}</WelcomeSubtitle>
          </WelcomeHeader>

          <DateDisplay>
            <FaCalendarDay />
            {todaysDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </DateDisplay>
        </WelcomeContent>

        <StatsOverview>
          <StatCard $color="#6366f1" $gradient>
            <StatIcon $color="#6366f1">
              <FaTrophy />
            </StatIcon>
            <StatInfo>
              <StatValue>{dashboardStats.totalPoints}</StatValue>
              <StatLabel>Pontos Totais</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard $color="#10b981" $gradient>
            <StatIcon $color="#10b981">
              <FaFire />
            </StatIcon>
            <StatInfo>
              <StatValue>{dashboardStats.currentStreak}</StatValue>
              <StatLabel>Dias Seguidos</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard $color="#8b5cf6" $gradient>
            <StatIcon $color="#8b5cf6">
              <FaChartLine />
            </StatIcon>
            <StatInfo>
              <StatValue>Nível {dashboardStats.currentLevel}</StatValue>
              <StatLabel>Seu Nível</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard $color="#f59e0b" $gradient>
            <StatIcon $color="#f59e0b">
              <FaCheckCircle />
            </StatIcon>
            <StatInfo>
              <StatValue>{dashboardStats.todayCompletion}%</StatValue>
              <StatLabel>Hoje</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsOverview>
      </WelcomeBanner>

      <ContentGrid>
        {/* SEÇÃO PRINCIPAL: ATIVIDADES DE HOJE */}
        <MainSection>
          <SectionHeader>
            <SectionTitle>
              <FaCalendarDay size={20} />
              Suas Atividades de Hoje
            </SectionTitle>
            <SectionBadge>
              {todaysActivities.filter(a => a.completed).length}/{todaysActivities.length}
            </SectionBadge>
          </SectionHeader>

          {todaysActivities.length === 0 ? (
            <EmptyStateCard>
              <EmptyIcon>
                <FaLightbulb size={48} />
              </EmptyIcon>
              <EmptyTitle>Dia de descanso! 🎉</EmptyTitle>
              <EmptyDescription>
                Você não tem atividades programadas para hoje. Aproveite para revisar conteúdos ou explorar novos aprendizados!
              </EmptyDescription>
              <QuickActions>
                <ActionButton href="/student/programs">
                  <FaBook size={16} />
                  Explorar Programas
                </ActionButton>
                <ActionButton href="/student/schedules">
                  <FaCalendar size={16} />
                  Ver Cronogramas
                </ActionButton>
              </QuickActions>
            </EmptyStateCard>
          ) : (
            <>
              <TodayProgressCard>
                <ProgressHeader>
                  <ProgressInfo>
                    <ProgressLabel>Progresso do Dia</ProgressLabel>
                    <ProgressValue>{dashboardStats.todayCompletion}%</ProgressValue>
                  </ProgressInfo>
                  <ProgressTime>
                    <FaClock size={14} />
                    {todaysActivities.reduce((total, a) => total + a.estimatedTime, 0)} min total
                  </ProgressTime>
                </ProgressHeader>
                <ProgressBar>
                  <ProgressFill $progress={dashboardStats.todayCompletion} />
                </ProgressBar>
              </TodayProgressCard>

              <ActivitiesGrid>
                {todaysActivities.map((activity) => (
                  <ActivityCardWrapper
                    key={`${activity.scheduleId}-${activity.id}`}
                    $type={activity.type}
                    $completed={activity.completed}
                    $scheduleColor={activity.scheduleColor}
                  >
                    <CardHeader>
                      <HeaderLeft>
                        <ActivityIconWrapper $type={activity.type} $completed={activity.completed}>
                          {getActivityIcon(activity.type)}
                        </ActivityIconWrapper>

                        <HeaderInfo>
                          <ActivityTitleRow>
                            <ActivityTitle>
                              {activity.activity.title}
                            </ActivityTitle>

                            {activity.activity.isRequired && (
                              <RequiredDot title="Atividade obrigatória" />
                            )}
                          </ActivityTitleRow>

                          <ScheduleBadge $color={activity.scheduleColor}>
                            {activity.scheduleTitle}
                          </ScheduleBadge>
                        </HeaderInfo>
                      </HeaderLeft>

                      <DashboardActivityToggle
                        activity={activity}
                        onToggle={() => handleActivityToggleInDashboard(activity)}
                      />
                    </CardHeader>

                    <ActivityMeta>
                      <MetaItem><FaClock size={10} /> {activity.estimatedTime}min</MetaItem>
                      <MetaItem><FaStar size={10} /> {activity.points}pts</MetaItem>
                    </ActivityMeta>

                    <CardFooter>
                      <ActionButtons>
                        <DetailButton
                          href={`/student/schedules/${activity.scheduleId}/activities/${activity.id}`}
                          $type={activity.type}
                        >
                          <FaPlay size={12} />
                          Abrir
                        </DetailButton>
                      </ActionButtons>
                      {activity.completed && (
                        <CompletionStatus $completed={activity.completed}>
                          <FaCheck size={11} />
                          Concluída
                        </CompletionStatus>
                      )}
                    </CardFooter>
                  </ActivityCardWrapper>

                ))}
              </ActivitiesGrid>

              <QuickActions>
                <ActionButton href="/student/schedules" $primary>
                  <FaCalendarDay size={16} />
                  Ver Cronograma Completo
                </ActionButton>
                <ActionButton href="/student/programs">
                  <FaBook size={16} />
                  Meus Programas
                </ActionButton>
              </QuickActions>
            </>
          )}
        </MainSection>

        {/* COLUNA LATERAL: RESUMO E RECURSOS */}
        <Sidebar>
          {/* RESUMO DE CRONOGRAMAS */}
          <SidebarSection>
            <SectionHeader>
              <SectionTitle>
                <FaCalendar size={16} />
                Meus Cronogramas
              </SectionTitle>
              <ViewAllLink href="/student/schedules">
                <FaArrowRight size={12} />
              </ViewAllLink>
            </SectionHeader>

            {schedules.length === 0 ? (
              <EmptySidebarState>
                <FaCalendar size={20} />
                <span>Nenhum cronograma</span>
              </EmptySidebarState>
            ) : (
              <ScheduleList>
                {schedules.slice(0, 3).map(schedule => (
                  <ScheduleItem
                    key={schedule.id}
                    href={`/student/schedules/${schedule.id}`}
                  >
                    <ScheduleColor $color={schedule.color} />
                    <ScheduleInfo>
                      <ScheduleName>{schedule.title}</ScheduleName>
                      <ScheduleProgress>
                        <ProgressBar $small>
                          <ProgressFill
                            $progress={dashboardStats.scheduleCompletion[schedule.id] || 0}
                            $color={schedule.color}
                          />
                        </ProgressBar>
                        <ProgressPercentage>
                          {dashboardStats.scheduleCompletion[schedule.id] || 0}%
                        </ProgressPercentage>
                      </ScheduleProgress>
                    </ScheduleInfo>
                  </ScheduleItem>
                ))}
              </ScheduleList>
            )}
          </SidebarSection>

          {/* CONQUISTAS RECENTES */}
          <SidebarSection>
            <SectionHeader>
              <SectionTitle>
                <FaAward size={16} />
                Conquistas Recentes
              </SectionTitle>
              <ViewAllLink href="/student/achievements">
                <FaArrowRight size={12} />
              </ViewAllLink>
            </SectionHeader>

            {recentAchievements.length === 0 ? (
              <EmptySidebarState>
                <FaAward size={20} />
                <span>Sem conquistas</span>
              </EmptySidebarState>
            ) : (
              <AchievementsList>
                {recentAchievements.slice(0, 2).map(achievement => (
                  <AchievementItem key={achievement.id}>
                    <AchievementIcon>
                      <achievement.icon size={16} />
                    </AchievementIcon>
                    <AchievementInfo>
                      <AchievementName>{achievement.name}</AchievementName>
                      <AchievementPoints>+{achievement.points} pontos</AchievementPoints>
                    </AchievementInfo>
                  </AchievementItem>
                ))}
              </AchievementsList>
            )}
          </SidebarSection>

          {/* DICAS DO DIA */}
          <TipsSection>
            <TipsHeader>
              <FaLightbulb size={16} />
              <span>Dica do Dia</span>
            </TipsHeader>
            <TipsContent>
              "Divida suas atividades em blocos de tempo para manter o foco e a produtividade. O método Pomodoro (25min trabalho / 5min descanso) é uma ótima técnica!"
            </TipsContent>
          </TipsSection>

          {/* NOTIFICAÇÕES */}
          <NotificationsSection>
            <NotificationsHeader>
              <FaBell size={16} />
              <span>Lembretes</span>
            </NotificationsHeader>
            <NotificationsList>
              {todaysActivities.filter(a => !a.completed).length > 0 && (
                <NotificationItem>
                  Você tem {todaysActivities.filter(a => !a.completed).length} atividades pendentes para hoje
                </NotificationItem>
              )}
              {dashboardStats.currentStreak > 0 && (
                <NotificationItem>
                  Sequência de {dashboardStats.currentStreak} dias! Continue assim! 🔥
                </NotificationItem>
              )}
              {programs.length > 0 && (
                <NotificationItem>
                  {programs.filter(p => p.progress > 0 && p.progress < 100).length} programas em andamento
                </NotificationItem>
              )}
            </NotificationsList>
          </NotificationsSection>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
}

// ========== ESTILOS ATUALIZADOS ==========
// ========== ESTILOS ATUALIZADOS COM RESPONSIVIDADE ==========
const Container = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px 16px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    border-radius: 12px;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 22px;
    gap: 8px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 12px;
    gap: 6px;
  }
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

const StatCard = styled.div<{ $color: string; $gradient?: boolean }>`
  background: ${props => props.$gradient
    ? `linear-gradient(135deg, ${props.$color}dd, ${props.$color}aa)`
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 480px) {
    padding: 12px 10px;
    gap: 10px;
    min-height: 72px;
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const StatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1.5fr 1fr;
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 17px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    gap: 6px;
  }
`;

const SectionBadge = styled.span`
  background: #6366f1;
  color: white;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 8px;
  }
`;

const EmptyStateCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 2px dashed #e2e8f0;

  @media (max-width: 768px) {
    padding: 32px 20px;
  }

  @media (max-width: 480px) {
    padding: 24px 16px;
    border-radius: 14px;
  }
`;

const EmptyIcon = styled.div`
  color: #94a3b8;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 15px;
  margin: 0 0 24px 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 16px;
    line-height: 1.4;
  }
`;

const TodayProgressCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 14px;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
`;

const ProgressLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #64748b;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ProgressValue = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;

  @media (max-width: 768px) {
    font-size: 26px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const ProgressTime = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 12px;
    align-self: flex-end;
  }
`;

const ProgressBar = styled.div<{ $small?: boolean }>`
  width: 100%;
  height: ${props => props.$small ? '5px' : '10px'};
  background: #f1f5f9;
  border-radius: ${props => props.$small ? '3px' : '5px'};
  overflow: hidden;
`;

const ActivitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 16px;

  @media (max-width: 1024px) {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 14px;
  }

  @media (max-width: 768px) {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ActivityCardWrapper = styled.div<{
  $type: string;
  $completed: boolean;
  $scheduleColor: string;
}>`
  background: ${p => (p.$completed ? "#f9fef9" : "white")};
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 12px;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActivityIconWrapper = styled.div<{ $type: string; $completed: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background: ${props => {
    if (props.$completed) return '#10b98120';
        switch (props.$type) {
      case 'text':
        return '#6366f120'; // Indigo Claro
      case 'quiz':
        return '#f59e0b20'; // Amarelo/Âmbar Claro
      case 'video':
        return '#ef444420'; // Vermelho Claro
      case 'checklist':
        return '#10b98120'; // Verde Claro
      case 'file':
        return '#8b5cf620'; // Violeta Claro
      case 'habit':
        return '#06b6d420'; // Ciano Claro
      default:
        return '#6366f120'; // Default: Indigo Claro
    }
  }};

  color: ${props => {
    if (props.$completed) return '#10b981';
    switch (props.$type) {
      case 'text':
        return '#6366f1'; // Indigo
      case 'quiz':
        return '#f59e0b'; // Amarelo/Âmbar
      case 'video':
        return '#ef4444'; // Vermelho
      case 'checklist':
        return '#10b981'; // Verde
      case 'file':
        return '#8b5cf6'; // Violeta
      case 'habit':
        return '#06b6d4'; // Ciano
      default:
        return '#6366f1'; // Default: Indigo
    }
  }};

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }
`;
const RequiredDot = styled.span`
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
`;

const ActivityTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
`;

const ScheduleBadge = styled.div<{ $color: string }>`
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${p => p.$color}1A;
  color: ${p => p.$color};
  font-weight: 600;
  width: fit-content;
`;

const ActivityMeta = styled.div`
  display: flex;
  gap: 10px;
  color: #64748b;
`;

const MetaItem = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardFooter = styled.div`
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const DetailButton = styled(Link) <{ $type: string }>`
  flex: 1;
  background: #6366f1;
  color: #f1f5f9;
  font-weight: 600;
  padding: 8px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  font-size: 12px;
  transition: 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const CompletionStatus = styled.div<{ $completed: boolean }>`
  font-size: 12px;
  color: ${p => (p.$completed ? "#16a34a" : "#475569")};
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
`;


const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const ActionButton = styled(Link) <{ $primary?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$primary
    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
    : 'white'};
  color: ${props => props.$primary ? 'white' : '#6366f1'};
  text-decoration: none;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s ease;
  justify-content: center;
  border: ${props => props.$primary ? 'none' : '2px solid #e2e8f0'};
  box-shadow: ${props => props.$primary
    ? '0 4px 16px rgba(99, 102, 241, 0.25)'
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  min-height: 48px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$primary
    ? '0 6px 24px rgba(99, 102, 241, 0.3)'
    : '0 6px 20px rgba(0, 0, 0, 0.08)'};
  }

  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 13px;
    min-height: 44px;
  }

  @media (max-width: 480px) {
    padding: 14px 14px;
    font-size: 12px;
    min-height: 40px;
    border-radius: 10px;
  }
`;

const SidebarSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 14px;
  }
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ScheduleItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  min-height: 60px;

  &:hover {
    transform: translateX(4px);
    border-color: #6366f1;
    background: #eef2ff;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 8px;
    min-height: 56px;
  }
`;

const ScheduleName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 4px;
  }
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  background: #fefce8;
  border: 1px solid #fde047;
  min-height: 60px;

  @media (max-width: 480px) {
    padding: 12px;
    gap: 8px;
    min-height: 56px;
  }
`;

const AchievementIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
`;

const AchievementName = styled.div`
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
  font-size: 13px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const AchievementPoints = styled.div`
  font-size: 11px;
  color: #10b981;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const TipsSection = styled.div`
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #a7f3d0;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 14px;
  }
`;

const TipsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #065f46;
  font-size: 15px;

  @media (max-width: 480px) {
    font-size: 14px;
    gap: 6px;
    margin-bottom: 8px;
  }
`;

const TipsContent = styled.p`
  color: #047857;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  font-style: italic;

  @media (max-width: 480px) {
    font-size: 12px;
    line-height: 1.3;
  }
`;

const NotificationsSection = styled.div`
  background: #fef3c7;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #fcd34d;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 14px;
  }
`;

const NotificationsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #92400e;
  font-size: 15px;

  @media (max-width: 480px) {
    font-size: 14px;
    gap: 6px;
    margin-bottom: 8px;
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const NotificationItem = styled.div`
  font-size: 13px;
  color: #92400e;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px;
  }
`;

const EmptySidebarState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  color: #94a3b8;
  text-align: center;

  svg {
    opacity: 0.5;
    font-size: 18px;
  }

  span {
    font-size: 13px;
    font-weight: 500;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
    gap: 6px;
    
    svg {
      font-size: 16px;
    }
    
    span {
      font-size: 12px;
    }
  }
`;

// Loading states
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 60px 12px;
  }
`;

const LoadingText = styled.p`
  margin-top: 12px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-top: 10px;
  }
`;












const WelcomeContent = styled.div`
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
`;

const WelcomeHeader = styled.div`
  margin-bottom: 16px;
`;

const CrownIcon = styled.span`
  color: #fbbf24;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const ProgressFill = styled.div<{ $progress: number; $color?: string }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: ${props => props.$color
    ? props.$color
    : 'linear-gradient(90deg, #8b5cf6, #6366f1)'};
  border-radius: inherit;
  transition: width 0.5s ease;
`;

const QuickToggle = styled.button<{ $completed: boolean }>`
  width: 26px;
  height: 26px;
  border: 2px solid ${props => props.$completed ? '#10b981' : '#d1d5db'};
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  
  &:hover {
    border-color: ${props => props.$completed ? '#dc2626' : '#10b981'};
    background: ${props => props.$completed ? '#fef2f210' : '#10b98110'};
    transform: scale(1.1);
  }
`;

const ToggleCircle = styled.div<{ $completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$completed ? '#10b981' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 7px;
  transition: all 0.2s ease;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
`;

const RequiredIndicator = styled.span`
  color: #dc2626;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
`;

const ViewAllLink = styled(Link)`
  color: #6366f1;
  text-decoration: none;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }
`;

const ScheduleColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const ScheduleInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ScheduleProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressPercentage = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  min-width: 32px;
`;

const AchievementInfo = styled.div`
  flex: 1;
`;