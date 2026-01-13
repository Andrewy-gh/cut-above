import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectAllAppointment,
  useGetAppointmentQuery,
// @ts-expect-error TS(2307): Cannot find module '@/features/appointments/apptAp... Remove this comment to see the full error message
} from '@/features/appointments/apptApiSlice';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/Upcoming... Remove this comment to see the full error message
import UpcomingCard from '@/components/ApptCard/UpcomingCard';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/PastCard... Remove this comment to see the full error message
import PastCard from '@/components/ApptCard/PastCard';

// @ts-expect-error TS(2307): Cannot find module '@/utils/date' or its correspon... Remove this comment to see the full error message
import { splitByUpcomingAndPast } from '@/utils/date';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
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

  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  if (appointments.length > 0) {
    const [upcomingAppts, pastAppts] = splitByUpcomingAndPast(appointments);
    content = (
      <>
        <h4 className="text-center">Upcoming appointments</h4>
        <div>
          {upcomingAppts.map((appointment: any) => <UpcomingCard key={appointment.id} appointment={appointment} />)}
        </div>
        {pastAppts.length > 0 && (
          <h4 className="text-center">Past appointments</h4>
        )}
        <div>
          {pastAppts.map((appointment: any) => <PastCard key={appointment.id} appointment={appointment} />)}
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
