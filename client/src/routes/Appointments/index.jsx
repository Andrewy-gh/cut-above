import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectAllAppointment,
  useGetAppointmentQuery,
} from '@/features/appointments/apptApiSlice';
import UpcomingCard from '@/components/ApptCard/UpcomingCard';
import PastCard from '@/components/ApptCard/PastCard';
import { splitByUpcomingAndPast } from '@/utils/date';
import styles from './styles.module.css';

// This is the user's Appointments page when accessed through the Profile
export default function Appointments() {
  useGetAppointmentQuery();
  const appointments = useSelector(selectAllAppointment);

  // return (
  //   <>
  //     {appointments.map((appointment) => (
  //       <p key={appointment.id}>
  //         <span>
  //           {appointment.date} - {appointment.service} -{' '}
  //           {appointment.client.firstName}
  //         </span>
  //       </p>
  //     ))}
  //   </>
  // );

  let content;
  if (appointments.length > 0) {
    const [upcomingAppts, pastAppts] = splitByUpcomingAndPast(appointments);
    content = (
      <>
        <h4 className="text-center">Upcoming appointments</h4>
        <div>
          {upcomingAppts.map((appointment) => (
            <UpcomingCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
        {pastAppts.length > 0 && (
          <h4 className="text-center">Past appointments</h4>
        )}
        <div>
          {pastAppts.map((appointment) => (
            <PastCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      </>
    );
  } else {
    content = <h4 className="text-center">No appointments made</h4>;
  }

  return (
    <main className="container-lg">
      <div className={styles.container}>
        <div className="mt-4">
          <Link to="/account">Go back to account page</Link>
        </div>
        <div>{content}</div>
      </div>
    </main>
  );
}
