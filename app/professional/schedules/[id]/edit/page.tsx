// app/professional/schedules/[id]/edit/page.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaSave,
  FaCalendarAlt,
  FaPalette,
  FaTrash
} from 'react-icons/fa';
import { useSchedules } from '@/hooks/useSchedules';
import WeekScheduleEditor from '@/components/schedules/WeekScheduleEditor';
import { WeeklySchedule } from '@/types/schedule.types';

// Dados de configuração
const availableIcons = ['📅', '⭐', '🚀', '🎯', '💪', '🧠', '❤️', '📚', '🎨', '🔬'];
const availableColors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const { schedules, updateSchedule, deleteSchedule, loading } = useSchedules();
  
  const scheduleId = params.id as string;
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: availableColors[0],
    icon: availableIcons[0],
    isActive: true
  });
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Carregar dados do cronograma
  useEffect(() => {
    if (schedules.length > 0 && scheduleId) {
      const foundSchedule = schedules.find(s => s.id === scheduleId);
      if (foundSchedule) {
        setSchedule(foundSchedule);
        setFormData({
          title: foundSchedule.title,
          description: foundSchedule.description || '',
          color: foundSchedule.color,
          icon: foundSchedule.icon,
          isActive: foundSchedule.isActive
        });
        setWeekDays(foundSchedule.weekDays);
      }
    }
  }, [schedules, scheduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!schedule) return;

    setIsSubmitting(true);
    setError('');

    try {
      await updateSchedule(schedule.id, {
        ...formData,
        weekDays,
        updatedAt: new Date()
      });
      
      router.push('/professional/schedules');
      
    } catch (err: any) {
      console.error('Erro ao atualizar cronograma:', err);
      setError(err.message || 'Erro ao atualizar cronograma');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;

    if (confirm(`Tem certeza que deseja excluir o cronograma "${schedule.title}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteSchedule(schedule.id);
        router.push('/professional/schedules');
      } catch (err: any) {
        console.error('Erro ao excluir cronograma:', err);
        setError(err.message || 'Erro ao excluir cronograma');
      }
    }
  };

  const handleWeekDaysChange = (newWeekDays: any) => {
    setWeekDays(newWeekDays);
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Carregando cronograma...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (!schedule) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Cronograma não encontrado</ErrorTitle>
          <ErrorMessage>O cronograma que você está tentando editar não existe.</ErrorMessage>
          <BackButton href="/professional/schedules">
            <FaArrowLeft size={16} />
            Voltar para Cronogramas
          </BackButton>
        </ErrorState>
      </Container>
    );
  }

  const totalActivities = weekDays.reduce((total, day) => total + day.activities.length, 0);
  const daysWithActivities = weekDays.filter(day => day.activities.length > 0).length;

  return (
    <Container>
      <Header>
        <BackButton href="/professional/schedules">
          <FaArrowLeft size={16} />
          Voltar para Cronogramas
        </BackButton>

        <TitleSection>
          <Title>
            <FaCalendarAlt size={24} />
            Editar Cronograma
          </Title>
          <Subtitle>Atualize a rotina semanal</Subtitle>
        </TitleSection>

        <DeleteButton onClick={handleDelete}>
          <FaTrash size={16} />
          Excluir
        </DeleteButton>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <Content>
        {/* Formulário Básico */}
        <FormSection>
          <SectionTitle>Informações Básicas</SectionTitle>
          
          <FormGrid>
            <InputGroup>
              <Label htmlFor="title">
                Título do Cronograma *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Rotina Semanal, Hábitos Diários..."
                required
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="description">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o objetivo deste cronograma..."
                rows={3}
              />
            </InputGroup>
          </FormGrid>

          <PersonalizationSection>
            <InputGroup>
              <Label>
                Cor do Cronograma
              </Label>
              <ColorGrid>
                {availableColors.map((color) => (
                  <ColorOption
                    key={color}
                    $color={color}
                    $selected={formData.color === color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  >
                    {formData.color === color && <FaPalette size={12} />}
                  </ColorOption>
                ))}
              </ColorGrid>
            </InputGroup>

            <InputGroup>
              <Label>
                Ícone
              </Label>
              <IconGrid>
                {availableIcons.map((icon) => (
                  <IconOption
                    key={icon}
                    $selected={formData.icon === icon}
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </IconOption>
                ))}
              </IconGrid>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="isActive">
                Status
              </Label>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <CheckboxLabel htmlFor="isActive">
                  Cronograma ativo
                </CheckboxLabel>
              </CheckboxGroup>
            </InputGroup>
          </PersonalizationSection>
        </FormSection>

        {/* Editor de Semana */}
        <ScheduleSection>
          <SectionHeader>
            <SectionTitle>Planejamento Semanal</SectionTitle>
            <ScheduleStats>
              <Stat>
                <StatNumber>{totalActivities}</StatNumber>
                <StatLabel>Atividades</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>{daysWithActivities}</StatNumber>
                <StatLabel>Dias com atividades</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>{schedule.assignedStudents.length}</StatNumber>
                <StatLabel>Alunos</StatLabel>
              </Stat>
            </ScheduleStats>
          </SectionHeader>

          <WeekScheduleEditor
            weekDays={weekDays}
            onChange={handleWeekDaysChange}
          />
        </ScheduleSection>

        {/* Ações */}
        <ActionsSection>
          <CancelButton href="/professional/schedules">
            Cancelar
          </CancelButton>
          <SubmitButton
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner $small />
                Salvando...
              </>
            ) : (
              <>
                <FaSave size={16} />
                Salvar Alterações
              </>
            )}
          </SubmitButton>
        </ActionsSection>
      </Content>
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

const DeleteButton = styled.button`
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #fecaca;
    transform: translateY(-1px);
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  resize: vertical;
  font-family: inherit;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const PersonalizationSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const ColorOption = styled.button<{ $color: string; $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color};
  border: 3px solid ${props => props.$selected ? props.$color : 'transparent'};
  outline: ${props => props.$selected ? `2px solid ${props.$color}40` : 'none'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`;

const IconOption = styled.button<{ $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$selected ? '#6366f1' : '#f8fafc'};
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e2e8f0'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    border-color: #6366f1;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
`;

const ScheduleSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
`;

const ScheduleStats = styled.div`
  display: flex;
  gap: 20px;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
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

const ActionsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled(Link)`
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
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

// Componente LoadingSpinner
const LoadingSpinner = styled.div<{ $small?: boolean }>`
  width: ${props => props.$small ? '16px' : '20px'};
  height: ${props => props.$small ? '16px' : '20px'};
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;