'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: any) => void;
  moduleId: string;
  existingActivities: any[];
}

type ActivityType = 'text' | 'checklist' | 'video' | 'quiz' | 'file' | 'habit';

type BasicForm = {
  title: string;
  description: string;
  instructions: string;
  order: number;
  estimatedTime: number;
  points: number;
  isRequired: boolean;
};

type TextPayload = { content: string; richText: boolean };
type VideoPayload = { videoUrl: string; thumbnailUrl?: string };
type FilePayload = { fileUrl?: string; fileName?: string; fileType?: string; fileSize?: number };
type ChecklistPayload = { items: { id: string; label: string; order: number }[] };
type QuizPayload = {
  passingScore: number;
  questions: {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number; // -1 = não definido
  }[];
};
type HabitPayload = { frequency: 'daily' | 'weekly' | 'monthly' };

type SpecificPayload = TextPayload | VideoPayload | FilePayload | ChecklistPayload | QuizPayload | HabitPayload;

type ActivityData = {
  type: ActivityType;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
  basic: BasicForm;
} & Record<string, any>;

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: any; color: string }[] = [
  { type: 'text', icon: FaFileArchive, label: 'Texto', color: '#6366f1' },
  { type: 'checklist', icon: FaList, label: 'Checklist', color: '#10b981' },
  { type: 'video', icon: FaVideo, label: 'Vídeo', color: '#ef4444' },
  { type: 'quiz', icon: FaQuestionCircle, label: 'Quiz', color: '#f59e0b' },
  { type: 'file', icon: FaFile, label: 'Arquivo', color: '#8b5cf6' },
  { type: 'habit', icon: FaSync, label: 'Hábito', color: '#06b6d4' }
];

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function CreateActivityModal(props: CreateActivityModalProps) {
  const { isOpen, onClose, onSave, moduleId, existingActivities } = props;

  // ---------- Core UI state ----------
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<ActivityType>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false); // ajuda a evitar perder dados sem querer

  // ---------- Forms ----------
  const [basic, setBasic] = useState<BasicForm>(() => ({
    title: '',
    description: '',
    instructions: '',
    order: existingActivities.length + 1,
    estimatedTime: 15,
    points: 10,
    isRequired: true
  }));

  const [text, setText] = useState<TextPayload>({ content: '', richText: false });
  const [video, setVideo] = useState<VideoPayload>({ videoUrl: '', thumbnailUrl: '' });
  const [file, setFile] = useState<FilePayload>({ fileUrl: '', fileName: '', fileType: '', fileSize: 0 });
  const [checklist, setChecklist] = useState<ChecklistPayload>({ items: [] });
  const [quiz, setQuiz] = useState<QuizPayload>({
    passingScore: 70,
    questions: []
  });
  const [habit, setHabit] = useState<HabitPayload>({ frequency: 'daily' });

  // ---------- Refs / accessibility ----------
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // ---------- Derived ----------
  const maxOrder = useMemo(() => Math.max(1, existingActivities.length + 1), [existingActivities.length]);

  // ---------- Effects ----------
  useEffect(() => {
    if (!isOpen) return;
    // reset on open (prevents "dados antigos" ao reabrir)
    resetAll();
    // focus no primeiro campo útil
    requestAnimationFrame(() => firstFieldRef.current?.focus());
    // ESC close
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') attemptClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // ---------- Helpers ----------
  const markTouched = () => setTouched(true);

  const attemptClose = () => {
    if (touched && (basic.title || basic.description || basic.instructions || hasAnySpecificData())) {
      // UX: evita perda de dados; keep simples e previsível
      const ok = confirm('Você tem alterações não salvas. Deseja fechar mesmo assim?');
      if (!ok) return;
    }
    onClose();
  };

  const hasAnySpecificData = () => {
    if (selectedType === 'text') return Boolean(text.content);
    if (selectedType === 'video') return Boolean(video.videoUrl || video.thumbnailUrl);
    if (selectedType === 'file') return Boolean(file.fileName || file.fileUrl);
    if (selectedType === 'checklist') return checklist.items.length > 0;
    if (selectedType === 'quiz') return quiz.questions.length > 0;
    if (selectedType === 'habit') return Boolean(habit.frequency);
    return false;
  };

  const validate = (): { ok: true } | { ok: false; message: string } => {
    if (!basic.title.trim()) return { ok: false, message: 'Informe um título para a atividade.' };
    if (basic.order < 1 || basic.order > Math.max(999, maxOrder + 20))
      return { ok: false, message: 'Ordem inválida.' };

    switch (selectedType) {
      case 'text':
        if (!text.content.trim()) return { ok: false, message: 'Adicione o conteúdo do texto.' };
        return { ok: true };

      case 'video':
        if (!video.videoUrl.trim()) return { ok: false, message: 'Informe a URL do vídeo.' };
        return { ok: true };

      case 'file':
        if (!file.fileName && !file.fileUrl) return { ok: false, message: 'Anexe um arquivo (ou informe a URL do arquivo).' };
        return { ok: true };

      case 'checklist':
        if (checklist.items.length === 0) return { ok: false, message: 'Adicione pelo menos 1 item na checklist.' };
        return { ok: true };

      case 'quiz':
        if (quiz.questions.length === 0) return { ok: false, message: 'Adicione pelo menos 1 questão ao quiz.' };
        for (const q of quiz.questions) {
          if (!q.prompt.trim()) return { ok: false, message: 'Cada questão precisa de um enunciado.' };
          if (q.options.length < 2) return { ok: false, message: 'Cada questão precisa de pelo menos 2 alternativas.' };
          if (q.correctIndex < 0 || q.correctIndex >= q.options.length)
            return { ok: false, message: 'Marque qual alternativa é a correta em cada questão.' };
        }
        return { ok: true };

      case 'habit':
        return { ok: true };
    }
  };

  const buildPayload = () => {
    let specific: SpecificPayload;

    if (selectedType === 'text') {
      specific = { ...text };
    } else if (selectedType === 'video') {
      specific = { ...video };
    } else if (selectedType === 'file') {
      specific = { ...file };
    } else if (selectedType === 'checklist') {
      specific = {
        items: checklist.items
          .slice()
          .sort((a, b) => a.order - b.order)
      };
    } else if (selectedType === 'quiz') {
      specific = {
        passingScore: quiz.passingScore,
        questions: quiz.questions.map(q => ({ ...q }))
      };
    } else {
      specific = { ...habit };
    }

    return {
      type: selectedType,
      moduleId,
      basic,
      ...specific,
      createdAt: new Date(),
      updatedAt: new Date()
    } as ActivityData;
  };

  // ---------- Handlers ----------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    markTouched();
    setError('');

    const v = validate();
    if (!v.ok) {
      setError(v.message);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(buildPayload());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível criar a atividade. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setSelectedType('text');
    setTouched(false);
    setError('');

    setBasic({
      title: '',
      description: '',
      instructions: '',
      order: existingActivities.length + 1,
      estimatedTime: 15,
      points: 10,
      isRequired: true
    });

    setText({ content: '', richText: false });
    setVideo({ videoUrl: '', thumbnailUrl: '' });
    setFile({ fileUrl: '', fileName: '', fileType: '', fileSize: 0 });
    setChecklist({ items: [] });
    setQuiz({ passingScore: 70, questions: [] });
    setHabit({ frequency: 'daily' });
  };

  // ---------- UI: small helpers for adding/removing ----------
  const addChecklistItem = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setChecklist(prev => ({
      items: [...prev.items, { id: uid('chk'), label: trimmed, order: prev.items.length }]
    }));
    markTouched();
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => ({ items: prev.items.filter(x => x.id !== id) }));
    markTouched();
  };

  const addQuizQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { id: uid('q'), prompt: '', options: [''], correctIndex: -1 }
      ]
    }));
    markTouched();
  };

  const removeQuizQuestion = (id: string) => {
    setQuiz(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
    markTouched();
  };

  // ---------- Render ----------
  return (
    <ModalOverlay role="dialog" aria-modal="true" onMouseDown={attemptClose}>
      <ModalContent onMouseDown={(e) => e.stopPropagation()}>
        <TopBar>
          <TopTitle>Criar atividade</TopTitle>
          <TopMeta>
            <span>Passo {step}/2</span>
            <span>•</span>
            <span>{ACTIVITY_TYPES.find(t => t.type === selectedType)?.label}</span>
          </TopMeta>
          <IconButton onClick={attemptClose} aria-label="Fechar">
            <FaTimes />
          </IconButton>
        </TopBar>

        <Form onSubmit={onSubmit}>
          {error && <ErrorBox role="alert">{error}</ErrorBox>}

          {step === 1 && (
            <StepGrid>
              <Card>
                <CardTitle>Tipo</CardTitle>
                <TypeGrid>
                  {ACTIVITY_TYPES.map(t => (
                    <TypeButton
                      key={t.type}
                      $active={selectedType === t.type}
                      $color={t.color}
                      type="button"
                      onClick={() => { setSelectedType(t.type); markTouched(); }}
                    >
                      <TypeBadge $color={t.color}><t.icon size={18} /></TypeBadge>
                      <TypeLabel>{t.label}</TypeLabel>
                    </TypeButton>
                  ))}
                </TypeGrid>
              </Card>

              <Card>
                <CardTitle>Informações básicas</CardTitle>

                <Field>
                  <Label>Título *</Label>
                  <Input
                    ref={firstFieldRef}
                    value={basic.title}
                    onChange={(e) => { setBasic(p => ({ ...p, title: e.target.value })); markTouched(); }}
                    placeholder="Ex.: Quiz de revisão"
                    autoComplete="off"
                  />
                </Field>

                <Field>
                  <Label>Descrição</Label>
                  <Textarea
                    value={basic.description}
                    onChange={(e) => { setBasic(p => ({ ...p, description: e.target.value })); markTouched(); }}
                    placeholder="Objetivo da atividade..."
                    rows={2}
                  />
                </Field>

                <Field>
                  <Label>Instruções</Label>
                  <Textarea
                    value={basic.instructions}
                    onChange={(e) => { setBasic(p => ({ ...p, instructions: e.target.value })); markTouched(); }}
                    placeholder="Como o aluno deve realizar..."
                    rows={3}
                  />
                </Field>

                <Grid3>
                  <Field>
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      value={basic.order}
                      onChange={(e) => { setBasic(p => ({ ...p, order: Number(e.target.value) || 1 })); markTouched(); }}
                    />
                  </Field>
                  <Field>
                    <Label>Tempo (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={basic.estimatedTime}
                      onChange={(e) => { setBasic(p => ({ ...p, estimatedTime: Number(e.target.value) || 1 })); markTouched(); }}
                    />
                  </Field>
                  <Field>
                    <Label>Pontos</Label>
                    <Input
                      type="number"
                      min={0}
                      value={basic.points}
                      onChange={(e) => { setBasic(p => ({ ...p, points: Number(e.target.value) || 0 })); markTouched(); }}
                    />
                  </Field>
                </Grid3>

                <Field>
                  <Label>Requisito</Label>
                  <Toggle>
                    <ToggleBtn
                      type="button"
                      $active={basic.isRequired}
                      onClick={() => { setBasic(p => ({ ...p, isRequired: true })); markTouched(); }}
                    >
                      <FaStar /> Obrigatória
                    </ToggleBtn>
                    <ToggleBtn
                      type="button"
                      $active={!basic.isRequired}
                      onClick={() => { setBasic(p => ({ ...p, isRequired: false })); markTouched(); }}
                    >
                      <FaCheck /> Opcional
                    </ToggleBtn>
                  </Toggle>
                </Field>
              </Card>
            </StepGrid>
          )}

          {step === 2 && (
            <StepGrid>
              <Card>
                <CardTitle>Configurações do tipo: {ACTIVITY_TYPES.find(t => t.type === selectedType)?.label}</CardTitle>

                {selectedType === 'text' && (
                  <>
                    <Field>
                      <Label>Conteúdo *</Label>
                      <Textarea
                        value={text.content}
                        onChange={(e) => { setText(p => ({ ...p, content: e.target.value })); markTouched(); }}
                        placeholder="Digite o texto para o aluno..."
                        rows={6}
                      />
                    </Field>
                    <Field>
                      <Inline>
                        <SmallCheckbox
                          type="checkbox"
                          checked={text.richText}
                          onChange={(e) => { setText(p => ({ ...p, richText: e.target.checked })); markTouched(); }}
                        />
                        <SmallLabel>Permitir formatação (HTML)</SmallLabel>
                      </Inline>
                    </Field>
                  </>
                )}

                {selectedType === 'video' && (
                  <>
                    <Field>
                      <Label>URL do vídeo *</Label>
                      <Input
                        value={video.videoUrl}
                        onChange={(e) => { setVideo(p => ({ ...p, videoUrl: e.target.value })); markTouched(); }}
                        placeholder="https://..."
                      />
                    </Field>
                    <Field>
                      <Label>Thumbnail (opcional)</Label>
                      <Input
                        value={video.thumbnailUrl || ''}
                        onChange={(e) => { setVideo(p => ({ ...p, thumbnailUrl: e.target.value })); markTouched(); }}
                        placeholder="https://..."
                      />
                    </Field>
                  </>
                )}

                {selectedType === 'file' && (
                  <>
                    <Field>
                      <Label>Arquivo *</Label>
                      <FileInput
                        type="file"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setFile({
                            fileUrl: '',
                            fileName: f.name,
                            fileType: f.type || 'application/octet-stream',
                            fileSize: f.size
                          });
                          markTouched();
                        }}
                      />
                      <Hint>
                        Dica: se você fizer upload em outro fluxo, pode preencher apenas o “URL do arquivo” abaixo.
                      </Hint>
                    </Field>

                    <Field>
                      <Label>URL do arquivo (opcional)</Label>
                      <Input
                        value={file.fileUrl || ''}
                        onChange={(e) => { setFile(p => ({ ...p, fileUrl: e.target.value })); markTouched(); }}
                        placeholder="https://..."
                      />
                    </Field>

                    {(file.fileName || file.fileUrl) && (
                      <InfoPill>
                        <b>Resumo:</b> {file.fileName || '—'} {file.fileType ? `• ${file.fileType}` : ''}{' '}
                        {file.fileSize ? `• ${(file.fileSize / 1024).toFixed(0)} KB` : ''}
                      </InfoPill>
                    )}
                  </>
                )}

                {selectedType === 'checklist' && (
                  <>
                    <ChecklistRow>
                      <ChecklistInput
                        placeholder="Novo item (ex.: revisar o texto)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = (e.currentTarget as HTMLInputElement).value;
                            addChecklistItem(value);
                            (e.currentTarget as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <MiniBtn type="button" onClick={() => {
                        const input = document.getElementById('chk-input') as HTMLInputElement | null;
                        if (!input) return;
                        addChecklistItem(input.value);
                        input.value = '';
                      }}>
                        <FaPlus />
                      </MiniBtn>
                    </ChecklistRow>

                    <ChecklistList>
                      {checklist.items.map((it) => (
                        <ChecklistItem key={it.id}>
                          <span>{it.label}</span>
                          <MiniBtn type="button" onClick={() => removeChecklistItem(it.id)}>
                            <FaTrash />
                          </MiniBtn>
                        </ChecklistItem>
                      ))}
                    </ChecklistList>
                    <Hint>Pressione Enter para adicionar.</Hint>
                  </>
                )}

                {selectedType === 'quiz' && (
                  <>
                    <Field>
                      <Label>Nota mínima para aprovação (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={quiz.passingScore}
                        onChange={(e) => { setQuiz(p => ({ ...p, passingScore: Number(e.target.value) || 0 })); markTouched(); }}
                      />
                    </Field>

                    <Divider />

                    <RowBetween>
                      <SubTitle>Questões</SubTitle>
                      <MiniBtn type="button" onClick={addQuizQuestion}><FaPlus /> Questão</MiniBtn>
                    </RowBetween>

                    {quiz.questions.length === 0 && (
                      <Hint>Nenhuma questão adicionada ainda. Clique em “Questão”.</Hint>
                    )}

                    {quiz.questions.map((q, idx) => (
                      <QuizCard key={q.id}>
                        <RowBetween>
                          <SubTitle>Questão {idx + 1}</SubTitle>
                          <MiniBtn type="button" onClick={() => removeQuizQuestion(q.id)}><FaTrash /></MiniBtn>
                        </RowBetween>

                        <Field>
                          <Label>Enunciado *</Label>
                          <Textarea
                            value={q.prompt}
                            onChange={(e) => {
                              setQuiz(p => ({
                                ...p,
                                questions: p.questions.map(x => x.id === q.id ? { ...x, prompt: e.target.value } : x)
                              }));
                              markTouched();
                            }}
                            rows={3}
                          />
                        </Field>

                        <Field>
                          <Label>Alternativas</Label>
                          {q.options.map((opt, optIdx) => (
                            <OptionRow key={optIdx}>
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  setQuiz(p => ({
                                    ...p,
                                    questions: p.questions.map(x => {
                                      if (x.id !== q.id) return x;
                                      const next = [...x.options];
                                      next[optIdx] = e.target.value;
                                      return { ...x, options: next };
                                    })
                                  }));
                                  markTouched();
                                }}
                                placeholder={`Alternativa ${optIdx + 1}`}
                              />
                              <RadioBtn
                                type="button"
                                $active={q.correctIndex === optIdx}
                                onClick={() => {
                                  setQuiz(p => ({
                                    ...p,
                                    questions: p.questions.map(x =>
                                      x.id === q.id ? { ...x, correctIndex: optIdx } : x
                                    )
                                  }));
                                  markTouched();
                                }}
                              >
                                <FaCheck />
                              </RadioBtn>
                            </OptionRow>
                          ))}

                          <MiniBtn type="button" onClick={() => {
                            setQuiz(p => ({
                              ...p,
                              questions: p.questions.map(x => {
                                if (x.id !== q.id) return x;
                                return { ...x, options: [...x.options, ''] };
                              })
                            }));
                            markTouched();
                          }}>
                            <FaPlus /> Alternativa
                          </MiniBtn>
                          <Hint>Marque o botão ✓ na alternativa correta.</Hint>
                        </Field>
                      </QuizCard>
                    ))}
                  </>
                )}

                {selectedType === 'habit' && (
                  <Field>
                    <Label>Frequência</Label>
                    <Select value={habit.frequency} onChange={(e) => { setHabit({ frequency: e.target.value as any }); markTouched(); }}>
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </Select>
                    <Hint>Hábito é uma atividade recorrente que o aluno pode concluir periodicamente.</Hint>
                  </Field>
                )}
              </Card>
            </StepGrid>
          )}

          <Actions>
            <SecondaryBtn type="button" onClick={() => (step === 1 ? attemptClose() : setStep(1))}>
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </SecondaryBtn>

            {step === 1 ? (
              <PrimaryBtn type="button" onClick={() => setStep(2)}>
                Próximo <FaClock style={{ marginLeft: 6 }} />
              </PrimaryBtn>
            ) : (
              <PrimaryBtn type="submit" disabled={isSubmitting || !basic.title.trim()}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner $small /> Criando...
                  </>
                ) : (
                  <>
                    <FaSave style={{ marginRight: 6 }} /> Criar atividade
                  </>
                )}
              </PrimaryBtn>
            )}
          </Actions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}

/* ===========================
   STYLES (single file, modern UI)
   =========================== */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.64);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
`;

const ModalContent = styled.div`
  width: min(980px, 100%);
  max-height: 92vh;
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  padding: 16px 16px 10px 16px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  justify-content: space-between;
`;

const TopTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.2px;
  color: #0f172a;
`;

const TopMeta = styled.div`
  margin-top: 2px;
  font-size: 13px;
  color: #64748b;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IconButton = styled.button`
  border: none;
  background: transparent;
  color: #64748b;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 120ms ease;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const Form = styled.form`
  padding: 16px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ErrorBox = styled.div`
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
`;

const StepGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #ffffff;
  padding: 12px;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 14px;
  letter-spacing: -0.1px;
  color: #0f172a;
`;

const TypeGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`;

const TypeButton = styled.button<{ $active: boolean; $color: string }>`
  border: 1px solid ${({ $active, $color }) => ($active ? $color : '#e5e7eb')};
  background: ${({ $active, $color }) => ($active ? `${$color}14` : '#f8fafc')};
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  transition: transform 120ms ease, border-color 120ms ease;
  text-align: left;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $color }) => $color};
  }
`;

const TypeBadge = styled.div<{ $color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${({ $color }) => `${$color}18`};
  color: ${({ $color }) => $color};
`;

const TypeLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
`;

const Input = styled.input`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: box-shadow 120ms ease, border-color 120ms ease;
  width: 100%;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
  }
`;

const Textarea = styled.textarea`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  width: 100%;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
  }
`;

const Select = styled.select`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  width: 100%;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
  }
`;

const Grid3 = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr 1fr;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Toggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#6366f1' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#6366f1' : '#f8fafc')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#0f172a')};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Inline = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SmallCheckbox = styled.input`
  width: 16px;
  height: 16px;
`;

const SmallLabel = styled.span`
  font-size: 13px;
  color: #334155;
`;

const Hint = styled.p`
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #64748b;
`;

const Divider = styled.div`
  height: 1px;
  background: #eef2f7;
  margin: 10px 0;
`;

const RowBetween = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
`;

const SubTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.1px;
`;

const Actions = styled.div`
  padding-top: 10px;
  border-top: 1px solid #eef2f7;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
`;

const PrimaryBtn = styled.button<{ disabled?: boolean }>`
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 800;
  font-size: 14px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  color: #ffffff;
  background: ${({ disabled }) => (disabled ? '#cbd5e1' : 'linear-gradient(135deg,#6366f1,#4f46e5)')};
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(99, 102, 241, 0.24);
  }
`;

const SecondaryBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
`;

const FileInput = styled.input`
  width: 100%;
  margin-top: 6px;
`;

const InfoPill = styled.div`
  margin-top: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  color: #334155;
`;

const ChecklistRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ChecklistInput = styled.input.attrs({ id: 'chk-input' })`
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
`;

const ChecklistList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

const ChecklistItem = styled.div`
  border: 1px solid #eef2f7;
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #fff;
  font-size: 14px;
  color: #0f172a;
`;

const MiniBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 10px;
  padding: 6px 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  color: #0f172a;
  transition: background 120ms ease;

  &:hover {
    background: #f8fafc;
  }
`;

const QuizCard = styled.div`
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 10px;
  margin-top: 10px;
  background: #ffffff;
`;

const OptionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 42px;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const RadioBtn = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#6366f1' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#6366f1' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#0f172a')};
  border-radius: 10px;
  height: 38px;
  width: 38px;
  display: grid;
  place-items: center;
  cursor: pointer;
`;
