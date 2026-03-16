import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { createTestStore } from '@/test/test-utils';
import { useAuth } from './useAuth';

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(),
  navigate: vi.fn(),
  locationState: { state: { from: '/account' } },
}));

vi.mock('@/convex/authClient', () => ({
  authClient: {
    signIn: { email: mocks.signInEmail },
    signOut: mocks.signOut,
    useSession: mocks.useSession,
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    deleteUser: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useLocation: () => mocks.locationState,
  };
});

vi.mock('convex/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('convex/react')>();
  return {
    ...actual,
    useQuery: vi.fn(() => null),
  };
});

const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  function AuthTestWrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
  }

  return AuthTestWrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.locationState.state = { from: '/account' };
  mocks.useSession.mockReturnValue({ data: null, isPending: false });
  mocks.signInEmail.mockResolvedValue({});
  mocks.signOut.mockResolvedValue({});
});

describe('useAuth', () => {
  it('logs in with cleaned email', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handleLogin(' Test@Example.com ', 'pw');
    });

    expect(mocks.signInEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pw',
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('logs out and clears auth state', async () => {
    const store = createTestStore({
      auth: { user: 'test@example.com', role: 'client' },
    });
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mocks.signOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(store.getState().auth).toEqual({ user: null, role: null });
    });
  });
});
