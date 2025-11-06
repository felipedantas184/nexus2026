'use client'

import { ReactNode } from 'react';
import styled from 'styled-components';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthContainer>
      {children}
      
      {/* Background Elements */}
      <BackgroundBlob1 />
      <BackgroundBlob2 />
      
      <Footer>
        <FooterText>Nexus Platform • 2024</FooterText>
      </Footer>
    </AuthContainer>
  );
}

const AuthContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0A3D62 0%, #8360C3 100%);
  position: relative;
  overflow: hidden;
`;

const BackgroundBlob1 = styled.div`
  position: absolute;
  top: -10%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(80px);
  animation: float 6s ease-in-out infinite;
  z-index: -2;

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
`;

const BackgroundBlob2 = styled.div`
  position: absolute;
  bottom: -10%;
  left: -10%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  filter: blur(60px);
  animation: float 8s ease-in-out infinite reverse;

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(180deg); }
  }
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
`;