import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import DatePicker from '../../components/Datepicker';
import TimeCheckBox from '../../components/TimeCheckBox';
import dateServices from '../date/date';
import { useState } from 'react';
import { useAddScheduleMutation } from './scheduleSlice';
import { useDispatch } from 'react-redux';
import {
  clearAlert,
  setError,
  setSuccess,
} from '../notification/notificationSlice';

const AddSchedule = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState(dateServices.currentDate());
  const [addSchedule, { isLoading }] = useAddScheduleMutation();

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };
  const handleAddSchedule = async (obj) => {
    try {
      const apptsForDate = obj.map((o) => {
        return {
          ...o,
          date: dateServices.convertEST(date),
        };
      });
      const addedSchedule = await addSchedule(apptsForDate).unwrap();
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
        <DatePicker date={date} handleDateChange={handleDateChange} />
        <TimeCheckBox
          date={dateServices.dateHyphen(date)}
          createSchedule={handleAddSchedule}
        />
      </Box>
    </Container>
  );
};

export default AddSchedule;
