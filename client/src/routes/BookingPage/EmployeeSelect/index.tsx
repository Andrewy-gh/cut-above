import { useAppSelector } from '@/app/hooks';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { selectAllEmployees } from '@/features/employeeSlice';
import { useFilter } from '@/hooks/useFilter';
import { theme } from '@/styles/styles';

export default function EmployeeSelect() {
  const employees = useAppSelector(selectAllEmployees);
  const { employee, handleEmployeeChange } = useFilter();

  const employeeId = employee?.id;

  return (
    <FormControl fullWidth>
      <InputLabel>Choose a barber</InputLabel>
      <Select
        label="Barber"
        value={employeeId || ''}
        fullWidth
        onChange={(e) => handleEmployeeChange(e.target.value || undefined)}
        sx={{ color: theme.palette.secondary.main }}
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
