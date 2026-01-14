import AppTitle from '../ApptTitle';
import { useAuth } from '@/hooks/useAuth';
import { Appointment } from '@/types';

interface PastCardProps {
  appointment: Appointment;
}

export default function PastCard({ appointment }: PastCardProps) {
  const { role } = useAuth();

  return (
    <div className="appointment-card" style={{ flexDirection: 'column' }}>
      <AppTitle key={appointment.id} appointment={appointment} />
      <div>
        {role === 'client'
          ? appointment.employee?.firstName
          : appointment.client?.firstName}
      </div>
    </div>
  );
}
