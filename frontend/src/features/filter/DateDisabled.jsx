import { FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { useDispatch, useSelector } from 'react-redux';
import { selectDateDisabled, setDateDisabled } from './filterSlice';
import { useState } from 'react';

const DateDisabled = () => {
  const dispatch = useDispatch();
  const dateDisabled = useSelector(selectDateDisabled);
  const [checked, setChecked] = useState(false);

  const handleSwitchChange = () => {
    setChecked(!checked);
    dispatch(setDateDisabled(!dateDisabled));
  };
  return (
    <div>
      <FormControlLabel
        checked={checked}
        control={<Switch />}
        label="Any Date"
        onChange={handleSwitchChange}
      />
    </div>
  );
};

export default DateDisabled;
