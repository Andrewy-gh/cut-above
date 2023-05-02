import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Item from '../Item';
import AppointmentItem from './AppointmentItem';

const Column = styled(Paper)(({ theme }) => ({
  margin: '8px',
  border: '1px solid white',
  borderRadius: '2px',
  // width: '220px',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const AppointmentBoard = ({ appointments }) => {
  const scheduled = appointments.filter((appt) => appt.status === 'scheduled');
  const checkedIn = appointments.filter((appt) => appt.status === 'checked-in');
  const completed = appointments.filter((appt) => appt.status === 'completed');
  console.log({ appointments, scheduled, checkedIn, completed });

  return (
    <Container>
      <Box sx={{ display: 'flex' }}>
        <Column>
          <Typography variant="h5">Checked In</Typography>
          {checkedIn.map((ci) => (
            <Item>
              <AppointmentItem appointment={ci} />
            </Item>
          ))}
        </Column>
        <Column>
          <Typography variant="h5">Scheduled</Typography>
          {scheduled.map((sc) => (
            <Item>
              <AppointmentItem appointment={sc} />
            </Item>
          ))}
        </Column>
        <Column>
          <Typography variant="h5">Completed</Typography>
          {completed.map((c) => (
            <Item>
              <AppointmentItem appointment={c} />
            </Item>
          ))}
        </Column>
      </Box>
    </Container>
  );
};

export default AppointmentBoard;

// const Item = styled(Paper)(({ theme }) => ({
//   border: '3px solid lightgrey',
//   padding: '8px',
//   marginBottom: '8px',
//   borderRadius: '2px',
//   backgroundColor: 'white',
// }));
