// app/professional/students/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaSearch, 
  FaUser, 
  FaSchool, 
  FaChartLine,
  FaFire,
  FaFilter
} from 'react-icons/fa';
import { studentsService } from '@/lib/firebase/services/studentsService';
import { Student } from '@/types';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState<'all' | 'fracta' | 'particular'>('all');

  useEffect(() => {
    if (user?.id) {
      loadStudents();
    }
  }, [user?.id]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const studentsData = await studentsService.getProfessionalStudents(user!.id);
      setStudents(studentsData);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.personalInfo.school.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterOrigin === 'all' || student.personalInfo.origin === filterOrigin;
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando alunos...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Meus Alunos</Title>
          <Subtitle>Gerencie os alunos atribuídos a você</Subtitle>
        </TitleSection>
        
        <ActionButton href="/professional/students/register">
          <FaPlus size={16} />
          Cadastrar Aluno
        </ActionButton>
      </Header>

      <FiltersSection>
        <SearchBox>
          <FaSearch size={16} color="#64748b" />
          <SearchInput
            placeholder="Buscar alunos por nome, email ou escola..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterGroup>
          <FaFilter size={14} color="#64748b" />
          <FilterSelect 
            value={filterOrigin} 
            onChange={(e) => setFilterOrigin(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="fracta">Fracta</option>
            <option value="particular">Particular</option>
          </FilterSelect>
        </FilterGroup>
      </FiltersSection>

      <StudentsGrid>
        {filteredStudents.map((student) => (
          <StudentCard key={student.id} href={`/professional/students/${student.id}`}>
            <StudentHeader>
              <StudentAvatar>
                <FaUser size={20} />
              </StudentAvatar>
              <StudentInfo>
                <StudentName>{student.name}</StudentName>
                <StudentEmail>{student.email}</StudentEmail>
              </StudentInfo>
            </StudentHeader>

            {/**
            <StudentDetails>
              <DetailItem>
                <FaSchool size={12} />
                {student.personalInfo.school} • {student.personalInfo.grade}
              </DetailItem>
              <DetailItem>
                <FaUser size={12} />
                {student.personalInfo.parentName}
              </DetailItem>
            </StudentDetails>

            <StudentStats>
              <Stat>
                <FaChartLine size={12} />
                Nível {student.level}
              </Stat>
              <Stat>
                <FaFire size={12} />
                {student.streak} dias
              </Stat>
              <Stat>
                {student.totalPoints} pts
              </Stat>
            </StudentStats>

            <StudentStatus $active={student.isActive}>
              {student.isActive ? 'Ativo' : 'Inativo'}
            </StudentStatus>
             */}
          </StudentCard>
        ))}
      </StudentsGrid>

      {filteredStudents.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <FaUser size={48} />
          </EmptyIcon>
          <EmptyTitle>
            {searchTerm || filterOrigin !== 'all' ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
          </EmptyTitle>
          <EmptyDescription>
            {searchTerm || filterOrigin !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece cadastrando seu primeiro aluno'
            }
          </EmptyDescription>
          <ActionButton href="/professional/students/register">
            <FaPlus size={16} />
            Cadastrar Primeiro Aluno
          </ActionButton>
        </EmptyState>
      )}
    </Container>
  );
}

// Estilos para a página de listagem
const Container = styled.div`
  padding: 32px;
  background: #f8fafc;
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
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
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const FiltersSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  flex: 1;
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

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
`;

const FilterSelect = styled.select`
  border: none;
  outline: none;
  background: none;
  font-size: 14px;
  color: #374151;
`;

const StudentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const StudentCard = styled(Link)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StudentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

const StudentAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const StudentEmail = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const StudentOrigin = styled.div<{ $origin: 'fracta' | 'particular' }>`
  background: ${props => props.$origin === 'fracta' ? '#dcfce7' : '#e0f2fe'};
  color: ${props => props.$origin === 'fracta' ? '#166534' : '#0369a1'};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const StudentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
`;

const StudentStats = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const StudentStatus = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${props => props.$active ? '#dcfce7' : '#fef2f2'};
  color: ${props => props.$active ? '#166534' : '#dc2626'};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  background: white;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 20px 0;
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