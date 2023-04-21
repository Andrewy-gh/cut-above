import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { theme } from '../../styles/styles';
import { useSelector } from 'react-redux';
import date from '../../features/date/date';
import { selectEmployee } from '../../features/filter/filterSlice';
import dayjs from 'dayjs';

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

const selectedStyle = {
  backgroundColor: theme.palette.secondary.light,
};

const selectedFont = {
  color: '#1A2027',
};

const TimeSlot = ({ slot, handleClick, style, preference }) => {
  return (
    <Grid item>
      <Item
        onClick={() => handleClick(slot.id)}
        style={style ? selectedStyle : null}
      >
        <Typography variant="body1" style={style ? selectedFont : null}>
          {/* {date.dateShort(slot.date)}{' '} */}
          {dayjs(slot.start, 'HH:mm').format('h:mma')}{' '}
          {preference === 'any' && (
            <>
              {slot.available.length}
              {slot.available.length > 1 ? ' slots ' : ' slot '}
              left
            </>
          )}
        </Typography>
      </Item>
    </Grid>
  );
};

const TimeSlots = ({
  selected,
  setSelected,
  timeSlots,
  setConfirmDisabled,
}) => {
  const employeePref = useSelector(selectEmployee);
  const [styledId, setStyledId] = useState(selected.slot);
  if (selected.slot !== styledId) {
    setStyledId(null);
  }
  const style = (id) => id === styledId;
  const handleClick = (id) => {
    if (employeePref !== 'any') {
      setConfirmDisabled(false);
    } else {
      setConfirmDisabled(true);
    }
    setStyledId(id);
    setSelected({ ...selected, slot: id });
  };

  return (
    <>
      {timeSlots.length > 0 ? (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" align="center">
            Times Available
          </Typography>
          <Grid container spacing={1} justifyContent="center">
            {timeSlots.map((slot) => (
              <TimeSlot
                slot={slot}
                key={slot.id}
                preference={employeePref}
                handleClick={handleClick}
                style={style(slot.id)}
              />
            ))}
          </Grid>
        </Box>
      ) : (
        <Typography variant="h6" align="center">
          No Times Available
        </Typography>
      )}
    </>
  );
};

export default TimeSlots;
