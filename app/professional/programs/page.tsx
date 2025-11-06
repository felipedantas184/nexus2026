// app/professional/programs/page.tsx - ATUALIZADO COMPLETO
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaBook, 
  FaUsers, 
  FaChartLine,
  FaEdit,
  FaArchive,
  FaCopy,
  FaPlay,
  FaPause,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Program, ProgramStatus } from '@/types';
import { usePrograms } from '@/hooks/usePrograms';

export default function ProgramsPage() {
  const { programs, loading, error, refreshPrograms } = usePrograms();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | 'all'>('all');

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ProgramStatus) => {
    const colors = {
      draft: '#6b7280',
      active: '#10b981',
      paused: '#f59e0b',
      completed: '#6366f1',
      archived: '#ef4444'
    };
    return colors[status];
  };

  const getStatusIcon = (status: ProgramStatus) => {
    const icons = {
      draft: FaEdit,
      active: FaPlay,
      paused: FaPause,
      completed: FaChartLine,
      archived: FaArchive
    };
    return icons[status];
  };

  const getAverageProgress = (program: Program) => {
    if (!program.assignedStudents || program.assignedStudents.length === 0) return 0;
    const total = program.assignedStudents.reduce((sum, assignment) => sum + assignment.progress?.totalProgress, 0);
    return Math.round(total / program.assignedStudents.length);
  };

  // Calcular estatísticas em tempo real
  const stats = {
    totalPrograms: programs.length,
    activePrograms: programs.filter(p => p.status === 'active').length,
    totalStudents: programs.reduce((total, program) => 
      total + (program.assignedStudents?.length || 0), 0),
    averageProgress: programs.length > 0 
      ? Math.round(programs.reduce((total, program) => {
          if (program.assignedStudents?.length === 0) return total;
          const avg = getAverageProgress(program);
          return total + avg;
        }, 0) / (programs.filter(p => p.assignedStudents && p.assignedStudents.length > 0).length || 1))
      : 0
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <FaSync className="spinner" size={32} />
          <LoadingText>Carregando seus programas...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <ErrorIcon>
            <FaExclamationTriangle size={48} />
          </ErrorIcon>
          <ErrorTitle>Erro ao carregar programas</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={refreshPrograms}>
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
          <Title>Programas Educacionais</Title>
          <Subtitle>Gerencie e crie programas de aprendizado</Subtitle>
        </TitleSection>
        
        <ActionsSection>
          <SearchBox>
            <FaSearch size={16} color="#64748b" />
            <SearchInput
              placeholder="Buscar programas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProgramStatus | 'all')}
          >
            <option value="all">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Concluído</option>
            <option value="archived">Arquivado</option>
          </FilterSelect>
          
          <CreateButton href="/professional/programs/create">
            <FaPlus size={16} />
            Novo Programa
          </CreateButton>
        </ActionsSection>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#6366f1">
            <FaBook size={20} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.totalPrograms}</StatNumber>
            <StatLabel>Total de Programas</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="#10b981">
            <FaPlay size={20} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.activePrograms}</StatNumber>
            <StatLabel>Programas Ativos</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="#8b5cf6">
            <FaUsers size={20} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.totalStudents}</StatNumber>
            <StatLabel>Alunos Ativos</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="#f59e0b">
            <FaChartLine size={20} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.averageProgress}%</StatNumber>
            <StatLabel>Progresso Médio</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {programs.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaBook size={48} />
          </EmptyIcon>
          <EmptyTitle>Nenhum programa criado</EmptyTitle>
          <EmptyDescription>
            Comece criando seu primeiro programa educacional
          </EmptyDescription>
          <CreateButton href="/professional/programs/create" $large>
            <FaPlus size={16} />
            Criar Primeiro Programa
          </CreateButton>
        </EmptyState>
      ) : (
        <>
          <ProgramsGrid>
            {filteredPrograms.map((program) => {
              const StatusIcon = getStatusIcon(program.status);
              const averageProgress = getAverageProgress(program);
              const totalActivities = program.modules?.reduce((total, module) => 
                total + (module.activities?.length || 0), 0) || 0;
              
              return (
                <ProgramCard key={program.id}>
                  <ProgramHeader>
                    <ProgramIcon $color={program.color}>
                      {program.icon}
                    </ProgramIcon>
                    <ProgramInfo>
                      <ProgramTitle>{program.title}</ProgramTitle>
                      <ProgramDescription>
                        {program.description || 'Sem descrição'}
                      </ProgramDescription>
                    </ProgramInfo>
                    <ProgramStatusBadge $color={getStatusColor(program.status)}>
                      <StatusIcon size={12} />
                      {program.status === 'draft' && 'Rascunho'}
                      {program.status === 'active' && 'Ativo'}
                      {program.status === 'paused' && 'Pausado'}
                      {program.status === 'completed' && 'Concluído'}
                      {program.status === 'archived' && 'Arquivado'}
                    </ProgramStatusBadge>
                  </ProgramHeader>

                  <ProgramStats>
                    <Stat>
                      <StatValue>{program.modules?.length || 0}</StatValue>
                      <StatLabel>Módulos</StatLabel>
                    </Stat>
                    <Stat>
                      <StatValue>{program.assignedStudents?.length || 0}</StatValue>
                      <StatLabel>Alunos</StatLabel>
                    </Stat>
                    <Stat>
                      <StatValue>{program.estimatedDuration}min</StatValue>
                      <StatLabel>Duração</StatLabel>
                    </Stat>
                  </ProgramStats>

                  {(program.assignedStudents && program.assignedStudents.length > 0) && (
                    <ProgressSection>
                      <ProgressHeader>
                        <ProgressLabel>Progresso Médio</ProgressLabel>
                        <ProgressPercentage>{averageProgress}%</ProgressPercentage>
                      </ProgressHeader>
                      <ProgressBar>
                        <ProgressFill $width={`${averageProgress}%`} $color={program.color} />
                      </ProgressBar>
                    </ProgressSection>
                  )}

                  {program.tags && program.tags.length > 0 && (
                    <ProgramTags>
                      {program.tags.slice(0, 3).map((tag, index) => (
                        <Tag key={index}>#{tag}</Tag>
                      ))}
                      {program.tags.length > 3 && (
                        <Tag>+{program.tags.length - 3}</Tag>
                      )}
                    </ProgramTags>
                  )}

                  <ProgramActions>
                    <ActionButton href={`/professional/programs/${program.id}`}>
                      <FaEdit size={14} />
                      Editar
                    </ActionButton>
                    <ActionButton href={`/professional/programs/${program.id}/assign`}>
                      <FaUsers size={14} />
                      Atribuir
                    </ActionButton>
                    <ActionButtonNoLink $secondary>
                      <FaCopy size={14} />
                      Duplicar
                    </ActionButtonNoLink>
                  </ProgramActions>
                </ProgramCard>
              );
            })}
          </ProgramsGrid>

          {filteredPrograms.length === 0 && searchTerm && (
            <EmptySearchState>
              <EmptySearchIcon>
                <FaSearch size={32} />
              </EmptySearchIcon>
              <EmptySearchTitle>Nenhum programa encontrado</EmptySearchTitle>
              <EmptySearchDescription>
                Não encontramos programas correspondentes a "{searchTerm}"
              </EmptySearchDescription>
              <ClearSearchButton onClick={() => setSearchTerm('')}>
                Limpar busca
              </ClearSearchButton>
            </EmptySearchState>
          )}
        </>
      )}
    </Container>
  );
}

// Estilos (a maioria permanece igual, adicionando apenas os novos)
const Container = styled.div`
  padding: 32px;
  background: #f8fafc;
  min-height: 100%;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 16px;
  color: #64748b;

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #64748b;
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

const ErrorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  color: #64748b;
  font-size: 16px;
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
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TitleSection = styled.div`
  flex: 1;
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

const ActionsSection = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: none;
  font-size: 14px;
  width: 100%;
  color: #374151;

  &::placeholder {
    color: #9ca3af;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  color: #374151;
  min-width: 160px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CreateButton = styled(Link)<{ $large?: boolean }>`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 12px;
  padding: ${props => props.$large ? '16px 32px' : '12px 20px'};
  font-size: ${props => props.$large ? '16px' : '14px'};
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 120px 20px;
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
  margin: 0 0 24px 0;
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
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ProgramHeader = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const ProgramIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const ProgramInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProgramTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.3;
`;

const ProgramDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProgramStatusBadge = styled.div<{ $color: string }>`
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const ProgramStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 4px;
`;

const ProgressSection = styled.div`
  margin-top: 8px;
`;

const ProgressHeader = styled.div`
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

const ProgressPercentage = styled.span`
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: string; $color: string }>`
  width: ${props => props.$width};
  height: 100%;
  background: linear-gradient(90deg, ${props => props.$color}, ${props => props.$color}aa);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgramTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  margin-top: auto;
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
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$secondary 
      ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(99, 102, 241, 0.3)'
    };
  }
`;

const EmptySearchState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
`;

const EmptySearchIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const EmptySearchTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const EmptySearchDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 20px 0;
`;

const ClearSearchButton = styled.button`
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }
`;

const ActionButtonNoLink = styled.button<{ $secondary?: boolean; $small?: boolean }>`
  background: ${props => props.$secondary ? '#f8fafc' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${props => props.$secondary ? '#374151' : 'white'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 8px;
  padding: ${props => props.$small ? '8px' : '10px 16px'};
  font-size: ${props => props.$small ? '12px' : '14px'};
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$secondary
    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
    : '0 4px 12px rgba(99, 102, 241, 0.3)'
  };
  }
`;