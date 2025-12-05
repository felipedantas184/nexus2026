// app/professional/schedules/[id]/assign/page.tsx - NOVO ARQUIVO
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  FaUserCheck
} from 'react-icons/fa';
import { useSchedules } from '@/hooks/useSchedules';
import { studentsService } from '@/lib/firebase/services/studentsService';
import { Student } from '@/types';
import { useAuth } from '@/context/AuthContext'; // ← ADICIONAR

export default function AssignSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth(); // ← ADICIONAR

  const { schedules, assignScheduleToStudents } = useSchedules();

  const scheduleId = params.id as string;
  const [schedule, setSchedule] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar cronograma
        const foundSchedule = schedules.find(s => s.id === scheduleId);
        if (foundSchedule) {
          setSchedule(foundSchedule);
          setSelectedStudents(foundSchedule.assignedStudents || []);
        }

        // Carregar alunos
        const allStudents = await studentsService.getProfessionalStudents(user!.id);
        setStudents(allStudents);
        setFilteredStudents(allStudents);

      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (schedules.length > 0) {
      loadData();
    }
  }, [schedules, scheduleId]);

  // Filtrar alunos
  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schedule) return;

    setIsSubmitting(true);
    setError('');

    try {
      await assignScheduleToStudents(schedule.id, selectedStudents);
      router.push('/professional/schedules');

    } catch (err: any) {
      console.error('Erro ao atribuir cronograma:', err);
      setError(err.message || 'Erro ao atribuir cronograma');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Carregando...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (!schedule) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Cronograma não encontrado</ErrorTitle>
          <ErrorMessage>O cronograma que você está tentando atribuir não existe.</ErrorMessage>
          <BackButton href="/professional/schedules">
            <FaArrowLeft size={16} />
            Voltar para Cronogramas
          </BackButton>
        </ErrorState>
      </Container>
    );
  }

  const currentlyAssignedCount = schedule.assignedStudents?.length || 0;
  const willBeAssignedCount = selectedStudents.length;

  return (
    <Container>
      <Header>
        <BackButton href="/professional/schedules">
          <FaArrowLeft size={16} />
          Voltar para Cronogramas
        </BackButton>

        <TitleSection>
          <Title>
            <FaUsers size={24} />
            Atribuir Cronograma
          </Title>
          <Subtitle>Selecione os alunos para "{schedule.title}"</Subtitle>
        </TitleSection>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <Content>
        {/* Resumo do Cronograma */}
        <ScheduleSummary>
          <SummaryHeader>
            <SummaryTitle>Resumo do Cronograma</SummaryTitle>
            <SummaryStats>
              <Stat>
                <StatNumber>{schedule.weekDays.reduce((total: number, day: any) => total + (day.activities?.length || 0), 0)}</StatNumber>
                <StatLabel>Atividades</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>{schedule.weekDays.filter((day: any) => day.activities?.length > 0).length}</StatNumber>
                <StatLabel>Dias</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>{currentlyAssignedCount}</StatNumber>
                <StatLabel>Atualmente</StatLabel>
              </Stat>
            </SummaryStats>
          </SummaryHeader>

          <ScheduleDescription>
            {schedule.description || 'Sem descrição'}
          </ScheduleDescription>
        </ScheduleSummary>

        {/* Seleção de Alunos */}
        <SelectionSection>
          <SectionHeader>
            <SectionTitle>Selecionar Alunos</SectionTitle>

            <HeaderActions>
              <SearchBox>
                <SearchIcon>
                  <FaSearch size={16} />
                </SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Buscar alunos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBox>

              <SelectAllButton onClick={handleSelectAll}>
                {selectedStudents.length === filteredStudents.length ? (
                  <>
                    <FaTimes size={14} />
                    Desmarcar Todos
                  </>
                ) : (
                  <>
                    <FaCheck size={14} />
                    Selecionar Todos
                  </>
                )}
              </SelectAllButton>
            </HeaderActions>
          </SectionHeader>

          <StudentsGrid>
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                $selected={selectedStudents.includes(student.id)}
                onClick={() => handleStudentToggle(student.id)}
              >
                <StudentAvatar>
                  {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </StudentAvatar>

                <StudentInfo>
                  <StudentName>{student.name}</StudentName>
                  <StudentEmail>{student.email}</StudentEmail>
                </StudentInfo>

                <SelectionIndicator>
                  {selectedStudents.includes(student.id) ? (
                    <FaCheck size={16} />
                  ) : (
                    <FaUserPlus size={16} />
                  )}
                </SelectionIndicator>
              </StudentCard>
            ))}
          </StudentsGrid>

          {filteredStudents.length === 0 && (
            <EmptyState>
              <EmptyIcon>
                <FaUsers size={48} />
              </EmptyIcon>
              <EmptyTitle>Nenhum aluno encontrado</EmptyTitle>
              <EmptyDescription>
                {students.length === 0
                  ? 'Cadastre alunos primeiro para atribuir cronogramas'
                  : 'Tente ajustar o termo de busca'
                }
              </EmptyDescription>
              {students.length === 0 && (
                <ActionButton href="/professional/students/register">
                  <FaUserPlus size={16} />
                  Cadastrar Primeiro Aluno
                </ActionButton>
              )}
            </EmptyState>
          )}
        </SelectionSection>

        {/* Resumo e Ações */}
        <ActionsSection>
          <AssignmentSummary>
            <SummaryText>
              <strong>{willBeAssignedCount}</strong> aluno(s) selecionado(s)
              {currentlyAssignedCount > 0 && (
                <CurrentAssignment>
                  ({currentlyAssignedCount} atualmente atribuído(s))
                </CurrentAssignment>
              )}
            </SummaryText>
          </AssignmentSummary>

          <ActionButtons>
            <CancelButton href="/professional/schedules">
              Cancelar
            </CancelButton>
            <SubmitButton
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner $small />
                  Atribuindo...
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  Confirmar Atribuição
                </>
              )}
            </SubmitButton>
          </ActionButtons>
        </ActionsSection>
      </Content>
    </Container>
  );
}

// ========== ESTILOS ==========
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

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
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

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ScheduleSummary = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const SummaryTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const SummaryStats = styled.div`
  display: flex;
  gap: 20px;
`;

const Stat = styled.div`
  text-align: center;
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ScheduleDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const SelectionSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const SearchBox = styled.div`
  position: relative;
  min-width: 250px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const SelectAllButton = styled.button`
  background: #f1f5f9;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #e2e8f0;
  }
`;

const StudentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding: 4px;
`;

const StudentCard = styled.div<{ $selected: boolean }>`
  background: ${props => props.$selected ? '#eef2ff' : 'white'};
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    border-color: #6366f1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StudentAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
`;

const StudentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const StudentName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StudentEmail = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StudentDetails = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const SelectionIndicator = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
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
  margin: 0 auto 16px;
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

const ActionButton = styled(Link)`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const ActionsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const AssignmentSummary = styled.div`
  flex: 1;
`;

const SummaryText = styled.p`
  font-size: 16px;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CurrentAssignment = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: normal;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
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
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

// Estados de loading
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

// Componente LoadingSpinner
const LoadingSpinner = styled.div<{ $small?: boolean }>`
  width: ${props => props.$small ? '16px' : '20px'};
  height: ${props => props.$small ? '16px' : '20px'};
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;