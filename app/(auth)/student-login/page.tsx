'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { FaUserGraduate, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function StudentLogin() {
  const router = useRouter();
  const { studentLogin, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 🔥 AGORA USA EMAIL/SENHA
      await studentLogin(credentials.email, credentials.password);
    } catch (error: any) {
      setError(error.message);
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
      <LoginCard>
        <Header>
          <Logo>
            <FaUserGraduate size={32} />
          </Logo>
          <Title>Área do Aluno</Title>
          {/* 🔥 ATUALIZAR SUBTITLE */}
          <Subtitle>Entre com email e senha</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {/* 🔥 TROCAR CPF POR EMAIL */}
          <InputGroup>
            <Label htmlFor="email">
              <FaEnvelope size={14} />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="seu.email@escola.com"
              required
              disabled={loading}
            />
          </InputGroup>

          {/* 🔥 TROCAR DATA NASCIMENTO POR SENHA */}
          <InputGroup>
            <Label htmlFor="password">
              <FaLock size={14} />
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
              disabled={loading}
            />
            {/* 🔥 ATUALIZAR TEXTO DE AJUDA */}
            <HelpText>
              Use o email e senha fornecidos pelo seu professor
            </HelpText>
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
                Entrar na Minha Área
              </>
            )}
          </LoginButton>
        </Form>

        <Footer>
          <ProfessionalAccessLink href="/login">
            <FaArrowLeft size={14} />
            Sou Professor/Profissional
          </ProfessionalAccessLink>

          <HelpSection>
            <HelpTitle>Primeiro acesso?</HelpTitle>
            {/* 🔥 ATUALIZAR TEXTO DE AJUDA */}
            <HelpText>
              Use o email e senha fornecidos pelo seu professor.
              Entre em contato caso tenha problemas.
            </HelpText>
          </HelpSection>
        </Footer>
      </LoginCard>
    </Container>
  );
}

// Reutilizamos os mesmos estilos com pequenas adaptações
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
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const HelpText = styled.span`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`;

const LoginButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
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
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  }
`;

const Footer = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProfessionalAccessLink = styled(Link)`
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

const HelpTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;