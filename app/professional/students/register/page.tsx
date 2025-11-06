// app/professional/students/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaSave,
  FaUser,
  FaSchool,
  FaIdCard,
  FaPhone,
  FaMapMarkerAlt,
  FaStethoscope,
  FaLock,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { studentsService } from '@/lib/firebase/services/studentsService';
import { Student } from '@/types';

export default function RegisterStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Dados básicos
    name: '',
    email: '',
    password: '', // 🔥 NOVO CAMPO

    // Informações pessoais
    personalInfo: {
      cpf: '',
      birthday: '',
      parentName: '',
      phone: '',
      school: '',
      grade: '',
      origin: 'fracta' as 'fracta' | 'particular'
    },

    // Informações médicas (opcionais)
    medicalInfo: {
      diagnoses: [] as string[],
      medications: [] as string[],
      observations: ''
    },

    // Endereço (opcional)
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: ''
    }
  });

  const [currentDiagnosis, setCurrentDiagnosis] = useState('');
  const [currentMedication, setCurrentMedication] = useState('');

  const handleInputChange = (path: string, value: any) => {
    const paths = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < paths.length - 1; i++) {
        current = current[paths[i]];
      }

      current[paths[paths.length - 1]] = value;
      return newData;
    });
  };

  const addDiagnosis = () => {
    if (currentDiagnosis.trim()) {
      handleInputChange('medicalInfo.diagnoses', [...formData.medicalInfo.diagnoses, currentDiagnosis.trim()]);
      setCurrentDiagnosis('');
    }
  };

  const removeDiagnosis = (index: number) => {
    const newDiagnoses = formData.medicalInfo.diagnoses.filter((_, i) => i !== index);
    handleInputChange('medicalInfo.diagnoses', newDiagnoses);
  };

  const addMedication = () => {
    if (currentMedication.trim()) {
      handleInputChange('medicalInfo.medications', [...formData.medicalInfo.medications, currentMedication.trim()]);
      setCurrentMedication('');
    }
  };

  const removeMedication = (index: number) => {
    const newMedications = formData.medicalInfo.medications.filter((_, i) => i !== index);
    handleInputChange('medicalInfo.medications', newMedications);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user?.id) return;

  setIsSubmitting(true);
  try {
    console.log('Dados do formulário:', formData);
    
    const studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      email: formData.email,
      role: 'student',
      personalInfo: formData.personalInfo,
      medicalInfo: formData.medicalInfo.diagnoses.length > 0 || formData.medicalInfo.medications.length > 0 || formData.medicalInfo.observations ? formData.medicalInfo : undefined,
      address: formData.address.street ? formData.address : undefined,
      assignedProfessionals: [user.id],
      assignedPrograms: [],
      streak: 0,
      totalPoints: 0,
      level: 1,
      isActive: true
    };

    console.log('Enviando para studentsService...');
    
    // 🔥 AGORA PRECISAMOS PASSAR AS CREDENCIAIS DO PROFISSIONAL
    // Em um cenário real, você teria essas credenciais salvas de forma segura
    // Para MVP, vamos pedir ao usuário para informar a senha atual
    const professionalPassword = prompt(
      'Para criar o aluno, confirme sua senha atual:'
    );

    if (!professionalPassword) {
      alert('Operação cancelada. A senha é necessária para criar o aluno.');
      return;
    }

    const result = await studentsService.createStudent(
      studentData, 
      formData.password,
      user.email, // email do profissional
      professionalPassword // senha do profissional
    );
    
    console.log('Aluno criado com sucesso:', result);
    
    alert(`Aluno cadastrado com sucesso!\n\nEmail: ${formData.email}\nSenha: ${formData.password}\n\nCompartilhe estas credenciais com o aluno.`);
    
    router.push('/professional/students');
  } catch (error: any) {
    console.error('Erro ao cadastrar aluno:', error);
    alert(`Erro ao cadastrar aluno: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  return (
    <Container>
      <Header>
        <BackButton href="/professional/students">
          <FaArrowLeft size={16} />
          Voltar para Alunos
        </BackButton>

        <TitleSection>
          <Title>Cadastrar Novo Aluno</Title>
          <Subtitle>Preencha as informações do aluno abaixo</Subtitle>
        </TitleSection>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGrid>
          {/* Dados Básicos */}
          <FormSection>
            <SectionTitle>
              <FaUser size={18} />
              Dados Básicos
            </SectionTitle>

            <InputGroup>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo do aluno"
                required
              />
            </InputGroup>

            <InputRow>
              <InputGroup>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="aluno@escola.com"
                  required
                />
              </InputGroup>

              {/* 🔥 NOVO CAMPO DE SENHA */}
              <InputGroup>
                <Label htmlFor="password">
                  <FaLock size={14} />
                  Senha *
                </Label>
                <PasswordInputContainer>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Crie uma senha para o aluno"
                    required
                    minLength={6}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </PasswordToggle>
                </PasswordInputContainer>
                <span>Mínimo 6 caracteres</span>
              </InputGroup>
            </InputRow>
          </FormSection>

          {/* Informações Pessoais */}
          <FormSection>
            <SectionTitle>
              <FaIdCard size={18} />
              Informações Pessoais
            </SectionTitle>

            <InputRow>
              <InputGroup>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  type="text"
                  value={formData.personalInfo.cpf}
                  onChange={(e) => handleInputChange('personalInfo.cpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="birthday">Data de Nascimento *</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.personalInfo.birthday}
                  onChange={(e) => handleInputChange('personalInfo.birthday', e.target.value)}
                  required
                />
              </InputGroup>
            </InputRow>

            <InputGroup>
              <Label htmlFor="parentName">Nome do Responsável *</Label>
              <Input
                id="parentName"
                type="text"
                value={formData.personalInfo.parentName}
                onChange={(e) => handleInputChange('personalInfo.parentName', e.target.value)}
                placeholder="Nome do pai, mãe ou responsável"
                required
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="text"
                value={formData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo.phone', formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </InputGroup>

            <InputRow>
              <InputGroup>
                <Label htmlFor="school">Escola *</Label>
                <Input
                  id="school"
                  type="text"
                  value={formData.personalInfo.school}
                  onChange={(e) => handleInputChange('personalInfo.school', e.target.value)}
                  placeholder="Nome da escola"
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="grade">Série/Ano *</Label>
                <Input
                  id="grade"
                  type="text"
                  value={formData.personalInfo.grade}
                  onChange={(e) => handleInputChange('personalInfo.grade', e.target.value)}
                  placeholder="9º Ano, 1º Colegial, etc."
                  required
                />
              </InputGroup>
            </InputRow>

            <InputGroup>
              <Label htmlFor="origin">Origem *</Label>
              <Select
                id="origin"
                value={formData.personalInfo.origin}
                onChange={(e) => handleInputChange('personalInfo.origin', e.target.value)}
                required
              >
                <option value="fracta">Fracta</option>
                <option value="particular">Particular</option>
              </Select>
            </InputGroup>
          </FormSection>

          {/* Informações Médicas */}
          <FormSection>
            <SectionTitle>
              <FaStethoscope size={18} />
              Informações Médicas (Opcional)
            </SectionTitle>

            <InputGroup>
              <Label>Diagnósticos</Label>
              <TagInputContainer>
                <TagInput
                  type="text"
                  value={currentDiagnosis}
                  onChange={(e) => setCurrentDiagnosis(e.target.value)}
                  placeholder="Digite um diagnóstico e pressione Enter"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDiagnosis())}
                />
                <AddButton type="button" onClick={addDiagnosis}>
                  Adicionar
                </AddButton>
              </TagInputContainer>
              <TagsContainer>
                {formData.medicalInfo.diagnoses.map((diagnosis, index) => (
                  <Tag key={index}>
                    {diagnosis}
                    <RemoveTag type="button" onClick={() => removeDiagnosis(index)}>
                      ×
                    </RemoveTag>
                  </Tag>
                ))}
              </TagsContainer>
            </InputGroup>

            <InputGroup>
              <Label>Medicações</Label>
              <TagInputContainer>
                <TagInput
                  type="text"
                  value={currentMedication}
                  onChange={(e) => setCurrentMedication(e.target.value)}
                  placeholder="Digite uma medicação e pressione Enter"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                />
                <AddButton type="button" onClick={addMedication}>
                  Adicionar
                </AddButton>
              </TagInputContainer>
              <TagsContainer>
                {formData.medicalInfo.medications.map((medication, index) => (
                  <Tag key={index}>
                    {medication}
                    <RemoveTag type="button" onClick={() => removeMedication(index)}>
                      ×
                    </RemoveTag>
                  </Tag>
                ))}
              </TagsContainer>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="observations">Observações Médicas</Label>
              <Textarea
                id="observations"
                value={formData.medicalInfo.observations}
                onChange={(e) => handleInputChange('medicalInfo.observations', e.target.value)}
                placeholder="Observações importantes sobre a saúde do aluno..."
                rows={3}
              />
            </InputGroup>
          </FormSection>

          {/* Endereço */}
          <FormSection>
            <SectionTitle>
              <FaMapMarkerAlt size={18} />
              Endereço (Opcional)
            </SectionTitle>

            <InputGroup>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', formatCEP(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
              />
            </InputGroup>

            <InputRow>
              <InputGroup>
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Nome da rua"
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  type="text"
                  value={formData.address.number}
                  onChange={(e) => handleInputChange('address.number', e.target.value)}
                  placeholder="123"
                />
              </InputGroup>
            </InputRow>

            <InputGroup>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                type="text"
                value={formData.address.complement}
                onChange={(e) => handleInputChange('address.complement', e.target.value)}
                placeholder="Apartamento, bloco, etc."
              />
            </InputGroup>

            <InputRow>
              <InputGroup>
                <Label htmlFor="district">Bairro</Label>
                <Input
                  id="district"
                  type="text"
                  value={formData.address.district}
                  onChange={(e) => handleInputChange('address.district', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Nome da cidade"
                />
              </InputGroup>
            </InputRow>

            <InputGroup>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                type="text"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </InputGroup>
          </FormSection>
        </FormGrid>

        <SubmitActions>
          <CancelButton href="/professional/students" type="button">
            Cancelar
          </CancelButton>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner $small />
                Cadastrando...
              </>
            ) : (
              <>
                <FaSave size={16} />
                Cadastrar Aluno
              </>
            )}
          </SubmitButton>
        </SubmitActions>
      </Form>
    </Container>
  );
}

// ESTILOS (adicionar ao final do arquivo)
const Container = styled.div`
  padding: 32px;
  background: #f8fafc;
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const TitleSection = styled.div`
  flex: 1;
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
`;

const Form = styled.form`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  background: white;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TagInputContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const TagInput = styled(Input)`
  flex: 1;
`;

const AddButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #4f46e5;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveTag = styled.button`
  background: none;
  border: none;
  color: #0369a1;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;

  &:hover {
    background: #bae6fd;
  }
`;

const SubmitActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
  margin-top: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled(Link)`
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    background: #f1f5f9;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 160px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;