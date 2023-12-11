import AppTitle from '../ApptTitle';
import Employee from '@/components/Employee';
import ModifyAppointment from '../ApptButton/ModifyAppointment';
import CancelAppointment from '../ApptButton/CancelAppointment';

export default function UpcomingCard({ appt }) {
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
          <AppTitle appointment={appt} />
          <Employee employeeId={appt.employee} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
        }}
      >
        <div className="grow-0">
          <ModifyAppointment appointment={appt} />
        </div>
        <div className="grow-0">
          <CancelAppointment appointment={appt} />
        </div>
      </div>
    </div>
  );
}
