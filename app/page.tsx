'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { FaUser, FaUserGraduate, FaRocket, FaChartLine, FaUsers } from 'react-icons/fa';
import { FaUserPlus } from 'react-icons/fa6';

export default function HomePage() {
  return (
    <Container>
      <HeroSection>
        <HeroContent>
          <Logo>
            <FaRocket size={48} />
            <span>Nexus</span>
          </Logo>
          <HeroTitle>
            Plataforma de
            <GradientText> Acompanhamento Educacional</GradientText>
          </HeroTitle>
          <HeroSubtitle>
            Conectando profissionais e alunos em uma experiência gamificada
            de aprendizado e desenvolvimento.
          </HeroSubtitle>

          <AccessButtons>
            <ProfessionalButton href="/login">
              <FaUser size={18} />
              Acesso Profissional
            </ProfessionalButton>
            <StudentButton href="/student-login">
              <FaUserGraduate size={18} />
              Área do Aluno
            </StudentButton>
            <RegisterButton href="/register">
              <FaUserPlus size={18} />
              Cadastro Profissional
            </RegisterButton>
          </AccessButtons>
        </HeroContent>

        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>
              <FaChartLine size={24} />
            </FeatureIcon>
            <FeatureTitle>Acompanhamento</FeatureTitle>
            <FeatureDescription>
              Monitoramento detalhado do progresso com métricas visuais
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FaRocket size={24} />
            </FeatureIcon>
            <FeatureTitle>Gamificação</FeatureTitle>
            <FeatureDescription>
              Sistema de conquistas e recompensas para maior engajamento
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FaUsers size={24} />
            </FeatureIcon>
            <FeatureTitle>Colaboração</FeatureTitle>
            <FeatureDescription>
              Trabalho em equipe entre profissionais e alunos
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </HeroSection>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0A3D62 0%, #8360C3 100%);
  color: white;
`;

const HeroSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 80px;
`;

const HeroContent = styled.div`
  max-width: 800px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 40px;
  
  span {
    background: linear-gradient(135deg, #fff, #e0e7ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 24px 0;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #a5b4fc, #c7d2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 48px 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const AccessButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ProfessionalButton = styled(Link)`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
  }
`;

const StudentButton = styled(Link)`
  background: white;
  border: 2px solid white;
  color: #6366f1;
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  width: 100%;
  max-width: 900px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
`;
const RegisterButton = styled(Link)`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
  }
`;