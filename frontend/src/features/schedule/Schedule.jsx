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
    content = <Typography variant="body2">Loading...</Typography>;
  } else if (isSuccess) {
    content = schedule.map((sc) => (
      <Box key={sc.id}>
        <Typography variant="h6">{date.dateSlash(sc.date)}</Typography>
        {sc.appointments.map((appt) => (
          <Item key={appt.id}>
            <Typography variant="body2">
              Start: {date.time(appt.start)}
            </Typography>
            <Typography variant="body2">End: {date.time(appt.end)} </Typography>
            <Typography variant="body2">
              <User userId={appt.client} />
            </Typography>
            <Typography variant="body2">
              <User userId={appt.employee} />
            </Typography>
            <Typography variant="body2">{appt.service}</Typography>
          </Item>
        ))}
      </Box>
    ));
  } else if (isError) {
    content = <Typography variant="body2">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" align="center">
        Schedule
      </Typography>
      {content}
    </Box>
  );
}

export default Schedule;
