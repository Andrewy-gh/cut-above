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

  const calendarSx = {
    '& .MuiPickersDay-root': {
      fontFamily: 'Nobile, sans-serif',
      color: '#ccc',
      '&:hover': { backgroundColor: 'rgba(3, 126, 148, 0.15)', color: '#26C4E0' },
      '&.Mui-selected': {
        backgroundColor: '#037E94',
        color: '#fff',
        fontWeight: 700,
        '&:hover': { backgroundColor: '#026272' },
        '&:focus': { backgroundColor: '#037E94' },
      },
      '&.MuiPickersDay-today:not(.Mui-selected)': {
        border: '1px solid #037E94',
        color: '#26C4E0',
      },
    },
    '& .MuiDayCalendar-weekDayLabel': {
      fontFamily: 'Nobile, sans-serif',
      color: '#629aa4',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    '& .MuiPickersCalendarHeader-label': {
      fontFamily: 'Corben, sans-serif',
      fontWeight: 700,
      color: '#E6B953',
    },
    '& .MuiPickersArrowSwitcher-button': {
      color: '#629aa4',
      '&:hover': { color: '#26C4E0' },
    },
    '& .MuiPickersDay-root.Mui-disabled': {
      color: '#3a3a3a',
    },
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
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1f1f1f',
            borderRadius: '0.625rem',
            '& fieldset': { borderColor: '#2a2a2a' },
            '&:hover fieldset': { borderColor: '#037E94' },
            '&.Mui-focused fieldset': { borderColor: '#26C4E0' },
          },
          '& .MuiInputLabel-root': {
            color: '#888',
            fontFamily: 'Nobile, sans-serif',
            '&.Mui-focused': { color: '#26C4E0' },
          },
          '& .MuiInputBase-input': { color: '#E6B953', fontFamily: 'Nobile, sans-serif' },
          '& .MuiSvgIcon-root': { color: '#629aa4' },
        }}
        minDate={minDate}
        maxDate={maxDate}
      />
      <DateCalendar
        value={date}
        onChange={handleChange}
        sx={{
          display: { xs: 'none', md: 'block' },
          ...calendarSx,
        }}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}
