import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DateRangerPicker from '../../components/DateRangePicker';
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
  const closeTime = '11:00';
  const currentDate = dayjs().format('YYYY-MM-DD');
  const openString = `${currentDate} ${openTime}`;
  const closeString = `${currentDate} ${closeTime}`;
  const [open, setOpen] = useState(dayjs(openString));
  const [close, setClose] = useState(dayjs(closeString));

  const [dates, setDates] = useState([
    dayjs(),
    dayjs().add(2, 'week'),
    // .add(1, 'month')
  ]);

  const [addSchedule] = useAddScheduleMutation();

  const handleDateChange = (newDates) => {
    setDates(newDates);
  };

  const handleAddSchedule = async (dates) => {
    try {
      const schedules = dateServices.generateDateRanges(dates, open, close);
      const addedSchedules = await addSchedule(schedules).unwrap();
      dispatch(setSuccess(addedSchedules.message));
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
          gap: 2,
          mt: '8px',
          padding: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Choose your dates:
        </Typography>
        <DateRangerPicker
          dates={dates}
          handleDateChange={handleDateChange}
          minDate={dayjs()}
          maxDate={dayjs().add(1, 'month')}
        />
        <Typography variant="h5" sx={{ mb: 2 }}>
          Choose your times:
        </Typography>
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
      </Box>
    </Container>
  );
};

export default AddSchedule;
