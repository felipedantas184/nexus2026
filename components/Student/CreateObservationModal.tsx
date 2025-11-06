'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Student, ObservationType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { FaTimes, FaUser, FaStar, FaBrain, FaUsers, FaSmile, FaChartLine } from 'react-icons/fa';

interface CreateObservationModalProps {
  student: Student;
  onSubmit: (data: {
    text: string;
    authorType: ObservationType;
    isPrivate: boolean;
    tags: string[];
    formData?: {
      energyLevel?: string;
      attentionLevel?: string;
      participation?: string;
      mood?: string;
      behavior?: string;
      academicPerformance?: string;
    };
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function CreateObservationModal({
  student,
  onSubmit,
  onCancel,
  isSubmitting
}: CreateObservationModalProps) {
  const { user } = useAuth();

  // Tipo de observação automático baseado no role do profissional
  const getAutoObservationType = (): ObservationType => {
    switch (user?.role) {
      case 'psychologist':
        return 'psychologist';
      case 'psychiatrist':
        return 'psychiatrist';
      case 'monitor':
        return 'monitor';
      case 'coordinator':
        return 'general';
      default:
        return 'general';
    }
  };

  const authorType = getAutoObservationType();

  const [text, setText] = useState('');

  // Campos do formulário estruturado - TODOS OBRIGATÓRIOS
  const [formData, setFormData] = useState({
    energyLevel: '',
    attentionLevel: '',
    participation: '',
    mood: '',
    behavior: '',
    academicPerformance: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert('Por favor, escreva a observação.');
      return;
    }

    // Verificar se todos os campos de avaliação estão preenchidos
    const missingFields = Object.entries(formData)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      alert(`Por favor, preencha todos os campos de avaliação: ${missingFields.join(', ')}`);
      return;
    }

    const submissionData = {
      text: text.trim(),
      authorType,
      isPrivate: false, // padrão: visível a todos
      tags: [],         // você pode mudar depois se quiser suportar tags
      formData,
    };

    onSubmit(submissionData);
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      psychologist: 'Psicólogo',
      psychiatrist: 'Psiquiatra',
      monitor: 'Monitor',
      coordinator: 'Coordenador',
      general: 'Profissional'
    };
    return labels[role] || role;
  };

  const getObservationTypeLabel = (type: ObservationType) => {
    const labels: { [key: string]: string } = {
      psychologist: 'Observação Psicológica',
      psychiatrist: 'Observação Psiquiátrica',
      monitor: 'Observação de Monitoria',
      general: 'Observação Geral'
    };
    return labels[type] || 'Observação';
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <HeaderInfo>
            <ModalTitle>Nova Observação</ModalTitle>
            <StudentInfo>
              <FaUser size={12} />
              <strong>{student.name}</strong> • {student.personalInfo.school}
            </StudentInfo>
            <AuthorInfo>
              <AuthorDetail>
                <strong>{user?.name}</strong> • {getRoleLabel(user?.role || 'general')}
              </AuthorDetail>
            </AuthorInfo>
          </HeaderInfo>
          <CloseButton onClick={onCancel}>
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {/* Texto da Observação - PRIMEIRO CAMPO */}
          <FormGroup>
            <Label>Observação *</Label>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Descreva detalhadamente a observação sobre o aluno..."
              rows={5}
              required
            />
          </FormGroup>

          {/* Avaliação do Aluno - TODOS OS CAMPOS OBRIGATÓRIOS */}
          <EvaluationSection>
            <SectionTitle>
              <FaChartLine size={16} />
              Avaliação do Aluno *
            </SectionTitle>
            <SectionDescription>
              Preencha todos os campos abaixo para completar a avaliação
            </SectionDescription>

            <FormDataGrid>
              {/* Nível de Energia */}
              <FormGroup>
                <Label>
                  <FaStar size={12} />
                  Nível de Energia *
                </Label>
                <Select
                  value={formData.energyLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="very_high">🌟 Muito Alto</option>
                  <option value="high">⭐ Alto</option>
                  <option value="regular">⚡ Regular</option>
                  <option value="low">🔋 Baixo</option>
                  <option value="very_low">😴 Muito Baixo</option>
                </Select>
              </FormGroup>

              {/* Nível de Atenção */}
              <FormGroup>
                <Label>
                  <FaBrain size={12} />
                  Nível de Atenção *
                </Label>
                <Select
                  value={formData.attentionLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, attentionLevel: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="excellent">🎯 Excelente</option>
                  <option value="good">📝 Boa</option>
                  <option value="regular">📊 Regular</option>
                  <option value="low">🤔 Baixa</option>
                  <option value="very_low">😟 Muito Baixa</option>
                </Select>
              </FormGroup>

              {/* Participação */}
              <FormGroup>
                <Label>
                  <FaUsers size={12} />
                  Participação *
                </Label>
                <Select
                  value={formData.participation}
                  onChange={(e) => setFormData(prev => ({ ...prev, participation: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="very_active">🎤 Muito Ativa</option>
                  <option value="active">💬 Ativa</option>
                  <option value="moderate">👂 Moderada</option>
                  <option value="little_active">🤐 Pouco Ativa</option>
                  <option value="inactive">🙊 Inativa</option>
                </Select>
              </FormGroup>

              {/* Humor */}
              <FormGroup>
                <Label>
                  <FaSmile size={12} />
                  Humor *
                </Label>
                <Select
                  value={formData.mood}
                  onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="very_happy">😊 Muito Feliz</option>
                  <option value="happy">🙂 Feliz</option>
                  <option value="neutral">😐 Neutro</option>
                  <option value="sad">😞 Triste</option>
                  <option value="very_sad">😢 Muito Triste</option>
                  <option value="anxious">😰 Ansioso</option>
                  <option value="irritable">😠 Irritável</option>
                </Select>
              </FormGroup>

              {/* Comportamento */}
              <FormGroup>
                <Label>Comportamento *</Label>
                <Select
                  value={formData.behavior}
                  onChange={(e) => setFormData(prev => ({ ...prev, behavior: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="exemplary">🏆 Exemplar</option>
                  <option value="good">👍 Bom</option>
                  <option value="regular">👌 Regular</option>
                  <option value="problematic">⚠️ Problemático</option>
                  <option value="very_problematic">🚨 Muito Problemático</option>
                </Select>
              </FormGroup>

              {/* Desempenho Acadêmico */}
              <FormGroup>
                <Label>Desempenho Acadêmico *</Label>
                <Select
                  value={formData.academicPerformance}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicPerformance: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="excellent">💯 Excelente</option>
                  <option value="good">📈 Bom</option>
                  <option value="regular">📊 Regular</option>
                  <option value="below_expectations">📉 Abaixo do Esperado</option>
                  <option value="concerning">❗ Preocupante</option>
                </Select>
              </FormGroup>
            </FormDataGrid>
          </EvaluationSection>

          {/* Informação de Acesso */}
          <AccessInfo>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>
              <strong>Tipo de observação automático:</strong> Esta observação será registrada como <strong>{getObservationTypeLabel(authorType)}</strong> e ficará disponível para todos os profissionais responsáveis pelo aluno.
            </InfoText>
          </AccessInfo>

          {/* Ações */}
          <ActionButtons>
            <CancelButton type="button" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting || !text.trim()}>
              {isSubmitting ? 'Salvando...' : 'Salvar Observação'}
            </SubmitButton>
          </ActionButtons>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
}

// ========== ESTILOS ==========
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  gap: 16px;
`;

const HeaderInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AuthorDetail = styled.div`
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const ObservationTypeBadge = styled.div<{ $type: ObservationType }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${props => {
    switch (props.$type) {
      case 'psychologist': return '#dbeafe';
      case 'psychiatrist': return '#f3e8ff';
      case 'monitor': return '#dcfce7';
      default: return '#fef3c7';
    }
  }};
  
  color: ${props => {
    switch (props.$type) {
      case 'psychologist': return '#1e40af';
      case 'psychiatrist': return '#7e22ce';
      case 'monitor': return '#166534';
      default: return '#92400e';
    }
  }};
  
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'psychologist': return '#93c5fd';
      case 'psychiatrist': return '#d8b4fe';
      case 'monitor': return '#86efac';
      default: return '#fbbf24';
    }
  }};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const Form = styled.form`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Select = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:invalid {
    border-color: #ef4444;
  }
`;

const TextArea = styled.textarea`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const EvaluationSection = styled.div`
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  background: #f8fafc;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0 0 20px 0;
`;

const FormDataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const AccessInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  color: #1e40af;
`;

const InfoIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoText = styled.p`
  font-size: 14px;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const CancelButton = styled.button`
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #6366f1;
    color: #6366f1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
  }
`;