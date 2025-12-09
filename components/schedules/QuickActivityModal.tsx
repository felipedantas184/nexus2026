'use client';

import { useState, useEffect, useRef } from 'react';
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
  FaClock,
  FaUpload,
  FaCheckSquare,
  FaCalendarAlt
} from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';

interface QuickActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: any, repeatDays: string[]) => void;
  initialDay: string;
  isEditing?: boolean;
  initialData?: any;
}

const dayOptions = [
  { value: 'monday', label: 'Segunda', short: 'SEG' },
  { value: 'tuesday', label: 'Terça', short: 'TER' },
  { value: 'wednesday', label: 'Quarta', short: 'QUA' },
  { value: 'thursday', label: 'Quinta', short: 'QUI' },
  { value: 'friday', label: 'Sexta', short: 'SEX' },
  { value: 'saturday', label: 'Sábado', short: 'SÁB' },
  { value: 'sunday', label: 'Domingo', short: 'DOM' }
];

const activityTypes = [
  {
    type: 'text',
    icon: FaFileArchive,
    label: 'Texto',
    color: '#6366f1',
    description: 'Conteúdo textual para leitura'
  },
  {
    type: 'checklist',
    icon: FaList,
    label: 'Checklist',
    color: '#10b981',
    description: 'Lista de itens para marcar'
  },
  {
    type: 'video',
    icon: FaVideo,
    label: 'Vídeo',
    color: '#ef4444',
    description: 'Vídeo educativo'
  },
  {
    type: 'quiz',
    icon: FaQuestionCircle,
    label: 'Quiz',
    color: '#f59e0b',
    description: 'Questionário interativo'
  },
  {
    type: 'file',
    icon: FaFile,
    label: 'Arquivo',
    color: '#8b5cf6',
    description: 'Material para download'
  },
  {
    type: 'habit',
    icon: FaSync,
    label: 'Hábito',
    color: '#06b6d4',
    description: 'Atividade recorrente'
  }
];

export default function QuickActivityModal({
  isOpen,
  onClose,
  onSave,
  initialDay,
  isEditing = false,
  initialData = null
}: QuickActivityModalProps) {
  const [selectedType, setSelectedType] = useState('text');
  const [repeatDays, setRepeatDays] = useState<string[]>([initialDay]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedTime: 15,
    points: 10,
    isRequired: true,
    content: '',
    videoUrl: '',
    checklistItems: [''] as string[],
    quizQuestions: [{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }],
    file: null as File | null,
    fileName: '',
    habitFrequency: 'daily'
  });

  // Inicializar com dados existentes se estiver editando
  useEffect(() => {
    if (initialData) {
      setSelectedType(initialData.type);
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        estimatedTime: initialData.estimatedTime || 15,
        points: initialData.points || 10,
        isRequired: initialData.isRequired !== false,
        content: initialData.content || '',
        videoUrl: initialData.videoUrl || '',
        checklistItems: initialData.items?.map((item: any) => item.label) || [''],
        quizQuestions: initialData.questions || [{
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
        }],
        file: null,
        fileName: initialData.fileName || '',
        habitFrequency: initialData.frequency || 'daily'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!formData.title.trim()) {
      alert('Por favor, informe o título da atividade');
      return;
    }

    if (selectedType === 'text' && !formData.content.trim()) {
      alert('Por favor, informe o conteúdo da atividade');
      return;
    }

    if (selectedType === 'video' && !formData.videoUrl.trim()) {
      alert('Por favor, informe a URL do vídeo');
      return;
    }

    // Preparar dados específicos por tipo
    const activityData: any = {
      title: formData.title,
      description: formData.description,
      type: selectedType,
      estimatedTime: formData.estimatedTime,
      points: formData.points,
      isRequired: formData.isRequired,
      instructions: formData.description // Reutiliza descrição como instruções
    };

    // Adicionar dados específicos
    switch (selectedType) {
      case 'text':
        activityData.content = formData.content;
        activityData.richText = false;
        break;

      case 'video':
        activityData.videoUrl = formData.videoUrl;
        activityData.thumbnailUrl = `https://img.youtube.com/vi/${extractYouTubeId(formData.videoUrl)}/0.jpg`;
        break;

      case 'checklist':
        activityData.items = formData.checklistItems
          .filter(item => item.trim())
          .map((item, index) => ({
            id: `item-${Date.now()}-${index}`,
            label: item,
            isCompleted: false,
            order: index
          }));
        break;

      case 'quiz':
        activityData.passingScore = 70;
        activityData.questions = formData.quizQuestions
          .filter(q => q.question.trim())
          .map((q, index) => ({
            id: `question-${Date.now()}-${index}`,
            question: q.question,
            type: 'multiple_choice',
            options: q.options.filter(opt => opt.trim()),
            correctAnswer: q.options[q.correctAnswer],
            explanation: q.explanation
          }));
        break;

      case 'file':
        if (formData.file) {
          // Aqui você implementaria o upload real
          activityData.fileName = formData.file.name;
          activityData.fileType = formData.file.type;
          activityData.fileSize = formData.file.size;
          activityData.fileUrl = await simulateFileUpload(formData.file);
        } else if (initialData?.fileUrl) {
          activityData.fileUrl = initialData.fileUrl;
          activityData.fileName = initialData.fileName;
          activityData.fileType = initialData.fileType;
        }
        break;

      case 'habit':
        activityData.frequency = formData.habitFrequency;
        activityData.schedule = {
          daysOfWeek: repeatDays.map(day => {
            const dayIndex = dayOptions.findIndex(d => d.value === day);
            return dayIndex;
          }),
          reminder: true,
          reminderTime: '09:00'
        };
        activityData.streak = 0;
        activityData.maxStreak = 0;
        break;
    }

    // Chamar função de salvamento
    onSave(activityData, repeatDays);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      estimatedTime: 15,
      points: 10,
      isRequired: true,
      content: '',
      videoUrl: '',
      checklistItems: [''],
      quizQuestions: [{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }],
      file: null,
      fileName: '',
      habitFrequency: 'daily'
    });
    setRepeatDays([initialDay]);
    setSelectedType('text');
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file, fileName: file.name }));
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : '';
  };

  const simulateFileUpload = async (file: File): Promise<string> => {
    // Simulação de upload - em produção, use Firebase Storage
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/nexus-platform.appspot.com/o/uploads%2F${file.name}?alt=media`);
      }, 1000);
    });
  };

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, '']
    }));
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index)
    }));
  };

  const updateChecklistItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) =>
        i === index ? value : item
      )
    }));
  };

  const addQuizQuestion = () => {
    setFormData(prev => ({
      ...prev,
      quizQuestions: [...prev.quizQuestions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }]
    }));
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      quizQuestions: prev.quizQuestions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const toggleRepeatDay = (day: string) => {
    setRepeatDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <FaTimes size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {/* Seção 1: Tipo e Dias */}
          <Section>
            <SectionTitle>Configuração Rápida</SectionTitle>

            <Grid2Col>
              <InputGroup>
                <Label>Tipo de Atividade *</Label>
                <ActivityTypeGrid>
                  {activityTypes.map(({ type, icon: Icon, label, color, description }) => (
                    <ActivityTypeButton
                      key={type}
                      type="button"
                      $selected={selectedType === type}
                      $color={color}
                      onClick={() => setSelectedType(type)}
                      title={description}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </ActivityTypeButton>
                  ))}
                </ActivityTypeGrid>
              </InputGroup>

              <InputGroup>
                <Label>Repetir em outros dias</Label>
                <RepeatDaysContainer>
                  {dayOptions.map(day => (
                    <DayCheckbox
                      key={day.value}
                      type="button" // ← ESSENCIAL!
                      $selected={repeatDays.includes(day.value)}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault(); // ← Previene comportamento padrão do botão
                        e.stopPropagation(); // ← Previene propagação para o overlay
                        toggleRepeatDay(day.value);
                      }}
                      title={day.label}
                    >
                      {day.short}
                      {repeatDays.includes(day.value) && <FaCheck size={10} />}
                    </DayCheckbox>
                  ))}
                </RepeatDaysContainer>
                <HelpText>Selecione os dias em que esta atividade será repetida</HelpText>
              </InputGroup>
            </Grid2Col>
          </Section>

          {/* Seção 2: Informações Básicas */}
          <Section>
            <SectionTitle>Informações Básicas</SectionTitle>

            <Grid2Col>
              <InputGroup>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Leitura diária, Quiz de matemática..."
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição da atividade..."
                />
              </InputGroup>
            </Grid2Col>

            <Grid3Col>
              <InputGroup>
                <Label htmlFor="estimatedTime">
                  <FaClock size={12} /> Tempo (min)
                </Label>
                <NumberInput
                  id="estimatedTime"
                  type="number"
                  min="1"
                  max="240"
                  value={formData.estimatedTime}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    estimatedTime: parseInt(e.target.value) || 15
                  }))}
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="points">
                  <FaStar size={12} /> Pontos
                </Label>
                <NumberInput
                  id="points"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.points}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    points: parseInt(e.target.value) || 10
                  }))}
                />
              </InputGroup>

              <InputGroup>
                <Label>Tipo</Label>
                <ToggleGroup>
                  <ToggleOption
                    $active={formData.isRequired}
                    onClick={() => setFormData(prev => ({ ...prev, isRequired: true }))}
                  >
                    <FaStar size={12} /> Obrigatória
                  </ToggleOption>
                  <ToggleOption
                    $active={!formData.isRequired}
                    onClick={() => setFormData(prev => ({ ...prev, isRequired: false }))}
                  >
                    <FaCheck size={12} /> Opcional
                  </ToggleOption>
                </ToggleGroup>
              </InputGroup>
            </Grid3Col>
          </Section>

          {/* Seção 3: Conteúdo Específico */}
          <Section>
            <SectionTitle>
              {selectedType === 'text' && 'Conteúdo do Texto'}
              {selectedType === 'video' && 'Configuração do Vídeo'}
              {selectedType === 'checklist' && 'Itens da Checklist'}
              {selectedType === 'quiz' && 'Perguntas do Quiz'}
              {selectedType === 'file' && 'Arquivo para Download'}
              {selectedType === 'habit' && 'Configuração do Hábito'}
            </SectionTitle>

            {selectedType === 'text' && (
              <InputGroup>
                <Label>Conteúdo *</Label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Digite o conteúdo da atividade..."
                  rows={6}
                  required
                />
              </InputGroup>
            )}

            {selectedType === 'video' && (
              <InputGroup>
                <Label>URL do Vídeo (YouTube/Vimeo) *</Label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <HelpText>Cole a URL completa do vídeo do YouTube ou Vimeo</HelpText>
              </InputGroup>
            )}

            {selectedType === 'checklist' && (
              <InputGroup>
                <Label>Itens da Checklist *</Label>
                {formData.checklistItems.map((item, index) => (
                  <ChecklistItemRow key={index}>
                    <FaList size={14} />
                    <ChecklistInput
                      type="text"
                      value={item}
                      onChange={e => updateChecklistItem(index, e.target.value)}
                      placeholder={`Item ${index + 1}...`}
                      required
                    />
                    {formData.checklistItems.length > 1 && (
                      <RemoveButton
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                      >
                        <FaTimes size={12} />
                      </RemoveButton>
                    )}
                  </ChecklistItemRow>
                ))}
                <AddButton type="button" onClick={addChecklistItem}>
                  <FaPlus size={12} /> Adicionar Item
                </AddButton>
              </InputGroup>
            )}

            {selectedType === 'quiz' && (
              <InputGroup>
                <Label>Perguntas do Quiz</Label>
                {formData.quizQuestions.map((question, qIndex) => (
                  <QuizQuestionCard key={qIndex}>
                    <QuizQuestionHeader>
                      <span>Pergunta {qIndex + 1}</span>
                      {formData.quizQuestions.length > 1 && (
                        <RemoveButton
                          type="button"
                          onClick={() => {
                            const newQuestions = formData.quizQuestions.filter((_, i) => i !== qIndex);
                            setFormData(prev => ({ ...prev, quizQuestions: newQuestions }));
                          }}
                        >
                          <FaTimes size={12} />
                        </RemoveButton>
                      )}
                    </QuizQuestionHeader>

                    <Input
                      type="text"
                      value={question.question}
                      onChange={e => updateQuizQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Digite a pergunta..."
                      style={{ marginBottom: '12px' }}
                    />

                    <Label>Opções de Resposta</Label>
                    {question.options.map((option, oIndex) => (
                      <OptionRow key={oIndex}>
                        <RadioInput
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                        />
                        <Input
                          type="text"
                          value={option}
                          onChange={e => {
                            const newOptions = [...question.options];
                            newOptions[oIndex] = e.target.value;
                            updateQuizQuestion(qIndex, 'options', newOptions);
                          }}
                          placeholder={`Opção ${oIndex + 1}`}
                        />
                      </OptionRow>
                    ))}

                    <Input
                      type="text"
                      value={question.explanation}
                      onChange={e => updateQuizQuestion(qIndex, 'explanation', e.target.value)}
                      placeholder="Explicação da resposta (opcional)"
                      style={{ marginTop: '12px' }}
                    />
                  </QuizQuestionCard>
                ))}
                <AddButton type="button" onClick={addQuizQuestion}>
                  <FaPlus size={12} /> Adicionar Pergunta
                </AddButton>
              </InputGroup>
            )}

            {selectedType === 'file' && (
              <InputGroup>
                <Label>Arquivo para Download *</Label>
                <FileUploadArea
                  onClick={() => fileInputRef.current?.click()}
                  $hasFile={!!formData.file || !!initialData?.fileUrl}
                >
                  {formData.file ? (
                    <>
                      <FaCheckSquare size={24} />
                      <div>
                        <strong>{formData.file.name}</strong>
                        <p>Clique para alterar o arquivo</p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <ProgressBar>
                            <ProgressFill $width={uploadProgress} />
                          </ProgressBar>
                        )}
                      </div>
                    </>
                  ) : initialData?.fileUrl ? (
                    <>
                      <FaFile size={24} />
                      <div>
                        <strong>{initialData.fileName}</strong>
                        <p>Arquivo já carregado. Clique para alterar</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaUpload size={24} />
                      <div>
                        <strong>Clique para selecionar um arquivo</strong>
                        <p>Arquivos PDF, DOC, PPT, ZIP até 50MB</p>
                      </div>
                    </>
                  )}
                </FileUploadArea>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                />
              </InputGroup>
            )}

            {selectedType === 'habit' && (
              <InputGroup>
                <Label>Frequência do Hábito</Label>
                <Select
                  value={formData.habitFrequency}
                  onChange={e => setFormData(prev => ({ ...prev, habitFrequency: e.target.value }))}
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </Select>
                <HelpText>
                  O hábito será repetido nos dias selecionados acima
                </HelpText>
              </InputGroup>
            )}
          </Section>

          <FormActions>
            <CancelButton type="button" onClick={handleClose}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit">
              <FaSave size={16} />
              {isEditing ? 'Salvar Alterações' : 'Criar Atividade'}
              {repeatDays.length > 1 && ` (${repeatDays.length} dias)`}
            </SubmitButton>
          </FormActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}

// ========== ESTILOS OTIMIZADOS ==========

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
  padding: 16px;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  @media (max-width: 768px) {
    border-radius: 16px;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 20px 20px 12px 20px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: #f9fafb;
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const Form = styled.form`
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  @media (max-width: 768px) {
    padding: 0 20px 20px 20px;
    gap: 20px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Grid3Col = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Input = styled.input`
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
  }
`;

const NumberInput = styled(Input)`
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
    min-height: 80px;
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
  }
`;

const ActivityTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ActivityTypeButton = styled.button<{ $selected: boolean; $color: string }>`
  background: ${props => props.$selected ? props.$color : '#f9fafb'};
  color: ${props => props.$selected ? 'white' : '#374151'};
  border: 2px solid ${props => props.$selected ? props.$color : '#e5e7eb'};
  border-radius: 10px;
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  
  &:hover {
    border-color: ${props => props.$color};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    padding: 10px 6px;
    font-size: 11px;
    
    svg {
      font-size: 14px;
    }
  }
`;

const RepeatDaysContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const DayCheckbox = styled.button<{ $selected: boolean }>`
  background: ${props => props.$selected ? '#6366f1' : '#f9fafb'};
  color: ${props => props.$selected ? 'white' : '#374151'};
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e5e7eb'};
  border-radius: 8px;
  padding: 10px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &:hover {
    border-color: #6366f1;
    transform: scale(1.05);
  }
  
  svg {
    font-size: 10px;
  }
`;

const ToggleGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ToggleOption = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#6366f1' : '#f9fafb'};
  color: ${props => props.$active ? 'white' : '#374151'};
  border: 2px solid ${props => props.$active ? '#6366f1' : '#e5e7eb'};
  border-radius: 8px;
  padding: 10px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    border-color: #6366f1;
  }
`;

const ChecklistItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  
  svg {
    color: #10b981;
    flex-shrink: 0;
  }
`;

const ChecklistInput = styled(Input)`
  flex: 1;
  padding: 10px 12px;
  font-size: 13px;
`;

const QuizQuestionCard = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
`;

const QuizQuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  span {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  
  input[type="text"] {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
  }
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const FileUploadArea = styled.div<{ $hasFile: boolean }>`
  background: ${props => props.$hasFile ? '#f0f9ff' : '#f9fafb'};
  border: 2px dashed ${props => props.$hasFile ? '#0ea5e9' : '#d1d5db'};
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    border-color: #6366f1;
    background: #f8fafc;
  }
  
  svg {
    color: ${props => props.$hasFile ? '#0ea5e9' : '#6b7280'};
  }
  
  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    strong {
      font-size: 14px;
      color: #111827;
    }
    
    p {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    gap: 12px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div<{ $width: number }>`
  width: ${props => props.$width}%;
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.3s ease;
`;

const AddButton = styled.button`
  background: #f9fafb;
  color: #374151;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  
  &:hover {
    border-color: #6366f1;
    background: #f3f4f6;
    color: #6366f1;
  }
`;

const RemoveButton = styled.button`
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: #fecaca;
    transform: scale(1.1);
  }
`;

const HelpText = styled.p`
  font-size: 11px;
  color: #6b7280;
  margin: 4px 0 0 0;
  font-style: italic;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const CancelButton = styled.button`
  background: #f9fafb;
  color: #374151;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  
  &:hover {
    background: #f3f4f6;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 2;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 13px;
  }
`;