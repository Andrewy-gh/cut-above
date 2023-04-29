import Box from '@mui/material/Box';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

const DatePicker = ({
  date,
  handleDateChange,
  dateDisabled,
  minDate,
  maxDate,
}) => {
  return (
    <Box>
      <MobileDatePicker
        label="Pick a date"
        format="MM/DD/YYYY"
        value={date}
        onChange={handleDateChange}
        sx={{
          width: '100%',
          display: { xs: 'block', md: 'none' },
        }}
        disabled={dateDisabled}
        minDate={minDate}
        maxDate={maxDate}
      />
      <DateCalendar
        value={date}
        onChange={handleDateChange}
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
        disabled={dateDisabled}
        minDate={minDate}
        maxDate={maxDate}
      />
    </Box>
  );
};

export default DatePicker;
