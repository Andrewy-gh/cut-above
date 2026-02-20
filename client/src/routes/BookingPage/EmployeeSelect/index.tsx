import { useAppSelector } from '@/app/hooks';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { selectAllEmployees } from '@/features/employeeSlice';
import { useFilter } from '@/hooks/useFilter';

const selectSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#1f1f1f',
    borderRadius: '0.625rem',
    '& fieldset': { borderColor: '#2a2a2a' },
    '&:hover fieldset': { borderColor: '#037E94' },
    '&.Mui-focused fieldset': { borderColor: '#26C4E0', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    color: '#888',
    fontFamily: 'Nobile, sans-serif',
    '&.Mui-focused': { color: '#26C4E0' },
    '&.MuiFormLabel-filled:not(.Mui-focused)': { color: '#629aa4' },
  },
  '& .MuiSelect-select': {
    color: '#E6B953',
    fontFamily: 'Nobile, sans-serif',
  },
  '& .MuiSvgIcon-root': { color: '#629aa4' },
};

export default function EmployeeSelect() {
  const employees = useAppSelector(selectAllEmployees);
  const { employee, handleEmployeeChange } = useFilter();

  const employeeId = employee?.id;

  return (
    <FormControl fullWidth sx={selectSx}>
      <InputLabel>Choose a barber</InputLabel>
      <Select
        label="Choose a barber"
        value={employeeId || ''}
        fullWidth
        onChange={(e) => handleEmployeeChange(e.target.value || undefined)}
      >
        <MenuItem value="">No preference</MenuItem>
        {employees.map((emp) => {
          return (
            <MenuItem value={emp.id} key={emp.id}>
              {emp.firstName}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
