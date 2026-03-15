import styles from './styles.module.css';
import { formatEmployeeName } from './shared';

export default function AvailabilityHeroCard({
  employee,
  defaultHours,
}: {
  employee: { firstName: string; lastName?: string };
  defaultHours: { startTime: string; endTime: string };
}) {
  return (
    <section className={styles.heroCard}>
      <div>
        <p className={styles.kicker}>Editing</p>
        <h4 className={styles.heroTitle}>{formatEmployeeName(employee)}</h4>
      </div>
      <div className={styles.heroMeta}>
        <span>Shop default start: {defaultHours.startTime}</span>
        <span>Shop default end: {defaultHours.endTime}</span>
      </div>
    </section>
  );
}
