import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllEmployees, useGetEmployeesQuery } from './employeeSlice';
import { theme } from '../../styles/styles';
import { selectEmployee, setEmployee } from '../filter/filterSlice';

const EmployeeSelect = () => {
  const dispatch = useDispatch();
  const employees = useSelector(selectAllEmployees);
  const employee = useSelector(selectEmployee);

  const { isLoading, isSuccess, isError, error } = useGetEmployeesQuery();

  const handleEmployeeChange = (employee) => {
    dispatch(setEmployee(employee));
  };

  let content;
  if (isLoading) {
    return <p>Loading...</p>;
  } else if (isSuccess) {
    content = (
      <FormControl
        sx={{
          width: '100%',
        }}
      >
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
  } else if (isError) {
    content = <p>{error}</p>;
  }
  return <>{content}</>;
};

export default EmployeeSelect;
