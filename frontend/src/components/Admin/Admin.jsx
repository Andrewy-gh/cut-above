import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router-dom';
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
        <Divider />
        <Link to="/add">
          <Typography variant="h5" component="div" align="center">
            Add new Schedule
          </Typography>
        </Link>
        <Divider />
        <Link to="/user-list">
          <Typography variant="h5" component="div" align="center">
            Users List
          </Typography>
        </Link>
        <Divider />
        <ScheduleTabs />
        {/* <Schedule /> */}
        {/* <UserList /> */}
      </Box>
    </Container>
  );
};

export default Admin;
