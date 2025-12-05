// components/activities/HabitActivity.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaFire, FaCalendar, FaCheck, FaRedo, FaStar, FaClock } from 'react-icons/fa';
import { HabitActivity as HabitActivityType } from '@/types/activity.types';

interface HabitActivityProps {
  activity: HabitActivityType;
  studentActivity?: any;
  onSaveDraft: (answers: any) => void;
  onComplete: (answers: any, notes?: string) => void;
  isSubmitting: boolean;
}

export const HabitActivity: React.FC<HabitActivityProps> = ({
  activity,
  studentActivity,
  onSaveDraft,
  onComplete,
  isSubmitting
}) => {
  const [currentStreak, setCurrentStreak] = useState(activity.streak || 0);
  const [maxStreak, setMaxStreak] = useState(activity.maxStreak || 0);
  const [completionHistory, setCompletionHistory] = useState<Date[]>([]);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [mood, setMood] = useState<'very_good' | 'good' | 'neutral' | 'bad' | 'very_bad' | null>(null);
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(studentActivity?.status === 'completed');

  // Inicializar dados do hábito
  useEffect(() => {
    if (studentActivity?.answers) {
      setCurrentStreak(studentActivity.answers.currentStreak || 0);
      setMaxStreak(studentActivity.answers.maxStreak || 0);
      setCompletionHistory(studentActivity.answers.completionHistory?.map((date: string) => new Date(date)) || []);
      setTodayCompleted(studentActivity.answers.todayCompleted || false);
      setMood(studentActivity.answers.mood || null);
      setNotes(studentActivity.notes || '');
    } else {
      setCompletionHistory(activity.completionHistory || []);
      setCurrentStreak(activity.streak || 0);
      setMaxStreak(activity.maxStreak || 0);
    }
  }, [activity, studentActivity]);

  // Verificar se hoje já foi completado
  useEffect(() => {
    const today = new Date().toDateString();
    const todayCompleted = completionHistory.some(
      date => date.toDateString() === today
    );
    setTodayCompleted(todayCompleted);
  }, [completionHistory]);

  const handleCompleteToday = () => {
    if (todayCompleted) return;

    const today = new Date();
    const newCompletionHistory = [...completionHistory, today];
    setCompletionHistory(newCompletionHistory);

    // Calcular nova streak
    const newStreak = calculateStreak(newCompletionHistory);
    setCurrentStreak(newStreak);
    setMaxStreak(prev => Math.max(prev, newStreak));

    // Marcar como completado hoje
    setTodayCompleted(true);

    // Salvar automaticamente
    const answers = {
      currentStreak: newStreak,
      maxStreak: Math.max(maxStreak, newStreak),
      completionHistory: newCompletionHistory,
      todayCompleted: true,
      mood: mood,
      lastCompleted: today.toISOString()
    };

    onSaveDraft(answers);
  };

  const calculateStreak = (history: Date[]): number => {
    if (history.length === 0) return 0;

    const sortedDates = history
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    const today = new Date();

    // Verificar se hoje está incluído
    const hasToday = sortedDates[0].toDateString() === today.toDateString();
    if (!hasToday) return 0;

    // Calcular dias consecutivos
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i - 1];
      const previousDate = sortedDates[i];
      
      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays <= 1.5) { // Permitir até 1.5 dias de diferença (flexibilidade)
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleCompleteActivity = () => {
    const answers = {
      currentStreak,
      maxStreak,
      completionHistory,
      finalMood: mood,
      completedAt: new Date().toISOString()
    };

    onComplete(answers, notes);
    setIsCompleted(true);
  };

  const getMoodIcon = (moodType: string) => {
    switch (moodType) {
      case 'very_good': return '😊';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'bad': return '😔';
      case 'very_bad': return '😢';
      default: return '🎯';
    }
  };

  const getMoodLabel = (moodType: string) => {
    switch (moodType) {
      case 'very_good': return 'Muito Bom';
      case 'good': return 'Bom';
      case 'neutral': return 'Neutro';
      case 'bad': return 'Ruim';
      case 'very_bad': return 'Muito Ruim';
      default: return 'Selecionar';
    }
  };

  const getFrequencyLabel = () => {
    switch (activity.frequency) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return activity.frequency;
    }
  };

  // Calcular estatísticas
  const totalCompletions = completionHistory.length;
  const completionRate = activity.completionHistory ? 
    Math.round((totalCompletions / 30) * 100) : 0; // Baseado em 30 dias

  const recentCompletions = completionHistory
    .slice(-7)
    .map(date => date.toDateString());

  return (
    <Container>
      {/* Header e Estatísticas */}
      <StatsSection>
        <StatCard $color="#f59e0b">
          <StatIcon>
            <FaFire size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{currentStreak}</StatValue>
            <StatLabel>Sequência Atual</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard $color="#8b5cf6">
          <StatIcon>
            <FaStar size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{maxStreak}</StatValue>
            <StatLabel>Melhor Sequência</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard $color="#10b981">
          <StatIcon>
            <FaCalendar size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{totalCompletions}</StatValue>
            <StatLabel>Total de Dias</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard $color="#6366f1">
          <StatIcon>
            <FaCheck size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{completionRate}%</StatValue>
            <StatLabel>Taxa de Conclusão</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsSection>

      {/* Check-in Diário */}
      <CheckinSection>
        <SectionHeader>
          <SectionTitle>Check-in de Hoje</SectionTitle>
          <FrequencyBadge>
            {getFrequencyLabel()}
          </FrequencyBadge>
        </SectionHeader>

        <CheckinCard $completed={todayCompleted}>
          <CheckinHeader>
            <CheckinTitle>
              {todayCompleted ? '✅ Hábito Concluído Hoje' : '🎯 Hábito para Hoje'}
            </CheckinTitle>
            <CheckinDate>
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CheckinDate>
          </CheckinHeader>

          <CheckinContent>
            <HabitDescription>
              {activity.description || 'Pratique este hábito regularmente para desenvolver uma rotina consistente.'}
            </HabitDescription>

            {activity.instructions && (
              <HabitInstructions>
                <InstructionsTitle>Instruções:</InstructionsTitle>
                {activity.instructions}
              </HabitInstructions>
            )}

            {/* Seletor de Humor */}
            {!todayCompleted && (
              <MoodSelection>
                <MoodLabel>Como você está se sentindo?</MoodLabel>
                <MoodOptions>
                  {(['very_good', 'good', 'neutral', 'bad', 'very_bad'] as const).map((moodType) => (
                    <MoodOption
                      key={moodType}
                      $selected={mood === moodType}
                      $mood={moodType}
                      onClick={() => setMood(moodType)}
                    >
                      <MoodEmoji>{getMoodIcon(moodType)}</MoodEmoji>
                      <MoodText>{getMoodLabel(moodType)}</MoodText>
                    </MoodOption>
                  ))}
                </MoodOptions>
              </MoodSelection>
            )}

            {/* Botão de Check-in */}
            <CheckinButton
              onClick={handleCompleteToday}
              disabled={todayCompleted || isSubmitting}
              $completed={todayCompleted}
            >
              {todayCompleted ? (
                <>
                  <FaCheck size={16} />
                  Concluído Hoje
                </>
              ) : isSubmitting ? (
                'Registrando...'
              ) : (
                <>
                  <FaCheck size={16} />
                  Marcar como Feito Hoje
                </>
              )}
            </CheckinButton>
          </CheckinContent>
        </CheckinCard>
      </CheckinSection>

      {/* Histórico e Anotações */}
      <HistorySection>
        <HistoryHeader>
          <HistoryTitle>Histórico Recente</HistoryTitle>
          <HistorySubtitle>Últimos 7 dias</HistorySubtitle>
        </HistoryHeader>

        <HistoryGrid>
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - index);
            const dateString = date.toDateString();
            const isCompleted = recentCompletions.includes(dateString);
            const isToday = index === 0;

            return (
              <HistoryDay key={index} $completed={isCompleted} $today={isToday}>
                <DayName>
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </DayName>
                <DayNumber>
                  {date.getDate()}
                </DayNumber>
                <DayStatus $completed={isCompleted}>
                  {isCompleted ? '✓' : '○'}
                </DayStatus>
              </HistoryDay>
            );
          }).reverse()}
        </HistoryGrid>
      </HistorySection>

      {/* Anotações */}
      <NotesSection>
        <NotesHeader>
          <NotesTitle>Anotações do Hábito</NotesTitle>
          <SaveButton onClick={() => onSaveDraft({ 
            currentStreak, 
            maxStreak, 
            completionHistory, 
            mood,
            notes 
          })}>
            Salvar Anotações
          </SaveButton>
        </NotesHeader>
        
        <NotesTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Registre suas observações, desafios, progressos ou reflexões sobre este hábito..."
          rows={4}
          disabled={isCompleted}
        />
      </NotesSection>

      {/* Conclusão da Atividade */}
      {activity.isRequired && (
        <ActionSection>
          <CompletionInfo>
            {todayCompleted ? (
              <CompletionMessage $ready>
                ✅ Hábito registrado para hoje! Você pode concluir a atividade.
              </CompletionMessage>
            ) : (
              <CompletionMessage>
                ⏳ Complete o check-in de hoje para desbloquear a conclusão
              </CompletionMessage>
            )}
          </CompletionInfo>

          <CompleteButton
            onClick={handleCompleteActivity}
            disabled={!todayCompleted || isSubmitting || isCompleted}
            $completed={isCompleted}
          >
            {isCompleted ? (
              <>
                <FaCheck size={16} />
                Hábito Concluído
              </>
            ) : isSubmitting ? (
              'Concluindo...'
            ) : (
              <>
                <FaCheck size={16} />
                Concluir Hábito
              </>
            )}
          </CompleteButton>
        </ActionSection>
      )}
    </Container>
  );
};

// ========== ESTILOS ==========
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div<{ $color: string }>`
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  border-left: 4px solid ${props => props.$color};
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
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const CheckinSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const FrequencyBadge = styled.span`
  background: #eef2ff;
  color: #6366f1;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const CheckinCard = styled.div<{ $completed: boolean }>`
  padding: 24px;
  background: ${props => props.$completed ? '#f0fdf4' : '#f8fafc'};
  border-top: 1px solid #f1f5f9;
`;

const CheckinHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const CheckinTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const CheckinDate = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const CheckinContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HabitDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const HabitInstructions = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
`;

const InstructionsTitle = styled.strong`
  color: #0369a1;
  display: block;
  margin-bottom: 8px;
`;

const MoodSelection = styled.div`
  margin: 16px 0;
`;

const MoodLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
`;

const MoodOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const MoodOption = styled.button<{ $selected: boolean; $mood: string }>`
  background: ${props => props.$selected ? getMoodColor(props.$mood) : 'white'};
  color: ${props => props.$selected ? 'white' : getMoodColor(props.$mood)};
  border: 2px solid ${props => getMoodColor(props.$mood)};
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MoodEmoji = styled.span`
  font-size: 20px;
`;

const MoodText = styled.span`
  font-size: 12px;
  font-weight: 600;
`;

const CheckinButton = styled.button<{ $completed: boolean }>`
  background: ${props => props.$completed 
    ? '#10b981' 
    : 'linear-gradient(135deg, #10b981, #059669)'
  };
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  }
`;

const HistorySection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const HistoryHeader = styled.div`
  margin-bottom: 20px;
`;

const HistoryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const HistorySubtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const HistoryDay = styled.div<{ $completed: boolean; $today: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 12px;
  background: ${props => props.$today ? '#6366f1' : 'transparent'};
  color: ${props => props.$today ? 'white' : '#64748b'};
  border: 1px solid ${props => props.$today ? '#6366f1' : '#e2e8f0'};
`;

const DayName = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const DayNumber = styled.span`
  font-size: 16px;
  font-weight: 700;
`;

const DayStatus = styled.span<{ $completed: boolean }>`
  font-size: 14px;
  color: ${props => props.$completed ? '#10b981' : '#94a3b8'};
  font-weight: 600;
`;

const NotesSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const NotesTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const SaveButton = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  background: #f8fafc;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const CompletionInfo = styled.div`
  flex: 1;
`;

const CompletionMessage = styled.p<{ $ready?: boolean }>`
  margin: 0;
  font-size: 14px;
  color: ${props => props.$ready ? '#10b981' : '#f59e0b'};
  font-weight: 500;
`;

const CompleteButton = styled.button<{ $completed?: boolean }>`
  background: ${props => props.$completed 
    ? '#10b981' 
    : 'linear-gradient(135deg, #6366f1, #4f46e5)'
  };
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

// Função auxiliar para cores do humor
const getMoodColor = (mood: string): string => {
  const colors = {
    very_good: '#10b981',
    good: '#84cc16',
    neutral: '#f59e0b',
    bad: '#f97316',
    very_bad: '#ef4444'
  };
  return colors[mood as keyof typeof colors] || '#64748b';
};