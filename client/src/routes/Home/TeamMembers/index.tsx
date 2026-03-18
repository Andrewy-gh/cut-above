import { useFilter } from '@/hooks/useFilter';
import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';
import styles from './styles.module.css';
import MemberCard from './MemberCard';
import { teamMembers } from '@/data/team-members';

export default function TeamMember() {
  const { handleEmployeeChange } = useFilter();
  const { employees } = useEmployeesQuery();
  const employeeIdByName = new Map(
    employees.map((employee) => [employee.firstName.toLowerCase(), employee.id])
  );

  const handleMemberClick = (employee: (typeof teamMembers)[number]) => {
    const resolvedId = employeeIdByName.get(employee.firstName.toLowerCase());
    handleEmployeeChange(resolvedId);
  };

  return (
    <div className={styles.card_container}>
      <h3 className="text-center">Our Team</h3>
      <div className={styles.cards_grid}>
        {teamMembers.map((employee) => (
          <MemberCard
            key={employee.id}
            employee={employee}
            handleClick={handleMemberClick}
          />
        ))}
      </div>
    </div>
  );
}
