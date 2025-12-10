'use client';

import { useState, useEffect, JSX } from 'react';
import { 
  FaBars, 
  FaSignOutAlt, 
  FaUser, 
  FaChevronDown,
  FaBrain,
} from 'react-icons/fa';
import { 
  FaUserGear,
  FaHeadset,
  FaUserDoctor,
  FaStethoscope
} from 'react-icons/fa6';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Professional } from '@/types';

interface ProfessionalNavbarProps {
  toggle: () => void;
  user: Professional;
  sidebarCollapsed?: boolean;
}

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

export default function ProfessionalNavbar({ toggle, user, sidebarCollapsed = false }: ProfessionalNavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      psychologist: 'Psicólogo(a)',
      psychiatrist: 'Psiquiatra',
      monitor: 'Monitor(a)',
      coordinator: 'Coordenador(a)'
    };
    return labels[role] || 'Profissional';
  };

  const getRoleIcon = (role: string) => {
    const icons: { [key: string]: JSX.Element } = {
      psychologist: <FaUserDoctor size={14} />,
      psychiatrist: <FaStethoscope size={14} />,
      monitor: <FaHeadset size={14} />,
      coordinator: <FaUserGear size={14} />
    };
    return icons[role] || <FaUser size={14} />;
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      psychologist: '#8b5cf6',
      psychiatrist: '#10b981',
      monitor: '#f59e0b',
      coordinator: '#6366f1'
    };
    return colors[role] || '#64748b';
  };

  return (
    <Container>
      <Wrapper>
        {/* Seção Esquerda */}
        <LeftSection>
          <MenuButton onClick={toggle} title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}>
            <FaBars size={20} />
          </MenuButton>
          
          <Logo href="/professional/dashboard">
            <LogoIcon>
              <FaBrain size={24} color="#a5b4fc" />
            </LogoIcon>
            <LogoText>
              <span>Nexus</span>
              <span className="gradient">Platform</span>
            </LogoText>
          </Logo>
          
          <PlatformTag $color={getRoleColor(user.role)}>
            {getRoleIcon(user.role)}
            <span>{getRoleLabel(user.role)}</span>
          </PlatformTag>
        </LeftSection>

        {/* Seção Direita */}
        <RightSection>
          <NavActions>
            {/* Menu do Usuário */}
            <UserMenuWrapper>
              <UserMenuButton>
                <UserAvatar $color={getRoleColor(user.role)}>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </UserAvatar>
                <UserInfo>
                  <UserName>{user.name.split(' ')[0]}</UserName>
                  <UserRole>
                    {getRoleLabel(user.role)}
                    <FaChevronDown size={10} style={{ marginLeft: '4px' }} />
                  </UserRole>
                </UserInfo>
              </UserMenuButton>
            </UserMenuWrapper>

            <LogoutButton onClick={handleLogout} title="Sair">
              <FaSignOutAlt size={16} />
            </LogoutButton>
          </NavActions>
        </RightSection>
      </Wrapper>
    </Container>
  );
}

// ========== STYLED COMPONENTS ==========
const Container = styled.header`
  background: linear-gradient(180deg, #0A3D62 0%, #1E4D76 100%);
  height: 64px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 50;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 1024px) {
    padding: 0 16px;
    gap: 16px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const MenuButton = styled.button`
  background: #f8fafc15;
  border: none;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #475569;
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const Logo = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const LogoText = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  line-height: 1;
  
  .gradient {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const PlatformTag = styled.div<{ $color: string }>`
  background: ${props => `${props.$color}15`};
  color: #f8fafc;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${props => `${props.$color}30`};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${props => `${props.$color}20`};
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NavButton = styled(Link)<{ $active: boolean }>`
  background: ${props => props.$active ? '#f1f5f9' : 'transparent'};
  border: none;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  color: ${props => props.$active ? '#6366f1' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  
  &:hover {
    background: #f1f5f9;
    color: #475569;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: ${props => props.$active ? '20px' : '0'};
    height: 3px;
    background: #6366f1;
    border-radius: 2px;
    transition: width 0.2s ease;
  }
`;

const LogoutButton = styled.button`
  background: #6366f1;
  border: 1px solid #6366f1;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: #f1f2f3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: translateY(-1px);
  }
`;

const UserMenuWrapper = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${props => props.$color}, ${props => `${props.$color}80`});
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 12px ${props => `${props.$color}40`};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: #f8fafc;
  display: flex;
  align-items: center;
`;