import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  useLoginMutation,
  useLogoutMutation,
} from '@/features/auth/authApiSlice';
import {
  logoutUser,
  selectCurrentToken,
  selectCurrentUser,
  selectCurrentUserRole,
  setCredentials,
} from '@/features/auth/authSlice';
import { useNotification } from './useNotification';
import { cleanEmail } from '@/utils/email';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector(selectCurrentUser);
  const role = useSelector(selectCurrentUserRole);
  const token = useSelector(selectCurrentToken);
  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();

  const { handleSuccess, handleError } = useNotification();

  const handleLogin = async (email, password) => {
    try {
      const loggedInUser = await login({
        email: cleanEmail(email),
        password,
      }).unwrap();
      if (loggedInUser.success) {
        dispatch(
          setCredentials({
            user: loggedInUser.user,
            role: loggedInUser.role,
            token: loggedInUser.token,
          })
        );
        handleSuccess(loggedInUser.message);
        navigate('/account');
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutUser());
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return { email, role, token, handleLogin, handleLogout };
}
