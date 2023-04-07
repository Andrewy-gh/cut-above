import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectScheduleById } from '../features/schedule/scheduleSlice';
import Employee from '../features/employees/Employee';

const TimeSlotDetail = ({ selected }) => {
  const slot = useSelector((state) => selectScheduleById(state, selected));

  return (
    <>
      {slot?.available && (
        <Container sx={{ mt: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6" align="center">
              Available Barbers
            </Typography>
            {slot.available.map((person) => {
              return (
                <Box key={person.id}>
                  <Employee employeeId={person.id} />
                </Box>
              );
            })}
          </Stack>
        </Container>
      )}
    </>
  );
};

export default TimeSlotDetail;
