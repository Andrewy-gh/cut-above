import { useSelector } from 'react-redux';
import {
  selectAllEmployees,
  selectEmployeeById,
  useGetEmployeesQuery,
// @ts-expect-error TS(2307): Cannot find module '@/features/employeeSlice' or i... Remove this comment to see the full error message
} from '@/features/employeeSlice';

export function useEmployeesQuery(employeeId: any) {
  useGetEmployeesQuery();
  const employees = useSelector(selectAllEmployees);
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );

  return {
    employees,
    employee,
  };
}
