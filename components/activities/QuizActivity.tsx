// components/activities/QuizActivity.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaQuestionCircle, FaCheck, FaTimes, FaChartBar } from 'react-icons/fa';
import { QuizActivity as QuizActivityType, QuizQuestion } from '@/types/activity.types';

interface QuizActivityProps {
  activity: QuizActivityType;
  studentActivity?: any;
  onSaveDraft: (answers: any) => void;
  onComplete: (answers: any, notes?: string) => void;
  isSubmitting: boolean;
}

interface QuestionState {
  selectedAnswer: string | string[] | null;
  isCorrect: boolean | null;
  showExplanation: boolean;
}

export const QuizActivity: React.FC<QuizActivityProps> = ({
  activity,
  studentActivity,
  onSaveDraft,
  onComplete,
  isSubmitting
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsState, setQuestionsState] = useState<QuestionState[]>([]);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(studentActivity?.status === 'completed');
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  const currentQuestion = activity.questions[currentQuestionIndex];
  const totalQuestions = activity.questions.length;
  const passingScore = activity.passingScore || 70;

  // Inicializar estado das questões
  useEffect(() => {
    const initialQuestionsState = activity.questions.map((question, index) => ({
      selectedAnswer: studentActivity?.answers?.[question.id] || null,
      isCorrect: null,
      showExplanation: false
    }));
    setQuestionsState(initialQuestionsState);

    // Restaurar respostas salvas
    if (studentActivity?.answers) {
      setAnswers(studentActivity.answers);
      calculateScore(studentActivity.answers);
    }
  }, [activity.questions, studentActivity]);

  const calculateScore = (userAnswers: { [key: string]: any }) => {
    let correctCount = 0;
    activity.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer && checkAnswer(question, userAnswer)) {
        correctCount++;
      }
    });
    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
    setScore(calculatedScore);
    return calculatedScore;
  };

  const checkAnswer = (question: QuizQuestion, userAnswer: any): boolean => {
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'short_answer') {
      return userAnswer?.toString().toLowerCase().trim() ===
        question.correctAnswer.toString().toLowerCase().trim();
    }
    return false;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: answer
    };
    setAnswers(newAnswers);

    // Atualizar estado da questão atual
    const newQuestionsState = [...questionsState];
    const questionIndex = activity.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      const question = activity.questions[questionIndex];
      const isCorrect = checkAnswer(question, answer);

      newQuestionsState[questionIndex] = {
        ...newQuestionsState[questionIndex],
        selectedAnswer: answer,
        isCorrect: isCorrect,
        showExplanation: true
      };
      setQuestionsState(newQuestionsState);
    }

    // Salvar rascunho automaticamente
    onSaveDraft(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Última questão - calcular score final
      const finalScore = calculateScore(answers);
      setShowResults(true);

      if (finalScore >= passingScore) {
        // Completar atividade automaticamente se passou
        setTimeout(() => {
          handleComplete();
        }, 2000);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = () => {
    const finalAnswers = {
      ...answers,
      score: score,
      passed: score >= passingScore,
      completedAt: new Date().toISOString()
    };

    onComplete(finalAnswers);
    setIsCompleted(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setQuestionsState(activity.questions.map(() => ({
      selectedAnswer: null,
      isCorrect: null,
      showExplanation: false
    })));
    setAnswers({});
    setScore(0);
    setShowResults(false);
  };

  const getAnswerStatus = (questionIndex: number, option: string) => {
    const questionState = questionsState[questionIndex];
    if (!questionState?.showExplanation) return null;

    const question = activity.questions[questionIndex];
    const isSelected = questionState.selectedAnswer === option;
    const isCorrect = option === question.correctAnswer;

    if (isSelected && isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    if (!isSelected && isCorrect) return 'correct-not-selected';
    return null;
  };

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  if (isCompleted) {
    return (
      <Container>
        <CompletionScreen>
          <CompletionIcon $passed={score >= passingScore}>
            {score >= passingScore ? <FaCheck size={48} /> : <FaTimes size={48} />}
          </CompletionIcon>
          <CompletionTitle>
            {score >= passingScore ? 'Parabéns! 🎉' : 'Tente Novamente'}
          </CompletionTitle>
          <CompletionMessage>
            {score >= passingScore
              ? `Você completou o quiz com ${score}% de acerto!`
              : `Você obteve ${score}%, mas precisa de ${passingScore}% para passar.`
            }
          </CompletionMessage>
          <ScoreDisplay $passed={score >= passingScore}>
            {score}% de acerto
          </ScoreDisplay>
          {!isSubmitting && (
            <ActionButton onClick={handleRetry}>
              Tentar Novamente
            </ActionButton>
          )}
        </CompletionScreen>
      </Container>
    );
  }

  if (showResults) {
    return (
      <Container>
        <ResultsScreen>
          <ResultsHeader>
            <FaChartBar size={32} />
            <ResultsTitle>Resultado do Quiz</ResultsTitle>
          </ResultsHeader>

          <ScoreSection $passed={score >= passingScore}>
            <ScoreValue>{score}%</ScoreValue>
            <ScoreLabel>
              {score >= passingScore ? 'Aprovado!' : 'Reprovado'}
            </ScoreLabel>
            <ScoreDescription>
              {score >= passingScore
                ? `Você acertou ${Math.round((score / 100) * totalQuestions)} de ${totalQuestions} questões!`
                : `Você precisa de ${passingScore}% para passar. Tente novamente!`
              }
            </ScoreDescription>
          </ScoreSection>

          <QuestionsReview>
            <ReviewTitle>Revisão das Questões</ReviewTitle>
            {activity.questions.map((question, index) => (
              <QuestionReviewItem key={question.id} $correct={questionsState[index]?.isCorrect ?? false}>
                <QuestionReviewHeader>
                  <QuestionNumber>Q{index + 1}</QuestionNumber>

                  <QuestionInfoText $correct={questionsState[index]?.isCorrect ?? false}>
                    {questionsState[index]?.isCorrect ? 'Correta' : 'Incorreta'}
                  </QuestionInfoText>
                </QuestionReviewHeader>

                <QuestionText>{question.question}</QuestionText>

                {question.explanation && (
                  <QuestionExplanation>
                    {question.explanation}
                  </QuestionExplanation>
                )}
              </QuestionReviewItem>
            ))}
          </QuestionsReview>

          <ActionButtons>
            <RetryButton onClick={handleRetry}>
              Fazer Novamente
            </RetryButton>
            {score >= passingScore && (
              <CompleteButton onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? 'Concluindo...' : 'Concluir Quiz'}
              </CompleteButton>
            )}
          </ActionButtons>
        </ResultsScreen>
      </Container>
    );
  }

  return (
    <Container>
      {/* Progresso e Header */}
      <QuizHeader>
        <ProgressInfo>
          <QuestionCounter>
            Questão {currentQuestionIndex + 1} de {totalQuestions}
          </QuestionCounter>
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
        </ProgressInfo>

        <ScorePreview>
          Pontuação Mínima: {passingScore}%
        </ScorePreview>
      </QuizHeader>

      {/* Questão Atual */}
      <QuestionCard>
        <QuestionHeader>
          <QuestionIcon>
            <FaQuestionCircle size={24} />
          </QuestionIcon>
          <QuestionText>{currentQuestion.question}</QuestionText>
        </QuestionHeader>

        <OptionsContainer>
          {currentQuestion.options?.map((option, optionIndex) => {
            const status = getAnswerStatus(currentQuestionIndex, option);
            return (
              <OptionButton
                key={optionIndex}
                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                $selected={questionsState[currentQuestionIndex]?.selectedAnswer === option}
                $status={status}
                disabled={questionsState[currentQuestionIndex]?.showExplanation}
              >
                <OptionContent>
                  <OptionText>{option}</OptionText>
                  {status === 'correct' && <FaCheck size={16} />}
                  {status === 'incorrect' && <FaTimes size={16} />}
                </OptionContent>
              </OptionButton>
            );
          })}

          {currentQuestion.type === 'short_answer' && (
            <ShortAnswerInput
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
              placeholder="Digite sua resposta aqui..."
              disabled={questionsState[currentQuestionIndex]?.showExplanation}
            />
          )}
        </OptionsContainer>

        {/* Explicação */}
        {questionsState[currentQuestionIndex]?.showExplanation && currentQuestion.explanation && (
          <ExplanationBox $isCorrect={questionsState[currentQuestionIndex]?.isCorrect ?? false}>
            <ExplanationTitle>
              {questionsState[currentQuestionIndex]?.isCorrect ? '✓ Correto!' : '✗ Incorreto'}
            </ExplanationTitle>
            <ExplanationText>{currentQuestion.explanation}</ExplanationText>
          </ExplanationBox>
        )}
      </QuestionCard>

      {/* Navegação */}
      <Navigation>
        <NavButton
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Anterior
        </NavButton>

        <QuestionStatus>
          {questionsState[currentQuestionIndex]?.selectedAnswer ? 'Respondida' : 'Não respondida'}
        </QuestionStatus>

        <NavButton
          onClick={handleNextQuestion}
          disabled={!questionsState[currentQuestionIndex]?.selectedAnswer}
          $primary
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Ver Resultados' : 'Próxima'}
        </NavButton>
      </Navigation>
    </Container>
  );
};

// ========== ESTILOS ==========
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const ProgressInfo = styled.div`
  flex: 1;
`;

const QuestionCounter = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #4f46e5);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ScorePreview = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 8px;
`;

const QuestionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const QuestionHeader = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const QuestionIcon = styled.div`
  color: #6366f1;
  flex-shrink: 0;
`;

const QuestionText = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionButton = styled.button<{
  $selected?: boolean;
  $status?: string | null;
}>`
  background: ${props => {
    if (props.$status === 'correct') return '#10b981';
    if (props.$status === 'incorrect') return '#ef4444';
    if (props.$status === 'correct-not-selected') return '#d1fae5';
    if (props.$selected) return '#6366f1';
    return '#f8fafc';
  }};
  color: ${props => {
    if (props.$status === 'correct' || props.$status === 'incorrect' || props.$selected)
      return 'white';
    if (props.$status === 'correct-not-selected') return '#065f46';
    return '#374151';
  }};
  border: 2px solid ${props => {
    if (props.$status === 'correct') return '#10b981';
    if (props.$status === 'incorrect') return '#ef4444';
    if (props.$status === 'correct-not-selected') return '#10b981';
    if (props.$selected) return '#6366f1';
    return '#e2e8f0';
  }};
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  font-size: 16px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.8;
  }
`;

const OptionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const OptionText = styled.span`
  flex: 1;
`;

const ShortAnswerInput = styled.input`
  width: 100%;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 16px;
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

const ExplanationBox = styled.div<{ $isCorrect?: boolean }>`
  background: ${props => props.$isCorrect ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.$isCorrect ? '#dcfce7' : '#fecaca'};
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
`;

const ExplanationTitle = styled.h4<{ $isCorrect?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isCorrect ? '#065f46' : '#991b1b'};
  margin: 0 0 8px 0;
`;

const ExplanationText = styled.p<{ $isCorrect?: boolean }>`
  color: ${props => props.$isCorrect ? '#047857' : '#dc2626'};
  margin: 0;
  line-height: 1.5;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary
    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
    : '#f1f5f9'
  };
  color: ${props => props.$primary ? 'white' : '#64748b'};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const QuestionStatus = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

// Telas de Resultado
const CompletionScreen = styled.div`
  text-align: center;
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
`;

const CompletionIcon = styled.div<{ $passed: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.$passed
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #ef4444, #dc2626)'
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
`;

const CompletionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
`;

const CompletionMessage = styled.p`
  font-size: 18px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ScoreDisplay = styled.div<{ $passed: boolean }>`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.$passed ? '#10b981' : '#ef4444'};
  margin: 0 0 32px 0;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const ResultsScreen = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
`;

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const ResultsTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 16px 0 0 0;
`;

const ScoreSection = styled.div<{ $passed: boolean }>`
  text-align: center;
  background: ${props => props.$passed ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.$passed ? '#dcfce7' : '#fecaca'};
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
`;

const ScoreValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: inherit;
  margin-bottom: 8px;
`;

const ScoreLabel = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ScoreDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0;
`;

const QuestionsReview = styled.div`
  margin-bottom: 32px;
`;

const ReviewTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px 0;
`;

const QuestionReviewItem = styled.div<{ $correct?: boolean }>`
  background: ${props => props.$correct ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.$correct ? '#dcfce7' : '#fecaca'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const QuestionReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const QuestionNumber = styled.span`
  font-weight: 600;
  color: #0f172a;
`;

const QuestionInfoText = styled.span<{ $correct?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$correct ? '#065f46' : '#991b1b'};
  background: ${props => props.$correct ? '#d1fae5' : '#fecaca'};
  padding: 4px 8px;
  border-radius: 12px;
`;

const QuestionExplanation = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 8px 0 0 0;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RetryButton = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
`;

const CompleteButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;