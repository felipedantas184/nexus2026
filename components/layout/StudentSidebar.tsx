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
  FaCog,
  FaCalendarAlt
} from 'react-icons/fa';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Student } from '@/types';

interface StudentSidebarProps {
  open: boolean;
  student: Student;
  onNavigate?: () => void;
}

export default function StudentSidebar({ open, student, onNavigate }: StudentSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', href: '/student/dashboard' },
    { icon: FaCalendarAlt, label: 'Cronogramas', href: '/student/schedules' }, // ← NOVO ITEM
    { icon: FaCalendar, label: 'Calendário', href: '/student/calendar' },
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
            <MenuItem key={index} onClick={onNavigate}>
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
  background: linear-gradient(180deg, #6d28d9 0%, #4c1d95 100%);
  width: 280px;
  max-height: 100vh;
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

  ${props => !props.open && `
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

// Wrapper mais organizado
const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
`;

// Card do usuário com brilho
const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
`;

// Avatar com glow
const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: white;
  font-size: 15px;
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
  background: rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
`;

const StreakIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StreakInfo = styled.div`
  flex: 1;
`;

const StreakNumber = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: white;
  line-height: 1;
`;

const StreakLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const QuickStat = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(5px);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: white;
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
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const PageLink = styled(Link) <{ active: boolean }>`
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: ${props => props.active ? '#a78bfa' : 'rgba(255, 255, 255, 0.85)'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.25s ease;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.14)' : 'transparent'};
  border-left: ${props => props.active ? '3px solid #c4b5fd' : '3px solid transparent'};

  &:hover {
    color: #c4b5fd;
    transform: translateX(4px);
  }

  span {
    font-size: 14px;
  }
`;

// Hoje — card mais sofisticado
const TodayProgress = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 7px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 12px 0;
`;

const ProgressFill = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.4s ease;
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