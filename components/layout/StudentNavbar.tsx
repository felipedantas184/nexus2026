'use client';

import { FaBars, FaSignOutAlt, FaUser, FaBell, FaHome, FaTrophy } from 'react-icons/fa';
import styled from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // CORRIGIDO
import { Student } from '@/types';
import { FaBrain } from 'react-icons/fa';

interface StudentNavbarProps {
  toggle: () => void;
  student: Student;
}

export default function StudentNavbar({ toggle, student }: StudentNavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/student-login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Container>
      <Wrapper>
        <LeftSection>
          <MenuButton onClick={toggle}>
            <FaBars size={20} />
          </MenuButton>
          <Logo href="/professional/dashboard">
            <LogoIcon>
              <FaBrain size={24} color="#a5b4fc" />
            </LogoIcon>
            <LogoText>
              <span>Nexus</span>
            </LogoText>
          </Logo>
          <PlatformTag>Área do Aluno</PlatformTag>
        </LeftSection>

        <RightSection>
          <NavActions>
            <PointsDisplay>
              <FaTrophy size={16} color="#f59e0b" />
              <Points>{student.totalPoints} pontos</Points>
            </PointsDisplay>
            <NavButton href="/student/dashboard" title="Dashboard">
              <FaHome size={16} />
            </NavButton>
            <NotificationButton title="Notificações">
              <FaBell size={16} />
              <NotificationBadge>2</NotificationBadge>
            </NotificationButton>
            <UserMenu>
              <UserAvatar>
                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </UserAvatar>
              <UserInfo>
                <UserName>{student.name}</UserName>
                <UserLevel>Nível {student.level}</UserLevel>
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
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  height: 70px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    height: 60px;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 480px) {
    gap: 10px;
  }
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

  @media (max-width: 480px) {
    padding: 8px;
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

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
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

const PlatformTag = styled.div`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 480px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const NavActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const PointsDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const Points = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const NavButton = styled(Link)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 6px;
  }
`;

const NotificationButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: none;
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

  @media (max-width: 480px) {
    padding: 6px;
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

  @media (max-width: 768px) {
    gap: 10px;
    padding: 6px 10px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    padding: 6px;
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

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 480px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

const UserLevel = styled.span`
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

  @media (max-width: 480px) {
    padding: 6px;
  }
`;