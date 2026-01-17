import AppTitle from '../ApptTitle';
import { useAuth } from '@/hooks/useAuth';
import { Appointment } from '@/types';

interface PastCardProps {
  appointment: Appointment;
}

export default function PastCard({ appointment }: PastCardProps) {
  const { role } = useAuth();

  const getName = () => {
    if (role === 'client') {
      return appointment.employee && typeof appointment.employee === 'object'
        ? appointment.employee.firstName
        : '';
    }
    return appointment.client && typeof appointment.client === 'object'
      ? appointment.client.firstName
      : '';
  };

  return (
    <div className="appointment-card" style={{ flexDirection: 'column' }}>
      <AppTitle key={appointment.id} appointment={appointment} />
      <div>{getName()}</div>
    </div>
  );
}
