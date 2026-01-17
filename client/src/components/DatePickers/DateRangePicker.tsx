import { MobileDateRangePicker } from '@mui/x-date-pickers-pro/MobileDateRangePicker';
import dayjs from 'dayjs';

interface DateRangerPickerProps {
  dates: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  handleDateChange: (value: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => void;
  minDate: dayjs.Dayjs;
  maxDate: dayjs.Dayjs;
}

export default function DateRangerPicker({
  dates,
  handleDateChange,
  minDate,
  maxDate,
}: DateRangerPickerProps) {
  return (
    <div>
      <MobileDateRangePicker
        value={dates}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}
