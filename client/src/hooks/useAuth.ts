import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  logoutUser,
  selectCurrentUser,
  selectCurrentUserRole,
  setCredentials,
} from '@/features/auth/authSlice';
import { authClient } from '@/convex/authClient';
import { CONVEX_SITE_URL, CONVEX_URL } from '@/convex/env';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useNotification } from './useNotification';
import { cleanEmail } from '@/utils/email';

interface EmailChangePayload {
  email: string;
}

interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

interface PasswordResetPayload {
  token: string;
  password: string;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const storedUser = useAppSelector(selectCurrentUser);
  const storedRole = useAppSelector(selectCurrentUserRole);
  const session = authClient.useSession();
  const currentUser = useQuery(api.auth.getCurrentUser, {});

  const { handleSuccess, handleError } = useNotification();

  const sessionUser = session.data?.user ?? null;
  const user = sessionUser?.email ?? currentUser?.email ?? storedUser;
  const role = currentUser?.role ?? storedRole;
  const isAuthLoading = session.isPending || (sessionUser != null && currentUser === undefined);

  useEffect(() => {
    // If Better Auth reports "no session", clear any persisted Redux auth state.
    // Otherwise the UI can look logged-in even though auth routes will fail.
    if (!session.isPending && sessionUser == null && storedUser != null) {
      dispatch(logoutUser());
    }
  }, [dispatch, session.isPending, sessionUser, storedUser]);

  useEffect(() => {
    if (sessionUser?.email) {
      dispatch(
        setCredentials({
          user: sessionUser.email,
          role: role ?? null,
        })
      );
    }
  }, [dispatch, role, sessionUser?.email]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email: cleanEmail(email),
        password,
      });
      if (result?.error) {
        handleError(result.error);
        return;
      }
      handleSuccess('Successfully logged in');
    } catch (err) {
      handleError(err);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await authClient.signOut();
      if (result?.error) {
        handleError(result.error);
        return;
      }
      dispatch(logoutUser());
    } catch (error) {
      if (import.meta.env.DEV) {
        // Common dev failure: switching Convex local/cloud without restarting Vite,
        // or Convex not running at the configured URL.
        console.error('authClient.signOut failed', {
          CONVEX_SITE_URL,
          CONVEX_URL,
          error,
        });
      }
      handleError('Could not log out. Backend unreachable.', error);
    }
  };

  const handleUserEmailChange = async (newEmailObj: EmailChangePayload) => {
    try {
      const result = await authClient.changeEmail({
        newEmail: cleanEmail(newEmailObj.email),
      });
      if (result?.error) {
        handleError(result.error);
        return false;
      }
      handleSuccess('Email updated');
      return true;
    } catch (error) {
      handleError(`Error changing email: ${error}`);
    }
  };

  const handleUserPasswordChange = async (newPasswordObj: PasswordChangePayload) => {
    try {
      const result = await authClient.changePassword({
        currentPassword: newPasswordObj.currentPassword,
        newPassword: newPasswordObj.newPassword,
      });
      if (result?.error) {
        handleError(result.error);
        return false;
      }
      handleSuccess('Password updated');
      return true;
    } catch (error) {
      handleError(`Error changing password: ${error}`);
    }
  };

  const handleUserDelete = async () => {
    try {
      const result = await authClient.deleteUser({});
      if (result?.error) {
        handleError(result.error);
        return;
      }
      handleSuccess('Account deleted');
      dispatch(logoutUser());
    } catch (error) {
      handleError(`Error deleting user: ${error}`);
    }
  };

  const handleUserPasswordReset = async (newCredentials: PasswordResetPayload) => {
    try {
      const result = await authClient.resetPassword({
        token: newCredentials.token,
        newPassword: newCredentials.password,
      });
      if (result?.error) {
        handleError(result.error);
        return false;
      }
      handleSuccess('Password updated');
      return true;
    } catch (err) {
      handleError(err);
    }
  };

  return {
    user,
    role,
    isAuthLoading,
    handleLogin,
    handleLogout,
    handleUserEmailChange,
    handleUserPasswordChange,
    handleUserDelete,
    handleUserPasswordReset,
  };
}
