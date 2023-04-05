import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import date from '../features/date/date';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const TimeSlot = ({ slot, handleClick }) => {
  return (
    <Grid item>
      <Item onClick={() => handleClick(slot.id)}>
        <Typography variant="body1">
          {date.dateShort(slot.date)} {date.time(slot.time)}{' '}
        </Typography>
      </Item>
    </Grid>
  );
};

const TimeSlots = ({ setSelected, timeSlots }) => {
  const handleClick = (id) => {
    setSelected(id);
  };
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" align="center">
        Times Available
      </Typography>
      <Grid container spacing={1} justifyContent="center">
        {timeSlots.map((slot) => (
          <TimeSlot slot={slot} key={slot.id} handleClick={handleClick} />
        ))}
      </Grid>
    </Box>
  );
};

export default TimeSlots;
