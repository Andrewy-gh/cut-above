import { MobileDateRangePicker } from '@mui/x-date-pickers-pro/MobileDateRangePicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

export default function DateRangerPicker({
  dates,
  handleDateChange,
  minDate,
  maxDate,
}) {
  return (
    <div>
      <MobileDateRangePicker
        value={dates}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        // sx={{
        //   display: { xs: 'block', md: 'none' },
        // }}
      />
    </div>
  );
}

DateRangerPicker.propTypes = {
  dates: PropTypes.array.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(dayjs).isRequired,
  maxDate: PropTypes.instanceOf(dayjs).isRequired,
};
