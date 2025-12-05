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
              <StatLabel>Dias Consecutivos</StatLabel>
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
                  <ActivityCard
                    key={`${activity.scheduleId}-${activity.id}`}
                    href={`/student/schedules/${activity.scheduleId}/activities/${activity.id}`}
                    $color={activity.scheduleColor}
                    $completed={activity.completed}
                  >
                    <ActivityHeader>
                      <ActivityIcon $completed={activity.completed}>
                        {getActivityIcon(activity.type)}
                      </ActivityIcon>
                      <ActivityBadge $type={activity.type}>
                        {activity.type === 'text' ? 'Texto' :
                          activity.type === 'quiz' ? 'Quiz' :
                            activity.type === 'video' ? 'Vídeo' :
                              activity.type === 'checklist' ? 'Checklist' :
                                activity.type === 'habit' ? 'Hábito' : 'Arquivo'}
                      </ActivityBadge>
                    </ActivityHeader>

                    <ActivityContent>
                      <ActivityTitle>{activity.activity.title}</ActivityTitle>
                      <ActivityDescription>
                        {activity.activity.description || 'Complete esta atividade para ganhar pontos.'}
                      </ActivityDescription>

                      <ActivityMeta>
                        <ScheduleBadge $color={activity.scheduleColor}>
                          {activity.scheduleTitle}
                        </ScheduleBadge>
                        <ActivityDetails>
                          <Detail>
                            <FaClock size={10} />
                            {activity.estimatedTime}min
                          </Detail>
                          <Detail>
                            <FaStar size={10} />
                            {activity.points}pts
                          </Detail>
                        </ActivityDetails>
                      </ActivityMeta>
                    </ActivityContent>

                    <ActivityStatus $completed={activity.completed}>
                      {activity.completed ? (
                        <>
                          <FaCheckCircle size={12} />
                          Concluída
                        </>
                      ) : (
                        <>
                          <FaPlay size={12} />
                          Iniciar
                        </>
                      )}
                    </ActivityStatus>
                  </ActivityCard>
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
const Container = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
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

const WelcomeTitle = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CrownIcon = styled.span`
  color: #fbbf24;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const StatCard = styled.div<{ $color: string; $gradient?: boolean }>`
  background: ${props => props.$gradient
    ? `linear-gradient(135deg, ${props.$color}dd, ${props.$color}aa)`
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  backdrop-filter: blur(10px);
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionBadge = styled.span`
  background: #6366f1;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
`;

const EmptyStateCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 2px dashed #e2e8f0;
`;

const EmptyIcon = styled.div`
  color: #94a3b8;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const TodayProgressCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
`;

const ProgressValue = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
`;

const ProgressTime = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const ProgressBar = styled.div<{ $small?: boolean }>`
  width: 100%;
  height: ${props => props.$small ? '6px' : '12px'};
  background: #f1f5f9;
  border-radius: ${props => props.$small ? '3px' : '6px'};
  overflow: hidden;
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

const ActivitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ActivityCard = styled(Link) <{ $color: string; $completed: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid ${props => props.$completed ? '#10b981' : props.$color}20;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$completed ? '#10b981' : props.$color};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.$completed ? '#10b981' : props.$color}40;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActivityIcon = styled.div<{ $completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$completed ? '#10b98115' : '#f1f5f9'};
  color: ${props => props.$completed ? '#10b981' : '#6366f1'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityBadge = styled.span<{ $type: string }>`
  font-size: 11px;
  font-weight: 700;
  color: ${props => {
    switch (props.$type) {
      case 'text': return '#6366f1';
      case 'quiz': return '#f59e0b';
      case 'video': return '#ef4444';
      case 'checklist': return '#10b981';
      case 'file': return '#8b5cf6';
      case 'habit': return '#06b6d4';
      default: return '#64748b';
    }
  }};
  background: ${props => {
    switch (props.$type) {
      case 'text': return '#6366f115';
      case 'quiz': return '#f59e0b15';
      case 'video': return '#ef444415';
      case 'checklist': return '#10b98115';
      case 'file': return '#8b5cf615';
      case 'habit': return '#06b6d415';
      default: return '#f1f5f9';
    }
  }};
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const ActivityDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActivityMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const ScheduleBadge = styled.span<{ $color: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$color};
  background: ${props => props.$color}15;
  padding: 4px 10px;
  border-radius: 12px;
`;

const ActivityDetails = styled.div`
  display: flex;
  gap: 12px;
`;

const Detail = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const ActivityStatus = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$completed ? '#10b981' : '#6366f1'};
  padding: 10px;
  border-radius: 10px;
  background: ${props => props.$completed ? '#10b98110' : '#6366f110'};
  justify-content: center;
  transition: all 0.2s ease;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(Link) <{ $primary?: boolean }>`
  flex: ${props => props.$primary ? 2 : 1};
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.$primary
    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
    : 'white'};
  color: ${props => props.$primary ? 'white' : '#6366f1'};
  text-decoration: none;
  padding: 16px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.3s ease;
  justify-content: center;
  border: ${props => props.$primary ? 'none' : '2px solid #e2e8f0'};
  box-shadow: ${props => props.$primary
    ? '0 4px 20px rgba(99, 102, 241, 0.3)'
    : '0 4px 16px rgba(0, 0, 0, 0.05)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$primary
    ? '0 8px 32px rgba(99, 102, 241, 0.4)'
    : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  }
`;

const SidebarSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
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

const EmptySidebarState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  color: #94a3b8;
  text-align: center;

  svg {
    opacity: 0.5;
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ScheduleItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateX(4px);
    border-color: #6366f1;
    background: #eef2ff;
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

const ScheduleName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  background: #fefce8;
  border: 1px solid #fde047;
`;

const AchievementIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
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
  margin-bottom: 2px;
  font-size: 14px;
`;

const AchievementPoints = styled.div`
  font-size: 12px;
  color: #10b981;
  font-weight: 700;
`;

const TipsSection = styled.div`
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #a7f3d0;
`;

const TipsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 700;
  color: #065f46;
  font-size: 16px;
`;

const TipsContent = styled.p`
  color: #047857;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  font-style: italic;
`;

const NotificationsSection = styled.div`
  background: #fef3c7;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #fcd34d;
`;

const NotificationsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 700;
  color: #92400e;
  font-size: 16px;
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NotificationItem = styled.div`
  font-size: 14px;
  color: #92400e;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  line-height: 1.4;
`;

// Loading
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
`;