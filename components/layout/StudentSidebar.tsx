// components/layout/StudentSidebar.tsx
'use client';

import { 
  FaHome, 
  FaBook, 
  FaChartLine, 
  FaCalendar,
  FaTrophy,
  FaFire,
  FaCheckCircle,
  FaCog
} from 'react-icons/fa';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Student } from '@/types';

interface StudentSidebarProps {
  open?: boolean;
  student: Student;
}

export default function StudentSidebar({ open = true, student }: StudentSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', href: '/student/dashboard' },
    { icon: FaBook, label: 'Meus Programas', href: '/student/programs' },
    { icon: FaFire, label: 'Hábitos Diários', href: '/student/habits' },
    { icon: FaCalendar, label: 'Calendário', href: '/student/calendar' },
    { icon: FaTrophy, label: 'Conquistas', href: '/student/achievements' },
    { icon: FaChartLine, label: 'Meu Progresso', href: '/student/progress' },
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
            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </UserAvatar>
          <UserInfo>
            <UserName>{student.name}</UserName>
            <UserDetails>
              <FaTrophy size={12} color="#f59e0b" />
              {student.totalPoints} pontos • Nível {student.level}
            </UserDetails>
          </UserInfo>
        </UserHeader>

        {/* Streak & Stats */}
        <StatsSection>
          <StreakCard>
            <StreakIcon>
              <FaFire size={20} color="#f97316" />
            </StreakIcon>
            <StreakInfo>
              <StreakNumber>{student.streak}</StreakNumber>
              <StreakLabel>Dias seguidos</StreakLabel>
            </StreakInfo>
          </StreakCard>
          
          <QuickStats>
            <QuickStat>
              <StatValue>12</StatValue>
              <StatLabel>Atividades</StatLabel>
            </QuickStat>
            <QuickStat>
              <StatValue>8</StatValue>
              <StatLabel>Concluídas</StatLabel>
            </QuickStat>
          </QuickStats>
        </StatsSection>

        {/* Main Menu */}
        <Menu>
          {menuItems.map((item, index) => (
            <MenuItem key={index}>
              <PageLink href={item.href} active={isActive(item.href)}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </PageLink>
            </MenuItem>
          ))}
        </Menu>

        {/* Today's Progress */}
        <TodayProgress>
          <ProgressTitle>Hoje</ProgressTitle>
          <ProgressBar>
            <ProgressFill width="65%" />
          </ProgressBar>
          <ProgressText>8 de 12 atividades concluídas</ProgressText>
        </TodayProgress>

        {/* Settings */}
        <SettingsSection>
          <PageLink href="/student/settings" active={isActive('/student/settings')}>
            <FaCog size={18} />
            <span>Configurações</span>
          </PageLink>
        </SettingsSection>
      </Wrapper>
    </Container>
  );
}

const Container = styled.nav<{ open: boolean }>`
  background: linear-gradient(180deg, #7c3aed 0%, #8b5cf6 100%);
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

const StatsSection = styled.div`
  margin-bottom: 24px;
`;

const StreakCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StreakIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StreakInfo = styled.div`
  flex: 1;
`;

const StreakNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: white;
  line-height: 1;
`;

const StreakLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const QuickStat = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 10px;
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

const PageLink = styled(Link)<{ active: boolean }>`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.active ? '#8b5cf6' : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  
  &:hover {
    color: #8b5cf6;
    transform: translateX(4px);
  }

  span {
    font-size: 14px;
  }
`;

const TodayProgress = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProgressTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 12px 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const SettingsSection = styled.div`
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
`;