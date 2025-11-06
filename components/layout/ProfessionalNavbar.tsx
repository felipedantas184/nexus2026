'use client';

import { FaBars, FaSignOutAlt, FaUser, FaBell, FaHome } from 'react-icons/fa';
import Image from 'next/image';
import styled from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // CORRIGIDO: next/navigation em vez de next/router
import { Professional } from '@/types';

interface ProfessionalNavbarProps {
  toggle: () => void;
  user: Professional;
}

export default function ProfessionalNavbar({ toggle, user }: ProfessionalNavbarProps) {
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
      psychologist: 'Psicólogo',
      psychiatrist: 'Psiquiatra',
      monitor: 'Monitor',
      coordinator: 'Coordenador'
    };
    return labels[role] || 'Profissional';
  };

  return (
    <Container>
      <Wrapper>
        <LeftSection>
          <MenuButton onClick={toggle}>
            <FaBars size={20} />
          </MenuButton>
          <Logo href="/professional/dashboard">
            <Image 
              src="/assets/nexus_logo.png" 
              alt="Nexus Logo" 
              width={120}
              height={36}
              style={{ objectFit: 'contain' }}
            />
          </Logo>
          <PlatformTag>Área Profissional</PlatformTag>
        </LeftSection>
        
        <RightSection>
          <NavActions>
            <NavButton href="/professional/dashboard" title="Dashboard">
              <FaHome size={16} />
            </NavButton>
            <NotificationButton title="Notificações">
              <FaBell size={16} />
              <NotificationBadge>3</NotificationBadge>
            </NotificationButton>
            <UserMenu>
              <UserAvatar>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </UserAvatar>
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserRole>{getRoleLabel(user.role)}</UserRole>
              </UserInfo>
            </UserMenu>
            <LogoutButton onClick={handleLogout} title="Sair">
              <FaSignOutAlt size={16} />
            </LogoutButton>
          </NavActions>
        </RightSection>
      </Wrapper>
    </Container>
  );
}

const Container = styled.header`
  background: linear-gradient(135deg, #0A3D62 0%, #6366f1 100%);
  height: 70px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MenuButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const Logo = styled(Link)`
  text-decoration: none;
  cursor: pointer;
`;

const PlatformTag = styled.div`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const NavButton = styled(Link)`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const NotificationButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 14px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

const LogoutButton = styled.button`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: translateY(-1px);
  }
`;