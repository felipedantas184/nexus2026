// app/professional/schedules/page.tsx - NOVO ARQUIVO
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaPlus,
  FaCalendarAlt,
  FaUsers,
  FaEdit,
  FaTrash,
  FaCopy,
  FaSearch,
  FaFilter,
  FaSync
} from 'react-icons/fa';
import { useSchedules } from '@/hooks/useSchedules';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SchedulesPage() {
  const { schedules, loading, error, deleteSchedule } = useSchedules();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && schedule.isActive) ||
                         (filterStatus === 'inactive' && !schedule.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteSchedule = async (scheduleId: string, scheduleTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir o cronograma "${scheduleTitle}"?`)) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        console.error('Erro ao excluir cronograma:', error);
        alert('Erro ao excluir cronograma. Tente novamente.');
      }
    }
  };

  const getTotalActivities = (schedule: any) => {
    return schedule.weekDays.reduce((total: number, day: any) => 
      total + (day.activities?.length || 0), 0
    );
  };

  const getDayNames = (schedule: any) => {
    const daysWithActivities = schedule.weekDays
      .filter((day: any) => day.activities?.length > 0)
      .map((day: any) => {
        const dayNames: { [key: string]: string } = {
          monday: 'Seg',
          tuesday: 'Ter',
          wednesday: 'Qua',
          thursday: 'Qui',
          friday: 'Sex',
          saturday: 'Sáb',
          sunday: 'Dom'
        };
        return dayNames[day.day];
      });
    
    return daysWithActivities.slice(0, 3).join(', ') + 
           (daysWithActivities.length > 3 ? '...' : '');
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Carregando cronogramas...</LoadingText>
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
          <RetryButton onClick={() => window.location.reload()}>
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
            Cronogramas
          </Title>
          <Subtitle>Gerencie rotinas semanais para seus alunos</Subtitle>
        </TitleSection>

        <CreateButton href="/professional/schedules/create">
          <FaPlus size={16} />
          Novo Cronograma
        </CreateButton>
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
        {filteredSchedules.map((schedule) => (
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

            <ScheduleStats>
              <Stat>
                <StatNumber>{getTotalActivities(schedule)}</StatNumber>
                <StatLabel>Atividades</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>{schedule.assignedStudents.length}</StatNumber>
                <StatLabel>Alunos</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>
                  {schedule.weekDays.filter((day: any) => day.activities?.length > 0).length}
                </StatNumber>
                <StatLabel>Dias</StatLabel>
              </Stat>
            </ScheduleStats>

            <ScheduleDetails>
              <DetailItem>
                <DetailLabel>Dias com atividades:</DetailLabel>
                <DetailValue>{getDayNames(schedule)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Criado em:</DetailLabel>
                <DetailValue>
                  {schedule.createdAt.toLocaleDateString('pt-BR')}
                </DetailValue>
              </DetailItem>
            </ScheduleDetails>

            <ScheduleActions>
              <ActionButton href={`/professional/schedules/${schedule.id}/edit`}>
                <FaEdit size={14} />
                Editar
              </ActionButton>
              <ActionButton href={`/professional/schedules/${schedule.id}/assign`}>
                <FaUsers size={14} />
                Atribuir
              </ActionButton>
              <ActionButtonNoLink $secondary onClick={() => handleDeleteSchedule(schedule.id, schedule.title)}>
                <FaTrash size={14} />
                Excluir
              </ActionButtonNoLink>
            </ScheduleActions>
          </ScheduleCard>
        ))}
      </SchedulesGrid>

      {filteredSchedules.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <FaCalendarAlt size={48} />
          </EmptyIcon>
          <EmptyTitle>
            {schedules.length === 0 ? 'Nenhum cronograma criado' : 'Nenhum cronograma encontrado'}
          </EmptyTitle>
          <EmptyDescription>
            {schedules.length === 0 
              ? 'Crie seu primeiro cronograma para organizar rotinas semanais'
              : 'Tente ajustar os filtros ou termos de busca'
            }
          </EmptyDescription>
          <CreateButton $large href="/professional/schedules/create">
            <FaPlus size={16} />
            Criar Primeiro Cronograma
          </CreateButton>
        </EmptyState>
      )}
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  padding: 32px;
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

const CreateButton = styled(Link)<{ $large?: boolean }>`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 12px;
  padding: ${props => props.$large ? '16px 24px' : '12px 20px'};
  font-size: ${props => props.$large ? '16px' : '14px'};
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
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

const ScheduleStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const Stat = styled.div`
  text-align: center;
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
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ScheduleDetails = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
`;

const ScheduleActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(Link)<{ $secondary?: boolean }>`
  flex: 1;
  background: ${props => props.$secondary ? '#f8fafc' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${props => props.$secondary ? '#374151' : 'white'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
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
    box-shadow: ${props => props.$secondary 
      ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(99, 102, 241, 0.3)'
    };
  }
`;

const ActionButtonNoLink = styled.button<{ $secondary?: boolean }>`
  flex: 1;
  background: ${props => props.$secondary ? '#f8fafc' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${props => props.$secondary ? '#374151' : 'white'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
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
    box-shadow: ${props => props.$secondary 
      ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(99, 102, 241, 0.3)'
    };
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