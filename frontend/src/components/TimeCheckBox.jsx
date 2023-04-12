import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import dateServices from '../features/date/date';

const times = [
  { id: 1, time: '09:00:00-05:00' },
  { id: 2, time: '10:00:00-05:00' },
  { id: 3, time: '11:00:00-05:00' },
];

const TimeCheckBox = ({ date, createClasses }) => {
  const [activeCheck, setActiveCheck] = useState([]);
  const defaultNumberOfSlots = 3;

  const addClasses = () => {
    const timesToCreate = activeCheck.map((a) => {
      return {
        time: a.time,
      };
    });
    createClasses(timesToCreate);
  };

  const found = (id) => {
    return activeCheck.find((time) => time.id === id);
  };

  const handleCheck = (obj) => {
    if (found(obj.id)) {
      setActiveCheck(activeCheck.filter((slot) => slot.id !== obj.id));
    } else {
      const checkedBox = {
        id: obj.id,
        time: obj.time,
        slots: defaultNumberOfSlots,
      };
      setActiveCheck([...activeCheck, checkedBox]);
    }
  };

  const handleSlotChange = (event, id) => {
    const slotToUpdate = activeCheck.find((time) => time.id === id);
    slotToUpdate.slots = Number(event.target.value);
    setActiveCheck(
      activeCheck.map((slot) =>
        slot.id === slotToUpdate.id ? slotToUpdate : slot
      )
    );
  };

  const fullTimes = times.map((slot) => {
    return { ...slot, time: `${date}T${slot.time}` };
  });

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      <FormControl>
        <FormLabel sx={{ textAlign: 'center', mb: 2 }}>Class Times</FormLabel>
        <Box sx={{ display: 'flex' }}>
          {fullTimes.map((slot) => {
            return (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                key={slot.id}
              >
                <FormControlLabel
                  value={slot.time}
                  control={<Checkbox />}
                  label={dateServices.time(slot.time)}
                  name={dateServices.time(slot.time)}
                  labelPlacement="top"
                  onClick={() => handleCheck(slot)}
                  sx={{ mb: 2 }}
                />
                {found(slot.id) && (
                  <>
                    <FormLabel>Slots</FormLabel>
                    <TextField
                      label="slots"
                      name="slots"
                      defaultValue={defaultNumberOfSlots}
                      sx={{ width: 50, mt: 2, mb: 2 }}
                      onChange={(event) => handleSlotChange(event, slot.id)}
                    ></TextField>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
        {activeCheck && (
          <Button onClick={addClasses} variant="contained" fullWidth>
            Add Classes
          </Button>
        )}
      </FormControl>
    </Box>
  );
};

export default TimeCheckBox;
