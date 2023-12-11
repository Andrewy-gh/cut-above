import dayjs from 'dayjs';
import DatePicker from '@/components/datePickers/DatePicker';
import EmployeeSelect from './EmployeeSelect';
import ServiceSelect from './ServiceSelect';
import AvailableTimes from './AvailableTimes/';
import { useFilter } from '@/hooks/useFilter';
import { selectScheduleByFilter } from '@/features/scheduleSlice';
import { currentDate, oneMonthFromCurrent } from '@/utils/date';
import { useSelector } from 'react-redux';
import styles from './styles.module.css';

export default function BookingForm({ handleOpen }) {
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
      <AvailableTimes timeSlots={timeSlots} openDialog={handleOpen} />
    </>
  );
}
