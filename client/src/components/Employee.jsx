import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';

export default function Employee({ employeeId }) {
  const { employee } = useEmployeesQuery(employeeId);
  if (!employee) return <div>Loading...</div>;
  return <div>{employee.firstName}</div>;
}
