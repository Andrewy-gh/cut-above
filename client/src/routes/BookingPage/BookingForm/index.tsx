import dayjs from 'dayjs';

// @ts-expect-error TS(2307): Cannot find module '@/components/DatePickers/DateP... Remove this comment to see the full error message
import DatePicker from '@/components/DatePickers/DatePicker';
import EmployeeSelect from '../EmployeeSelect';
import ServiceSelect from '../ServiceSelect';
import AvailableTimes from '../AvailableTimes';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useFilter' or its corr... Remove this comment to see the full error message
import { useFilter } from '@/hooks/useFilter';

// @ts-expect-error TS(2307): Cannot find module '@/features/scheduleSlice' or i... Remove this comment to see the full error message
import { selectScheduleByFilter } from '@/features/scheduleSlice';

// @ts-expect-error TS(2307): Cannot find module '@/utils/date' or its correspon... Remove this comment to see the full error message
import { currentDate, oneMonthFromCurrent } from '@/utils/date';
import { useSelector } from 'react-redux';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

export default function BookingForm({
  handleOpen,
  employee
}: any) {
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
