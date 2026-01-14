import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

import DatePicker from '@/components/DatePickers/DatePicker';
import EmployeeSelect from '../EmployeeSelect';
import ServiceSelect from '../ServiceSelect';
import AvailableTimes from '../AvailableTimes';

import { useFilter } from '@/hooks/useFilter';
import { selectScheduleByFilter } from '@/features/scheduleSlice';
import { currentDate, oneMonthFromCurrent } from '@/utils/date';
import { Slot } from '@/types';

import styles from './styles.module.css';

interface BookingFormProps {
  handleOpen: (data: Slot | Record<string, never>) => void;
  employee: string | { id: string; firstName: string };
}

export default function BookingForm({
  handleOpen,
  employee,
}: BookingFormProps) {
  const { date, handleDateChange } = useFilter();
  const timeSlots = useSelector(selectScheduleByFilter);
  return (
    <>
      <div className={styles.container}>
        <EmployeeSelect />
        <ServiceSelect />
        <DatePicker
          date={dayjs(date)}
          handleDateChange={handleDateChange}
          minDate={currentDate}
          maxDate={oneMonthFromCurrent}
        />
      </div>
      <AvailableTimes
        timeSlots={timeSlots}
        openDialog={handleOpen}
        employee={employee}
      />
    </>
  );
}
