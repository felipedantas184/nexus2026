// app/professional/programs/create/page.tsx - ATUALIZADO
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaSave, 
  FaPlus, 
  FaTrash,
  FaPalette,
  FaSpinner
} from 'react-icons/fa';
import { Program, ProgramVisibility } from '@/types';
import { usePrograms } from '@/hooks/usePrograms';

// Dados de configuração
const availableIcons = ['📊', '📚', '💪', '🧠', '❤️', '🎯', '⭐', '🚀', '🎨', '🔬'];
const availableColors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

export default function CreateProgramPage() {
  const router = useRouter();
  const { createProgram, loading: creating } = usePrograms();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: availableColors[0],
    icon: availableIcons[0],
    tags: [] as string[],
    estimatedDuration: 60,
    visibility: 'private' as ProgramVisibility,
    status: 'draft' as 'draft' | 'active'
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState('');

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.title.trim()) {
      setError('O título do programa é obrigatório.');
      return;
    }

    if (formData.estimatedDuration < 1) {
      setError('A duração estimada deve ser maior que 0 minutos.');
      return;
    }

    try {
      console.log('Criando programa com dados:', formData);
      
      // Criar programa no Firebase
      const programId = await createProgram({
        title: formData.title.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
        tags: formData.tags,
        estimatedDuration: formData.estimatedDuration,
        visibility: formData.visibility,
        status: formData.status,
        createdBy: '', // Será preenchido pelo hook
        modules: [],
        assignedStudents: []
      });

      console.log('Programa criado com ID:', programId);
      
      // Redirecionar para a página de edição do programa
      router.push(`/professional/programs/${programId}`);
      
    } catch (error: any) {
      console.error('Erro ao criar programa:', error);
      setError(error.message || 'Erro ao criar programa. Tente novamente.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Container>
      <Header>
        <BackButton href="/professional/programs">
          <FaArrowLeft size={16} />
          Voltar para Programas
        </BackButton>
        
        <TitleSection>
          <Title>Criar Novo Programa</Title>
          <Subtitle>Preencha as informações básicas do programa</Subtitle>
        </TitleSection>
      </Header>

      <Form onSubmit={handleSubmit}>
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <FormGrid>
          <FormSection>
            <SectionTitle>Informações Básicas</SectionTitle>
            
            <InputGroup>
              <Label htmlFor="title">
                Título do Programa *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Matemática Básica, Hábitos Saudáveis..."
                required
                disabled={creating}
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="description">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o objetivo e conteúdo do programa..."
                rows={4}
                disabled={creating}
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="estimatedDuration">
                Duração Estimada (minutos) *
              </Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimatedDuration: parseInt(e.target.value) || 0 
                }))}
                min="1"
                required
                disabled={creating}
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="status">
                Status Inicial
              </Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as 'draft' | 'active' 
                }))}
                disabled={creating}
              >
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
              </Select>
            </InputGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>Personalização</SectionTitle>
            
            <InputGroup>
              <Label>
                Cor do Programa
              </Label>
              <ColorGrid>
                {availableColors.map((color) => (
                  <ColorOption
                    key={color}
                    $color={color}
                    $selected={formData.color === color}
                    onClick={() => !creating && setFormData(prev => ({ ...prev, color }))}
                    $disabled={creating}
                  >
                    {formData.color === color && <FaPalette size={12} />}
                  </ColorOption>
                ))}
              </ColorGrid>
            </InputGroup>

            <InputGroup>
              <Label>
                Ícone
              </Label>
              <IconGrid>
                {availableIcons.map((icon) => (
                  <IconOption
                    key={icon}
                    $selected={formData.icon === icon}
                    onClick={() => !creating && setFormData(prev => ({ ...prev, icon }))}
                    $disabled={creating}
                  >
                    {icon}
                  </IconOption>
                ))}
              </IconGrid>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="visibility">
                Visibilidade
              </Label>
              <Select
                id="visibility"
                value={formData.visibility}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  visibility: e.target.value as ProgramVisibility 
                }))}
                disabled={creating}
              >
                <option value="private">Privado (apenas eu)</option>
                <option value="shared">Compartilhado (todos os profissionais)</option>
              </Select>
              <HelpText>
                Programas compartilhados podem ser visualizados por outros profissionais
              </HelpText>
            </InputGroup>
          </FormSection>
        </FormGrid>

        <FormSection>
          <SectionTitle>Tags e Categorias</SectionTitle>
          <InputGroup>
            <Label>
              Adicionar Tags
            </Label>
            <TagInputGroup>
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma tag e pressione Enter..."
                disabled={creating}
              />
              <AddTagButton 
                type="button" 
                onClick={handleAddTag}
                disabled={creating || !currentTag.trim()}
              >
                <FaPlus size={14} />
              </AddTagButton>
            </TagInputGroup>
            
            <TagsContainer>
              {formData.tags.map((tag, index) => (
                <Tag key={index}>
                  #{tag}
                  <RemoveTagButton 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    disabled={creating}
                  >
                    <FaTrash size={10} />
                  </RemoveTagButton>
                </Tag>
              ))}
              
              {formData.tags.length === 0 && (
                <EmptyTags>
                  Nenhuma tag adicionada. As tags ajudam na organização e busca.
                </EmptyTags>
              )}
            </TagsContainer>
          </InputGroup>
        </FormSection>

        <FormActions>
          <CancelButton 
            href="/professional/programs" 
            type="button"
            $disabled={creating}
          >
            Cancelar
          </CancelButton>
          <SubmitButton 
            type="submit" 
            disabled={creating || !formData.title.trim()}
          >
            {creating ? (
              <>
                <FaSpinner className="spinner" size={16} />
                Criando Programa...
              </>
            ) : (
              <>
                <FaSave size={16} />
                Criar Programa
              </>
            )}
          </SubmitButton>
        </FormActions>
      </Form>
    </Container>
  );
}

// Estilos atualizados com estados de loading
const Container = styled.div`
  padding: 32px;
  background: #f8fafc;
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const BackButton = styled(Link)<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$disabled ? '#94a3b8' : '#64748b'};
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  pointer-events: ${props => props.$disabled ? 'none' : 'all'};

  &:hover {
    background: ${props => props.$disabled ? 'transparent' : '#f1f5f9'};
    color: ${props => props.$disabled ? '#94a3b8' : '#374151'};
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
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

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
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
`;

const Input = styled.input<{ disabled?: boolean }>`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  background: ${props => props.disabled ? '#f8fafc' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    color: #94a3b8;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Textarea = styled.textarea<{ disabled?: boolean }>`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  resize: vertical;
  font-family: inherit;
  min-height: 80px;
  background: ${props => props.disabled ? '#f8fafc' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    color: #94a3b8;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select<{ disabled?: boolean }>`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  background: ${props => props.disabled ? '#f8fafc' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    color: #94a3b8;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const ColorOption = styled.button<{ $color: string; $selected: boolean; $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color};
  border: 3px solid ${props => props.$selected ? props.$color : 'transparent'};
  outline: ${props => props.$selected ? `2px solid ${props.$color}40` : 'none'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};

  &:hover {
    transform: ${props => props.$disabled ? 'none' : 'scale(1.1)'};
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`;

const IconOption = styled.button<{ $selected: boolean; $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$selected ? '#6366f1' : '#f8fafc'};
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e2e8f0'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};

  &:hover {
    transform: ${props => props.$disabled ? 'none' : 'scale(1.1)'};
    border-color: ${props => props.$disabled ? '#e2e8f0' : '#6366f1'};
  }
`;

const HelpText = styled.span`
  font-size: 12px;
  color: #64748b;
  font-style: italic;
`;

const TagInputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const AddTagButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : '#6366f1'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: #4f46e5;
    transform: scale(1.05);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  min-height: 40px;
  align-items: flex-start;
`;

const Tag = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveTagButton = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  color: #64748b;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: #e2e8f0;
    color: #ef4444;
  }
`;

const EmptyTags = styled.span`
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 32px;
  border-top: 2px solid #f1f5f9;
`;

const CancelButton = styled(Link)<{ $disabled?: boolean }>`
  background: #f8fafc;
  color: ${props => props.$disabled ? '#94a3b8' : '#374151'};
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  pointer-events: ${props => props.$disabled ? 'none' : 'all'};

  &:hover {
    background: ${props => props.$disabled ? '#f8fafc' : '#f1f5f9'};
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;