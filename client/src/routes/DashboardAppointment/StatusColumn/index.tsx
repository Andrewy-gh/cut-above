import UpdateApptStatus from '../UpdateApptStatus';
import CancelAppointment from '@/components/ApptCard/ApptButton/CancelAppointment';
import styles from './styles.module.css';
import { Appointment, User } from '@/types';

interface StatusColumnProps {
  appointments: Appointment[];
  status: string;
}

const getEmployeeInfo = (
  appt: Appointment
): { id: string; name: string } | null => {
  if (appt.employee && typeof appt.employee === 'object') {
    return { id: appt.employee.id, name: appt.employee.firstName };
  }
  if (typeof appt.employee === 'string') {
    return { id: appt.employee, name: appt.employee };
  }
  return null;
};

const getClientName = (appt: Appointment): string => {
  if (appt.client && typeof appt.client === 'object') {
    const client = appt.client as User;
    return client.firstName || 'Client';
  }
  return appt.customerName || 'Client';
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  'checked-in': 'Checked In',
  completed: 'Completed',
};

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
    return (
      <div className={styles.empty}>
        <div className={styles.empty_label}>
          No {statusLabels[status] || status} appointments
        </div>
      </div>
    );
  }

  return (
    <div className={styles.column}>
      {appointments.map((appt) => {
        const employee = getEmployeeInfo(appt);
        const clientName = getClientName(appt);

        return (
          <div key={appt.id} className={styles.appointment_card}>
            {/* Time column */}
            <div className={styles.time_col}>
              <span className={styles.time_value}>{appt.start}</span>
              {appt.date && (
                <span className={styles.time_date}>{appt.date}</span>
              )}
            </div>

            {/* Details column */}
            <div className={styles.details_col}>
              <div className={styles.client_name}>{clientName}</div>
              <div className={styles.detail_row}>
                <span className={styles.service_badge}>{appt.service}</span>
                {employee && (
                  <span className={styles.employee_badge}>
                    <span className={styles.employee_avatar}>
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                    {employee.name}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions_col}>
              <UpdateApptStatus appointment={appt} newStatus={newStatus} />
              <CancelAppointment appointment={appt} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
