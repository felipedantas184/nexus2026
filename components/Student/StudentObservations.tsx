'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Student, Observation, ObservationType } from '@/types';
import { observationsService } from '@/lib/firebase/services/observationsService';
import { useAuth } from '@/context/AuthContext';
import { FaPlus, FaSearch, FaFilter, FaUser, FaClock, FaLock, FaLockOpen } from 'react-icons/fa';
import CreateObservationModal from './CreateObservationModal';

interface StudentObservationsProps {
  student: Student;
  observations: Observation[];
  onObservationCreated: () => void;
}

export default function StudentObservations({ 
  student, 
  observations, 
  onObservationCreated 
}: StudentObservationsProps) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ObservationType | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar observações
  const filteredObservations = observations.filter(obs => {
    const matchesSearch = obs.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obs.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || obs.authorType === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateObservation = async (formData: {
    text: string;
    authorType: ObservationType;
    isPrivate: boolean;
    tags: string[];
    formData?: any;
  }) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      await observationsService.createObservation({
        studentId: student.id,
        authorId: user.id,
        authorName: user.name,
        authorType: formData.authorType,
        text: formData.text,
        formData: formData.formData,
        isPrivate: formData.isPrivate,
        tags: formData.tags,
        timeStamp: new Date().toLocaleDateString('pt-BR')
      });

      setShowCreateModal(false);
      onObservationCreated();
    } catch (error) {
      console.error('Erro ao criar observação:', error);
      alert('Erro ao criar observação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      {/* Header com ações */}
      <Header>
        <Title>Observações do Aluno</Title>
        <ActionButton onClick={() => setShowCreateModal(true)}>
          <FaPlus size={14} />
          Nova Observação
        </ActionButton>
      </Header>

      {/* Filtros e busca */}
      <Toolbar>
        <SearchBox>
          <FaSearch size={16} />
          <SearchInput
            placeholder="Buscar em observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
        
        <FilterGroup>
          <FaFilter size={14} />
          <FilterSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ObservationType | 'all')}
          >
            <option value="all">Todos os tipos</option>
            <option value="psychologist">Psicólogo</option>
            <option value="psychiatrist">Psiquiatra</option>
            <option value="monitor">Monitor</option>
            <option value="general">Geral</option>
          </FilterSelect>
        </FilterGroup>
      </Toolbar>

      {/* Lista de observações */}
      <ObservationsList>
        {filteredObservations.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📝</EmptyIcon>
            <EmptyTitle>Nenhuma observação encontrada</EmptyTitle>
            <EmptyDescription>
              {observations.length === 0 
                ? 'Ainda não há observações para este aluno.'
                : 'Tente ajustar os filtros de busca.'
              }
            </EmptyDescription>
          </EmptyState>
        ) : (
          filteredObservations.map((observation) => (
            <ObservationCard key={observation.id}>
              <ObservationHeader>
                <AuthorInfo>
                  <AuthorAvatar>
                    <FaUser size={12} />
                  </AuthorAvatar>
                  <AuthorDetails>
                    <AuthorName>{observation.authorName}</AuthorName>
                    <AuthorType>{getObservationTypeLabel(observation.authorType)}</AuthorType>
                  </AuthorDetails>
                </AuthorInfo>
                <ObservationMeta>
                  <TimeInfo>
                    <FaClock size={12} />
                    {new Date(observation.createdAt).toLocaleDateString('pt-BR')}
                    {' • '}
                    {new Date(observation.createdAt).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </TimeInfo>
                  <PrivacyBadge $private={observation.isPrivate}>
                    {observation.isPrivate ? <FaLock size={10} /> : <FaLockOpen size={10} />}
                    {observation.isPrivate ? 'Privada' : 'Pública'}
                  </PrivacyBadge>
                </ObservationMeta>
              </ObservationHeader>

              <ObservationText>{observation.text}</ObservationText>

              {observation.formData && (
                <FormDataSection>
                  <FormDataTitle>Dados Adicionais:</FormDataTitle>
                  <FormDataGrid>
                    {observation.formData.energyLevel && (
                      <FormDataItem>
                        <Label>Nível de Energia:</Label>
                        <Value>{getEnergyLevelLabel(observation.formData.energyLevel)}</Value>
                      </FormDataItem>
                    )}
                    {observation.formData.attentionLevel && (
                      <FormDataItem>
                        <Label>Atenção:</Label>
                        <Value>{getAttentionLevelLabel(observation.formData.attentionLevel)}</Value>
                      </FormDataItem>
                    )}
                    {observation.formData.mood && (
                      <FormDataItem>
                        <Label>Humor:</Label>
                        <Value>{getMoodLabel(observation.formData.mood)}</Value>
                      </FormDataItem>
                    )}
                  </FormDataGrid>
                </FormDataSection>
              )}

              {observation.tags.length > 0 && (
                <TagsSection>
                  {observation.tags.map((tag, index) => (
                    <Tag key={index}>#{tag}</Tag>
                  ))}
                </TagsSection>
              )}
            </ObservationCard>
          ))
        )}
      </ObservationsList>

      {/* Modal de criação */}
      {showCreateModal && (
        <CreateObservationModal
          student={student}
          onSubmit={handleCreateObservation}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </Container>
  );
}

// Funções auxiliares
function getObservationTypeLabel(type: ObservationType): string {
  const labels = {
    psychologist: 'Psicólogo',
    psychiatrist: 'Psiquiatra',
    monitor: 'Monitor',
    general: 'Geral'
  };
  return labels[type] || type;
}

function getEnergyLevelLabel(level: string): string {
  const labels: { [key: string]: string } = {
    very_high: 'Muito Alto',
    high: 'Alto',
    regular: 'Regular',
    low: 'Baixo',
    very_low: 'Muito Baixo'
  };
  return labels[level] || level;
}

function getAttentionLevelLabel(level: string): string {
  const labels: { [key: string]: string } = {
    excellent: 'Excelente',
    good: 'Boa',
    regular: 'Regular',
    low: 'Baixa',
    very_low: 'Muito Baixa'
  };
  return labels[level] || level;
}

function getMoodLabel(mood: string): string {
  const labels: { [key: string]: string } = {
    very_happy: 'Muito Feliz',
    happy: 'Feliz',
    neutral: 'Neutro',
    sad: 'Triste',
    very_sad: 'Muito Triste',
    anxious: 'Ansioso',
    irritable: 'Irritável'
  };
  return labels[mood] || mood;
}

// ========== ESTILOS ==========
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 12px;
  flex: 1;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;

  &::placeholder {
    color: #9ca3af;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
`;

const FilterSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const ObservationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ObservationCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ObservationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
`;

const AuthorType = styled.div`
  font-size: 12px;
  color: #64748b;
  text-transform: capitalize;
`;

const ObservationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #64748b;

  @media (max-width: 640px) {
    align-self: flex-end;
  }
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PrivacyBadge = styled.div<{ $private: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => props.$private ? '#fef3c7' : '#d1fae5'};
  color: ${props => props.$private ? '#92400e' : '#065f46'};
  border: 1px solid ${props => props.$private ? '#fbbf24' : '#34d399'};
`;

const ObservationText = styled.p`
  color: #374151;
  line-height: 1.6;
  margin: 0 0 16px 0;
  white-space: pre-wrap;
`;

const FormDataSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FormDataTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
`;

const FormDataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const FormDataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const Value = styled.span`
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
`;

const TagsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
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
  margin: 0;
`;