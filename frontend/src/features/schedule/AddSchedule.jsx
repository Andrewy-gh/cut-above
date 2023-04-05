import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import DatePicker from '../../components/Datepicker';
import TimeCheckBox from '../../components/TimeCheckBox';
import dateServices from '../date/date';
import { useState } from 'react';
import { useAddScheduleMutation } from './scheduleSlice';

const AddSchedule = () => {
  const [date, setDate] = useState(dateServices.currentDate());
  const [addSchedule, { isLoading }] = useAddScheduleMutation();

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const addClasses = async (obj) => {
    try {
      const apptsForDate = obj.map((o) => {
        return {
          ...o,
          date: dateServices.convertEST(date),
        };
      });
      await addSchedule(apptsForDate);
    } catch (error) {
      console.error('failed to save new schedule', error);
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
          date={dateServices.dateDash(date)}
          createClasses={addClasses}
        />
      </Box>
    </Container>
  );
};

export default AddSchedule;
