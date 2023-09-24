import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useScheduleQuery } from '../../hooks/useScheduleQuery';
import { formatDateFull, formatDateToTime } from '../../utils/date';

export default function Schedules() {
  const { schedules } = useScheduleQuery();
  let content;
  if (!schedules) {
    content = <div>Loading...</div>;
  } else {
    content = schedules.map((sc) => (
      <div key={sc.id} style={{ marginBottom: '1rem`' }}>
        <div>{formatDateFull(sc.date)}</div>
        <div>Open: {formatDateToTime(sc.open)}</div>
        <div>Close: {formatDateToTime(sc.close)}</div>
        <div>Total appointments: {sc.appointments.length}</div>
        <Link to={`/dashboard/${sc.id}`}>
          <Button>View Details</Button>
        </Link>
      </div>
    ));
  }
  return (
    <div>
      <div>
        <Link to="/account">Back to account page</Link>
      </div>
      <h5>{schedules.length < 1 ? 'No Schedules available' : 'Schedules'}</h5>
      <div>{content}</div>
    </div>
  );
}
