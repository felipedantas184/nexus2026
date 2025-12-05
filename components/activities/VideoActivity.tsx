// components/activities/VideoActivity.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaExpand, FaCompress, FaCheckCircle, FaClock } from 'react-icons/fa';
import { VideoActivity as VideoActivityType } from '@/types/activity.types';

interface VideoActivityProps {
  activity: VideoActivityType;
  studentActivity?: any;
  onSaveDraft: (answers: any) => void;
  onComplete: (answers: any, notes?: string) => void;
  isSubmitting: boolean;
}

export const VideoActivity: React.FC<VideoActivityProps> = ({
  activity,
  studentActivity,
  onSaveDraft,
  onComplete,
  isSubmitting
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(studentActivity?.status === 'completed');
  const [watchedTime, setWatchedTime] = useState(studentActivity?.answers?.watchedTime || 0);
  const [notes, setNotes] = useState(studentActivity?.notes || '');

  const completionThreshold = 0.9; // 90% do vídeo assistido

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      
      if (video.duration > 0) {
        const newProgress = (video.currentTime / video.duration) * 100;
        setProgress(newProgress);

        // Marcar como assistido quando atingir 90%
        if (newProgress >= completionThreshold * 100 && !hasCompleted) {
          setHasCompleted(true);
        }

        // Atualizar tempo total assistido
        if (video.currentTime > watchedTime) {
          setWatchedTime(video.currentTime);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [hasCompleted, watchedTime]);

  // Salvar progresso automaticamente
  useEffect(() => {
    if (watchedTime > 0) {
      const answers = {
        currentTime: currentTime,
        watchedTime: watchedTime,
        progress: progress,
        lastPosition: currentTime,
        lastUpdated: new Date().toISOString()
      };
      onSaveDraft(answers);
    }
  }, [currentTime, watchedTime, progress, onSaveDraft]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setHasCompleted(true);
  };

  const handleComplete = () => {
    if (!hasCompleted && progress < completionThreshold * 100) {
      alert(`Assista pelo menos ${completionThreshold * 100}% do vídeo para completar a atividade.`);
      return;
    }

    const answers = {
      watchedTime: watchedTime,
      progress: progress,
      completedAt: new Date().toISOString(),
      videoCompleted: hasCompleted
    };

    onComplete(answers, notes);
    setIsCompleted(true);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Container>
      {/* Player de Vídeo */}
      <VideoSection>
        <VideoContainer $isFullscreen={isFullscreen}>
          <VideoPlayer
            ref={videoRef}
            src={activity.videoUrl}
            poster={activity.thumbnailUrl}
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Controles Customizados */}
          <VideoControls>
            <PlayButton onClick={togglePlay}>
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </PlayButton>

            <TimeInfo>
              {formatTime(currentTime)} / {formatTime(duration)}
            </TimeInfo>

            <ProgressBar>
              <ProgressFill 
                $progress={progressPercentage}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  handleSeek(percent * duration);
                }}
              />
            </ProgressBar>

            <FullscreenButton onClick={toggleFullscreen}>
              {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </FullscreenButton>
          </VideoControls>
        </VideoContainer>

        <VideoInfo>
          <VideoStats>
            <Stat>
              <FaClock size={14} />
              Duração: {formatTime(duration)}
            </Stat>
            <Stat>
              Progresso: {Math.round(progress)}%
            </Stat>
            {hasCompleted && (
              <Stat $completed>
                <FaCheckCircle size={14} />
                Vídeo assistido
              </Stat>
            )}
          </VideoStats>

          {activity.instructions && (
            <Instructions>
              <InstructionsTitle>Instruções:</InstructionsTitle>
              <InstructionsText>{activity.instructions}</InstructionsText>
            </Instructions>
          )}
        </VideoInfo>
      </VideoSection>

      {/* Área de Anotações */}
      <NotesSection>
        <NotesHeader>
          <NotesTitle>Anotações do Vídeo</NotesTitle>
          <SaveButton onClick={() => onSaveDraft({ watchedTime, progress, notes })}>
            Salvar Anotações
          </SaveButton>
        </NotesHeader>
        
        <NotesTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Faça anotações sobre o conteúdo do vídeo, pontos importantes, dúvidas ou reflexões..."
          rows={5}
          disabled={isCompleted}
        />
        
        <NotesHint>
          Suas anotações serão salvas automaticamente conforme você assiste ao vídeo.
        </NotesHint>
      </NotesSection>

      {/* Ação de Conclusão */}
      <ActionSection>
        <CompletionInfo>
          {hasCompleted ? (
            <CompletionMessage $ready>
              ✅ Você assistiu ao vídeo completo! Pode concluir a atividade.
            </CompletionMessage>
          ) : progress >= completionThreshold * 100 ? (
            <CompletionMessage $ready>
              ✅ Você assistiu a parte principal do vídeo. Pode concluir a atividade.
            </CompletionMessage>
          ) : (
            <CompletionMessage>
              ⏳ Assista pelo menos {completionThreshold * 100}% do vídeo para desbloquear a conclusão
              ({Math.round(progress)}% assistido)
            </CompletionMessage>
          )}
        </CompletionInfo>

        <CompleteButton
          onClick={handleComplete}
          disabled={(!hasCompleted && progress < completionThreshold * 100) || isSubmitting || isCompleted}
          $completed={isCompleted}
        >
          {isCompleted ? (
            <>
              <FaCheckCircle size={16} />
              Vídeo Concluído
            </>
          ) : isSubmitting ? (
            'Concluindo...'
          ) : (
            <>
              <FaCheckCircle size={16} />
              Concluir Vídeo
            </>
          )}
        </CompleteButton>
      </ActionSection>
    </Container>
  );
};

// ========== ESTILOS ==========
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const VideoSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
`;

const VideoContainer = styled.div<{ $isFullscreen: boolean }>`
  position: relative;
  background: #000;
  width: 100%;
  aspect-ratio: 16/9;
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  display: block;
`;

const VideoControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${VideoContainer}:hover & {
    opacity: 1;
  }
`;

const PlayButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const TimeInfo = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 500;
  min-width: 100px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  position: absolute;
  left: 0;
  top: 0;
  width: ${props => props.$progress}%;
  height: 100%;
  background: #6366f1;
  border-radius: 3px;
  transition: width 0.1s ease;
`;

const FullscreenButton = styled.button`
  background: transparent;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const VideoInfo = styled.div`
  padding: 24px;
`;

const VideoStats = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Stat = styled.div<{ $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${props => props.$completed ? '#10b981' : '#64748b'};
  font-weight: 500;
  background: ${props => props.$completed ? '#10b98115' : '#f8fafc'};
  padding: 6px 12px;
  border-radius: 8px;
`;

const Instructions = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
`;

const InstructionsTitle = styled.h4`
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