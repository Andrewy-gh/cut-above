import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import DatePicker from '../../components/Datepicker';
import TimeSlots from '../../components/TimeSlots';
import TimeSlotDetail from '../../components/TimeSlotDetail';
import dateServices from '../date/date';
import { selectAllSchedule, useGetScheduleQuery } from './scheduleSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectDate, selectDateDisabled, setDate } from '../filter/filterSlice';
import EmployeeSelect from '../employees/EmployeeSelect';
import DateDisabled from '../filter/DateDisabled';
import dayjs from 'dayjs';

const BookingPage = () => {
  const dispatch = useDispatch();
  const date = useSelector(selectDate);
  const convertedDate = dayjs(date);
  const dateDisabled = useSelector(selectDateDisabled);
  const [selected, setSelected] = useState();
  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();

  const schedule = useSelector(selectAllSchedule);

  const handleDateChange = (newDate) => {
    dispatch(setDate(newDate.toISOString()));
  };

  const timeSlots = schedule.filter(
    (s) => dateServices.dateHyphen(s.date) === dateServices.dateHyphen(date)
  );

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    content = (
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            // flexDirection: { sm: 'row', md: 'column' },
            alignItems: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          <EmployeeSelect />
          <DateDisabled />
          <DatePicker
            date={convertedDate}
            handleDateChange={handleDateChange}
            dateDisabled={dateDisabled}
          />
          <TimeSlots timeSlots={timeSlots} setSelected={setSelected} />
          {selected && <TimeSlotDetail selected={selected} />}
        </Box>
      </Container>
    );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <main>{content}</main>;
};

export default BookingPage;
