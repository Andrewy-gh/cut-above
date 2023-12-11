import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectAllAppointment,
  useGetAppointmentQuery,
} from '@/features/appointments/apptApiSlice';
import UpcomingCard from './ApptCard/UpcomingCard';
import PastCard from './ApptCard/PastCard';
import { splitByUpcomingAndPast } from '@/utils/date';
import styles from './styles.module.css';

// This is the user's Appointments page when accessed through the Profile
export default function Appointments() {
  const { data } = useGetAppointmentQuery();
  const appointments = useSelector(selectAllAppointment);
  let content;
  if (appointments.length > 0) {
    const [upcomingAppts, pastAppts] = splitByUpcomingAndPast(appointments);
    content = (
      <>
        <h4 className="text-center">Upcoming appointments</h4>
        <div className="container-lg">
          {upcomingAppts.map((appt) => (
            <UpcomingCard key={appt.id} appt={appt} />
          ))}
        </div>
        {pastAppts.length > 0 && (
          <h4 className="text-center">Past appointments</h4>
        )}
        <div className="container-lg">
          {pastAppts.map((appt) => (
            <PastCard key={appt.id} appt={appt} />
          ))}
        </div>
      </>
    );
  } else {
    content = <h4 className="text-center">No appointments made</h4>;
  }

  return (
    <div className={styles.container}>
      <div>
        <Link to="/account">Go back to account page</Link>
      </div>
      <div>{content}</div>
    </div>
  );
}
