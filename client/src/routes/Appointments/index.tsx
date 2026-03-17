import { useAppSelector } from '@/app/hooks';
import { Link } from 'react-router';
import {
  selectAllAppointment,
  useGetAppointmentQuery,
} from '@/features/appointments/apptApiSlice';
import { useAuth } from '@/hooks/useAuth';
import AccessDenied from '@/routes/RequireAuth/AccessDenied';

import UpcomingCard from '@/components/ApptCard/UpcomingCard';
import PastCard from '@/components/ApptCard/PastCard';
import { splitByUpcomingAndPast } from '@/utils/date';
import styles from './styles.module.css';
import { Appointment } from '@/types';

// This is the user's Appointments page when accessed through the Profile
export default function Appointments() {
  const { role } = useAuth();
  useGetAppointmentQuery({ enabled: role !== 'admin' });
  const appointments = useAppSelector(selectAllAppointment);

  if (role === 'admin') {
    return <AccessDenied requiredRole="client" />;
  }

  let content;

  if (appointments.length > 0) {
    const [upcomingAppts, pastAppts] = splitByUpcomingAndPast(appointments);
    content = (
      <>
        {upcomingAppts.length > 0 && (
          <section className={styles.section_group}>
            <div className={styles.section_header}>
              <h2 className={styles.section_title}>Upcoming appointments</h2>
              <span className={styles.section_count}>
                {upcomingAppts.length} scheduled
              </span>
            </div>
            <div className={styles.appointments_stack}>
              {upcomingAppts.map((appointment: Appointment) => (
                <UpcomingCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </section>
        )}
        {pastAppts.length > 0 && (
          <section className={styles.section_group}>
            <div className={styles.section_header}>
              <h2 className={styles.section_title}>Past appointments</h2>
              <span className={styles.section_count}>
                {pastAppts.length} completed
              </span>
            </div>
            <div className={styles.appointments_stack}>
              {pastAppts.map((appointment: Appointment) => (
                <PastCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </section>
        )}
      </>
    );
  } else {
    content = (
      <section className={styles.empty_state}>
        <h2 className={styles.section_title}>No appointments made</h2>
        <p className={styles.empty_copy}>
          Once you book a visit, your upcoming and past appointments will show
          up here.
        </p>
        <Link to="/bookings" className={styles.empty_link}>
          Book an appointment
        </Link>
      </section>
    );
  }

  return (
    <main className={styles.page}>
      <Link to="/account" className={styles.back_link}>
        <span className={styles.back_arrow}>&larr;</span> Account
      </Link>

      <header className={styles.page_header}>
        <h1 className={styles.page_title}>Appointments</h1>
      </header>

      <div className={styles.page_sections}>{content}</div>
    </main>
  );
}
