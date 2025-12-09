'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { 
  FaUserGraduate, 
  FaEnvelope, 
  FaLock, 
  FaArrowLeft,
  FaGamepad,
  FaTrophy,
  FaChartLine,
  FaHeart,
  FaStar,
  FaLightbulb,
  FaShieldAlt,
  FaQuestionCircle,
  FaChevronRight,
  FaHandsHelping
} from 'react-icons/fa';
import { 
  FaGraduationCap,
  FaBrain,
} from 'react-icons/fa6';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Animações
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const bounceIn = keyframes`
  0% { 
    opacity: 0; 
    transform: scale(0.3); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.05); 
  }
  70% { 
    transform: scale(0.9); 
  }
  100% { 
    transform: scale(1); 
  }
`;

const slideInFromRight = keyframes`
  from { 
    transform: translateX(30px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
`;

export default function StudentLogin() {
  const router = useRouter();
  const { studentLogin, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await studentLogin(credentials.email, credentials.password);
    } catch (error: any) {
      // Mensagens de erro mais amigáveis
      const errorCode = error.code || '';
      let message = error.message;
      
      if (errorCode === 'auth/user-not-found') {
        message = 'Aluno não encontrado. Verifique seu e-mail.';
      } else if (errorCode === 'auth/wrong-password') {
        message = 'Senha incorreta. Tente novamente.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'E-mail inválido. Use o formato: seu.email@escola.com';
      } else if (errorCode === 'auth/too-many-requests') {
        message = 'Muitas tentativas. Aguarde alguns minutos.';
      }
      
      setError(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container>
      {/* Background animado */}
      <Background>
        <FloatingElement $top="15%" $left="10%" $delay="0s">
          <FaGamepad size={24} color="rgba(139, 92, 246, 0.15)" />
        </FloatingElement>
        <FloatingElement $top="25%" $right="12%" $delay="1s">
          <FaTrophy size={24} color="rgba(245, 158, 11, 0.15)" />
        </FloatingElement>
        <FloatingElement $bottom="20%" $left="15%" $delay="2s">
          <FaStar size={24} color="rgba(236, 72, 153, 0.15)" />
        </FloatingElement>
        <FloatingElement $bottom="30%" $right="8%" $delay="3s">
          <FaChartLine size={24} color="rgba(16, 185, 129, 0.15)" />
        </FloatingElement>
      </Background>

      <LoginWrapper>
        {/* Seção de branding - Lado esquerdo */}
        <StudentBrandSection>
          <BrandContent>
            <BrandLogo>
              <FaUserGraduate size={48} color="#8b5cf6" />
              <BrandName>
                Área do <span>Aluno</span>
              </BrandName>
            </BrandLogo>
            
            <BrandTitle>
              Sua <Highlight>Jornada</Highlight> de Aprendizado e Crescimento
            </BrandTitle>
            
            <BrandDescription>
              Acesse suas atividades gamificadas, acompanhe seu progresso 
              e colabore com sua equipe de apoio em uma experiência única e motivadora.
            </BrandDescription>

            <FeaturesGrid>
              <Feature>
                <FeatureIcon $color="#ccd6f9">
                  <FaGamepad size={20} />
                </FeatureIcon>
                <div>
                  <FeatureTitle>Atividades Gamificadas</FeatureTitle>
                  <FeatureText>Aprenda de forma divertida e envolvente</FeatureText>
                </div>
              </Feature>
              
              <Feature>
                <FeatureIcon $color="#f59e0b">
                  <FaTrophy size={20} />
                </FeatureIcon>
                <div>
                  <FeatureTitle>Conquistas e Badges</FeatureTitle>
                  <FeatureText>Colecione recompensas pelo seu progresso</FeatureText>
                </div>
              </Feature>
              
              <Feature>
                <FeatureIcon $color="#10b981">
                  <FaChartLine size={20} />
                </FeatureIcon>
                <div>
                  <FeatureTitle>Progresso Visual</FeatureTitle>
                  <FeatureText>Veja sua evolução em gráficos interativos</FeatureText>
                </div>
              </Feature>
              
              <Feature>
                <FeatureIcon $color="#ec4899">
                  <FaHeart size={20} />
                </FeatureIcon>
                <div>
                  <FeatureTitle>Apoio Personalizado</FeatureTitle>
                  <FeatureText>Sua equipe de profissionais te acompanha</FeatureText>
                </div>
              </Feature>
            </FeaturesGrid>

            <StudentTestimonial>
              <TestimonialContent>
                "A plataforma tornou meu acompanhamento muito mais leve e motivador!"
              </TestimonialContent>
              <TestimonialAuthor>— Aluno do 9º ano</TestimonialAuthor>
            </StudentTestimonial>
          </BrandContent>
        </StudentBrandSection>

        {/* Card de login - Lado direito */}
        <LoginCard>
          <CardHeader>
            <CardLogo>
              <FaGraduationCap size={32} color="#8b5cf6" />
            </CardLogo>
            <CardTitle>Bem-vindo de volta!</CardTitle>
            <CardSubtitle>Entre na sua jornada personalizada</CardSubtitle>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage>
                <FaQuestionCircle size={18} />
                <ErrorMessageContent>
                  <strong>Ops, algo deu errado!</strong>
                  <span>{error}</span>
                </ErrorMessageContent>
              </ErrorMessage>
            )}

            <InputGroup $hasError={!!error}>
              <Label htmlFor="email">
                <FaEnvelope size={16} />
                <div>
                  <LabelTitle>Seu e-mail</LabelTitle>
                  <LabelHint>Fornecido pela sua escola/professor</LabelHint>
                </div>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="exemplo@aluno.escola.com"
                required
                disabled={loading}
                autoComplete="email"
                $hasError={!!error}
              />
            </InputGroup>

            <InputGroup $hasError={!!error}>
              <Label htmlFor="password">
                <FaLock size={16} />
                <div>
                  <LabelTitle>Sua senha</LabelTitle>
                  <LabelHint>Fornecida no seu cadastro</LabelHint>
                </div>
              </Label>
              <PasswordInput>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  $hasError={!!error}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={loading}
                >
                  {showPassword ? <FaEye size={18} /> : <FaEye size={18} />}
                </PasswordToggle>
              </PasswordInput>
              <PasswordHint>
                Precisa de ajuda com a senha? Fale com seu professor ou responsável.
              </PasswordHint>
            </InputGroup>

            <LoginButton 
              type="submit" 
              disabled={loading} 
              $loading={loading}
              $animate={!loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner $small />
                  <span>Entrando na sua jornada...</span>
                </>
              ) : (
                <>
                  <FaGamepad size={20} />
                  <span>Começar Minha Jornada</span>
                  <FaChevronRight size={16} />
                </>
              )}
            </LoginButton>

            <Divider>
              <span>Acesso rápido</span>
            </Divider>

            <AlternativeActions>
              <TeacherAccessLink href="/login">
                <FaArrowLeft size={16} />
                <div>
                  <strong>Sou Professor/Profissional</strong>
                  <span>Acesso à plataforma educacional</span>
                </div>
              </TeacherAccessLink>

              <ParentAccessLink href="/student-register">
                <FaHandsHelping size={16} />
                <div>
                  <strong>Primeiro Acesso?</strong>
                  <span>Criar conta de aluno</span>
                </div>
                <FaChevronRight size={12} />
              </ParentAccessLink>
            </AlternativeActions>

            <HelpCard>
              <HelpIcon>
                <FaLightbulb size={20} color="#f59e0b" />
              </HelpIcon>
              <HelpContent>
                <HelpTitle>Primeiro acesso ou problemas?</HelpTitle>
                <HelpText>
                  Use as credenciais fornecidas pela sua escola. 
                  Em caso de dúvidas, entre em contato com seu professor ou responsável.
                </HelpText>
              </HelpContent>
            </HelpCard>
          </Form>

          <CardFooter>
            <SecurityBadge>
              <FaShieldAlt size={16} />
              <span>Ambiente seguro e protegido</span>
            </SecurityBadge>
            
            <SupportInfo>
              <SupportTitle>Suporte ao Aluno</SupportTitle>
              <SupportEmail href="mailto:aluno@nexus.com">
                aluno@nexus.com
              </SupportEmail>
            </SupportInfo>
          </CardFooter>
        </LoginCard>
      </LoginWrapper>
    </Container>
  );
}

// ========== STYLED COMPONENTS ==========
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #C4B5FD 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
`;

const FloatingElement = styled.div<{ $top?: string; $bottom?: string; $left?: string; $right?: string; $delay: string }>`
  position: absolute;
  ${props => props.$top && `top: ${props.$top};`}
  ${props => props.$bottom && `bottom: ${props.$bottom};`}
  ${props => props.$left && `left: ${props.$left};`}
  ${props => props.$right && `right: ${props.$right};`}
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.$delay};
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const LoginWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
`;

const StudentBrandSection = styled.div`
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.1));
  padding: 60px 48px;
  display: flex;
  align-items: center;
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
      radial-gradient(circle at 20% 30%, rgba(196, 181, 253, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const BrandContent = styled.div`
  width: 100%;
  position: relative;
  z-index: 1;
  animation: ${slideInFromRight} 0.8s ease-out 0.2s both;
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
`;

const BrandName = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: white;
  
  span {
    background: linear-gradient(135deg, #c4b5fd, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const BrandTitle = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin: 0 0 24px 0;
  
  @media (max-width: 1200px) {
    font-size: 30px;
  }
`;

const Highlight = styled.span`
  color: #fbbf24;
`;

const BrandDescription = styled.p`
  color: rgba(255, 255, 255, 0.95);
  font-size: 17px;
  line-height: 1.6;
  margin: 0 0 40px 0;
  font-weight: 400;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin: 0 0 40px 0;
`;

const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(8px);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const FeatureIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => `${props.$color}25`};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FeatureTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
`;

const FeatureText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

const StudentTestimonial = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  border-left: 4px solid #fbbf24;
  backdrop-filter: blur(10px);
`;

const TestimonialContent = styled.p`
  color: white;
  font-size: 16px;
  line-height: 1.6;
  font-style: italic;
  margin: 0 0 12px 0;
`;

const TestimonialAuthor = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
`;

const LoginCard = styled.div`
  background: white;
  padding: 60px 48px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 40px 24px;
  }
  
  @media (max-width: 480px) {
    padding: 32px 20px;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${bounceIn} 0.6s ease-out;
`;

const CardLogo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const CardTitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const CardSubtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 32px;
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 2px solid #fecaca;
  color: #dc2626;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  animation: ${fadeInUp} 0.3s ease-out;
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ErrorMessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  strong {
    font-size: 15px;
    font-weight: 700;
  }
  
  span {
    font-size: 14px;
    line-height: 1.4;
  }
`;

const InputGroup = styled.div<{ $hasError: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #8b5cf6;
    flex-shrink: 0;
  }
`;

const LabelTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 2px;
`;

const LabelHint = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-weight: 400;
`;

const Input = styled.input<{ $hasError: boolean }>`
  padding: 20px 16px;
  border: 2px solid ${props => props.$hasError ? '#f87171' : '#e2e8f0'};
  border-radius: 14px;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 100%;
  background: white;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc2626' : '#8b5cf6'};
    box-shadow: 0 0 0 4px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(139, 92, 246, 0.15)'};
    transform: translateY(-2px);
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button<{ disabled: boolean }>`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: ${props => props.disabled ? '#9ca3af' : '#8b5cf6'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 10px;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #f3f4f6;
    transform: scale(1.1);
  }
`;

const PasswordHint = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 8px;
  line-height: 1.4;
`;

const LoginButton = styled.button<{ disabled: boolean; $loading: boolean; $animate: boolean }>`
  background: ${props => props.disabled || props.$loading ? '#cbd5e1' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
  border: none;
  color: white;
  border-radius: 16px;
  padding: 22px 28px;
  font-size: 17px;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  transition: all 0.3s ease;
  margin-top: 12px;
  position: relative;
  overflow: hidden;
  animation: ${props => props.$animate ? pulse : 'none'} 2s ease-in-out infinite;
  
  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(139, 92, 246, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-2px);
  }
  
  span {
    position: relative;
    z-index: 1;
  }
  
  svg {
    position: relative;
    z-index: 1;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:not(:disabled)::before {
    opacity: 1;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 2px solid #e5e7eb;
  }
  
  span {
    padding: 0 20px;
    color: #8b5cf6;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const AlternativeActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AccessLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  text-decoration: none;
  color: #374151;
  transition: all 0.3s ease;
  background: white;
  
  &:hover {
    transform: translateX(4px);
    border-color: #d1d5db;
    background: #f9fafb;
  }
  
  > div {
    flex: 1;
  }
  
  strong {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  span {
    display: block;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
  }
  
  svg:first-child {
    color: #8b5cf6;
    flex-shrink: 0;
  }
  
  svg:last-child {
    color: #9ca3af;
    flex-shrink: 0;
  }
`;

const TeacherAccessLink = styled(AccessLink)`
  &:hover {
    border-color: #6366f1;
    background: #f5f3ff;
    
    svg:first-child {
      color: #6366f1;
    }
  }
`;

const ParentAccessLink = styled(AccessLink)`
  &:hover {
    border-color: #10b981;
    background: #f0fdf4;
    
    svg:first-child {
      color: #10b981;
    }
  }
`;

const HelpCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  border-radius: 16px;
  border: 2px solid #fbbf24;
  margin-top: 16px;
`;

const HelpIcon = styled.div`
  flex-shrink: 0;
`;

const HelpContent = styled.div`
  flex: 1;
`;

const HelpTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 8px;
`;

const HelpText = styled.div`
  font-size: 14px;
  color: #78350f;
  line-height: 1.5;
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 32px;
  border-top: 2px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  justify-content: center;
  
  svg {
    color: #10b981;
  }
`;

const SupportInfo = styled.div`
  text-align: center;
`;

const SupportTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
`;

const SupportEmail = styled(Link)`
  display: inline-block;
  color: #8b5cf6;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f5f3ff;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ede9fe;
    text-decoration: underline;
  }
`;

// Adicionando ícones necessários
const FaEye = styled(FaLock)``; // Placeholder - você precisará importar FaEye do react-icons/fa