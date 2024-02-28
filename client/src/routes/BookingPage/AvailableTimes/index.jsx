import { useMediaQuery } from '@mui/material/';
import Button from '@mui/material/Button';
import { formatTime } from '@/utils/date';
import { theme } from '@/styles/styles';
import styles from './styles.module.css';
import PropTypes from 'prop-types';
import { selectionPropType, userPropType } from '@/utils/propTypes';

const AvailableTime = ({ children, handleOpen }) => {
  return (
    <Button variant="contained" onClick={handleOpen}>
      {children}
    </Button>
  );
};

export default function AvailableTimes({ timeSlots, openDialog, employee }) {
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
          const startTime = formatTime(slot.start); // dayjs obj => 10:45am
          const slotsAvailable =
            employee === 'any' ? `${slot.available.length} left` : '';
          return (
            <div key={slot.id} className={itemClass}>
              <AvailableTime
                handleOpen={() => handleOpen(slot)}
              >{`${startTime} ${slotsAvailable}`}</AvailableTime>
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

AvailableTimes.propTypes = {
  timeSlots: PropTypes.arrayOf(selectionPropType),
  openDialog: PropTypes.func.isRequired,
  employee: PropTypes.oneOfType([PropTypes.string.isRequired, userPropType])
    .isRequired,
};

AvailableTime.propTypes = {
  children: PropTypes.string.isRequired,
  handleOpen: PropTypes.func.isRequired,
};
