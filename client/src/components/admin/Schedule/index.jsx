import { Link } from 'react-router-dom';
import { useScheduleQuery } from '../../../hooks/useScheduleQuery';
import ScheduleCard from './ScheduleCard';
import styles from './styles.module.css';

// This is an admin page which list all upcoming and past schedules
export default function Schedules() {
  const { schedules, upcomingSchedules, pastSchedules } = useScheduleQuery();
  let content;
  if (!schedules) {
    content = <div>Loading...</div>;
  } else {
    content = (
      <>
        <h5 className={styles.header}>Upcoming schedules</h5>
        <div className={styles.container}>
          {upcomingSchedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
        <h5 className={styles.header}>Past schedules</h5>
        <div className={styles.container}>
          {pastSchedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      </>
    );
  }
  return (
    <div>
      <div>
        <Link to="/account">Back to account page</Link>
      </div>
      <h4 className={styles.header}>
        {schedules.length < 1 ? 'No Schedules available' : 'All Schedules'}
      </h4>
      <div>{content}</div>
    </div>
  );
}
