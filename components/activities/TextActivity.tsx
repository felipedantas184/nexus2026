// components/activities/TextActivity.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaCheckCircle, FaClock } from 'react-icons/fa';
import { TextActivity as TextActivityType } from '@/types/activity.types';

interface TextActivityProps {
  activity: TextActivityType;
  studentActivity?: any;
  onSaveDraft: (answers: any) => void;
  onComplete: (answers: any, notes?: string) => void;
  isSubmitting: boolean;
}

export const TextActivity: React.FC<TextActivityProps> = ({
  activity,
  studentActivity,
  onSaveDraft,
  onComplete,
  isSubmitting
}) => {
  const [hasRead, setHasRead] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [notes, setNotes] = useState(studentActivity?.notes || '');
  const [isCompleted, setIsCompleted] = useState(studentActivity?.status === 'completed');

  // Timer para controlar tempo de leitura
  useEffect(() => {
    if (!isCompleted && activity.content) {
      const estimatedReadingTime = Math.max(1, Math.ceil(activity.content.length / 1000)); // ~1 min por 1000 chars
      const timer = setInterval(() => {
        setReadingTime(prev => {
          const newTime = prev + 1;
          // Marcar como lido quando atingir 80% do tempo estimado
          if (newTime >= estimatedReadingTime * 0.8 && !hasRead) {
            setHasRead(true);
          }
          return newTime;
        });
      }, 60000); // 1 minuto

      return () => clearInterval(timer);
    }
  }, [activity.content, isCompleted, hasRead]);

  const handleComplete = () => {
    if (!hasRead && readingTime < 1) {
      alert('Por favor, leia o conteúdo antes de completar a atividade.');
      return;
    }

    const answers = {
      read: true,
      readingTime: readingTime,
      completedAt: new Date().toISOString()
    };

    onComplete(answers, notes);
    setIsCompleted(true);
  };

  const handleSaveNotes = () => {
    onSaveDraft({
      read: hasRead,
      readingTime: readingTime,
      notes: notes
    });
  };

  return (
    <Container>
      <ContentSection>
        <SectionHeader>
          <SectionTitle>
            <FaBook size={20} />
            Conteúdo da Atividade
          </SectionTitle>
          <ReadingInfo>
            <ReadingTime>
              <FaClock size={14} />
              Tempo de leitura: {readingTime} min
            </ReadingTime>
            {hasRead && (
              <ReadStatus>
                <FaCheckCircle size={14} />
                Conteúdo lido
              </ReadStatus>
            )}
          </ReadingInfo>
        </SectionHeader>

        <ContentContainer>
          {activity.richText ? (
            <RichTextContent 
              dangerouslySetInnerHTML={{ __html: activity.content }} 
            />
          ) : (
            <PlainTextContent>
              {activity.content.split('\n').map((paragraph, index) => (
                <Paragraph key={index}>
                  {paragraph}
                </Paragraph>
              ))}
            </PlainTextContent>
          )}
        </ContentContainer>

        {activity.instructions && (
          <InstructionsBox>
            <InstructionsTitle>Instruções:</InstructionsTitle>
            <InstructionsText>{activity.instructions}</InstructionsText>
          </InstructionsBox>
        )}
      </ContentSection>

      <NotesSection>
        <NotesHeader>
          <NotesTitle>Suas Anotações</NotesTitle>
          <SaveButton onClick={handleSaveNotes}>
            Salvar Anotações
          </SaveButton>
        </NotesHeader>
        
        <NotesTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Escreva suas anotações, reflexões ou dúvidas sobre o conteúdo..."
          rows={6}
          disabled={isCompleted}
        />
        
        <NotesHint>
          Suas anotações ficarão salvas e poderão ser revisadas posteriormente.
        </NotesHint>
      </NotesSection>

      <ActionSection>
        <CompletionInfo>
          {!hasRead ? (
            <CompletionHint>
              ⏳ Leia o conteúdo completo para desbloquear a conclusão
            </CompletionHint>
          ) : (
            <CompletionHint $ready>
              ✅ Você já pode concluir a atividade
            </CompletionHint>
          )}
        </CompletionInfo>

        <CompleteButton
          onClick={handleComplete}
          disabled={!hasRead || isSubmitting || isCompleted}
          $completed={isCompleted}
        >
          {isCompleted ? (
            <>
              <FaCheckCircle size={16} />
              Atividade Concluída
            </>
          ) : isSubmitting ? (
            'Concluindo...'
          ) : (
            <>
              <FaCheckCircle size={16} />
              Concluir Leitura
            </>
          )}
        </CompleteButton>
      </ActionSection>
    </Container>
  );
};

// ========== ESTILOS ==========
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const ReadingInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #64748b;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ReadingTime = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
`;

const ReadStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #10b981;
  font-weight: 600;
`;

const ContentContainer = styled.div`
  line-height: 1.7;
  color: #374151;
`;

const RichTextContent = styled.div`
  h1, h2, h3, h4 {
    color: #0f172a;
    margin: 24px 0 16px 0;
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }

  p {
    margin: 16px 0;
  }

  ul, ol {
    margin: 16px 0;
    padding-left: 24px;
  }

  li {
    margin: 8px 0;
  }

  blockquote {
    border-left: 4px solid #6366f1;
    padding-left: 16px;
    margin: 20px 0;
    font-style: italic;
    color: #64748b;
  }

  strong {
    font-weight: 600;
    color: #0f172a;
  }

  em {
    font-style: italic;
  }
`;

const PlainTextContent = styled.div`
  font-size: 16px;
  white-space: pre-wrap;
`;

const Paragraph = styled.p`
  margin: 16px 0;
  line-height: 1.7;
`;

const InstructionsBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
`;

const InstructionsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0369a1;
  margin: 0 0 8px 0;
`;

const InstructionsText = styled.p`
  color: #0c4a6e;
  margin: 0;
  line-height: 1.5;
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

const NotesHint = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 8px 0 0 0;
  text-align: center;
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

const CompletionHint = styled.p<{ $ready?: boolean }>`
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