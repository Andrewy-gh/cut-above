
// @ts-expect-error TS(2307): Cannot find module '@/hooks/useEmployeesQuery' or ... Remove this comment to see the full error message
import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

export default function Employee({
  employeeId
}: any) {
  const { employee } = useEmployeesQuery(employeeId);
  if (!employee) return <div>Loading...</div>;
  return <div>{employee.firstName}</div>;
}

Employee.propTypes = {
  employeeId: PropTypes.string,
};
