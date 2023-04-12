import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectScheduleById } from '../features/schedule/scheduleSlice';
import Employee from '../features/employees/Employee';
import { useState } from 'react';

const TimeSlotDetail = ({ selected, setConfirmDisabled, setSelected }) => {
  const slot = useSelector((state) => selectScheduleById(state, selected.slot));

  const [styledId, setStyledId] = useState(null);
  const style = (id) => id === styledId;
  const handleClick = (id) => {
    setConfirmDisabled(false);
    setStyledId(id);
    setSelected({ ...selected, employee: id });
  };

  return (
    <>
      {slot?.available && (
        <Container sx={{ mt: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6" align="center">
              Available Barbers
            </Typography>
            {slot.available.map((employeeId) => {
              return (
                <Box key={employeeId} onClick={() => handleClick(employeeId)}>
                  <Employee employeeId={employeeId} style={style(employeeId)} />
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
