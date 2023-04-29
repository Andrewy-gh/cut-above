import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';

const TimePicker = ({ label, value, handleChange }) => {
  return <MuiTimePicker label={label} value={value} onChange={handleChange} />;
};

export default TimePicker;
