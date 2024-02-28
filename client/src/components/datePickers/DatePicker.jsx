import dayjs from 'dayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import PropTypes from 'prop-types';

export default function DatePicker({
  date,
  handleDateChange,
  // dateDisabled,
  minDate,
  maxDate,
}) {
  return (
    <div>
      <MobileDatePicker
        label="Pick a date"
        format="MM/DD/YYYY"
        value={date}
        onChange={handleDateChange}
        sx={{
          width: '100%',
          display: { xs: 'block', md: 'none' },
        }}
        // disabled={dateDisabled}
        minDate={minDate}
        maxDate={maxDate}
      />
      <DateCalendar
        value={date}
        onChange={handleDateChange}
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
        // disabled={dateDisabled}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}

DatePicker.propTypes = {
  date: PropTypes.instanceOf(dayjs).isRequired,
  handleDateChange: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(dayjs).isRequired,
  maxDate: PropTypes.instanceOf(dayjs).isRequired,
};
