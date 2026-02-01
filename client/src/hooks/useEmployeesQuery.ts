import { useAppSelector } from '@/app/hooks';
import {
  selectAllEmployees,
  selectEmployeeById,
  useGetEmployeesQuery,
} from '@/features/employeeSlice';
export function useEmployeesQuery(employeeId?: string) {
  useGetEmployeesQuery();
  const employees = useAppSelector(selectAllEmployees);
  const employee = useAppSelector((state) =>
    employeeId ? selectEmployeeById(state, employeeId) : null
  );

  return {
    employees,
    employee,
  };
}
