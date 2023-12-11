import AppTitle from '../ApptTitle';
import Employee from '@/components/Employee';

export default function PastCard({ appt }) {
  return (
    <div className="appointment-card" style={{ flexDirection: 'column' }}>
      <AppTitle key={appt.id} appointment={appt}>
        <Employee employeeId={appt.employee} />
      </AppTitle>
    </div>
  );
}
