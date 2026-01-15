import { useSelector } from 'react-redux';
import {
  selectAllEmployees,
  selectEmployeeById,
  useGetEmployeesQuery,
} from '@/features/employeeSlice';
import type { RootState } from '@/app/store';

export function useEmployeesQuery(employeeId?: string) {
  useGetEmployeesQuery();
  const employees = useSelector(selectAllEmployees);
  const employee = useSelector((state: RootState) =>
    employeeId ? selectEmployeeById(state, employeeId) : null
  );

  return {
    employees,
    employee,
  };
}
