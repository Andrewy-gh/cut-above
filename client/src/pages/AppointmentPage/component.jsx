import CancelAppointment from '@/components/appointments/ApptCard/ApptButton/CancelAppointment';
import ModifyAppointment from '@/components/appointments/ApptCard/ApptButton/ModifyAppointment';
import ApptTitle from '@/components/appointments/ApptCard/ApptTitle';
import Employee from '@/components/Employee';
import styles from './styles.module.css';

export default function Component({ appointment, token }) {
  return (
    <>
      <h4 className="text-center">Your Upcoming Appointment</h4>
      <div className="container-lg">
        <div className={styles.appointment_card}>
          <div className={styles.flex_col}>
            <div>
              <ApptTitle appointment={appointment} />
              <Employee employeeId={appointment.employee} />
            </div>
          </div>
          <div className={styles.gap_4}>
            <div className="grow-0">
              <ModifyAppointment appointment={appointment} token={token} />
            </div>
            <div className="grow-0">
              <CancelAppointment appointment={appointment} token={token} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
