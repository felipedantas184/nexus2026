// app\professional\dashboard\page.tsx
'use client';

import styled from 'styled-components';
import { FaUsers, FaBook, FaChartLine, FaClock, FaUserCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function ProfessionalDashboard() {
  // Dados mockados - serão substituídos por dados reais
  const stats = {
    totalStudents: 24,
    activePrograms: 12,
    pendingObservations: 8,
    averageProgress: 76,
    recentActivity: [
      { student: 'João Silva', action: 'Completou atividade', time: '2h atrás', program: 'Matemática Básica' },
      { student: 'Maria Santos', action: 'Iniciou novo programa', time: '5h atrás', program: 'História do Brasil' },
      { student: 'Pedro Oliveira', action: 'Precisa de atenção', time: '1 dia atrás', program: 'Ciências' },
    ]
  };

  return (
    <Container>
      <Header>
        <Title>Dashboard Profissional</Title>
        <Subtitle>Visão geral dos seus alunos e programas</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <FaUsers size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.totalStudents}</StatNumber>
            <StatLabel>Total de Alunos</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FaBook size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.activePrograms}</StatNumber>
            <StatLabel>Programas Ativos</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FaChartLine size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.averageProgress}%</StatNumber>
            <StatLabel>Progresso Médio</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FaClock size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.pendingObservations}</StatNumber>
            <StatLabel>Observações Pendentes</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <RecentActivity>
          <SectionTitle>Atividade Recente</SectionTitle>
          <ActivityList>
            {stats.recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon>
                  {activity.action.includes('Precisa') ? <FaExclamationTriangle color="#ef4444" /> : <FaUserCheck color="#10b981" />}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityText>
                    <strong>{activity.student}</strong> {activity.action}
                  </ActivityText>
                  <ActivityMeta>
                    <Program>{activity.program}</Program>
                    <Time>{activity.time}</Time>
                  </ActivityMeta>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        </RecentActivity>

        <QuickActionsSection>
          <SectionTitle>Ações Rápidas</SectionTitle>
          <ActionButtons>
            <ActionButton href="/professional/students/register">
              <FaUsers size={18} />
              Cadastrar Aluno
            </ActionButton>
            <ActionButton href="/professional/programs/create">
              <FaBook size={18} />
              Criar Programa
            </ActionButton>
            <ActionButton href="/professional/observations">
              <FaChartLine size={18} />
              Registrar Observação
            </ActionButton>
          </ActionButtons>
        </QuickActionsSection>
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
  margin-bottom: 32px;
`;

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const RecentActivity = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const ActivityIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.p`
  color: #374151;
  margin: 0 0 4px 0;
  line-height: 1.4;
`;

const ActivityMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Program = styled.span`
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 4px;
`;

const Time = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const QuickActionsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButton = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #6366f1;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }
`;