import Grid from '@mui/material/Grid';
import { useGetEmployeesProfilesQuery } from '@/features/employeeSlice';
import { useFilter } from '@/hooks/useFilter';
import styles from './styles.module.css';
import MemberCard from './MemberCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TeamMember() {
  const { handleEmployeeChange } = useFilter();
  let content;
  const {
    data: employees,
    isLoading,
    isSuccess,
    isError,
  } = useGetEmployeesProfilesQuery();
  if (isLoading) {
    content = Array.from({ length: 3 }, (_, i) => (
      <Grid item xs={12} sm={6} md={4} sx={{ marginInline: 'auto' }} key={i}>
        <LoadingSpinner />
      </Grid>
    ));
  }
  if (isError) {
    content = <p>Error...</p>;
  }
  if (isSuccess) {
    content = (
      <>
        {employees.map((employee) => (
          <MemberCard
            key={employee.id}
            employee={employee}
            handleClick={handleEmployeeChange}
          />
        ))}
      </>
    );
  }
  return (
    <div className={styles.card_container}>
      <h3 className="text-center">Our Team</h3>
      <Grid container spacing={4}>
        {content}
      </Grid>
    </div>
  );
}
