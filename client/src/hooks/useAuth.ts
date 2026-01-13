import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useLoginMutation,
  useLogoutMutation,
  useChangeUserEmailMutation,
  useChangeUserPasswordMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
// @ts-expect-error TS(2307): Cannot find module '@/features/auth/authApiSlice' ... Remove this comment to see the full error message
} from '@/features/auth/authApiSlice';
import {
  logoutUser,
  selectCurrentUser,
  selectCurrentUserRole,
  setCredentials,
  updateUserDetails,
// @ts-expect-error TS(2307): Cannot find module '@/features/auth/authSlice' or ... Remove this comment to see the full error message
} from '@/features/auth/authSlice';
import { useNotification } from './useNotification';

// @ts-expect-error TS(2307): Cannot find module '@/utils/email' or its correspo... Remove this comment to see the full error message
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

  const handleLogin = async (email: any, password: any) => {
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

      // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
      handleError('Error logging out: ', error);
    }
  };

  const handleUserEmailChange = async (newEmailObj: any) => {
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

  const handleUserPasswordChange = async (newPasswordObj: any) => {
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

  const handleUserPasswordReset = async (newCredentials: any) => {
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
