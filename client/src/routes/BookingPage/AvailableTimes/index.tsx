import { useMediaQuery } from '@mui/material';
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

interface TimeSlotButtonProps {
  time: string;
  slotsCount: string;
  handleOpen: () => void;
}

const TimeSlotButton = ({ time, slotsCount, handleOpen }: TimeSlotButtonProps) => {
  return (
    <button className={styles.time_slot} onClick={handleOpen} type="button">
      <span className={styles.time_value}>{time}</span>
      {slotsCount && <span className={styles.slots_count}>{slotsCount}</span>}
    </button>
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
  const itemClass = isMobile ? styles.item_mobile : undefined;

  if (timeSlots.length === 0) {
    return (
      <div className={styles.times_section}>
        <div className={styles.times_empty}>No times available for this date</div>
      </div>
    );
  }

  const slotWord = timeSlots.length === 1 ? 'slot' : 'slots';

  return (
    <div className={styles.times_section}>
      <div className={styles.times_header}>
        <span className={styles.times_title}>Choose Your Time</span>
        <span className={styles.times_count}>
          {timeSlots.length} {slotWord} available
        </span>
      </div>
      <div className={containerClass}>
        {timeSlots.map((slot: Slot) => {
          const startTime = formatTime(slot.start);
          const slotsCount = !employee ? `${slot.available.length} left` : '';
          return (
            <div key={slot.id} className={itemClass}>
              <TimeSlotButton
                time={startTime}
                slotsCount={slotsCount}
                handleOpen={() => handleOpen(slot)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
