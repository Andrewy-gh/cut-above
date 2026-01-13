import AppTitle from '../ApptTitle';
import ModifyAppointment from '../ApptButton/ModifyAppointment';
import CancelAppointment from '../ApptButton/CancelAppointment';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAuth' or its corres... Remove this comment to see the full error message
import { useAuth } from '@/hooks/useAuth';

// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { appointmentPropType } from '@/utils/propTypes';

export default function UpcomingCard({
  appointment
}: any) {
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
