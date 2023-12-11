import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import { selectEmployeeById } from '@/features/employeeSlice';
import styles from './styles.module.css';

export default function EmployeeEdit({ employeeId, handleClick }) {
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );
  return (
    <div className={styles.flex_sb}>
      <div className={styles.flex}>
        <PersonIcon />
        <div className={`body2 ${styles.yellow}`}>{employee.firstName}</div>
      </div>
      <Button onClick={handleClick}>Edit</Button>
    </div>
  );
}
