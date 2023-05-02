import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import UserList from '../../features/user/userList';
import Schedule from '../../features/schedule/Schedule';
import ScheduleTabs from '../../features/schedule/ScheduleTabs';

import { useGetUsersQuery } from '../../features/user/userSlice';

const Admin = () => {
  const { isLoading, isSuccess, isError, error } = useGetUsersQuery();

  return (
    <Container maxWidth="m">
      <Box>
        <Typography variant="h3" component="h1" align="center">
          Admin Page
        </Typography>
        <ScheduleTabs />
        {/* <Schedule /> */}
        {/* <UserList /> */}
      </Box>
    </Container>
  );
};

export default Admin;
