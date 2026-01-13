
// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { appointmentPropType } from '@/utils/propTypes';

export default function AppTitle({
  appointment
}: any) {
  return (
    <>
      <div className={styles.date_time}>
        {appointment.date && (
          <span className={styles.date}>{appointment.date}</span>
        )}
        <span>{appointment.start}</span>
      </div>
      <div className={styles.service}>{appointment.service}</div>
    </>
  );
}

AppTitle.propTypes = {
  appointment: appointmentPropType,
};
