import AppTitle from '../ApptTitle';
import ModifyAppointment from '../ApptButton/ModifyAppointment';
import CancelAppointment from '../ApptButton/CancelAppointment';
import { useAuth } from '@/hooks/useAuth';
import { Appointment } from '@/types';

interface UpcomingCardProps {
  appointment: Appointment;
}

export default function UpcomingCard({ appointment }: UpcomingCardProps) {
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
    <div
      className="appointment-card"
      style={{ gap: '1rem', justifyContent: 'space-between' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <AppTitle appointment={appointment} />
          <div>{getName()}</div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
        }}
      >
        <div className="grow-0">
          <ModifyAppointment appointment={appointment} />
        </div>
        <div className="grow-0">
          <CancelAppointment appointment={appointment} />
        </div>
      </div>
    </div>
  );
}
