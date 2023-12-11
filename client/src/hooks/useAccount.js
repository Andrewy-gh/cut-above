import { useDispatch } from 'react-redux';
import { logoutUser, updateUserDetails } from '@/features/auth/authSlice';
import {
  useChangeUserEmailMutation,
  useChangeUserPasswordMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} from '@/features/userSlice';
import { useNotification } from './useNotification';

export function useAccount() {
  const dispatch = useDispatch();
  const [changeUserEmail] = useChangeUserEmailMutation();
  const [changeUserPassword] = useChangeUserPasswordMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [resetUserPassword] = useResetUserPasswordMutation();

  const { handleSuccess, handleError } = useNotification();

  const handleUserEmailChange = async (newEmailObj) => {
    try {
      const updatedUser = await changeUserEmail(newEmailObj).unwrap();
      if (updatedUser.success) {
        dispatch(updateUserDetails(updatedUser.user));
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
    handleUserEmailChange,
    handleUserPasswordChange,
    handleUserDelete,
    handleUserPasswordReset,
  };
}
