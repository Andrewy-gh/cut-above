import styles from './styles.module.css';

interface EmployeeEditProps {
  employee: {
    firstName: string;
  } | undefined;
  handleClick: () => void;
}

export default function EmployeeEdit({
  employee,
  handleClick,
}: EmployeeEditProps) {
  if (!employee) return null;

  return (
    <div className={styles.employee_row}>
      <div className={styles.employee_info}>
        <div className={styles.employee_avatar}>
          {employee.firstName.charAt(0).toUpperCase()}
        </div>
        <span className={styles.employee_name}>{employee.firstName}</span>
      </div>
      <button className={styles.edit_btn} onClick={handleClick} type="button">
        Change
      </button>
    </div>
  );
}
