
// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { appointmentPropType } from '@/utils/propTypes';
import AppTitle from '../ApptTitle';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAuth' or its corres... Remove this comment to see the full error message
import { useAuth } from '@/hooks/useAuth';

export default function PastCard({
  appointment
}: any) {
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
