import { Paper, Stack } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { selectScheduleById } from '../features/schedule/scheduleSlice';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
}));

const TimeSlotDetail = ({ selected }) => {
  const slot = useSelector((state) => selectScheduleById(state, selected));
  console.log(slot);

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
                  <Item>
                    <Avatar
                      alt={person.firstName}
                      src={person.image}
                      sx={{ width: 56, height: 56 }}
                    />
                    <Typography variant="body1">{person.firstName}</Typography>
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
