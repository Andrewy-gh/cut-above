import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from './authSlice';
import { useLogoutMutation } from './authApiSlice';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutUser());
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };
  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
