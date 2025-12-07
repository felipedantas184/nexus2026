// components/schedules/WeekScheduleEditor.tsx - NOVO ARQUIVO
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
  FaRegCircle
} from 'react-icons/fa';
import CreateActivityModal from '@/components/programs/CreateActivityModal';
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

  const handleSaveActivity = (activityData: any) => {
    if (!selectedDay) return;

    const updatedWeekDays = weekDays.map(day => {
      if (day.day !== selectedDay) return day;

      if (editingActivity) {
        // Editar atividade existente
        const updatedActivities = day.activities.map(activity =>
          activity.id === editingActivity.activity.id 
            ? { ...activity, ...activityData }
            : activity
        );
        return { ...day, activities: updatedActivities };
      } else {
        // Adicionar nova atividade
        const newActivity: ScheduleActivity = {
          ...activityData,
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          order: day.activities.length
        };
        return { ...day, activities: [...day.activities, newActivity] };
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

      {/* Modal de Atividade */}
      {selectedDay && (
        <CreateActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => {
            setIsActivityModalOpen(false);
            setSelectedDay(null);
            setEditingActivity(null);
          }}
          onSave={handleSaveActivity}
          moduleId={selectedDay} // Reutilizando a prop moduleId como day
          existingActivities={[]}
          // initialData={editingActivity?.activity}
          // isEditing={!!editingActivity}
        />
      )}
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DayCard = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  min-height: 400px;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const DayInfo = styled.div`
  flex: 1;
`;

const DayName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const DayAbbreviation = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 12px;
`;

const DayStats = styled.div`
  display: flex;
  gap: 8px;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const ActivitiesList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
  line-height: 1.3;
`;

const ActivityDetails = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
`;

const ActivityTime = styled.span`
  font-weight: 500;
`;

const ActivityPoints = styled.span`
  font-weight: 600;
  color: #f59e0b;
`;

const RequiredBadge = styled.span`
  background: #fef2f2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 10px;
`;

const ActivityActions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  background: ${props => props.$danger ? '#fef2f2' : '#f1f5f9'};
  color: ${props => props.$danger ? '#dc2626' : '#64748b'};
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

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
`;

const EmptyIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  margin: 0;
  text-align: center;
`;

const AddActivityButton = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;

  &:hover {
    background: #e2e8f0;
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const DayNotes = styled.div`
  margin-top: auto;
`;

const NotesLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  resize: vertical;
  font-family: inherit;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;