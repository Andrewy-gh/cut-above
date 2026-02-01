import dayjs from 'dayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

interface DatePickerProps {
  date: dayjs.Dayjs;
  handleDateChange: (value: dayjs.Dayjs) => void;
  minDate: dayjs.Dayjs;
  maxDate: dayjs.Dayjs;
}

export default function DatePicker({
  date,
  handleDateChange,
  minDate,
  maxDate,
}: DatePickerProps) {
  const handleChange = (value: dayjs.Dayjs | null) => {
    if (value) {
      handleDateChange(value);
    }
  };

  return (
    <div>
      <MobileDatePicker
        label="Pick a date"
        format="MM/DD/YYYY"
        value={date}
        onChange={handleChange}
        sx={{
          width: '100%',
          display: { xs: 'block', md: 'none' },
        }}
        minDate={minDate}
        maxDate={maxDate}
      />
      <DateCalendar
        value={date}
        onChange={handleChange}
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}
