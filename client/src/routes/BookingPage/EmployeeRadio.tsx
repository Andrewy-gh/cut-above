import { useAppSelector } from '@/app/hooks';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { selectEmployeeById } from '@/features/employeeSlice';
import { useFilter } from '@/hooks/useFilter';

const radioGroupSx = {
  '& .MuiFormLabel-root': {
    fontFamily: 'Nobile, sans-serif',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#629aa4',
    '&.Mui-focused': { color: '#629aa4' },
  },
  '& .MuiFormControlLabel-label': {
    fontFamily: 'Nobile, sans-serif',
    color: '#E6B953',
    fontSize: '0.95rem',
  },
  '& .MuiRadio-root': {
    color: '#2a2a2a',
    '&.Mui-checked': { color: '#26C4E0' },
  },
};

interface EmployeeRadioOptionProps {
  employeeId: string;
}

const EmployeeRadioOption = ({ employeeId }: EmployeeRadioOptionProps) => {
  const employee = useAppSelector((state) =>
    selectEmployeeById(state, employeeId)
  );

  if (!employee) return null;

  return (
    <FormControlLabel
      value={employee.id}
      control={<Radio size="small" />}
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
    <FormControl sx={radioGroupSx}>
      <FormLabel>Available Barbers</FormLabel>
      <RadioGroup
        value={employee?.id ?? ''}
        onChange={(e) => handleEmployeeChange(e.target.value)}
        row
      >
        {employees.map((employeeId) => (
          <EmployeeRadioOption key={employeeId} employeeId={employeeId} />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
