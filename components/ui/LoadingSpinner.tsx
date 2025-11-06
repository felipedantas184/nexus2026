// components/ui/LoadingSpinner.tsx - CORRIGIDO
'use client';

import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  $small?: boolean; // Usando $ para evitar passar para DOM
  color?: string;
}

const LoadingSpinner = ({ $small = false, color = '#6366f1' }: LoadingSpinnerProps) => {
  return (
    <SpinnerContainer $small={$small}>
      <Spinner $small={$small} $color={color} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{ $small?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div<{ $small?: boolean; $color: string }>`
  border: ${props => props.$small ? '2px' : '3px'} solid #f3f4f6;
  border-top: ${props => props.$small ? '2px' : '3px'} solid ${props => props.$color};
  border-radius: 50%;
  width: ${props => props.$small ? '16px' : '20px'};
  height: ${props => props.$small ? '16px' : '20px'};
  animation: ${spin} 1s linear infinite;
`;