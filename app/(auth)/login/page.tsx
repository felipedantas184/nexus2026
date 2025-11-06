'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
        setError('Profissional não encontrado.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Senha incorreta.');
      } else if (error.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Credenciais inválidas.');
      } else {
        setError(`Erro ao fazer login: ${error.message}`);
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
      <LoginCard>
        <Header>
          <Logo>
            <FaUser size={32} />
          </Logo>
          <Title>Acesso Profissional</Title>
          <Subtitle>Entre com suas credenciais de acesso</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label htmlFor="email">
              <FaUser size={14} />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu.email@profissional.com"
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
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
                placeholder="Sua senha"
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

          <LoginButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner $small />
                Entrando...
              </>
            ) : (
              <>
                <FaLock size={16} />
                Acessar Plataforma
              </>
            )}
          </LoginButton>
        </Form>

        <Footer>
          <StudentAccessLink href="/student-login">
            <FaUserGraduate size={14} />
            Sou Aluno
          </StudentAccessLink>

          <RegisterLink href="/register">
            <FaUser size={14} />
            Criar conta profissional
          </RegisterLink>

          <HelpSection>
            <HelpText>Problemas com acesso?</HelpText>
            <ContactLink href="mailto:suporte@nexus.com">
              Entre em contato com o suporte
            </ContactLink>
          </HelpSection>
        </Footer>
      </LoginCard>
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

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
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
  gap: 24px;
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

const LoginButton = styled.button<{ disabled: boolean }>`
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

const StudentAccessLink = styled(Link)`
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
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
const RegisterLink = styled(Link)`
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
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