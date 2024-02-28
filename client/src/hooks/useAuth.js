import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useLoginMutation,
  useLogoutMutation,
  useChangeUserEmailMutation,
  useChangeUserPasswordMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} from '@/features/auth/authApiSlice';
import {
  logoutUser,
  selectCurrentUser,
  selectCurrentUserRole,
  setCredentials,
  updateUserDetails,
} from '@/features/auth/authSlice';
import { useNotification } from './useNotification';
import { cleanEmail } from '@/utils/email';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectCurrentUserRole);
  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const [changeUserEmail] = useChangeUserEmailMutation();
  const [changeUserPassword] = useChangeUserPasswordMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [resetUserPassword] = useResetUserPasswordMutation();

  const location = useLocation();

  const { handleSuccess, handleError } = useNotification();

  const handleLogin = async (email, password) => {
    try {
      const loggedInUser = await login({
        email: cleanEmail(email),
        password,
      }).unwrap();
      if (loggedInUser.success) {
        const { from } = location.state || {};
        dispatch(
          setCredentials({
            user: loggedInUser.user.email,
            role: loggedInUser.user.role,
          })
        );
        handleSuccess(loggedInUser.message);
        navigate(from || '/account');
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutUser());
    } catch (error) {
      handleError('Error logging out: ', error);
    }
  };

  const handleUserEmailChange = async (newEmailObj) => {
    try {
      const updatedUser = await changeUserEmail(newEmailObj).unwrap();
      if (updatedUser.success) {
        dispatch(
          updateUserDetails({
            user: updatedUser.user.email,
            role: updatedUser.user.role,
          })
        );
        handleSuccess(updatedUser.message);
        return true;
      }
    } catch (error) {
      handleError(`Error changing email: ${error}`);
    }
  };

  const handleUserPasswordChange = async (newPasswordObj) => {
    try {
      const updatedUser = await changeUserPassword(newPasswordObj).unwrap();
      if (updatedUser.success) {
        handleSuccess(updatedUser.message);
        return true;
      }
    } catch (error) {
      handleError(`Error changing password: ${error}`);
    }
  };

  const handleUserDelete = async () => {
    try {
      const deletedUser = await deleteUser().unwrap();
      if (deletedUser.success) {
        handleSuccess(deletedUser.message);
        dispatch(logoutUser());
      }
    } catch (error) {
      handleError(`Error deleting user: ${error}`);
    }
  };

  const handleUserPasswordReset = async (newCredentials) => {
    try {
      const updatedUser = await resetUserPassword(newCredentials).unwrap();
      if (updatedUser.success) {
        handleSuccess(updatedUser.message);
        return true;
      }
    } catch (err) {
      handleError(err);
    }
  };

  return {
    user,
    role,
    handleLogin,
    handleLogout,
    handleUserEmailChange,
    handleUserPasswordChange,
    handleUserDelete,
    handleUserPasswordReset,
  };
}
