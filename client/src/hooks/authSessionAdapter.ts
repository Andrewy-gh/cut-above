import { useQuery } from 'convex/react';

import { authClient } from '@/convex/authClient';
import { api } from '../../../convex/_generated/api';

export interface AuthSessionUser {
  email?: string | null;
  name?: string | null;
}

export interface AuthSessionData {
  user?: AuthSessionUser | null;
}

export interface CurrentUserRecord {
  id: string;
  email: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: number;
  updatedAt?: number;
}

type AuthClientResult = { error?: unknown } | undefined;

export interface AuthSessionAdapter {
  useSession: () => {
    data: AuthSessionData | null | undefined;
    isPending: boolean;
  };
  useCurrentUser: () => CurrentUserRecord | null | undefined;
  signInEmail: (args: { email: string; password: string }) => Promise<AuthClientResult>;
  signOut: () => Promise<AuthClientResult>;
  changeEmail: (args: { newEmail: string }) => Promise<AuthClientResult>;
  changePassword: (args: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<AuthClientResult>;
  deleteUser: (args: Record<string, never>) => Promise<AuthClientResult>;
  resetPassword: (args: {
    token: string;
    newPassword: string;
  }) => Promise<AuthClientResult>;
}

export const authSessionAdapter: AuthSessionAdapter = {
  useSession: () => authClient.useSession(),
  useCurrentUser: () => useQuery(api.auth.getCurrentUser, {}),
  signInEmail: (args) => authClient.signIn.email(args),
  signOut: () => authClient.signOut(),
  changeEmail: (args) => authClient.changeEmail(args),
  changePassword: (args) => authClient.changePassword(args),
  deleteUser: (args) => authClient.deleteUser(args),
  resetPassword: (args) => authClient.resetPassword(args),
};
