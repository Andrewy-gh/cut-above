import UpdateApptStatus from '../UpdateApptStatus';

// @ts-expect-error TS(2307): Cannot find module '@/components/Employee' or its ... Remove this comment to see the full error message
import Employee from '@/components/Employee';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/ApptTitl... Remove this comment to see the full error message
import ApptTitle from '@/components/ApptCard/ApptTitle';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/ApptButt... Remove this comment to see the full error message
import ModifyAppointment from '@/components/ApptCard/ApptButton/ModifyAppointment';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/ApptButt... Remove this comment to see the full error message
import CancelAppointment from '@/components/ApptCard/ApptButton/CancelAppointment';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { appointmentPropType } from '@/utils/propTypes';

export default function StatusColumn({
  appointments,
  status
}: any) {
  const nextStatus = {
    scheduled: 'checked-in',
    'checked-in': 'completed',
    completed: 'scheduled',
  };

  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const newStatus = nextStatus[status];
  if (appointments.length < 1) {
    return <h5>No {status} appointments</h5>;
  }
  return (
    <div className={styles.column}>
      {appointments.map((appt: any) => <div key={appt.id} className={styles.appointment_card}>
        <div className={styles.flex_col}>
          <div>
            <ApptTitle appointment={appt} />
            <Employee employeeId={appt.employee.id} />
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
      </div>)}
    </div>
  );
}

StatusColumn.propTypes = {
  appointments: PropTypes.arrayOf(appointmentPropType),
  status: PropTypes.string.isRequired,
};
