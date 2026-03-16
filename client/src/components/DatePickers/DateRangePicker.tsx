import { MobileDateRangePicker } from '@mui/x-date-pickers-pro/MobileDateRangePicker';
import type { DateRange } from '@mui/x-date-pickers-pro/models';
import dayjs from 'dayjs';

interface DateRangePickerProps {
  dates: DateRange<dayjs.Dayjs>;
  handleDateChange: (value: DateRange<dayjs.Dayjs>) => void;
  minDate: dayjs.Dayjs;
  maxDate: dayjs.Dayjs;
}

export default function DateRangePicker({
  dates,
  handleDateChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
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
