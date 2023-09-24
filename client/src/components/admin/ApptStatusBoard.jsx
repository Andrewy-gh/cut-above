import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useScheduleQuery } from '../../hooks/useScheduleQuery';
import StatusColumn from './StatusColumn';
import StatusTab from './StatusTab';
import { formatDateFull, formatDateToTime } from '../../utils/date';

export default function ApptStatusBoard() {
  const { id } = useParams();
  const { appointments } = useScheduleQuery(id);
  const formatTimeAppt = [...appointments]
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .map((appt) => {
      return {
        ...appt,
        start: formatDateToTime(appt.start),
      };
    });
  const [status, setStatus] = useState('scheduled');
  const scheduled = formatTimeAppt.filter(
    (appt) => appt.status === 'scheduled'
  );
  const checkedIn = formatTimeAppt.filter(
    (appt) => appt.status === 'checked-in'
  );
  const completed = formatTimeAppt.filter(
    (appt) => appt.status === 'completed'
  );
  const statuses = [
    { id: 1, name: 'scheduled', data: scheduled },
    { id: 2, name: 'checked-in', data: checkedIn },
    { id: 3, name: 'completed', data: completed },
  ];
  const filteredAppointments = statuses.find((st) => st.name === status).data;
  let content;
  if (formatTimeAppt.length < 1) {
    content = <h5>No Appointments made</h5>;
  } else {
    content = (
      <>
        <h5>{formatDateFull(formatTimeAppt[0].date)}</h5>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {statuses.map((status) => (
            <StatusTab
              key={status.id}
              handleClick={() => setStatus(status.name)}
              name={status.name}
              data={status.data}
            />
          ))}
        </div>
        <StatusColumn appointments={filteredAppointments} status={status} />
      </>
    );
  }
  return (
    <div
      style={{
        width: 'min(80ch, 100% - 2rem)',
        marginInline: 'auto',
        marginBottom: '4rem',
      }}
    >
      <Link to="/schedule">Go Back to Schedule </Link>
      {content}
    </div>
  );
}
