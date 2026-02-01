import { useState } from 'react';
import Button from '@mui/material/Button';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DateRangePicker from '@/components/DatePickers/DateRangePicker';
import type { DateRange } from '@mui/x-date-pickers-pro/models';
import dayjs, { Dayjs } from 'dayjs';
import { useAddScheduleMutation } from '@/features/scheduleSlice';
import { useNotification } from '@/hooks/useNotification';
import styles from './styles.module.css';

export default function AddSchedule() {
  const openTime = '10:00';
  const closeTime = '11:00';
  const currentDate = dayjs().format('YYYY-MM-DD');
  const openString = `${currentDate} ${openTime}`;
  const closeString = `${currentDate} ${closeTime}`;
  const [open, setOpen] = useState<Dayjs | null>(dayjs(openString));
  const [close, setClose] = useState<Dayjs | null>(dayjs(closeString));
  const [dates, setDates] = useState<DateRange<Dayjs>>([
    dayjs(),
    dayjs().add(2, 'week'),
  ]);
  const { handleSuccess, handleError } = useNotification();
  const [addSchedule] = useAddScheduleMutation();

  const handleDateChange = (newDates: DateRange<Dayjs>) => {
    setDates(newDates);
  };

  const handleAddSchedule = async (dates: DateRange<Dayjs>) => {
    const [startDate, endDate] = dates;
    if (!startDate || !endDate) {
      handleError('Please choose a start and end date');
      return;
    }

    try {
      const newSchedule = await addSchedule({
        dates: [startDate.toISOString(), endDate.toISOString()],
        open: open?.format('HH:mm') || openTime,
        close: close?.format('HH:mm') || closeTime,
      }).unwrap();
      if (newSchedule.success) handleSuccess(newSchedule.message);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="container-sm">
      <div className={styles.flex}>
        <h5>Choose your dates:</h5>
        <DateRangePicker
          dates={dates}
          handleDateChange={handleDateChange}
          minDate={dayjs()}
          maxDate={dayjs().add(1, 'month')}
        />
        <h5>Choose your times:</h5>
        <TimePicker
          label="open"
          value={open}
          onChange={(newOpen) => setOpen(newOpen)}
        />
        <TimePicker
          label="close"
          value={close}
          onChange={(newClose) => setClose(newClose)}
        />
        <Button variant="contained" onClick={() => handleAddSchedule(dates)}>
          Add Schedule
        </Button>
      </div>
    </div>
  );
}
