import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { selectAllSchedule, useGetScheduleQuery } from './scheduleSlice';
import Item from '../../components/Item';
import User from '../user/User';
import date from '../date/date';

function Schedule() {
  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();
  const schedule = useSelector(selectAllSchedule);

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    content = schedule.map((sc) => (
      <Box key={sc.id}>
        <Typography variant="h6">{date.dateSlash(sc.date)}</Typography>
        {sc.appointments.map((appt) => (
          <Item key={appt.id}>
            <p>Start: {date.time(appt.start)}</p>
            <p>End: {date.time(appt.end)} </p>
            <p>
              <User userId={appt.client} />
            </p>
            <p>
              <User userId={appt.employee} />
            </p>
            {appt.service}
          </Item>
        ))}
      </Box>
    ));
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return (
    <main>
      <Typography variant="h5" align="center">
        Schedule
      </Typography>
      {content}
    </main>
  );
}

export default Schedule;
