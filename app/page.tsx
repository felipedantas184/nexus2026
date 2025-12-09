'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled, { keyframes, css } from 'styled-components';
import {
  FaUserGraduate,
  FaRocket,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaBrain,
  FaGraduationCap,
  FaHeartbeat,
  FaMobileAlt,
  FaChevronDown,
  FaCheck,
  FaPlay,
  FaArrowRight
} from 'react-icons/fa';
import {
  FaLightbulb,
  FaHandshake,
  FaCalendarCheck,
  FaComments,
  FaBullseye,
  FaClipboardCheck,
  FaLock,
  FaChartBar
} from 'react-icons/fa6';
import { RxAvatar } from 'react-icons/rx';

// ========== COMPONENTE PRINCIPAL ==========
export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById('problem');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Container>
      {/* Hero Section */}
      <HeroSection>
        {/* Floating Icons - Positioned */}
        <FloatingIcon $delay="0s" style={{ top: '15%', left: '5%' }}>
          <FaBrain size={24} />
        </FloatingIcon>
        <FloatingIcon $delay="1s" style={{ top: '25%', right: '8%' }}>
          <FaGraduationCap size={24} />
        </FloatingIcon>
        <FloatingIcon $delay="2s" style={{ bottom: '20%', left: '12%' }}>
          <FaHeartbeat size={24} />
        </FloatingIcon>
        <FloatingIcon $delay="3s" style={{ bottom: '15%', right: '10%' }}>
          <FaComments size={24} />
        </FloatingIcon>

        <Navbar style={{
          background: isScrolled ? 'rgba(10, 26, 58, 0.98)' : 'rgba(10, 26, 58, 0.95)'
        }}>
          <NavLogo>
            <FaRocket size={28} />
            <span>Nexus</span>
          </NavLogo>

          {/* Menu desktop */}
          <NavLinks>
            <NavLink href="#problem">O Problema</NavLink>
            <NavLink href="#solution">Solução</NavLink>
            <NavLink href="#features">Recursos</NavLink>
            <NavLink href="#impact">Impacto</NavLink>
            <NavLink href="#cta">Começar</NavLink>
          </NavLinks>

          {/* Ações desktop */}
          <NavActions>
            <LoginButton href="/login">Entrar</LoginButton>
            <PrimaryButton href="/register">
              Teste Grátis <FaArrowRight size={14} />
            </PrimaryButton>
          </NavActions>

          {/* Botão mobile */}
          <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? "✕" : "☰"}
          </MobileMenuButton>
        </Navbar>

        <MobileMenu open={isMenuOpen}>
          <MobileNavLink href="#problem" onClick={() => setIsMenuOpen(false)}>O Problema</MobileNavLink>
          <MobileNavLink href="#solution" onClick={() => setIsMenuOpen(false)}>Solução</MobileNavLink>
          <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>Recursos</MobileNavLink>
          <MobileNavLink href="#impact" onClick={() => setIsMenuOpen(false)}>Impacto</MobileNavLink>
          <MobileNavLink href="#cta" onClick={() => setIsMenuOpen(false)}>Começar</MobileNavLink>

          <LoginButton href="/login" style={{ marginTop: "1rem" }}>Entrar</LoginButton>

          <PrimaryButton href="/register">
            Teste Grátis <FaArrowRight size={14} />
          </PrimaryButton>
        </MobileMenu>


        <HeroContent>
          <HeroBadge>
            <FaLightbulb size={16} />
            Transformando acompanhamento terapêutico-educacional
          </HeroBadge>

          <HeroTitle>
            Unifica a equipe
            <br />
            <span>Guia os alunos</span>
          </HeroTitle>

          <HeroSubtitle>
            Conectamos profissionais, personalizamos programas e engajamos estudantes
            em uma jornada de desenvolvimento integral e mensurável.
          </HeroSubtitle>

          <ButtonRow>
            <PrimaryButton href="/login" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              <FaRocket size={20} />
              Sou Profissional
            </PrimaryButton>

            <SecondaryButton href="/student-login" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              <RxAvatar size={20} />
              Sou Aluno
            </SecondaryButton>
          </ButtonRow>

          <HeroStats>
            <Stat>
              <StatNumber>+85%</StatNumber>
              <StatLabel>Engajamento dos Alunos</StatLabel>
            </Stat>
            <Stat>
              <StatNumber>40%</StatNumber>
              <StatLabel>Mais Eficiência</StatLabel>
            </Stat>
            <Stat>
              <StatNumber>100%</StatNumber>
              <StatLabel>LGPD Compliant</StatLabel>
            </Stat>
          </HeroStats>

          <ScrollIndicator onClick={scrollToNext} aria-label="Role para a próxima seção">
            <FaChevronDown size={20} />
          </ScrollIndicator>
        </HeroContent>
      </HeroSection>

      {/* Problem Section */}
      <Section id="problem" $bg="#f8fafc">
        <SectionHeader>
          <SectionSubtitle>O Desafio Atual</SectionSubtitle>
          <SectionTitle>
            A <span className="highlight">Fragmentação</span> que Prejudica o Progresso
          </SectionTitle>
          <CardText style={{ fontSize: '1.125rem', maxWidth: '42rem', margin: '0 auto' }}>
            Instituições enfrentam desafios complexos no acompanhamento integrado de estudantes
          </CardText>
        </SectionHeader>

        <CardGrid>
          <ProblemCard $accent="#ef4444">
            <FaUsers size={28} />
            <CardTitle>Sistemas Isolados</CardTitle>
            <CardText>
              Educação e saúde mental funcionando separadamente,
              sem visão integrada do estudante.
            </CardText>
          </ProblemCard>

          <ProblemCard $accent="#f59e0b">
            <FaChartLine size={28} />
            <CardTitle>Dados Desconexos</CardTitle>
            <CardText>
              Informações espalhadas em emails, WhatsApp e planilhas,
              dificultando a análise do progresso.
            </CardText>
          </ProblemCard>

          <ProblemCard $accent="#8b5cf6">
            <FaMobileAlt size={28} />
            <CardTitle>Baixo Engajamento</CardTitle>
            <CardText>
              Estudantes desmotivados com atividades tradicionais
              e falta de acompanhamento contínuo.
            </CardText>
          </ProblemCard>
        </CardGrid>
      </Section>

      {/* Solution Section */}
      <Section id="solution" $bg="#ffffff">
        <SectionHeader>
          <SectionSubtitle>Nossa Abordagem</SectionSubtitle>
          <SectionTitle>
            Conectando os <span className="highlight">3 Pilares</span> do Sucesso
          </SectionTitle>
        </SectionHeader>

        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon $color="#6366f1">
              <FaUsers size={24} />
            </FeatureIcon>
            <CardTitle>Ecossistema Colaborativo</CardTitle>
            <CardText>
              Conecte psicólogos, psiquiatras, monitores e coordenadores
              em uma plataforma única com visão 360° do estudante.
            </CardText>
            <BenefitList>
              <BenefitItem>
                <FaCheck size={14} />
                Observações compartilhadas em tempo real
              </BenefitItem>
              <BenefitItem>
                <FaCheck size={14} />
                Comunicação segura e organizada
              </BenefitItem>
              <BenefitItem>
                <FaCheck size={14} />
                Perfil unificado do estudante
              </BenefitItem>
            </BenefitList>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon $color="#10b981">
              <FaBullseye size={24} />
            </FeatureIcon>
            <CardTitle>Programas Personalizados</CardTitle>
            <CardText>
              Crie jornadas terapêutico-educacionais adaptadas para
              ansiedade, TDAH, depressão e outras necessidades específicas.
            </CardText>
            <BenefitList>
              <BenefitItem>
                <FaCheck size={14} />
                6 tipos de atividades interativas
              </BenefitItem>
              <BenefitItem>
                <FaCheck size={14} />
                Progressão baseada em resultados
              </BenefitItem>
              <BenefitItem>
                <FaCheck size={14} />
                Adaptação automática por desempenho
              </BenefitItem>
            </BenefitList>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon $color="#8b5cf6">
              <FaClipboardCheck size={24} />
            </FeatureIcon>
            <CardTitle>Engajamento Gamificado</CardTitle>
            <CardText>
              Transforme o acompanhamento em uma experiência motivadora
              com mecânicas de jogos e recompensas significativas.
            </CardText>
            <BenefitList>
              <BenefitItem>
                <FaCheck size={14} />
                Sistema de conquistas e badges
              </BenefitItem>
              <BenefitItem>
                <FaCheck size={14} />
                Progresso visual e motivacional
              </BenefitItem>
              <BenefitItem>
                <FaCheck size={14} />
                Leaderboards saudáveis por turma
              </BenefitItem>
            </BenefitList>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      {/* Features Section */}
      <Section id="features" $bg="#f1f5f9">
        <SectionHeader>
          <SectionSubtitle>Recursos Avançados</SectionSubtitle>
          <SectionTitle>
            Tudo que sua equipe
            <br />
            <span className="highlight">precisa em um só lugar</span>
          </SectionTitle>
        </SectionHeader>

        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon $color="#6366f1">
              <FaChartBar size={24} />
            </FeatureIcon>
            <CardTitle>Analytics em Tempo Real</CardTitle>
            <CardText>
              Dashboards com métricas de engajamento, progresso
              e resultados mensuráveis para tomada de decisão.
            </CardText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon $color="#f59e0b">
              <FaCalendarCheck size={24} />
            </FeatureIcon>
            <CardTitle>Cronogramas Inteligentes</CardTitle>
            <CardText>
              Crie e replique atividades automaticamente
              com ajustes em tempo real baseados no desempenho.
            </CardText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon $color="#ef4444">
              <FaShieldAlt size={24} />
            </FeatureIcon>
            <CardTitle>Segurança Máxima</CardTitle>
            <CardText>
              Conformidade total com LGPD, criptografia de ponta a ponta
              e auditoria completa de acesso.
            </CardText>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      {/* CTA Section */}
      <CTASection id="cta">
        <CTAWrapper>
          <SectionSubtitle $color="#a5b4fc">Comece Agora</SectionSubtitle>
          <SectionTitle $color="#ffffff">
            Transforme o acompanhamento
            <br />
            <span style={{ color: '#a5b4fc' }}>na sua instituição</span>
          </SectionTitle>

          <CardText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.125rem' }}>
            Junte-se a mais de 200 instituições que já usam a Nexus
          </CardText>

          <ButtonRow>
            <PrimaryButton href="/register" style={{ padding: '1rem 2rem' }}>
              <FaRocket size={18} />
              Começar como Profissional
            </PrimaryButton>

            <SecondaryButton href="/demo">
              <RxAvatar size={18} />
              Sou Aluno
            </SecondaryButton>
          </ButtonRow>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.875rem'
          }}>
            <FaShieldAlt size={20} color="#a5b4fc" />
            <span>Garantia de satisfação ou seu dinheiro de volta em 30 dias</span>
          </div>
        </CTAWrapper>
      </CTASection>

      {/* Footer */}
      <Footer>
        <FooterContent>
          <div>
            <NavLogo style={{ marginBottom: '1rem' }}>
              <FaRocket size={28} />
              <span>Nexus</span>
            </NavLogo>
            <CardText style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Conectando terapia, educação e resultados em uma plataforma integrada.
            </CardText>
          </div>

          <FooterLinks>
            <div>
              <FooterTitle>Produto</FooterTitle>
              <FooterLink href="#features">Recursos</FooterLink>
              <FooterLink href="#solution">Solução</FooterLink>
              <FooterLink href="#pricing">Planos</FooterLink>
            </div>

            <div>
              <FooterTitle>Empresa</FooterTitle>
              <FooterLink href="/about">Sobre</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/contact">Contato</FooterLink>
            </div>

            <div>
              <FooterTitle>Legal</FooterTitle>
              <FooterLink href="/privacy">Privacidade</FooterLink>
              <FooterLink href="/terms">Termos</FooterLink>
              <FooterLink href="/lgpd">LGPD</FooterLink>
            </div>
          </FooterLinks>
        </FooterContent>

        <div style={{
          maxWidth: '1200px',
          margin: '3rem auto 0',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Nexus. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>
              LinkedIn
            </Link>
            <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>
              Instagram
            </Link>
          </div>
        </div>
      </Footer>
    </Container>
  );
}

// ========== ANIMAÇÕES OTIMIZADAS ==========
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const pulseSubtle = keyframes`
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.02); 
    opacity: 0.95; 
  }
`;

const slideIn = keyframes`
  from { 
    transform: translateX(-20px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
`;

// ========== STYLED COMPONENTS REFATORADOS ==========
const Container = styled.div`
  overflow-x: hidden;
  scroll-behavior: smooth;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  background: linear-gradient(
    135deg,
    #0A1A3A 0%,
    #1A2B5F 30%,
    #2D3B8B 70%,
    #4A47A3 100%
  );
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 10% 20%, rgba(74, 107, 255, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
    z-index: 0;
  }
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 26, 58, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  animation: ${slideIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
  padding: 0.75rem 1rem;
  justify-content: space-between;
  gap: 1rem;
}
`;

const NavLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  
  svg {
    color: #6366f1;
  }
  
  .gradient {
    background: linear-gradient(135deg, #a5b4fc, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
  font-size: 1.25rem;

  svg {
    width: 22px;
    height: 22px;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  padding: 0.5rem 0;
  position: relative;
  
  &:hover {
    color: #ffffff;
    
    &::after {
      width: 100%;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #6366f1, #a5b4fc);
    transition: width 0.3s ease;
  }
`;

const NavActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 1024px) {
  display: none;
}
`;

const LoginButton = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const PrimaryButton = styled(Link)`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  animation: ${pulseSubtle} 2s ease-in-out infinite;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.6);
  }
  
  &:focus {
    outline: 2px solid rgba(99, 102, 241, 0.5);
    outline-offset: 2px;
  }
`;

// Botão hambúrguer
const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.9rem;
  cursor: pointer;

  @media (max-width: 1024px) {
    display: block;
  }
`;

// Container do menu mobile
const MobileMenu = styled.div<{ open: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ open }) => (open ? "0" : "-100%")};
  width: 75%;
  height: 100vh;
  background: rgba(10, 26, 58, 0.98);
  backdrop-filter: blur(12px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  transition: right 0.35s ease;
  z-index: 999;

  @media (min-width: 1025px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 500;
  text-decoration: none;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 900px;
  width: 100%;
  padding: 2rem 2rem;
  margin: auto;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;

  @media (max-width: 768px) {
    padding: 2rem 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.5rem;
  }
`;


const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.6rem 1.25rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  color: #ffffff;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
    gap: 0.4rem;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;


const HeroTitle = styled.h1`
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.12;
  margin: 0 0 1.25rem 0;
  color: #ffffff;
  letter-spacing: -0.015em;

  span {
    background: linear-gradient(135deg, #a5b4fc, #818cf8, #c7d2fe);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 480px) {
    font-size: 1.85rem;
    line-height: 1.18;
  }
`;


const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.35rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.92);
  max-width: 38rem;
  margin: 0 auto 2.5rem;
  font-weight: 400;

  @media (max-width: 480px) {
    font-size: 0.95rem;
    max-width: 90%;
  }
`;


const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin: 2.5rem auto;
  flex-wrap: wrap;
  max-width: 600px;

  @media (max-width: 640px) {
    gap: 1.75rem;
  }

  @media (max-width: 480px) {
    gap: 1.25rem;
  }
`;

const Stat = styled.div`
  text-align: center;
  min-width: 120px;

  @media (max-width: 640px) {
    flex: 1 0 calc(50% - 1rem);
  }
`;

const StatNumber = styled.div`
  font-size: clamp(1.8rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #a5b4fc;
  line-height: 1;
  margin-bottom: 0.4rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const ScrollIndicator = styled.button`
  width: 2.6rem;
  height: 4rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem auto 0;
  cursor: pointer;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  animation: ${float} 2s ease-in-out infinite;

  &:hover {
    border-color: rgba(255, 255, 255, 0.55);
    color: white;
  }

  @media (max-width: 480px) {
    width: 2.2rem;
    height: 3.5rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 2.5rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    padding: 0 1rem;

    a {
      width: 100%;
      justify-content: center;
      text-align: center;
    }
  }
`;

const FloatingIcon = styled.div<{ $delay: string }>`
  position: absolute;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: ${float} 8s ease-in-out infinite;
  animation-delay: ${props => props.$delay};
  z-index: 0;
  pointer-events: none;
  
  @media (max-width: 768px) {
    width: 3rem;
    height: 3rem;
    display: none; /* Oculta em mobile para melhor performance */
  }
`;

const Section = styled.section<{ $bg?: string }>`
  padding: clamp(4rem, 8vw, 8rem) clamp(1rem, 4vw, 2.5rem);
  background: ${props => props.$bg || 'white'};
  position: relative;
`;

const SectionHeader = styled.div<{ $align?: string }>`
  text-align: ${props => props.$align || 'center'};
  max-width: 48rem;
  margin: 0 auto clamp(3rem, 6vw, 5rem);
`;

const SectionSubtitle = styled.div<{ $color?: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$color || '#6366f1'};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${props => props.$color ? `${props.$color}15` : '#e0e7ff'};
  border-radius: 50px;
`;

const SectionTitle = styled.h2<{ $color?: string }>`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: ${props => props.$color || '#1e293b'};
  line-height: 1.2;
  margin: 0;
  
  .highlight {
    color: #6366f1;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0.25rem;
      left: 0;
      width: 100%;
      height: 0.5rem;
      background: rgba(99, 102, 241, 0.2);
      z-index: -1;
    }
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProblemCard = styled.div<{ $accent: string }>`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid ${props => props.$accent};
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    color: ${props => props.$accent};
    margin-bottom: 1.5rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
`;

const CardText = styled.p`
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.12);
  }
`;

const FeatureIcon = styled.div<{ $color: string }>`
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    width: 1.75rem;
    height: 1.75rem;
  }
`;

const BenefitList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #475569;
  font-size: 0.95rem;
  
  svg {
    color: #10b981;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
`;

const CTASection = styled(Section)`
  background: linear-gradient(135deg, #0f172a, #1e293b);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    z-index: 0;
  }
`;

const CTAWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 48rem;
  margin: 0 auto;
`;

const CTAButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2.5rem 0;
  flex-wrap: wrap;
`;

const SecondaryButton = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  padding: 0.875rem 2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const Footer = styled.footer`
  background: #0f172a;
  color: white;
  padding: 4rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem 1.5rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FooterLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Componentes auxiliares (estilizados inline no código acima)
const FooterTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: block;
  transition: color 0.2s ease;
  
  &:hover {
    color: white;
  }
`;