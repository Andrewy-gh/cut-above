import styles from './styles.module.css';
import { Appointment } from '@/types';

interface AppTitleProps {
  appointment: Appointment;
}

export default function AppTitle({ appointment }: AppTitleProps) {
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
