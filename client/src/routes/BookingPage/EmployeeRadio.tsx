import { useSelector } from 'react-redux';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

// @ts-expect-error TS(2307): Cannot find module '@/features/employeeSlice' or i... Remove this comment to see the full error message
import { selectEmployeeById } from '@/features/employeeSlice';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useFilter' or its corr... Remove this comment to see the full error message
import { useFilter } from '@/hooks/useFilter';

const EmployeeRadioOption = ({
  employeeId
}: any) => {
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );
  return (
    <FormControlLabel
      value={employee.id}
      control={<Radio />}
      label={employee.firstName}
    />
  );
};

export default function EmployeeRadio({
  employees
}: any) {
  const { employee, handleEmployeeChange } = useFilter();

  return (
    <FormControl>
      <FormLabel>Available Barbers:</FormLabel>
      <RadioGroup
        value={employee}
        onChange={(e) => handleEmployeeChange(e.target.value)}
      >
        {employees.map((employeeId: any) => <EmployeeRadioOption key={employeeId} employeeId={employeeId} />)}
      </RadioGroup>
    </FormControl>
  );
}
