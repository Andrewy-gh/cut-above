import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Item from '../../components/Item';
import { selectAllUsers, useDeleteUserMutation } from './userSlice';
import { useGetUsersQuery } from './userSlice';
import { setError, setSuccess } from '../notification/notificationSlice';
import ButtonDialog from '../../components/ButtonDialog';
import CircleProgress from '../../components/Loading/CircleProgress';

const UserList = () => {
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, error } = useGetUsersQuery();
  const users = useSelector(selectAllUsers);
  const [deleteUser] = useDeleteUserMutation();

  const dialog = {
    button: 'Delete',
    title: 'Delete user?',
    content: 'content',
  };

  const handleAgree = async (id) => {
    try {
      const deletedUser = await deleteUser({ id }).unwrap();
      dispatch(setSuccess(deletedUser.message));
    } catch (error) {
      console.error(error);
      dispatch(setError(error.data.error));
    }
  };

  let content;
  if (isLoading) {
    content = <CircleProgress />;
  } else if (isSuccess) {
    content = (
      <>
        {users.map((user) => (
          <Item key={user.id}>
            <Typography variant="body2">
              {user.email} {user.role}
            </Typography>
            <ButtonDialog
              dialog={dialog}
              agreeHandler={() => handleAgree(user.id)}
              closeHandler={() => void 0}
            />
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
