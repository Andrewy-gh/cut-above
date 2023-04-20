import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DatePicker from '../../components/Datepicker';
import dateServices from '../date/date';
import { useState } from 'react';
import { useAddScheduleMutation } from './scheduleSlice';
import { useDispatch } from 'react-redux';
import { setError, setSuccess } from '../notification/notificationSlice';
import dayjs from 'dayjs';

// TODO: Date service conhesiveness
const AddSchedule = () => {
  const dispatch = useDispatch();
  const openTime = '10:00';
  const closeTime = '18:00';
  const [date, setDate] = useState(dateServices.currentDate());
  const currentDate = dayjs().format('YYYY-MM-DD');
  const openString = `${currentDate} ${openTime}`;
  const closeString = `${currentDate} ${closeTime}`;
  const [open, setOpen] = useState(dayjs(openString));
  const [close, setClose] = useState(dayjs(closeString));

  const [addSchedule] = useAddScheduleMutation();

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAddSchedule = async () => {
    try {
      // const apptsForDate = obj.map((o) => {
      //   return {
      //     ...o,
      //     date: dateServices.convertEST(date),
      //   };
      // });
      const addedSchedule = await addSchedule({ date, open, close }).unwrap();
      dispatch(setSuccess(addedSchedule.message));
    } catch (error) {
      dispatch(setError(`Failed to save new schedule: ${error}`));
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '10px',
          mt: '8px',
          padding: 2,
        }}
      >
        <DatePicker
          date={date}
          handleDateChange={handleDateChange}
          minDate={dayjs()}
          maxDate={dayjs().add(1, 'month')}
        />
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
        <Button variant="contained" onClick={handleAddSchedule}>
          Add Schedule
        </Button>
      </Box>
    </Container>
  );
};

export default AddSchedule;
