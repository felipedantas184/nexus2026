// app/student/schedules/page.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaPlayCircle,
  FaSearch,
  FaFilter,
  FaSync,
  FaList,
  FaCalendarDay
} from 'react-icons/fa';
import { schedulesService } from '@/lib/firebase/services/schedulesService';
import { WeeklySchedule } from '@/types/schedule.types';
import { useAuth } from '@/context/AuthContext';

export default function StudentSchedulesPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Carregar cronogramas do aluno
  const loadSchedules = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const studentSchedules = await schedulesService.getStudentSchedules(user.id);
      setSchedules(studentSchedules);
    } catch (err: any) {
      console.error('Erro ao carregar cronogramas:', err);
      setError(err.message || 'Erro ao carregar cronogramas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSchedules();
    }
  }, [user?.id]);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && schedule.isActive) ||
                         (filterStatus === 'inactive' && !schedule.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const getTodayActivities = (schedule: WeeklySchedule) => {
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const dayMap: { [key: number]: string } = {
      0: 'sunday',
      1: 'monday', 
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    const todayKey = dayMap[today];
    const todaySchedule = schedule.weekDays.find(day => day.day === todayKey);
    return todaySchedule?.activities || [];
  };

  const getTotalActivities = (schedule: WeeklySchedule) => {
    return schedule.weekDays.reduce((total, day) => total + day.activities.length, 0);
  };

  const getTotalPoints = (schedule: WeeklySchedule) => {
    return schedule.weekDays.reduce((total, day) => 
      total + day.activities.reduce((dayTotal, activity) => dayTotal + (activity.points || 0), 0), 0
    );
  };

  const getProgress = (schedule: WeeklySchedule) => {
    // Simulação de progresso - na implementação real, buscar do banco
    const totalActivities = getTotalActivities(schedule);
    const completedActivities = Math.floor(totalActivities * 0.3); // 30% para exemplo
    return {
      completed: completedActivities,
      total: totalActivities,
      percentage: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
    };
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Carregando seus cronogramas...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <ErrorIcon>
            <FaCalendarAlt size={48} />
          </ErrorIcon>
          <ErrorTitle>Erro ao carregar cronogramas</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={loadSchedules}>
            <FaSync size={16} />
            Tentar Novamente
          </RetryButton>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>
            <FaCalendarAlt size={24} />
            Meus Cronogramas
          </Title>
          <Subtitle>Acompanhe suas rotinas e atividades semanais</Subtitle>
        </TitleSection>

        <TodayButton href="/student/schedules/today">
          <FaCalendarDay size={16} />
          Hoje
        </TodayButton>
      </Header>

      {/* Filtros e Busca */}
      <FiltersSection>
        <SearchBox>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Buscar cronogramas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterGroup>
          <FilterLabel>
            <FaFilter size={14} />
            Status:
          </FilterLabel>
          <FilterSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </FilterSelect>
        </FilterGroup>

        <ScheduleCount>
          {filteredSchedules.length} de {schedules.length} cronogramas
        </ScheduleCount>
      </FiltersSection>

      {/* Lista de Cronogramas */}
      <SchedulesGrid>
        {filteredSchedules.map((schedule) => {
          const progress = getProgress(schedule);
          const todayActivities = getTodayActivities(schedule);
          const totalActivities = getTotalActivities(schedule);
          const totalPoints = getTotalPoints(schedule);

          return (
            <ScheduleCard key={schedule.id}>
              <ScheduleHeader $color={schedule.color}>
                <ScheduleIcon>
                  {schedule.icon}
                </ScheduleIcon>
                <ScheduleInfo>
                  <ScheduleTitle>{schedule.title}</ScheduleTitle>
                  <ScheduleDescription>
                    {schedule.description || 'Sem descrição'}
                  </ScheduleDescription>
                </ScheduleInfo>
                <ScheduleStatus $active={schedule.isActive}>
                  {schedule.isActive ? 'Ativo' : 'Inativo'}
                </ScheduleStatus>
              </ScheduleHeader>

              {/* Progresso */}
              <ProgressSection>
                <ProgressHeader>
                  <ProgressLabel>Progresso Geral</ProgressLabel>
                  <ProgressPercentage>{progress.percentage}%</ProgressPercentage>
                </ProgressHeader>
                <ProgressBar>
                  <ProgressFill $percentage={progress.percentage} $color={schedule.color} />
                </ProgressBar>
                <ProgressStats>
                  <ProgressStat>
                    {progress.completed}/{progress.total} atividades
                  </ProgressStat>
                </ProgressStats>
              </ProgressSection>

              {/* Estatísticas */}
              <ScheduleStats>
                <Stat>
                  <StatIcon>
                    <FaList size={14} />
                  </StatIcon>
                  <StatInfo>
                    <StatNumber>{totalActivities}</StatNumber>
                    <StatLabel>Atividades</StatLabel>
                  </StatInfo>
                </Stat>
                <Stat>
                  <StatIcon>
                    <FaStar size={14} />
                  </StatIcon>
                  <StatInfo>
                    <StatNumber>{totalPoints}</StatNumber>
                    <StatLabel>Pontos</StatLabel>
                  </StatInfo>
                </Stat>
                <Stat>
                  <StatIcon>
                    <FaClock size={14} />
                  </StatIcon>
                  <StatInfo>
                    <StatNumber>{todayActivities.length}</StatNumber>
                    <StatLabel>Hoje</StatLabel>
                  </StatInfo>
                </Stat>
              </ScheduleStats>

              {/* Atividades de Hoje */}
              {todayActivities.length > 0 && (
                <TodaySection>
                  <TodayTitle>Atividades de Hoje</TodayTitle>
                  <TodayActivities>
                    {todayActivities.slice(0, 3).map((activity, index) => (
                      <TodayActivity key={activity.id}>
                        <ActivityIcon>
                          {getActivityIcon(activity.type)}
                        </ActivityIcon>
                        <ActivityName>
                          {activity.title}
                        </ActivityName>
                        <ActivityTime>
                          {activity.estimatedTime}min
                        </ActivityTime>
                      </TodayActivity>
                    ))}
                    {todayActivities.length > 3 && (
                      <MoreActivities>
                        +{todayActivities.length - 3} mais atividades
                      </MoreActivities>
                    )}
                  </TodayActivities>
                </TodaySection>
              )}

              {/* Ações */}
              <ScheduleActions>
                <ViewButton href={`/student/schedules/${schedule.id}`}>
                  <FaPlayCircle size={14} />
                  Ver Cronograma
                </ViewButton>
                {todayActivities.length > 0 && (
                  <TodayButtonSmall href={`/student/schedules/${schedule.id}?day=today`}>
                    <FaCheckCircle size={14} />
                    Ver Hoje
                  </TodayButtonSmall>
                )}
              </ScheduleActions>
            </ScheduleCard>
          );
        })}
      </SchedulesGrid>

      {filteredSchedules.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <FaCalendarAlt size={48} />
          </EmptyIcon>
          <EmptyTitle>
            {schedules.length === 0 ? 'Nenhum cronograma atribuído' : 'Nenhum cronograma encontrado'}
          </EmptyTitle>
          <EmptyDescription>
            {schedules.length === 0 
              ? 'Seu profissional ainda não atribuiu nenhum cronograma para você'
              : 'Tente ajustar os filtros ou termos de busca'
            }
          </EmptyDescription>
        </EmptyState>
      )}
    </Container>
  );
}

// Função auxiliar para ícones de atividades
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

// ========== ESTILOS ==========
const Container = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const TodayButton = styled(Link)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  }
`;

const FiltersSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const ScheduleCount = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
`;

const SchedulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ScheduleCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ScheduleHeader = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${props => props.$color}15, ${props => props.$color}08);
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const ScheduleIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ScheduleInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ScheduleTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ScheduleDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ScheduleStatus = styled.span<{ $active: boolean }>`
  background: ${props => props.$active ? '#10b98115' : '#6b728015'};
  color: ${props => props.$active ? '#10b981' : '#6b7280'};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ProgressSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const ProgressPercentage = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: linear-gradient(90deg, ${props => props.$color}, ${props => props.$color}dd);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressStat = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const ScheduleStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const TodaySection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const TodayTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px 0;
`;

const TodayActivities = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TodayActivity = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
`;

const ActivityIcon = styled.span`
  font-size: 14px;
`;

const ActivityName = styled.span`
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActivityTime = styled.span`
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 8px;
`;

const MoreActivities = styled.div`
  text-align: center;
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
  padding: 8px;
  background: #eef2ff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e7ff;
  }
`;

const ScheduleActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ViewButton = styled(Link)`
  flex: 2;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const TodayButtonSmall = styled(Link)`
  flex: 1;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

// Estados vazios e loading
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

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
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

const RetryButton = styled.button`
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
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 14px;
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