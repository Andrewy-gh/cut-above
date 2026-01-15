import UpdateApptStatus from '../UpdateApptStatus';
import Employee from '@/components/Employee';
import ApptTitle from '@/components/ApptCard/ApptTitle';
import ModifyAppointment from '@/components/ApptCard/ApptButton/ModifyAppointment';
import CancelAppointment from '@/components/ApptCard/ApptButton/CancelAppointment';
import styles from './styles.module.css';
import { Appointment } from '@/types';

interface StatusColumnProps {
  appointments: Appointment[];
  status: string;
}

export default function StatusColumn({
  appointments,
  status,
}: StatusColumnProps) {
  const nextStatus: Record<string, string> = {
    scheduled: 'checked-in',
    'checked-in': 'completed',
    completed: 'scheduled',
  };

  const newStatus = nextStatus[status] || 'scheduled';

  if (appointments.length < 1) {
    return <h5>No {status} appointments</h5>;
  }

  return (
    <div className={styles.column}>
      {appointments.map((appt) => {
        const employeeId = appt.employee && typeof appt.employee === 'object'
          ? appt.employee.id
          : (typeof appt.employee === 'string' ? appt.employee : undefined);

        return (
          <div key={appt.id} className={styles.appointment_card}>
            <div className={styles.flex_col}>
              <div>
                <ApptTitle appointment={appt} />
                {employeeId && <Employee employeeId={employeeId} />}
              </div>
            </div>
          <div className={styles.buttons_wrap}>
            <div className="grow-0">
              <UpdateApptStatus appointment={appt} newStatus={newStatus} />
            </div>
            <div className="grow-0">
              <ModifyAppointment appointment={appt} />
            </div>
            <div className="grow-0">
              <CancelAppointment appointment={appt} />
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
