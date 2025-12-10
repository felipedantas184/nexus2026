'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import ProfessionalNavbar from '@/components/layout/ProfessionalNavbar';
import ProfessionalSidebar from '@/components/layout/ProfessionalSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Professional } from '@/types';

interface ProfessionalLayoutProps {
  children: ReactNode;
}

export default function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const { user, loading, isProfessional } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Converter user para Professional com type assertion segura
  const professionalUser = user as Professional;

  // Usar useEffect para redirecionamentos
  useEffect(() => {
    if (!loading && (!user || !isProfessional)) {
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [user, isProfessional, loading, router]);

  if (loading || isRedirecting) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Carregando...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!user || !isProfessional) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Redirecionando...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <ProfessionalNavbar toggle={toggleSidebar} user={professionalUser} />
      <Content>
        <ProfessionalSidebar
          open={sidebarOpen}
          user={professionalUser}
          onNavigate={() => setSidebarOpen(false)}
        />
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
  border-radius: 24px 0 0 0;
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