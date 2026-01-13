import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { userPropType } from '@/utils/propTypes';

export default function EmployeeEdit({
  employee,
  handleClick
}: any) {
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
