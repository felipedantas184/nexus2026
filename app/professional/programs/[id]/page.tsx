'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaCopy,
  FaUsers,
  FaChartLine,
  FaPalette,
  FaSpinner,
  FaExclamationTriangle,
  FaSync
} from 'react-icons/fa';
import { Program, Module, Activity, ProgramStatus, ProgramVisibility } from '@/types';
import CreateModuleModal from '@/components/programs/CreateModuleModal';
import CreateActivityModal from '@/components/programs/CreateActivityModal';
import { usePrograms } from '@/hooks/usePrograms';

// Dados de configuração
const availableIcons = ['📊', '📚', '💪', '🧠', '❤️', '🎯', '⭐', '🚀', '🎨', '🔬'];
const availableColors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { loadProgram, updateProgram, createModule, createActivity } = usePrograms();

  const [programId, setProgramId] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'edit' | 'modules' | 'preview' | 'analytics'>('edit');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProgramId(resolvedParams.id);
    };

    resolveParams();
  }, [params]);

  const loadProgramData = async () => {
    if (!programId) return;

    try {
      setLoading(true);
      setError('');
      const programData = await loadProgram(programId);

      if (!programData) {
        setError('Programa não encontrado');
        return;
      }

      setProgram(programData);
    } catch (err: any) {
      console.error('Erro ao carregar programa:', err);
      setError(err.message || 'Erro ao carregar programa');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar programa
  const handleProgramUpdate = async (updates: Partial<Program>) => {
    if (!program) return;

    try {
      setSaving(true);
      await updateProgram(program.id, updates);

      // Atualizar localmente
      setProgram(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    } catch (err: any) {
      console.error('Erro ao atualizar programa:', err);
      setError(err.message || 'Erro ao atualizar programa');
    } finally {
      setSaving(false);
    }
  };

  // Criar módulo
  const handleCreateModule = async (moduleData: any) => {
    if (!program) return;

    try {
      const moduleId = await createModule({
        ...moduleData,
        programId: program.id,
        activities: []
      });

      // Recarregar programa para ver o novo módulo
      await loadProgramData();

      return moduleId;
    } catch (err: any) {
      console.error('Erro ao criar módulo:', err);
      setError(err.message || 'Erro ao criar módulo');
      throw err;
    }
  };

  // Criar atividade
  const handleCreateActivity = async (activityData: any) => {
    if (!selectedModuleId) return;

    try {
      const activityId = await createActivity({
        ...activityData,
        moduleId: selectedModuleId
      });

      // Recarregar programa para ver a nova atividade
      await loadProgramData();

      return activityId;
    } catch (err: any) {
      console.error('Erro ao criar atividade:', err);
      setError(err.message || 'Erro ao criar atividade');
      throw err;
    }
  };

  const handleOpenActivityModal = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsActivityModalOpen(true);
  };

  useEffect(() => {
    loadProgramData();
  }, [programId]);

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <FaSync className="spinner" size={32} />
          <LoadingText>Carregando programa...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error && !program) {
    return (
      <Container>
        <ErrorState>
          <ErrorIcon>
            <FaExclamationTriangle size={48} />
          </ErrorIcon>
          <ErrorTitle>Erro ao carregar programa</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <ActionButton href="/professional/programs">
            <FaArrowLeft size={16} />
            Voltar para Programas
          </ActionButton>
        </ErrorState>
      </Container>
    );
  }

  if (!program) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Programa não encontrado</ErrorTitle>
          <ActionButton href="/professional/programs">
            <FaArrowLeft size={16} />
            Voltar para Programas
          </ActionButton>
        </ErrorState>
      </Container>
    );
  }

  const totalActivities = program.modules?.reduce((total, module) =>
    total + (module.activities?.length || 0), 0) || 0;

  const totalPoints = program.modules?.reduce((total, module) =>
    total + (module.activities?.reduce((moduleTotal, activity) =>
      moduleTotal + (activity.points || 0), 0) || 0), 0) || 0;

  return (
    <Container>
      <Header>
        <BackButton href="/professional/programs">
          <FaArrowLeft size={16} />
          Voltar para Programas
        </BackButton>

        <TitleSection>
          <ProgramHeader>
            <ProgramIcon $color={program.color}>
              {program.icon}
            </ProgramIcon>
            <ProgramTitle>{program.title}</ProgramTitle>
            <ProgramStatusComponent $status={program.status}>
              {program.status === 'draft' && 'Rascunho'}
              {program.status === 'active' && 'Ativo'}
              {program.status === 'paused' && 'Pausado'}
              {program.status === 'completed' && 'Concluído'}
              {program.status === 'archived' && 'Arquivado'}
            </ProgramStatusComponent>
          </ProgramHeader>
          <Subtitle>Editando programa educacional</Subtitle>
        </TitleSection>

        <HeaderActions>
          <ActionButton href={`/professional/programs/${program.id}/assign`}>
            <FaUsers size={14} />
            Atribuir
          </ActionButton>
          <ActionButtonNoLink $secondary>
            <FaCopy size={14} />
            Duplicar
          </ActionButtonNoLink>
          <PreviewButton onClick={() => setActiveTab('preview')}>
            <FaEye size={14} />
            Visualizar
          </PreviewButton>
        </HeaderActions>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <Tabs>
        <Tab $active={activeTab === 'edit'} onClick={() => setActiveTab('edit')}>
          <FaEdit size={14} />
          Editar Informações
        </Tab>
        <Tab $active={activeTab === 'modules'} onClick={() => setActiveTab('modules')}>
          <FaPlus size={14} />
          Módulos e Atividades ({program.modules?.length || 0})
        </Tab>
        <Tab $active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
          <FaChartLine size={14} />
          Analytics
        </Tab>
      </Tabs>

      <Content>
        {activeTab === 'edit' && (
          <Form onSubmit={(e) => e.preventDefault()}>
            <FormGrid>
              <FormSection>
                <SectionTitle>Informações Básicas</SectionTitle>

                <InputGroup>
                  <Label htmlFor="title">
                    Título do Programa *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={program.title}
                    onChange={(e) => handleProgramUpdate({ title: e.target.value })}
                    placeholder="Ex: Matemática Básica, Hábitos Saudáveis..."
                    required
                    disabled={saving}
                  />
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="description">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={program.description || ''}
                    onChange={(e) => handleProgramUpdate({ description: e.target.value })}
                    placeholder="Descreva o objetivo e conteúdo do programa..."
                    rows={4}
                    disabled={saving}
                  />
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="status">
                    Status
                  </Label>
                  <Select
                    id="status"
                    value={program.status}
                    onChange={(e) => handleProgramUpdate({ status: e.target.value as ProgramStatus })}
                    disabled={saving}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Concluído</option>
                    <option value="archived">Arquivado</option>
                  </Select>
                </InputGroup>
              </FormSection>

              <FormSection>
                <SectionTitle>Personalização</SectionTitle>

                <InputGroup>
                  <Label>
                    Cor do Programa
                  </Label>
                  <ColorGrid>
                    {availableColors.map((color) => (
                      <ColorOption
                        key={color}
                        $color={color}
                        $selected={program.color === color}
                        onClick={() => !saving && handleProgramUpdate({ color })}
                        $disabled={saving}
                      >
                        {program.color === color && <FaPalette size={12} />}
                      </ColorOption>
                    ))}
                  </ColorGrid>
                </InputGroup>

                <InputGroup>
                  <Label>
                    Ícone
                  </Label>
                  <IconGrid>
                    {availableIcons.map((icon) => (
                      <IconOption
                        key={icon}
                        $selected={program.icon === icon}
                        onClick={() => !saving && handleProgramUpdate({ icon })}
                        $disabled={saving}
                      >
                        {icon}
                      </IconOption>
                    ))}
                  </IconGrid>
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="visibility">
                    Visibilidade
                  </Label>
                  <Select
                    id="visibility"
                    value={program.visibility}
                    onChange={(e) => handleProgramUpdate({ visibility: e.target.value as ProgramVisibility })}
                    disabled={saving}
                  >
                    <option value="private">Privado (apenas eu)</option>
                    <option value="shared">Compartilhado (todos os profissionais)</option>
                  </Select>
                </InputGroup>
              </FormSection>
            </FormGrid>

            <FormActions>
              <CancelButton href="/professional/programs" $disabled={saving}>
                Cancelar
              </CancelButton>
              <SaveButton
                type="button"
                onClick={() => handleProgramUpdate({})}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="spinner" size={16} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave size={16} />
                    Salvar Alterações
                  </>
                )}
              </SaveButton>
            </FormActions>
          </Form>
        )}

        {activeTab === 'modules' && (
          <ModulesSection>
            <ModulesHeader>
              <div>
                <SectionTitle>Módulos e Atividades</SectionTitle>
                <ModulesStats>
                  <Stat>{program.modules?.length || 0} módulos</Stat>
                  <Stat>{totalActivities} atividades</Stat>
                  <Stat>{totalPoints} pontos totais</Stat>
                  <Stat>{program.estimatedDuration}min estimados</Stat>
                </ModulesStats>
              </div>
              <AddModuleButton onClick={() => setIsModuleModalOpen(true)}>
                <FaPlus size={14} />
                Adicionar Módulo
              </AddModuleButton>
            </ModulesHeader>

            <ModulesList>
              {program.modules?.map((module) => (
                <ModuleCard key={module.id}>
                  <ModuleHeader>
                    <ModuleInfo>
                      <ModuleTitle>Módulo {module.order}: {module.title}</ModuleTitle>
                      <ModuleDescription>{module.description}</ModuleDescription>
                      <ModuleStats>
                        {module.activities?.length || 0} atividades •
                        {(module.activities?.reduce((total, activity) => total + (activity.estimatedTime || 0), 0) || 0)}min •
                        {(module.activities?.reduce((total, activity) => total + (activity.points || 0), 0) || 0)} pontos
                      </ModuleStats>
                    </ModuleInfo>
                    <ModuleActions>
                      <ActionButtonSmall>
                        <FaEdit size={12} />
                      </ActionButtonSmall>
                      <ActionButtonSmall $secondary>
                        <FaTrash size={12} />
                      </ActionButtonSmall>
                    </ModuleActions>
                  </ModuleHeader>

                  <ActivitiesList>
                    {module.activities?.map((activity) => (
                      <ActivityItem key={activity.id}>
                        <ActivityIcon $type={activity.type}>
                          {activity.type === 'text' && '📝'}
                          {activity.type === 'quiz' && '❓'}
                          {activity.type === 'video' && '🎥'}
                          {activity.type === 'checklist' && '✅'}
                          {activity.type === 'file' && '📎'}
                          {activity.type === 'habit' && '🔄'}
                        </ActivityIcon>
                        <ActivityInfo>
                          <ActivityTitle>{activity.title}</ActivityTitle>
                          <ActivityMeta>
                            {activity.estimatedTime}min • {activity.points} pontos • {activity.isRequired ? 'Obrigatório' : 'Opcional'}
                          </ActivityMeta>
                        </ActivityInfo>
                        <ActivityActions>
                          <ActionButtonSmall>
                            <FaEdit size={10} />
                          </ActionButtonSmall>
                          <ActionButtonSmall $secondary>
                            <FaTrash size={10} />
                          </ActionButtonSmall>
                        </ActivityActions>
                      </ActivityItem>
                    ))}

                    <AddActivityButton onClick={() => handleOpenActivityModal(module.id)}>
                      <FaPlus size={12} />
                      Adicionar Atividade
                    </AddActivityButton>
                  </ActivitiesList>
                </ModuleCard>
              ))}
            </ModulesList>

            {(!program.modules || program.modules.length === 0) && (
              <EmptyModules>
                <EmptyIcon>
                  <FaPlus size={48} />
                </EmptyIcon>
                <EmptyTitle>Nenhum módulo criado</EmptyTitle>
                <EmptyDescription>
                  Adicione módulos para organizar as atividades do programa
                </EmptyDescription>
                <AddModuleButton $large onClick={() => setIsModuleModalOpen(true)}>
                  <FaPlus size={16} />
                  Criar Primeiro Módulo
                </AddModuleButton>
              </EmptyModules>
            )}
          </ModulesSection>
        )}

        {/* Preview e Analytics permanecem similares, mas com dados reais */}
        {activeTab === 'preview' && (
          <PreviewSection>
            <SectionTitle>Visualização do Aluno</SectionTitle>
            <PreviewContainer>
              <PreviewHeader $color={program.color}>
                <PreviewIcon>{program.icon}</PreviewIcon>
                <PreviewInfo>
                  <PreviewTitle>{program.title}</PreviewTitle>
                  <PreviewDescription>{program.description || 'Sem descrição'}</PreviewDescription>
                </PreviewInfo>
              </PreviewHeader>

              <PreviewModules>
                {program.modules?.map((module, index) => (
                  <PreviewModule key={module.id} $locked={module.isLocked}>
                    <ModuleHeader>
                      <ModuleNumber>Módulo {index + 1}</ModuleNumber>
                      <ModuleStatus $locked={module.isLocked}>
                        {module.isLocked ? '🔒 Bloqueado' : '🔓 Disponível'}
                      </ModuleStatus>
                    </ModuleHeader>
                    <ModuleTitle>{module.title}</ModuleTitle>
                    <ModuleDescription>{module.description}</ModuleDescription>

                    <PreviewActivities>
                      {module.activities?.map((activity) => (
                        <PreviewActivity key={activity.id}>
                          <ActivityIcon $type={activity.type}>
                            {activity.type === 'text' && '📝'}
                            {activity.type === 'quiz' && '❓'}
                            {activity.type === 'video' && '🎥'}
                            {activity.type === 'checklist' && '✅'}
                            {activity.type === 'file' && '📎'}
                            {activity.type === 'habit' && '🔄'}
                          </ActivityIcon>
                          <ActivityTitle>{activity.title}</ActivityTitle>
                          <ActivityPoints>{activity.points} pts</ActivityPoints>
                        </PreviewActivity>
                      ))}
                    </PreviewActivities>
                  </PreviewModule>
                ))}
              </PreviewModules>
            </PreviewContainer>
          </PreviewSection>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsSection>
            <SectionTitle>Analytics do Programa</SectionTitle>
            <AnalyticsGrid>
              <AnalyticsCard>
                <AnalyticsNumber>{program.assignedStudents?.length || 0}</AnalyticsNumber>
                <AnalyticsLabel>Alunos Atribuídos</AnalyticsLabel>
              </AnalyticsCard>
              <AnalyticsCard>
                <AnalyticsNumber>
                  {program.assignedStudents && program.assignedStudents.length > 0
                    ? Math.round(program.assignedStudents.reduce((sum, student) => sum + student.progress.totalProgress, 0) / program.assignedStudents.length)
                    : 0
                  }%
                </AnalyticsNumber>
                <AnalyticsLabel>Progresso Médio</AnalyticsLabel>
              </AnalyticsCard>
              <AnalyticsCard>
                <AnalyticsNumber>
                  {program.assignedStudents?.filter(student => student.progress.totalProgress === 100).length || 0}
                </AnalyticsNumber>
                <AnalyticsLabel>Concluíram</AnalyticsLabel>
              </AnalyticsCard>
              <AnalyticsCard>
                <AnalyticsNumber>
                  {(program.assignedStudents?.reduce((sum, student) => sum + student.progress.timeSpent, 0) || 0)}min
                </AnalyticsNumber>
                <AnalyticsLabel>Tempo Total</AnalyticsLabel>
              </AnalyticsCard>
            </AnalyticsGrid>
          </AnalyticsSection>
        )}
      </Content>

      {/* Modais */}
      <CreateModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSave={handleCreateModule}
        programId={program.id}
        existingModules={program.modules || []}
      />

      <CreateActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedModuleId(null);
        }}
        onSave={handleCreateActivity}
        moduleId={selectedModuleId || ''}
        existingActivities={
          program.modules?.find(m => m.id === selectedModuleId)?.activities || []
        }
      />
    </Container>
  );
}

const Container = styled.div`
  padding: 32px;
  background: #f8fafc;
  min-height: 100%;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 16px;
  color: #64748b;

  .spinner {
    animation: spin 1s linear infinite;
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const ErrorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
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

const ProgramHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`;

const ProgramIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const ProgramTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const ProgramStatusComponent = styled.span<{ $status: string }>`
  background: ${props => {
    switch (props.$status) {
      case 'active': return '#10b98115';
      case 'draft': return '#6b728015';
      case 'paused': return '#f59e0b15';
      case 'completed': return '#6366f115';
      case 'archived': return '#ef444415';
      default: return '#6b728015';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'active': return '#10b981';
      case 'draft': return '#6b7280';
      case 'paused': return '#f59e0b';
      case 'completed': return '#6366f1';
      case 'archived': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const PreviewButton = styled.button`
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #7c3aed;
    transform: translateY(-1px);
  }
`;

const Tabs = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${props => props.$active ? '#6366f1' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#6366f1' : '#f8fafc'};
  }
`;

const Content = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ModulesSection = styled.div``;

const ModulesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ModulesStats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const Stat = styled.span`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
`;

const AddModuleButton = styled.button<{ $large?: boolean }>`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: ${props => props.$large ? '12px 20px' : '10px 16px'};
  font-size: ${props => props.$large ? '14px' : '12px'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const ModulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModuleCard = styled.div`
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ModuleInfo = styled.div`
  flex: 1;
`;

const ModuleTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const ModuleDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 8px 0;
`;

const ModuleStats = styled.div`
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
`;

const ModuleActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }
`;

const ActivityIcon = styled.div<{ $type: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => {
    switch (props.$type) {
      case 'text': return '#6366f115';
      case 'quiz': return '#10b98115';
      case 'video': return '#ef444415';
      case 'checklist': return '#f59e0b15';
      case 'file': return '#8b5cf615';
      case 'habit': return '#06b6d415';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'text': return '#6366f1';
      case 'quiz': return '#10b981';
      case 'video': return '#ef4444';
      case 'checklist': return '#f59e0b';
      case 'file': return '#8b5cf6';
      case 'habit': return '#06b6d4';
      default: return '#64748b';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 2px;
`;

const ActivityMeta = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ActivityActions = styled.div`
  display: flex;
  gap: 4px;
`;

const AddActivityButton = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const EmptyModules = styled.div`
  text-align: center;
  padding: 60px 20px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 24px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
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

  &::placeholder {
    color: #9ca3af;
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

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const ColorOption = styled.button<{ $color: string; $selected: boolean; $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color};
  border: 3px solid ${props => props.$selected ? props.$color : 'transparent'};
  outline: ${props => props.$selected ? `2px solid ${props.$color}40` : 'none'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.$disabled ? 'none' : 'all'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`;

const IconOption = styled.button<{ $selected: boolean; $disabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$selected ? '#6366f1' : '#f8fafc'};
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e2e8f0'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.$disabled ? 'none' : 'all'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    border-color: #6366f1;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #ef4444;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 32px;
  border-top: 2px solid #f1f5f9;
`;

const CancelButton = styled(Link) <{ $disabled?: boolean }>`
  background: #f8fafc;
  color: ${props => props.$disabled ? '#94a3b8' : '#374151'};
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  pointer-events: ${props => props.$disabled ? 'none' : 'all'};

  &:hover {
    background: ${props => props.$disabled ? '#f8fafc' : '#f1f5f9'};
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

// Preview Section Styles
const PreviewSection = styled.div``;

const PreviewContainer = styled.div`
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
`;

const PreviewHeader = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${props => props.$color}15, ${props => props.$color}08);
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const PreviewIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const PreviewInfo = styled.div`
  flex: 1;
`;

const PreviewTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const PreviewDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const PreviewModules = styled.div`
  padding: 24px;
`;

const PreviewModule = styled.div<{ $locked: boolean }>`
  background: ${props => props.$locked ? '#f8fafc' : 'white'};
  border: 1px solid ${props => props.$locked ? '#e2e8f0' : '#d1d5db'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  opacity: ${props => props.$locked ? 0.6 : 1};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$locked ? '#e2e8f0' : '#6366f1'};
    box-shadow: ${props => props.$locked ? 'none' : '0 2px 8px rgba(99, 102, 241, 0.1)'};
  }
`;

const ModuleNumber = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 4px 8px;
  border-radius: 6px;
`;

const ModuleStatus = styled.span<{ $locked: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$locked ? '#94a3b8' : '#10b981'};
`;

const PreviewActivities = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const PreviewActivity = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #d1d5db;
  }
`;

const ActivityPoints = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 12px;
  margin-left: auto;
`;

// Analytics Section Styles
const AnalyticsSection = styled.div``;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const AnalyticsCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #6366f1;
  }
`;

const AnalyticsNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

const AnalyticsLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

// Adicionar estilos para os botões de ação sem Link
const ActionButtonNoLink = styled.button<{ $secondary?: boolean; $small?: boolean }>`
  background: ${props => props.$secondary ? '#f8fafc' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${props => props.$secondary ? '#374151' : 'white'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 8px;
  padding: ${props => props.$small ? '8px' : '10px 16px'};
  font-size: ${props => props.$small ? '12px' : '14px'};
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$secondary
    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
    : '0 4px 12px rgba(99, 102, 241, 0.3)'
  };
  }
`;

// Atualizar o componente ActionButton para aceitar tanto Link quanto button
const ActionButton: any = styled(Link) <{ $secondary?: boolean; $small?: boolean }>`
  background: ${props => props.$secondary ? '#f8fafc' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${props => props.$secondary ? '#374151' : 'white'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 8px;
  padding: ${props => props.$small ? '8px' : '10px 16px'};
  font-size: ${props => props.$small ? '12px' : '14px'};
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$secondary
    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
    : '0 4px 12px rgba(99, 102, 241, 0.3)'
  };
  }
`;

// Adicionar estilos para os botões de módulo e atividade
const AddModuleButtonNoLink = styled.button<{ $large?: boolean }>`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: ${props => props.$large ? '12px 20px' : '10px 16px'};
  font-size: ${props => props.$large ? '14px' : '12px'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const AddActivityButtonNoLink = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const SaveButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }

  .spinner {
    animation: spin 1s linear infinite;
  }
`;

const ActionButtonSmall = styled.button<{ $secondary?: boolean }>`
  background: ${props => props.$secondary ? '#f8fafc' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${props => props.$secondary ? '#374151' : 'white'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 6px;
  padding: 6px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

// Adicionar keyframes para o spinner
const keyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;