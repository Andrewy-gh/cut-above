import UpdateApptStatus from './UpdateApptStatus';
import Employee from '../Employee';
import Appointment from '../appointments/Appointment';
import ModifyAppointment from '../appointments/ModifyAppointment';
import CancelAppointment from '../appointments/CancelAppointment';

const column = {
  // border: '1px solid white',
  // borderRadius: '.125rem',
  // width: '220px',
  paddingBlock: '1rem',
  display: 'flex',
  flexDirection: 'column',
};

export default function StatusColumn({ appointments, status }) {
  const nextStatus = {
    scheduled: 'checked-in',
    'checked-in': 'completed',
    completed: 'scheduled',
  };
  const newStatus = nextStatus[status];
  if (appointments.length < 1) {
    return <h5>No {status} appointments</h5>;
  }
  return (
    <div style={column}>
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="appointment-card"
          style={{
            gap: '2rem',
            justifyContent: 'space-between',
            marginRight: 'auto',
            marginLeft: '0',
            width: 'min(600px, 100% - 2rem)',
          }}
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
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flexGrow: '0' }}>
              <UpdateApptStatus appointment={appt} newStatus={newStatus} />
            </div>
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
  );
  // return (
  //   <div style={column}>
  //     {appointments.map((appt) => (
  //       <div key={appt.id}>
  //         <div>Client: {appt.client}</div>
  //         <Employee employeeId={appt.employee} />
  //         <div>Start: {appt.start}</div>
  //         <div>Service: {appt.service}</div>
  //         <UpdateApptStatus appointment={appt} newStatus={newStatus} />
  //       </div>
  //     ))}
  //   </div>
  // );
}
