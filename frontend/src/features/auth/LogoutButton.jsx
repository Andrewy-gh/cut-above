import { useDispatch } from 'react-redux';
import { logoutUser } from './authSlice';
import { useLogoutMutation } from './authApiSlice';
import { Button } from '@mui/material';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutUser());
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };
  return (
    <Button variant="contained" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
