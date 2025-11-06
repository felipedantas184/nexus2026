// app/professional/students/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import styled from 'styled-components';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

// Serviços
import { studentsService } from '@/lib/firebase/services/studentsService';
import { observationsService } from '@/lib/firebase/services/observationsService';
import { programsService } from '@/lib/firebase/services/programsService';

// Tipos
import { Student, Professional } from '@/types';
import { Observation } from '@/types/observation.types';
import { Program } from '@/types';

// Componentes que vamos criar
import StudentHeader from '@/components/Student/StudentHeader';
import StudentObservations from '@/components/Student/StudentObservations';
import StudentOverview from '@/components/Student/StudentOverview';
import StudentPrograms from '@/components/Student/StudentPrograms';
import { assignmentService } from '@/lib/firebase/services/assignmentsService';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'observations'>('overview');

  const studentId = params.id as string;

  useEffect(() => {
    if (user?.id && studentId) {
      loadStudentData();
    }
  }, [user?.id, studentId]);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Verificar se o profissional tem acesso ao aluno
      const professionalStudents = await studentsService.getProfessionalStudents(user!.id);
      const hasAccess = professionalStudents.some(s => s.id === studentId);

      if (!hasAccess) {
        setError('Você não tem permissão para acessar este aluno.');
        setIsLoading(false);
        return;
      }

      // Carregar dados em paralelo
      const [studentData, observationsData, programsData] = await Promise.all([
        studentsService.getStudentById(studentId),
        observationsService.getStudentObservations(studentId),
        loadStudentPrograms(studentId)
      ]);

      if (!studentData) {
        setError('Aluno não encontrado.');
        return;
      }

      setStudent(studentData);
      setObservations(observationsData);
      setPrograms(programsData);

    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      setError('Erro ao carregar dados do aluno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentPrograms = async (studentId: string): Promise<Program[]> => {
    try {
      console.log(`Buscando assignments para o aluno: ${studentId}`);

      const assignments = await assignmentService.getStudentAssignments(studentId);

      if (assignments.length === 0) {
        console.log(`Nenhum assignment encontrado para o aluno ${studentId}.`);
        return [];
      }

      const programIds = assignments.map(a => a.programId);

      const programPromises = programIds.map(id => programsService.getProgramById(id));
      const programs = await Promise.all(programPromises);
      const validPrograms = programs.filter((program): program is Program => program !== null);

      console.log(`Total de programas carregados: ${validPrograms.length}`);
      return validPrograms;
    } catch (error) {
      console.error(`❌ Erro ao carregar programas do aluno ${studentId}:`, error);
      return [];
    }
  };

  const handleObservationCreated = async () => {
    // Recarregar observações após criar uma nova
    try {
      const updatedObservations = await observationsService.getStudentObservations(studentId);
      setObservations(updatedObservations);
    } catch (error) {
      console.error('Erro ao recarregar observações:', error);
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando perfil do aluno...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !student) {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <FaExclamationTriangle size={48} />
        </ErrorIcon>
        <ErrorTitle>
          {error || 'Aluno não encontrado'}
        </ErrorTitle>
        <ErrorDescription>
          {error || 'O aluno que você está tentando acessar não existe.'}
        </ErrorDescription>
        <BackButton href="/professional/students">
          <FaArrowLeft size={16} />
          Voltar para Alunos
        </BackButton>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      {/* Header com navegação */}
      <PageHeader>
        <BackButton href="/professional/students">
          <FaArrowLeft size={16} />
          Voltar para Alunos
        </BackButton>
      </PageHeader>

      {/* Header do Aluno */}
      <StudentHeader student={student} programsCount={programs.length} observationsCount={observations.length} />

      {/* Navegação por Abas */}
      <TabNavigation>
        <Tab
          $active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Visão Geral
        </Tab>
        <Tab
          $active={activeTab === 'programs'}
          onClick={() => setActiveTab('programs')}
        >
          Programas ({programs.length})
        </Tab>
        <Tab
          $active={activeTab === 'observations'}
          onClick={() => setActiveTab('observations')}
        >
          Observações ({observations.length})
        </Tab>
      </TabNavigation>

      {/* Conteúdo das Abas */}
      <Content>
        {activeTab === 'overview' && (
          <StudentOverview
            student={student}
            observations={observations}
            programs={programs}
            onObservationCreated={handleObservationCreated}
          />
        )}

        {activeTab === 'programs' && (
          <StudentPrograms
            student={student}
            programs={programs}
          />
        )}

        {activeTab === 'observations' && (
          <StudentObservations
            student={student}
            observations={observations}
            onObservationCreated={handleObservationCreated}
          />
        )}
      </Content>
    </Container>
  );
}

// ========== ESTILOS ==========
const Container = styled.div`
  background: #f8fafc;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
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

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const TabNavigation = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  display: flex;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 16px 24px;
  font-weight: 500;
  color: ${props => props.$active ? '#6366f1' : '#64748b'};
  border-bottom: 2px solid ${props => props.$active ? '#6366f1' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #6366f1;
    background: #f8fafc;
  }
`;

const Content = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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
  text-align: center;
  background: #f8fafc;
  min-height: 100vh;
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

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
`;

const ErrorDescription = styled.p`
  color: #64748b;
  margin-bottom: 24px;
`;