import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import UserList from '../../features/user/userList';
import Schedule from '../../features/schedule/Schedule';

const Admin = () => {
  return (
    <Container>
      <Box>
        <UserList />
        <Schedule />
      </Box>
    </Container>
  );
};

export default Admin;
