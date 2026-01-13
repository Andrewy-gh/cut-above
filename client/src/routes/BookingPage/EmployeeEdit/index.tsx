import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import styles from './styles.module.css';
import PropTypes from 'prop-types';
import { userPropType } from '@/utils/propTypes';

export default function EmployeeEdit({ employee, handleClick }) {
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

EmployeeEdit.propTypes = {
  employee: userPropType.isRequired,
  handleClick: PropTypes.func.isRequired,
};
