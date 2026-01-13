import Grid from '@mui/material/Grid';

// @ts-expect-error TS(2307): Cannot find module '@/features/employeeSlice' or i... Remove this comment to see the full error message
import { useGetEmployeesProfilesQuery } from '@/features/employeeSlice';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useFilter' or its corr... Remove this comment to see the full error message
import { useFilter } from '@/hooks/useFilter';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';
import MemberCard from './MemberCard';

// @ts-expect-error TS(2307): Cannot find module '@/components/LoadingSpinner' o... Remove this comment to see the full error message
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
        {employees.map((employee: any) => <MemberCard
          key={employee.id}
          employee={employee}
          handleClick={handleEmployeeChange}
        />)}
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
