// app/professional/students/[id]/components/StudentHeader.tsx
import styled from 'styled-components';
import { FaSchool, FaBirthdayCake, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { Student } from '@/types';

interface StudentHeaderProps {
  student: Student;
  programsCount: number;
  observationsCount: number;
}

export default function StudentHeader({ student, programsCount, observationsCount }: StudentHeaderProps) {
  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getOriginLabel = (origin: string) => {
    return origin === 'fracta' ? 'Fracta' : 'Particular';
  };

  return (
    <Header>
      <HeaderContent>
        <AvatarSection>
          <Avatar>
            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Avatar>
          <StudentInfo>
            <StudentName>{student.name}</StudentName>
            <StudentEmail>{student.email}</StudentEmail>
            <StudentDetails>
              <DetailItem>
                <FaSchool size={14} />
                {student.personalInfo.school} • {student.personalInfo.grade}
              </DetailItem>
              {student.personalInfo.birthday && (
                <DetailItem>
                  <FaBirthdayCake size={14} />
                  {calculateAge(student.personalInfo.birthday)} anos • 
                  {new Date(student.personalInfo.birthday).toLocaleDateString('pt-BR')}
                </DetailItem>
              )}
              <DetailItem>
                <FaMapMarkerAlt size={14} />
                {getOriginLabel(student.personalInfo.origin)}
              </DetailItem>
            </StudentDetails>
          </StudentInfo>
        </AvatarSection>

        <StatsSection>
          <Stat>
            <StatNumber>{programsCount}</StatNumber>
            <StatLabel>Programas</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>{student.level || 1}</StatNumber>
            <StatLabel>Nível</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>{observationsCount}</StatNumber>
            <StatLabel>Observações</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>{student.streak || 0}</StatNumber>
            <StatLabel>Dias</StatLabel>
          </Stat>
        </StatsSection>
      </HeaderContent>
    </Header>
  );
}

const Header = styled.div`
  background: linear-gradient(135deg, #0A3D62 0%, #6366f1 100%);
  color: white;
  padding: 32px 24px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const StudentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StudentName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: white;
`;

const StudentEmail = styled.div`
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const StudentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
`;

const StatsSection = styled.div`
  display: flex;
  gap: 32px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Stat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;