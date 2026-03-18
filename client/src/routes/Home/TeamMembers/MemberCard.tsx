import { Link } from 'react-router';
import Button from '@mui/material/Button';

import styles from './styles.module.css';
import { EmployeeProfile } from '@/types';

interface MemberCardProps {
  employee: EmployeeProfile;
  handleClick: (employee: EmployeeProfile) => void;
}

export default function MemberCard({ employee, handleClick }: MemberCardProps) {
  return (
    <div className={styles.card}>
      <img
        className={styles.card_image}
        src={employee.image}
        alt={employee.firstName}
      />
      <div className={styles.card_content}>
        <h4 className={styles.header}>{employee.firstName}</h4>
        <p className={`body1 ${styles.paragraph}`}>{employee.profile}</p>
      </div>
      <div className={styles.card_actions}>
        <Link to="/bookings" onClick={() => handleClick(employee)}>
          <Button
            size="small"
            variant="contained"
          >{`Book with ${employee.firstName}`}</Button>
        </Link>
      </div>
    </div>
  );
}
