import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';

import styles from './styles.module.css';

interface EmployeeEditProps {
  employee: {
    firstName: string;
  };
  handleClick: () => void;
}

export default function EmployeeEdit({
  employee,
  handleClick,
}: EmployeeEditProps) {
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
