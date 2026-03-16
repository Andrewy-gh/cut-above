import { useMemo } from 'react';
import { Link } from 'react-router';
import Button from '@mui/material/Button';
import { formatDateFull, formatDateToTime } from '../../utils/date';
import styles from './styles.module.css';
import { Schedule } from '@/types';

interface ScheduleCardProps {
  schedule: Schedule;
  isPast?: boolean;
}

const MAX_CAPACITY = 12;

export default function ScheduleCard({ schedule, isPast }: ScheduleCardProps) {
  const apptCount = schedule.appointments.length;
  const capacityPct = Math.min((apptCount / MAX_CAPACITY) * 100, 100);

  const statusCounts = useMemo(() => {
    const counts = { scheduled: 0, 'checked-in': 0, completed: 0 };
    schedule.appointments.forEach((appt) => {
      const s = appt.status as keyof typeof counts;
      if (s in counts) counts[s]++;
    });
    return counts;
  }, [schedule.appointments]);

  const fullDate = formatDateFull(schedule.date);
  const dateParts = fullDate.split(' ');
  const dayName = dateParts[0]?.replace(',', '') || '';
  const restOfDate = dateParts.slice(1).join(' ');

  return (
    <div className={`${styles.card} ${isPast ? styles.card_past : ''}`}>
      {/* Header: date + time */}
      <div className={styles.card_header}>
        <div>
          <div className={styles.card_date}>{restOfDate}</div>
          <span className={styles.card_day}>{dayName}</span>
        </div>
        <div className={styles.card_time}>
          {formatDateToTime(schedule.open)}
          <span className={styles.time_dot} />
          {formatDateToTime(schedule.close)}
        </div>
      </div>

      {/* Capacity bar */}
      <div className={styles.capacity_section}>
        <div className={styles.capacity_label}>
          <span>Appointments</span>
          <span className={styles.capacity_count}>{apptCount}</span>
        </div>
        <div className={styles.capacity_bar_track}>
          <div
            className={styles.capacity_bar_fill}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
      </div>

      {/* Status breakdown badges */}
      {apptCount > 0 && (
        <div className={styles.status_badges}>
          {statusCounts.scheduled > 0 && (
            <div className={styles.status_badge}>
              <span
                className={`${styles.status_dot} ${styles.status_dot_scheduled}`}
              />
              <span className={styles.status_badge_label}>Scheduled</span>
              <span className={styles.status_badge_count}>
                {statusCounts.scheduled}
              </span>
            </div>
          )}
          {statusCounts['checked-in'] > 0 && (
            <div className={styles.status_badge}>
              <span
                className={`${styles.status_dot} ${styles.status_dot_checked_in}`}
              />
              <span className={styles.status_badge_label}>Checked in</span>
              <span className={styles.status_badge_count}>
                {statusCounts['checked-in']}
              </span>
            </div>
          )}
          {statusCounts.completed > 0 && (
            <div className={styles.status_badge}>
              <span
                className={`${styles.status_dot} ${styles.status_dot_completed}`}
              />
              <span className={styles.status_badge_label}>Completed</span>
              <span className={styles.status_badge_count}>
                {statusCounts.completed}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.card_footer}>
        <Link to={`${schedule.id}`}>
          <Button size="small">View Details</Button>
        </Link>
      </div>
    </div>
  );
}
