import { useParams } from 'react-router-dom';
import { useGetSingleAppointmentQuery } from '@/features/appointments/apptApiSlice';
import CancelAppointment from '@/components/ApptCard/ApptButton/CancelAppointment';
import ModifyAppointment from '@/components/ApptCard/ApptButton/ModifyAppointment';
import ApptTitle from '@/components/ApptCard/ApptTitle';
import styles from './styles.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

// This is the single Appontment page shown when accessing through email
export default function AppointmentPage() {
  const { id } = useParams();
  const {
    data: appointment,
    isLoading,
    isSuccess,
    isError,
  } = useGetSingleAppointmentQuery(id);
  let content;
  if (isLoading) {
    return <LoadingSpinner />;
  } else if (isSuccess) {
    content = (
      <>
        <h4 className="text-center">Your Upcoming Appointment</h4>
        <div className="container-lg">
          <div className={styles.appointment_card}>
            <div className={styles.flex_col}>
              <div>
                <ApptTitle appointment={appointment} />
                <div>{appointment.employee.firstName}</div>
              </div>
            </div>
            <div className={styles.gap_4}>
              <div className="grow-0">
                <ModifyAppointment appointment={appointment} />
              </div>
              <div className="grow-0">
                <CancelAppointment appointment={appointment} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else if (isError) {
    throw new Error('Appointment id is not valid.');
  }
  return <div className="container-lg">{content}</div>;
}
