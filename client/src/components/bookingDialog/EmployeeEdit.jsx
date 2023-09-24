import { useSelector } from 'react-redux';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import { selectEmployeeById } from '../../features/employeeSlice';

export default function EmployeeEdit({ employeeId, handleClick }) {
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <PersonIcon />
        <Typography variant="body1">{employee.firstName}</Typography>
      </div>
      <Button onClick={handleClick}>Edit</Button>
    </div>
  );
}
