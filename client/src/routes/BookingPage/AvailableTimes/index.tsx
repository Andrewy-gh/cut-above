import { useMediaQuery } from '@mui/material';
import Button from '@mui/material/Button';
import { Dayjs } from 'dayjs';

import { formatTime } from '@/utils/date';
import { theme } from '@/styles/styles';
import type { Employee } from '@/features/employeeSlice';
import styles from './styles.module.css';

interface Slot {
  id: string;
  start: Dayjs;
  end: Dayjs;
  available: string[];
}

interface AvailableTimeProps {
  children: React.ReactNode;
  handleOpen: () => void;
}

const AvailableTime = ({ children, handleOpen }: AvailableTimeProps) => {
  return (
    <Button variant="contained" onClick={handleOpen}>
      {children}
    </Button>
  );
};

interface AvailableTimesProps {
  timeSlots: Slot[];
  openDialog: (slot: Slot) => void;
  employee: Employee | undefined;
}

export default function AvailableTimes({
  timeSlots,
  openDialog,
  employee,
}: AvailableTimesProps) {
  const handleOpen = (data: Slot) => openDialog(data);
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
        {timeSlots.map((slot: Slot) => {
          const startTime = formatTime(slot.start); // dayjs obj => 10:45am
          const slotsAvailable =
            !employee ? `${slot.available.length} left` : '';
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
