import { selectAllAppointment, useGetAppointmentQuery } from './apptApiSlice';
import { useSelector } from 'react-redux';
import Employee from '../employees/Employee';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Item from '../../components/Item';
import CircleProgress from '../../components/Loading/CircleProgress';
import Stack from '@mui/material/Stack';
import CancelAppointment from './CancelAppointment';
import ModifyAppointment from './ModifyAppointment';

const Appointment = () => {
  const { isLoading, isSuccess, isError, error } = useGetAppointmentQuery();
  const appointments = useSelector(selectAllAppointment);

  let content;
  if (isLoading) {
    content = <CircleProgress />;
  } else if (isSuccess) {
    content =
      appointments.length > 0 ? (
        appointments.map((appt) => (
          <Item key={appt.id}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Typography variant="body1">{appt.date}</Typography>
                <Typography variant="body1">{appt.start}</Typography>
                <Employee employeeId={appt.employee} />
                <ModifyAppointment appt={appt} />
                <CancelAppointment appt={appt} />
              </Box>
            </Box>
          </Item>
        ))
      ) : (
        <Typography component="h4" variant="h5" align="center">
          No appointments made
        </Typography>
      );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return (
    <Box>
      <Typography
        component="h3"
        variant="h4"
        align="center"
        gutterBottom
        sx={{ mt: 2, mb: 3 }}
      >
        Upcoming appointments
      </Typography>
      <Stack spacing={2}>{content}</Stack>
    </Box>
  );
};

export default Appointment;
