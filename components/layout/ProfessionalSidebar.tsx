'use client';

import { 
  FaHome, 
  FaUsers, 
  FaBook, 
  FaChartLine, 
  FaStickyNote,
  FaCog,
  FaUserPlus,
  FaSchool,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import { 
  FaUserDoctor,
  FaClipboardList,
} from 'react-icons/fa6';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Professional } from '@/types';

interface ProfessionalSidebarProps {
  open?: boolean;
  user: Professional;
}

export default function ProfessionalSidebar({ open = true, user }: ProfessionalSidebarProps) {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuItems = [
    { 
      icon: FaHome, 
      label: 'Dashboard', 
      href: '/professional/dashboard',
      badge: null
    },
    { 
      icon: FaUsers, 
      label: 'Alunos', 
      href: '/professional/students',
      badge: user.assignedStudents.length,
      submenu: [
        { label: 'Todos Alunos', href: '/professional/students' },
        { label: 'Cadastrar Novo', href: '/professional/students/register', highlight: true },
        { label: 'Atividades Pendentes', href: '/professional/students/pending', badge: '3' },
        { label: 'Alunos Prioritários', href: '/professional/students/priority', badge: '!' },
      ]
    },
    { 
      icon: FaBook, 
      label: 'Programas', 
      href: '/professional/programs',
      badge: null,
      submenu: [
        { label: 'Meus Programas', href: '/professional/programs' },
        { label: 'Criar Programa', href: '/professional/programs/create', highlight: true },
        { label: 'Modelos', href: '/professional/programs/templates' },
      ]
    },
    { 
      icon: FaCalendarAlt, 
      label: 'Cronogramas', 
      href: '/professional/schedules',
      badge: null
    },
    { 
      icon: FaChartLine, 
      label: 'Relatórios', 
      href: '/professional/reports',
      badge: null
    },
    { 
      icon: FaStickyNote, 
      label: 'Observações', 
      href: '/professional/observations',
      badge: null
    },
  ];

  const isActive = (href: string) => {
    if (href === '/professional/dashboard') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const toggleSubmenu = (label: string) => {
    if (expandedMenu === label) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(label);
    }
  };

  const getUserInitials = () => {
    const names = user.name.split(' ');
    const initials = names.map(name => name[0]).join('').toUpperCase();
    return initials.length > 2 ? initials.substring(0, 2) : initials;
  };

  const getRoleLabel = () => {
    switch(user.role) {
      case 'psychologist': return 'Psicólogo';
      case 'psychiatrist': return 'Psiquiatra';
      case 'monitor': return 'Monitor';
      case 'coordinator': return 'Coordenador';
      default: return 'Profissional';
    }
  };

  return (
    <Container $open={open}>
      <Wrapper>
        {/* User Header */}
        <UserHeader>
          <UserAvatar>
            <AvatarInitials>{getUserInitials()}</AvatarInitials>
            <UserStatus $role={user.role} />
          </UserAvatar>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserRole>
              <FaUserDoctor size={12} />
              <span>{getRoleLabel()}</span>
            </UserRole>
          </UserInfo>
        </UserHeader>

        {/* Quick Stats */}
        <QuickStats>
          <Stat>
            <StatNumber>{user.assignedStudents.length}</StatNumber>
            <StatLabel>Alunos</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>12</StatNumber>
            <StatLabel>Ativos</StatLabel>
          </Stat>
        </QuickStats>

        {/* Main Menu */}
        <Menu>
          {menuItems.map((item, index) => {
            const active = isActive(item.href);
            const hasSubmenu = item.submenu;
            const isExpanded = expandedMenu === item.label;
            
            return (
              <MenuItem key={index}>
                {hasSubmenu ? (
                  <>
                    <MenuButton 
                      onClick={() => toggleSubmenu(item.label)}
                      $active={active || isExpanded}
                    >
                      <MenuIcon $active={active}>
                        <item.icon size={18} />
                      </MenuIcon>
                      <MenuLabel>{item.label}</MenuLabel>
                    </MenuButton>
                    
                    
                  </>
                ) : (
                  <MenuLink href={item.href} $active={active}>
                    <MenuIcon $active={active}>
                      <item.icon size={18} />
                    </MenuIcon>
                    <MenuLabel>{item.label}</MenuLabel>

                  </MenuLink>
                )}
              </MenuItem>
            );
          })}
        </Menu>

        {/* Quick Actions */}
        <QuickActions>
          <ActionTitle>Ações Rápidas</ActionTitle>
          <ActionButton href="/professional/students/register">
            <FaUserPlus size={14} />
            Cadastrar Aluno
          </ActionButton>
          <ActionButton href="/professional/programs/create">
            <FaBook size={14} />
            Novo Programa
          </ActionButton>
          <ActionButton href="/professional/schedules/create">
            <FaCalendarAlt size={14} />
            Novo Cronograma
          </ActionButton>
        </QuickActions>

        {/* Settings & Logout */}
        <BottomSection>
          <SettingsLink href="/professional/settings" $active={isActive('/professional/settings')}>
            <FaCog size={16} />
            <span>Configurações</span>
          </SettingsLink>
          
          <LogoutButton>
            <FaSignOutAlt size={16} />
            <span>Sair</span>
          </LogoutButton>
        </BottomSection>
      </Wrapper>
    </Container>
  );
}

// ========== STYLED COMPONENTS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideDown = keyframes`
  from { 
    max-height: 0;
    opacity: 0;
  }
  to { 
    max-height: 500px;
    opacity: 1;
  }
`;

const Container = styled.nav<{ $open: boolean }>`
  background: linear-gradient(180deg, #0A3D62 0%, #1E4D76 100%);
  width: 280px;
  height: 100vh;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;

  ${props => !props.$open && `
    transform: translateX(-100%);
  `}

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.4s ease-out;
`;

const UserAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
`;

const AvatarInitials = styled.div`
  font-weight: 700;
  color: white;
  font-size: 20px;
  letter-spacing: 1px;
`;

const UserStatus = styled.div<{ $role: string }>`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  border: 3px solid #0A3D62;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 700;
  color: white;
  font-size: 16px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;

  svg {
    color: #a5b4fc;
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 32px;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const Stat = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: default;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const StatNumber = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #6366f1;
  line-height: 1;
  margin-bottom: 6px;
  font-feature-settings: "tnum";
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const Menu = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 32px;
  animation: ${fadeIn} 0.4s ease-out 0.2s both;
`;

const MenuItem = styled.li`
  border-radius: 12px;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const MenuLink = styled(Link)<{ $active: boolean }>`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.85)'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.15)' : 'transparent'};
  border-left: 4px solid ${props => props.$active ? '#6366f1' : 'transparent'};
  position: relative;
  
  &:hover {
    color: white;
    background: ${props => props.$active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)'};
    transform: translateX(4px);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #6366f1;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const MenuButton = styled.button<{ $active: boolean }>`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.85)'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.15)' : 'transparent'};
  border-left: 4px solid ${props => props.$active ? '#6366f1' : 'transparent'};
  width: 100%;
  text-align: left;
  border: none;
  cursor: pointer;
  position: relative;
  
  &:hover {
    color: white;
    background: ${props => props.$active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)'};
    transform: translateX(4px);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #6366f1;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const MenuIcon = styled.div<{ $active: boolean }>`
  color: ${props => props.$active ? '#6366f1' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const MenuLabel = styled.span`
  font-size: 15px;
  flex: 1;
`;

const MenuBadge = styled.span`
  background: #6366f1;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
`;

const MenuChevron = styled.span<{ $expanded: boolean }>`
  transition: transform 0.3s ease;
  transform: rotate(${props => props.$expanded ? '180deg' : '0deg'});
  color: rgba(255, 255, 255, 0.5);
`;

const Submenu = styled.div`
  margin-left: 20px;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: ${slideDown} 0.3s ease-out;
  overflow: hidden;
`;

const SubmenuItem = styled.div`
  border-radius: 8px;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SubmenuLink = styled(Link)<{ $highlight?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 40px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    color: white;
    transform: translateX(4px);
  }
  
  ${props => props.$highlight && `
    color: #a5b4fc;
    font-weight: 600;
    
    &:hover {
      color: #818cf8;
    }
  `}
`;

const SubmenuDot = styled.div<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.$active ? '#6366f1' : 'rgba(255, 255, 255, 0.3)'};
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
`;

const SubmenuBadge = styled.span<{ $type: 'normal' | 'priority' }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${props => props.$type === 'priority' ? '#ef4444' : '#8b5cf6'};
  color: white;
  margin-left: auto;
`;

const QuickActions = styled.div`
  margin-bottom: 24px;
  animation: ${fadeIn} 0.4s ease-out 0.3s both;
`;

const ActionTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin-left: 12px;
  }
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-bottom: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
    transform: translateX(4px);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BottomSection = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${fadeIn} 0.4s ease-out 0.4s both;
`;

const SettingsLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: ${props => props.$active ? '#6366f1' : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: ${props => props.$active ? '#6366f1' : 'white'};
    transform: translateX(4px);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transform: translateX(4px);
  }
`;