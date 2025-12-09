'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserGraduate,
  FaRocket,
  FaShieldAlt,
  FaHeartbeat,
  FaBrain,
  FaChevronRight,
  FaQuestionCircle
} from 'react-icons/fa';
import { 
  FaUserDoctor,
  FaHospitalUser
} from 'react-icons/fa6';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Animações
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const slideIn = keyframes`
  from { 
    transform: translateX(-30px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

export default function ProfessionalLogin() {
  const router = useRouter();
  const { professionalLogin, loading, user } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Iniciando processo de login...');

    try {
      console.log('Chamando professionalLogin...');
      await professionalLogin(credentials.email, credentials.password);
      console.log('professionalLogin concluído - aguardando redirecionamento...');
      
      // O redirecionamento será feito automaticamente pelo layout
      // quando o estado do usuário for atualizado
    } catch (error: any) {
      console.error('Erro capturado no login:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      if (error.code === 'auth/user-not-found') {
        setError('Profissional não encontrado. Verifique seu e-mail ou crie uma conta.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Senha incorreta. Tente novamente ou recupere sua senha.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Formato de e-mail inválido.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Credenciais inválidas. Verifique seus dados.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet.');
      } else {
        setError(`Erro ao fazer login: ${error.message || 'Tente novamente'}`);
      }
    }
  };

  // Adicionar useEffect para debug do estado do usuário
  React.useEffect(() => {
    console.log('Estado do usuário atualizado:', user);
    if (user) {
      console.log('Usuário autenticado, redirecionando...');
      router.push('/professional/dashboard');
    }
  }, [user, router]);

  return (
    <Container>
      {/* Background com elementos decorativos */}
      <Background>
        <FloatingElement $top="10%" $left="5%" $delay="0s">
          <FaBrain size={24} color="rgba(255,255,255,0.1)" />
        </FloatingElement>
        <FloatingElement $top="20%" $right="8%" $delay="1s">
          <FaHeartbeat size={24} color="rgba(255,255,255,0.1)" />
        </FloatingElement>
        <FloatingElement $bottom="15%" $left="15%" $delay="2s">
          <FaUserDoctor size={24} color="rgba(255,255,255,0.1)" />
        </FloatingElement>
        <FloatingElement $bottom="25%" $right="12%" $delay="3s">
          <FaHospitalUser size={24} color="rgba(255,255,255,0.1)" />
        </FloatingElement>
      </Background>

      <LoginWrapper>
        {/* Seção de branding e informação */}
        <BrandSection>
          <BrandContent>
            <BrandLogo>
              <FaRocket size={48} color="#6366f1" />
              <BrandName>
                Nexus<span>Platform</span>
              </BrandName>
            </BrandLogo>
            
            <BrandTitle>
              Conectando <Highlight>Terapia</Highlight> e <Highlight>Educação</Highlight>
            </BrandTitle>
            
            <BrandDescription>
              Acesso à plataforma integrada para profissionais da saúde mental e educação.
              Gerencie pacientes, acompanhe progressos e colabore com sua equipe.
            </BrandDescription>

            <BenefitsList>
              <Benefit>
                <FaShieldAlt size={16} color="#10b981" />
                <span>Segurança e privacidade garantidas</span>
              </Benefit>
              <Benefit>
                <FaUserDoctor size={16} color="#6366f1" />
                <span>Acesso multidisciplinar integrado</span>
              </Benefit>
              <Benefit>
                <FaHospitalUser size={16} color="#8b5cf6" />
                <span>Comunicação em tempo real</span>
              </Benefit>
            </BenefitsList>

            <TrustBadge>
              <FaShieldAlt size={18} />
              <span>Conformidade com LGPD e normas éticas</span>
            </TrustBadge>
          </BrandContent>
        </BrandSection>

        {/* Card de login */}
        <LoginCard>
          <CardHeader>
            <CardLogo>
              <FaUser size={28} color="#6366f1" />
            </CardLogo>
            <CardTitle>Acesso Profissional</CardTitle>
            <CardSubtitle>Entre na plataforma de acompanhamento integrado</CardSubtitle>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage>
                <FaQuestionCircle size={16} />
                <span>{error}</span>
              </ErrorMessage>
            )}

            <InputGroup $hasError={!!error}>
              <Label htmlFor="email">
                <FaUser size={14} />
                E-mail profissional
              </Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="exemplo@clinica.com"
                required
                disabled={loading}
                autoComplete="email"
                $hasError={!!error}
              />
              <InputHint>Use o e-mail cadastrado na instituição</InputHint>
            </InputGroup>

            <InputGroup $hasError={!!error}>
              <Label htmlFor="password">
                <FaLock size={14} />
                Senha
              </Label>
              <PasswordInput>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
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
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </PasswordToggle>
              </PasswordInput>
              <PasswordActions>
                <PasswordHint>Mínimo 8 caracteres</PasswordHint>
                <ForgotPasswordLink href="/forgot-password">
                  Esqueceu a senha?
                </ForgotPasswordLink>
              </PasswordActions>
            </InputGroup>

            <LoginButton type="submit" disabled={loading} $loading={loading}>
              {loading ? (
                <>
                  <LoadingSpinner $small />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <FaLock size={18} />
                  <span>Acessar Plataforma</span>
                  <FaChevronRight size={14} />
                </>
              )}
            </LoginButton>

            <Divider>
              <span>ou</span>
            </Divider>

            <AlternativeActions>
              <StudentAccessLink href="/student-login">
                <FaUserGraduate size={16} />
                <div>
                  <strong>Sou Estudante</strong>
                  <span>Acesso à minha jornada</span>
                </div>
                <FaChevronRight size={12} />
              </StudentAccessLink>

              <RegisterLink href="/register">
                <FaUser size={16} />
                <div>
                  <strong>Primeiro Acesso?</strong>
                  <span>Criar conta profissional</span>
                </div>
                <FaChevronRight size={12} />
              </RegisterLink>
            </AlternativeActions>
          </Form>

          <CardFooter>
            <SecurityNote>
              <FaShieldAlt size={14} />
              <span>Sua conexão é segura e criptografada</span>
            </SecurityNote>
            
            <SupportSection>
              <SupportText>Precisa de ajuda?</SupportText>
              <SupportLink href="mailto:suporte@nexus.com">
                suporte@nexus.com
              </SupportLink>
              <SupportLink href="tel:+5511999999999">
                (11) 99999-9999
              </SupportLink>
            </SupportSection>
          </CardFooter>
        </LoginCard>
      </LoginWrapper>
    </Container>
  );
}

// ========== STYLED COMPONENTS REFATORADOS ==========
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0A1A3A 0%, #1A2B5F 100%);
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
`;

const BrandSection = styled.div`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
  padding: 60px 48px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const BrandContent = styled.div`
  width: 100%;
  animation: ${slideIn} 0.8s ease-out 0.2s both;
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
`;

const BrandName = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: white;
  
  span {
    background: linear-gradient(135deg, #a5b4fc, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const BrandTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin: 0 0 24px 0;
  
  @media (max-width: 1200px) {
    font-size: 28px;
  }
`;

const Highlight = styled.span`
  color: #a5b4fc;
`;

const BrandDescription = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 32px 0;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 40px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Benefit = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  
  svg {
    flex-shrink: 0;
  }
`;

const TrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 14px 20px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  animation: ${fadeIn} 0.6s ease-out 0.4s both;
`;

const CardLogo = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const CardTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const CardSubtitle = styled.p`
  color: #64748b;
  font-size: 15px;
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
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${fadeIn} 0.3s ease-out;
  
  svg {
    flex-shrink: 0;
  }
`;

const InputGroup = styled.div<{ $hasError: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input<{ $hasError: boolean }>`
  padding: 18px 16px;
  border: 2px solid ${props => props.$hasError ? '#f87171' : '#e2e8f0'};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  width: 100%;
  background: ${props => props.$hasError ? '#fef2f2' : 'white'};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc2626' : '#6366f1'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
    background: white;
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

const InputHint = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  display: block;
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
  color: ${props => props.disabled ? '#9ca3af' : '#64748b'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: #374151;
    background: #f1f5f9;
  }
`;

const PasswordActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const PasswordHint = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const ForgotPasswordLink = styled(Link)`
  color: #6366f1;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: #4f46e5;
    text-decoration: underline;
  }
`;

const LoginButton = styled.button<{ disabled: boolean; $loading: boolean }>`
  background: ${props => props.disabled || props.$loading ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  border: none;
  color: white;
  border-radius: 14px;
  padding: 20px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
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
    background: linear-gradient(135deg, #4f46e5, #3730a3);
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
  margin: 20px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
  }
  
  span {
    padding: 0 16px;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
  }
`;

const AlternativeActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  text-decoration: none;
  color: #374151;
  transition: all 0.3s ease;
  background: white;
  
  &:hover {
    border-color: #6366f1;
    background: #f8fafc;
    transform: translateX(4px);
  }
  
  > div {
    flex: 1;
    margin: 0 16px;
  }
  
  strong {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 2px;
  }
  
  span {
    display: block;
    font-size: 13px;
    color: #64748b;
  }
  
  svg:first-child {
    color: #6366f1;
    flex-shrink: 0;
  }
  
  svg:last-child {
    color: #9ca3af;
    flex-shrink: 0;
  }
`;

const StudentAccessLink = styled(ActionLink)`
  &:hover {
    border-color: #10b981;
    
    svg:first-child {
      color: #10b981;
    }
  }
`;

const RegisterLink = styled(ActionLink)`
  &:hover {
    border-color: #8b5cf6;
    
    svg:first-child {
      color: #8b5cf6;
    }
  }
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
  justify-content: center;
  
  svg {
    color: #10b981;
  }
`;

const SupportSection = styled.div`
  text-align: center;
`;

const SupportText = styled.p`
  color: #64748b;
  font-size: 13px;
  margin: 0 0 8px 0;
`;

const SupportLink = styled(Link)`
  display: block;
  color: #6366f1;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #4f46e5;
    text-decoration: underline;
  }
`;