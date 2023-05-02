import Box from '@mui/material/Box';
import { DateRangePicker as DateRangeMui } from '@mui/x-date-pickers-pro/DateRangePicker';
import { MobileDateRangePicker } from '@mui/x-date-pickers-pro/MobileDateRangePicker';

const DateRangerPicker = ({ dates, handleDateChange, minDate, maxDate }) => {
  return (
    <Box>
      <MobileDateRangePicker
        value={dates}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        // sx={{
        //   display: { xs: 'block', md: 'none' },
        // }}
      />
      {/* <DateRangeMui
        value={dates}
        onChange={(newValue) => setDates(newValue)}
        minDate={dayjs()}
        maxDate={dayjs().add(1, 'month')}
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
      /> */}
    </Box>
  );
};

export default DateRangerPicker;
