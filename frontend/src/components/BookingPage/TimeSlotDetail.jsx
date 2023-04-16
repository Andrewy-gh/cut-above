import Box from '@mui/material/Box';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { selectScheduleById } from '../../features/schedule/scheduleSlice';
import Employee from '../../features/employees/Employee';
import Item from '../Item';
import { theme } from '../../styles/styles';

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
                  <Item selected={style(employeeId)}>
                    <Employee
                      employeeId={employeeId}
                      selected={style(employeeId)}
                    />
                  </Item>
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
