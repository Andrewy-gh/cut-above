import { useState } from 'react';
import DatePicker from '../../components/Datepicker';
import TimeSlots from '../../components/TimeSlots';
import TimeSlotDetail from '../../components/TimeSlotDetail';
import dateServices from '../date/date';
import { selectAllSchedule, useGetScheduleQuery } from './scheduleSlice';
import { useSelector } from 'react-redux';

const BookingPage = () => {
  const [search, setSearch] = useState({
    employee: 'any',
    date: dateServices.currentDate(),
  });
  const [selected, setSelected] = useState();
  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();

  const schedule = useSelector(selectAllSchedule);

  const handleDateChange = (newDate) => {
    const newSearch = {
      ...search,
      date: newDate,
    };
    setSearch(newSearch);
  };

  const timeSlots = schedule.filter(
    (s) => dateServices.dateDash(s.date) === dateServices.dateDash(search.date)
  );

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    content = (
      <>
        <DatePicker handleDateChange={handleDateChange} />
        <TimeSlots timeSlots={timeSlots} setSelected={setSelected} />
        {selected && <TimeSlotDetail selected={selected} />}
      </>
    );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <main>{content}</main>;
};

export default BookingPage;
