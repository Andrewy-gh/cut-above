import { Link } from 'react-router-dom';
import {
  selectAllAppointment,
  useGetAppointmentQuery,
} from './appointmentSlice';
import { useSelector } from 'react-redux';
import Employee from '../employees/Employee';

const Appointment = () => {
  const { isLoading, isSuccess, isError, error } = useGetAppointmentQuery();
  const appointments = useSelector(selectAllAppointment);

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    content = appointments.map((appt) => (
      <div
        key={appt.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          outline: 'solid blue',
        }}
      >
        <div>{appt.date}</div>
        <div>{appt.time}</div>
        <Employee employeeId={appt.employee} />
      </div>
    ));
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return (
    <main>
      <h3>Appointments</h3>
      {content}
      <Link to="/welcome">Back to Welcome</Link>
    </main>
  );
};

export default Appointment;
