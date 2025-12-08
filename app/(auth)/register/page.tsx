'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserGraduate,
  FaIdCard,
  FaBriefcaseMedical,
  FaUserTie
} from 'react-icons/fa';
import { createProfessional } from '@/lib/firebase/authService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
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
      await createProfessional(formData);
      alert('Profissional cadastrado com sucesso! Você pode fazer login agora.');
      router.push('/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      setError(error.message || 'Erro ao cadastrar profissional. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <RegisterCard>
        <Header>
          <Logo>
            <FaUserGraduate size={32} />
          </Logo>
          <Title>Cadastro de Profissional</Title>
          <Subtitle>Crie sua conta na plataforma</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label htmlFor="name">
              <FaUser size={14} />
              Nome Completo
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">
              <FaUser size={14} />
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@profissional.com"
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="role">
              <FaUserTie size={14} />
              Cargo
            </Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="psychologist">Psicólogo</option>
              <option value="psychiatrist">Psiquiatra</option>
              <option value="monitor">Monitor</option>
              <option value="coordinator">Coordenador</option>
            </Select>
          </InputGroup>

          {(formData.role === 'psychologist' || formData.role === 'psychiatrist') && (
            <InputGroup>
              <Label htmlFor="specialization">
                <FaBriefcaseMedical size={14} />
                Especialização
              </Label>
              <Input
                id="specialization"
                name="specialization"
                type="text"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Sua especialização"
                disabled={loading}
              />
            </InputGroup>
          )}

          {(formData.role === 'psychologist' || formData.role === 'psychiatrist') && (
            <InputGroup>
              <Label htmlFor="licenseNumber">
                <FaIdCard size={14} />
                Número do Registro
              </Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Número do CRP/CRM"
                disabled={loading}
              />
            </InputGroup>
          )}

          <InputGroup>
            <Label htmlFor="password">
              <FaLock size={14} />
              Senha
            </Label>
            <PasswordInput>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading}
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </PasswordToggle>
            </PasswordInput>
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">
              <FaLock size={14} />
              Confirmar Senha
            </Label>
            <PasswordInput>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
                required
                disabled={loading}
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </PasswordToggle>
            </PasswordInput>
          </InputGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner $small />
                Cadastrando...
              </>
            ) : (
              <>
                <FaUser size={16} />
                Criar Conta
              </>
            )}
          </RegisterButton>
        </Form>

        <Footer>
          <LoginLink href="/login">
            Já tem uma conta? Faça login
          </LoginLink>
          
          <HelpSection>
            <HelpText>Problemas com o cadastro?</HelpText>
            <ContactLink href="mailto:suporte@nexus.com">
              Entre em contato com o suporte
            </ContactLink>
          </HelpSection>
        </Footer>
      </RegisterCard>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0A3D62 0%, #8360C3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

const InputGroup = styled.div`
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

const Input = styled.input`
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  width: 100%;
  background: white;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
  }
`;

const PasswordInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f1f5f9;
  }
`;

const RegisterButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  border: none;
  color: white;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
`;

const Footer = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoginLink = styled(Link)`
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #6366f1;
  }
`;

const HelpSection = styled.div`
  text-align: center;
`;

const HelpText = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 4px 0;
`;

const ContactLink = styled(Link)`
  color: #6366f1;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;