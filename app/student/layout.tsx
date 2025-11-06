'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import StudentNavbar from '@/components/layout/StudentNavbar';
import StudentSidebar from '@/components/layout/StudentSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Student } from '@/types';

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { student, loading, isStudent } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Usar useEffect para redirecionamentos
  useEffect(() => {
    if (!loading && (!student || !isStudent)) {
      setIsRedirecting(true);
      router.push('/student-login');
    }
  }, [student, isStudent, loading, router]);

  if (loading || isRedirecting) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!student || !isStudent) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Redirecionando...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <StudentNavbar toggle={toggleSidebar} student={student} />
      <Content>
        <StudentSidebar open={sidebarOpen} student={student} />
        <MainContent open={sidebarOpen}>
          {children}
        </MainContent>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.main<{ open: boolean }>`
  flex: 1;
  background: white;
  border-radius: 0 0 0 0;
  margin: 0;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.06);
  transition: margin-left 0.3s ease;

  ${props => !props.open && `
    margin-left: -280px;
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
`;

const LoadingText = styled.p`
  color: #64748b;
  font-size: 16px;
`;