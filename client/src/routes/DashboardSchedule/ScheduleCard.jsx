import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { formatDateFull, formatDateToTime } from '../../utils/date';
import styles from './styles.module.css';
import { theme } from '../../styles/styles';
import { schedulePropType } from '@/utils/propTypes';

export default function ScheduleCard({ schedule }) {
  return (
    <div
      className={styles.card}
      style={{ outline: `solid ${theme.palette.primary.dark}` }}
    >
      <div>{formatDateFull(schedule.date)}</div>
      <div>Open: {formatDateToTime(schedule.open)}</div>
      <div>Close: {formatDateToTime(schedule.close)}</div>
      <div>Total appointments: {schedule.appointments.length}</div>
      <Link to={`${schedule.id}`}>
        <Button>View Details</Button>
      </Link>
    </div>
  );
}

ScheduleCard.propTypes = {
  schedule: schedulePropType,
};
