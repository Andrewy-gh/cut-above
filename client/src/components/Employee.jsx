import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';
import PropTypes from 'prop-types';

export default function Employee({ employeeId }) {
  const { employee } = useEmployeesQuery(employeeId);
  if (!employee) return <div>Loading...</div>;
  return <div>{employee.firstName}</div>;
}

Employee.propTypes = {
  employeeId: PropTypes.string,
};
