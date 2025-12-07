// app/student/schedules/[id]/page.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaCheck,
  FaPlay,
  FaCalendarDay,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaEdit,
  FaHistory,
  FaQuestionCircle
} from 'react-icons/fa';
import { schedulesService } from '@/lib/firebase/services/schedulesService';
import { WeeklySchedule, WeekDaySchedule, ScheduleActivity } from '@/types/schedule.types';
import { useAuth } from '@/context/AuthContext';
import { useScheduleProgress } from '@/hooks/useScheduleProgress';

const dayLabels: { [key: string]: string } = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const dayShortLabels: { [key: string]: string } = {
  monday: 'SEG',
  tuesday: 'TER',
  wednesday: 'QUA',
  thursday: 'QUI',
  friday: 'SEX',
  saturday: 'SÁB',
  sunday: 'DOM'
};

export default function ScheduleDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const scheduleId = params.id as string;
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const {
    progress,
    loading: progressLoading,
    toggleActivityCompletion,
    isActivityCompleted
  } = useScheduleProgress({ scheduleId });

  // Inicializar com dia da query string ou dia atual
  useEffect(() => {
    const dayParam = searchParams.get('day');
    if (dayParam === 'today') {
      const today = new Date().getDay();
      const dayMap: { [key: number]: string } = {
        1: 'monday', 2: 'tuesday', 3: 'wednesday',
        4: 'thursday', 5: 'friday', 6: 'saturday', 0: 'sunday'
      };
      setSelectedDay(dayMap[today]);
    } else if (dayParam) {
      setSelectedDay(dayParam);
    } else {
      setSelectedDay('monday');
    }
  }, [searchParams]);

  // Carregar cronograma
  useEffect(() => {
    const loadSchedule = async () => {
      if (!user?.id || !scheduleId) return;

      try {
        setLoading(true);
        setError(null);

        // Carregar cronograma específico
        const scheduleData = await schedulesService.getScheduleById(scheduleId);

        if (!scheduleData) {
          throw new Error('Cronograma não encontrado');
        }

        // Verificar se o aluno tem acesso
        if (!scheduleData.assignedStudents.includes(user.id)) {
          throw new Error('Você não tem acesso a este cronograma');
        }

        setSchedule(scheduleData);

        // REMOVER: Mock data - o hook useScheduleProgress já carrega os dados reais
        // const mockCompletion: Record<string, boolean> = {};
        // scheduleData.weekDays.forEach(day => {
        //   day.activities.forEach(activity => {
        //     mockCompletion[activity.id] = Math.random() > 0.7;
        //   });
        // });
        // setCompletionData(mockCompletion);

      } catch (err: any) {
        console.error('Erro ao carregar cronograma:', err);
        setError(err.message || 'Erro ao carregar cronograma');
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [user?.id, scheduleId]);

  // ATUALIZAR: Usar toggle do hook real
  const handleActivityToggle = async (activityId: string, day: string) => {
    if (!schedule) return;

    try {
      const isCompleted = isActivityCompleted(activityId);
      await toggleActivityCompletion(activityId, day, !isCompleted, {
        timeSpent: 0 // ou calcular tempo real
      });
    } catch (err: any) {
      console.error('Erro ao atualizar atividade:', err);
      alert('Erro ao atualizar atividade: ' + err.message);
    }
  };

  const getSelectedDayData = () => {
    if (!schedule || !selectedDay) return null;
    return schedule.weekDays.find(day => day.day === selectedDay);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'quiz': return '❓';
      case 'video': return '🎥';
      case 'checklist': return '✅';
      case 'file': return '📎';
      case 'habit': return '🔄';
      default: return '🎯';
    }
  };

  const getDayCompletion = (day: WeekDaySchedule) => {
    const activities = day.activities || [];
    if (activities.length === 0) return { completed: 0, total: 0, percentage: 0 };

    // ATUALIZAR: Usar progress real
    const completed = activities.filter(activity => isActivityCompleted(activity.id)).length;
    const total = activities.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  const getOverallCompletion = () => {
    if (!schedule) return { completed: 0, total: 0, percentage: 0 };

    let totalActivities = 0;
    let completedActivities = 0;

    schedule.weekDays.forEach(day => {
      const dayCompletion = getDayCompletion(day);
      totalActivities += dayCompletion.total;
      completedActivities += dayCompletion.completed;
    });

    const percentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
    return { completed: completedActivities, total: totalActivities, percentage };
  };

  const getTotalPoints = () => {
    if (!schedule) return 0;

    // ATUALIZAR: Usar progress real
    return schedule.weekDays.reduce((total, day) =>
      total + day.activities.reduce((dayTotal, activity) =>
        isActivityCompleted(activity.id) ? dayTotal + (activity.points || 0) : dayTotal, 0
      ), 0
    );
  };

  const getTotalTime = (activities: ScheduleActivity[]) => {
    return activities.reduce((total, activity) => total + (activity.estimatedTime || 0), 0);
  };

  if (loading || progressLoading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Carregando cronograma...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Erro ao carregar cronograma</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <BackButton href="/student/schedules">
            <FaArrowLeft size={16} />
            Voltar para Cronogramas
          </BackButton>
        </ErrorState>
      </Container>
    );
  }

  if (!schedule) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Cronograma não encontrado</ErrorTitle>
          <ErrorMessage>O cronograma solicitado não existe ou você não tem acesso.</ErrorMessage>
          <BackButton href="/student/schedules">
            <FaArrowLeft size={16} />
            Voltar para Cronogramas
          </BackButton>
        </ErrorState>
      </Container>
    );
  }

  const selectedDayData = getSelectedDayData();
  const overallCompletion = getOverallCompletion();
  const totalPoints = getTotalPoints();

  return (
    <Container>
      <Header>
        <BackButton href="/student/schedules">
          <FaArrowLeft size={16} />
          Voltar
        </BackButton>

        <TitleSection>
          <ScheduleHeader $color={schedule.color}>
            <ScheduleIcon>
              {schedule.icon}
            </ScheduleIcon>
            <div>
              <Title>{schedule.title}</Title>
              <Subtitle>{schedule.description}</Subtitle>
            </div>
          </ScheduleHeader>
        </TitleSection>
      </Header>

      {/* Resumo Geral */}
      <SummarySection>
        <SummaryStats>
          <Stat>
            <StatNumber>{overallCompletion.percentage}%</StatNumber>
            <StatLabel>Concluído</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>{overallCompletion.completed}/{overallCompletion.total}</StatNumber>
            <StatLabel>Atividades</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>{totalPoints}</StatNumber>
            <StatLabel>Pontos</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>{schedule.weekDays.filter(d => d.activities.length > 0).length}</StatNumber>
            <StatLabel>Dias</StatLabel>
          </Stat>
        </SummaryStats>

        <ProgressBar>
          <ProgressFill $percentage={overallCompletion.percentage} $color={schedule.color} />
        </ProgressBar>
      </SummarySection>

      <Content>
        {/* Navegação dos Dias */}
        <DaysNavigation>
          {schedule.weekDays.map(daySchedule => {
            const completion = getDayCompletion(daySchedule);
            const isSelected = selectedDay === daySchedule.day;

            return (
              <DayTab
                key={daySchedule.day}
                $selected={isSelected}
                $color={schedule.color}
                onClick={() => setSelectedDay(daySchedule.day)}
              >
                <DayTabContent>
                  <DayAbbreviation>{dayShortLabels[daySchedule.day]}</DayAbbreviation>
                  <DayName>{dayLabels[daySchedule.day].substring(0, 3)}</DayName>
                  {completion.total > 0 && (
                    <DayProgress $percentage={completion.percentage}>
                      {completion.completed}/{completion.total}
                    </DayProgress>
                  )}
                </DayTabContent>
              </DayTab>
            );
          })}
        </DaysNavigation>

        {/* Conteúdo do Dia Selecionado */}
        {selectedDayData && (
          <DayContent>
            <DayHeader>
              <DayTitle>
                <FaCalendarDay size={20} />
                {dayLabels[selectedDayData.day]}
              </DayTitle>
              <DayStats>
                <DayStat>
                  <FaClock size={14} />
                  {getTotalTime(selectedDayData.activities)} min
                </DayStat>
                <DayStat>
                  <FaStar size={14} />
                  {selectedDayData.activities.reduce((total, activity) => total + (activity.points || 0), 0)} pts
                </DayStat>
                <DayStat>
                  <FaCheck size={14} />
                  {getDayCompletion(selectedDayData).completed}/{selectedDayData.activities.length}
                </DayStat>
              </DayStats>
            </DayHeader>

            {/* Observações do Dia */}
            {selectedDayData.notes && (
              <DayNotes>
                <NotesTitle>Observações do dia:</NotesTitle>
                <NotesText>{selectedDayData.notes}</NotesText>
              </DayNotes>
            )}

            {/* Lista de Atividades */}
            <ActivitiesList>
              {selectedDayData.activities.length === 0 ? (
                <EmptyDay>
                  <EmptyIcon>📅</EmptyIcon>
                  <EmptyText>Nenhuma atividade programada para este dia</EmptyText>
                  <EmptySubtext>Aproveite para descansar ou revisar conteúdos anteriores!</EmptySubtext>
                </EmptyDay>
              ) : (
                selectedDayData.activities.map((activity, index) => {
                  // ATUALIZAR: Usar isActivityCompleted do hook real
                  const isCompleted = isActivityCompleted(activity.id);

                  return (
                    <ActivityCard key={activity.id} $completed={isCompleted} $type={activity.type}>
                      <CardHeader>
                        <ActivityIconWrapper $type={activity.type} $completed={isCompleted}>
                          {getActivityIcon(activity.type)}
                        </ActivityIconWrapper>

                        <ActivityContent>
                          <ActivityTitleRow>
                            <ActivityTitle>
                              {activity.title}
                              {activity.isRequired && <RequiredIndicator title="Atividade obrigatória">•</RequiredIndicator>}
                            </ActivityTitle>

                            <QuickToggle
                              onClick={() => handleActivityToggle(activity.id, selectedDayData.day)}
                              $completed={isCompleted}
                              title={isCompleted ? "Marcar como não concluída" : "Marcar como concluída"}
                            >
                              <ToggleCircle $completed={isCompleted}>
                                {isCompleted ? <FaCheck size={10} /> : null}
                              </ToggleCircle>
                            </QuickToggle>
                          </ActivityTitleRow>

                          {activity.description && (
                            <ActivityDescription>
                              {activity.description}
                            </ActivityDescription>
                          )}

                          <ActivityMeta>
                            <MetaItem>
                              <FaClock size={10} />
                              <span>{activity.estimatedTime}min</span>
                            </MetaItem>

                            <MetaItem>
                              <FaStar size={10} />
                              <span>{activity.points} pts</span>
                            </MetaItem>

                            <ActivityTypeBadge $type={activity.type}>
                              {activity.type === 'text' ? 'Texto' :
                                activity.type === 'quiz' ? 'Quiz' :
                                  activity.type === 'video' ? 'Vídeo' :
                                    activity.type === 'checklist' ? 'Checklist' :
                                      activity.type === 'habit' ? 'Hábito' : 'Arquivo'}
                            </ActivityTypeBadge>
                          </ActivityMeta>
                        </ActivityContent>
                      </CardHeader>

                      <CardFooter>
                        <ActionButtons>
                          <DetailButton
                            href={`/student/schedules/${scheduleId}/activities/${activity.id}`}
                            $type={activity.type}
                          >
                            <FaPlay size={12} />
                            Ver Detalhes
                          </DetailButton>

                          {activity.instructions && (
                            <InstructionsButton
                              onClick={() => alert(activity.instructions)}
                              title="Ver instruções"
                            >
                              <FaQuestionCircle size={12} />
                            </InstructionsButton>
                          )}
                        </ActionButtons>

                        <CompletionStatus $completed={isCompleted}>
                          {isCompleted ? (
                            <>
                              <FaCheck size={10} />
                              <span>Concluída • {progress[activity.id]?.completedAt?.toLocaleDateString('pt-BR') || 'Hoje'}</span>
                            </>
                          ) : (
                            <>
                              <FaClock size={10} />
                              <span>Pendente • Clique no círculo para marcar</span>
                            </>
                          )}
                        </CompletionStatus>
                      </CardFooter>
                    </ActivityCard>
                  );
                })
              )}
            </ActivitiesList>
          </DayContent>
        )}

        {/* Navegação entre dias */}
        <NavigationControls>
          <NavButton
            onClick={() => {
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              const currentIndex = days.indexOf(selectedDay!);
              const prevIndex = (currentIndex - 1 + 7) % 7;
              setSelectedDay(days[prevIndex]);
            }}
          >
            <FaChevronLeft size={16} />
            Dia Anterior
          </NavButton>

          <TodayButton
            onClick={() => {
              const today = new Date().getDay();
              const dayMap: { [key: number]: string } = {
                1: 'monday', 2: 'tuesday', 3: 'wednesday',
                4: 'thursday', 5: 'friday', 6: 'saturday', 0: 'sunday'
              };
              setSelectedDay(dayMap[today]);
            }}
          >
            <FaCalendarDay size={16} />
            Hoje
          </TodayButton>

          <NavButton
            onClick={() => {
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              const currentIndex = days.indexOf(selectedDay!);
              const nextIndex = (currentIndex + 1) % 7;
              setSelectedDay(days[nextIndex]);
            }}
          >
            Próximo Dia
            <FaChevronRight size={16} />
          </NavButton>
        </NavigationControls>
      </Content>
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;

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
  flex-shrink: 0;

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const ScheduleHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, ${props => props.$color}15, ${props => props.$color}08);
  border-radius: 12px;
  border: 1px solid ${props => props.$color}20;
`;

const ScheduleIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const SummarySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  margin-bottom: 24px;
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Stat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: linear-gradient(90deg, ${props => props.$color}, ${props => props.$color}dd);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const DaysNavigation = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const DayTab = styled.button<{ $selected: boolean; $color: string }>`
  background: ${props => props.$selected ? props.$color : 'white'};
  color: ${props => props.$selected ? 'white' : '#374151'};
  border: 2px solid ${props => props.$selected ? props.$color : '#e2e8f0'};
  border-radius: 12px;
  padding: 12px;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: ${props => props.$color};
    transform: translateY(-2px);
  }
`;

const DayTabContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const DayAbbreviation = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const DayName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const DayProgress = styled.div<{ $percentage: number }>`
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.$percentage === 100 ? '#10b981' : '#f59e0b'};
  background: ${props => props.$percentage === 100 ? '#10b98115' : '#f59e0b15'};
  padding: 2px 6px;
  border-radius: 8px;
  margin-top: 4px;
`;

const DayContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const DayTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const DayStats = styled.div`
  display: flex;
  gap: 16px;
`;

const DayStat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const DayNotes = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border-left: 4px solid #6366f1;
`;

const NotesTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const NotesText = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityCard = styled.div<{ $completed: boolean; $type: string }>`
  background: ${props => props.$completed ? '#f0fdf4' : 'white'};
  border: 1px solid ${props => props.$completed ? '#10b98140' : '#e2e8f0'};
  border-left: 4px solid ${props => {
    if (props.$completed) return '#10b981';
    switch (props.$type) {
      case 'text': return '#6366f1';
      case 'quiz': return '#f59e0b';
      case 'video': return '#ef4444';
      case 'checklist': return '#10b981';
      case 'file': return '#8b5cf6';
      case 'habit': return '#06b6d4';
      default: return '#6366f1';
    }
  }};
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: ${props => {
    if (props.$completed) return '#10b98160';
    switch (props.$type) {
      case 'text': return '#6366f160';
      case 'quiz': return '#f59e0b60';
      case 'video': return '#ef444460';
      case 'checklist': return '#10b98160';
      case 'file': return '#8b5cf660';
      case 'habit': return '#06b6d460';
      default: return '#6366f160';
    }
  }};
  }
`;

const CardHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const ActivityIconWrapper = styled.div<{ $type: string; $completed: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${props => {
    if (props.$completed) return '#10b98120';
    switch (props.$type) {
      case 'text': return '#6366f120';
      case 'quiz': return '#f59e0b20';
      case 'video': return '#ef444420';
      case 'checklist': return '#10b98120';
      case 'file': return '#8b5cf620';
      case 'habit': return '#06b6d420';
      default: return '#6366f120';
    }
  }};
  color: ${props => {
    if (props.$completed) return '#10b981';
    switch (props.$type) {
      case 'text': return '#6366f1';
      case 'quiz': return '#f59e0b';
      case 'video': return '#ef4444';
      case 'checklist': return '#10b981';
      case 'file': return '#8b5cf6';
      case 'habit': return '#06b6d4';
      default: return '#6366f1';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
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

const ActivityTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.3;
`;

const RequiredIndicator = styled.span`
  color: #dc2626;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
`;

const QuickToggle = styled.button<{ $completed: boolean }>`
  width: 28px;
  height: 28px;
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
  
  &:hover {
    border-color: ${props => props.$completed ? '#dc2626' : '#10b981'};
    background: ${props => props.$completed ? '#fef2f210' : '#10b98110'};
    transform: scale(1.1);
  }
`;

const ToggleCircle = styled.div<{ $completed: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${props => props.$completed ? '#10b981' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 8px;
  transition: all 0.2s ease;
`;

const ActivityDescription = styled.p`
  color: #64748b;
  font-size: 13px;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  
  svg {
    color: #94a3b8;
  }
`;

const ActivityTypeBadge = styled.span<{ $type: string }>`
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
      case 'text': return '#6366f110';
      case 'quiz': return '#f59e0b10';
      case 'video': return '#ef444410';
      case 'checklist': return '#10b98110';
      case 'file': return '#8b5cf610';
      case 'habit': return '#06b6d410';
      default: return '#f1f5f9';
    }
  }};
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const CardFooter = styled.div`
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  margin-top: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const DetailButton = styled(Link) <{ $type: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  background: ${props => {
    switch (props.$type) {
      case 'text': return '#6366f1';
      case 'quiz': return '#f59e0b';
      case 'video': return '#ef4444';
      case 'checklist': return '#10b981';
      case 'file': return '#8b5cf6';
      case 'habit': return '#06b6d4';
      default: return '#6366f1';
    }
  }};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0.9;
  }
`;

const InstructionsButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: #e2e8f0;
    color: #374151;
    transform: translateY(-1px);
  }
`;

const CompletionStatus = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${props => props.$completed ? '#10b981' : '#94a3b8'};
  font-weight: 500;
  
  svg {
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
  }
`;
const NavigationControls = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavButton = styled.button`
  flex: 1;
  background: #f1f5f9;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }
`;

const TodayButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

const EmptyDay = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 8px 0;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  margin: 0;
`;

// Estados de loading e error
const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 16px;
`;

const LoadingText = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  color: #64748b;
  margin: 0 0 24px 0;
`;

// Componente LoadingSpinner
const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;