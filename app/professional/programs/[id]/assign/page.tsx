'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaSave,
  FaUsers,
  FaSearch,
  FaCheck,
  FaTimes,
  FaUserPlus,
  FaCalendar,
  FaClock
} from 'react-icons/fa';
import { assignmentsService } from '@/lib/firebase/services/programsService'; // ← MESMO ARQUIVO
import { studentsService } from '@/lib/firebase/services/studentsService';
import { programsService } from '@/lib/firebase/services/programsService';
import { Student, Program } from '@/types';
import { addDoc, arrayUnion, collection, doc, getDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';

export default function AssignProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();

  // Desestruturar params usando use()
  const { id } = use(params);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentConfig, setAssignmentConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    hasEndDate: false,
    endDate: '',
    sendNotification: true,
    customMessage: ''
  });

  // Carregar dados
  useEffect(() => {
    if (user?.id && id) {
      loadData();
    }
  }, [id, user?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [programData, studentsData] = await Promise.all([
        programsService.getProgramById(id),
        studentsService.getProfessionalStudents(user!.id)
      ]);

      setProgram(programData);
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar alunos baseado na busca
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.personalInfo?.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar se aluno já tem o programa atribuído - COMPATÍVEL
  const hasProgram = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.assignedPrograms?.includes(id) || false; // ← Usar id
  };

  const toggleStudentSelection = (studentId: string) => {
    if (hasProgram(studentId)) return;

    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    const availableStudents = filteredStudents
      .filter(student => !hasProgram(student.id))
      .map(student => student.id);
    setSelectedStudents(availableStudents);
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Certificações: user existe e há alunos selecionados
    if (!user?.id || selectedStudents.length === 0) return;

    setIsSubmitting(true);
    
    // 1. Inicializa o Write Batch
    const batch = writeBatch(firestore);

    try {
        console.log('🔄 SOLUÇÃO RECOMENDADA - Atribuindo programas com Write Batch...');

        for (const studentId of selectedStudents) {
            console.log(`🎯 Preparando operações para aluno: ${studentId}`);

            // === AÇÕES POR ALUNO ===

            // 1. Criar assignment (addDoc substituído por set no batch)
            const assignmentRef = doc(collection(firestore, 'assignments')); // Nova referência de documento
            const assignmentData = {
                programId: id,
                studentId,
                assignedBy: user.id,
                assignedAt: serverTimestamp(),
                startDate: assignmentConfig.startDate ? new Date(assignmentConfig.startDate) : undefined,
                endDate: assignmentConfig.endDate ? new Date(assignmentConfig.endDate) : undefined,
                status: 'active',
                progress: 0,
                completedActivities: [],
                customMessage: assignmentConfig.customMessage || '',
                sendNotification: assignmentConfig.sendNotification || false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            batch.set(assignmentRef, assignmentData); // Adiciona a operação ao batch
            console.log(`✅ Assignment preparado para ${studentId}`);

            // 2. ATUALIZAR ALUNO (updateDoc no batch, usando arrayUnion)
            const studentRef = doc(firestore, 'students', studentId);
            batch.update(studentRef, {
                // arrayUnion adiciona o ID apenas se ele não estiver presente
                assignedPrograms: arrayUnion(id), 
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Atualização de Aluno preparada para ${studentId}`);

            // 3. ATUALIZAR PROGRAMA (updateDoc no batch, usando arrayUnion)
            const programRef = doc(firestore, 'programs', id);
            batch.update(programRef, {
                // arrayUnion adiciona o ID do aluno ao array
                assignedStudents: arrayUnion(studentId),
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Atualização de Programa preparada para ${studentId}`);
        }

        // 4. Comitar o Write Batch
        await batch.commit(); // Executa todas as operações de forma atômica
        console.log('🎉 ATRIBUIÇÃO CONCLUÍDA COM SUCESSO (BATCH COMMIT)!');
        router.push(`/professional/programs/${id}`);

    } catch (error: any) {
        console.error('❌ Erro durante o commit do Batch:', error);
        alert(`Erro: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
};

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando dados...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!program) {
    return (
      <ErrorContainer>
        <ErrorTitle>Programa não encontrado</ErrorTitle>
        <ErrorDescription>
          O programa que você está tentando atribuir não existe ou você não tem acesso.
        </ErrorDescription>
        <BackButton href="/professional/programs">
          <FaArrowLeft size={16} />
          Voltar para Programas
        </BackButton>
      </ErrorContainer>
    );
  }

  const totalActivities = program.modules?.reduce((total, module) =>
    total + (module.activities?.length || 0), 0) || 0;

  const totalPoints = program.modules?.reduce((total, module) =>
    total + (module.activities?.reduce((moduleTotal, activity) =>
      moduleTotal + (activity.points || 0), 0) || 0), 0) || 0;

  const estimatedDuration = program.estimatedDuration || program.modules?.reduce((total, module) =>
    total + (module.activities?.reduce((moduleTotal, activity) =>
      moduleTotal + (activity.estimatedTime || 0), 0) || 0), 0) || 0;

  return (
    <Container>
      <Header>
        <BackButton href={`/professional/programs/${id}`}>
          <FaArrowLeft size={16} />
          Voltar para o Programa
        </BackButton>

        <TitleSection>
          <ProgramHeader>
            <ProgramIcon $color={program.color || '#6366f1'}>
              {program.icon || '📚'}
            </ProgramIcon>
            <div>
              <Title>Atribuir Programa</Title>
              <ProgramTitle>{program.title}</ProgramTitle>
            </div>
          </ProgramHeader>
          <Subtitle>Selecione os alunos para atribuir este programa</Subtitle>
        </TitleSection>
      </Header>

      <ContentGrid>
        {/* Lista de Alunos */}
        <StudentsSection>
          <SectionHeader>
            <SectionTitle>Selecionar Alunos</SectionTitle>
            <SelectionActions>
              <ActionButton onClick={selectAllStudents} type="button">
                Selecionar Todos
              </ActionButton>
              <ActionButton $secondary onClick={clearSelection} type="button">
                Limpar Seleção
              </ActionButton>
            </SelectionActions>
          </SectionHeader>

          <SearchBox>
            <FaSearch size={16} color="#64748b" />
            <SearchInput
              placeholder="Buscar alunos por nome, email ou escola..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          <SelectedInfo>
            <SelectedCount>
              {selectedStudents.length} aluno(s) selecionado(s)
            </SelectedCount>
            <SelectedStudents>
              {selectedStudents.map(studentId => {
                const student = students.find(s => s.id === studentId);
                return student ? (
                  <StudentChip key={studentId}>
                    {student.name}
                    <RemoveChip onClick={() => toggleStudentSelection(studentId)} type="button">
                      <FaTimes size={10} />
                    </RemoveChip>
                  </StudentChip>
                ) : null;
              })}
            </SelectedStudents>
          </SelectedInfo>

          <StudentsList>
            {filteredStudents.map((student) => {
              const isSelected = selectedStudents.includes(student.id);
              const alreadyHasProgram = hasProgram(student.id);

              return (
                <StudentCard
                  key={student.id}
                  $selected={isSelected}
                  $disabled={alreadyHasProgram}
                  onClick={() => !alreadyHasProgram && toggleStudentSelection(student.id)}
                >
                  <StudentCheckbox $selected={isSelected} $disabled={alreadyHasProgram}>
                    {isSelected && <FaCheck size={12} />}
                    {alreadyHasProgram && <FaCheck size={12} />}
                  </StudentCheckbox>

                  <StudentInfo>
                    <StudentName>
                      {student.name}
                      {alreadyHasProgram && <AlreadyAssignedLabel>Já atribuído</AlreadyAssignedLabel>}
                    </StudentName>
                    <StudentDetails>
                      {student.personalInfo?.school || 'Sem escola'} • {student.personalInfo?.grade || 'Sem série'}
                    </StudentDetails>
                    <StudentStats>
                      <Stat>Nível {student.level || 1}</Stat>
                      <Stat>{student.totalPoints || 0} pontos</Stat>
                      <Stat>{student.streak || 0} dias</Stat>
                    </StudentStats>
                  </StudentInfo>

                  <StudentStatus $hasProgram={alreadyHasProgram}>
                    {alreadyHasProgram ? 'Já possui' : 'Disponível'}
                  </StudentStatus>
                </StudentCard>
              );
            })}

            {filteredStudents.length === 0 && (
              <EmptyState>
                <EmptyIcon>
                  <FaUsers size={32} />
                </EmptyIcon>
                <EmptyTitle>Nenhum aluno encontrado</EmptyTitle>
                <EmptyDescription>
                  {searchTerm
                    ? 'Tente ajustar os termos da busca'
                    : 'Não há alunos cadastrados no sistema'
                  }
                </EmptyDescription>
                <ActionButtonLink href="/professional/students/register">
                  <FaUserPlus size={14} />
                  Cadastrar Aluno
                </ActionButtonLink>
              </EmptyState>
            )}
          </StudentsList>
        </StudentsSection>

        {/* Configuração da Atribuição */}
        <AssignmentSection>
          <SectionTitle>Configuração da Atribuição</SectionTitle>

          <AssignmentForm onSubmit={handleSubmit}>
            <ConfigCard>
              <ConfigGroup>
                <ConfigLabel>
                  <FaCalendar size={14} />
                  Data de Início
                </ConfigLabel>
                <ConfigInput
                  type="date"
                  value={assignmentConfig.startDate}
                  onChange={(e) => setAssignmentConfig(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                />
              </ConfigGroup>

              <ConfigGroup>
                <ConfigLabel>
                  <input
                    type="checkbox"
                    checked={assignmentConfig.hasEndDate}
                    onChange={(e) => setAssignmentConfig(prev => ({
                      ...prev,
                      hasEndDate: e.target.checked
                    }))}
                  />
                  Definir Data de Término
                </ConfigLabel>
                {assignmentConfig.hasEndDate && (
                  <ConfigInput
                    type="date"
                    value={assignmentConfig.endDate}
                    onChange={(e) => setAssignmentConfig(prev => ({
                      ...prev,
                      endDate: e.target.value
                    }))}
                    min={assignmentConfig.startDate}
                  />
                )}
              </ConfigGroup>

              <ConfigGroup>
                <ConfigLabel>
                  <input
                    type="checkbox"
                    checked={assignmentConfig.sendNotification}
                    onChange={(e) => setAssignmentConfig(prev => ({
                      ...prev,
                      sendNotification: e.target.checked
                    }))}
                  />
                  Enviar Notificação
                </ConfigLabel>
              </ConfigGroup>
            </ConfigCard>

            <ConfigCard>
              <ConfigGroup>
                <ConfigLabel>Mensagem Personalizada (Opcional)</ConfigLabel>
                <ConfigTextarea
                  placeholder="Escreva uma mensagem motivacional para os alunos..."
                  value={assignmentConfig.customMessage}
                  onChange={(e) => setAssignmentConfig(prev => ({
                    ...prev,
                    customMessage: e.target.value
                  }))}
                  rows={4}
                />
              </ConfigGroup>
            </ConfigCard>

            {/* Resumo do Programa */}
            <ProgramSummary>
              <SummaryTitle>Resumo do Programa</SummaryTitle>
              <SummaryStats>
                <SummaryStat>
                  <StatNumber>{program.modules?.length || 0}</StatNumber>
                  <StatLabel>Módulos</StatLabel>
                </SummaryStat>
                <SummaryStat>
                  <StatNumber>{totalActivities}</StatNumber>
                  <StatLabel>Atividades</StatLabel>
                </SummaryStat>
                <SummaryStat>
                  <StatNumber>{estimatedDuration}</StatNumber>
                  <StatLabel>
                    <FaClock size={12} />
                    min
                  </StatLabel>
                </SummaryStat>
                <SummaryStat>
                  <StatNumber>{totalPoints}</StatNumber>
                  <StatLabel>Pontos</StatLabel>
                </SummaryStat>
              </SummaryStats>

              <ModulesPreview>
                {program.modules?.map((module, index) => (
                  <ModulePreview key={module.id}>
                    <ModuleNumber>Módulo {index + 1}</ModuleNumber>
                    <ModuleTitle>{module.title}</ModuleTitle>
                    <ActivitiesCount>
                      {module.activities?.length || 0} atividades
                    </ActivitiesCount>
                  </ModulePreview>
                )) || (
                    <ModulePreview>
                      <ModuleTitle>Nenhum módulo cadastrado</ModuleTitle>
                    </ModulePreview>
                  )}
              </ModulesPreview>
            </ProgramSummary>

            <SubmitActions>
              <CancelButton
                href={`/professional/programs/${id}`}
              >
                Cancelar
              </CancelButton>
              <SubmitButton
                type="submit"
                disabled={isSubmitting || selectedStudents.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner $small />
                    Atribuindo...
                  </>
                ) : (
                  <>
                    <FaSave size={16} />
                    Atribuir para {selectedStudents.length} Aluno(s)
                  </>
                )}
              </SubmitButton>
            </SubmitActions>
          </AssignmentForm>
        </AssignmentSection>
      </ContentGrid>
    </Container>
  );
}

const Container = styled.div`
  padding: 32px;
  background: #f8fafc;
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;

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

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const ProgramTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #6366f1;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StudentsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const SelectionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $secondary?: boolean }>`
  background: ${props => props.$secondary ? '#f8fafc' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: ${props => props.$secondary ? '#374151' : 'white'};
  border: ${props => props.$secondary ? '1px solid #e2e8f0' : 'none'};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$secondary
    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
    : '0 4px 12px rgba(99, 102, 241, 0.3)'
  };
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: none;
  font-size: 14px;
  width: 100%;
  color: #374151;

  &::placeholder {
    color: #9ca3af;
  }
`;

const SelectedInfo = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const SelectedCount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 8px;
`;

const SelectedStudents = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StudentChip = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveChip = styled.button`
  background: none;
  border: none;
  color: #0369a1;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #bae6fd;
  }
`;

const StudentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 600px;
  overflow-y: auto;
`;

const StudentCard = styled.div<{ $selected: boolean; $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${props => {
    if (props.$disabled) return '#f8fafc';
    return props.$selected ? '#f0f9ff' : 'white';
  }};
  border: 2px solid ${props => {
    if (props.$disabled) return '#e2e8f0';
    return props.$selected ? '#0ea5e9' : '#e2e8f0';
  }};
  border-radius: 12px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.6 : 1};

  &:hover {
    border-color: ${props => props.$disabled ? '#e2e8f0' : '#6366f1'};
  }
`;

const StudentCheckbox = styled.div<{ $selected: boolean; $disabled: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => {
    if (props.$disabled) return '#94a3b8';
    return props.$selected ? '#0ea5e9' : '#cbd5e1';
  }};
  background: ${props => {
    if (props.$disabled) return '#e2e8f0';
    return props.$selected ? '#0ea5e9' : 'white';
  }};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlreadyAssignedLabel = styled.span`
  background: #dcfce7;
  color: #166534;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
`;

const StudentDetails = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;
`;

const StudentStats = styled.div`
  display: flex;
  gap: 12px;
`;

const Stat = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
`;

const StudentStatus = styled.div<{ $hasProgram: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$hasProgram ? '#059669' : '#6366f1'};
  background: ${props => props.$hasProgram ? '#dcfce7' : '#eef2ff'};
  padding: 4px 8px;
  border-radius: 12px;
  flex-shrink: 0;
`;

const AssignmentSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  height: fit-content;
  position: sticky;
  top: 32px;
`;

const AssignmentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ConfigCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const ConfigGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ConfigLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input[type="checkbox"] {
    margin: 0;
  }
`;

const ConfigInput = styled.input`
  padding: 10px 12px;
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

const ConfigTextarea = styled.textarea`
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

const ProgramSummary = styled.div`
  background: linear-gradient(135deg, #6366f115, #8b5cf615);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const SummaryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px 0;
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const SummaryStat = styled.div`
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

const ModulesPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModulePreview = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
`;

const ModuleNumber = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 4px;
`;

const ModuleTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 2px;
`;

const ActivitiesCount = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const SubmitActions = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const CancelButton = styled(Link)`
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  flex: 1;

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
  justify-content: center;
  transition: all 0.2s ease;
  flex: 2;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
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
  margin: 0 0 20px 0;
`;

// Adicionar ActionButton como Link
const ActionButtonLink = styled(Link)`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  min-height: 100vh;
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #64748b;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  min-height: 100vh;
  text-align: center;
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

const ErrorDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin-bottom: 24px;
  max-width: 400px;
`;