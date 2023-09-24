import { Link } from 'react-router-dom';
import { useParams, useSearchParams } from 'react-router-dom';
import CancelAppointment from '../components/appointments/CancelAppointment';
import ModifyAppointment from '../components/appointments/ModifyAppointment';
import { useGetSingleAppointmentQuery } from '../features/appointments/apptApiSlice';
import { useValidateTokenQuery } from '../features/userSlice';
import Appointment from '../components/appointments/Appointment';
import Employee from '../components/Employee';

export default function AppointmentPage() {
  const { id } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  let token = searchParams.get('token');
  const {
    data: tokenStatus,
    isLoading: isTokenStatusLoading,
    isSuccess: isTokenStatusSuccess,
    isError: isTokenStatusError,
  } = useValidateTokenQuery({ option: 'email', token });
  const {
    data: appointment,
    isLoading,
    isSuccess,
    isError,
  } = useGetSingleAppointmentQuery(id, { skip: isTokenStatusError });
  let content;
  if (isLoading || isTokenStatusLoading) {
    return <p>Loading...</p>;
  } else if (
    isSuccess &&
    isTokenStatusSuccess &&
    tokenStatus.message === 'Token is valid'
  ) {
    content = (
      <>
        <h4 style={{ textAlign: 'center' }}>Your Upcoming Appointment</h4>
        <div style={{ width: 'min(80ch, 100% - 2rem)', marginInline: 'auto' }}>
          <div
            className="appointment-card"
            style={{ gap: '1rem', justifyContent: 'space-between' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div>
                <Appointment appointment={appointment} />
                <Employee employeeId={appointment.employee} />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              <div style={{ flexGrow: '0' }}>
                <ModifyAppointment appointment={appointment} token={token} />
              </div>
              <div style={{ flexGrow: '0' }}>
                <CancelAppointment appointment={appointment} token={token} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else if (isError || isTokenStatusError) {
    content = (
      <>
        <h5 style={{ textAlign: 'center' }}>
          Oops looks like an error happened...
        </h5>
        <Link to="/login">
          <p style={{ textAlign: 'center' }}>
            Please <u>login</u> to access your appointment information.
          </p>
        </Link>
      </>
    );
  }
  return (
    <div style={{ width: 'min(80ch, 100% - 2rem)', marginInline: 'auto' }}>
      {content}
    </div>
  );
}
