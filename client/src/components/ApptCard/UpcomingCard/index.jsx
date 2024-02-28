import AppTitle from '../ApptTitle';
import ModifyAppointment from '../ApptButton/ModifyAppointment';
import CancelAppointment from '../ApptButton/CancelAppointment';
import { useAuth } from '@/hooks/useAuth';
import { appointmentPropType } from '@/utils/propTypes';

export default function UpcomingCard({ appointment }) {
  const { role } = useAuth();
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
          <div>
            {role === 'client'
              ? appointment.employee.firstName
              : appointment.client.firstName}
          </div>
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

UpcomingCard.propTypes = {
  appointment: appointmentPropType,
};
