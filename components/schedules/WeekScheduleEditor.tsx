'use client';

import { useState } from 'react';
import styled from 'styled-components';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaRegCircle,
  FaCopy
} from 'react-icons/fa';
import QuickActivityModal from './QuickActivityModal'; // NOVO MODAL
import { WeekDaySchedule, ScheduleActivity } from '@/types/schedule.types';

interface WeekScheduleEditorProps {
  weekDays: WeekDaySchedule[];
  onChange: (weekDays: WeekDaySchedule[]) => void;
}

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

export default function WeekScheduleEditor({ weekDays, onChange }: WeekScheduleEditorProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{ day: string; activity: ScheduleActivity } | null>(null);

  const handleAddActivity = (day: string) => {
    setSelectedDay(day);
    setEditingActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (day: string, activity: ScheduleActivity) => {
    setSelectedDay(day);
    setEditingActivity({ day, activity });
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = (activityData: any, repeatDays: string[]) => {
    if (!selectedDay) return;

    const updatedWeekDays = [...weekDays];

    // Para cada dia selecionado (incluindo o dia original)
    repeatDays.forEach(day => {
      const dayIndex = updatedWeekDays.findIndex(d => d.day === day);
      if (dayIndex === -1) return;

      const daySchedule = updatedWeekDays[dayIndex];
      
      if (editingActivity && day === selectedDay) {
        // Editar atividade existente (apenas no dia original)
        const updatedActivities = daySchedule.activities.map(activity =>
          activity.id === editingActivity.activity.id 
            ? { ...activity, ...activityData }
            : activity
        );
        updatedWeekDays[dayIndex] = { ...daySchedule, activities: updatedActivities };
      } else {
        // Adicionar nova atividade (ou copiar para outros dias)
        const newActivity: ScheduleActivity = {
          ...activityData,
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          order: daySchedule.activities.length
        };
        updatedWeekDays[dayIndex] = { 
          ...daySchedule, 
          activities: [...daySchedule.activities, newActivity] 
        };
      }
    });

    onChange(updatedWeekDays);
    setIsActivityModalOpen(false);
    setSelectedDay(null);
    setEditingActivity(null);
  };

  const handleRemoveActivity = (day: string, activityId: string) => {
    if (confirm('Tem certeza que deseja remover esta atividade?')) {
      const updatedWeekDays = weekDays.map(weekDay => {
        if (weekDay.day !== day) return weekDay;
        
        return {
          ...weekDay,
          activities: weekDay.activities.filter(activity => activity.id !== activityId)
        };
      });

      onChange(updatedWeekDays);
    }
  };

  const handleDuplicateActivity = (day: string, activity: ScheduleActivity) => {
    const newActivity: ScheduleActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${activity.title} (Cópia)`,
      order: weekDays.find(d => d.day === day)?.activities.length || 0
    };

    const updatedWeekDays = weekDays.map(weekDay => {
      if (weekDay.day !== day) return weekDay;
      
      return {
        ...weekDay,
        activities: [...weekDay.activities, newActivity]
      };
    });

    onChange(updatedWeekDays);
  };

  const handleUpdateDayNotes = (day: string, notes: string) => {
    const updatedWeekDays = weekDays.map(weekDay =>
      weekDay.day === day ? { ...weekDay, notes } : weekDay
    );

    onChange(updatedWeekDays);
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

  const getTotalTime = (activities: ScheduleActivity[]) => {
    return activities.reduce((total, activity) => total + (activity.estimatedTime || 0), 0);
  };

  const getTotalPoints = (activities: ScheduleActivity[]) => {
    return activities.reduce((total, activity) => total + (activity.points || 0), 0);
  };

  return (
    <Container>
      <HeaderInfo>
        <HeaderTitle>Cronograma Semanal</HeaderTitle>
        <HeaderHint>
          💡 Clique em "Adicionar Atividade" e selecione outros dias para replicar a mesma atividade automaticamente.
        </HeaderHint>
      </HeaderInfo>

      <DaysGrid>
        {weekDays.map((daySchedule) => {
          const totalTime = getTotalTime(daySchedule.activities);
          const totalPoints = getTotalPoints(daySchedule.activities);

          return (
            <DayCard key={daySchedule.day}>
              <DayHeader>
                <DayInfo>
                  <DayName>{dayLabels[daySchedule.day]}</DayName>
                  <DayAbbreviation>{dayShortLabels[daySchedule.day]}</DayAbbreviation>
                </DayInfo>
                <DayStats>
                  <Stat>
                    <FaClock size={12} />
                    {totalTime}min
                  </Stat>
                  <Stat>
                    <FaStar size={12} />
                    {totalPoints}pts
                  </Stat>
                </DayStats>
              </DayHeader>

              <ActivitiesList>
                {daySchedule.activities.map((activity) => (
                  <ActivityItem key={activity.id}>
                    <ActivityIcon>
                      {getActivityIcon(activity.type)}
                    </ActivityIcon>
                    
                    <ActivityContent>
                      <ActivityTitle>{activity.title}</ActivityTitle>
                      <ActivityDetails>
                        <ActivityTime>{activity.estimatedTime}min</ActivityTime>
                        <ActivityPoints>{activity.points}pts</ActivityPoints>
                        {activity.isRequired && <RequiredBadge>Obrigatória</RequiredBadge>}
                      </ActivityDetails>
                    </ActivityContent>

                    <ActivityActions>
                      <ActionButton 
                        onClick={() => handleDuplicateActivity(daySchedule.day, activity)}
                        title="Duplicar atividade"
                      >
                        <FaCopy size={12} />
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleEditActivity(daySchedule.day, activity)}
                        title="Editar atividade"
                      >
                        <FaEdit size={12} />
                      </ActionButton>
                      <ActionButton 
                        $danger
                        onClick={() => handleRemoveActivity(daySchedule.day, activity.id)}
                        title="Remover atividade"
                      >
                        <FaTrash size={12} />
                      </ActionButton>
                    </ActivityActions>
                  </ActivityItem>
                ))}
              </ActivitiesList>

              {daySchedule.activities.length === 0 && (
                <EmptyDay>
                  <EmptyIcon>📅</EmptyIcon>
                  <EmptyText>Nenhuma atividade</EmptyText>
                  <EmptyHint>Clique abaixo para adicionar</EmptyHint>
                </EmptyDay>
              )}

              <AddActivityButton onClick={() => handleAddActivity(daySchedule.day)}>
                <FaPlus size={14} />
                Adicionar Atividade
              </AddActivityButton>

              <DayNotes>
                <NotesLabel>Observações do dia:</NotesLabel>
                <NotesTextarea
                  value={daySchedule.notes || ''}
                  onChange={(e) => handleUpdateDayNotes(daySchedule.day, e.target.value)}
                  placeholder="Adicione observações específicas para este dia..."
                  rows={2}
                />
              </DayNotes>
            </DayCard>
          );
        })}
      </DaysGrid>

      {/* NOVO MODAL OTIMIZADO */}
      {selectedDay && (
        <QuickActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => {
            setIsActivityModalOpen(false);
            setSelectedDay(null);
            setEditingActivity(null);
          }}
          onSave={handleSaveActivity}
          initialDay={selectedDay}
          isEditing={!!editingActivity}
          initialData={editingActivity?.activity}
        />
      )}
    </Container>
  );
}

// ========== ESTILOS ADICIONAIS ==========
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderInfo = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 8px;
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
`;

const HeaderHint = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DayCard = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    border-color: #6366f1;
    box-shadow: 0 8px 25px -5px rgba(99, 102, 241, 0.1);
    transform: translateY(-2px);
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
`;

const DayInfo = styled.div`
  flex: 1;
`;

const DayName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const DayAbbreviation = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: #6366f1;
  background: #eef2ff;
  padding: 4px 10px;
  border-radius: 12px;
  letter-spacing: 0.5px;
`;

const DayStats = styled.div`
  display: flex;
  gap: 12px;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  background: white;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ActivitiesList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  color: white;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActivityDetails = styled.div`
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
  align-items: center;
`;

const ActivityTime = styled.span`
  font-weight: 600;
  background: #f0f9ff;
  padding: 2px 8px;
  border-radius: 6px;
  color: #0369a1;
`;

const ActivityPoints = styled.span`
  font-weight: 700;
  color: #f59e0b;
  background: #fefce8;
  padding: 2px 8px;
  border-radius: 6px;
`;

const RequiredBadge = styled.span`
  background: #fef2f2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const ActivityActions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ActivityItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  background: ${props => props.$danger ? '#fef2f2' : '#f1f5f9'};
  color: ${props => props.$danger ? '#dc2626' : '#64748b'};
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$danger ? '#fecaca' : '#e2e8f0'};
    transform: scale(1.1);
  }
`;

const EmptyDay = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const EmptyHint = styled.p`
  font-size: 12px;
  margin: 0;
  opacity: 0.7;
`;

const AddActivityButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DayNotes = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const NotesLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
  background: white;
  transition: all 0.2s ease;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;