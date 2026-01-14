import { useSelector } from 'react-redux';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { selectEmployeeById } from '@/features/employeeSlice';
import { useFilter } from '@/hooks/useFilter';

interface EmployeeRadioOptionProps {
  employeeId: string;
}

const EmployeeRadioOption = ({ employeeId }: EmployeeRadioOptionProps) => {
  const employee = useSelector((state: any) =>
    selectEmployeeById(state, employeeId)
  );

  if (!employee) return null;

  return (
    <FormControlLabel
      value={employee._id}
      control={<Radio />}
      label={employee.firstName}
    />
  );
};

interface EmployeeRadioProps {
  employees: string[];
}

export default function EmployeeRadio({ employees }: EmployeeRadioProps) {
  const { employee, handleEmployeeChange } = useFilter();

  return (
    <FormControl>
      <FormLabel>Available Barbers:</FormLabel>
      <RadioGroup
        value={employee}
        onChange={(e) => handleEmployeeChange(e.target.value)}
      >
        {employees.map((employeeId) => (
          <EmployeeRadioOption key={employeeId} employeeId={employeeId} />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
