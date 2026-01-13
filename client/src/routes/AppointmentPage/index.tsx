import { useParams } from 'react-router-dom';

// @ts-expect-error TS(2307): Cannot find module '@/features/appointments/apptAp... Remove this comment to see the full error message
import { useGetSingleAppointmentQuery } from '@/features/appointments/apptApiSlice';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/ApptButt... Remove this comment to see the full error message
import CancelAppointment from '@/components/ApptCard/ApptButton/CancelAppointment';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/ApptButt... Remove this comment to see the full error message
import ModifyAppointment from '@/components/ApptCard/ApptButton/ModifyAppointment';

// @ts-expect-error TS(2307): Cannot find module '@/components/ApptCard/ApptTitl... Remove this comment to see the full error message
import ApptTitle from '@/components/ApptCard/ApptTitle';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(2307): Cannot find module '@/components/LoadingSpinner' o... Remove this comment to see the full error message
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
