// components/activities/ChecklistActivity.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck, FaList, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { ChecklistActivity as ChecklistActivityType, ChecklistItem } from '@/types/activity.types';

interface ChecklistActivityProps {
  activity: ChecklistActivityType;
  studentActivity?: any;
  onSaveDraft: (answers: any) => void;
  onComplete: (answers: any, notes?: string) => void;
  isSubmitting: boolean;
}

export const ChecklistActivity: React.FC<ChecklistActivityProps> = ({
  activity,
  studentActivity,
  onSaveDraft,
  onComplete,
  isSubmitting
}) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(studentActivity?.status === 'completed');
  const [notes, setNotes] = useState(studentActivity?.notes || '');

  // Inicializar itens
  useEffect(() => {
    if (studentActivity?.answers?.items) {
      // Restaurar itens salvos
      setItems(studentActivity.answers.items);
    } else {
      // Inicializar com itens da atividade
      setItems(activity.items.map(item => ({
        ...item,
        isCompleted: false
      })));
    }
  }, [activity.items, studentActivity]);

  // Calcular progresso
  useEffect(() => {
    const completed = items.filter(item => item.isCompleted).length;
    setCompletedCount(completed);
    
    // Salvar automaticamente quando houver mudanças
    if (items.length > 0) {
      const answers = {
        items: items,
        progress: Math.round((completed / items.length) * 100),
        lastUpdated: new Date().toISOString()
      };
      onSaveDraft(answers);
    }
  }, [items, onSaveDraft]);

  const toggleItem = (itemId: string) => {
    if (isCompleted) return; // Não permitir alterações após conclusão

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      )
    );
  };

  const handleComplete = () => {
    const allCompleted = items.every(item => item.isCompleted);
    if (!allCompleted && activity.isRequired) {
      alert('Por favor, complete todos os itens antes de finalizar a atividade.');
      return;
    }

    const answers = {
      items: items,
      completedAt: new Date().toISOString(),
      progress: 100,
      allItemsCompleted: allCompleted
    };

    onComplete(answers, notes);
    setIsCompleted(true);
  };

  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const allCompleted = items.length > 0 && completedCount === items.length;

  return (
    <Container>
      {/* Header e Progresso */}
      <ActivityHeader>
        <ProgressSection>
          <ProgressInfo>
            <ProgressLabel>Progresso da Checklist</ProgressLabel>
            <ProgressValue>{completedCount}/{items.length} itens</ProgressValue>
          </ProgressInfo>
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
          <ProgressPercentage>{Math.round(progress)}%</ProgressPercentage>
        </ProgressSection>

        {activity.isRequired && (
          <RequirementBadge>
            {allCompleted ? '✓ Todos os itens concluídos' : '⚠️ Todos os itens são obrigatórios'}
          </RequirementBadge>
        )}
      </ActivityHeader>

      {/* Lista de Itens */}
      <ChecklistContainer>
        <ChecklistHeader>
          <FaList size={20} />
          <ChecklistTitle>Itens da Checklist</ChecklistTitle>
        </ChecklistHeader>

        <ItemsList>
          {items.map((item, index) => (
            <ChecklistItemStyled
              key={item.id}
              $completed={item.isCompleted}
              $disabled={isCompleted}
              onClick={() => toggleItem(item.id)}
            >
              <ItemIndicator $completed={item.isCompleted}>
                {item.isCompleted ? (
                  <FaCheckCircle size={16} />
                ) : (
                  <FaRegCircle size={16} />
                )}
              </ItemIndicator>

              <ItemContent>
                <ItemLabel $completed={item.isCompleted}>
                  {item.label}
                </ItemLabel>
                <ItemOrder>#{index + 1}</ItemOrder>
              </ItemContent>

              <ItemStatus $completed={item.isCompleted}>
                {item.isCompleted ? 'Concluído' : 'Pendente'}
              </ItemStatus>
            </ChecklistItemStyled>
          ))}
        </ItemsList>

        {items.length === 0 && (
          <EmptyChecklist>
            <EmptyIcon>📝</EmptyIcon>
            <EmptyTitle>Nenhum item na checklist</EmptyTitle>
            <EmptyDescription>
              Esta checklist não possui itens configurados.
            </EmptyDescription>
          </EmptyChecklist>
        )}
      </ChecklistContainer>

      {/* Área de Anotações */}
      <NotesSection>
        <NotesHeader>
          <NotesTitle>Anotações e Observações</NotesTitle>
          <SaveButton onClick={() => onSaveDraft({ items, notes })}>
            Salvar Anotações
          </SaveButton>
        </NotesHeader>
        
        <NotesTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione observações, comentários ou reflexões sobre esta checklist..."
          rows={4}
          disabled={isCompleted}
        />
      </NotesSection>

      {/* Ação de Conclusão */}
      <ActionSection>
        <CompletionInfo>
          {allCompleted ? (
            <CompletionMessage $ready>
              ✅ Todos os itens foram concluídos! Você pode finalizar a atividade.
            </CompletionMessage>
          ) : (
            <CompletionMessage>
              ⏳ Complete {items.length - completedCount} item(s) restante(s)
            </CompletionMessage>
          )}
        </CompletionInfo>

        <CompleteButton
          onClick={handleComplete}
          disabled={!allCompleted || isSubmitting || isCompleted}
          $completed={isCompleted}
        >
          {isCompleted ? (
            <>
              <FaCheck size={16} />
              Checklist Concluída
            </>
          ) : isSubmitting ? (
            'Concluindo...'
          ) : (
            <>
              <FaCheck size={16} />
              Finalizar Checklist
            </>
          )}
        </CompleteButton>
      </ActionSection>
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

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ProgressSection = styled.div`
  flex: 1;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
`;

const ProgressValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #6366f1;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressPercentage = styled.div`
  font-size: 14px;
  color: #64748b;
  text-align: center;
  font-weight: 600;
`;

const RequirementBadge = styled.div`
  background: #fef3c7;
  color: #92400e;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #fbbf24;
`;

const ChecklistContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
`;

const ChecklistHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
`;

const ChecklistTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChecklistItemStyled = styled.div<{ $completed: boolean; $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: ${props => props.$completed ? '#f0fdf4' : 'white'};
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.7 : 1};

  &:hover {
    background: ${props => props.$disabled 
      ? (props.$completed ? '#f0fdf4' : 'white') 
      : (props.$completed ? '#ecfdf5' : '#f8fafc')
    };
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemIndicator = styled.div<{ $completed: boolean }>`
  color: ${props => props.$completed ? '#10b981' : '#94a3b8'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const ItemLabel = styled.span<{ $completed: boolean }>`
  font-size: 16px;
  color: ${props => props.$completed ? '#64748b' : '#0f172a'};
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  font-weight: ${props => props.$completed ? '400' : '500'};
`;

const ItemOrder = styled.span`
  font-size: 12px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
`;

const ItemStatus = styled.span<{ $completed: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$completed ? '#10b981' : '#f59e0b'};
  background: ${props => props.$completed ? '#dcfce7' : '#fef3c7'};
  padding: 4px 12px;
  border-radius: 12px;
  flex-shrink: 0;
`;

const EmptyChecklist = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #64748b;
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
  font-size: 14px;
  margin: 0;
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
    : 'linear-gradient(135deg, #10b981, #059669)'
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
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  }
`;