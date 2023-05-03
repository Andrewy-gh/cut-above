import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Item from '../Item';
import AppointmentItem from './AppointmentItem';
import ChangeStatus from './ChangeStatus';

const Column = styled(Box)(({ theme }) => ({
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        }}
      >
        <Column>
          <Typography variant="h5" component="div">
            Checked In
          </Typography>
          {checkedIn.map((ci) => (
            <Item key={ci.id}>
              <AppointmentItem appointment={ci} />
              <ChangeStatus appointment={ci} newStatus={'completed'} />
            </Item>
          ))}
        </Column>
        <Column>
          <Typography variant="h5" component="div">
            Scheduled
          </Typography>
          {scheduled.map((sc) => (
            <Item key={sc.id}>
              <AppointmentItem appointment={sc} />
              <ChangeStatus appointment={sc} newStatus={'checked-in'} />
            </Item>
          ))}
        </Column>
        <Column>
          <Typography variant="h5" component="div">
            Completed
          </Typography>
          {completed.map((c) => (
            <Item key={c.id}>
              <AppointmentItem appointment={c} />
              <ChangeStatus appointment={c} newStatus={'scheduled'} />
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
