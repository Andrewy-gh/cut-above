import { useSelector } from 'react-redux';
import {
  selectAllEmployees,
  selectEmployeeById,
  useGetEmployeesQuery,
} from '@/features/employeeSlice';

export function useEmployeesQuery(employeeId?: string) {
  useGetEmployeesQuery();
  const employees = useSelector(selectAllEmployees);
  const employee = useSelector((state: any) =>
    employeeId ? selectEmployeeById(state, employeeId) : null
  );

  return {
    employees,
    employee,
  };
}
