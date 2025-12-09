'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaPhone,
  FaSchool,
  FaBirthdayCake,
  FaUserGraduate,
  FaGamepad,
  FaTrophy,
  FaStar,
  FaHeart,
  FaChartLine,
  FaRocket,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaQuestionCircle
} from 'react-icons/fa';
import {
  FaGraduationCap,
  FaBookOpen,
  FaUsers,
  FaChild
} from 'react-icons/fa6';
import { createStudent } from '@/lib/firebase/authService';
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

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

export default function StudentRegister() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    birthday: '',
    phone: '',
    school: '',
    grade: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Formatar CPF enquanto digita
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  // Formatar telefone enquanto digita
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Formatação em tempo real
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'birthday') {
      // Garantir formato correto para date input
      formattedValue = value;
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Por favor, informe o nome do aluno.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Por favor, informe o e-mail.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor, informe um e-mail válido.');
      return false;
    }
    if (!formData.cpf.replace(/\D/g, '')) {
      setError('Por favor, informe o CPF.');
      return false;
    }
    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF deve conter 11 dígitos.');
      return false;
    }
    if (!formData.birthday) {
      setError('Por favor, informe a data de nascimento.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.school.trim()) {
      setError('Por favor, informe a escola.');
      return false;
    }
    if (!formData.grade.trim()) {
      setError('Por favor, informe a série/ano.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações finais
    if (!validateStep1() || !validateStep2()) {
      setStep(1); // Volta para o primeiro passo se houver erro
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para envio (remover formatação do CPF e telefone)
      const cleanData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        birthday: formData.birthday // Já está no formato YYYY-MM-DD
      };

      await createStudent(cleanData);

      // Sucesso - mensagem amigável
      alert('🎉 Aluno cadastrado com sucesso! Agora você pode fazer login.');
      router.push('/student-login');
    } catch (error: any) {
      console.error('Erro no cadastro do aluno:', error);
      
      // Mensagens de erro mais amigáveis
      if (error.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Use outro e-mail ou faça login.');
      } else if (error.code === 'auth/invalid-email') {
        setError('E-mail inválido. Por favor, verifique o formato.');
      } else if (error.code === 'auth/weak-password') {
        setError('Senha muito fraca. Tente uma senha mais complexa.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(error.message || 'Erro ao cadastrar aluno. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'Vazio', color: '#e5e7eb' };
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    
    const labels = ['Muito fraca', 'Fraca', 'Média', 'Boa', 'Forte'];
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#059669'];
    
    return {
      score,
      label: labels[score],
      color: colors[score]
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const today = new Date().toISOString().split('T')[0];

  return (
    <Container>
      {/* Background com elementos decorativos */}
      <Background>
        <FloatingElement $top="15%" $left="8%" $delay="0s">
          <FaGamepad size={24} color="rgba(139, 92, 246, 0.15)" />
        </FloatingElement>
        <FloatingElement $top="25%" $right="10%" $delay="1s">
          <FaTrophy size={24} color="rgba(245, 158, 11, 0.15)" />
        </FloatingElement>
        <FloatingElement $bottom="20%" $left="15%" $delay="2s">
          <FaBookOpen size={24} color="rgba(236, 72, 153, 0.15)" />
        </FloatingElement>
        <FloatingElement $bottom="30%" $right="12%" $delay="3s">
          <FaStar size={24} color="rgba(16, 185, 129, 0.15)" />
        </FloatingElement>
      </Background>

      <RegisterWrapper>
        {/* Seção de branding */}
        <StudentBrandSection>
          <BrandContent>
            <BrandLogo>
              <FaUserGraduate size={48} color="#8b5cf6" />
              <BrandName>
                Cadastro do <span>Aluno</span>
              </BrandName>
            </BrandLogo>
            
            <BrandTitle>
              Comece sua <Highlight>Jornada</Highlight> de Aprendizado
            </BrandTitle>
            
            <BrandDescription>
              Cadastre-se na plataforma gamificada que torna o acompanhamento 
              terapêutico-educacional uma experiência divertida e motivadora.
            </BrandDescription>

            <FeaturesGrid>
              <Feature>
                <FeatureIcon $color="#8b5cf6">
                  <FaGamepad size={20} />
                </FeatureIcon>
                <FeatureContent>
                  <FeatureTitle>Atividades Gamificadas</FeatureTitle>
                  <FeatureText>Aprenda brincando com desafios envolventes</FeatureText>
                </FeatureContent>
              </Feature>
              
              <Feature>
                <FeatureIcon $color="#f59e0b">
                  <FaTrophy size={20} />
                </FeatureIcon>
                <FeatureContent>
                  <FeatureTitle>Conquistas e Recompensas</FeatureTitle>
                  <FeatureText>Colecione badges pelo seu progresso</FeatureText>
                </FeatureContent>
              </Feature>
              
              <Feature>
                <FeatureIcon $color="#10b981">
                  <FaChartLine size={20} />
                </FeatureIcon>
                <FeatureContent>
                  <FeatureTitle>Acompanhamento Visual</FeatureTitle>
                  <FeatureText>Veja sua evolução em gráficos coloridos</FeatureText>
                </FeatureContent>
              </Feature>
              
              <Feature>
                <FeatureIcon $color="#ec4899">
                  <FaHeart size={20} />
                </FeatureIcon>
                <FeatureContent>
                  <FeatureTitle>Suporte Personalizado</FeatureTitle>
                  <FeatureText>Equipe de profissionais para te ajudar</FeatureText>
                </FeatureContent>
              </Feature>
            </FeaturesGrid>

            <StudentBenefits>
              <BenefitTitle>Por que se cadastrar?</BenefitTitle>
              <BenefitList>
                <BenefitItem>
                  <FaCheckCircle size={14} color="#10b981" />
                  <span>Acesso à sua jornada personalizada</span>
                </BenefitItem>
                <BenefitItem>
                  <FaCheckCircle size={14} color="#10b981" />
                  <span>Atividades adaptadas ao seu ritmo</span>
                </BenefitItem>
                <BenefitItem>
                  <FaCheckCircle size={14} color="#10b981" />
                  <span>Comunicação direta com seus professores</span>
                </BenefitItem>
              </BenefitList>
            </StudentBenefits>

            <SecurityNote>
              <FaShieldAlt size={18} color="#a5b4fc" />
              <span>Ambiente seguro e protegido para menores</span>
            </SecurityNote>
          </BrandContent>
        </StudentBrandSection>

        {/* Card de registro */}
        <RegisterCard>
          <CardHeader>
            <ProgressIndicator>
              <ProgressStep $active={step >= 1}>
                <StepNumber>1</StepNumber>
                <StepLabel>Dados Pessoais</StepLabel>
              </ProgressStep>
              <ProgressLine $active={step >= 2} />
              <ProgressStep $active={step >= 2}>
                <StepNumber>2</StepNumber>
                <StepLabel>Informações Escolares</StepLabel>
              </ProgressStep>
              <ProgressLine $active={step >= 3} />
              <ProgressStep $active={step >= 3}>
                <StepNumber>3</StepNumber>
                <StepLabel>Segurança</StepLabel>
              </ProgressStep>
            </ProgressIndicator>
            
            <CardLogo>
              <FaGraduationCap size={32} color="#8b5cf6" />
            </CardLogo>
            <CardTitle>
              {step === 1 ? 'Dados do Aluno' : 
               step === 2 ? 'Informações Escolares' : 
               'Crie sua Senha'}
            </CardTitle>
            <CardSubtitle>
              {step === 1 ? 'Informe os dados pessoais do aluno' :
               step === 2 ? 'Complete as informações da escola' :
               'Proteja sua conta com uma senha segura'}
            </CardSubtitle>
          </CardHeader>

          <Form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {error && (
              <ErrorMessage>
                <FaQuestionCircle size={18} />
                <ErrorMessageContent>
                  <strong>Atenção</strong>
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
                      <LabelTitle>Nome Completo do Aluno</LabelTitle>
                      <LabelHint>Como consta nos documentos</LabelHint>
                    </div>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: João da Silva Santos"
                    required
                    disabled={loading}
                    $hasError={!!error}
                  />
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="email">
                    <FaEnvelope size={16} />
                    <div>
                      <LabelTitle>E-mail do Aluno</LabelTitle>
                      <LabelHint>Será usado para login</LabelHint>
                    </div>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemplo@aluno.com"
                    required
                    disabled={loading}
                    $hasError={!!error}
                  />
                  <InputHint>Use um e-mail que o aluno tenha acesso</InputHint>
                </InputGroup>

                <TwoColumnGrid>
                  <InputGroup>
                    <Label htmlFor="cpf">
                      <FaIdCard size={16} />
                      <LabelTitle>CPF do Aluno</LabelTitle>
                    </Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      required
                      disabled={loading}
                      maxLength={14}
                      $hasError={!!error}
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label htmlFor="birthday">
                      <FaBirthdayCake size={16} />
                      <LabelTitle>Data de Nascimento</LabelTitle>
                    </Label>
                    <Input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      max={today}
                      $hasError={!!error}
                    />
                  </InputGroup>
                </TwoColumnGrid>

                <InputGroup>
                  <Label htmlFor="phone">
                    <FaPhone size={16} />
                    <div>
                      <LabelTitle>Telefone (Opcional)</LabelTitle>
                      <LabelHint>Para contato em emergências</LabelHint>
                    </div>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    disabled={loading}
                    maxLength={15}
                    $hasError={!!error}
                  />
                </InputGroup>

                <NextStepButton type="button" onClick={nextStep} disabled={loading}>
                  <span>Próximo: Informações Escolares</span>
                  <FaArrowRight size={16} />
                </NextStepButton>
              </StepContent>
            )}

            {step === 2 && (
              <StepContent>
                <InputGroup>
                  <Label htmlFor="school">
                    <FaSchool size={16} />
                    <div>
                      <LabelTitle>Escola</LabelTitle>
                      <LabelHint>Nome completo da instituição</LabelHint>
                    </div>
                  </Label>
                  <Input
                    id="school"
                    name="school"
                    type="text"
                    value={formData.school}
                    onChange={handleChange}
                    placeholder="Ex: Escola Estadual Professora Maria"
                    required
                    disabled={loading}
                    $hasError={!!error}
                  />
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="grade">
                    <FaGraduationCap size={16} />
                    <div>
                      <LabelTitle>Série/Ano</LabelTitle>
                      <LabelHint>Ano letivo atual do aluno</LabelHint>
                    </div>
                  </Label>
                  <Select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    $hasError={!!error}
                  >
                    <option value="">Selecione a série...</option>
                    <option value="Pré-escola">Pré-escola</option>
                    <option value="1º ano">1º ano</option>
                    <option value="2º ano">2º ano</option>
                    <option value="3º ano">3º ano</option>
                    <option value="4º ano">4º ano</option>
                    <option value="5º ano">5º ano</option>
                    <option value="6º ano">6º ano</option>
                    <option value="7º ano">7º ano</option>
                    <option value="8º ano">8º ano</option>
                    <option value="9º ano">9º ano</option>
                    <option value="1º ano EM">1º ano EM</option>
                    <option value="2º ano EM">2º ano EM</option>
                    <option value="3º ano EM">3º ano EM</option>
                  </Select>
                </InputGroup>

                <HelpCard>
                  <HelpIcon>
                    <FaChild size={20} color="#f59e0b" />
                  </HelpIcon>
                  <HelpContent>
                    <HelpTitle>Para responsáveis</HelpTitle>
                    <HelpText>
                      Certifique-se de que todas as informações estão corretas. 
                      Você será responsável pelo acompanhamento do progresso do aluno.
                    </HelpText>
                  </HelpContent>
                </HelpCard>

                <ActionButtons>
                  <BackButton type="button" onClick={prevStep} disabled={loading}>
                    <FaArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                    <span>Voltar</span>
                  </BackButton>
                  
                  <NextStepButton type="button" onClick={nextStep} disabled={loading}>
                    <span>Próximo: Criar Senha</span>
                    <FaArrowRight size={16} />
                  </NextStepButton>
                </ActionButtons>
              </StepContent>
            )}

            {step === 3 && (
              <StepContent>
                <InputGroup>
                  <Label htmlFor="password">
                    <FaLock size={16} />
                    <div>
                      <LabelTitle>Crie uma Senha</LabelTitle>
                      <LabelHint>Mínimo 6 caracteres</LabelHint>
                    </div>
                  </Label>
                  <PasswordInput>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Digite uma senha segura"
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
                      {passwordStrength.label}
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
                  </PasswordTips>
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="confirmPassword">
                    <FaLock size={16} />
                    <div>
                      <LabelTitle>Confirme a Senha</LabelTitle>
                      <LabelHint>Digite novamente para confirmar</LabelHint>
                    </div>
                  </Label>
                  <PasswordInput>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repita a senha"
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
                    <span>Senhas {formData.password === formData.confirmPassword ? 'coincidem ✓' : 'não coincidem'}</span>
                  </PasswordMatch>
                </InputGroup>

                <TermsSection>
                  <TermsCheckbox>
                    <input type="checkbox" id="parentalConsent" required />
                    <TermsLabel htmlFor="parentalConsent">
                      Sou responsável pelo aluno e autorizo seu cadastro na plataforma Nexus Platform
                    </TermsLabel>
                  </TermsCheckbox>
                  
                  <TermsCheckbox>
                    <input type="checkbox" id="terms" required />
                    <TermsLabel htmlFor="terms">
                      Concordo com os <TermsLink href="/terms">Termos de Uso</TermsLink> e 
                      <TermsLink href="/privacy"> Política de Privacidade</TermsLink>
                    </TermsLabel>
                  </TermsCheckbox>
                  
                  <SafetyNote>
                    <FaShieldAlt size={14} color="#8b5cf6" />
                    <span>
                      Dados protegidos conforme a LGPD. A plataforma é um ambiente seguro 
                      para menores, supervisionado por profissionais.
                    </span>
                  </SafetyNote>
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
                        <FaUserGraduate size={18} />
                        <span>Cadastrar Aluno</span>
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
              <span>Já tem uma conta de aluno?</span>
              <LoginLink href="/student-login">
                Faça Login Aqui
              </LoginLink>
            </LoginPrompt>
            
            <SupportSection>
              <SupportText>Dúvidas sobre o cadastro?</SupportText>
              <SupportLink href="mailto:aluno@nexus.com">
                aluno@nexus.com
              </SupportLink>
              <SupportText>Para responsáveis:</SupportText>
              <SupportLink href="mailto:responsaveis@nexus.com">
                responsaveis@nexus.com
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

const RegisterWrapper = styled.div`
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
  animation: ${slideInFromLeft} 0.8s ease-out 0.2s both;
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
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin: 0 0 40px 0;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FeatureIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureContent = styled.div`
  flex: 1;
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

const StudentBenefits = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  margin: 0 0 40px 0;
`;

const BenefitTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 16px;
`;

const BenefitList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  
  svg {
    flex-shrink: 0;
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  
  svg {
    flex-shrink: 0;
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
  gap: 8px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme ? '#ede9fe' : '#ede9fe'};
  color: #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
`;

const StepLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  white-space: nowrap;
`;

const ProgressLine = styled.div<{ $active: boolean }>`
  width: 30px;
  height: 2px;
  background: ${props => props.$active ? '#8b5cf6' : '#e5e7eb'};
  transition: all 0.3s ease;
`;

const CardLogo = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
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

const InputGroup = styled.div`
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

const InputHint = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select<{ $hasError: boolean }>`
  padding: 18px 16px;
  border: 2px solid ${props => props.$hasError ? '#f87171' : '#e2e8f0'};
  border-radius: 14px;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 100%;
  background: white;
  color: #1f2937;
  cursor: pointer;

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
`;

const NextStepButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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
  animation: ${pulse} 2s ease-in-out infinite;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
  }
  
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    animation: none;
  }
`;

const HelpCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  border-radius: 16px;
  border: 2px solid #fbbf24;
  margin-top: 8px;
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
  background: ${props => props.disabled || props.$loading ? '#cbd5e1' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
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
    box-shadow: 0 12px 30px rgba(139, 92, 246, 0.4);
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
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:not(:disabled)::before {
    opacity: 1;
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
  width: ${props => (props.$strength / 4) * 100}%;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
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
  margin-top: 24px;
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
      background-color: #8b5cf6;
      border-color: #8b5cf6;
    }
    
    &:focus {
      outline: 2px solid rgba(139, 92, 246, 0.5);
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
  color: #8b5cf6;
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SafetyNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f5f3ff;
  border-radius: 12px;
  border: 1px solid #ddd6fe;
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  span {
    font-size: 13px;
    color: #5b21b6;
    line-height: 1.5;
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
  color: #8b5cf6;
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
  margin-bottom: 4px;
`;

const SupportLink = styled(Link)`
  display: block;
  color: #8b5cf6;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #7c3aed;
    text-decoration: underline;
  }
`;