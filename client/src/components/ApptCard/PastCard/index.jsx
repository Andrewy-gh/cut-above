import { appointmentPropType } from '@/utils/propTypes';
import AppTitle from '../ApptTitle';
import { useAuth } from '@/hooks/useAuth';

export default function PastCard({ appointment }) {
  const { role } = useAuth();

  return (
    <div className="appointment-card" style={{ flexDirection: 'column' }}>
      <AppTitle key={appointment.id} appointment={appointment} />
      <div>
        {role === 'client'
          ? appointment.employee.firstName
          : appointment.client.firstName}
      </div>
    </div>
  );
}

PastCard.propTypes = {
  appointment: appointmentPropType,
};
