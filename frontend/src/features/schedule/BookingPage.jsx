import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import DatePicker from '../../components/Datepicker';
import TimeSlots from '../../components/TimeSlots';
import TimeSlotDetail from '../../components/TimeSlotDetail';
import dateServices from '../date/date';
import { selectAllSchedule, useGetScheduleQuery } from './scheduleSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setDate, setEmployee } from '../filter/filterSlice';
import EmployeeSelect from '../employees/EmployeeSelect';

const BookingPage = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState({
    employee: 'any',
    date: dateServices.currentDate(),
  });
  const [selected, setSelected] = useState();
  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();

  const schedule = useSelector(selectAllSchedule);

  const handleDateChange = (newDate) => {
    console.log('newDate', newDate);
    dispatch(setDate(newDate));
  };

  const timeSlots = schedule.filter(
    (s) => dateServices.dateDash(s.date) === dateServices.dateDash(search.date)
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
          <DatePicker handleDateChange={handleDateChange} />
        </Box>
        <TimeSlots timeSlots={timeSlots} setSelected={setSelected} />
        {selected && <TimeSlotDetail selected={selected} />}
      </Container>
    );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <main>{content}</main>;
};

export default BookingPage;
