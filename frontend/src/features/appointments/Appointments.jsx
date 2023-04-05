import { Link } from 'react-router-dom';
import { useGetAppointmentsQuery } from './appointmentSlice';

const Appointment = () => {
  const {
    data: appointments,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetAppointmentsQuery();

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
        <div>{appt.employee.firstName}</div>
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
