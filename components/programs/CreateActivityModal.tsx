// components/programs/CreateActivityModal.tsx - VERSÃO ATUALIZADA
'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useState } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, 
  FaSave, 
  FaList, 
  FaVideo, 
  FaQuestionCircle,
  FaFile,
  FaSync,
  FaStar,
  FaFileArchive,
  FaCheck,
  FaClock
} from 'react-icons/fa';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: any) => void;
  moduleId: string;
  existingActivities: any[];
}

type ActivityType = 'text' | 'checklist' | 'video' | 'quiz' | 'file' | 'habit';

const activityTypes = [
  { type: 'text' as ActivityType, icon: FaFileArchive, label: 'Texto/Instruções', color: '#6366f1' },
  { type: 'checklist' as ActivityType, icon: FaList, label: 'Checklist', color: '#10b981' },
  { type: 'video' as ActivityType, icon: FaVideo, label: 'Vídeo', color: '#ef4444' },
  { type: 'quiz' as ActivityType, icon: FaQuestionCircle, label: 'Quiz', color: '#f59e0b' },
  { type: 'file' as ActivityType, icon: FaFile, label: 'Arquivo', color: '#8b5cf6' },
  { type: 'habit' as ActivityType, icon: FaSync, label: 'Hábito', color: '#06b6d4' }
];

export default function CreateActivityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  moduleId, 
  existingActivities 
}: CreateActivityModalProps) {
  const [selectedType, setSelectedType] = useState<ActivityType>('text');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    order: existingActivities.length + 1,
    estimatedTime: 15,
    points: 10,
    isRequired: true
  });
  
  // Dados específicos por tipo
  const [specificData, setSpecificData] = useState({
    // Text activity
    content: '',
    richText: false,
    
    // Video activity
    videoUrl: '',
    thumbnailUrl: '',
    
    // Quiz activity
    passingScore: 70,
    questions: [],
    
    // Checklist activity
    items: [],
    
    // File activity
    fileUrl: '',
    fileName: '',
    fileType: '',
    fileSize: 0,
    
    // Habit activity
    frequency: 'daily',
    schedule: {
      specificTimes: [],
      daysOfWeek: [],
      reminder: false,
      reminderTime: ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construir dados específicos do tipo de atividade
      const activitySpecificData = getActivitySpecificData(selectedType, specificData);
      
      const activityData = {
        ...formData,
        type: selectedType,
        moduleId,
        ...activitySpecificData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await onSave(activityData);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivitySpecificData = (type: ActivityType, data: any) => {
    switch (type) {
      case 'text':
        return {
          content: data.content,
          richText: data.richText
        };
      case 'video':
        return {
          videoUrl: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl
        };
      case 'quiz':
        return {
          passingScore: data.passingScore,
          questions: data.questions
        };
      case 'checklist':
        return {
          items: data.items.map((item: string, index: number) => ({
            id: `item-${Date.now()}-${index}`,
            label: item,
            isCompleted: false,
            order: index
          }))
        };
      case 'file':
        return {
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize
        };
      case 'habit':
        return {
          frequency: data.frequency,
          schedule: data.schedule,
          streak: 0,
          maxStreak: 0,
          completionHistory: []
        };
      default:
        return {};
    }
  };

  const handleSpecificDataChange = (field: string, value: any) => {
    setSpecificData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClose = () => {
    setSelectedType('text');
    setFormData({
      title: '',
      description: '',
      instructions: '',
      order: existingActivities.length + 1,
      estimatedTime: 15,
      points: 10,
      isRequired: true
    });
    setSpecificData({
      content: '',
      richText: false,
      videoUrl: '',
      thumbnailUrl: '',
      passingScore: 70,
      questions: [],
      items: [],
      fileUrl: '',
      fileName: '',
      fileType: '',
      fileSize: 0,
      frequency: 'daily',
      schedule: {
        specificTimes: [],
        daysOfWeek: [],
        reminder: false,
        reminderTime: ''
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Criar Nova Atividade</ModalTitle>
          <CloseButton onClick={handleClose}>
            <FaTimes size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {/* Seletor de Tipo de Atividade */}
          <Section>
            <SectionTitle>Tipo de Atividade</SectionTitle>
            <ActivityTypeGrid>
              {activityTypes.map((activityType) => (
                <ActivityTypeOption
                  key={activityType.type}
                  $selected={selectedType === activityType.type}
                  $color={activityType.color}
                  onClick={() => setSelectedType(activityType.type)}
                >
                  <ActivityTypeIcon $color={activityType.color}>
                    <activityType.icon size={20} />
                  </ActivityTypeIcon>
                  <ActivityTypeLabel>
                    {activityType.label}
                  </ActivityTypeLabel>
                </ActivityTypeOption>
              ))}
            </ActivityTypeGrid>
          </Section>

          {/* Informações Básicas */}
          <Section>
            <SectionTitle>Informações Básicas</SectionTitle>
            
            <InputGroup>
              <Label htmlFor="title">
                Título da Atividade *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Leitura Inicial, Quiz de Revisão..."
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
                placeholder="Descreva o objetivo desta atividade..."
                rows={2}
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="instructions">
                Instruções para o Aluno
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Forneça instruções claras para a realização da atividade..."
                rows={3}
              />
            </InputGroup>
          </Section>

          {/* Configurações Específicas por Tipo */}
          {selectedType === 'text' && (
            <Section>
              <SectionTitle>Conteúdo do Texto</SectionTitle>
              <InputGroup>
                <Label htmlFor="content">
                  Conteúdo *
                </Label>
                <Textarea
                  id="content"
                  value={specificData.content}
                  onChange={(e) => handleSpecificDataChange('content', e.target.value)}
                  placeholder="Digite o conteúdo textual da atividade..."
                  rows={6}
                  required
                />
              </InputGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  id="richText"
                  checked={specificData.richText}
                  onChange={(e) => handleSpecificDataChange('richText', e.target.checked)}
                />
                <CheckboxLabel htmlFor="richText">
                  Usar formatação rich text (HTML)
                </CheckboxLabel>
              </CheckboxGroup>
            </Section>
          )}

          {selectedType === 'video' && (
            <Section>
              <SectionTitle>Configurações do Vídeo</SectionTitle>
              <InputGroup>
                <Label htmlFor="videoUrl">
                  URL do Vídeo *
                </Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={specificData.videoUrl}
                  onChange={(e) => handleSpecificDataChange('videoUrl', e.target.value)}
                  placeholder="https://exemplo.com/video.mp4"
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label htmlFor="thumbnailUrl">
                  URL da Thumbnail (opcional)
                </Label>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  value={specificData.thumbnailUrl}
                  onChange={(e) => handleSpecificDataChange('thumbnailUrl', e.target.value)}
                  placeholder="https://exemplo.com/thumbnail.jpg"
                />
              </InputGroup>
            </Section>
          )}

          {selectedType === 'quiz' && (
            <Section>
              <SectionTitle>Configurações do Quiz</SectionTitle>
              <InputGroup>
                <Label htmlFor="passingScore">
                  Pontuação Mínima para Aprovação (%)
                </Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={specificData.passingScore}
                  onChange={(e) => handleSpecificDataChange('passingScore', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </InputGroup>
              <HelpText>
                As questões serão adicionadas após a criação da atividade através da edição.
              </HelpText>
            </Section>
          )}

          {selectedType === 'checklist' && (
            <Section>
              <SectionTitle>Itens da Checklist</SectionTitle>
              <InputGroup>
                <Label>
                  Adicionar Itens (um por linha)
                </Label>
                <Textarea
                  value={specificData.items.join('\n')}
                  onChange={(e) => handleSpecificDataChange('items', e.target.value.split('\n').filter(item => item.trim()))}
                  placeholder="Digite cada item em uma linha separada..."
                  rows={4}
                />
              </InputGroup>
              <HelpText>
                Cada linha será convertida em um item da checklist.
              </HelpText>
            </Section>
          )}

          {selectedType === 'habit' && (
            <Section>
              <SectionTitle>Configurações do Hábito</SectionTitle>
              <InputGroup>
                <Label htmlFor="frequency">
                  Frequência
                </Label>
                <Select 
                  id="frequency" 
                  value={specificData.frequency}
                  onChange={(e) => handleSpecificDataChange('frequency', e.target.value)}
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </Select>
              </InputGroup>
              <HelpText>
                O aluno poderá marcar este hábito como concluído periodicamente.
              </HelpText>
            </Section>
          )}

          {/* Configurações Gerais */}
          <Section>
            <SectionTitle>Configurações Gerais</SectionTitle>
            
            <SettingsGrid>
              <InputGroup>
                <Label htmlFor="order">
                  Ordem no Módulo
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  min="1"
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="estimatedTime">
                  Tempo Estimado (min)
                </Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                  min="1"
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="points">
                  Pontos por Conclusão
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                  min="0"
                />
              </InputGroup>
            </SettingsGrid>

            <InputGroup>
              <Label>
                Requisito
              </Label>
              <RequirementToggle>
                <RequirementOption 
                  $active={formData.isRequired}
                  onClick={() => setFormData(prev => ({ ...prev, isRequired: true }))}
                >
                  <FaStar size={14} />
                  Obrigatória
                </RequirementOption>
                <RequirementOption 
                  $active={!formData.isRequired}
                  onClick={() => setFormData(prev => ({ ...prev, isRequired: false }))}
                >
                  <FaCheck size={14} />
                  Opcional
                </RequirementOption>
              </RequirementToggle>
            </InputGroup>
          </Section>

          <FormActions>
            <CancelButton type="button" onClick={handleClose}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting || !formData.title}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner $small />
                  Criando...
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  Criar Atividade
                </>
              )}
            </SubmitButton>
          </FormActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}

// ========== ESTILOS ADICIONAIS ==========
const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
`;

// Reutilizar os estilos anteriores...
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const Form = styled.form`
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
`;

const ActivityTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const ActivityTypeOption = styled.button<{ $selected: boolean; $color: string }>`
  background: ${props => props.$selected ? `${props.$color}15` : '#f8fafc'};
  border: 2px solid ${props => props.$selected ? props.$color : '#e2e8f0'};
  border-radius: 8px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: ${props => props.$color};
    transform: translateY(-1px);
  }
`;

const ActivityTypeIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityTypeLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-align: center;
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
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  background: white;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RequirementToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const RequirementOption = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#6366f1' : '#f8fafc'};
  color: ${props => props.$active ? 'white' : '#374151'};
  border: 2px solid ${props => props.$active ? '#6366f1' : '#e2e8f0'};
  border-radius: 8px;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
  font-style: italic;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const CancelButton = styled.button`
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
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
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;