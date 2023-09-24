import { MobileDateRangePicker } from '@mui/x-date-pickers-pro/MobileDateRangePicker';

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
