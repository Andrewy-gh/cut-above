import dayjs from 'dayjs';
import DatePicker from '@/components/DatePickers/DatePicker';
import EmployeeSelect from '../EmployeeSelect';
import ServiceSelect from '../ServiceSelect';
import AvailableTimes from '../AvailableTimes';
import { useFilter } from '@/hooks/useFilter';
import { selectScheduleByFilter } from '@/features/scheduleSlice';
import { currentDate, oneMonthFromCurrent } from '@/utils/date';
import { useSelector } from 'react-redux';
import styles from './styles.module.css';
import PropTypes from 'prop-types';

export default function BookingForm({ handleOpen, employee }) {
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

BookingForm.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  employee: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
    }),
  ]).isRequired,
};
