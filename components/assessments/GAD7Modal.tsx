// components/assessments/GAD7Modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { gad7Service } from '@/lib/firebase/services/gad7Service';
import styled, { keyframes } from 'styled-components';
import { 
  FaTimes, 
  FaCheck, 
  FaInfoCircle,
  FaChartLine,
  FaCalendarAlt,
  FaArrowRight,
  FaHeart,
  FaBrain,
  FaLeaf,
  FaSun,
  FaMoon,
  FaStar
} from 'react-icons/fa';

interface GAD7ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, severity: string) => void;
  assessmentType: 'first_time' | 'periodic' | 'overdue';
  daysOverdue?: number;
}

const questions = [
  {
    id: 'q1',
    text: 'Sentindo-se nervoso(a), ansioso(a) ou muito tenso(a)',
    options: [
      { value: 0, label: 'Nenhum dia' },
      { value: 1, label: 'Vários dias' },
      { value: 2, label: 'Mais da metade dos dias' },
      { value: 3, label: 'Quase todos os dias' }
    ]
  },
  {
    id: 'q2',
    text: 'Não conseguir parar ou controlar a preocupação',
    options: [
      { value: 0, label: 'Nenhum dia' },
      { value: 1, label: 'Vários dias' },
      { value: 2, label: 'Mais da metade dos dias' },
      { value: 3, label: 'Quase todos os dias' }
    ]
  },
  {
    id: 'q3',
    text: 'Preocupar-se muito com diferentes coisas',
    options: [
      { value: 0, label: 'Nenhum dia' },
      { value: 1, label: 'Vários dias' },
      { value: 2, label: 'Mais da metade dos dias' },
      { value: 3, label: 'Quase todos os dias' }
    ]
  },
  {
    id: 'q4',
    text: 'Dificuldade para relaxar',
    options: [
      { value: 0, label: 'Nenhum dia' },
      { value: 1, label: 'Vários dias' },
      { value: 2, label: 'Mais da metade dos dias' },
      { value: 3, label: 'Quase todos os dias' }
    ]
  },
  {
    id: 'q5',
    text: 'Ficar tão inquieto(a) que é difícil ficar parado(a)',
    options: [
      { value: 0, label: 'Nenhum dia' },
      { value: 1, label: 'Vários dias' },
      { value: 2, label: 'Mais da metade dos dias' },
      { value: 3, label: 'Quase todos os dias' }
    ]
  },
  {
    id: 'q6',
    text: 'Ficar facilmente aborrecido(a) ou irritado(a)',
    options: [
      { value: 0, label: 'Nenhum dia' },
      { value: 1, label: 'Vários dias' },
      { value: 2, label: 'Mais da metade dos dias' },
      { value: 3, label: 'Quase todos os dias' }
    ]
  },
  {
    id: 'q7',
    text: 'Sentir medo como se algo muito ruim fosse acontecer',
    options: [
      { value: 0, label: 'Nenhum dia' },
      { value: 1, label: 'Vários dias' },
      { value: 2, label: 'Mais da metade dos dias' },
      { value: 3, label: 'Quase todos os dias' }
    ]
  }
];

const severityInfo = {
  minimal: {
    title: 'Ansiedade Mínima',
    description: 'Sua pontuação indica níveis mínimos de ansiedade. Continue com suas atividades e práticas de autocuidado.',
    color: '#10b981',
    icon: FaSun
  },
  mild: {
    title: 'Ansiedade Leve',
    description: 'Sua pontuação sugere ansiedade leve. Pode ser útil praticar técnicas de relaxamento regularmente.',
    color: '#f59e0b',
    icon: FaLeaf
  },
  moderate: {
    title: 'Ansiedade Moderada',
    description: 'Sua pontuação indica ansiedade moderada. Considere conversar com um profissional sobre estratégias de gerenciamento.',
    color: '#ef4444',
    icon: FaBrain
  },
  severe: {
    title: 'Ansiedade Severa',
    description: 'Sua pontuação sugere ansiedade severa. Recomendamos buscar apoio profissional para desenvolver um plano de cuidado.',
    color: '#dc2626',
    icon: FaMoon
  }
};

export default function GAD7Modal({ 
  isOpen, 
  onClose, 
  onComplete,
  assessmentType,
  daysOverdue 
}: GAD7ModalProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [severity, setSeverity] = useState<'minimal' | 'mild' | 'moderate' | 'severe'>('minimal');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Resetar estado quando modal abrir
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setScore(0);
      setNotes('');
      setProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    // Calcular progresso
    const answered = Object.keys(answers).length;
    setProgress(Math.round((answered / questions.length) * 100));
  }, [answers]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Avançar para próxima questão automaticamente
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    }
  };

  const calculateScore = () => {
    const total = Object.values(answers).reduce((sum, value) => sum + value, 0);
    setScore(total);
    
    // Determinar severidade
    if (total <= 4) setSeverity('minimal');
    else if (total <= 9) setSeverity('mild');
    else if (total <= 14) setSeverity('moderate');
    else setSeverity('severe');
    
    return total;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Por favor, responda todas as questões antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const totalScore = calculateScore();
      const severityKey = severity;
      
      // Salvar no Firestore
      const result = await gad7Service.saveAssessment(
        user?.id || '',
        {
          q1: answers.q1 || 0,
          q2: answers.q2 || 0,
          q3: answers.q3 || 0,
          q4: answers.q4 || 0,
          q5: answers.q5 || 0,
          q6: answers.q6 || 0,
          q7: answers.q7 || 0
        },
        notes
      );
      
      // Mostrar resultados
      setShowResults(true);
      
      // Disparar callback de conclusão
      setTimeout(() => {
        onComplete(totalScore, severityKey);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Ocorreu um erro ao salvar sua avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (confirm('Deseja realmente pular esta avaliação? Ela será solicitada novamente em breve.')) {
      onClose();
    }
  };

  const getHeaderText = () => {
    switch (assessmentType) {
      case 'first_time':
        return 'Bem-vindo! Vamos conhecer você melhor';
      case 'overdue':
        return `Avaliação atrasada ${daysOverdue ? `há ${daysOverdue} dias` : ''}`;
      default:
        return 'Avaliação Semanal de Acompanhamento';
    }
  };

  const getSubheaderText = () => {
    switch (assessmentType) {
      case 'first_time':
        return 'Esta avaliação ajuda a personalizar sua experiência na plataforma';
      case 'overdue':
        return 'É importante manter as avaliações em dia para acompanhar seu progresso';
      default:
        return 'Como você tem se sentido na última semana?';
    }
  };

  if (!isOpen) return null;

  const SeverityIcon = severityInfo[severity].icon;

  return (
    <ModalOverlay>
      <ModalContainer>
        {/* Header */}
        <ModalHeader>
          <HeaderContent>
            <HeaderTitle>
              {getHeaderText()}
            </HeaderTitle>
            <HeaderSubtitle>
              {getSubheaderText()}
            </HeaderSubtitle>
            
            {assessmentType === 'first_time' && (
              <WelcomeBadge>
                <FaStar size={14} />
                Primeira Avaliação
              </WelcomeBadge>
            )}
          </HeaderContent>
          
          <CloseButton onClick={onClose}>
            <FaTimes size={20} />
          </CloseButton>
        </ModalHeader>

        {/* Progress Bar */}
        <ProgressContainer>
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
          <ProgressText>
            {progress}% concluído • {Object.keys(answers).length}/{questions.length} questões
          </ProgressText>
        </ProgressContainer>

        {!showResults ? (
          <>
            {/* Questions */}
            <QuestionsContainer>
              <QuestionCounter>
                Questão {currentQuestion + 1} de {questions.length}
              </QuestionCounter>
              
              <QuestionCard>
                <QuestionText>
                  {questions[currentQuestion].text}
                </QuestionText>
                
                <OptionsGrid>
                  {questions[currentQuestion].options.map((option) => (
                    <OptionButton
                      key={option.value}
                      $selected={answers[questions[currentQuestion].id] === option.value}
                      onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                    >
                      <OptionValue>{option.value}</OptionValue>
                      <OptionLabel>{option.label}</OptionLabel>
                      {answers[questions[currentQuestion].id] === option.value && (
                        <OptionCheck>
                          <FaCheck size={12} />
                        </OptionCheck>
                      )}
                    </OptionButton>
                  ))}
                </OptionsGrid>
              </QuestionCard>

              {/* Navigation */}
              <Navigation>
                {currentQuestion > 0 && (
                  <NavButton onClick={() => setCurrentQuestion(prev => prev - 1)}>
                    ← Anterior
                  </NavButton>
                )}
                
                <QuestionDots>
                  {questions.map((_, index) => (
                    <QuestionDot 
                      key={index}
                      $active={index === currentQuestion}
                      $answered={answers[questions[index].id] !== undefined}
                      onClick={() => setCurrentQuestion(index)}
                    />
                  ))}
                </QuestionDots>
                
                {currentQuestion < questions.length - 1 ? (
                  <NavButton 
                    $primary
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    disabled={!answers[questions[currentQuestion].id]}
                  >
                    Próxima →
                  </NavButton>
                ) : (
                  <SubmitButton
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length !== questions.length || isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Concluir Avaliação'}
                  </SubmitButton>
                )}
              </Navigation>
            </QuestionsContainer>

            {/* Info Section */}
            <InfoSection>
              <InfoIcon>
                <FaInfoCircle size={16} />
              </InfoIcon>
              <InfoText>
                <strong>GAD-7 (Generalized Anxiety Disorder 7-item scale)</strong> é uma ferramenta validada para rastreamento de ansiedade. Suas respostas são confidenciais e ajudam na personalização do seu acompanhamento.
              </InfoText>
            </InfoSection>

            {/* Optional Notes */}
            {Object.keys(answers).length === questions.length && (
              <NotesSection>
                <NotesLabel>Alguma observação ou contexto que gostaria de compartilhar? (Opcional)</NotesLabel>
                <NotesTextarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Esta semana foi particularmente estressante devido às provas..."
                  rows={3}
                />
              </NotesSection>
            )}

            {/* Skip Button */}
            <SkipButton onClick={handleSkip}>
              Lembrar mais tarde
            </SkipButton>
          </>
        ) : (
          /* Results Screen */
          <ResultsContainer>
            <ResultsHeader>
              <ResultsIcon $color={severityInfo[severity].color}>
                <SeverityIcon size={32} />
              </ResultsIcon>
              
              <ResultsTitle>
                {severityInfo[severity].title}
              </ResultsTitle>
              
              <ResultsScore>
                Pontuação: <ScoreValue $color={severityInfo[severity].color}>{score}/21</ScoreValue>
              </ResultsScore>
            </ResultsHeader>
            
            <ResultsDescription>
              {severityInfo[severity].description}
            </ResultsDescription>
            
            <ResultsDetails>
              <ResultDetail>
                <FaChartLine size={16} />
                <span>Severidade: <strong>{severity}</strong></span>
              </ResultDetail>
              
              <ResultDetail>
                <FaCalendarAlt size={16} />
                <span>Próxima avaliação em: <strong>7 dias</strong></span>
              </ResultDetail>
              
              <ResultDetail>
                <FaHeart size={16} />
                <span>Seu profissional será notificado</span>
              </ResultDetail>
            </ResultsDetails>
            
            <ResultsProgress>
              <ProgressLabel>Interpretação da Pontuação:</ProgressLabel>
              <SeverityScale>
                <SeverityLevel $active={severity === 'minimal'} $color="#10b981">
                  <span>0-4</span>
                  <span>Mínima</span>
                </SeverityLevel>
                <SeverityLevel $active={severity === 'mild'} $color="#f59e0b">
                  <span>5-9</span>
                  <span>Leve</span>
                </SeverityLevel>
                <SeverityLevel $active={severity === 'moderate'} $color="#ef4444">
                  <span>10-14</span>
                  <span>Moderada</span>
                </SeverityLevel>
                <SeverityLevel $active={severity === 'severe'} $color="#dc2626">
                  <span>15-21</span>
                  <span>Severa</span>
                </SeverityLevel>
              </SeverityScale>
              
              <ScoreMarker $position={(score / 21) * 100}>
                <ScoreMarkerDot $color={severityInfo[severity].color} />
                <ScoreMarkerText>Sua pontuação: {score}</ScoreMarkerText>
              </ScoreMarker>
            </ResultsProgress>
            
            <ResultsCTA>
              <CTAText>
                Obrigado por compartilhar! Redirecionando para sua dashboard...
              </CTAText>
              <LoadingSpinner />
            </ResultsCTA>
          </ResultsContainer>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
}

// ========== ESTILOS ==========

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${fadeIn} 0.4s ease-out;
`;

const ModalHeader = styled.div`
  padding: 32px 32px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const HeaderSubtitle = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const WelcomeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 12px;
`;

const CloseButton = styled.button`
  background: #f9fafb;
  border: none;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ProgressContainer = styled.div`
  padding: 0 32px;
  margin: 20px 0;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 13px;
  color: #6b7280;
  text-align: center;
`;

const QuestionsContainer = styled.div`
  padding: 0 32px;
`;

const QuestionCounter = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 20px;
`;

const QuestionCard = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
`;

const QuestionText = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
  line-height: 1.4;
  text-align: center;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button<{ $selected: boolean }>`
  background: ${props => props.$selected ? '#6366f1' : 'white'};
  color: ${props => props.$selected ? 'white' : '#374151'};
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e5e7eb'};
  border-radius: 12px;
  padding: 20px 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  
  &:hover {
    border-color: #6366f1;
    transform: translateY(-2px);
  }
`;

const OptionValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
`;

const OptionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
`;

const OptionCheck = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#6366f1' : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#374151'};
  border: ${props => props.$primary ? 'none' : '1px solid #e5e7eb'};
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.$primary ? '#4f46e5' : '#f9fafb'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuestionDots = styled.div`
  display: flex;
  gap: 8px;
`;

const QuestionDot = styled.button<{ $active: boolean; $answered: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    if (props.$active) return '#6366f1';
    if (props.$answered) return '#10b981';
    return '#e5e7eb';
  }};
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const InfoSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
  margin: 0 32px 24px;
`;

const InfoIcon = styled.div`
  color: #0ea5e9;
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #0369a1;
  margin: 0;
  line-height: 1.4;
`;

const NotesSection = styled.div`
  padding: 0 32px;
  margin-bottom: 24px;
`;

const NotesLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  background: transparent;
  color: #6b7280;
  border: none;
  font-size: 14px;
  padding: 16px;
  cursor: pointer;
  text-align: center;
  width: 100%;
  
  &:hover {
    color: #374151;
    text-decoration: underline;
  }
`;

const ResultsContainer = styled.div`
  padding: 32px;
  text-align: center;
`;

const ResultsHeader = styled.div`
  margin-bottom: 24px;
`;

const ResultsIcon = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const ResultsTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const ResultsScore = styled.div`
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const ScoreValue = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 800;
`;

const ResultsDescription = styled.p`
  font-size: 16px;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 24px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const ResultsDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
`;

const ResultDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
  
  svg {
    color: #6366f1;
    flex-shrink: 0;
  }
  
  strong {
    color: #111827;
  }
`;

const ResultsProgress = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  position: relative;
`;

const ProgressLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  text-align: left;
`;

const SeverityScale = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e5e7eb;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const SeverityLevel = styled.div<{ $active: boolean; $color: string }>`
  background: ${props => props.$active ? props.$color : `${props.$color}20`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.$active ? 'white' : props.$color};
  font-size: 10px;
  font-weight: 600;
  
  span:first-child {
    font-size: 12px;
    font-weight: 700;
  }
`;

const ScoreMarker = styled.div<{ $position: number }>`
  position: absolute;
  bottom: 40px;
  left: ${props => `calc(${props.$position}% - 20px)`};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ScoreMarkerDot = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const ScoreMarkerText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-top: 4px;
  white-space: nowrap;
`;

const ResultsCTA = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const CTAText = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;