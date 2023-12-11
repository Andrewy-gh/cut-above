import { useSelector } from 'react-redux';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { selectAllEmployees } from '../../../features/employeeSlice';
import { useFilter } from '../../../hooks/useFilter';
import { theme } from '../../../styles/styles';

export default function EmployeeSelect() {
  const employees = useSelector(selectAllEmployees);
  const { employee, handleEmployeeChange } = useFilter();
  return (
    <FormControl fullWidth>
      <InputLabel>Choose a barber</InputLabel>
      <Select
        label="Barber"
        value={employee}
        fullWidth
        onChange={(e) => handleEmployeeChange(e.target.value)}
        sx={{ color: theme.palette.secondary.main }}
      >
        <MenuItem value="any">No preference</MenuItem>
        {employees.map((employee) => {
          return (
            <MenuItem value={employee.id} key={employee.id}>
              {employee.firstName}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
