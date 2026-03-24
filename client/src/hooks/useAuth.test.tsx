import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAppSelector } from '@/app/hooks';
import Notification from '@/components/Notification';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { createTestStore } from '@/test/test-utils';
import { useAuth } from './useAuth';
import type { AuthSessionAdapter } from './authSessionAdapter';

const createAdapter = (
  overrides: Partial<AuthSessionAdapter> = {}
): AuthSessionAdapter => ({
  useSession: () => ({ data: null, isPending: false }),
  useCurrentUser: () => null,
  signInEmail: vi.fn().mockResolvedValue({}),
  signOut: vi.fn().mockResolvedValue({}),
  changeEmail: vi.fn().mockResolvedValue({}),
  changePassword: vi.fn().mockResolvedValue({}),
  deleteUser: vi.fn().mockResolvedValue({}),
  resetPassword: vi.fn().mockResolvedValue({}),
  ...overrides,
});

function AuthHarness({ adapter }: { adapter: AuthSessionAdapter }) {
  const { user, role, isAuthLoading, handleLogin, handleLogout } = useAuth(adapter);
  const storedUser = useAppSelector(selectCurrentUser);

  return (
    <>
      <p data-testid="resolved-user">{user ?? 'none'}</p>
      <p data-testid="resolved-role">{role ?? 'none'}</p>
      <p data-testid="loading">{String(isAuthLoading)}</p>
      <p data-testid="stored-user">{storedUser ?? 'none'}</p>
      <button type="button" onClick={() => void handleLogin(' Test@Example.com ', 'pw')}>
        Login
      </button>
      <button type="button" onClick={() => void handleLogout()}>
        Logout
      </button>
      <Notification />
    </>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAuth', () => {
  it('logs in with cleaned email', async () => {
    const store = createTestStore();
    const adapter = createAdapter();

    render(
      <Provider store={store}>
        <AuthHarness adapter={adapter} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(adapter.signInEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pw',
      });
    });
  });

  it('clears persisted auth when Better Auth reports no active session', async () => {
    const store = createTestStore({
      auth: { user: 'persisted@example.com', role: 'client' },
    });
    const adapter = createAdapter({
      useCurrentUser: () => null,
    });

    render(
      <Provider store={store}>
        <AuthHarness adapter={adapter} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('stored-user')).toHaveTextContent('none');
    });
  });

  it('shows a visible logout error when sign-out fails', async () => {
    const store = createTestStore({
      auth: { user: 'test@example.com', role: 'client' },
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const adapter = createAdapter({
      useSession: () => ({
        data: { user: { email: 'test@example.com', name: 'Test User' } },
        isPending: false,
      }),
      signOut: vi.fn().mockRejectedValue(new Error('network down')),
    });

    render(
      <Provider store={store}>
        <AuthHarness adapter={adapter} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(adapter.signOut).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/error: could not log out\. backend unreachable\./i)).toBeInTheDocument();
    });

    expect(screen.getByTestId('stored-user')).toHaveTextContent('test@example.com');
    consoleErrorSpy.mockRestore();
  });

  it('keeps loading until the current user record resolves for an active session', () => {
    const store = createTestStore();
    const adapter = createAdapter({
      useSession: () => ({
        data: { user: { email: 'admin@example.com', name: 'Admin User' } },
        isPending: false,
      }),
      useCurrentUser: () => undefined,
    });

    render(
      <Provider store={store}>
        <AuthHarness adapter={adapter} />
      </Provider>
    );

    expect(screen.getByTestId('resolved-user')).toHaveTextContent('admin@example.com');
    expect(screen.getByTestId('resolved-role')).toHaveTextContent('none');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });
});
