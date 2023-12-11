import { useMediaQuery } from '@mui/material/';
import Button from '@mui/material/Button';
import { formatTime } from '@/utils/date';
import { theme } from '@/styles/styles';
import styles from './styles.module.css';

const AvailableTime = ({ children, handleOpen }) => {
  return (
    <Button variant="contained" onClick={handleOpen}>
      {children}
    </Button>
  );
};

export default function AvailableTimes({ timeSlots, openDialog }) {
  const handleOpen = (data) => openDialog(data);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerClass = isMobile
    ? styles.container_mobile
    : styles.container_desktop;
  const itemClass = isMobile ? styles.item_mobile : null;

  let title;
  let timesAvailable;
  let availableTimes;
  if (timeSlots.length > 0) {
    timesAvailable = `Choose Your Time - ${
      timeSlots.length > 1
        ? timeSlots.length + ' slots available'
        : '1 slot available'
    }`;
    title = <h5 className="text-center">{timesAvailable}</h5>;
    availableTimes = (
      <div className={containerClass}>
        {timeSlots.map((slot) => {
          const startTime = formatTime(slot.start);
          return (
            <div key={slot.id} className={itemClass}>
              <AvailableTime
                handleOpen={() => handleOpen(slot)}
              >{`${startTime} ${slot.available.length} left`}</AvailableTime>
            </div>
          );
        })}
      </div>
    );
  } else {
    title = <h5 className="text-center">No Times Available</h5>;
  }

  return (
    <div className={styles.spacing}>
      {title}
      {availableTimes}
    </div>
  );
}
