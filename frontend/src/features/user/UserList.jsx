import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Item from '../../components/Item';
import { selectAllUsers } from './userSlice';
import { useGetUsersQuery } from './userSlice';
import CircleProgress from '../../components/Loading/CircleProgress';
import { useSelector } from 'react-redux';

const UserList = () => {
  const { isLoading, isSuccess, isError, error } = useGetUsersQuery();
  const users = useSelector(selectAllUsers);

  let content;
  if (isLoading) {
    content = <CircleProgress />;
  } else if (isSuccess) {
    content = (
      <>
        {users.map((user) => (
          <Item key={user.id}>
            {user.email} {user.role}
          </Item>
        ))}
      </>
    );
  } else if (isError) {
    content = <Typography variant="body2">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" align="center">
        Users
      </Typography>
      {content}
    </Box>
  );
};

export default UserList;
