import styles from './styles.module.css';
import { appointmentPropType } from '@/utils/propTypes';

export default function AppTitle({ appointment }) {
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
