import styles from './styles.module.css';

export default function AppTitle({ children, appointment }) {
  return (
    <>
      <div className={styles.date_time}>
        {appointment.date && (
          <span className={styles.date}>{appointment.date}</span>
        )}
        <span>{appointment.start}</span>
      </div>
      <div className={styles.service}>{appointment.service}</div>
      {children}
    </>
  );
}
