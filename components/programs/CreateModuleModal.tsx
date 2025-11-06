// components/programs/CreateModuleModal.tsx
'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSave, FaLock, FaUnlock } from 'react-icons/fa';

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: any) => void;
  programId: string;
  existingModules: any[];
}

export default function CreateModuleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  programId, 
  existingModules 
}: CreateModuleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: existingModules.length + 1,
    isLocked: false,
    unlockCondition: 'previous_completion' as 'previous_completion' | 'date' | 'manual',
    unlockDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const moduleData = {
        ...formData,
        programId,
        activities: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await onSave(moduleData);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      order: existingModules.length + 1,
      isLocked: false,
      unlockCondition: 'previous_completion',
      unlockDate: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Criar Novo Módulo</ModalTitle>
          <CloseButton onClick={handleClose}>
            <FaTimes size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="title">
              Título do Módulo *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Números e Operações, Hábitos Matinais..."
              required
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
              placeholder="Descreva o conteúdo e objetivos deste módulo..."
              rows={3}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="order">
              Ordem no Programa
            </Label>
            <Select
              id="order"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
            >
              {Array.from({ length: existingModules.length + 1 }, (_, i) => i + 1).map((order) => (
                <option key={order} value={order}>
                  Posição {order}
                </option>
              ))}
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>
              Configuração de Bloqueio
            </Label>
            <LockToggle>
              <LockOption 
                $active={!formData.isLocked}
                onClick={() => setFormData(prev => ({ ...prev, isLocked: false }))}
              >
                <FaUnlock size={16} />
                Disponível Imediatamente
              </LockOption>
              <LockOption 
                $active={formData.isLocked}
                onClick={() => setFormData(prev => ({ ...prev, isLocked: true }))}
              >
                <FaLock size={16} />
                Bloqueado Inicialmente
              </LockOption>
            </LockToggle>
          </InputGroup>

          {formData.isLocked && (
            <InputGroup>
              <Label htmlFor="unlockCondition">
                Condição de Desbloqueio
              </Label>
              <Select
                id="unlockCondition"
                value={formData.unlockCondition}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  unlockCondition: e.target.value as any 
                }))}
              >
                <option value="previous_completion">Conclusão do módulo anterior</option>
                <option value="date">Data específica</option>
                <option value="manual">Desbloqueio manual</option>
              </Select>
            </InputGroup>
          )}

          {formData.isLocked && formData.unlockCondition === 'date' && (
            <InputGroup>
              <Label htmlFor="unlockDate">
                Data de Desbloqueio
              </Label>
              <Input
                id="unlockDate"
                type="date"
                value={formData.unlockDate}
                onChange={(e) => setFormData(prev => ({ ...prev, unlockDate: e.target.value }))}
                required
              />
            </InputGroup>
          )}

          <FormActions>
            <CancelButton type="button" onClick={handleClose}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting || !formData.title}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner $small />
                  Criando...
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  Criar Módulo
                </>
              )}
            </SubmitButton>
          </FormActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}

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

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const Form = styled.form`
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  resize: vertical;
  font-family: inherit;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

const LockToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const LockOption = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#6366f1' : '#f8fafc'};
  color: ${props => props.$active ? 'white' : '#374151'};
  border: 2px solid ${props => props.$active ? '#6366f1' : '#e2e8f0'};
  border-radius: 8px;
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const CancelButton = styled.button`
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

import LoadingSpinner from '@/components/ui/LoadingSpinner';