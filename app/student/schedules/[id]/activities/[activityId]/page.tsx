// app/student/schedules/[id]/activities/[activityId]/page.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaStar,
  FaEdit,
  FaSave,
  FaHistory,
  FaFileAlt,
  FaList,
  FaVideo,
  FaQuestionCircle,
  FaSync,
  FaFile
} from 'react-icons/fa';
import { schedulesService } from '@/lib/firebase/services/schedulesService';
import { useScheduleProgress } from '@/hooks/useScheduleProgress';
import { WeeklySchedule, ScheduleActivity } from '@/types/schedule.types';
import { useAuth } from '@/context/AuthContext';

const activityTypeLabels: { [key: string]: string } = {
  text: 'Texto/Instruções',
  checklist: 'Checklist',
  video: 'Vídeo',
  quiz: 'Quiz',
  file: 'Arquivo',
  habit: 'Hábito'
};

const activityTypeIcons = {
  text: FaFileAlt,
  checklist: FaList,
  video: FaVideo,
  quiz: FaQuestionCircle,
  file: FaFile,
  habit: FaSync
};

export default function ScheduleActivityPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const scheduleId = params.id as string;
  const activityId = params.activityId as string;

  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [activity, setActivity] = useState<ScheduleActivity | null>(null);
  const [activityDay, setActivityDay] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para interação
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de progresso
  const {
    progress,
    loading: progressLoading,
    toggleActivityCompletion,
    updateActivityTime,
    isActivityCompleted
  } = useScheduleProgress({ scheduleId });

  // Timer para contagem de tempo
  useEffect(() => {
    if (!activity || !user) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
      setTimeSpent(elapsedMinutes);
    }, 60000); // Atualizar a cada minuto

    return () => {
      clearInterval(timer);
      // Salvar tempo gasto ao sair da página
      if (timeSpent > 0) {
        updateActivityTime(activityId, timeSpent);
      }
    };
  }, [activity, user, activityId, updateActivityTime]);

  // Carregar atividade
  useEffect(() => {
    const loadActivity = async () => {
      if (!user?.id || !scheduleId || !activityId) return;

      try {
        setLoading(true);
        setError(null);

        // Carregar cronograma
        const scheduleData = await schedulesService.getScheduleById(scheduleId);

        if (!scheduleData) {
          throw new Error('Cronograma não encontrado');
        }

        // Verificar acesso do aluno
        if (!scheduleData.assignedStudents.includes(user.id)) {
          throw new Error('Você não tem acesso a esta atividade');
        }

        setSchedule(scheduleData);

        // Encontrar a atividade específica
        let foundActivity: ScheduleActivity | null = null;
        let foundDay = '';

        for (const day of scheduleData.weekDays) {
          const activityInDay = day.activities.find(a => a.id === activityId);
          if (activityInDay) {
            foundActivity = activityInDay;
            foundDay = day.day;
            break;
          }
        }

        if (!foundActivity) {
          throw new Error('Atividade não encontrada');
        }

        setActivity(foundActivity);
        setActivityDay(foundDay);

      } catch (err: any) {
        console.error('Erro ao carregar atividade:', err);
        setError(err.message || 'Erro ao carregar atividade');
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [user?.id, scheduleId, activityId, progress]);

  const handleCompleteActivity = async () => {
    // 1. Verificação inicial
    if (!activity || !user) {
      setError('Detalhes da atividade ou informações do usuário ausentes.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isCurrentlyCompleted = isActivityCompleted(activityId);

      console.log(`Tentando alternar atividade ID: ${activityId}, Conclusão atual: ${isCurrentlyCompleted}`);

      // 2. Ação Crítica no Firebase - PASSAR DADOS EXPLÍCITOS
      await toggleActivityCompletion(activityId, activityDay, !isCurrentlyCompleted, {
        timeSpent,
        // CORREÇÃO: Passar valores explícitos, não undefined
        answers: null,  // ou omitir se não usado
      });

      console.log('SUCESSO: Atividade marcada como concluída/incompleta no banco de dados.');

      // 3. Redirecionar
      router.push(`/student/schedules/${scheduleId}?day=${activityDay}`);

    } catch (err: any) {

      // 4. Tratamento Detalhado do Erro
      let errorMessage = 'Ocorreu um erro desconhecido ao atualizar a atividade.';

      if (err.code) {
        console.error('ERRO DETALHADO (Firebase/Auth):', err.code, err.message);

        switch (err.code) {
          case 'permission-denied':
          case 'resource-exhausted':
            errorMessage = 'Falha de permissão! Verifique as regras de segurança do Firebase ou se você está logado.';
            break;
          case 'unavailable':
            errorMessage = 'Serviço de banco de dados indisponível. Tente novamente mais tarde.';
            break;
          case 'invalid-argument':
            errorMessage = 'Dados inválidos enviados para o banco de dados. Contate o suporte.';
            break;
          default:
            errorMessage = `Erro de Firebase (${err.code}): ${err.message}`;
        }
      } else {
        // Outros erros
        console.error('ERRO GERAL:', err);
        errorMessage = err.message || 'Erro ao comunicar com o servidor. Verifique sua conexão.';
      }

      setError(errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityIcon = () => {
    const IconComponent = activityTypeIcons[activity?.type || 'text'];
    return <IconComponent size={24} />;
  };

  const renderActivityContent = () => {
    if (!activity) return null;

    switch (activity.type) {
      case 'text':
        return (
          <TextContent>
            <ContentHeader>Conteúdo</ContentHeader>
            <TextContentArea>
              {activity.content || 'Nenhum conteúdo disponível.'}
            </TextContentArea>
          </TextContent>
        );

      case 'video':
        return (
          <VideoContent>
            <ContentHeader>Vídeo</ContentHeader>
            <VideoContainer>
              {activity.videoUrl ? (
                <VideoPlayer
                  src={activity.videoUrl}
                  controls
                  poster={activity.thumbnailUrl}
                />
              ) : (
                <NoVideo>URL do vídeo não disponível</NoVideo>
              )}
            </VideoContainer>
          </VideoContent>
        );

      case 'checklist':
        return (
          <ChecklistContent>
            <ContentHeader>Checklist</ContentHeader>
            <ChecklistItems>
              {activity.items?.map((item, index) => (
                <ChecklistItem key={item.id}>
                  <Checkbox type="checkbox" checked={item.isCompleted} readOnly />
                  <CheckboxLabel>
                    {item.label}
                  </CheckboxLabel>
                </ChecklistItem>
              )) || <NoItems>Nenhum item na checklist</NoItems>}
            </ChecklistItems>
          </ChecklistContent>
        );

      case 'quiz':
        return (
          <QuizContent>
            <ContentHeader>Quiz</ContentHeader>
            <QuizInfo>
              <InfoItem>
                <strong>Pontuação mínima:</strong> {activity.passingScore}%
              </InfoItem>
              <InfoItem>
                <strong>Questões:</strong> {activity.questions?.length || 0}
              </InfoItem>
            </QuizInfo>
            <QuizInstructions>
              {activity.instructions || 'Complete o quiz para ganhar pontos!'}
            </QuizInstructions>
          </QuizContent>
        );

      case 'file':
        return (
          <FileContent>
            <ContentHeader>Arquivo</ContentHeader>
            {activity.fileUrl ? (
              <FileDownload>
                <FileIcon>
                  <FaFile size={48} />
                </FileIcon>
                <FileInfo>
                  <FileName>{activity.fileName}</FileName>
                  <FileSize>
                    {activity.fileType?.toUpperCase()}
                  </FileSize>
                  <DownloadButton href={activity.fileUrl} target="_blank" download>
                    Baixar Arquivo
                  </DownloadButton>
                </FileInfo>
              </FileDownload>
            ) : (
              <NoFile>Arquivo não disponível</NoFile>
            )}
          </FileContent>
        );

      case 'habit':
        return (
          <HabitContent>
            <ContentHeader>Hábito</ContentHeader>
            <HabitInfo>
              <InfoItem>
                <strong>Frequência:</strong> {activity.frequency === 'daily' ? 'Diário' :
                  activity.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
              </InfoItem>
              {activity.schedule?.specificTimes && (
                <InfoItem>
                  <strong>Horários:</strong> {activity.schedule.specificTimes.join(', ')}
                </InfoItem>
              )}
            </HabitInfo>
          </HabitContent>
        );

      default:
        return (
          <DefaultContent>
            <ContentHeader>Atividade</ContentHeader>
            <DefaultText>
              Visualize e complete a atividade para ganhar pontos.
            </DefaultText>
          </DefaultContent>
        );
    }
  };

  if (loading || progressLoading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Carregando atividade...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Erro ao carregar atividade</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <BackButton href={`/student/schedules/${scheduleId}`}>
            <FaArrowLeft size={16} />
            Voltar para o Cronograma
          </BackButton>
        </ErrorState>
      </Container>
    );
  }

  if (!activity || !schedule) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Atividade não encontrada</ErrorTitle>
          <ErrorMessage>A atividade solicitada não existe ou você não tem acesso.</ErrorMessage>
          <BackButton href="/student/schedules">
            <FaArrowLeft size={16} />
            Voltar para Cronogramas
          </BackButton>
        </ErrorState>
      </Container>
    );
  }

  const isCompleted = isActivityCompleted(activityId);
  const ActivityTypeIcon = activityTypeIcons[activity.type];

  return (
    <Container>
      <Header>
        <BackButton href={`/student/schedules/${scheduleId}?day=${activityDay}`}>
          <FaArrowLeft size={16} />
          Voltar
        </BackButton>

        <TitleSection>
          <ActivityHeader>
            <ActivityIcon $type={activity.type}>
              {getActivityIcon()}
            </ActivityIcon>
            <div>
              <Title>{activity.title}</Title>
              <Subtitle>
                {activityTypeLabels[activity.type]} • {schedule.title}
              </Subtitle>
            </div>
          </ActivityHeader>
        </TitleSection>
      </Header>

      <Content>
        {/* Metadados da Atividade */}
        <MetadataSection>
          <MetadataGrid>
            <MetadataItem>
              <MetadataIcon>
                <FaClock size={16} />
              </MetadataIcon>
              <MetadataInfo>
                <MetadataLabel>Tempo Estimado</MetadataLabel>
                <MetadataValue>{activity.estimatedTime} minutos</MetadataValue>
              </MetadataInfo>
            </MetadataItem>

            <MetadataItem>
              <MetadataIcon>
                <FaStar size={16} />
              </MetadataIcon>
              <MetadataInfo>
                <MetadataLabel>Pontos</MetadataLabel>
                <MetadataValue>{activity.points} pts</MetadataValue>
              </MetadataInfo>
            </MetadataItem>

            <MetadataItem>
              <MetadataIcon>
                <FaHistory size={16} />
              </MetadataIcon>
              <MetadataInfo>
                <MetadataLabel>Tempo Gastos</MetadataLabel>
                <MetadataValue>{timeSpent} minutos</MetadataValue>
              </MetadataInfo>
            </MetadataItem>

            <MetadataItem>
              <MetadataIcon>
                <ActivityTypeIcon size={16} />
              </MetadataIcon>
              <MetadataInfo>
                <MetadataLabel>Tipo</MetadataLabel>
                <MetadataValue>{activityTypeLabels[activity.type]}</MetadataValue>
              </MetadataInfo>
            </MetadataItem>
          </MetadataGrid>

          {activity.isRequired && (
            <RequiredBadge>
              Atividade Obrigatória
            </RequiredBadge>
          )}
        </MetadataSection>

        {/* Descrição */}
        {activity.description && (
          <DescriptionSection>
            <SectionTitle>Descrição</SectionTitle>
            <DescriptionText>{activity.description}</DescriptionText>
          </DescriptionSection>
        )}

        {/* Instruções */}
        {activity.instructions && (
          <InstructionsSection>
            <SectionTitle>Instruções</SectionTitle>
            <InstructionsText>{activity.instructions}</InstructionsText>
          </InstructionsSection>
        )}

        {/* Conteúdo da Atividade */}
        <ActivityContentSection>
          {renderActivityContent()}
        </ActivityContentSection>

        {/* Ações */}
        <ActionsSection>
          <StatusIndicator $completed={isCompleted}>
            {isCompleted ? (
              <>
                <FaCheck size={16} />
                Concluída em {progress[activityId]?.completedAt?.toLocaleDateString('pt-BR')}
              </>
            ) : (
              'Não concluída'
            )}
          </StatusIndicator>

          <ActionButtons>
            <CompleteButton
              onClick={handleCompleteActivity}
              disabled={isSubmitting}
              $completed={isCompleted}
            >
              {isSubmitting ? (
                'Processando...'
              ) : isCompleted ? (
                <>
                  <FaEdit size={16} />
                  Marcar como Não Concluída
                </>
              ) : (
                <>
                  <FaCheck size={16} />
                  Marcar como Concluída
                </>
              )}
            </CompleteButton>
          </ActionButtons>
        </ActionsSection>
      </Content>
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100%;
  max-width: 1200px;
  margin: 0 auto;
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

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ActivityIcon = styled.div<{ $type: string }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => {
    switch (props.$type) {
      case 'text': return '#6366f1';
      case 'quiz': return '#f59e0b';
      case 'video': return '#ef4444';
      case 'checklist': return '#10b981';
      case 'file': return '#8b5cf6';
      case 'habit': return '#06b6d4';
      default: return '#6366f1';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MetadataSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MetadataIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
`;

const MetadataInfo = styled.div`
  flex: 1;
`;

const MetadataLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const MetadataValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
`;

const RequiredBadge = styled.div`
  display: inline-block;
  background: #fef2f2;
  color: #dc2626;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #fecaca;
`;

const DescriptionSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const InstructionsSection = styled.div`
  background: #fefce8;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #fde047;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px 0;
`;

const DescriptionText = styled.p`
  color: #374151;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
`;

const InstructionsText = styled.p`
  color: #854d0e;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
`;

const ActivityContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TextContent = styled.div``;

const ContentHeader = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f5f9;
`;

const TextContentArea = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
  border: 1px solid #e2e8f0;
  min-height: 200px;
  white-space: pre-wrap;
`;

const VideoContent = styled.div``;

const VideoContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
`;

const VideoPlayer = styled.video`
  width: 100%;
  max-height: 500px;
  background: #000;
`;

const NoVideo = styled.div`
  text-align: center;
  padding: 40px;
  background: #f1f5f9;
  border-radius: 8px;
  color: #64748b;
`;

const ChecklistContent = styled.div``;

const ChecklistItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  flex: 1;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
`;

const NoItems = styled.div`
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-style: italic;
`;

const QuizContent = styled.div``;

const QuizInfo = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  font-size: 14px;
  color: #374151;
`;

const QuizInstructions = styled.div`
  background: #eff6ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  font-size: 14px;
  color: #1e40af;
`;

const FileContent = styled.div``;

const FileDownload = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px dashed #e2e8f0;
`;

const FileIcon = styled.div`
  color: #6366f1;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const FileSize = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
`;

const DownloadButton = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const NoFile = styled.div`
  text-align: center;
  padding: 40px;
  background: #f1f5f9;
  border-radius: 8px;
  color: #64748b;
`;

const HabitContent = styled.div``;

const HabitInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DefaultContent = styled.div``;

const DefaultText = styled.p`
  color: #64748b;
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

const ActionsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const StatusIndicator = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$completed ? '#10b981' : '#64748b'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const CompleteButton = styled.button<{ $completed: boolean; disabled: boolean }>`
  background: ${props => {
    if (props.disabled) return '#cbd5e1';
    return props.$completed ? '#f59e0b' : 'linear-gradient(135deg, #10b981, #059669)';
  }};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

const ErrorMessage = styled.p`
  color: #64748b;
  margin: 0 0 24px 0;
`;

// Componente LoadingSpinner
const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;