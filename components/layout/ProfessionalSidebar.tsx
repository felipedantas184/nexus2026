// components/layout/ProfessionalSidebar.tsx - ATUALIZADO
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
  FaCalendarAlt // ← NOVO ÍCONE
} from 'react-icons/fa';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Professional } from '@/types';

interface ProfessionalSidebarProps {
  open?: boolean;
  user: Professional;
}

export default function ProfessionalSidebar({ open = true, user }: ProfessionalSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', href: '/professional/dashboard' },
    { icon: FaUsers, label: 'Alunos', href: '/professional/students' },
    { icon: FaBook, label: 'Programas', href: '/professional/programs' },
    { icon: FaCalendarAlt, label: 'Cronogramas', href: '/professional/schedules' }, // ← NOVO ITEM
    { icon: FaChartLine, label: 'Relatórios', href: '/professional/reports' },
    { icon: FaStickyNote, label: 'Observações', href: '/professional/observations' },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <Container open={open}>
      <Wrapper>
        {/* User Header */}
        <UserHeader>
          <UserAvatar>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </UserAvatar>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserDetails>
              <FaSchool size={12} />
              {user.assignedStudents.length} alunos
            </UserDetails>
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
          {menuItems.map((item, index) => (
            <MenuItem key={index}>
              <PageLink href={item.href} $active={isActive(item.href)}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </PageLink>
            </MenuItem>
          ))}
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
          <ActionButton href="/professional/schedules/create"> {/* ← NOVO BOTÃO */}
            <FaCalendarAlt size={14} />
            Novo Cronograma
          </ActionButton>
        </QuickActions>

        {/* Settings */}
        <SettingsSection>
          <PageLink href="/professional/settings" $active={isActive('/professional/settings')}>
            <FaCog size={18} />
            <span>Configurações</span>
          </PageLink>
        </SettingsSection>
      </Wrapper>
    </Container>
  );
}

// Os estilos permanecem os mesmos...
const Container = styled.nav<{ open: boolean }>`
  background: linear-gradient(180deg, #0A3D62 0%, #1E4D76 100%);
  width: 280px;
  height: 100%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  
  ${props => !props.open && `
    transform: translateX(-100%);
  `}
`;

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: white;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserDetails = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const Stat = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #6366f1;
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Menu = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
`;

const MenuItem = styled.li`
  border-radius: 8px;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PageLink = styled(Link)<{ $active: boolean }>`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.$active ? '#6366f1' : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  
  &:hover {
    color: #6366f1;
    transform: translateX(4px);
  }

  span {
    font-size: 14px;
  }
`;

const QuickActions = styled.div`
  margin-bottom: 24px;
`;

const ActionTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(2px);
  }
`;

const SettingsSection = styled.div`
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
`;