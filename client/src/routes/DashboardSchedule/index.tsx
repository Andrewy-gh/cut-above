import { Link } from 'react-router-dom';
import { useScheduleQuery } from '../../hooks/useScheduleQuery';
import ScheduleCard from './ScheduleCard';
import styles from './styles.module.css';
import { Schedule } from '@/types';

// This is an admin page which list all upcoming and past schedules
export default function DashboardSchedule() {
  const { schedules, upcomingSchedules, pastSchedules } = useScheduleQuery();

  let content;
  if (!schedules || schedules.length === 0) {
    content = <div>No schedules found.</div>;
  } else {
    content = (
      <>
        <h5 className={styles.header}>Upcoming schedules</h5>
        <div className={styles.container}>
          {upcomingSchedules.map((schedule: Schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
        <h5 className={styles.header}>Past schedules</h5>
        <div className={styles.container}>
          {pastSchedules.map((schedule: Schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="container-lg">
      <div className="mt-4">
        <Link to="/account">Back to account page</Link>
      </div>
      <h4 className={styles.header}>
        {!schedules || schedules.length < 1
          ? 'No Schedules available'
          : 'All Schedules'}
      </h4>
      <div>{content}</div>
    </div>
  );
}
