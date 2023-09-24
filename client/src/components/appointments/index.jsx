import { Link } from 'react-router-dom';
import CancelAppointment from './CancelAppointment';
import ModifyAppointment from './ModifyAppointment';
import { useEmployeesQuery } from '../../hooks/useEmployeesQuery';
import {
  selectAllAppointment,
  useGetAppointmentQuery,
} from '../../features/appointments/apptApiSlice';
import { useSelector } from 'react-redux';

import Appointment from './Appointment';
import Employee from '../Employee';

export default function Appointments() {
  const { data } = useGetAppointmentQuery();
  const appointments = useSelector(selectAllAppointment);
  let content;
  const futureItems = [];
  const pastItems = [];
  const presentDate = new Date();
  if (appointments.length > 0) {
    appointments.forEach((appt) => {
      const apptDate = new Date(appt.date);
      if (apptDate < presentDate) {
        pastItems.push(appt);
      } else {
        futureItems.push(appt);
      }
    });
    content = (
      <>
        <h4 style={{ textAlign: 'center' }}>Upcoming appointments</h4>
        <div style={{ width: 'min(80ch, 100% - 2rem)', marginInline: 'auto' }}>
          {futureItems.map((appt) => (
            <div
              key={appt.id}
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
                  <Appointment appointment={appt} />
                  <Employee employeeId={appt.employee} />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                <div style={{ flexGrow: '0' }}>
                  <ModifyAppointment appointment={appt} />
                </div>
                <div style={{ flexGrow: '0' }}>
                  <CancelAppointment appointment={appt} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {pastItems.length > 0 && (
          <h4 style={{ textAlign: 'center' }}>Past appointments</h4>
        )}
        <div style={{ width: 'min(80ch, 100% - 2rem)', marginInline: 'auto' }}>
          {pastItems.map((appt) => (
            <div
              key={appt.id}
              className="appointment-card"
              style={{ flexDirection: 'column' }}
            >
              <Appointment key={appt.id} appointment={appt}>
                <Employee employeeId={appt.employee} />
              </Appointment>
            </div>
          ))}
        </div>
      </>
    );
  } else {
    content = <h4 style={{ textAlign: 'center' }}>No appointments made</h4>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <Link to="/account">Go back to account page</Link>
      </div>
      <div>{content}</div>
    </div>
  );
}
