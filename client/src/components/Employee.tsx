import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';

interface EmployeeProps {
  employeeId: string;
}

export default function Employee({ employeeId }: EmployeeProps) {
  const { employee } = useEmployeesQuery(employeeId);
  if (!employee) return <div>Loading...</div>;
  return <div>{employee.firstName}</div>;
}
