'use client';

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
  FaIdCard,
  FaBriefcaseMedical,
  FaUserTie,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaRocket,
  FaStar,
  FaUsers,
  FaHandshake,
  FaChartLine,
  FaQuestionCircle
} from 'react-icons/fa';
import { 
  FaUserDoctor,
  FaStethoscope,
  FaUserGear,
  FaHeadset
} from 'react-icons/fa6';
import { createProfessional } from '@/lib/firebase/authService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Animações
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

const slideInFromLeft = keyframes`
  from { 
    transform: translateX(-30px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.05); 
    opacity: 0.9; 
  }
`;

const progressBar = keyframes`
  from { width: 0; }
  to { width: var(--progress); }
`;

export default function ProfessionalRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'psychologist' as 'psychologist' | 'psychiatrist' | 'monitor' | 'coordinator',
    specialization: '',
    licenseNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Calcular força da senha
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'Vazio', color: '#e5e7eb' };
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const labels = ['Muito fraca', 'Fraca', 'Média', 'Boa', 'Forte', 'Muito forte'];
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#059669', '#047857'];
    
    return {
      score,
      label: labels[score],
      color: colors[score]
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor, informe um e-mail válido.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações finais
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Validação de registro profissional para psicólogos e psiquiatras
    if ((formData.role === 'psychologist' || formData.role === 'psychiatrist') && !formData.licenseNumber) {
      setError('Por favor, informe seu número de registro profissional (CRP/CRM).');
      return;
    }

    setLoading(true);

    try {
      await createProfessional(formData);
      
      // Sucesso - mostrar mensagem amigável
      alert('🎉 Cadastro realizado com sucesso! Você pode fazer login agora.');
      router.push('/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Mensagens de erro mais amigáveis
      if (error.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
      } else if (error.code === 'auth/invalid-email') {
        setError('E-mail inválido. Por favor, verifique o formato.');
      } else if (error.code === 'auth/weak-password') {
        setError('Senha muito fraca. Tente uma senha mais complexa.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(error.message || 'Erro ao cadastrar. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Container>
      {/* Background com elementos decorativos */}
      <Background>
        <FloatingElement $top="10%" $left="5%" $delay="0s">
          <FaUsers size={24} color="rgba(99, 102, 241, 0.15)" />
        </FloatingElement>
        <FloatingElement $top="20%" $right="8%" $delay="1s">
          <FaStethoscope size={24} color="rgba(16, 185, 129, 0.15)" />
        </FloatingElement>
        <FloatingElement $bottom="15%" $left="12%" $delay="2s">
          <FaChartLine size={24} color="rgba(139, 92, 246, 0.15)" />
        </FloatingElement>
        <FloatingElement $bottom="25%" $right="10%" $delay="3s">
          <FaHandshake size={24} color="rgba(245, 158, 11, 0.15)" />
        </FloatingElement>
      </Background>

      <RegisterWrapper>
        {/* Seção de branding e benefícios */}
        <BrandSection>
          <BrandContent>
            <BrandLogo>
              <FaRocket size={48} color="#6366f1" />
              <BrandName>
                Nexus<span>Platform</span>
              </BrandName>
            </BrandLogo>
            
            <BrandTitle>
              Junte-se à <Highlight>Comunidade</Highlight> de Especialistas
            </BrandTitle>
            
            <BrandDescription>
              Cadastre-se na plataforma que conecta profissionais da saúde mental 
              e educação para um acompanhamento terapêutico-educacional integrado.
            </BrandDescription>

            <BenefitsList>
              <Benefit>
                <FaCheckCircle size={18} color="#10b981" />
                <div>
                  <BenefitTitle>Acesso Multidisciplinar</BenefitTitle>
                  <BenefitText>Colabore com psicólogos, psiquiatras e educadores</BenefitText>
                </div>
              </Benefit>
              
              <Benefit>
                <FaCheckCircle size={18} color="#6366f1" />
                <div>
                  <BenefitTitle>Ferramentas Especializadas</BenefitTitle>
                  <BenefitText>Programas personalizados e analytics em tempo real</BenefitText>
                </div>
              </Benefit>
              
              <Benefit>
                <FaCheckCircle size={18} color="#8b5cf6" />
                <div>
                  <BenefitTitle>Segurança Garantida</BenefitTitle>
                  <BenefitText>Conformidade LGPD e criptografia de ponta a ponta</BenefitText>
                </div>
              </Benefit>
              
              <Benefit>
                <FaCheckCircle size={18} color="#f59e0b" />
                <div>
                  <BenefitTitle>Suporte Dedicado</BenefitTitle>
                  <BenefitText>Equipe especializada para ajudar no que precisar</BenefitText>
                </div>
              </Benefit>
            </BenefitsList>

            <Testimonial>
              <TestimonialContent>
                "A Nexus revolucionou nossa forma de trabalhar. A integração entre profissionais nunca foi tão eficiente."
              </TestimonialContent>
              <TestimonialAuthor>
                <TestimonialAvatar>DR</TestimonialAvatar>
                <div>
                  <TestimonialName>Dr. Carlos Silva</TestimonialName>
                  <TestimonialRole>Psiquiatra - Clínica Integrada</TestimonialRole>
                </div>
              </TestimonialAuthor>
            </Testimonial>

            <TrustBadge>
              <FaShieldAlt size={20} />
              <span>Ambiente seguro e profissional para dados sensíveis</span>
            </TrustBadge>
          </BrandContent>
        </BrandSection>

        {/* Card de registro */}
        <RegisterCard>
          <CardHeader>
            <ProgressIndicator>
              <ProgressStep $active={step >= 1}>
                <StepNumber>1</StepNumber>
                <StepLabel>Informações Pessoais</StepLabel>
              </ProgressStep>
              <ProgressLine $active={step >= 2} />
              <ProgressStep $active={step >= 2}>
                <StepNumber>2</StepNumber>
                <StepLabel>Detalhes Profissionais</StepLabel>
              </ProgressStep>
            </ProgressIndicator>
            
            <CardLogo>
              <FaUserDoctor size={32} color="#6366f1" />
            </CardLogo>
            <CardTitle>
              {step === 1 ? 'Comece sua Jornada' : 'Detalhes Profissionais'}
            </CardTitle>
            <CardSubtitle>
              {step === 1 
                ? 'Preencha suas informações básicas para criar sua conta'
                : 'Complete seu perfil profissional'}
            </CardSubtitle>
          </CardHeader>

          <Form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {error && (
              <ErrorMessage>
                <FaQuestionCircle size={18} />
                <ErrorMessageContent>
                  <strong>Precisa de atenção</strong>
                  <span>{error}</span>
                </ErrorMessageContent>
              </ErrorMessage>
            )}

            {step === 1 && (
              <StepContent>
                <InputGroup>
                  <Label htmlFor="name">
                    <FaUser size={16} />
                    <div>
                      <LabelTitle>Nome Completo</LabelTitle>
                      <LabelHint>Como aparece no seu registro profissional</LabelHint>
                    </div>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Dra. Maria Silva Santos"
                    required
                    disabled={loading}
                    $hasError={!!error}
                  />
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="email">
                    <FaUser size={16} />
                    <div>
                      <LabelTitle>E-mail Profissional</LabelTitle>
                      <LabelHint>Use o e-mail da sua instituição/clínica</LabelHint>
                    </div>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemplo@clinica.com"
                    required
                    disabled={loading}
                    $hasError={!!error}
                  />
                  <InputHint>Verifique se é um e-mail válido para receber as confirmações</InputHint>
                </InputGroup>

                <NextStepButton type="button" onClick={nextStep} disabled={loading}>
                  <span>Continuar para Detalhes Profissionais</span>
                  <FaArrowRight size={16} />
                </NextStepButton>
              </StepContent>
            )}

            {step === 2 && (
              <StepContent>
                <InputGroup>
                  <Label htmlFor="role">
                    <FaUserTie size={16} />
                    <div>
                      <LabelTitle>Sua Função na Plataforma</LabelTitle>
                      <LabelHint>Selecione sua especialidade principal</LabelHint>
                    </div>
                  </Label>
                  <RoleSelector>
                    <RoleOption 
                      $selected={formData.role === 'psychologist'}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'psychologist' }))}
                    >
                      <RoleIcon>
                        <FaUserDoctor size={24} />
                      </RoleIcon>
                      <RoleInfo>
                        <RoleTitle>Psicólogo</RoleTitle>
                        <RoleDescription>Acompanhamento psicológico</RoleDescription>
                      </RoleInfo>
                      {formData.role === 'psychologist' && <FaCheckCircle size={16} />}
                    </RoleOption>
                    
                    <RoleOption 
                      $selected={formData.role === 'psychiatrist'}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'psychiatrist' }))}
                    >
                      <RoleIcon>
                        <FaStethoscope size={24} />
                      </RoleIcon>
                      <RoleInfo>
                        <RoleTitle>Psiquiatra</RoleTitle>
                        <RoleDescription>Acompanhamento psiquiátrico</RoleDescription>
                      </RoleInfo>
                      {formData.role === 'psychiatrist' && <FaCheckCircle size={16} />}
                    </RoleOption>
                    
                    <RoleOption 
                      $selected={formData.role === 'monitor'}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'monitor' }))}
                    >
                      <RoleIcon>
                        <FaHeadset size={24} />
                      </RoleIcon>
                      <RoleInfo>
                        <RoleTitle>Monitor</RoleTitle>
                        <RoleDescription>Acompanhamento educacional</RoleDescription>
                      </RoleInfo>
                      {formData.role === 'monitor' && <FaCheckCircle size={16} />}
                    </RoleOption>
                    
                    <RoleOption 
                      $selected={formData.role === 'coordinator'}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'coordinator' }))}
                    >
                      <RoleIcon>
                        <FaUserGear size={24} />
                      </RoleIcon>
                      <RoleInfo>
                        <RoleTitle>Coordenador</RoleTitle>
                        <RoleDescription>Gestão e coordenação</RoleDescription>
                      </RoleInfo>
                      {formData.role === 'coordinator' && <FaCheckCircle size={16} />}
                    </RoleOption>
                  </RoleSelector>
                </InputGroup>

                {(formData.role === 'psychologist' || formData.role === 'psychiatrist') && (
                  <>
                    <InputGroup>
                      <Label htmlFor="specialization">
                        <FaBriefcaseMedical size={16} />
                        <div>
                          <LabelTitle>Especialização</LabelTitle>
                          <LabelHint>Sua área de especialização (opcional)</LabelHint>
                        </div>
                      </Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        type="text"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Ex: Psicologia Infantil, Psiquiatria Forense, etc."
                        disabled={loading}
                        $hasError={!!error}
                      />
                    </InputGroup>

                    <InputGroup>
                      <Label htmlFor="licenseNumber">
                        <FaIdCard size={16} />
                        <div>
                          <LabelTitle>Número de Registro Profissional</LabelTitle>
                          <LabelHint>CRP para psicólogos ou CRM para psiquiatras</LabelHint>
                        </div>
                      </Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder={formData.role === 'psychologist' ? "CRP XX/XXXXX" : "CRM-XX XXXXX"}
                        required={formData.role === 'psychologist' || formData.role === 'psychiatrist'}
                        disabled={loading}
                        $hasError={!!error}
                      />
                      <InputHint>Necessário para validação profissional</InputHint>
                    </InputGroup>
                  </>
                )}

                <InputGroup>
                  <Label htmlFor="password">
                    <FaLock size={16} />
                    <div>
                      <LabelTitle>Crie uma Senha Segura</LabelTitle>
                      <LabelHint>Mínimo 6 caracteres (recomendamos 8+)</LabelHint>
                    </div>
                  </Label>
                  <PasswordInput>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Digite uma senha forte"
                      required
                      disabled={loading}
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
                  
                  <PasswordStrength>
                    <StrengthBar>
                      <StrengthFill 
                        $strength={passwordStrength.score} 
                        $color={passwordStrength.color}
                      />
                    </StrengthBar>
                    <StrengthLabel $color={passwordStrength.color}>
                      Força da senha: {passwordStrength.label}
                    </StrengthLabel>
                  </PasswordStrength>
                  
                  <PasswordTips>
                    <PasswordTip $valid={formData.password.length >= 6}>
                      <FaCheckCircle size={12} />
                      <span>Mínimo 6 caracteres</span>
                    </PasswordTip>
                    <PasswordTip $valid={formData.password.length >= 8}>
                      <FaCheckCircle size={12} />
                      <span>Recomendado 8+ caracteres</span>
                    </PasswordTip>
                    <PasswordTip $valid={/[A-Z]/.test(formData.password)}>
                      <FaCheckCircle size={12} />
                      <span>Pelo menos uma letra maiúscula</span>
                    </PasswordTip>
                    <PasswordTip $valid={/[0-9]/.test(formData.password)}>
                      <FaCheckCircle size={12} />
                      <span>Pelo menos um número</span>
                    </PasswordTip>
                  </PasswordTips>
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="confirmPassword">
                    <FaLock size={16} />
                    <div>
                      <LabelTitle>Confirme sua Senha</LabelTitle>
                      <LabelHint>Digite a mesma senha novamente</LabelHint>
                    </div>
                  </Label>
                  <PasswordInput>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repita a senha digitada"
                      required
                      disabled={loading}
                      $hasError={!!error}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </PasswordToggle>
                  </PasswordInput>
                  
                  <PasswordMatch $match={formData.password === formData.confirmPassword && formData.password.length > 0}>
                    <FaCheckCircle size={14} />
                    <span>Senhas {formData.password === formData.confirmPassword ? 'coincidem' : 'não coincidem'}</span>
                  </PasswordMatch>
                </InputGroup>

                <TermsSection>
                  <TermsCheckbox>
                    <input type="checkbox" id="terms" required />
                    <TermsLabel htmlFor="terms">
                      Concordo com os <TermsLink href="/terms">Termos de Uso</TermsLink> e 
                      <TermsLink href="/privacy"> Política de Privacidade</TermsLink> da Nexus Platform
                    </TermsLabel>
                  </TermsCheckbox>
                  
                  <ProfessionalAgreement>
                    <FaShieldAlt size={14} />
                    <span>
                      Como profissional, concordo em manter a confidencialidade dos dados 
                      dos pacientes conforme as normas éticas da minha categoria.
                    </span>
                  </ProfessionalAgreement>
                </TermsSection>

                <ActionButtons>
                  <BackButton type="button" onClick={prevStep} disabled={loading}>
                    <FaArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                    <span>Voltar</span>
                  </BackButton>
                  
                  <RegisterButton type="submit" disabled={loading} $loading={loading}>
                    {loading ? (
                      <>
                        <LoadingSpinner $small />
                        <span>Finalizando Cadastro...</span>
                      </>
                    ) : (
                      <>
                        <FaUser size={18} />
                        <span>Completar Cadastro</span>
                        <FaStar size={16} />
                      </>
                    )}
                  </RegisterButton>
                </ActionButtons>
              </StepContent>
            )}
          </Form>

          <CardFooter>
            <LoginPrompt>
              <span>Já tem uma conta profissional?</span>
              <LoginLink href="/login">
                Faça Login
              </LoginLink>
            </LoginPrompt>
            
            <SupportSection>
              <SupportText>Dúvidas sobre o cadastro?</SupportText>
              <SupportLink href="mailto:suporte@nexus.com">
                suporte@nexus.com
              </SupportLink>
              <SupportLink href="tel:+5511999999999">
                (11) 99999-9999
              </SupportLink>
            </SupportSection>
          </CardFooter>
        </RegisterCard>
      </RegisterWrapper>
    </Container>
  );
}

// ========== STYLED COMPONENTS ==========
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

const RegisterWrapper = styled.div`
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
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
`;

const BrandSection = styled.div`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05));
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
  animation: ${slideInFromLeft} 0.8s ease-out 0.2s both;
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
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 40px 0;
`;

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 0 40px 0;
`;

const Benefit = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const BenefitTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
`;

const BenefitText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

const Testimonial = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  border-left: 4px solid #a5b4fc;
  backdrop-filter: blur(10px);
  margin: 0 0 40px 0;
`;

const TestimonialContent = styled.p`
  color: white;
  font-size: 16px;
  line-height: 1.6;
  font-style: italic;
  margin: 0 0 20px 0;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TestimonialAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
`;

const TestimonialName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin-bottom: 2px;
`;

const TestimonialRole = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const TrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  svg {
    color: #10b981;
  }
`;

const RegisterCard = styled.div`
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
  margin-bottom: 40px;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
`;

const ProgressStep = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.$active ? 1 : 0.4};
  transition: all 0.3s ease;
`;

const StepNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.theme ? '#e0e7ff' : '#e0e7ff'};
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
`;

const StepLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
`;

const ProgressLine = styled.div<{ $active: boolean }>`
  width: 40px;
  height: 2px;
  background: ${props => props.$active ? '#6366f1' : '#e5e7eb'};
  transition: all 0.3s ease;
`;

const CardLogo = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const CardTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin: 0 0 8px 0;
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const CardSubtitle = styled.p`
  color: #64748b;
  font-size: 15px;
  text-align: center;
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

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #6366f1;
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
  padding: 18px 16px;
  border: 2px solid ${props => props.$hasError ? '#f87171' : '#e2e8f0'};
  border-radius: 14px;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 100%;
  background: white;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc2626' : '#6366f1'};
    box-shadow: 0 0 0 4px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(99, 102, 241, 0.15)'};
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

const InputHint = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
`;

const NextStepButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: white;
  border-radius: 14px;
  padding: 20px 28px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  margin-top: 12px;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
  }
  
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const RoleSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RoleOption = styled.div<{ $selected: boolean }>`
  padding: 20px;
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e5e7eb'};
  border-radius: 14px;
  background: ${props => props.$selected ? '#f5f3ff' : 'white'};
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #a5b4fc;
    transform: translateY(-2px);
  }
  
  svg:last-child {
    color: #6366f1;
    margin-left: auto;
  }
`;

const RoleIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  flex-shrink: 0;
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
`;

const RoleDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
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
  color: ${props => props.disabled ? '#9ca3af' : '#6366f1'};
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

const PasswordStrength = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const StrengthBar = styled.div`
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const StrengthFill = styled.div<{ $strength: number; $color: string }>`
  height: 100%;
  width: ${props => (props.$strength / 5) * 100}%;
  background: ${props => props.$color};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const StrengthLabel = styled.div<{ $color: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$color};
`;

const PasswordTips = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PasswordTip = styled.div<{ $valid: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.$valid ? '#10b981' : '#6b7280'};
  
  svg {
    flex-shrink: 0;
  }
`;

const PasswordMatch = styled.div<{ $match: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$match ? '#10b981' : '#ef4444'};
  margin-top: 8px;
  
  svg {
    flex-shrink: 0;
  }
`;

const TermsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 2px solid #d1d5db;
    margin-top: 2px;
    cursor: pointer;
    
    &:checked {
      background-color: #6366f1;
      border-color: #6366f1;
    }
    
    &:focus {
      outline: 2px solid rgba(99, 102, 241, 0.5);
      outline-offset: 2px;
    }
  }
`;

const TermsLabel = styled.label`
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  cursor: pointer;
`;

const TermsLink = styled(Link)`
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProfessionalAgreement = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #bae6fd;
  
  svg {
    color: #0ea5e9;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  span {
    font-size: 13px;
    color: #0369a1;
    line-height: 1.5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const BackButton = styled.button<{ disabled: boolean }>`
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  border-radius: 14px;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  flex: 1;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateX(-4px);
  }
  
  svg {
    transform: rotate(180deg);
  }
`;

const RegisterButton = styled.button<{ disabled: boolean; $loading: boolean }>`
  background: ${props => props.disabled || props.$loading ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  border: none;
  color: white;
  border-radius: 14px;
  padding: 18px 28px;
  font-size: 16px;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  flex: 2;
  position: relative;
  overflow: hidden;
  animation: ${props => !props.disabled && !props.$loading ? pulse : 'none'} 2s ease-in-out infinite;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
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

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 32px;
  border-top: 2px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LoginPrompt = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const LoginLink = styled(Link)`
  color: #6366f1;
  font-weight: 700;
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

const SupportSection = styled.div`
  text-align: center;
`;

const SupportText = styled.div`
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 8px;
`;

const SupportLink = styled(Link)`
  display: block;
  color: #6366f1;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #4f46e5;
    text-decoration: underline;
  }
`;