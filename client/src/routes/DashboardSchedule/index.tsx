import { Link } from 'react-router-dom';
import { useScheduleQuery } from '../../hooks/useScheduleQuery';
import ScheduleCard from './ScheduleCard';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// This is an admin page which list all upcoming and past schedules
export default function DashboardSchedule() {

  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  const { schedules, upcomingSchedules, pastSchedules } = useScheduleQuery();

  let content;
  if (!schedules) {
    content = <div>Loading...</div>;
  } else {
    content = (
      <>
        <h5 className={styles.header}>Upcoming schedules</h5>
        <div className={styles.container}>
          {upcomingSchedules.map((schedule: any) => <ScheduleCard key={schedule.id} schedule={schedule} />)}
        </div>
        <h5 className={styles.header}>Past schedules</h5>
        <div className={styles.container}>
          {pastSchedules.map((schedule: any) => <ScheduleCard key={schedule.id} schedule={schedule} />)}
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
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        {schedules.length < 1 ? 'No Schedules available' : 'All Schedules'}
      </h4>
      <div>{content}</div>
    </div>
  );
}
