'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';

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
  FaUserGraduate
} from 'react-icons/fa';

import { createStudent } from '@/lib/firebase/authService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await createStudent(formData);

      alert('Aluno cadastrado com sucesso!');
      router.push('/student-login');
    } catch (error: any) {
      console.error('Erro no cadastro do aluno:', error);
      setError(error.message || 'Erro ao cadastrar aluno. Tente novamente.');
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
          <Title>Cadastro de Aluno</Title>
          <Subtitle>Insira os dados do aluno abaixo</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label><FaUser size={14} /> Nome Completo</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do aluno"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label><FaEnvelope size={14} /> Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label><FaLock size={14} /> Senha</Label>
            <PasswordInput>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </PasswordInput>
          </InputGroup>

          <InputGroup>
            <Label><FaLock size={14} /> Confirmar Senha</Label>
            <PasswordInput>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Digite novamente"
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </PasswordInput>
          </InputGroup>

          <InputGroup>
            <Label><FaIdCard size={14} /> CPF</Label>
            <Input
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label><FaBirthdayCake size={14} /> Data de Nascimento</Label>
            <Input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label><FaPhone size={14} /> Telefone</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </InputGroup>

          <InputGroup>
            <Label><FaSchool size={14} /> Escola</Label>
            <Input
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Nome da escola"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label><FaUserGraduate size={14} /> Série</Label>
            <Input
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="Ex: 1º ano, 2º ano ..."
              required
            />
          </InputGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner $small />
                Cadastrando...
              </>
            ) : (
              <>
                <FaUser size={16} /> Cadastrar Aluno
              </>
            )}
          </RegisterButton>

        </Form>

        <Footer>
          <LoginLink href="/login">Já possui uma conta? Faça login</LoginLink>
        </Footer>
      </RegisterCard>
    </Container>
  );
}

/* -------------------- STYLES -------------------- */

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
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
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
  color: #0f172a;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin-top: 6px;
  font-size: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 14px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: .2s;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    outline: none;
  }
`;

const PasswordInput = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
`;

const RegisterButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  margin-top: 24px;
  text-align: center;
`;

const LoginLink = styled(Link)`
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
