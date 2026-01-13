import { useSelector } from 'react-redux';
import {
  selectAllEmployees,
  selectEmployeeById,
  useGetEmployeesQuery,
} from '@/features/employeeSlice';

export function useEmployeesQuery(employeeId) {
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
